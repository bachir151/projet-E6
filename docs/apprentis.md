# Les 4 projets E6 : état au 11 novembre 2026

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
| 1 Wassim (tuteur M. Goussard) | Hôpital | technicien support, déploiement | « Supervision instrumentée des chariots de soins : de la coupure au ticket » (titre choisi le 12/11) : boîtier ESP32 sur le chariot (secousses MPU6050, 5 V de l'USB INA219, température SHT31) ; diagnostic PowerShell à distance (WinRM + JEA) au redémarrage ; ticket GLPI à paliers ; bilan « adopter ou non ». | Projet du 12/11 retenu tel quel par l'enseignant. Formulaire académique rempli (`Projet apprenti 1/fiche-academique/`). Le dossier V3 reste une source. |
| 2 (Yaksan, prénom à confirmer) | Ministère de l'Intérieur (service carrière et paye) | support, accueil des nouveaux usagers | « Boîte noire du poste » : boîtier ESP32 témoin des pannes et des mises à jour ratées ; diagnostic de la chaîne carte → navigateur. Utilise le contrôleur de domaine commun de la maquette sans l'administrer. | Synthèse faite ; formulaire académique rempli (`Projet apprenti 2/fiche-academique/`). Revue du 11/11 : trop gros (≈ 183 h avec IA) → recentrage proposé. **En attente des réponses du tuteur aux 5 questions de visite** (voir `Projet apprenti 2/TODO.md`). |
| 3 (Lorenzo) | DGFIP | installation de logiciels chez les nouveaux agents, AD/GPO, serveurs ; surtout des PC d'employés de bureau | « Poste attentif » : radar 24 GHz de présence + LED ; verrouillage, installations et maintenance pendant les absences, veille du soir. | Dossier V2 fait (`Projet apprenti 3/`). Badge Bluetooth et PZEM abandonnés. Revue du 11/11 : trop gros (≈ 178 h avec IA), une faille (messages du boîtier non signés), recentrage **validé le 11/11** : voir `Projet apprenti 3/TODO.md`. Formulaire académique rempli et page de présentation faite (`Projet apprenti 3/fiche-academique/`, `livrables/page-html/`). |
| 4 (Aziza) | SNCF, maintenance des équipements de télécommande du réseau électrique | suivi Excel, montage/maintenance de PC, câblage, programmation des installations, archivage, sensibilisation cyber | « Des PC de maintenance à jour, des documents archivés, un parc tracé » | Fiche à signer le 12/11 ; fiche technique faite ; dossier complet à produire. Voir `Projet apprenti 4/apprentie4-aziza/`. |

## Livrables (3 documents par apprenti, décision du 11/11)
| Apprenti | Page HTML (enseignant) | Formulaire académique | Présentation 3Blue1Brown |
|---|---|---|---|
| 1 Wassim | à faire | fait (`fiche-academique/`, 15 p.) | à faire |
| 2 Yaksan | à faire (après les réponses du tuteur) | fait, à mettre à jour (recentrage, journal chaîné) | à faire |
| 3 Lorenzo | fait (`livrables/page-html/poste-attentif.html`) | fait (`fiche-academique/`) | fait (`livrables/powerpoint-3b1b/`) |
| 4 Aziza | fait (`livrables/pages-html/vue-ensemble.html`) | fait (`livrables/fiche-academique/`) | fait (`livrables/powerpoint-3b1b/`) |

## Choix communs
- Contrôleur de domaine commun à la maquette, préparé une fois, utilisé par plusieurs apprentis.
- Démarche : l'enseignant demande au tuteur les tâches et outils de l'apprenti, conçoit le projet, renvoie une fiche de présentation à signer et cacheter.
- Ne pas trop solliciter les tuteurs : hypothèses écrites dans la fiche, questions de vive voix lors d'une visite.

## Pour éviter les doublons
- Apprenti 1 = diagnostic à distance déclenché par la coupure vue par le boîtier, ticket GLPI ; apprentie 4 = distribution de fichiers validés vers des PC nomades.
- Apprenti 2 = observe les mises à jour Windows ratées ; apprentie 4 = ne parle pas de « mises à jour Windows » mais de « kit de maintenance » et de « fichiers métier ».
- Apprenti 3 = présence et absences au poste ; apprentie 4 = état des PC avant une intervention.

### Répartition de la sécurité (décidée le 11/11/2026)
Chaque apprenti garde **une seule** question de sécurité, pour que la commission ne voie pas deux fois la même démonstration.

| Apprenti | Sa question de sécurité | Ce qu'il garde | Ce qu'il laisse |
|---|---|---|---|
| 3 Lorenzo | « Ce boîtier est-il le vrai ? » | Défi-réponse HMAC, démonstration du faux boîtier ; chaque message du boîtier signé | Vérification d'authenticité des paquets (réduite à une liste de paquets en attente) ; sa question = **quand** installer |
| 2 Yaksan | « Quelqu'un a-t-il effacé ce qui s'est passé ? » | Journal chaîné, dernier haché envoyé au serveur ; démonstration « ligne effacée détectée » | Défi-réponse HMAC et démonstration du faux boîtier |
| 4 Aziza | « Ce fichier est-il le bon ? » | Catalogue signé, empreintes, numéro de version | Rien ne change |
| 1 Wassim | « Le diagnostic à distance peut-il faire plus que ce qu'on lui permet ? » | Point d'accès JEA (liste fermée, compte sans droit d'administrateur), démonstration « commande hors liste refusée et tracée » ; compte GLPI qui ne supprime ni ne ferme rien | — |

La physique de chaque projet n'est pas touchée par cette répartition.

## Préparation de l'oral : questions difficiles du jury (12/11)
Un PDF par apprenti : questions probables (à l'enseignant puis à l'apprenti), piège, réponse en mots simples, relance, preuve à montrer ; points à corriger avant l'oral ; lectures.
- Wassim : `Projet apprenti 1/questions-jury/Questions_jury_Wassim.pdf` (source : dossier V3 ; à recaler sur la V4)
- Yaksan : `Projet apprenti 2/questions-jury/Questions_jury_Yaksan.pdf` (à revoir après les réponses du tuteur)
- Lorenzo : `Projet apprenti 3/livrables/questions-jury/Questions_jury_Lorenzo.pdf`
- Aziza : `Projet apprenti 4/apprentie4-aziza/livrables/questions-jury/Questions_jury_Aziza.pdf`
Contenu modifiable dans chaque `contenu.py` ; régénérer avec `python3 docs/questions-jury/generer.py` (nécessite `weasyprint`).
