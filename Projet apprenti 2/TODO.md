# Yaksan (apprenti 2) – suivi (au 11 novembre 2026)

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
- [ ] Confirmer que Yaksan = apprenti 2
- [ ] Compléter à la main dans le formulaire : adresse, site, téléphone, mail de l'entreprise ; nom et fonction du tuteur
- [ ] Validation de la réalisation au lycée par l'académie

## Décisions déjà proposées (revue du 11/11, à valider par l'enseignant)
- Extension « lien outil de tickets » supprimée (doublon apprenti 1)
- PKI de labo préparée par l'enseignant, comme le contrôleur de domaine (Yaksan l'exploite)
- Récit sur FRAM I²C (ou mémoire NVS) plutôt que microSD
- Dernier haché du journal chaîné envoyé au serveur à chaque lecture
- 8 h réservées à l'exploitation réseau (C10)
