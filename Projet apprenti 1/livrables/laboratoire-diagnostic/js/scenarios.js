/* =====================================================================
   scenarios.js — LA RÉALITÉ SIMULÉE (cachée au moteur de règles)
   Un scénario décrit ce qui se passe VRAIMENT (câble, papier, spouleur…).
   Il ne décrit PAS les observations : simulation.js les calcule.
   Le champ « attendu » sert seulement aux tests et au bouton « Révéler » :
   regles.js ne le lit jamais.
   ===================================================================== */
(function (racine) {
  'use strict';
  var LABO = racine.LABO = racine.LABO || {};

  /* Réalité de base : une imprimante réseau de la cardiologie qui va bien. */
  var BASE = {
    raccordement: 'reseau',   // 'reseau' (Ethernet) ou 'usb' (branchée au PC)
    alimentation: true,       // l'imprimante est allumée
    cableEthernet: true,      // câble réseau de l'imprimante branché
    cableUSB: true,           // câble USB branché (imprimante USB)
    reseauAttendu: true,      // l'imprimante est sur le réseau prévu (sinon : autre VLAN)
    papier: true,             // il reste du papier
    bourrageApres: null,      // une feuille se coince après N pages
    toner: 62,                // niveau réel de toner, en %
    spouleur: true,           // service « Spouleur d'impression » de Windows démarré
    pilote: 'ok',             // 'ok' ou 'erreur' (pilote Windows défaillant)
    figee: false,             // micrologiciel bloqué : accepte le travail, n'imprime rien
    agentSnmp: true,          // l'agent SNMP de l'imprimante répond
    boitierEnLigne: true,     // boîtier ESP32 en ligne
    parasites: false,         // chocs extérieurs sur le meuble (chariot, tiroir)
    winrm: true,              // le point d'accès WinRM/JEA du PC répond
    pages: 5,                 // pages demandées par Nadia
    regleSurPlace: false,     // Nadia règle elle-même le problème (remet du papier)
    commandeHorsListe: false  // un essai de commande hors liste JEA (test T10)
  };

  /* Les personnages et le décor (anonymisé, fictif). */
  LABO.DECOR = {
    service: 'Cardiologie (fictif)',
    personnage: 'Nadia',
    role: 'secrétaire médicale',
    technicien: 'Wassim',
    pc: 'PC-SECRETARIAT',
    ipPc: '192.168.50.40',
    imprimante: 'IMP-CARDIO',
    ipImprimante: '192.168.50.30',
    serveur: 'srv2.wassim.internal',
    ipServeur: '192.168.50.20',
    boitier: 'boitier-cardio-01',
    profil: 'Profil HP (simulé)',
    compteurInitial: 48213
  };

  function sc(id, groupe, titre, metier, canal, diff, attendu) {
    var r = {}, k;
    for (k in BASE) r[k] = BASE[k];
    for (k in diff) r[k] = diff[k];
    return { id: id, groupe: groupe, titre: titre, metier: metier, canal: canal, realite: r, attendu: attendu };
  }

  /* canal du signalement : 'aucun', 'bouton' (bouton rouge du boîtier, MQTT),
     'telephone' (appel au service), 'glpi' (formulaire GLPI en HTTPS) */
  LABO.SCENARIOS = [
    sc('normal', 'Repère', 'Impression normale',
      'Nadia imprime un courrier de 5 pages. Tout sort. Personne ne se plaint ; le serveur suit quand même le travail.',
      'aucun', {}, { code: 'OK' }),

    sc('usb-ok', 'Repère', 'Imprimante USB : impression normale',
      'Au secrétariat d\'à côté, l\'imprimante est branchée en USB au PC. Nadia imprime 5 pages. Tout sort.',
      'aucun', { raccordement: 'usb' }, { code: 'OK' }),

    sc('usb-debranche', 'Raccordement', 'Câble USB débranché',
      'Le câble USB a été arraché en déplaçant le bureau. Nadia imprime : rien ne sort. Elle appelle le service informatique.',
      'telephone', { raccordement: 'usb', cableUSB: false }, { code: 'USB' }),

    sc('ethernet', 'Raccordement', 'Câble Ethernet débranché',
      'Le câble réseau de l\'imprimante a été débranché pendant le ménage. Nadia imprime : rien ne sort. Elle remplit un ticket GLPI.',
      'glpi', { cableEthernet: false }, { code: 'INJOIGNABLE', candidats: ['CABLE_RESEAU', 'ALIM', 'ADRESSAGE'] }),

    sc('eteinte', 'Raccordement', 'Imprimante éteinte',
      'Quelqu\'un a éteint l\'imprimante la veille au soir. Nadia imprime : rien ne sort. Elle appelle.',
      'telephone', { alimentation: false }, { code: 'INJOIGNABLE', candidats: ['CABLE_RESEAU', 'ALIM', 'ADRESSAGE'] }),

    sc('vlan', 'Raccordement', 'Mauvais VLAN',
      'Après un déménagement, l\'imprimante est branchée sur une prise d\'un autre service : elle est dans un autre VLAN. Nadia remplit un ticket.',
      'glpi', { reseauAttendu: false }, { code: 'INJOIGNABLE', candidats: ['CABLE_RESEAU', 'ALIM', 'ADRESSAGE'] }),

    sc('papier', 'Imprimante', 'Bac de papier vide',
      'Le bac est vide. Nadia imprime : rien ne sort. Elle appuie sur le bouton rouge du boîtier.',
      'bouton', { papier: false }, { code: 'PAPIER' }),

    sc('bourrage', 'Imprimante', 'Bourrage après 2 pages',
      'Une feuille humide se coince à la 3ᵉ page. Deux pages sortent, puis plus rien. Nadia appuie sur le bouton rouge.',
      'bouton', { bourrageApres: 2 }, { code: 'BOURRAGE' }),

    sc('toner', 'Imprimante', 'Toner épuisé',
      'La cartouche de toner est vide. L\'imprimante refuse d\'imprimer. Nadia appelle.',
      'telephone', { toner: 0 }, { code: 'TONER' }),

    sc('figee', 'Imprimante', 'Imprimante figée, mais « prête »',
      'Le micrologiciel de l\'imprimante est bloqué. Elle accepte le travail, affiche « Prête », mais n\'imprime rien. C\'est le cas décrit par Wassim.',
      'bouton', { figee: true }, { code: 'FIGEE' }),

    sc('resolu', 'Imprimante', 'Bac vide, réglé sur place',
      'Le bac est vide. Nadia appuie sur le bouton rouge, puis remet du papier elle-même avant l\'arrivée du technicien.',
      'bouton', { papier: false, regleSurPlace: true }, { code: 'RESOLU' }),

    sc('spouleur', 'Poste Windows', 'Spouleur Windows arrêté',
      'Le service « Spouleur d\'impression » du PC de Nadia s\'est arrêté. Son logiciel ne propose plus l\'imprimante. Elle appelle.',
      'telephone', { spouleur: false }, { code: 'SPOULEUR' }),

    sc('pilote', 'Poste Windows', 'Problème de pilote Windows',
      'Après une mise à jour, le pilote de l\'imprimante est abîmé. Le document reste en erreur dans la file du PC. Nadia remplit un ticket.',
      'glpi', { pilote: 'erreur' }, { code: 'PILOTE' }),

    sc('jea-refus', 'Poste Windows', 'Commande hors liste JEA (test T10)',
      'Même panne de spouleur. Cette fois, on essaie depuis le serveur de relancer le service à distance. Le point d\'accès JEA doit refuser.',
      'telephone', { spouleur: false, commandeHorsListe: true }, { code: 'SPOULEUR' }),

    sc('snmp-muet', 'Limites', 'SNMP muet, impression correcte',
      'Une mise à jour de l\'imprimante a désactivé son agent SNMP. Nadia imprime 5 pages : tout sort. Personne ne se plaint.',
      'aucun', { agentSnmp: false }, { code: 'OK', constat: 'SUPERVISION' }),

    sc('boitier-hs', 'Limites', 'Boîtier ESP32 hors ligne',
      'Le boîtier a perdu le Wi-Fi. En même temps, l\'imprimante est figée. Nadia appelle (le bouton rouge ne passe plus).',
      'telephone', { boitierEnLigne: false, figee: true }, { code: 'INCOMPLET', candidats: ['FIGEE'] }),

    sc('parasites', 'Limites', 'Vibrations parasites',
      'Personne n\'imprime. Un chariot de soins cogne trois fois le meuble de l\'imprimante. Le boîtier sent des secousses.',
      'aucun', { parasites: true, pages: 0 }, { code: 'RIEN', constat: 'PARASITE' }),

    sc('jea', 'Limites', 'Accès JEA indisponible',
      'Imprimante USB, câble débranché. Mais le PC ne répond pas au serveur (WinRM arrêté). Le seul témoin d\'une imprimante USB manque.',
      'telephone', { raccordement: 'usb', cableUSB: false, winrm: false }, { code: 'INDETERMINE' })
  ];

  LABO.scenario = function (id) {
    for (var i = 0; i < LABO.SCENARIOS.length; i++) if (LABO.SCENARIOS[i].id === id) return LABO.SCENARIOS[i];
    return null;
  };
})(typeof window !== 'undefined' ? window : globalThis);
