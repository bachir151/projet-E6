# Projets E6 – BTS CIEL option A (session 2027)

Conception et documentation des projets individuels E6 de quatre apprentis de BTS CIEL option A (Informatique et réseaux). Les projets partent d'un besoin ou d'une proposition de valeur adaptée au service d'entreprise, à faire valider et sont réalisés **au lycée, sur maquette, avec des données fictives** (réalisation au lycée à faire valider par l'académie).

Épreuve E6 « Valorisation de la donnée et cybersécurité » : coefficient 7, oral d'1 h, projet d'environ 150 h. Compétences évaluées : C01, C03, C08, C10, plus un volet physique.

## Organisation

| Dossier | Contenu |
|---|---|
| `docs/` | Cadre E6, état des 4 projets, charte d'usage de l'IA, sources vérifiées |
| `Projet apprenti 1/` | Dossier V3 (modèle du dossier complet) |
| `Projet apprenti 2/` | Station de contrôle des postes de Yaksan (24/11) ; ancien projet « Boîte noire » et pistes abandonnées dans `archives/` |
| `Projet apprenti 3/` | CyberSentinel de Lorenzo : projet, maquette 3D, page HTML et plan de travail (anciens livrables encore présents) |
| `Projet apprenti 4/` | Projet d'Aziza : fiche technique, fiche Word à remplir, `apprentie4-aziza/` |
| `.claude/commands/` | Commandes réutilisables (revue critique, contrôle d'un dossier) |
| `Journal.md` | Ce qui est fait et ce qui reste à faire |

## Projet de Lorenzo (apprenti 3) — CyberSentinel (20/11/2026)

**Nouveau périmètre :** protéger une session Windows par radar LD2410/ESP32 et détecter des interactions réseau avec un leurre HTTP imitant une imprimante (deuxième ESP32 + Ethernet W5500). Les événements techniques sont centralisés sur Ubuntu. Les mises à jour/installations ont été **abandonnées** dans ce projet.

- [Cahier des charges CyberSentinel](Projet%20apprenti%203/projet-cybersentinel.md)
- [Maquette 3D animée Three.js](Projet%20apprenti%203/livrables/animation-3d/maquette-3d.html)
- [Présentation HTML interactive](Projet%20apprenti%203/livrables/page-html/poste-attentif.html)
- [Plan de travail et tests](Projet%20apprenti%203/TODO.md)

**Statut :** prototypes visuels et documents texte remaniés, mais **aucune réalisation matérielle validée**. L'ancien formulaire académique DOCX/PDF, les questions du jury et l'ancien PowerPoint demeurent obsolètes ; ne pas les présenter comme les documents de la nouvelle version.

## Projet de Yaksan (apprenti 2) — station de contrôle des postes (24/11/2026)

Le PC affiche une couleur ou joue un son ; un capteur posé contre lui (ESP32 : couleur, micro, émetteur sonore) vérifie le résultat. On mesure le portable quand on le remet à un agent, on le remesure quand il est rendu, et on compare. Page de test web (rien à installer), station Ubuntu, rapports chaînés. Volet physique : luminance et gamma de l'écran, acoustique.

- [Cahier des charges](Projet%20apprenti%202/projet-station-controle.md) · [Suivi](Projet%20apprenti%202/TODO.md)
- Ancien projet « Boîte noire du poste » et pistes du 19/11 : `Projet apprenti 2/archives/`

**Statut :** projet validé par le tuteur ; les trois livrables sont à faire, le formulaire en premier (celui envoyé le 12/11 est à remplacer).

## Projet d'Aziza (apprentie 4)

« Des PC de maintenance à jour, des documents archivés, un parc tracé » : un kit de maintenance signé, distribué par la 4G à des PC Windows 11, vérifié par un agent PowerShell, et contrôlé au départ par une borne RFID (ESP32). Volet physique : temps d'attente avant d'allumer un PC sorti du froid (condensation).

- Spécification : `Projet apprenti 4/apprentie4-aziza/projet.md`
- Suivi : `Projet apprenti 4/apprentie4-aziza/TODO.md`
- Pages HTML : `livrables/pages-html/` (vue d'ensemble, partie physique)
- PowerPoint de soutenance : `livrables/powerpoint-3b1b/` (reconstruction : `build.sh`)
- Fiche de présentation d'une page : `livrables/fiche/`

## Outils
- PDF : HTML + CSS, puis `weasyprint`
- PowerPoint : `pptxgenjs`, puis `animate.py` pour les animations au clic
- Pages : HTML, CSS et JavaScript autonomes

## Confidentialité
Dépôt **privé**. Certains documents de travail citent les entreprises et les tuteurs : ils ne doivent pas être rendus publics. Les dossiers remis au jury sont anonymisés.
