# Projets E6 – BTS CIEL option A (session 2027)

Ce dépôt sert à concevoir et documenter les projets individuels E6 de 4 apprentis de BTS CIEL option A (Informatique et réseaux). L'utilisateur est leur enseignant (Elbashir). Il conçoit les projets à partir d'un besoin métier ou d'une proposition de valeur pour un service informatique, puis produit fiches, dossiers techniques, synthèses et supports de soutenance. Le besoin proposé par un apprenti ne doit pas être présenté comme déjà validé par l'entreprise.

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
- **Besoin réel, ou amélioration proposée au service et à faire valider ; réalisation envisagée au lycée** sur maquette. Aucune donnée réelle, aucun accès à la production, contexte anonymisé (pas de nom d'entreprise dans les dossiers).
- **Point réglementaire** : l'arrêté du 25 janvier 2023 indique « Pour les apprentis les projets doivent impérativement être développés dans l'entreprise ». La réalisation au lycée doit être **validée par l'académie** ; chaque dossier le dit.
- Matériel du lycée : PC Ubuntu, switchs HP ProCurve, routeurs Cisco ISR 4331, ESP32 et capteurs. **Pas de câblage 230 V. Pas de caméra filmant des personnes.**
- Les projets des 4 apprentis doivent rester **distincts** (voir `docs/apprentis.md`).
- Les apprentis utiliseront l'IA : appliquer `docs/charte-ia.md` (charge réaliste, liste rouge de sécurité, journal d'usage).

## Organisation du dépôt
- `docs/` : cadre E6, état des 4 projets, charte IA, sources vérifiées.
- `Projet apprenti 1/` : projet « Le service informatique augmenté » (décision du 16/11) ; `fiche-academique/`, `projet-v4/` (document de travail), `questions-jury/`, notes d'entretien ; anciennes versions (chariots, dossier V3) dans `archives/`.
- `Projet apprenti 2/` : synthèse de 3 pages (PDF), source du projet ; `fiche-academique/` ; `TODO.md`.
- `Projet apprenti 3/` : **CyberSentinel** (décision du 20/11) ; source actuelle : `projet-cybersentinel.md`, `TODO.md`, `livrables/animation-3d/maquette-3d.html`, `livrables/page-html/poste-attentif.html`. Les anciens DOCX/PDF/PPTX et dossiers V2 sont historiques/obsolètes.
- `Projet apprenti 4/` : fiche technique d'Aziza (PDF) et `apprentie4-aziza/` (spécification `projet.md`, décisions, questions de visite, TODO).
- `Projet apprenti 4/apprentie4-aziza/livrables/` : fichiers déjà produits (fiche signable, PowerPoint, présentation animée, scripts de génération).
- `.claude/commands/` : commandes réutilisables (revue critique d'un projet, contrôle d'un dossier).

## Mise en garde spécifique — Lorenzo (décision 20/11/2026)
- **Ne pas réintroduire** l’orchestration de mises à jour ou de logiciels dans CyberSentinel.
- Le radar LD2410/ESP32 protège une session Windows ; un **deuxième ESP32 + W5500** héberge un leurre HTTP faible interaction (imprimante fictive) sur LAN isolé.
- Une connexion au leurre **ne prouve pas** une intrusion. La supervision ne doit pas attribuer un événement réseau à une absence ou à un agent.
- Le verrouillage doit rester local même si le serveur Ubuntu tombe en panne.
- La maquette et la page HTML sont refaites ; **les anciens formulaires et PowerPoint de Lorenzo restent obsolètes**.
- Appliquer la charte « encre sur papier » (#F4F2EC, #ECE9E0, #16150F, #F6D77A ; Nunito) aux nouveaux supports. Aucun déploiement en production DGFiP.

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

## Design (décision du 20/11/2026)
- **Règle** : toute page ou composant HTML nouveau lie `theme.css` (racine du dépôt) et l'utilise. **Aucune couleur, police ou ombre en dur** : seulement les variables (`var(--papier)`, `var(--encre)`, `var(--ombre-douce)`…). Dans un SVG : `style="fill:var(--…)"`.
- **Source de vérité** : `theme.css` (palette, Nunito, rayons, ombres, composants, `@media print`). Changer une valeur = la changer là, nulle part ailleurs.
- **Identité** « encre sur papier », inspirée de lastbook.org : Nunito partout (h1 et titres de section en Black 1000, MAJUSCULES ; titres de cartes en 900) ; fond papier `#F4F2EC` ; cartes blanches arrondies à contour gris fin et ombre douce ; boutons pilule à contour encre et ombre décalée ; bandeau noir avec mots-clés jaunes ; section finale jaune.
- **Couleurs sémantiques** : rouge = danger/erreur, vert = validé, bleu = info, jaune = mise en avant. Texte rouge sur fond clair : `--rouge-texte` (AA).
- **Proscrits** : anciens verts/bleus/teals, Libre Baskerville, Inter, Space Grotesk, IBM Plex Sans/Mono, Barlow, Atkinson, Bricolage, STIX, JetBrains Mono ; modes sombres des pages claires ; styles « vintage » ou « plat moderne ».
- **Contraintes** : responsive testé à 375, 768 et 1280 px ; contrastes AA (attention : `--encre-3` sur `--papier-2` < 4,5 → utiliser `--encre-2`) ; documents A4 : vérifier le nombre de pages ; schémas réseau avec **images réalistes de matériel** (vrais switchs, routeurs, PC, serveurs), pas de pictogrammes.
- **Exception** : les scènes 3D (maquettes, quartier) et la présentation 3B1B gardent leur fond sombre ; seule leur interface suit la charte (Nunito, boutons pilule). Elles ne lient pas `theme.css` (sa base claire casserait la scène).

### Composants existants (à réutiliser, ne pas recréer)
| Composant | Classe | Remarque |
|---|---|---|
| Carte | `.carte` (alias `.card`) | variantes `.plate`, `.a-venir`, + `.danger/.succes/.info/.accent` (filet en haut) |
| Tag | `.tag` (alias `.pill`) | variantes `.papier`, `.jaune`, `.info`, `.danger`, `.succes` |
| Bouton | `.bouton` (alias `.btn`) | `.principal` (encre), `.jaune`, `.petit` ; `aria-pressed="true"` = jaune |
| Bandeau de sous-titres | `.bandeau` | fond encre ; `<b>`/`<strong>`/`.cle` en jaune |
| Section finale | `.section-finale` | fond jaune |
| Étiquette | `.label` (alias `.eyebrow`, `.kicker`) | gris, gras, majuscules espacées |
| Encadré | `.encadre` (alias `.callout`) | + classe sémantique pour la couleur du filet |
| Note | `.note` | papier jaune pâle |
| Terminal | `.terminal` | bloc de code sombre |
| Zone secondaire | `.zone-2` | fond `--papier-2` |
| Dessin au trait | `.trait` (SVG) | trait encre, `--trait` |
