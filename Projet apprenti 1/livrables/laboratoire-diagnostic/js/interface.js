/* =====================================================================
   interface.js — L'INTERFACE
   Relie scénarios, simulation, règles, ticket, scène et lecteur.
   Les panneaux sont recalculés à partir du temps courant : revenir en
   arrière les remet exactement dans l'état de ce temps.
   ===================================================================== */
(function () {
  'use strict';
  var L = window.LABO, $ = function (id) { return document.getElementById(id); };
  var params = new URLSearchParams(location.search);
  if (params.has('cadre')) document.body.classList.add('cadre');
  var REDUIT = matchMedia('(prefers-reduced-motion: reduce)');

  var etat = { id: params.get('s') || 'figee', masque: false, reel: true, onglet: 'raisonnement', evChoisi: null, noeudOuvert: null, revele: false, ticketFerme: false };
  var cur = null; // { sc, sim, obs, diag, ticket, temps }
  /* mode projection : la courbe devient un onglet « Mesure » */
  var CADRE = document.body.classList.contains('cadre');
  if (CADRE) {
    var bM = document.createElement('button'); bM.type = 'button'; bM.className = 'btn petit'; bM.setAttribute('role', 'tab');
    bM.dataset.onglet = 'mesure'; bM.setAttribute('aria-selected', 'false'); bM.textContent = 'Mesure';
    document.querySelector('[data-onglet="temoins"]').after(bM);
    var pM = document.createElement('div'); pM.className = 'contenu-onglet'; pM.id = 'o-mesure'; pM.setAttribute('role', 'tabpanel'); pM.hidden = true;
    $('o-temoins').after(pM); pM.appendChild(document.querySelector('.courbe-carte'));
  }
  var dernierAuto = null;
  if (CADRE) document.querySelector('.panneau').prepend(document.querySelector('.outils'));
  var svg = $('scene'), S = L.creerScene(svg, { serre: CADRE });
  var lecteur = L.ANIM.creerLecteur({
    scene: S, reduit: function () { return REDUIT.matches; },
    reinit: function () { S.etat(cur.sc.realite, etat.masque && !etat.revele); S.effacerBulles(); S.focus([]); S.telephone(false); S.vibrer(false); S.service(null); },
    surMaj: maj
  });

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function heure(t) { var s = 600 + Math.max(0, t || 0), mm = Math.floor(s / 60), ss = s % 60; return '9 h ' + (mm < 10 ? '0' : '') + mm + ':' + (ss < 10 ? '0' : '') + ss; }

  /* ---------- sélecteurs de scénarios ---------- */
  function remplir(sel, choisi) {
    sel.innerHTML = ''; var groupes = {};
    L.SCENARIOS.forEach(function (s, i) {
      if (!groupes[s.groupe]) { groupes[s.groupe] = document.createElement('optgroup'); groupes[s.groupe].label = s.groupe; sel.appendChild(groupes[s.groupe]); }
      var o = document.createElement('option'); o.value = s.id; o.textContent = (i + 1) + '. ' + s.titre; if (s.id === choisi) o.selected = true;
      groupes[s.groupe].appendChild(o);
    });
  }
  remplir($('choixScenario'), etat.id);

  /* ---------- chargement d'un scénario ---------- */
  function charger(id) {
    var sc = L.scenario(id) || L.SCENARIOS[0];
    etat.id = sc.id; $('choixScenario').value = sc.id; etat.evChoisi = null; etat.noeudOuvert = null; etat.revele = false; etat.ticketFerme = false;
    var sim = L.SIM.observer(sc);
    var obs = JSON.parse(JSON.stringify(sim.observations));     // le moteur ne reçoit qu'une copie des observations
    var diag = L.REGLES.diagnostiquer(obs);
    var ticket = L.TICKET.construire(sc, obs, diag);
    cur = { sc: sc, sim: sim, obs: obs, diag: diag, ticket: ticket };
    cur.temps = L.ANIM.construireTemps(sc, sim, diag, ticket, { masque: etat.masque });
    cur.revel = reperes(cur.temps);
    svg.classList.toggle('sans-reel', !etat.reel || (etat.masque && !etat.revele));
    lecteur.charger(cur.temps);
    dessinerCourbe(false);
  }
  function reperes(T) {
    var r = { pc: Infinity, imp: Infinity, reseau: Infinity, vib: Infinity, travail: Infinity, signal: Infinity, ticket: Infinity };
    T.forEach(function (t, i) {
      var e = t.ev;
      if (e && /WinRM/.test(e.proto) && e.statut !== 'refuse') r.pc = Math.min(r.pc, i);
      if ((e && e.proto === 'SNMP') || t.temoin === 3 && t.type === 'scene') r.imp = Math.min(r.imp, i);
      if (e && e.proto === 'ICMP') r.reseau = Math.min(r.reseau, i);
      if (t.type === 'courbe') r.vib = Math.min(r.vib, i);
      if (e && e.etape === 1 && (e.proto === 'IPP / 9100' || e.proto === 'USB' || e.proto === 'IPP')) r.travail = i;
      if (e && e.etape === 1 && e.vers === 'srv' && /MQTT|HTTPS/.test(e.proto) || (e && e.quoi === 'telephone')) r.signal = Math.min(r.signal, i);
      if (t.type === 'ticket') r.ticket = i;
    });
    if (r.reseau === Infinity) r.reseau = r.imp;
    return r;
  }

  /* ---------- mise à jour générale ---------- */
  function maj(Lc) {
    var k = Lc.k, T = cur.temps, t = T[k];
    // narration
    $('nEtape').textContent = t ? 'Étape ' + t.etape + ' · ' + L.ANIM.ETAPES[t.etape - 1] : (etat.masque ? 'Scénario mystère' : cur.sc.titre);
    $('nTitre').innerHTML = t ? '<b>' + esc(t.titre) + '</b>' : 'Appuie sur <b>Lecture</b> ou <b>Suivant</b> pour dérouler le scénario.';
    $('nTexte').textContent = t ? (t.texte || '') : (etat.masque ? 'La panne est cachée. Observe ce que le programme voit, puis devine.' : cur.sc.metier);
    // frise
    var f = $('frise'); f.innerHTML = '';
    L.ANIM.ETAPES.forEach(function (nom, e) {
      var li = document.createElement('li'), b = document.createElement('button'), n = e + 1;
      var dansEtape = T.filter(function (x) { return x.etape === n; });
      b.type = 'button'; b.innerHTML = '<span class="num">' + n + '</span><span class="txt">' + esc(nom) + '</span><span class="graduations">' + dansEtape.map(function (x) { return '<i class="' + (x.i <= k ? 'vu' : '') + '"></i>'; }).join('') + '</span>';
      if (t && t.etape === n) b.setAttribute('aria-current', 'step'); else if (t && n < t.etape) b.className = 'fait';
      b.title = 'Aller à l\'étape ' + n + ' : ' + nom;
      b.addEventListener('click', function () { lecteur.etape(n); });
      li.appendChild(b); f.appendChild(li);
    });
    $('compteur').textContent = (k + 1) + ' / ' + T.length;
    $('bLecture').textContent = Lc.lecture ? '❚❚ Pause' : '▶ Lecture';
    $('bLecture').setAttribute('aria-pressed', String(Lc.lecture));
    $('bPrec').disabled = k < 0; $('bSuiv').disabled = k >= T.length - 1;
    // courbe
    dessinerCourbe(k >= cur.revel.vib, t && t.type === 'courbe' && !Lc.occupe ? false : t && t.type === 'courbe');
    // projection : le panneau suit l'étape (une seule fois par temps, ensuite l'utilisateur choisit)
    if (CADRE && t && dernierAuto !== cur.sc.id + ':' + k) {
      dernierAuto = cur.sc.id + ':' + k;
      if (t.type === 'courbe') ouvrirOnglet('mesure');
      else if (t.type === 'noeud' || t.type === 'bilan') ouvrirOnglet('raisonnement');
      else if (t.journal && t.etape < 6) { etat.evChoisi = null; ouvrirOnglet('journal'); }
    }
    // panneaux
    panRaisonnement(k); panTemoins(k); panJournal(k); panMessage(); panTicket(k);
    // ticket par-dessus la scène
    var couche = $('ticketCouche');
    if (t && t.type === 'ticket' && !etat.ticketFerme) { couche.hidden = false; couche.innerHTML = ticketHTML(true); brancherTicket(couche); }
    else couche.hidden = true;
  }

  /* ---------- panneau : raisonnement ---------- */
  var ETATS = { possible: 'possible', soutenue: 'indice', retenue: 'retenue', ecartee: 'écartée', nv: 'non vérifiable' };
  function panRaisonnement(k) {
    var nds = [];
    cur.temps.forEach(function (t) { if (t.type === 'noeud' && t.i <= k) nds.push(t.noeud); });
    var dernier = nds.length ? cur.diag.noeuds[nds[nds.length - 1]] : null;
    var vu = etat.noeudOuvert != null && nds.indexOf(etat.noeudOuvert) >= 0 ? cur.diag.noeuds[etat.noeudOuvert] : dernier;
    var hyp = vu ? vu.hyp : null, h = '';
    h += '<div class="hyp-tete"><h3 style="margin:0;font-size:1rem">Causes possibles</h3><span class="label" style="margin:0">' + (vu && vu !== dernier ? 'état au nœud choisi' : 'état actuel') + '</span></div>';
    h += '<div class="hyp-liste">' + cur.diag.hypotheses.map(function (x) { var s = hyp ? hyp[x[0]] : 'possible'; return '<span class="hyp ' + s + '" title="' + ETATS[s] + '">' + esc(x[1]) + '</span>'; }).join('') + '</div>';
    h += '<div class="hyp-legende">' + Object.keys(ETATS).map(function (s) { return '<span><span class="hyp ' + s + '">' + ETATS[s] + '</span></span>'; }).join('') + '</div>';
    if (!nds.length) { h += '<p class="vide">L\'arbre se construit à chaque nouvelle information. Lance la lecture.</p>'; $('o-raisonnement').innerHTML = h; return; }
    h += '<ol class="arbre">';
    nds.forEach(function (j, idx) {
      var n = cur.diag.noeuds[j], courant = idx === nds.length - 1, ouvert = courant || etat.noeudOuvert === j;
      h += '<li class="noeud' + (courant ? ' courant' : '') + (n.final ? ' final' : '') + '"><button type="button" data-noeud="' + j + '" aria-expanded="' + ouvert + '">';
      h += '<span class="n-tete">' + (n.regle ? '<span class="regle" title="' + esc(cur.diag.regles[n.regle]) + '">' + n.regle + '</span>' : '') + '<span class="n-titre">' + esc(n.titre) + '</span></span>';
      if (!ouvert) h += '<span class="n-resume">' + esc(n.deduit) + '</span>';
      else {
        h += '<dl><dt>Cherché</dt><dd>' + esc(n.cherche) + '</dd><dt>Source</dt><dd>' + esc(n.source) + '</dd><dt>Reçu</dt><dd>' + n.recu.map(function (x) { return '<code>' + esc(x) + '</code>'; }).join('') + '</dd>';
        h += '<dt>Déduit</dt><dd><b>' + esc(n.deduit) + '</b></dd><dt>Ensuite</dt><dd>' + esc(n.prochaine) + '</dd></dl>';
        h += '<span class="branches"><span class="fourche">⑂</span>' + n.branches.map(function (b) { return '<span class="b' + (b.pris ? ' pris' : '') + '">' + esc(b.t) + '</span>'; }).join('') + '</span>';
      }
      h += '</button></li>';
    });
    h += '</ol>';
    var box = $('o-raisonnement'); box.innerHTML = h;
    box.querySelectorAll('[data-noeud]').forEach(function (b) { b.addEventListener('click', function () { var j = +b.dataset.noeud; etat.noeudOuvert = etat.noeudOuvert === j ? null : j; panRaisonnement(lecteur.k); }); });
    var c = box.querySelector('.courant'); if (c && etat.onglet === 'raisonnement' && etat.noeudOuvert == null) c.scrollIntoView({ block: 'nearest' });
  }

  /* ---------- panneau : témoins ---------- */
  var dejaVus = {};
  function panTemoins(k) {
    var o = cur.obs, R = cur.revel, tm = cur.ticket.temoins;
    var lignes = [
      ['Signalement', o.signalement ? o.signalement.canalNom : '—', o.signalement ? o.signalement.texte : 'aucun', o.signalement ? 'alerte' : 'ok', o.signalement ? R.signal : (cur.temps.findIndex(function (t) { return t.etape > 1; }))],
      ['Pages envoyées', o.travail ? 'CUPS (IPP 631)' : (o.contexte.raccordement === 'usb' ? 'USB : non suivi' : 'CUPS'), o.travail ? o.travail.pages + ' pages, « ' + o.travail.etat + ' »' : (o.contexte.raccordement === 'usb' ? 'non applicable' : 'aucun travail reçu'), o.travail ? (o.travail.etat === 'terminé' ? 'ok' : 'alerte') : 'na', R.travail === Infinity ? 0 : R.travail],
      ['Réseau', 'ICMP · TCP 631/9100', !o.reseau.applicable ? 'non applicable (USB)' : (o.reseau.ping.ok ? 'joignable' : 'aucune réponse'), !o.reseau.applicable ? 'na' : (o.reseau.ping.ok ? 'ok' : 'alerte'), R.reseau],
      [tm[0].n, 'MPU6050 → MQTT/TLS', tm[0].v, tm[0].s, R.vib],
      [tm[1].n, 'SNMP UDP 161', tm[1].v, tm[1].s, R.imp],
      [tm[2].n, 'SNMP UDP 161', tm[2].v, tm[2].s, R.imp],
      [tm[3].n, 'WinRM/HTTPS 5986 + JEA', tm[3].v, tm[3].s, R.pc]
    ];
    var NOM_S = { ok: 'normal', vu: 'vu', rien: 'rien', alerte: 'anomalie', inconnu: 'inconnu', na: 'non applicable' };
    var h = '<p style="margin:0 0 8px;font-size:.88rem">Les <b>quatre témoins</b> (①–④) et leur contexte. « Inconnu » et « non applicable » ne valent jamais 0.</p>';
    h += '<table class="temoins"><thead><tr><th>Témoin</th><th>Source</th><th>Observé</th><th>Statut</th></tr></thead><tbody>';
    lignes.forEach(function (l) {
      var connu = k >= l[4], cle = cur.sc.id + l[0], neuf = connu && !dejaVus[cle];
      if (connu) dejaVus[cle] = true;
      h += connu ? '<tr class="' + (neuf ? 'neuf' : '') + '"><td><b>' + esc(l[0]) + '</b></td><td>' + esc(l[1]) + '</td><td>' + esc(l[2]) + '</td><td><span class="tag statut ' + l[3] + '">' + NOM_S[l[3]] + '</span></td></tr>'
        : '<tr class="attente"><td><b>' + esc(l[0]) + '</b></td><td>' + esc(l[1]) + '</td><td>en attente…</td><td></td></tr>';
    });
    $('o-temoins').innerHTML = h + '</tbody></table>';
  }

  /* ---------- panneau : journal réseau ---------- */
  function panJournal(k) {
    var evs = cur.temps.filter(function (t) { return t.journal && t.i <= k; });
    if (!evs.length) { $('o-journal').innerHTML = '<p class="vide">Aucun message échangé pour l\'instant.</p>'; return; }
    var NOM = L.ANIM.COURT, h = '<ol class="journal">';
    evs.slice().reverse().forEach(function (t) {
      var e = t.ev, ko = e.statut !== 'ok';
      h += '<li><button type="button" data-ev="' + t.i + '" aria-current="' + (etat.evChoisi === t.i) + '"><span class="h">' + heure(e.t) + '</span><span><span class="p">' + esc(e.proto) + '</span> · ' + esc(NOM[e.de] || e.de) + ' → ' + esc(NOM[e.vers] || e.vers) + ' <span class="h">' + esc(e.port || '') + '</span>' + (ko ? ' <span class="ko">' + (e.statut === 'refuse' ? 'refusé' : 'sans réponse') + '</span>' : '') + '</span><span class="r">' + esc(e.resume) + '</span></button></li>';
    });
    $('o-journal').innerHTML = h + '</ol><p style="font-size:.8rem;color:var(--encre-2);margin-top:8px">Clique sur un message pour voir son contenu (onglet Message).</p>';
    $('o-journal').querySelectorAll('[data-ev]').forEach(function (b) { b.addEventListener('click', function () { etat.evChoisi = +b.dataset.ev; ouvrirOnglet('message'); panJournal(lecteur.k); panMessage(); }); });
  }
  function panMessage() {
    var t = etat.evChoisi != null ? cur.temps[etat.evChoisi] : null;
    if (!t) { var der = cur.temps.filter(function (x) { return x.journal && x.i <= lecteur.k; }).pop(); t = der; }
    if (!t) { $('o-message').innerHTML = '<p class="vide">Choisis un message dans le journal réseau.</p>'; return; }
    var e = t.ev, h = '<div class="message"><h3 style="margin:0;font-size:1rem">' + esc(e.titre) + '</h3>';
    h += '<div class="tags"><span class="tag jaune">' + esc(e.proto) + '</span><span class="tag papier">' + esc(e.port || '') + '</span><span class="tag ' + (e.statut === 'ok' ? 'succes' : 'danger') + '">' + (e.statut === 'ok' ? 'réussi' : e.statut === 'refuse' ? 'refusé' : 'sans réponse') + '</span></div>';
    if (e.message) h += '<span class="label">Envoyé (' + esc(e.message.langage) + ')</span><pre class="terminal">' + esc(e.message.texte) + '</pre>';
    if (e.reponse) h += '<span class="label">Reçu</span><pre class="terminal">' + esc(e.reponse.texte) + '</pre>';
    h += '<p style="font-size:.8rem;color:var(--encre-2)">Formats d\'exemple, valeurs simulées. Aucun secret : les jetons et mots de passe restent locaux.' + (/WinRM/.test(e.proto) ? ' Champs <code>SpoolerRunning</code>, <code>PrinterStatus</code>, <code>JobsInError</code> : contrat JEA proposé, à ajouter au guide § 12.6.' : '') + '</p></div>';
    $('o-message').innerHTML = h;
  }

  /* ---------- ticket ---------- */
  function panTicket(k) {
    $('o-ticket').innerHTML = k >= cur.revel.ticket ? ticketHTML(false) : '<p class="vide">Le ticket apparaît à l\'étape 6.</p>';
    brancherTicket($('o-ticket'));
  }
  function ticketHTML(couche) {
    var t = cur.ticket, c = cur.diag.conclusion, h = '<div class="ticket">';
    h += '<div class="ticket-tete"><span>GLPI · ' + (t.cree ? 'Ticket <b>' + esc(t.numero) + '</b> · priorité ' + esc(t.priorite) : '<b>Aucun ticket</b>') + '</span>' + (couche ? '<button class="btn petit" type="button" data-fermer>Fermer</button>' : '') + '</div><div class="ticket-corps">';
    h += '<div><h4>Titre</h4><b>' + esc(t.cree ? t.titre : 'Événement noté localement, pas de ticket') + '</b></div>';
    h += '<div><h4>Signalement initial</h4>' + esc(t.signalement) + '</div>';
    h += '<div><h4>Les quatre témoins</h4><table><tbody>' + t.temoins.map(function (x) { return '<tr><td><b>' + esc(x.n) + '</b></td><td>' + esc(x.v) + '</td></tr>'; }).join('') + '</tbody></table></div>';
    h += '<div><h4>Observations techniques</h4><ul>' + t.preuves.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + (t.constats.length ? t.constats.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') : '') + '</ul></div>';
    h += '<div><h4>Cause probable</h4><b>' + esc(t.cause) + '</b> · confiance : ' + esc(t.confiance) + (t.candidats.length > 1 ? '<br>Causes encore possibles : ' + t.candidats.map(esc).join(' ; ') : '') + '</div>';
    if (t.incertitudes.length) h += '<div><h4>Incertitudes</h4><ul>' + t.incertitudes.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
    h += '<div><h4>Recommandations</h4><ul>' + t.recommandations.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
    h += '<div class="decision ' + t.deplacement.code + '"><h4>Décision proposée</h4><b>' + esc(t.deplacement.titre) + '.</b> ' + esc(t.deplacement.texte) + '</div>';
    h += '<div class="marqueur">' + esc(t.palier) + (t.cree ? ' · ' + esc(t.marqueur) : '') + '</div>';
    if (etat.masque) {
      if (!etat.revele) {
        h += '<div class="deviner"><h4>À toi : quelle était la panne réelle ?</h4><div class="boutons">' + L.SCENARIOS.map(function (s) { return '<button class="btn petit" type="button" data-devine="' + s.id + '">' + esc(s.titre) + '</button>'; }).join('') + '</div></div>';
      } else {
        h += '<div class="deviner"><h4>Réalité révélée</h4><b>' + esc(cur.sc.titre) + '.</b> ' + esc(cur.sc.metier) + '<br>' + esc(etat.verdict || '') + '</div>';
      }
    }
    return h + '</div></div>';
  }
  function brancherTicket(box) {
    var f = box.querySelector('[data-fermer]'); if (f) f.addEventListener('click', function () { etat.ticketFerme = true; $('ticketCouche').hidden = true; });
    box.querySelectorAll('[data-devine]').forEach(function (b) {
      b.addEventListener('click', function () {
        var choix = L.scenario(b.dataset.devine), juste = choix.id === cur.sc.id;
        var technique = function (o) { var c = JSON.parse(JSON.stringify(o)); delete c.signalement; return JSON.stringify(c); };
        var memeObs = technique(L.SIM.observer(choix).observations) === technique(cur.obs);
        etat.verdict = (juste ? 'Bien vu !' : 'Ce n\'était pas « ' + choix.titre + ' ».') + (memeObs && !juste ? ' Mais les observations sont identiques : impossible de les distinguer à distance.' : '') + ' Le moteur avait conclu : « ' + cur.diag.conclusion.titre + ' ».';
        etat.revele = true; svg.classList.toggle('sans-reel', !etat.reel);
        S.etat(cur.sc.realite, false);
        majToutes();
      });
    });
  }
  function majToutes() { maj(lecteur); }

  /* ---------- courbe de vibration ---------- */
  function dessinerCourbe(visible, animer) {
    var c = $('courbe'), V = cur.obs.vibration, W = 720, H = 190, x0 = 46, x1 = W - 14, y0 = H - 30, y1 = 14, ymax = 60, tmax = cur.obs.meta.fenetre_s;
    var X = function (t) { return x0 + (x1 - x0) * t / tmax; }, Y = function (v) { return y0 - (y0 - y1) * Math.min(v, ymax) / ymax; };
    var h = '<defs><pattern id="hach" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" class="hachure-trait"/></pattern></defs>';
    for (var v = 0; v <= ymax; v += 20) h += '<line class="grille-c" x1="' + x0 + '" x2="' + x1 + '" y1="' + Y(v) + '" y2="' + Y(v) + '"/><text x="' + (x0 - 6) + '" y="' + (Y(v) + 4) + '" text-anchor="end">' + v + '</text>';
    for (var t = 0; t <= tmax; t += 10) h += '<text x="' + X(t) + '" y="' + (y0 + 16) + '" text-anchor="middle">' + t + ' s</text>';
    h += '<line class="axe" x1="' + x0 + '" x2="' + x1 + '" y1="' + y0 + '" y2="' + y0 + '"/><line class="axe" x1="' + x0 + '" x2="' + x0 + '" y1="' + y0 + '" y2="' + y1 + '"/>';
    h += '<text x="' + (x0 + 4) + '" y="' + (y1 + 2) + '">mg RMS</text>';
    if (!visible) { c.innerHTML = h + '<text class="attente-txt" x="' + (W / 2) + '" y="' + (H / 2) + '" text-anchor="middle">La mesure apparaît à l\'étape 4.</text>'; return; }
    h += '<rect class="repos" x="' + x0 + '" width="' + (x1 - x0) + '" y="' + Y(V.repos.moy + 2 * V.repos.et) + '" height="' + (Y(V.repos.moy - 2 * V.repos.et) - Y(V.repos.moy + 2 * V.repos.et)) + '"/>';
    h += '<line class="seuil" x1="' + x0 + '" x2="' + x1 + '" y1="' + Y(V.seuil) + '" y2="' + Y(V.seuil) + '"/><text class="seuil-txt" x="' + (x1 - 4) + '" y="' + (Y(V.seuil) - 5) + '" text-anchor="end">seuil ' + String(V.seuil).replace('.', ',') + ' mg (simulé : repos + 5 écarts types)</text>';
    h += '<line class="repere" x1="' + X(0) + '" x2="' + X(0) + '" y1="' + y0 + '" y2="' + y1 + '"/>';
    if (cur.obs.signalement) h += '<line class="repere" x1="' + X(cur.obs.signalement.t) + '" x2="' + X(cur.obs.signalement.t) + '" y1="' + y0 + '" y2="' + y1 + '"/><text x="' + (X(cur.obs.signalement.t) + 4) + '" y="' + (y1 + 16) + '">signalement</text>';
    if (V.boitier !== 'en_ligne') {
      h += '<rect class="hachures" x="' + x0 + '" y="' + y1 + '" width="' + (x1 - x0) + '" height="' + (y0 - y1) + '"/><text x="' + (W / 2) + '" y="' + (H / 2) + '" text-anchor="middle" style="font-size:15px;font-weight:900;fill:var(--encre)">inconnu : boîtier hors ligne (pas « zéro »)</text>';
    } else {
      V.serie.forEach(function (p) { if (p.rms > V.seuil) h += '<rect class="actif" x="' + (X(p.t) - (x1 - x0) / tmax / 2) + '" width="' + ((x1 - x0) / tmax) + '" y="' + y1 + '" height="' + (y0 - y1) + '"/>'; });
      var d = V.serie.map(function (p, i) { return (i ? 'L' : 'M') + X(p.t).toFixed(1) + ' ' + Y(p.rms).toFixed(1); }).join('');
      h += '<path class="ligne" d="' + d + '"/>';
      h += '<text x="' + (x0 + 8) + '" y="' + (Y(V.repos.moy) - 10) + '" style="fill:var(--vert)">repos</text>';
    }
    c.innerHTML = h;
    var p = c.querySelector('.ligne');
    if (p && animer && !REDUIT.matches) {
      var Lg = p.getTotalLength(); p.style.strokeDasharray = Lg; p.style.strokeDashoffset = Lg;
      p.getBoundingClientRect(); p.style.transition = 'stroke-dashoffset ' + (2.2 / lecteur.vitesse) + 's linear'; p.style.strokeDashoffset = 0;
    }
  }

  /* ---------- onglets ---------- */
  function ouvrirOnglet(o) {
    etat.onglet = o;
    document.querySelectorAll('[data-onglet]').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.onglet === o)); });
    document.querySelectorAll('.contenu-onglet').forEach(function (p) { p.hidden = p.id !== 'o-' + o; });
  }
  document.querySelectorAll('[data-onglet]').forEach(function (b) { b.addEventListener('click', function () { ouvrirOnglet(b.dataset.onglet); }); });

  /* ---------- comparaison ---------- */
  function comparer() {
    var a = L.scenario($('compA').value), b = L.scenario($('compB').value);
    function calc(sc) { var sim = L.SIM.observer(sc), obs = JSON.parse(JSON.stringify(sim.observations)), d = L.REGLES.diagnostiquer(obs); return { sc: sc, obs: obs, d: d, t: L.TICKET.construire(sc, obs, d) }; }
    var A = calc(a), B = calc(b);
    function ligneObs(X) {
      var o = X.obs, t = X.t.temoins;
      return [
        ['Raccordement', o.contexte.raccordement === 'usb' ? 'USB' : 'réseau'],
        ['Signalement', o.signalement ? o.signalement.canalNom : 'aucun'],
        ['Pages envoyées (CUPS)', o.travail ? o.travail.pages + ' pages, « ' + o.travail.etat + ' »' : (o.contexte.raccordement === 'usb' ? 'non applicable' : 'aucun travail')],
        ['Réseau (ping, ports)', !o.reseau.applicable ? 'non applicable' : (o.reseau.ping.ok ? 'joignable' : 'aucune réponse')],
        [t[0].n, t[0].v], [t[1].n, t[1].v], [t[2].n, t[2].v], [t[3].n, t[3].v]
      ];
    }
    function ligneConc(X) {
      var c = X.d.conclusion;
      return [['Conclusion', c.titre], ['Confiance', c.confiance], ['Causes retenues', c.candidats.length ? c.candidats.map(function (k) { return L.REGLES.NOMS[k]; }).join(' ; ') : '—'], ['Décision', X.t.deplacement.texte], ['Ticket', X.t.cree ? 'oui' : 'non']];
    }
    var oa = ligneObs(A), ob = ligneObs(B), ca = ligneConc(A), cb = ligneConc(B), h = '';
    h += '<thead><tr><th></th><th>A · ' + esc(a.titre) + '</th><th>B · ' + esc(b.titre) + '</th></tr></thead><tbody>';
    h += '<tr class="groupe"><th colspan="3">Ce que le programme observe</th></tr>';
    oa.forEach(function (l, i) { h += '<tr class="' + (l[1] !== ob[i][1] ? 'diff' : '') + '"><th>' + esc(l[0]) + '</th><td>' + esc(l[1]) + '</td><td>' + esc(ob[i][1]) + '</td></tr>'; });
    h += '<tr class="groupe"><th colspan="3">Ce qu\'il conclut</th></tr>';
    ca.forEach(function (l, i) { h += '<tr class="' + (l[1] !== cb[i][1] ? 'diff' : '') + '"><th>' + esc(l[0]) + '</th><td>' + esc(l[1]) + '</td><td>' + esc(cb[i][1]) + '</td></tr>'; });
    h += '<tr class="groupe"><th colspan="3">La réalité (cachée au programme)</th></tr><tr><th>Ce qui se passe</th><td>' + esc(a.metier) + '</td><td>' + esc(b.metier) + '</td></tr>';
    $('compTable').innerHTML = h + '</tbody>';
    var identiques = oa.every(function (l, i) { return l[1] === ob[i][1] || i === 1; });
    $('compAlerte').innerHTML = a.id === b.id ? '' : identiques
      ? '<p class="encadre danger"><b>Mêmes observations, réalités différentes.</b> Le moteur ne voit que les observations : il donne forcément la même conclusion. Il faut une confirmation humaine (une question à Nadia) pour trancher.</p>'
      : '<p class="encadre info">Les lignes surlignées montrent <b>ce qui change</b> : c\'est ce qui permet au moteur de distinguer les deux situations.</p>';
  }
  remplir($('compA'), 'ethernet'); remplir($('compB'), 'eteinte');
  $('compA').addEventListener('change', comparer); $('compB').addEventListener('change', comparer);

  /* ---------- commandes ---------- */
  $('choixScenario').addEventListener('change', function (e) { charger(e.target.value); });
  $('bLecture').addEventListener('click', function () { if (lecteur.lecture) lecteur.pause(); else lecteur.lire(); });
  $('bSuiv').addEventListener('click', function () { lecteur.pause(); lecteur.suivant(); });
  $('bPrec').addEventListener('click', function () { lecteur.precedent(); });
  $('bReinit').addEventListener('click', function () { etat.ticketFerme = false; lecteur.reinit(); });
  $('vitesse').addEventListener('change', function (e) { lecteur.setVitesse(+e.target.value); });
  $('bReel').addEventListener('click', function () {
    etat.reel = !etat.reel; this.setAttribute('aria-pressed', String(etat.reel));
    svg.classList.toggle('sans-reel', !etat.reel || (etat.masque && !etat.revele));
  });
  function tirer() {
    var autres = L.SCENARIOS.filter(function (s) { return s.id !== etat.id; });
    charger(autres[Math.floor(Math.random() * autres.length)].id);
  }
  $('bMasque').addEventListener('click', function () {
    etat.masque = !etat.masque; this.setAttribute('aria-pressed', String(etat.masque));
    $('choixScenario').closest('.choix').hidden = etat.masque; $('bHasard').hidden = !etat.masque;
    $('bReel').disabled = etat.masque;
    if (etat.masque) tirer(); else { $('choixScenario').value = etat.id; charger(etat.id); }
  });
  $('bHasard').addEventListener('click', tirer);
  $('bComparer').addEventListener('click', function () {
    var on = this.getAttribute('aria-pressed') !== 'true'; this.setAttribute('aria-pressed', String(on));
    lecteur.pause();
    $('vueLabo').hidden = on; $('vueComparer').hidden = !on;
    if (CADRE) { var o = document.querySelector('.outils'); if (on) $('vueComparer').querySelector('.comparer').prepend(o); else document.querySelector('.panneau').prepend(o); }
    if (on) comparer();
  });
  document.addEventListener('keydown', function (e) {
    if (e.target.closest('select, input, textarea') || e.ctrlKey || e.metaKey || e.altKey || !$('vueComparer').hidden) return;
    if (e.key === ' ') { e.preventDefault(); if (lecteur.lecture) lecteur.pause(); else lecteur.lire(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); lecteur.pause(); lecteur.suivant(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); lecteur.precedent(); }
    else if (e.key === 'r' || e.key === 'R') lecteur.reinit();
  });

  charger(etat.id);
  window.LABO_UI = { lecteur: lecteur, charger: charger, cur: function () { return cur; } };
})();
