# Yaksan (apprenti 2) – suivi (au 11 novembre 2026)

> **19/11/2026 : changement de projet.** Tout ce qui suit concerne l'ancien projet « Boîte noire du poste », abandonné. Nouveau projet : `nouveau-projet-carte.md` (carte agent : PC + imprimante).
>
> **19/11 (suite)** : le tuteur a cité ALCASAR → piste prioritaire `piste-alcasar.md`. Pistes de secours : carte + imprimante, borne USB.
>
> Prochaines étapes du nouveau projet :
> - [ ] Valider l'ébauche (V1/V2, heures détaillées)
> - [ ] Banc d'essai avant le lancement : carte hybride PIV + DESFire, lecture par Windows, DESFire AES sur ESP32
> - [ ] Les trois livrables à refaire : page HTML, formulaire académique (remplace celui envoyé le 12/11), présentation 3Blue1Brown
> - [ ] Valider la physique (sans-contact) avec le collègue de physique

## ⏳ En attente : réponses du tuteur (visite)
Rien ne bouge sur le projet tant que ces réponses ne sont pas arrivées. Les donner à Claude telles quelles, même partielles.

| # | Question | Ce que la réponse décide |
|---|---|---|
| 1 | Postes fixes ou portables ? Quels voyants restent visibles ? | Fixes : 4 classes de panne gardées. Portables : plus de classe « coupure », surveillance de la batterie, volet physique à revoir. Voyant d'alimentation seul : P1 très court |
| 2 | Les périphériques USB sont-ils filtrés sur les postes ? | Non : boîtier USB tel quel. Oui : boîtier vu comme port série seul + liste blanche ; le diagnostic carte devient le cœur déployable |
| 3 | Comment arrivent les mises à jour (serveur interne, fenêtre horaire) ? | Moment où la LED s'allume, journal lu par le corrélateur, façon d'imiter la mise à jour sur la maquette ; la nuit → mémoire du récit prioritaire |
| 4 | Combien de temps prend aujourd'hui un incident de carte ? | Long : chaîne carte prioritaire + indicateur chronométré. Court : chaîne carte en extension |
| 5 | Le service accepterait-il un boîtier pilote sur 2 ou 3 postes ? | Oui : plan de déploiement dans le dossier. Non : preuve de concept, diagnostic carte seul déployable |

## À faire dès réception des réponses
- [ ] Version recentrée : V1 (boîtier + corrélateur + serveur) / V2 (chaîne carte + remèdes à paliers ; accueil et libre-service en scénarios)
- [ ] Indicateurs mesurables sur maquette (remplacer « arrêts forcés en baisse » et « temps de résolution divisé »)
- [ ] Physique réduite : P3 énergie + P4 carte vivante (principaux), P1 et P6 courts ; P2 et P5 supprimés
- [ ] Nouveau bilan d'heures (objectif V1 ≈ 113 h, V2 ≈ 35 h avec IA)
- [ ] Mettre à jour le formulaire académique (`fiche-academique/remplir_fiche.py`, `schemas.py`), régénérer DOCX + PDF
- [ ] Harmoniser la case « Projet développé : Entreprise » avec le texte « maquette au lycée »

## Autres points
- [x] Page HTML interactive : `livrables/page-html/boite-noire.html` (3 démos : corrélateur, chaîne de la carte, journal chaîné ; simulateur de réserve d'énergie ; testée dans un navigateur, ordinateur et téléphone)
- [x] Présentation 3Blue1Brown : `livrables/powerpoint-3b1b/Projet_E6_Yaksan_3b1b.pptx` (34 diapositives, 385 animations au clic, notes de l'orateur ; reconstruire avec `build.sh`)
- [ ] Relire les deux livrables ; la partie « solutions existantes » est écrite de mémoire et à vérifier (point « appui long sur le bouton » de l'événement 41 de Windows en particulier)
- [ ] Les deux livrables suivent les décisions du 11/11 (V1 ≈ 113 h, V2 ≈ 35 h, P3 et P4 principaux, pas de défi HMAC) : le formulaire académique doit être mis à jour pour être cohérent
- [ ] Titre du projet : « Boîte noire du poste » conservé dans les livrables ; proposition plus professionnelle à décider (« Analyse post-incident des postes de travail »)

- [ ] Confirmer que Yaksan = apprenti 2
- [ ] Compléter à la main dans le formulaire : adresse, site, téléphone, mail de l'entreprise ; nom et fonction du tuteur
- [ ] Validation de la réalisation au lycée par l'académie

## Décidé (11/11)
- [x] Répartition de la sécurité entre apprentis (voir `docs/apprentis.md`) : Yaksan **abandonne** le défi-réponse HMAC et la démonstration du faux boîtier (gardés par Lorenzo). Sa question de sécurité = **« quelqu'un a-t-il effacé ce qui s'est passé ? »** : journal chaîné, dernier haché envoyé au serveur, démonstration « ligne effacée détectée ».
- [ ] Reporter ce changement dans le formulaire académique (exigence E7, synoptique, séquence : étapes 4–5 « défi HMAC » à remplacer)

## Physique (à valider avec le collègue de physique)
- Garder : P3 énergie de secours et P4 carte vivante (principaux), P1 voyants et P6 horloges (courts).
- Abandonner : P2 échantillonnage et P5 signal de la carte (ATR).

## Décisions déjà proposées (revue du 11/11, à valider par l'enseignant)
- Extension « lien outil de tickets » supprimée (doublon apprenti 1)
- PKI de labo préparée par l'enseignant, comme le contrôleur de domaine (Yaksan l'exploite)
- Récit sur FRAM I²C (ou mémoire NVS) plutôt que microSD
- Dernier haché du journal chaîné envoyé au serveur à chaque lecture
- 8 h réservées à l'exploitation réseau (C10)
