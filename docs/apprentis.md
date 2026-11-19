# Les 4 projets E6 : état au 11 novembre 2026

> **19/11/2026, décision de l'enseignant** : **Yaksan (2)** change de projet. La « Boîte noire du poste » est abandonnée. Nouveau projet (ébauche) : **une carte agent pour le PC (session, navigateur) et pour l’imprimante (impression sécurisée)**, plus une station qui dit pourquoi la carte ne marche pas. Pas de porte. Frontière avec Wassim : Wassim = « l’imprimante marche-t-elle ? », Yaksan = « qui récupère le document ? ». Voir `Projet apprenti 2/nouveau-projet-carte.md`. Les 5 questions de visite sont mises de côté.
>
> **16/11/2026, décision de l'enseignant** : le projet de **Wassim (1)** devient « **Le service informatique augmenté** : de l'imprimante muette au PC du nouveau médecin ». **Plus de chariots.** Boîtier de l'imprimante à quatre témoins (vibration, feuilles, SNMP, PC lu par PowerShell/JEA) + GLPI à paliers + tableau de bord ; V2 : RFID (carte du technicien, preuve de réparation, station des PC neufs avec PowerShell). **Windows 11 Famille ne rejoint aucun domaine** : AD simulé par **Samba sur Ubuntu**, PC Windows en machines virtuelles Windows 11 Entreprise (évaluation) ou Windows 11 Pro. Formulaire académique refait (15 p.), questions du jury refaites, document de travail `Projet apprenti 1/projet-v4/` (12 p.). L'ancien formulaire (chariots, envoyé le 12/11) est dans `Projet apprenti 1/archives/` : **demander à l'inspection s'il peut être remplacé**.
>
> **16/11/2026** : entretien avec **Wassim (1)** : « les chariots, il n'y a pas de problème » ; ses vraies pannes sont les **imprimantes** ; il prépare aussi les PC des nouveaux médecins (domaine, AD, script). Notes : `Projet apprenti 1/entretien-wassim-2026-11-16.md`.
>
> **18/11/2026, décision de l'enseignant** : chez **Lorenzo (3)**, la partie AD (domaine, GPO, LAPS, Kerberos/LDAP) passe **en extension, si le temps le permet**. En V1, le poste est hors domaine et le filet de sécurité vient d'une stratégie locale. Formulaire, schémas, page HTML et présentation mis à jour.

> **16/11/2026** : entretien avec le tuteur de **Lorenzo (3)** : besoins confirmés, parc de portables, règle « 2 ou 3 refus puis mise à jour forcée ». Formulaire à corriger avant envoi : voir `Projet apprenti 3/entretien-tuteur-2026-11-16.md`.
>
> **Mise à jour du 12/11/2026 (dite par l'enseignant)** : les formulaires académiques de **Yaksan (2)**, **Aziza (4)** et **Wassim (1)** sont **envoyés**. Il ne reste que **Lorenzo (3)**.
> - Lorenzo, contrôle du 12/11 : formulaire prêt à envoyer (13 p., parties 1 à 6 remplies, schémas SysML et Gantt lisibles, mêmes choix que les formulaires déjà envoyés). Restent à écrire à la main : adresse, site, téléphone, mail de l'entreprise ; nom et fonction du tuteur.
> - Lorenzo, 12/11 : **récit refait pour des postes de bureau** (précision de l'enseignant : Lorenzo intervient surtout sur des PC d'employés de bureau ; l'accueil n'est qu'un cas particulier). Risque principal : session ouverte, vue ou utilisée par un collègue non habilité, un visiteur ou un prestataire. Martine devient gestionnaire en bureau partagé ; l'« usager au guichet » devient « collègue de passage » (essais R2–R3 : bureau voisin, allée). Formulaire, présentation et page HTML mis à jour. Nouveau lien de la page : https://claude.ai/artifact/3Bhga5UmEr3r67mo6Wus3j (l'ancien lien n'est plus accessible). Titre : à choisir (« Poste attentif » gardé en attendant).
> - Présentation 3Blue1Brown de Lorenzo : rendu vérifié avec LibreOffice (30 diapositives, aucun débordement visible). Les animations au clic restent à voir dans PowerPoint.
> - Wassim : projet **réalisé au lycée, avec le matériel du lycée** (GLPI de laboratoire, PC Windows de test, ESP32). Aucun accès à l'hôpital.
> - Wassim, historique du 12/11 : le matin, le banc de mesure de batterie est jugé **artificiel** et l'option C (volet physique du côté du Wi-Fi des chariots, doublon avec Aziza accepté) est retenue. L'après-midi, elle est **remplacée** par « Supervision instrumentée des chariots de soins » (voir le tableau ci-dessous).

| Apprenti | Entreprise (à anonymiser) | Missions | Projet retenu | État |
|---|---|---|---|---|
| 1 Wassim (tuteur M. Goussard) | Hôpital | technicien support, déploiement | « Le service informatique augmenté : de l'imprimante muette au PC du nouveau médecin » (décision du 16/11) : boîtier ESP32 sur l'imprimante (vibration, feuilles, bouton, écran à encre) ; serveur qui compare quatre témoins (vibration, feuilles, SNMP, file d'impression du PC par JEA) et lit l'AD Samba ; ticket GLPI à paliers ; V2 : RFID et station des PC neufs (PowerShell). | Formulaire académique refait le 16/11 (`Projet apprenti 1/fiche-academique/`). Anciennes versions dans `archives/`. |
| 2 (Yaksan, prénom à confirmer) | Ministère de l'Intérieur (service carrière et paye) | support, accueil des nouveaux usagers | **Nouveau (19/11)** : « La carte agent, du poste à l'imprimante » : connexion par carte (certificat PIV) au portail de labo ; station de diagnostic (courant de la puce + maillons PowerShell) ; impression retenue sur CUPS et libérée par la carte sans contact ; journal chaîné. Ancien projet « Boîte noire du poste » abandonné. | Ébauche : `Projet apprenti 2/nouveau-projet-carte.md`. Formulaire envoyé le 12/11 (boîte noire) **à remplacer**. Page HTML et présentation de la boîte noire : obsolètes. |
| 3 (Lorenzo) | DGFIP | installation de logiciels chez les nouveaux agents, AD/GPO, serveurs ; surtout des PC d'employés de bureau | « Poste attentif » : radar 24 GHz de présence + LED ; verrouillage, installations et maintenance pendant les absences, veille du soir. | Dossier V2 fait (`Projet apprenti 3/`). Badge Bluetooth et PZEM abandonnés. Revue du 11/11 : trop gros (≈ 178 h avec IA), une faille (messages du boîtier non signés), recentrage **validé le 11/11** : voir `Projet apprenti 3/TODO.md`. Formulaire académique rempli et page de présentation faite (`Projet apprenti 3/fiche-academique/`, `livrables/page-html/`). |
| 4 (Aziza) | SNCF, maintenance des équipements de télécommande du réseau électrique | suivi Excel, montage/maintenance de PC, câblage, programmation des installations, archivage, sensibilisation cyber | « Des PC de maintenance à jour, des documents archivés, un parc tracé » | Fiche à signer le 12/11 ; fiche technique faite ; dossier complet à produire. Voir `Projet apprenti 4/apprentie4-aziza/`. |

## Livrables (3 documents par apprenti, décision du 11/11)
| Apprenti | Page HTML (enseignant) | Formulaire académique | Présentation 3Blue1Brown |
|---|---|---|---|
| 1 Wassim | à faire | refait le 16/11 (`fiche-academique/`, 15 p.) ; l'ancien (chariots) a été envoyé le 12/11 | à faire |
| 2 Yaksan | à refaire (nouveau projet du 19/11) | à refaire (nouveau projet du 19/11) | à refaire (nouveau projet du 19/11) |
| 3 Lorenzo | fait (`livrables/page-html/poste-attentif.html`) | fait (`fiche-academique/`) | fait (`livrables/powerpoint-3b1b/`) |
| 4 Aziza | fait (`livrables/pages-html/vue-ensemble.html`) | fait (`livrables/fiche-academique/`) | fait (`livrables/powerpoint-3b1b/`) |

## Choix communs
- Contrôleur de domaine commun à la maquette, préparé une fois, utilisé par plusieurs apprentis.
- Démarche : l'enseignant demande au tuteur les tâches et outils de l'apprenti, conçoit le projet, renvoie une fiche de présentation à signer et cacheter.
- Ne pas trop solliciter les tuteurs : hypothèses écrites dans la fiche, questions de vive voix lors d'une visite.

## Pour éviter les doublons
- Apprenti 1 = pannes d'imprimante vues par un boîtier et comparées à SNMP et au PC, ticket GLPI ; station RFID des PC neufs (V2). Apprenti 3 installe aussi des logiciels pour les nouveaux agents : chez Wassim, la préparation est déclenchée par des cartes et suivie dans GLPI. Apprentie 4 = distribution de fichiers validés vers des PC nomades.
- Apprenti 2 (depuis le 19/11) = carte agent : connexion au PC et impression sécurisée (confidentialité de ce qui sort de l'imprimante). Apprenti 1 = pannes de l'imprimante (disponibilité) et carte du technicien. Yaksan ne fait ni détection de panne, ni GLPI, ni SNMP de supervision.
- Apprenti 3 = présence et absences au poste ; apprentie 4 = état des PC avant une intervention.

### Répartition de la sécurité (décidée le 11/11/2026)
Chaque apprenti garde **une seule** question de sécurité, pour que la commission ne voie pas deux fois la même démonstration.

| Apprenti | Sa question de sécurité | Ce qu'il garde | Ce qu'il laisse |
|---|---|---|---|
| 3 Lorenzo | « Ce boîtier est-il le vrai ? » | Défi-réponse HMAC, démonstration du faux boîtier ; chaque message du boîtier signé | Vérification d'authenticité des paquets (réduite à une liste de paquets en attente) ; sa question = **quand** installer |
| 2 Yaksan | « Quelqu'un a-t-il effacé ce qui s'est passé ? » | Journal chaîné, dernier haché envoyé au serveur ; démonstration « ligne effacée détectée » | Défi-réponse HMAC et démonstration du faux boîtier |
| 4 Aziza | « Ce fichier est-il le bon ? » | Catalogue signé, empreintes, numéro de version | Rien ne change |
| 1 Wassim | « Le diagnostic à distance peut-il faire plus que ce qu'on lui permet ? » | Point d'accès JEA (liste fermée, compte sans droit d'administrateur), démonstration « commande hors liste refusée et tracée » ; compte GLPI qui ne supprime rien et ne ferme qu'avec une preuve | La démonstration « carte RFID copiée » reste secondaire (proche de la question de Lorenzo) |

La physique de chaque projet n'est pas touchée par cette répartition.

## Préparation de l'oral : questions difficiles du jury (12/11)
Un PDF par apprenti : questions probables (à l'enseignant puis à l'apprenti), piège, réponse en mots simples, relance, preuve à montrer ; points à corriger avant l'oral ; lectures.
- Wassim : `Projet apprenti 1/questions-jury/Questions_jury_Wassim.pdf` (refait le 16/11 pour « Le service informatique augmenté »)
- Yaksan : `Projet apprenti 2/questions-jury/Questions_jury_Yaksan.pdf` (à revoir après les réponses du tuteur)
- Lorenzo : `Projet apprenti 3/livrables/questions-jury/Questions_jury_Lorenzo.pdf`
- Aziza : `Projet apprenti 4/apprentie4-aziza/livrables/questions-jury/Questions_jury_Aziza.pdf`
Contenu modifiable dans chaque `contenu.py` ; régénérer avec `python3 docs/questions-jury/generer.py` (nécessite `weasyprint`).
