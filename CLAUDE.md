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
- `Projet apprenti 1/` : projet « Le service informatique augmenté » (décision du 16/11) ; `fiche-academique/`, `projet-v4/` (document de travail), `questions-jury/`, notes d'entretien ; anciennes versions (chariots, dossier V3) dans `archives/`.
- `Projet apprenti 2/` : synthèse de 3 pages (PDF), source du projet ; `fiche-academique/` ; `TODO.md`.
- `Projet apprenti 3/` : dossier V2 de Lorenzo (PDF, 33 p.), source du projet ; `fiche-academique/` ; `livrables/page-html/` ; `TODO.md`.
- `Projet apprenti 4/` : fiche technique d'Aziza (PDF) et `apprentie4-aziza/` (spécification `projet.md`, décisions, questions de visite, TODO).
- `Projet apprenti 4/apprentie4-aziza/livrables/` : fichiers déjà produits (fiche signable, PowerPoint, présentation animée, scripts de génération).
- `.claude/commands/` : commandes réutilisables (revue critique d'un projet, contrôle d'un dossier).

## Livrables : les trois documents par apprenti (décision du 11/11/2026)
Pour **chaque** apprenti, il faut ces trois documents, et seulement eux :
1. **Page HTML interactive** (pour l'enseignant) : comprendre le projet dans son ensemble et dans ses détails. Structure : problème de départ ; solutions existantes (ce qu'elles font bien, ce qui leur manque) ; solution de l'apprenti ; scénario concret avec un personnage ; schéma d'architecture ; puis sécurité, physique, vie privée, parcours V1/V2, en bref. Illustrations SVG, animations, mots simples. Modèle : `Projet apprenti 3/livrables/page-html/poste-attentif.html`.
2. **Formulaire académique rempli** (« Dossier de présentation et de validation du projet », `Fiche presentation projet E6-projet-IR v2.docx` dans le dossier de l'apprenti) : parties 1 à 6, partie 7 laissée à la commission ; DOCX + PDF ; schémas SysML et Gantt du 1er janvier au 15 mai. Modèle : `Projet apprenti 3/fiche-academique/` (`schemas.py`, `rendu.js`, `remplir_fiche.py`).
3. **Présentation style 3Blue1Brown** (PowerPoint, ou Beamer) : fond sombre, animations au clic, notes de l'orateur. Modèle : `Projet apprenti 4/apprentie4-aziza/livrables/powerpoint-3b1b/`.

**Plus de dossier complet ni de synthèse de 3 pages** : ils ne sont plus demandés. Les anciens dossiers (V3 de Wassim, V2 de Lorenzo, synthèse de l'apprenti 2) restent des sources, pas des livrables à mettre à jour.
La fiche d'une page à faire signer par l'entreprise reste utile quand le tuteur doit valider le besoin (cas d'Aziza).

État au 11/11 : voir le tableau « Livrables » dans `docs/apprentis.md`.

## Outils de génération
- PDF : HTML + CSS puis `weasyprint` (voir `Projet apprenti 4/apprentie4-aziza/livrables/fiche/fiche.html`). Toujours vérifier le nombre de pages (`pdfinfo`) et le rendu (`pdftoppm`) avant de livrer.
- PowerPoint : `pptxgenjs` (voir `Projet apprenti 4/apprentie4-aziza/livrables/powerpoint/build.js`) puis `animate.py` pour les animations au clic.
- Présentation animée : page HTML autonome (`Projet apprenti 4/apprentie4-aziza/livrables/presentation-animee/presentation_3b1b.html`), navigation au clavier, touche N pour les notes.
