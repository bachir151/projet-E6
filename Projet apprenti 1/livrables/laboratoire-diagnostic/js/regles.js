/* =====================================================================
   regles.js — LE MOTEUR DE RÈGLES (le « cerveau » Python, simulé en JS)
   diagnostiquer(observations) → { noeuds, conclusion }
   - Il ne reçoit QUE les observations : jamais la réalité, jamais le nom
     du scénario. Il déduit la cause à partir de règles explicites (R1…R14).
   - Une mesure absente reste « inconnue » ; elle n'écarte rien.
   - Le diagnostic peut rester indéterminé ou incomplet.
   - V1 : lecture seule. Le moteur recommande ; il n'agit jamais.
   ===================================================================== */
(function (racine) {
  'use strict';
  var LABO = racine.LABO = racine.LABO || {};

  var HYP = [
    ['USB', 'Câble USB débranché'],
    ['CABLE_RESEAU', 'Câble réseau débranché'],
    ['ALIM', 'Imprimante éteinte'],
    ['ADRESSAGE', 'Réseau ou adressage (ex. autre VLAN)'],
    ['SPOULEUR', 'Spouleur Windows arrêté'],
    ['PILOTE', 'Pilote ou file Windows en erreur'],
    ['PAPIER', 'Bac à papier vide'],
    ['BOURRAGE', 'Bourrage papier'],
    ['TONER', 'Toner épuisé'],
    ['FIGEE', 'Imprimante figée']
  ];
  var NOMS = {}; HYP.forEach(function (h) { NOMS[h[0]] = h[1]; });

  var REGLES = {
    R1: 'Joignabilité : ping puis ports 631 et 9100',
    R2: 'Réponse SNMP : absence de réponse ≠ imprimante éteinte',
    R3: 'État SNMP décodé (bits RFC 3805), si le décodage est validé sur le modèle',
    R4: 'Compteur de pages : avant/après, comparé aux pages suivies par CUPS',
    R5: 'Consommable : pourcentage seulement si niveau et capacité sont valides',
    R6: 'Vibration au-dessus du seuil, avec sa durée',
    R7: 'Vibration sans page comptée : mouvement non attribuable',
    R8: 'File du PC : documents qui restent ou en erreur',
    R9: 'Témoin PC indisponible : inconnu, rien n\'est écarté',
    R10: 'Boîtier hors ligne (dernière volonté MQTT) : vibration inconnue',
    R11: 'Imprimante figée : travail accepté, compteur immobile, pas de vibration, état « prête », file vide, délai dépassé',
    R12: 'Compteur qui diminue : nouvelle référence, pas d\'alerte',
    R13: 'Mesure périmée (> 15 s) : traitée comme inconnue',
    R14: 'Imprimante USB : SNMP non applicable, le PC est le témoin principal'
  };

  /* décodage de hrPrinterDetectedErrorState (premier octet, bit 0 = poids fort) */
  var BITS = [['lowPaper', 0x80], ['noPaper', 0x40], ['lowToner', 0x20], ['noToner', 0x10], ['doorOpen', 0x08], ['jammed', 0x04], ['offline', 0x02], ['serviceRequested', 0x01]];
  function decoder(hex) { var v = parseInt(hex.slice(0, 2), 16), out = []; BITS.forEach(function (b) { if (v & b[1]) out.push(b[0]); }); return out; }
  var ETAT_IMP = { 1: 'autre', 2: 'inconnu', 3: 'au repos (prête)', 4: 'impression', 5: 'préchauffage' };
  var ETAT_DEV = { 1: 'inconnu', 2: 'en marche', 3: 'avertissement', 4: 'test', 5: 'arrêtée (erreur)' };

  function diagnostiquer(obs) {
    var H = {}; HYP.forEach(function (h) { H[h[0]] = 'possible'; });
    var noeuds = [], constats = [], incertitudes = [], F = {}; // F : faits établis
    var C = obs.contexte, usb = C.raccordement === 'usb';

    function snap() { var s = {}; for (var k in H) s[k] = H[k]; return s; }
    function noeud(n) { n.hyp = snap(); n.constats = constats.slice(); noeuds.push(n); return n; }
    function mettre(codes, etat) { codes.forEach(function (c) { if (H[c] !== 'ecartee' || etat === 'ecartee') H[c] = etat; }); }
    function restantes() { return HYP.filter(function (h) { return H[h[0]] !== 'ecartee'; }).length; }

    /* ---------- N0 : le contexte (inventaire GLPI) ---------- */
    if (usb) mettre(['CABLE_RESEAU', 'ADRESSAGE'], 'ecartee'); else mettre(['USB'], 'ecartee');
    noeud({ etape: 1, regle: usb ? 'R14' : null, titre: 'Quelle imprimante, branchée comment ?',
      cherche: 'Le raccordement de l\'imprimante, pour choisir les bons témoins.',
      source: 'Inventaire GLPI', recu: [C.imprimante + ' · ' + (usb ? 'USB, sur ' + C.pc : 'réseau, ' + C.ipAttendue)],
      deduit: usb ? 'Pas d\'adresse IP : SNMP ne s\'applique pas. Le PC sera le témoin principal.' : 'Imprimante réseau : on pourra la joindre et la lire par SNMP.',
      branches: [{ t: 'réseau', pris: !usb }, { t: 'USB', pris: usb }],
      prochaine: 'Interroger le PC (WinRM + JEA).' });

    /* ---------- N1 : le témoin PC ---------- */
    var pc = obs.pc;
    F.pcConnu = pc && pc.statut === 'ok';
    if (!F.pcConnu) {
      mettre(['SPOULEUR', 'PILOTE'].concat(usb ? ['USB'] : []), 'nv');
      incertitudes.push('Témoin PC indisponible : état du spouleur et de la file inconnus.');
      constats.push({ code: 'JEA', texte: 'Accès WinRM/JEA indisponible : à rétablir.' });
      noeud({ etape: 2, regle: 'R9', titre: 'Le PC répond-il ?', cherche: 'Le spouleur, la file d\'impression, l\'imprimante vue ou non.',
        source: 'WinRM/HTTPS 5986 + JEA', recu: [pc ? pc.detail : 'aucune donnée'],
        deduit: 'Témoin PC inconnu. Un silence n\'est pas « 0 document » : rien n\'est écarté côté poste.',
        branches: [{ t: 'réponse', pris: false }, { t: 'pas de réponse', pris: true }],
        prochaine: usb ? 'Il reste la vibration : SNMP ne s\'applique pas.' : 'Vérifier l\'imprimante sur le réseau.' });
    } else {
      var d = pc.donnees, recu = [], deduit;
      F.spouleur = d.SpoolerRunning; F.file = d.PendingJobs; F.fileErreur = d.JobsInError; F.statutWin = d.PrinterStatus;
      recu.push('SpoolerRunning = ' + d.SpoolerRunning);
      recu.push('PendingJobs = ' + (d.PendingJobs == null ? 'inconnu' : d.PendingJobs) + ' · JobsInError = ' + (d.JobsInError == null ? 'inconnu' : d.JobsInError));
      recu.push('PrinterStatus = ' + (d.PrinterStatus == null ? 'inconnu' : d.PrinterStatus));
      if (d.SpoolerRunning === false) {
        H.SPOULEUR = 'soutenue'; mettre(['PILOTE'].concat(usb ? ['USB'] : []), 'nv');
        deduit = 'Le spouleur est arrêté : le poste ne peut rien imprimer. La file est illisible (inconnue, pas 0).';
      } else {
        mettre(['SPOULEUR'], 'ecartee');
        if (d.JobsInError > 0) { H.PILOTE = 'soutenue'; deduit = 'Un document est en erreur dans la file du PC : il ne part pas. Le blocage est côté poste.'; }
        else if (d.PendingJobs > 0) { deduit = 'Un document attend dans la file du PC (un travail, pas des pages). Il n\'est pas en erreur.'; mettre(['PILOTE'], 'ecartee'); }
        else { deduit = 'File vide, aucune erreur. Le poste a bien transmis… ce qui ne prouve pas que les pages sont sorties.'; mettre(['PILOTE'], 'ecartee'); }
        if (usb) {
          if (d.PrinterStatus === 'Offline') { H.USB = 'soutenue'; H.ALIM = 'soutenue'; deduit += ' Windows voit l\'imprimante USB « hors ligne » : câble ou alimentation.'; }
          else mettre(['USB', 'ALIM'], 'ecartee');
        }
      }
      noeud({ etape: 2, regle: 'R8', titre: 'Que dit le PC ?', cherche: 'Le spouleur tourne-t-il ? Des documents attendent-ils ? L\'imprimante est-elle vue ?',
        source: 'WinRM/HTTPS 5986 + JEA (contrat proposé)', recu: recu, deduit: deduit,
        branches: [{ t: 'spouleur arrêté', pris: d.SpoolerRunning === false }, { t: 'file bloquée', pris: d.SpoolerRunning !== false && (d.PendingJobs > 0) }, { t: 'file vide', pris: d.SpoolerRunning !== false && d.PendingJobs === 0 }],
        prochaine: usb ? 'Écouter la vibration (SNMP non applicable).' : 'Vérifier l\'imprimante sur le réseau.' });
    }
    (obs.securite || []).forEach(function (s) {
      constats.push({ code: 'T10', texte: 'Commande hors liste « ' + s.commande + ' » refusée et tracée.' });
      noeud({ etape: 2, regle: null, titre: 'Et si on relançait le service ?', cherche: 'Vérifier que JEA refuse une commande hors liste (test T10).',
        source: 'WinRM/HTTPS 5986 + JEA', recu: [s.commande + ' → ' + s.resultat], deduit: 'Refus attendu : la V1 est en lecture seule. Le spouleur se relance par un humain, pas par le programme.',
        branches: [{ t: 'accepté', pris: false }, { t: 'refusé et tracé', pris: true }], prochaine: 'Continuer le diagnostic, sans rien changer.' });
    });

    /* ---------- N2 : réseau et SNMP ---------- */
    var snmp = obs.snmp, R = obs.reseau, rel = [], dernier = null, premier = null;
    if (usb) {
      noeud({ etape: 3, regle: 'R14', titre: 'Peut-on lire l\'imprimante ?', cherche: 'État, compteur et toner par SNMP.',
        source: '—', recu: ['Imprimante USB : pas d\'interface réseau accessible'],
        deduit: 'SNMP non applicable. État et compteur : « non applicable », ni 0, ni « éteinte ».',
        branches: [{ t: 'SNMP possible', pris: false }, { t: 'non applicable', pris: true }], prochaine: 'Écouter la vibration.' });
    } else {
      F.joignable = R.ping.ok;
      if (!R.ping.ok) {
        H.CABLE_RESEAU = 'soutenue'; H.ALIM = 'soutenue'; H.ADRESSAGE = 'soutenue';
        mettre(['PAPIER', 'BOURRAGE', 'TONER', 'FIGEE'], 'nv');
      } else mettre(['CABLE_RESEAU', 'ALIM', 'ADRESSAGE'], 'ecartee');
      noeud({ etape: 3, regle: 'R1', titre: 'L\'imprimante répond-elle sur le réseau ?', cherche: 'Est-elle joignable à son adresse attendue ?',
        source: 'ICMP · TCP 631 · TCP 9100', recu: ['ping ' + R.cible + ' : ' + (R.ping.ok ? 'réponse' : 'aucune réponse'), 'port 631 : ' + R.tcp631 + ' · port 9100 : ' + R.tcp9100],
        deduit: R.ping.ok ? 'Elle est sur le réseau, à la bonne adresse. Câble, alimentation et adressage sont écartés.'
          : 'Elle ne répond pas à l\'adresse attendue. Câble débranché, imprimante éteinte, autre réseau : d\'ici, ces trois causes donnent exactement la même observation.',
        branches: [{ t: 'répond', pris: R.ping.ok }, { t: 'muette', pris: !R.ping.ok }],
        prochaine: R.ping.ok ? 'Lire son état par SNMP.' : 'Essayer SNMP quand même (le résultat sera « inconnu »).' });

      rel = snmp.releves; dernier = rel[rel.length - 1]; premier = rel[0];
      var ok = rel.filter(function (x) { return x.reponse === 'ok'; });
      F.snmp = ok.length > 0;
      if (!F.snmp) {
        if (R.ping.ok) { constats.push({ code: 'SUPERVISION', texte: 'L\'imprimante répond au ping mais pas à SNMP : supervision à réparer (agent, identifiants, filtre).' }); incertitudes.push('État et compteur inconnus : SNMP ne répond pas.'); }
        noeud({ etape: 3, regle: 'R2', titre: 'SNMP répond-il ?', cherche: 'L\'état, les erreurs, le compteur, le toner.',
          source: 'SNMP · UDP 161', recu: ['Délai dépassé (2 s, 1 nouvel essai), à chaque relevé'],
          deduit: R.ping.ok ? 'L\'imprimante est là, mais sa supervision ne répond pas. Ce n\'est pas une preuve de panne : état et compteur restent inconnus.'
            : 'Normal : elle ne répond pas du tout. Cela ne prouve pas qu\'elle est éteinte.',
          branches: [{ t: 'réponse', pris: false }, { t: 'délai dépassé', pris: true }],
          prochaine: 'Écouter la vibration.' });
      } else {
        var vus = {};
        ok.forEach(function (x) { decoder(x.erreursHex).forEach(function (b) { vus[b] = vus[b] || x.t; }); });
        F.erreursVues = vus; F.dernierEtat = decoder(dernier.erreursHex);
        var liste = Object.keys(vus);
        if (vus.noPaper != null) H.PAPIER = 'soutenue'; else mettre(['PAPIER'], 'ecartee');
        if (vus.jammed != null) H.BOURRAGE = 'soutenue'; else mettre(['BOURRAGE'], 'ecartee');
        if (vus.noToner != null) H.TONER = 'soutenue'; else mettre(['TONER'], 'ecartee');
        noeud({ etape: 3, regle: 'R3', titre: 'Que dit l\'imprimante d\'elle-même ?', cherche: 'Une erreur signalée : papier, bourrage, toner…',
          source: 'SNMP · UDP 161 (lecture seule)',
          recu: ['hrPrinterStatus = ' + dernier.hrPrinterStatus + ' (' + ETAT_IMP[dernier.hrPrinterStatus] + ')', 'hrDeviceStatus = ' + dernier.hrDeviceStatus + ' (' + ETAT_DEV[dernier.hrDeviceStatus] + ')',
            'hrPrinterDetectedErrorState = 0x' + dernier.erreursHex + (liste.length ? ' · déjà vu : ' + liste.join(', ') : ' · aucune erreur depuis le travail')],
          deduit: liste.length ? 'Elle signale elle-même : ' + liste.map(function (b) { return { noPaper: 'plus de papier', jammed: 'bourrage', noToner: 'plus de toner' }[b] || b; }).join(', ') + '. À confirmer par les autres témoins.'
            : 'Elle se dit « prête », sans erreur. Mais une imprimante peut se tromper : cela n\'écarte pas une imprimante figée.',
          branches: [{ t: 'erreur signalée', pris: liste.length > 0 }, { t: '« prête »', pris: liste.length === 0 }],
          prochaine: 'Comparer son compteur aux pages envoyées.' });

        var tonerTxt = (dernier.tonerMax > 0 && dernier.tonerNiveau >= 0) ? Math.round(100 * dernier.tonerNiveau / dernier.tonerMax) + ' %' : 'inconnu';
        F.toner = tonerTxt;
        var c0 = premier.reponse === 'ok' ? premier.compteur : null, c1 = dernier.compteur;
        F.delta = c0 == null ? null : c1 - c0;
        var tr = obs.travail, recuC = ['Compteur : ' + c0 + ' → ' + c1 + ' (' + (F.delta >= 0 ? '+' : '') + F.delta + ')', 'Toner : ' + tonerTxt + ' (niveau ' + dernier.tonerNiveau + ' / capacité ' + dernier.tonerMax + ')'];
        recuC.push(tr ? 'CUPS : ' + tr.pages + ' pages envoyées, travail « ' + tr.etat + ' »' : 'CUPS : aucun travail reçu pour cette imprimante');
        var dC;
        if (F.delta < 0) { dC = 'Le compteur a diminué : nouvelle référence, pas d\'alerte (R12).'; }
        else if (!tr) dC = 'Aucun travail suivi : la comparaison est impossible. ' + (F.delta === 0 ? 'Le compteur n\'a pas bougé.' : '');
        else if (F.delta >= tr.pages) dC = 'Toutes les pages envoyées sont comptées.';
        else if (F.delta > 0) dC = F.delta + ' page(s) sur ' + tr.pages + ' : l\'impression s\'est arrêtée en route.';
        else dC = 'Aucune page comptée sur ' + tr.pages + ' envoyées.';
        if (F.delta > 0 && tr && F.delta >= tr.pages) mettre(['FIGEE'], 'ecartee');
        noeud({ etape: 3, regle: F.delta < 0 ? 'R12' : 'R4', titre: 'Le compteur a-t-il avancé ?', cherche: 'Les pages comptées par l\'imprimante, comparées aux pages envoyées.',
          source: 'SNMP + suivi CUPS', recu: recuC, deduit: dC + ' (R5 : toner lu seulement parce que niveau et capacité sont valides.)',
          branches: [{ t: 'tout compté', pris: tr && F.delta >= tr.pages }, { t: 'en partie', pris: tr && F.delta > 0 && F.delta < tr.pages }, { t: 'rien', pris: !tr || F.delta === 0 }],
          prochaine: 'Écouter la vibration : les moteurs ont-ils tourné ?' });
      }
    }

    /* ---------- N3 : la vibration ---------- */
    var V = obs.vibration;
    F.boitier = V.boitier === 'en_ligne';
    if (!F.boitier) {
      F.vib = null;
      incertitudes.push('Boîtier hors ligne : la vibration est inconnue (pas « nulle »).');
      constats.push({ code: 'BOITIER', texte: 'Boîtier ESP32 hors ligne (dernière volonté MQTT) : Wi-Fi ou alimentation du boîtier à vérifier.' });
      noeud({ etape: 4, regle: 'R10', titre: 'Les moteurs ont-ils tourné ?', cherche: 'La vibration mesurée par le boîtier.',
        source: 'MQTT/TLS 8883 · sujet status', recu: ['status = offline (dernière volonté), depuis 10 min'],
        deduit: 'Vibration inconnue. On ne peut ni confirmer ni écarter un arrêt des moteurs.',
        branches: [{ t: 'mesure reçue', pris: false }, { t: 'inconnue', pris: true }], prochaine: 'Faire la synthèse avec ce qui reste.' });
    } else {
      var act = V.serie.filter(function (x) { return x.rms != null && x.rms > V.seuil; });
      var salves = 0, prec = false; V.serie.forEach(function (x) { var a = x.rms > V.seuil; if (a && !prec) salves++; prec = a; });
      var dernierActif = act.length ? act[act.length - 1].t : null;
      F.vib = { secondes: act.length, salves: salves, dernier: dernierActif };
      var dV;
      if (!act.length) dV = 'Aucune vibration au-dessus du seuil : les moteurs n\'ont pas tourné.';
      else if (salves >= 3 && act.length <= 6) dV = act.length + ' s actives, en ' + salves + ' salves courtes : cela ressemble à des chocs, pas à une impression.';
      else dV = 'Les moteurs ont tourné ' + act.length + ' s (' + salves + ' salve' + (salves > 1 ? 's' : '') + '). Une vibration ne prouve pas, seule, qu\'une page est sortie.';
      noeud({ etape: 4, regle: 'R6', titre: 'Les moteurs ont-ils tourné ?', cherche: 'Une vibration au-dessus du seuil, et combien de temps.',
        source: 'MPU6050 → ESP32 → MQTT/TLS 8883', recu: ['Seuil : ' + V.seuil + ' mg (repos ' + V.repos.moy + ' ± ' + V.repos.et + ' mg, simulé)', 'Actif : ' + act.length + ' s sur ' + V.serie.length + ' · salves : ' + salves],
        deduit: dV, branches: [{ t: 'vibre', pris: act.length > 0 }, { t: 'calme', pris: act.length === 0 }], prochaine: 'Croiser les témoins.' });
      if (act.length && F.delta === 0 && !obs.travail) {
        constats.push({ code: 'PARASITE', texte: 'Secousses sans impression : mouvement non attribuable, ignoré.' });
        noeud({ etape: 4, regle: 'R7', titre: 'Cette vibration vient-elle d\'une impression ?', cherche: 'Une page comptée en même temps.',
          source: 'Vibration × compteur', recu: ['Vibration : ' + act.length + ' s · compteur : +0 · aucun travail'],
          deduit: 'Vibration sans page comptée : ce n\'est pas une impression. On l\'ignore (choc, chariot, porte…).',
          branches: [{ t: 'impression', pris: false }, { t: 'mouvement parasite', pris: true }], prochaine: 'Synthèse.' });
      }
    }

    /* ---------- N4 : synthèse ---------- */
    var concl = synthese(obs, F, H, usb, incertitudes, constats);
    concl.constats = constats; concl.incertitudes = incertitudes;
    noeud({ etape: 5, regle: concl.regle, titre: 'Synthèse : que peut-on conclure ?', cherche: 'Une cause qui explique TOUS les témoins, et elle seule.',
      source: 'Moteur de règles', recu: concl.preuves, deduit: concl.titre + (concl.confiance ? ' — confiance ' + concl.confiance + '.' : '.'),
      branches: concl.branches, prochaine: concl.deplacement.texte, final: true });
    return { noeuds: noeuds, conclusion: concl, hypotheses: HYP, regles: REGLES };
  }

  function synthese(obs, F, H, usb, inc, constats) {
    var tr = obs.travail, sig = obs.signalement, retenir = function (codes) { codes.forEach(function (c) { H[c] = 'retenue'; }); };
    var vibConnue = F.vib != null, vibOui = vibConnue && F.vib.secondes > 0;
    var c = { preuves: [], branches: [], candidats: [], recommandations: [] };
    function fin(code, titre, conf, dep, depTxt, regle) {
      c.code = code; c.titre = titre; c.confiance = conf; c.regle = regle || null;
      c.deplacement = { code: dep, texte: depTxt };
      c.branches = [{ t: 'cause unique', pris: c.candidats.length === 1 }, { t: 'plusieurs causes', pris: c.candidats.length > 1 }, { t: 'aucune panne', pris: code === 'OK' || code === 'RIEN' }];
      // les hypothèses non retenues restées « possibles » deviennent non vérifiables ou écartées
      return c;
    }
    function preuve(s) { c.preuves.push(s); }

    // 1. côté poste
    if (H.SPOULEUR === 'soutenue') {
      c.candidats = ['SPOULEUR']; retenir(c.candidats);
      preuve('PC : SpoolerRunning = false');
      if (F.joignable && F.snmp && !Object.keys(F.erreursVues).length) preuve('Imprimante joignable et « prête » : elle n\'est pas en cause');
      var confS = (F.joignable && F.snmp) || usb ? 'élevée' : 'moyenne';
      c.recommandations = ['Relancer le service « Spouleur d\'impression » sur le PC (action humaine : prise en main à distance ou sur place).', 'Chercher pourquoi il s\'est arrêté (journal Système de Windows).'];
      return fin('SPOULEUR', 'Spouleur Windows arrêté sur le PC', confS, 'technicien', 'Pas de déplacement d\'abord : le technicien relance le service à distance, avec l\'accord de Nadia. V1 : le programme ne le fait pas.');
    }
    if (H.PILOTE === 'soutenue') {
      c.candidats = ['PILOTE']; retenir(c.candidats);
      preuve('PC : 1 document en erreur dans la file'); if (!tr && !usb) preuve('CUPS n\'a rien reçu');
      if (F.joignable && F.snmp) preuve('Imprimante joignable et « prête »');
      inc.push('Pilote ou réglage de la file : le témoin ne sépare pas les deux.');
      c.recommandations = ['Vérifier le pilote et la file Windows (réinstaller le pilote si besoin).', 'Supprimer le document bloqué : action humaine.'];
      return fin('PILOTE', 'Blocage côté poste : pilote ou file Windows en erreur', 'moyenne', 'technicien', 'Intervention sur le PC, à distance si possible. Pas de déplacement pour l\'imprimante.');
    }
    if (H.USB === 'soutenue') {
      c.candidats = ['USB', 'ALIM']; retenir(c.candidats);
      preuve('PC : imprimante USB « Offline », 1 document en attente');
      if (vibConnue) preuve('Vibration : ' + (vibOui ? 'oui' : 'aucune'));
      inc.push('En USB, le boîtier ne peut pas prouver que l\'imprimante est en bon état au repos ; éteinte ou débranchée se ressemblent.');
      c.recommandations = ['Demander à Nadia de vérifier le câble USB (des deux côtés).', 'Puis vérifier que l\'imprimante est allumée.'];
      return fin('USB', 'Imprimante non vue par le PC : branchement USB à vérifier (cause probable)', 'moyenne', 'appel', 'Appeler Nadia d\'abord : « vérifiez le câble USB ». Se déplacer seulement si cela ne suffit pas.');
    }
    // 2. injoignable
    if (!usb && F.joignable === false) {
      c.candidats = ['CABLE_RESEAU', 'ALIM', 'ADRESSAGE']; retenir(c.candidats);
      preuve('Ping et ports 631/9100 : aucune réponse'); preuve('SNMP : délai dépassé (inconnu, pas « éteinte »)');
      if (tr) preuve('CUPS : travail « ' + tr.etat + ' »');
      if (vibConnue) preuve('Vibration : ' + (vibOui ? 'oui' : 'aucune') + ' (une imprimante au repos ne vibre pas non plus)');
      inc.push('Câble, alimentation ou réseau : les observations sont identiques. Le diagnostic ne peut pas trancher seul.');
      inc.push('Piste du volet physique : le niveau de repos (ventilateur) distingue-t-il « allumée » de « éteinte » ? À mesurer, non exploité.');
      c.recommandations = ['Demander à Nadia : l\'écran de l\'imprimante est-il allumé ? Le voyant du câble réseau clignote-t-il ?', 'Si l\'imprimante est allumée et câblée : vérifier sa prise réseau et son adresse (autre VLAN possible).'];
      return fin('INJOIGNABLE', 'Imprimante injoignable : câble, alimentation ou réseau à vérifier', 'indéterminée entre 3 causes', 'appel', 'Appeler Nadia d\'abord (deux questions). La réponse humaine tranche ; se déplacer ensuite si besoin.', 'R1');
    }
    // 3. erreurs signalées par l'imprimante
    var vus = F.erreursVues || {};
    if (vus.noPaper != null || vus.jammed != null || vus.noToner != null) {
      var code = vus.jammed != null ? 'BOURRAGE' : vus.noToner != null ? 'TONER' : 'PAPIER';
      var resolu = F.dernierEtat && F.dernierEtat.length === 0 && tr && F.delta >= tr.pages && vibOui && F.vib.dernier > vus[{ PAPIER: 'noPaper', BOURRAGE: 'jammed', TONER: 'noToner' }[code]];
      if (resolu) {
        c.candidats = [code]; retenir(c.candidats);
        preuve('SNMP : « ' + (code === 'PAPIER' ? 'plus de papier' : code.toLowerCase()) + ' », puis plus d\'erreur'); preuve('Compteur : +' + F.delta + ' / ' + tr.pages); preuve('Vibration : les moteurs ont tourné après l\'erreur');
        c.recommandations = ['Aucune intervention. Garder la trace : le bac se vide souvent ?'];
        return fin('RESOLU', NOMS[code] + ' : résolu sur place, avec la preuve', 'élevée', 'non', 'Pas de déplacement : ticket marqué « résolu sur place ».');
      }
      c.candidats = [code]; retenir(c.candidats);
      var nomE = { PAPIER: 'plus de papier', BOURRAGE: 'bourrage', TONER: 'plus de toner' }[code];
      preuve('SNMP : l\'imprimante signale « ' + nomE + ' »');
      var concorde = true;
      if (tr) preuve('Compteur : +' + F.delta + ' sur ' + tr.pages + ' envoyées');
      if (vibConnue) {
        preuve('Vibration : ' + (vibOui ? F.vib.secondes + ' s puis arrêt' : 'aucune'));
        if (code === 'BOURRAGE' && !(vibOui && F.delta > 0)) concorde = false;
      } else { concorde = false; }
      if (code === 'TONER') preuve('Toner : ' + F.toner);
      var conf = concorde ? 'élevée' : 'moyenne';
      if (code === 'PAPIER') { c.recommandations = ['Dire à Nadia de remettre du papier dans le bac.']; return fin(code, 'Bac à papier vide', conf, 'non', 'Pas de déplacement : Nadia remet du papier. Le compteur et la vibration confirmeront.', 'R3'); }
      if (code === 'BOURRAGE') { c.recommandations = ['Guider Nadia pour retirer la feuille coincée (trappe indiquée par l\'imprimante).', 'Si les bourrages se répètent : se déplacer (rouleaux, papier humide).']; return fin(code, 'Bourrage papier après la ' + F.delta + 'ᵉ page', conf, 'non', 'Pas de déplacement d\'abord : Nadia retire la feuille. Se déplacer si cela recommence.', 'R3'); }
      c.recommandations = ['Prendre une cartouche de toner du bon modèle.']; return fin(code, 'Toner épuisé : cartouche à remplacer', conf, 'deplacement', 'Se déplacer avec la cartouche.', 'R5');
    }
    // 4. imprimante figée (R11)
    var accepte = tr && tr.etat === 'terminé', delaiOk = obs.meta.fenetre_s - (tr ? tr.t : 0) >= obs.meta.delaiAttente_s;
    if (!usb && accepte && F.snmp && F.delta === 0 && delaiOk) {
      c.candidats = ['FIGEE'];
      preuve('CUPS : travail transmis (« terminé »)'); preuve('Compteur : +0 sur ' + tr.pages + ' après ' + obs.meta.delaiAttente_s + ' s'); preuve('SNMP : « prête », sans erreur');
      var manque = [];
      if (!vibConnue) manque.push('vibration'); else preuve('Vibration : aucune');
      if (!F.pcConnu) manque.push('PC'); else preuve('PC : file vide');
      if (manque.length) {
        H.FIGEE = 'soutenue';
        inc.push('Règle R11 incomplète : il manque ' + manque.join(' et ') + '.');
        c.recommandations = ['Rétablir le témoin manquant (' + manque.join(', ') + ').', 'Demander à Nadia si l\'imprimante fait du bruit quand elle imprime.'];
        return fin('INCOMPLET', 'Diagnostic incomplet : imprimante figée possible, non confirmée', 'faible', 'technicien', 'À décider par le technicien : un appel à Nadia peut compléter le témoin manquant.', 'R11');
      }
      retenir(c.candidats);
      inc.push('« Figée » est une déduction : aucun témoin ne la mesure directement.');
      c.recommandations = ['Éteindre puis rallumer l\'imprimante (action humaine, sur place).', 'Si cela se répète : relever la version du micrologiciel.'];
      return fin('FIGEE', 'Imprimante probablement figée (elle se dit « prête »)', 'moyenne', 'deplacement', 'Se déplacer, ou faire redémarrer l\'imprimante par Nadia. V1 : aucun redémarrage automatique.', 'R11');
    }
    // 5. impression réussie
    if (!usb && tr && accepte && (F.snmp ? F.delta >= tr.pages : vibOui)) {
      preuve('CUPS : ' + tr.pages + ' pages, travail « terminé »');
      preuve(F.snmp ? 'Compteur : +' + F.delta + ' / ' + tr.pages : 'Compteur : inconnu (SNMP muet)');
      if (vibConnue) preuve('Vibration : ' + F.vib.secondes + ' s'); if (F.pcConnu) preuve('PC : file vide');
      inc.push('Les feuilles elles-mêmes ne sont pas vues (capteur de feuilles FC-51 : V2).');
      var confOk = F.snmp && vibOui ? 'élevée' : 'moyenne';
      c.recommandations = constats.some(function (x) { return x.code === 'SUPERVISION'; }) ? ['Ticket de supervision, priorité basse : rétablir SNMP (agent, identifiants SNMPv3, filtre).'] : ['Rien à faire.'];
      if (sig) c.recommandations.unshift('Rappeler Nadia : les témoins disent que l\'impression a réussi.');
      return fin('OK', 'Impression réussie (probable)', confOk, 'non', 'Pas de déplacement.');
    }
    if (usb && F.pcConnu && F.file === 0 && vibOui) {
      preuve('PC : file vide, imprimante vue'); preuve('Vibration : ' + F.vib.secondes + ' s'); preuve('Compteur : non applicable (USB)');
      inc.push('En USB, pas de compteur : on ne sait pas combien de pages sont sorties.');
      c.recommandations = ['Rien à faire.'];
      return fin('OK', 'Impression réussie (probable)', 'moyenne', 'non', 'Pas de déplacement.');
    }
    // 6. rien à signaler
    if (!tr && !sig && (usb || F.delta === 0 || F.delta == null) && (!F.pcConnu || !(F.file > 0))) {
      preuve('Aucun travail, aucun signalement'); if (F.delta === 0) preuve('Compteur : +0');
      if (vibOui) preuve('Vibration : ' + F.vib.salves + ' salves courtes, ignorées');
      HYP.forEach(function (h) { if (H[h[0]] === 'possible') H[h[0]] = 'ecartee'; });
      c.recommandations = ['Rien à faire. Si les secousses gênent la mesure : revoir la fixation ou le seuil (volet physique).'];
      return fin('RIEN', 'Aucune panne : pas de ticket', 'élevée', 'aucun', 'Pas de ticket, pas de déplacement.', 'R7');
    }
    // 7. indéterminé
    HYP.forEach(function (h) { if (H[h[0]] === 'possible') H[h[0]] = 'nv'; });
    c.candidats = HYP.filter(function (h) { return H[h[0]] === 'nv' || H[h[0]] === 'soutenue'; }).map(function (h) { return h[0]; });
    preuve(F.pcConnu ? 'PC : réponse' : 'PC : aucune réponse'); preuve(usb ? 'SNMP : non applicable (USB)' : 'SNMP : ' + (F.snmp ? 'réponse' : 'aucune réponse'));
    if (vibConnue) preuve('Vibration : ' + (vibOui ? 'oui' : 'aucune') + ' (une imprimante au repos ne vibre pas non plus)');
    inc.push('Les observations ne suffisent pas à départager les causes.');
    c.recommandations = ['Appeler Nadia : câble USB branché ? imprimante allumée ? message à l\'écran ?', 'Rétablir l\'accès WinRM/JEA du PC.'];
    return fin('INDETERMINE', 'Diagnostic indéterminé : observations insuffisantes', 'aucune', 'appel', 'Appeler Nadia d\'abord. Le programme ne peut pas trancher seul.');
  }

  LABO.REGLES = { HYP: HYP, NOMS: NOMS, REGLES: REGLES, decoder: decoder, diagnostiquer: diagnostiquer };
})(typeof window !== 'undefined' ? window : globalThis);
