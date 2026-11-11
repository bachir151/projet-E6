# Projets E6 – BTS CIEL option A (session 2027)

Ce dépôt sert à concevoir et documenter les projets individuels E6 de 4 apprentis de BTS CIEL option A (Informatique et réseaux). L'utilisateur est leur enseignant (Elbashir). Il conçoit les projets à partir du besoin exprimé par chaque tuteur d'entreprise, puis produit fiches, dossiers techniques, synthèses et supports de soutenance.

## Langue et style
- Tout est rédigé **en français**, avec des **mots simples** et des phrases courtes.
- L'enseignant aime les **analyses comparatives structurées** (tableaux avantages/inconvénients, multi-critères) avant de décider.
- Avant une décision coûteuse ou ambiguë, poser une question courte. Sinon, avancer et signaler les hypothèses prises.
- Vérifier les faits techniques et réglementaires, signaler ce qui n'a pas pu être vérifié, donner les prix en **ordres de grandeur** (« à confirmer »).

## Cadre E6 à respecter (voir `docs/cadre-E6.md`)
- Épreuve E6 « Valorisation de la donnée et cybersécurité », coefficient 7, oral d'1 h appuyé sur un projet d'environ **150 h**.
- Compétences évaluées : **C01** Communiquer, **C03** Gérer un projet, **C08** Coder, **C10** Exploiter un réseau informatique.
- **C10 = exploiter le réseau EN PLACE** (adressage, DHCP/DNS/NTP, protocoles, captures, supervision). Configurer VLAN, ACL ou 802.1X relève de C09 (E5) : ce n'est pas le cœur d'un projet E6.
- Un **professeur de physique** évalue aussi : vrai volet physique mesurable (étalonnage, incertitudes, modèle confronté aux mesures), utile au projet, jamais décoratif.
- Progression **V1 obligatoire / V2 visée / extensions**. **Paliers de sécurité** (simulation, confirmation humaine, automatique) dès que le système agit sur des machines.
- Besoin **chiffré** : hypothèses écrites et validées par le tuteur, indicateurs mesurés sur la maquette.

## Règles non négociables
- **Besoin issu de l'entreprise, réalisation au lycée** sur maquette. Aucune donnée réelle, aucun accès à la production, contexte anonymisé (pas de nom d'entreprise dans les dossiers).
- **Point réglementaire** : l'arrêté du 25 janvier 2023 indique « Pour les apprentis les projets doivent impérativement être développés dans l'entreprise ». La réalisation au lycée doit être **validée par l'académie** ; chaque dossier le dit.
- Matériel du lycée : PC Ubuntu, switchs HP ProCurve, routeurs Cisco ISR 4331, ESP32 et capteurs. **Pas de câblage 230 V. Pas de caméra filmant des personnes.**
- Les projets des 4 apprentis doivent rester **distincts** (voir `docs/apprentis.md`).
- Les apprentis utiliseront l'IA : appliquer `docs/charte-ia.md` (charge réaliste, liste rouge de sécurité, journal d'usage).

## Organisation du dépôt
- `docs/` : cadre E6, état des 4 projets, charte IA, sources vérifiées.
- `Projet apprenti 1/` : dossier V3 de Wassim (PDF, 24 p.) = **modèle du dossier complet**.
- `Projet apprenti 2/` : synthèse de 3 pages (PDF) = **modèle de la synthèse**.
- `Projet apprenti 3/` : dossier V2 de Lorenzo (PDF, 33 p.).
- `Projet apprenti 4/` : fiche technique d'Aziza (PDF) et `apprentie4-aziza/` (spécification `projet.md`, décisions, questions de visite, TODO).
- `Projet apprenti 4/apprentie4-aziza/livrables/` : fichiers déjà produits (fiche signable, PowerPoint, présentation animée, scripts de génération).
- `.claude/commands/` : commandes réutilisables (revue critique d'un projet, contrôle d'un dossier).

## Livrables : formats habituels
- **Fiche de présentation** : 1 page A4, à faire signer et cacheter par l'entreprise, avec la mention « besoin issu de l'entreprise, réalisation au lycée ».
- **Dossier complet** : PDF A4 portrait, même mise en page et même structure que le dossier V3 de l'apprenti 1 (couverture ; le projet en une minute ; pourquoi ce projet ; besoin chiffré ; architecture ; scénarios ; qui fait quoi ; briques expliquées ; étapes avec preuves ; logique logicielle ; montage physique et sécurité ; expériences de physique avec formules ; exploitation du réseau ; cybersécurité ; recette T01… ; planning 150 h ; budget ; risques et décisions ouvertes ; plan de déploiement ; annexes ; checklist de l'apprenti ; références).
- **Synthèse** : 3 pages, sur le modèle de celle de l'apprenti 2.
- Modèles : `Projet apprenti 1/projet_E6_apprenti_1_guide_complet_V3_WASSIM.pdf` (dossier) et `Projet apprenti 2/projet_E6_apprenti_2_boite_noire_synthese_3p.pdf` (synthèse).

## Outils de génération
- PDF : HTML + CSS puis `weasyprint` (voir `Projet apprenti 4/apprentie4-aziza/livrables/fiche/fiche.html`). Toujours vérifier le nombre de pages (`pdfinfo`) et le rendu (`pdftoppm`) avant de livrer.
- PowerPoint : `pptxgenjs` (voir `Projet apprenti 4/apprentie4-aziza/livrables/powerpoint/build.js`) puis `animate.py` pour les animations au clic.
- Présentation animée : page HTML autonome (`Projet apprenti 4/apprentie4-aziza/livrables/presentation-animee/presentation_3b1b.html`), navigation au clavier, touche N pour les notes.
