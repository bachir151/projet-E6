# Les 4 projets E6 : état au 11 novembre 2026

> **Mise à jour du 12/11/2026 (dite par l'enseignant)** : les formulaires académiques de **Yaksan (2)**, **Aziza (4)** et **Wassim (1)** sont **envoyés**. Il ne reste que **Lorenzo (3)**.
> - Lorenzo, contrôle du 12/11 : formulaire prêt à envoyer (13 p., parties 1 à 6 remplies, schémas SysML et Gantt lisibles, mêmes choix que les formulaires déjà envoyés). Restent à écrire à la main : adresse, site, téléphone, mail de l'entreprise ; nom et fonction du tuteur.
> - Lorenzo, 12/11 : **récit refait pour des postes de bureau** (précision de l'enseignant : Lorenzo intervient surtout sur des PC d'employés de bureau ; l'accueil n'est qu'un cas particulier). Risque principal : session ouverte, vue ou utilisée par un collègue non habilité, un visiteur ou un prestataire. Martine devient gestionnaire en bureau partagé ; l'« usager au guichet » devient « collègue de passage » (essais R2–R3 : bureau voisin, allée). Formulaire, présentation et page HTML mis à jour. Nouveau lien de la page : https://claude.ai/artifact/3Bhga5UmEr3r67mo6Wus3j (l'ancien lien n'est plus accessible). Titre : à choisir (« Poste attentif » gardé en attendant).
> - Présentation 3Blue1Brown de Lorenzo : rendu vérifié avec LibreOffice (30 diapositives, aucun débordement visible). Les animations au clic restent à voir dans PowerPoint.

| Apprenti | Entreprise (à anonymiser) | Missions | Projet retenu | État |
|---|---|---|---|---|
| 1 (tuteur M. Goussard) | Hôpital | technicien support, déploiement | « Assistance automatisée » : courriel → ticket GLPI → diagnostic PowerShell à distance ; banc de mesure de batterie de portable (ESP32 + INA226). V4 recentrée sur l'autonomie des portables de chariot. | Dossier V3 fait ; V4 + synthèse 3 p. à finir. Volet Wi-Fi non tranché (doublon possible avec l'apprentie 4). |
| 2 (Yaksan, prénom à confirmer) | Ministère de l'Intérieur (service carrière et paye) | support, accueil des nouveaux usagers | « Boîte noire du poste » : boîtier ESP32 témoin des pannes et des mises à jour ratées ; diagnostic de la chaîne carte → navigateur. Utilise le contrôleur de domaine commun de la maquette sans l'administrer. | Synthèse faite ; formulaire académique rempli (`Projet apprenti 2/fiche-academique/`). Revue du 11/11 : trop gros (≈ 183 h avec IA) → recentrage proposé. **En attente des réponses du tuteur aux 5 questions de visite** (voir `Projet apprenti 2/TODO.md`). |
| 3 (Lorenzo) | DGFIP | installation de logiciels chez les nouveaux agents, AD/GPO, serveurs ; surtout des PC d'employés de bureau | « Poste attentif » : radar 24 GHz de présence + LED ; verrouillage, installations et maintenance pendant les absences, veille du soir. | Dossier V2 fait (`Projet apprenti 3/`). Badge Bluetooth et PZEM abandonnés. Revue du 11/11 : trop gros (≈ 178 h avec IA), une faille (messages du boîtier non signés), recentrage **validé le 11/11** : voir `Projet apprenti 3/TODO.md`. Formulaire académique rempli et page de présentation faite (`Projet apprenti 3/fiche-academique/`, `livrables/page-html/`). |
| 4 (Aziza) | SNCF, maintenance des équipements de télécommande du réseau électrique | suivi Excel, montage/maintenance de PC, câblage, programmation des installations, archivage, sensibilisation cyber | « Des PC de maintenance à jour, des documents archivés, un parc tracé » | Fiche à signer le 12/11 ; fiche technique faite ; dossier complet à produire. Voir `Projet apprenti 4/apprentie4-aziza/`. |

## Livrables (3 documents par apprenti, décision du 11/11)
| Apprenti | Page HTML (enseignant) | Formulaire académique | Présentation 3Blue1Brown |
|---|---|---|---|
| 1 Wassim | à faire | à faire | à faire |
| 2 Yaksan | à faire (après les réponses du tuteur) | fait, à mettre à jour (recentrage, journal chaîné) | à faire |
| 3 Lorenzo | fait (`livrables/page-html/poste-attentif.html`) | fait (`fiche-academique/`) | fait (`livrables/powerpoint-3b1b/`) |
| 4 Aziza | fait (`livrables/pages-html/vue-ensemble.html`) | fait (`livrables/fiche-academique/`) | fait (`livrables/powerpoint-3b1b/`) |

## Choix communs
- Contrôleur de domaine commun à la maquette, préparé une fois, utilisé par plusieurs apprentis.
- Démarche : l'enseignant demande au tuteur les tâches et outils de l'apprenti, conçoit le projet, renvoie une fiche de présentation à signer et cacheter.
- Ne pas trop solliciter les tuteurs : hypothèses écrites dans la fiche, questions de vive voix lors d'une visite.

## Pour éviter les doublons
- Apprenti 1 = diagnostic à distance déclenché par un ticket ; apprentie 4 = distribution de fichiers validés vers des PC nomades.
- Apprenti 2 = observe les mises à jour Windows ratées ; apprentie 4 = ne parle pas de « mises à jour Windows » mais de « kit de maintenance » et de « fichiers métier ».
- Apprenti 3 = présence et absences au poste ; apprentie 4 = état des PC avant une intervention.

### Répartition de la sécurité (décidée le 11/11/2026)
Chaque apprenti garde **une seule** question de sécurité, pour que la commission ne voie pas deux fois la même démonstration.

| Apprenti | Sa question de sécurité | Ce qu'il garde | Ce qu'il laisse |
|---|---|---|---|
| 3 Lorenzo | « Ce boîtier est-il le vrai ? » | Défi-réponse HMAC, démonstration du faux boîtier ; chaque message du boîtier signé | Vérification d'authenticité des paquets (réduite à une liste de paquets en attente) ; sa question = **quand** installer |
| 2 Yaksan | « Quelqu'un a-t-il effacé ce qui s'est passé ? » | Journal chaîné, dernier haché envoyé au serveur ; démonstration « ligne effacée détectée » | Défi-réponse HMAC et démonstration du faux boîtier |
| 4 Aziza | « Ce fichier est-il le bon ? » | Catalogue signé, empreintes, numéro de version | Rien ne change |

La physique de chaque projet n'est pas touchée par cette répartition.
