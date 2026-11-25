/* =====================================================================
   animation.js — LE LECTEUR
   construireTemps(...) : découpe un scénario en « temps » (battements),
     regroupés en 6 étapes. Chaque temps sait se jouer animé OU
     instantanément (pour revenir en arrière ou sauter une étape).
   creerLecteur(...)    : lecture auto, pas à pas, pause, vitesse.
   ===================================================================== */
(function (racine) {
  'use strict';
  var LABO = racine.LABO = racine.LABO || {};

  var ETAPES = ['Situation', 'Le PC', 'L\'imprimante', 'La mesure', 'Le raisonnement', 'Le ticket'];
  var COURT = { pc: 'PC', imp: 'imprimante', esp: 'boîtier', srv: 'serveur', glpi: 'GLPI', tec: 'technicien', mqtt: 'Mosquitto' };

  function construireTemps(sc, sim, diag, ticket, opt) {
    var T = [], ev = sim.evenements.concat(LABO.TICKET.evenements(sc, sim.observations, diag, ticket));
    var r = sc.realite, p = sim.physique, masque = opt.masque, D = LABO.DECOR, obs = sim.observations;
    function temps(o) { o.i = T.length; T.push(o); return o; }
    function noeudsEtape(e) { diag.noeuds.forEach(function (n, j) { if (n.etape === e) temps({ etape: e, type: 'noeud', noeud: j, titre: n.titre, texte: n.deduit, focus: ['srv'],
      jouer: async function (S, ctx) { S.cerveau(true); S.service('py'); await S.attendre(500, ctx); S.cerveau(false); } }); }); }

    /* ---- étape 1 ---- */
    ev.filter(function (e) { return e.etape === 1; }).forEach(function (e) {
      if (masque && e.type === 'scene' && ['impression', 'erreur-pc', 'parasite'].indexOf(e.quoi) >= 0) {
        if (e.quoi === 'impression' || e.quoi === 'erreur-pc') temps({ etape: 1, type: 'scene', titre: 'Et maintenant ?', texte: 'Quelque chose se passe (ou non) du côté de l\'imprimante. Le programme, lui, ne voit que ses témoins.', focus: ['imp'], jouer: async function (S, ctx) { S.bulle('imp', ['Réalité masquée', 'À toi de deviner…'], 'inconnu'); } });
        return;
      }
      var t = { etape: 1, type: e.type, ev: e, titre: e.titre, texte: e.texte || e.resume, journal: e.type === 'flux' };
      if (e.quoi === 'intro') {
        t.titre = masque ? 'Scénario mystère' : sc.titre;
        t.texte = masque ? D.personnage + ', ' + D.role + ' en cardiologie, doit imprimer un courrier. La panne réelle est cachée : observe le diagnostic.' : sc.metier;
        t.focus = ['pc', 'imp'];
        t.jouer = async function (S, ctx) { S.bulle('nadia', [D.personnage + ' · ' + D.role, r.pages > 0 ? 'doit imprimer ' + r.pages + ' pages' : 'au travail'], ''); };
      } else if (e.quoi === 'clic') {
        t.focus = ['pc'];
        t.jouer = async function (S, ctx) { S.ecranPC(['Impression…', r.pages + ' pages · IMP-CARDIO']); S.bulle('nadia', ['Clic sur « Imprimer »'], ''); await S.attendre(500, ctx); };
      } else if (e.quoi === 'erreur-pc') {
        t.focus = ['pc'];
        t.jouer = async function (S, ctx) { S.ecranPC([e.ecran, 'Impossible d\'imprimer'], true); S.bulle('pc', [e.titre], 'alerte'); await S.attendre(400, ctx); };
      } else if (e.quoi === 'impression') {
        t.focus = ['imp'];
        t.jouer = async function (S, ctx) {
          if (p.erreur === 'papier') { await S.tentative(ctx); S.bulle('imp', ['Plus de papier'], 'alerte'); if (p.tReprise != null) { await S.attendre(600, ctx); S.bulle('nadia', ['Nadia remet du papier'], ''); S.etat(Object.assign({}, r, { papier: true }), false); await S.imprimer(p.sorties, false, ctx); S.bulle('imp', ['5 pages sorties'], 'ok'); } }
          else if (p.erreur === 'bourrage') { await S.imprimer(p.sorties, true, ctx); S.lcd('Bourrage', 'var(--jaune)'); S.bulle('imp', ['Feuille coincée'], 'alerte'); }
          else if (p.erreur === 'toner') { S.bulle('imp', ['Toner vide : refus'], 'alerte'); }
          else if (r.figee) { S.bulle('imp', ['« Prête »… mais rien ne bouge'], 'inconnu'); }
          else { await S.imprimer(p.sorties, false, ctx); S.bulle('imp', [p.sorties + ' pages sorties'], 'ok'); }
        };
      } else if (e.quoi === 'telephone') {
        t.focus = ['pc', 'tec'];
        t.jouer = async function (S, ctx) { S.telephone(true); S.bulle('nadia', ['« L\'imprimante ne marche pas ! »'], ''); S.bulle('tec', ['Wassim saisit le ticket'], ''); await S.attendre(800, ctx); };
      } else if (e.quoi === 'parasite') {
        t.focus = ['imp'];
        t.jouer = async function (S, ctx) { await S.choc(ctx); S.bulle('imp', ['Toc ! Toc ! Toc !', 'un chariot cogne le meuble'], 'inconnu'); };
      } else if (e.quoi === 'calme' || e.quoi === 'pas-signal') {
        t.focus = ['srv'];
        t.jouer = async function (S, ctx) { S.bulle('srv', [e.titre], ''); };
      } else if (e.type === 'flux') {
        t.focus = [e.de, e.vers];
        t.jouer = jouerFlux(e);
      }
      temps(t);
    });
    noeudsEtape(1);

    /* ---- étapes 2 et 3 ---- */
    [2, 3].forEach(function (k) {
      ev.filter(function (e) { return e.etape === k; }).forEach(function (e) {
        if (e.type === 'flux') temps({ etape: k, type: 'flux', ev: e, titre: e.titre, texte: e.resume, journal: true, focus: [e.de, e.vers], temoin: k, jouer: jouerFlux(e) });
        else temps({ etape: k, type: 'scene', titre: e.titre, texte: e.texte, focus: ['imp'], temoin: k, jouer: async function (S) { S.bulle('imp', ['SNMP : non applicable', 'pas d\'adresse IP (USB)'], 'inconnu'); } });
      });
      noeudsEtape(k);
    });

    /* ---- étape 4 : la mesure ---- */
    var V = obs.vibration;
    temps({ etape: 4, type: 'courbe', titre: V.boitier === 'en_ligne' ? 'Le capteur sent les moteurs' : 'Le capteur est muet', focus: ['esp'], temoin: 4,
      texte: V.boitier === 'en_ligne' ? 'L\'accéléromètre MPU6050 mesure les vibrations. L\'ESP32 calcule un résumé (RMS) chaque seconde. Courbe simulée.' : 'Le boîtier est hors ligne : la courbe est « inconnue », pas plate.',
      jouer: async function (S, ctx) { S.vibrer(false); if (V.boitier === 'en_ligne') { S.bulle('esp', ['MPU6050 → ESP32', 'RMS sur 1 s, seuil ' + V.seuil + ' mg'], ''); } else S.bulle('esp', ['Hors ligne', 'vibration : inconnue'], 'inconnu'); await S.attendre(600, ctx); } });
    ev.filter(function (e) { return e.etape === 4; }).forEach(function (e) { temps({ etape: 4, type: 'flux', ev: e, titre: e.titre, texte: e.resume, journal: true, focus: [e.de === 'mqtt' ? 'srv' : e.de, 'srv'], jouer: jouerFlux(e) }); });
    noeudsEtape(4);

    /* ---- étape 5 : raisonnement ---- */
    temps({ etape: 5, type: 'bilan', titre: 'Le moteur croise les témoins', texte: 'Il garde les causes compatibles avec TOUTES les observations. Les autres sont écartées ou restent invérifiables.', focus: ['srv'],
      jouer: async function (S, ctx) { S.cerveau(true); S.service('py'); await S.attendre(900, ctx); S.cerveau(false); } });
    noeudsEtape(5);

    /* ---- étape 6 : ticket ---- */
    ev.filter(function (e) { return e.etape === 6; }).forEach(function (e) {
      if (e.type === 'flux') temps({ etape: 6, type: 'flux', ev: e, titre: e.titre, texte: e.resume, journal: true, focus: [e.de, e.vers === 'glpi' ? 'srv' : e.vers], jouer: jouerFlux(e) });
      else temps({ etape: 6, type: 'scene', titre: e.titre, texte: e.texte, focus: ['srv'], jouer: async function (S) { S.bulle('srv', ['SQLite : événement noté', 'pas de ticket'], 'ok'); } });
    });
    temps({ etape: 6, type: 'ticket', titre: ticket.cree ? 'Le ticket enrichi' : 'Pas de ticket', texte: ticket.deplacement.titre + ' : ' + ticket.deplacement.texte, focus: ['tec'],
      jouer: async function (S, ctx) {
        if (ticket.cree) S.glpi(['Ticket ' + ticket.numero, diag.conclusion.titre.slice(0, 40) + (diag.conclusion.titre.length > 40 ? '…' : ''), 'Confiance : ' + diag.conclusion.confiance, '→ ' + ticket.deplacement.titre], diag.conclusion.deplacement.code === 'deplacement');
        S.telephone(false);
        if (obs.vibration.boitier === 'en_ligne') S.eink(LABO.TICKET.ECRAN[diag.conclusion.code].toUpperCase().slice(0, 22), 'màj 9 h 11');
      } });
    return T;

    function jouerFlux(e) {
      return async function (S, ctx) {
        S.service(null);
        var r1 = S.route(e.de, e.vers, e.proto);
        var echec = e.statut === 'timeout' || e.statut === 'echec';
        await S.jeton(r1, e.proto, { label: e.proto + (e.port && !/câble|ping/.test(e.port) ? ' · ' + e.port.replace('TCP ', '').replace('UDP ', '') : ''), echec: echec && e.de !== 'mqtt', stop: e.statut === 'timeout' ? 0.82 : 1 }, ctx);
        var cible = e.vers === 'glpi' || e.vers === 'srv' ? 'srv' : e.vers;
        if (e.statut === 'refuse') { S.bulle('pc', ['JEA : commande refusée', 'tracée dans le journal'], 'alerte'); return; }
        if (e.reponse && !echec) {
          await S.attendre(200, ctx);
          await S.jeton(S.route(e.vers, e.de, e.proto), e.proto, { label: 'réponse' }, ctx);
          cible = e.de === 'srv' ? 'srv' : e.de;
        }
        if (e.vers === 'glpi' || /IPP/.test(e.proto) && e.vers === 'srv') S.service(e.vers === 'glpi' ? 'glpi' : 'cups');
        else if (/MQTT/.test(e.proto) && e.vers === 'srv') S.service('mqtt');
        else if (e.de === 'srv' || e.vers === 'srv') S.service('py');
        var titre = e.titre;
        S.bulle(cible === 'imp' && e.vers === 'esp' ? 'esp' : cible, bulleTexte(e), echec ? 'inconnu' : (e.statut === 'ok' ? 'obs' : 'alerte'));
        if (e.vers === 'esp' && e.message) S.eink('…', '');
        if (e.repete && !ctx.instant) { for (var i = 1; i < e.repete; i++) { await S.attendre(250, ctx); await S.jeton(r1, e.proto, { label: 'MQTT/TLS' }, ctx); } }
      };
    }
    function bulleTexte(e) {
      if (e.statut === 'timeout') return [e.titre, 'pas de réponse → inconnu'];
      if (e.statut === 'echec') return [e.titre, e.resume];
      var l = [e.titre];
      if (e.reponse && e.reponse.langage === 'json') {
        try {
          var j = JSON.parse(e.reponse.texte), cles = Object.keys(j).filter(function (k) { return ['ObservedAtUtc', 'Printer', 'sysDescr', 'id', 'Error'].indexOf(k) < 0; }).slice(0, 4);
          cles.forEach(function (k) { l.push(k + ' = ' + (j[k] === null ? 'inconnu' : j[k])); });
        } catch (x) { l.push(e.resume); }
      } else l.push(e.resume);
      return l;
    }
  }

  function creerLecteur(opts) {
    var L = { temps: [], k: -1, lecture: false, vitesse: 1, jeton: null, occupe: false };
    var S = opts.scene, surMaj = opts.surMaj;
    async function jouer(i, instant) {
      var t = L.temps[i]; if (!t) return;
      var ctx = { instant: instant, vitesse: L.vitesse, annule: false };
      if (!instant) { if (L.jeton) L.jeton.annule = true; L.jeton = ctx; }
      if (t.focus && !instant) S.focus(t.focus);
      if (L.temps[i - 1] && L.temps[i - 1].etape !== t.etape) S.effacerBulles();
      if (t.jouer) await t.jouer(S, ctx);
      return ctx;
    }
    async function aller(i, anime) {
      i = Math.max(-1, Math.min(L.temps.length - 1, i));
      if (L.jeton) L.jeton.annule = true;
      var avance = i === L.k + 1 && anime;
      if (!avance) {
        opts.reinit();
        for (var j = 0; j < i; j++) await jouer(j, true);
      }
      L.k = i; surMaj(L);
      if (i < 0) return;
      var t = L.temps[i]; S.focus(t.focus || []);
      L.occupe = true; surMaj(L);
      var ctx = await jouer(i, !anime || opts.reduit());
      L.occupe = false;
      if (ctx && ctx.annule) return;
      surMaj(L);
      if (L.lecture) programmer();
    }
    var minuterie = null;
    function programmer() {
      clearTimeout(minuterie);
      var t = L.temps[L.k], lu = t ? 1300 + 28 * ((t.titre || '').length + (t.texte || '').length) : 800;
      minuterie = setTimeout(function () {
        if (!L.lecture) return;
        if (L.k >= L.temps.length - 1) { L.lecture = false; surMaj(L); return; }
        aller(L.k + 1, true);
      }, Math.min(6500, lu) / L.vitesse);
    }
    L.charger = function (temps) { clearTimeout(minuterie); if (L.jeton) L.jeton.annule = true; L.temps = temps; L.k = -1; L.lecture = false; opts.reinit(); surMaj(L); };
    L.suivant = function () { clearTimeout(minuterie); if (L.k < L.temps.length - 1) aller(L.k + 1, true); };
    L.precedent = function () { clearTimeout(minuterie); L.lecture = false; aller(L.k - 1, false); };
    L.allerA = function (i) { clearTimeout(minuterie); L.lecture = false; aller(i, true); };
    L.etape = function (e) { var i = L.temps.findIndex(function (t) { return t.etape === e; }); if (i >= 0) L.allerA(i); };
    L.lire = function () { L.lecture = true; surMaj(L); if (!L.occupe) { if (L.k >= L.temps.length - 1) aller(0, true); else aller(L.k + 1, true); } };
    L.pause = function () { L.lecture = false; clearTimeout(minuterie); surMaj(L); };
    L.reinit = function () { L.pause(); aller(-1, false); };
    L.setVitesse = function (v) { L.vitesse = v; };
    return L;
  }

  LABO.ANIM = { ETAPES: ETAPES, COURT: COURT, construireTemps: construireTemps, creerLecteur: creerLecteur };
})(window);
