/* =====================================================================
   ticket.js — le ticket GLPI enrichi et les messages de l'étape 6
   Construit à partir des OBSERVATIONS et du DIAGNOSTIC uniquement.
   (Le scénario sert seulement au texte du signalement et au décor.)
   ===================================================================== */
(function (racine) {
  'use strict';
  var LABO = racine.LABO = racine.LABO || {};

  function temoins(obs, diag) {
    var V = obs.vibration, S = obs.snmp, P = obs.pc, out = [];
    // ① vibration
    if (V.boitier !== 'en_ligne') out.push({ n: '① Vibration', v: 'inconnue (boîtier hors ligne)', s: 'inconnu' });
    else {
      var act = V.serie.filter(function (x) { return x.rms > V.seuil; }).length;
      out.push({ n: '① Vibration', v: act ? 'moteurs actifs ' + act + ' s' : 'aucune au-dessus du seuil', s: act ? 'vu' : 'rien' });
    }
    // ② compteur et ③ état
    if (!S.applicable) {
      out.push({ n: '② Compteur de pages', v: 'non applicable (USB)', s: 'na' });
      out.push({ n: '③ État de l\'imprimante', v: 'non applicable (USB)', s: 'na' });
    } else {
      var ok = S.releves.filter(function (x) { return x.reponse === 'ok'; });
      if (!ok.length) {
        out.push({ n: '② Compteur de pages', v: 'inconnu (SNMP sans réponse)', s: 'inconnu' });
        out.push({ n: '③ État de l\'imprimante', v: 'inconnu (SNMP sans réponse)', s: 'inconnu' });
      } else {
        var a = ok[0], b = ok[ok.length - 1], d = b.compteur - a.compteur, tr = obs.travail;
        out.push({ n: '② Compteur de pages', v: '+' + d + (tr ? ' / ' + tr.pages + ' envoyées' : ' (aucun travail)'), s: tr && d < tr.pages ? 'alerte' : 'ok' });
        var e = LABO.REGLES.decoder(b.erreursHex), vu = {};
        ok.forEach(function (x) { LABO.REGLES.decoder(x.erreursHex).forEach(function (k) { vu[k] = 1; }); });
        var tous = Object.keys(vu);
        var fr = { noPaper: 'plus de papier', jammed: 'bourrage', noToner: 'plus de toner' };
        out.push({ n: '③ État de l\'imprimante', v: e.length ? e.map(function (k) { return fr[k] || k; }).join(', ') : (tous.length ? '« prête » (avant : ' + tous.map(function (k) { return fr[k] || k; }).join(', ') + ')' : '« prête », sans erreur'), s: e.length ? 'alerte' : 'ok' });
      }
    }
    // ④ PC
    if (!P || P.statut !== 'ok') out.push({ n: '④ Le PC (JEA)', v: 'inconnu (WinRM sans réponse)', s: 'inconnu' });
    else {
      var x = P.donnees;
      if (x.SpoolerRunning === false) out.push({ n: '④ Le PC (JEA)', v: 'spouleur arrêté ; file illisible', s: 'alerte' });
      else if (x.JobsInError > 0) out.push({ n: '④ Le PC (JEA)', v: x.JobsInError + ' document en erreur', s: 'alerte' });
      else if (x.PrinterStatus === 'Offline') out.push({ n: '④ Le PC (JEA)', v: 'imprimante « hors ligne » ; ' + x.PendingJobs + ' en attente', s: 'alerte' });
      else if (x.PendingJobs > 0) out.push({ n: '④ Le PC (JEA)', v: x.PendingJobs + ' document en attente', s: 'alerte' });
      else out.push({ n: '④ Le PC (JEA)', v: 'file vide, imprimante vue', s: 'ok' });
    }
    return out;
  }

  var DEP = { non: 'Pas de déplacement', appel: 'Appeler d\'abord', deplacement: 'Déplacement nécessaire', technicien: 'À décider par le technicien', aucun: 'Aucune action' };

  function construire(sc, obs, diag) {
    var c = diag.conclusion, D = LABO.DECOR;
    var supervision = c.constats.some(function (x) { return x.code === 'SUPERVISION'; });
    var cree = !!obs.signalement || !(c.code === 'OK' || c.code === 'RIEN') || supervision;
    var t = {
      cree: cree, numero: 'n° 2026-0' + 412,
      marqueur: '[diag:' + D.imprimante + ':incident-' + 42 + ']',
      titre: (c.code === 'OK' && supervision) ? D.imprimante + ' : supervision SNMP indisponible' : D.imprimante + ' : ' + c.titre,
      priorite: c.code === 'OK' || c.code === 'RIEN' ? 'basse' : (c.deplacement.code === 'deplacement' ? 'haute' : 'moyenne'),
      signalement: obs.signalement ? obs.signalement.texte + ' (' + obs.signalement.canalNom + ', 9 h 10)' : 'Aucun : ouvert par le programme de diagnostic',
      temoins: temoins(obs, diag),
      cause: c.titre, confiance: c.confiance, candidats: c.candidats.map(function (k) { return LABO.REGLES.NOMS[k]; }),
      preuves: c.preuves, incertitudes: c.incertitudes, constats: c.constats.map(function (x) { return x.texte; }),
      recommandations: c.recommandations, deplacement: { code: c.deplacement.code, titre: DEP[c.deplacement.code], texte: c.deplacement.texte },
      palier: 'V1 · lecture seule : le programme propose, un humain décide et agit.'
    };
    if (c.code === 'RESOLU') t.titre = D.imprimante + ' : bac vide, résolu sur place';
    return t;
  }

  var ECRAN = { OK: 'Prête', RIEN: 'Prête', PAPIER: 'Bac vide', BOURRAGE: 'Feuille coincée', TONER: 'Toner vide – Wassim prévenu', FIGEE: 'Bloquée – Wassim prévenu',
    RESOLU: 'Réglé sur place', SPOULEUR: 'Problème sur le PC', PILOTE: 'Problème sur le PC', USB: 'Vérifiez le câble USB', INJOIGNABLE: 'Hors réseau', INCOMPLET: 'Diagnostic en cours', INDETERMINE: 'Diagnostic en cours' };

  function evenements(sc, obs, diag, t) {
    var E = [], json = function (x) { return JSON.stringify(x, null, 2); };
    if (!t.cree) {
      E.push({ etape: 6, type: 'scene', quoi: 'journal', t: 62, titre: 'Pas de ticket', texte: 'Le programme note l\'événement dans sa base locale (SQLite) et n\'ouvre pas de ticket.' });
      return E;
    }
    E.push({ etape: 6, type: 'flux', de: 'srv', vers: 'glpi', proto: 'API REST/HTTPS', port: 'TCP 443', t: 62, statut: 'ok',
      titre: 'Ticket enrichi dans GLPI', resume: (obs.signalement ? 'Mise à jour du ticket ' : 'Création du ticket ') + t.numero,
      message: { langage: 'http', texte: 'POST /apirest.php/Ticket HTTP/1.1\nHost: glpi.wassim.internal\nSession-Token: <jeton local>\nApp-Token: <jeton local>\nContent-Type: application/json\n\n' +
        json({ input: { name: t.titre, type: 1, urgency: t.priorite === 'haute' ? 4 : 3, content: t.marqueur + '\nCause probable : ' + t.cause + '\nConfiance : ' + t.confiance + '\nDécision proposée : ' + t.deplacement.titre } }) },
      reponse: { langage: 'json', texte: json({ id: 412, message: 'Item successfully added: ' + t.titre }) } });
    if (obs.vibration.boitier === 'en_ligne') E.push({ etape: 6, type: 'flux', de: 'srv', vers: 'esp', proto: 'MQTT/TLS', port: 'TCP 8883', t: 63, statut: 'ok',
      titre: 'Message pour l\'écran du boîtier', resume: '« ' + ECRAN[diag.conclusion.code] + ' »',
      message: { langage: 'json', texte: json({ schema: 1, device_id: LABO.DECOR.boitier, text: ECRAN[diag.conclusion.code], generated_at: '2026-11-24T08:11:02Z', valid_s: 3600 }) } });
    E.push({ etape: 6, type: 'flux', de: 'tec', vers: 'srv', proto: 'HTTPS', port: 'TCP 443', t: 64, statut: 'ok',
      titre: 'Wassim ouvre le ticket', resume: 'Interface GLPI dans le navigateur',
      message: { langage: 'http', texte: 'GET /front/ticket.form.php?id=' + 412 + ' HTTP/1.1\nHost: glpi.wassim.internal' } });
    return E;
  }

  LABO.TICKET = { construire: construire, evenements: evenements, ECRAN: ECRAN };
})(typeof window !== 'undefined' ? window : globalThis);
