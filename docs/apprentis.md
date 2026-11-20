# Les 4 projets E6 : état au 20 novembre 2026

> **20/11/2026 — NOUVEAU PÉRIMÈTRE LORENZO (3)** : « CyberSentinel ». La partie mises à jour/installations est abandonnée. Deux modules ESP32 : (1) radar LD2410 + verrouillage Windows ; (2) leurre HTTP de fausse imprimante sur ESP32 + Ethernet W5500. Supervision technique Ubuntu, tests sur LAN isolé du lycée. Source de référence : `Projet apprenti 3/projet-cybersentinel.md`. La nouvelle maquette 3D et la page HTML sont réécrites ; l'ancienne fiche académique et le PowerPoint **sont obsolètes** et doivent être régénérés avant toute remise. Les décisions plus anciennes, ci-dessous, sont conservées comme historique.
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
| 2 (Yaksan, prénom à confirmer) | Ministère de l'Intérieur (service carrière et paye) | support, accueil des nouveaux usagers | « Boîte noire du poste » : boîtier ESP32 témoin des pannes et des mises à jour ratées ; diagnostic de la chaîne carte → navigateur. Utilise le contrôleur de domaine commun de la maquette sans l'administrer. | Synthèse faite ; formulaire académique rempli (`Projet apprenti 2/fiche-academique/`). Revue du 11/11 : trop gros (≈ 183 h avec IA) → recentrage proposé. **En attente des réponses du tuteur aux 5 questions de visite** (voir `Projet apprenti 2/TODO.md`). |
| 3 (Lorenzo) | DGFiP | support aux postes, soclage, accompagnement des agents (contexte d’entreprise) | **« CyberSentinel »** : prévention de l'accès local par radar LD2410 + ESP32 et détection d'interactions réseau via un second ESP32 + W5500 jouant une fausse imprimante HTTP. Événements sur Ubuntu, essais en laboratoire. **Aucune mise à jour logicielle orchestrée.** | Maquette 3D et page HTML refaites le 20/11 ; [cahier des charges](../Projet%20apprenti%203/projet-cybersentinel.md) et [TODO](../Projet%20apprenti%203/TODO.md) à jour. Anciens DOCX/PDF/PPTX à refaire. |
| 4 (Aziza) | SNCF, maintenance des équipements de télécommande du réseau électrique | suivi Excel, montage/maintenance de PC, câblage, programmation des installations, archivage, sensibilisation cyber | « Des PC de maintenance à jour, des documents archivés, un parc tracé » | Fiche à signer le 12/11 ; fiche technique faite ; dossier complet à produire. Voir `Projet apprenti 4/apprentie4-aziza/`. |

## Livrables (3 documents par apprenti, décision du 11/11)
| Apprenti | Page HTML (enseignant) | Formulaire académique | Présentation 3Blue1Brown |
|---|---|---|---|
| 1 Wassim | à faire | refait le 16/11 (`fiche-academique/`, 15 p.) ; l'ancien (chariots) a été envoyé le 12/11 | à faire |
| 2 Yaksan | à faire (après les réponses du tuteur) | fait, à mettre à jour (recentrage, journal chaîné) | à faire |
| 3 Lorenzo | HTML CyberSentinel refait 20/11 (`livrables/page-html/poste-attentif.html`) | ancienne version **obsolète**, à refaire (`fiche-academique/`) | ancienne version **obsolète**, à refaire (`livrables/powerpoint-3b1b/`) |
| 4 Aziza | fait (`livrables/pages-html/vue-ensemble.html`) | fait (`livrables/fiche-academique/`) | fait (`livrables/powerpoint-3b1b/`) |

## Choix communs
- Contrôleur de domaine commun à la maquette, préparé une fois, utilisé par plusieurs apprentis.
- Démarche : l'enseignant demande au tuteur les tâches et outils de l'apprenti, conçoit le projet, renvoie une fiche de présentation à signer et cacheter.
- Ne pas trop solliciter les tuteurs : hypothèses écrites dans la fiche, questions de vive voix lors d'une visite.

## Pour éviter les doublons
- Apprenti 1 : imprimante réelle + diagnostic de pannes et GLPI. Apprenti 3 : **fausse imprimante exclusivement leurre**, sans impression ni diagnostic de panne ; protection par radar. Apprentie 4 : distribution de fichiers métier validés vers des PC nomades.
- Apprenti 2 = observe les mises à jour Windows ratées ; apprentie 4 = ne parle pas de « mises à jour Windows » mais de « kit de maintenance » et de « fichiers métier ».
- Apprenti 3 = verrouillage Windows par présence radar et interactions avec un leurre réseau autonome ; pas de suivi nominatif des présences.

### Répartition de la sécurité (décidée le 11/11/2026)
Chaque apprenti garde **une seule** question de sécurité, pour que la commission ne voie pas deux fois la même démonstration.

| Apprenti | Sa question de sécurité | Ce qu'il garde | Ce qu'il laisse |
|---|---|---|---|
| 3 Lorenzo | « Le boîtier radar est-il authentique ? Un accès au leurre est-il à qualifier ? » | HMAC + compteur pour le radar ; leurre HTTP faible interaction, événements minimaux, étude des faux positifs | Pas d'authentification de paquets d'installation, pas de fermeture d'applications, pas d'attribution de l'événement réseau à un agent |
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
