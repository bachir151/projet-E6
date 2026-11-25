/* =====================================================================
   simulation.js — de la RÉALITÉ aux OBSERVATIONS
   1. physique(realite)  : ce qui arrive vraiment (pages sorties, état interne…)
   2. observer(scenario) : ce que le programme Python peut lire
      (CUPS, WinRM/JEA, ping, SNMP, MQTT), avec date et qualité.
      Une mesure absente vaut null (« inconnu »), jamais 0.
   3. evenements          : les messages échangés, pour l'animation et le journal.
   Le résultat « observations » ne contient AUCUN champ de la réalité.
   ===================================================================== */
(function (racine) {
  'use strict';
  var LABO = racine.LABO = racine.LABO || {};

  var FENETRE = 60;          // durée observée, en secondes après le clic sur Imprimer
  var DELAI_ATTENTE = 45;    // délai avant de soupçonner une imprimante figée (réglage de maquette, à confirmer)
  var PERIODE_SNMP = 5;      // lecture SNMP toutes les 5 s (guide § 11.7, à confirmer)
  var REPOS = { moy: 6, et: 1.2 };            // RMS au repos, en mg (simulé)
  var SEUIL = +(REPOS.moy + 5 * REPOS.et).toFixed(1); // seuil = moyenne + 5 écarts types (simulé)
  var T_SIGNAL = 25;         // instant du signalement
  var T_DIAG = 30;           // instant où le diagnostic interroge le PC

  /* petit générateur pseudo-aléatoire déterministe (mêmes courbes à chaque lecture) */
  function graine(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function hasard(seed) {
    var a = seed;
    return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function gauss(rnd) { var u = rnd() || 1e-9, v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

  /* ------------------------------------------------------------------
     1. Physique : ce qui se passe réellement
     ------------------------------------------------------------------ */
  function physique(r) {
    var usb = r.raccordement === 'usb';
    var p = {
      usb: usb,
      allumee: r.alimentation,
      lienEthernet: !usb && r.cableEthernet && r.alimentation,
      joignable: !usb && r.cableEthernet && r.alimentation && r.reseauAttendu,
      vueParPC: usb && r.cableUSB && r.alimentation,
      travailCree: r.pages > 0 && r.spouleur,
      pcBloque: false,          // le travail reste dans la file du PC
      cups: null,               // état du travail dans CUPS (imprimante réseau)
      recu: false,              // l'imprimante a reçu le travail
      tDebut: null,             // début de l'impression
      sorties: 0,               // pages réellement sorties
      erreur: null,             // erreur interne : 'papier', 'bourrage', 'toner'
      tErreur: null,
      tReprise: null,           // Nadia règle le problème
      historique: []            // [{t, pages}] pages sorties au fil du temps
    };
    if (!p.travailCree) return p;
    if (r.pilote === 'erreur') { p.pcBloque = true; return p; }

    var tArrivee;
    if (usb) {
      if (!p.vueParPC) { p.pcBloque = true; return p; }
      p.recu = true; tArrivee = 2;
    } else {
      p.cups = 'en attente';
      if (!p.joignable) return p;
      p.recu = true; tArrivee = 3;
    }

    function imprimer(t0, n) { for (var i = 1; i <= n; i++) p.historique.push({ t: t0 + 4 + 2 * i, pages: 1 }); }

    if (r.figee) { p.cups = usb ? null : 'terminé'; return p; }              // accepté dans la mémoire, rien ne sort
    if (r.toner <= 0) { p.erreur = 'toner'; p.tErreur = 0; if (!usb) p.cups = 'en cours (bloqué)'; return p; }
    if (!r.papier) {
      p.erreur = 'papier'; p.tErreur = tArrivee + 2; p.tDebut = tArrivee;
      if (!usb) p.cups = 'en cours (bloqué)';
      if (r.regleSurPlace) { p.tReprise = 40; imprimer(p.tReprise, r.pages); p.sorties = r.pages; if (!usb) p.cups = 'terminé'; }
      return p;
    }
    p.tDebut = tArrivee;
    if (r.bourrageApres != null) {
      imprimer(tArrivee, r.bourrageApres); p.sorties = r.bourrageApres;
      p.erreur = 'bourrage'; p.tErreur = tArrivee + 4 + 2 * r.bourrageApres + 1;
      if (!usb) p.cups = 'en cours (bloqué)';
      return p;
    }
    imprimer(tArrivee, r.pages); p.sorties = r.pages;
    if (!usb) p.cups = 'terminé';
    return p;
  }
  function sortiesAvant(p, t) { var n = 0; p.historique.forEach(function (h) { if (h.t <= t) n += h.pages; }); return n; }
  function impressionActive(p, t) {
    // moteurs en marche : préchauffage (4 s) puis 2 s par page
    if (p.tDebut == null) return false;
    var debut = p.tReprise != null ? p.tReprise : p.tDebut;
    var n = p.sorties;
    if (p.erreur === 'papier' && p.tReprise == null) return t >= p.tDebut && t < p.tDebut + 2; // tentative d'entraînement
    if (p.erreur === 'papier' && t < p.tReprise) return t >= p.tDebut && t < p.tDebut + 2;
    var fin = debut + 4 + 2 * n + (p.erreur === 'bourrage' ? 1 : 0);
    return t >= debut && t < fin;
  }

  /* ------------------------------------------------------------------
     2. Observations accessibles au programme
     ------------------------------------------------------------------ */
  var BITS = { papier: '40', bourrage: '04', toner: '10' }; // hrPrinterDetectedErrorState (RFC 3805 / HOST-RESOURCES-MIB)

  function observer(scenario) {
    var r = scenario.realite, D = LABO.DECOR, p = physique(r), rnd = hasard(graine(scenario.id));
    var o = {
      contexte: {   // vient de l'inventaire GLPI : connu à l'avance, ce n'est pas la cause
        imprimante: D.imprimante, raccordement: r.raccordement, ipAttendue: p.usb ? null : D.ipImprimante,
        pc: D.pc, boitier: D.boitier, profil: p.usb ? null : D.profil
      },
      meta: { fenetre_s: FENETRE, delaiAttente_s: DELAI_ATTENTE, periodeSnmp_s: PERIODE_SNMP, perime_s: 15, tDiag: T_DIAG },
      signalement: null, travail: null, pc: null, reseau: null, snmp: null, vibration: null, securite: []
    };

    /* signalement */
    if (scenario.canal !== 'aucun') {
      var textes = {
        bouton: 'Appui sur le bouton rouge du boîtier (signalement manuel)',
        telephone: 'Appel au service informatique : « L\'imprimante ne marche pas. »',
        glpi: 'Ticket GLPI : « Mon document ne sort pas. »'
      };
      o.signalement = { canal: scenario.canal, canalNom: { bouton: 'bouton rouge', telephone: 'téléphone', glpi: 'formulaire GLPI' }[scenario.canal], t: T_SIGNAL, texte: textes[scenario.canal] };
    }

    /* travail suivi par CUPS (imprimante réseau seulement : guide § 12.1) */
    if (!p.usb && p.cups) o.travail = { source: 'CUPS', id: 'IMP-CARDIO-118', pages: r.pages, etat: p.cups, t: 2 };

    /* témoin PC : WinRM/HTTPS 5986 + JEA, fonction fixe (contrat élargi PROPOSÉ) */
    if (!r.winrm) {
      o.pc = { statut: 'injoignable', detail: 'Pas de réponse sur TCP 5986 après 5 s', t: T_DIAG, donnees: null };
    } else {
      var d = { Printer: D.imprimante, QueueExists: true, PrinterStatus: 'Normal', SpoolerRunning: true, PendingJobs: 0, JobsInError: 0, ObservedAtUtc: '2026-11-24T08:10:30Z', Error: null };
      if (!r.spouleur) {
        d.SpoolerRunning = false; d.QueueExists = null; d.PrinterStatus = null; d.PendingJobs = null; d.JobsInError = null;
        d.Error = 'Spooler service not running: queue unreadable';
      } else if (p.pcBloque) {
        d.PendingJobs = 1;
        if (r.pilote === 'erreur') { d.JobsInError = 1; }
        else if (p.usb && !p.vueParPC) { d.PrinterStatus = 'Offline'; }
      } else if (p.usb && p.erreur) {
        d.PendingJobs = 1; d.PrinterStatus = 'Error';
      }
      o.pc = { statut: 'ok', t: T_DIAG, donnees: d };
    }
    if (r.commandeHorsListe) o.securite.push({ commande: 'Restart-Service -Name Spooler', resultat: 'refusé', trace: 'journal JEA (transcription) + journal local du serveur' });

    /* réseau en place : ping et ports (imprimante réseau) */
    if (p.usb) o.reseau = { applicable: false };
    else o.reseau = {
      applicable: true, cible: D.ipImprimante,
      ping: p.joignable ? { ok: true, ms: 1 } : { ok: false, ms: null },
      tcp631: p.joignable ? 'ouvert' : 'pas de réponse',
      tcp9100: p.joignable ? 'ouvert' : 'pas de réponse',
      t: T_DIAG
    };

    /* SNMP : relevés toutes les 5 s (imprimante réseau) */
    if (p.usb) o.snmp = { applicable: false };
    else {
      var releves = [];
      for (var t = 0; t <= FENETRE; t += PERIODE_SNMP) {
        if (!(p.joignable && r.agentSnmp)) { releves.push({ t: t, reponse: 'timeout' }); continue; }
        var err = null;
        if (p.erreur && t >= p.tErreur && !(p.tReprise != null && t >= p.tReprise)) err = p.erreur;
        var actif = impressionActive(p, t);
        releves.push({
          t: t, reponse: 'ok',
          sysDescr: 'HP LaserJet (profil simulé de maquette)',
          hrDeviceStatus: err ? 5 : 2,                      // 2 running, 5 down
          hrPrinterStatus: err ? 1 : (actif ? 4 : 3),       // 1 other, 3 idle, 4 printing
          erreursHex: err ? BITS[err] : '00',
          compteur: D.compteurInitial + sortiesAvant(p, t),  // prtMarkerLifeCount
          tonerNiveau: Math.max(0, Math.round(r.toner)),     // prtMarkerSuppliesLevel
          tonerMax: 100                                      // prtMarkerSuppliesMaxCapacity (unité selon le modèle)
        });
      }
      o.snmp = { applicable: true, releves: releves, version: 'SNMPv3 authPriv si possible (v2c en laboratoire)' };
    }

    /* vibration : boîtier ESP32 + MPU6050, résumé RMS par seconde, MQTT/TLS */
    var serie = [];
    for (var s = 0; s <= FENETRE; s++) {
      if (!r.boitierEnLigne) { serie.push({ t: s, rms: null }); continue; }
      var base = r.alimentation ? REPOS.moy : REPOS.moy - 1.5;     // sans ventilateur : un peu plus calme (non exploité)
      var v = base + REPOS.et * gauss(rnd) * 0.8;
      if (impressionActive(p, s)) {
        var debut = p.tReprise != null ? p.tReprise : p.tDebut;
        v = (s - debut < 4 ? 24 : 46) + 5 * gauss(rnd);
        if (p.erreur === 'papier' && (p.tReprise == null || s < p.tReprise)) v = 21 + 3 * gauss(rnd);
      }
      if (r.regleSurPlace && (s === 38 || s === 39)) v = 17 + 2 * gauss(rnd);     // Nadia ouvre le bac
      if (r.parasites && (s === 14 || s === 31 || s === 32 || s === 47)) v = 30 + 6 * gauss(rnd);
      serie.push({ t: s, rms: +Math.max(0.5, v).toFixed(1) });
    }
    o.vibration = {
      boitier: r.boitierEnLigne ? 'en_ligne' : 'hors_ligne',
      depuis: r.boitierEnLigne ? null : -600,
      capteur: 'MPU6050 (accéléromètre), acquisition à étalonner',
      unite: 'mg RMS', seuil: SEUIL, repos: REPOS, serie: serie, simule: true
    };

    return { observations: o, physique: p, evenements: evenements(scenario, o, p) };
  }

  /* ------------------------------------------------------------------
     3. Événements : ce qui circule, pour l'animation et le journal
     ------------------------------------------------------------------ */
  function evenements(sc, o, p) {
    var r = sc.realite, D = LABO.DECOR, E = [];
    function add(ev) { E.push(ev); return ev; }
    var json = function (x) { return JSON.stringify(x, null, 2); };

    /* ---- étape 1 : situation métier ---- */
    add({ etape: 1, type: 'scene', quoi: 'intro', t: -5, titre: D.personnage + ', ' + D.role, texte: sc.metier });
    if (r.pages > 0) {
      add({ etape: 1, type: 'scene', quoi: 'clic', t: 0, titre: 'Clic sur « Imprimer »', texte: r.pages + ' pages, document fictif.' });
      if (!r.spouleur) {
        add({ etape: 1, type: 'scene', quoi: 'erreur-pc', t: 0, titre: 'Windows ne propose plus l\'imprimante', texte: 'Le logiciel affiche une erreur : aucun travail n\'est créé.', ecran: 'Spouleur arrêté' });
      } else if (r.pilote === 'erreur') {
        add({ etape: 1, type: 'scene', quoi: 'erreur-pc', t: 1, titre: 'Le document reste dans la file', texte: 'Dans la file Windows : « Erreur – Impression ».', ecran: 'Erreur – file' });
      } else if (p.usb) {
        add({ etape: 1, type: 'flux', de: 'pc', vers: 'imp', proto: 'USB', port: 'câble USB', t: 1, statut: p.vueParPC ? 'ok' : 'echec',
          titre: 'Travail envoyé par USB', resume: p.vueParPC ? r.pages + ' pages vers l\'imprimante' : 'Périphérique absent : le travail reste dans la file',
          message: { langage: 'texte', texte: p.vueParPC ? 'Spouleur Windows → port USB001 → imprimante\nTravail n° 7, ' + r.pages + ' pages' : 'Spouleur Windows → port USB001\nPériphérique non connecté : travail n° 7 en attente' } });
      } else {
        add({ etape: 1, type: 'flux', de: 'pc', vers: 'srv', proto: 'IPP', port: 'TCP 631', t: 1, statut: 'ok',
          titre: 'Travail envoyé à la file CUPS', resume: r.pages + ' pages vers la file partagée IMP-CARDIO',
          message: { langage: 'http', texte: 'POST /printers/IMP-CARDIO HTTP/1.1   (IPP Print-Job)\nHost: srv2.wassim.internal:631\nrequesting-user-name: nadia\njob-name: (non conservé)\ncopies: 1 · pages: ' + r.pages } });
        add({ etape: 1, type: 'flux', de: 'srv', vers: 'imp', proto: 'IPP / 9100', port: 'TCP 9100', t: 3, statut: p.joignable ? 'ok' : 'timeout',
          titre: 'CUPS transmet à l\'imprimante', resume: p.joignable ? 'Travail transmis' : 'Pas de réponse de ' + D.ipImprimante + ' : le travail attend',
          message: { langage: 'bash', texte: '$ lpstat -o IMP-CARDIO\nIMP-CARDIO-118   nadia   ' + r.pages + ' pages   ' + (p.joignable ? 'transmis' : 'en attente : « The printer is not responding »') } });
      }
      if (p.recu) add({ etape: 1, type: 'scene', quoi: 'impression', t: 4, titre: titreImpression(r, p), texte: texteImpression(r, p) });
    } else {
      add({ etape: 1, type: 'scene', quoi: 'calme', t: 0, titre: 'Personne n\'imprime', texte: 'Le service est calme. L\'imprimante est au repos.' });
    }
    if (r.parasites) add({ etape: 1, type: 'scene', quoi: 'parasite', t: 14, titre: 'Un chariot cogne le meuble', texte: 'Trois chocs en une demi-minute. Aucune page demandée.' });

    var sig = o.signalement;
    if (sig) {
      if (sig.canal === 'bouton') add({ etape: 1, type: 'flux', de: 'esp', vers: 'srv', proto: 'MQTT/TLS', port: 'TCP 8883', t: T_SIGNAL, statut: 'ok',
        titre: 'Bouton rouge : signalement', resume: 'Événement manual_alert, QoS 1',
        message: { langage: 'json', texte: json({ schema: 1, device_id: D.boitier, boot_id: 'exemple-demarrage-001', sequence: 12, event_id: 'exemple-demarrage-001:12', type: 'manual_alert', uptime_ms: 42500 }) } });
      if (sig.canal === 'telephone') add({ etape: 1, type: 'scene', quoi: 'telephone', t: T_SIGNAL, titre: 'Nadia appelle le service', texte: 'Wassim saisit le ticket. Le diagnostic démarre.' });
      if (sig.canal === 'glpi') add({ etape: 1, type: 'flux', de: 'pc', vers: 'srv', proto: 'HTTPS', port: 'TCP 443', t: T_SIGNAL, statut: 'ok',
        titre: 'Ticket créé dans GLPI', resume: 'Formulaire GLPI : « Mon document ne sort pas »',
        message: { langage: 'texte', texte: 'Formulaire GLPI (navigateur, HTTPS)\nCatégorie : Imprimante\nÉquipement : IMP-CARDIO\nDescription : Mon document ne sort pas.' } });
    } else if (r.pages > 0) {
      add({ etape: 1, type: 'scene', quoi: 'pas-signal', t: 20, titre: 'Aucun signalement', texte: 'Le serveur vérifie quand même : CUPS lui a signalé un travail.' });
    }

    /* ---- étape 2 : le PC Windows (WinRM/HTTPS + JEA) ---- */
    var cmd = "Invoke-Command -ComputerName 'PC-SECRETARIAT.wassim.internal' -UseSSL `\n  -ConfigurationName 'WassimPrintRead' -ScriptBlock { Get-WassimQueueSummary }";
    add({ etape: 2, type: 'flux', de: 'srv', vers: 'pc', proto: 'WinRM/HTTPS + JEA', port: 'TCP 5986', t: T_DIAG, statut: o.pc.statut === 'ok' ? 'ok' : 'timeout',
      titre: 'Le serveur interroge le PC', resume: 'Fonction fixe Get-WassimQueueSummary, compte sans droit d\'administrateur',
      message: { langage: 'powershell', texte: '# client PSRP du serveur (équivalent PowerShell)\n' + cmd },
      reponse: o.pc.statut === 'ok' ? { langage: 'json', texte: json(o.pc.donnees) } : { langage: 'texte', texte: 'Délai dépassé : aucune réponse sur TCP 5986.\nTémoin PC = inconnu (pas « 0 document »).' } });
    o.securite.forEach(function (s) {
      add({ etape: 2, type: 'flux', de: 'srv', vers: 'pc', proto: 'WinRM/HTTPS + JEA', port: 'TCP 5986', t: T_DIAG + 2, statut: 'refuse',
        titre: 'Essai hors liste : refusé', resume: s.commande + ' → refusé et tracé',
        message: { langage: 'powershell', texte: "Invoke-Command ... -ConfigurationName 'WassimPrintRead' `\n  -ScriptBlock { " + s.commande + " }" },
        reponse: { langage: 'texte', texte: "Le terme « Restart-Service » n'est pas reconnu (session JEA restreinte).\nTracé : " + s.trace + '.\nV1 : lecture seule, aucune action à distance.' } });
    });

    /* ---- étape 3 : l'imprimante (réseau en place, SNMP) ---- */
    if (o.reseau.applicable) {
      var R = o.reseau;
      add({ etape: 3, type: 'flux', de: 'srv', vers: 'imp', proto: 'ICMP', port: 'ping', t: T_DIAG + 1, statut: R.ping.ok ? 'ok' : 'timeout',
        titre: 'Ping de l\'imprimante', resume: R.ping.ok ? 'Réponse en 1 ms' : 'Aucune réponse',
        message: { langage: 'bash', texte: '$ ping -c 3 -W 1 ' + R.cible + (R.ping.ok ? '\n3 packets transmitted, 3 received, 0% packet loss' : '\n3 packets transmitted, 0 received, 100% packet loss') } });
      add({ etape: 3, type: 'flux', de: 'srv', vers: 'imp', proto: 'TCP', port: '631 · 9100', t: T_DIAG + 2, statut: R.tcp631 === 'ouvert' ? 'ok' : 'timeout',
        titre: 'Ports d\'impression', resume: '631 (IPP) : ' + R.tcp631 + ' · 9100 : ' + R.tcp9100,
        message: { langage: 'bash', texte: '$ nc -zv -w 2 ' + R.cible + ' 631\n' + (R.tcp631 === 'ouvert' ? 'Connection succeeded' : 'timed out') + '\n$ nc -zv -w 2 ' + R.cible + ' 9100\n' + (R.tcp9100 === 'ouvert' ? 'Connection succeeded' : 'timed out') } });
      var dernier = o.snmp.releves[o.snmp.releves.length - 1];
      var oids = [
        ['sysDescr', '1.3.6.1.2.1.1.1.0'], ['hrDeviceStatus', '1.3.6.1.2.1.25.3.2.1.5.1'], ['hrPrinterStatus', '1.3.6.1.2.1.25.3.5.1.1.1'],
        ['hrPrinterDetectedErrorState', '1.3.6.1.2.1.25.3.5.1.2.1'], ['prtMarkerLifeCount', '1.3.6.1.2.1.43.10.2.1.4.1.1'],
        ['prtMarkerSuppliesLevel', '1.3.6.1.2.1.43.11.1.1.9.1.1'], ['prtMarkerSuppliesMaxCapacity', '1.3.6.1.2.1.43.11.1.1.8.1.1']
      ];
      add({ etape: 3, type: 'flux', de: 'srv', vers: 'imp', proto: 'SNMP', port: 'UDP 161', t: T_DIAG + 3, statut: dernier.reponse === 'ok' ? 'ok' : 'timeout',
        titre: 'Lecture SNMP (lecture seule)', resume: dernier.reponse === 'ok' ? 'État, erreurs, compteur, toner' : 'Délai dépassé : état et compteur inconnus',
        message: { langage: 'bash', texte: '$ snmpget -v3 -l authPriv -u supervision -t 2 -r 1 ' + R.cible + ' \\\n  ' + oids.map(function (x) { return x[1]; }).join(' \\\n  ') },
        reponse: dernier.reponse === 'ok'
          ? { langage: 'json', texte: json({ sysDescr: dernier.sysDescr, hrDeviceStatus: dernier.hrDeviceStatus, hrPrinterStatus: dernier.hrPrinterStatus, hrPrinterDetectedErrorState: '0x' + dernier.erreursHex, prtMarkerLifeCount: dernier.compteur, prtMarkerSuppliesLevel: dernier.tonerNiveau, prtMarkerSuppliesMaxCapacity: dernier.tonerMax }) }
          : { langage: 'texte', texte: 'Timeout: No Response from ' + R.cible + '\n→ « pas de réponse », jamais « imprimante éteinte ».' } });
    } else {
      add({ etape: 3, type: 'scene', quoi: 'snmp-na', t: T_DIAG + 1, titre: 'SNMP non applicable', texte: 'Imprimante USB : pas d\'adresse IP. Ni ping, ni SNMP. Le PC est le témoin principal.' });
    }

    /* ---- étape 4 : la mesure physique (MQTT/TLS) ---- */
    if (o.vibration.boitier === 'en_ligne') {
      var ech = o.vibration.serie.filter(function (x) { return x.t === T_DIAG - 1; })[0];
      add({ etape: 4, type: 'flux', de: 'esp', vers: 'srv', proto: 'MQTT/TLS', port: 'TCP 8883', t: T_DIAG - 1, statut: 'ok', repete: 3,
        titre: 'Vibration résumée, 1 message par seconde', resume: 'Sujet telemetry, QoS 0',
        message: { langage: 'json', texte: json({ schema: 1, device_id: D.boitier, boot_id: 'exemple-demarrage-001', sequence: 1290, type: 'vibration_rms', window_ms: 1000, rms_mg: ech.rms, uptime_ms: 1291000 }) } });
    } else {
      add({ etape: 4, type: 'flux', de: 'mqtt', vers: 'srv', proto: 'MQTT/TLS', port: 'TCP 8883', t: T_DIAG, statut: 'echec',
        titre: 'Boîtier hors ligne (dernière volonté)', resume: 'Sujet status conservé : offline depuis 10 min',
        message: { langage: 'json', texte: json({ schema: 1, device_id: D.boitier, status: 'offline', reason: 'last_will' }) } });
    }
    return E;
  }
  function titreImpression(r, p) {
    if (r.figee) return 'L\'imprimante accepte… et ne fait rien';
    if (p.erreur === 'toner') return 'L\'imprimante refuse : toner vide';
    if (p.erreur === 'papier') return 'L\'imprimante cherche une feuille';
    if (p.erreur === 'bourrage') return r.bourrageApres + ' pages, puis une feuille se coince';
    return 'Les ' + p.sorties + ' pages sortent';
  }
  function texteImpression(r, p) {
    if (r.figee) return 'Son écran affiche toujours « Prête ». Aucun moteur ne tourne.';
    if (p.erreur === 'toner') return 'Elle ne lance pas l\'impression.';
    if (p.erreur === 'papier') return p.tReprise != null ? 'Bac vide. Plus tard, Nadia remet du papier : tout sort.' : 'Le bac est vide. Les moteurs s\'arrêtent après 2 s.';
    if (p.erreur === 'bourrage') return 'Les moteurs s\'arrêtent net.';
    return 'Les moteurs tournent pendant ' + (4 + 2 * p.sorties) + ' s.';
  }

  LABO.SIM = { FENETRE: FENETRE, SEUIL: SEUIL, DELAI_ATTENTE: DELAI_ATTENTE, physique: physique, observer: observer };
})(typeof window !== 'undefined' ? window : globalThis);
