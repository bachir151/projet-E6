# Projets E6 – BTS CIEL option A (session 2027)

Conception et documentation des projets individuels E6 de quatre apprentis de BTS CIEL option A (Informatique et réseaux). Les projets partent du besoin exprimé par chaque tuteur d'entreprise et sont réalisés **au lycée, sur maquette, avec des données fictives** (réalisation au lycée à faire valider par l'académie).

Épreuve E6 « Valorisation de la donnée et cybersécurité » : coefficient 7, oral d'1 h, projet d'environ 150 h. Compétences évaluées : C01, C03, C08, C10, plus un volet physique.

## Organisation

| Dossier | Contenu |
|---|---|
| `docs/` | Cadre E6, état des 4 projets, charte d'usage de l'IA, sources vérifiées |
| `Projet apprenti 1/` | Dossier V3 (modèle du dossier complet) |
| `Projet apprenti 2/` | Synthèse de 3 pages (modèle de synthèse) |
| `Projet apprenti 3/` | Dossier V2 |
| `Projet apprenti 4/` | Projet d'Aziza : fiche technique, fiche Word à remplir, `apprentie4-aziza/` |
| `.claude/commands/` | Commandes réutilisables (revue critique, contrôle d'un dossier) |
| `Journal.md` | Ce qui est fait et ce qui reste à faire |

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
