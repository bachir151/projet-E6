# Journal de travail – Projets E6

## Session du 11 novembre 2026 (suite) : formulaire académique d'Aziza

### Fait
- **Formulaire officiel rempli** (`Fiche presentation projet E6-projet-IR v2.docx`, modèle laissé intact) → `Projet apprenti 4/apprentie4-aziza/livrables/fiche-academique/Fiche_presentation_E6_Aziza.docx` et `.pdf` (14 pages). Parties 1 à 6 remplies ; partie 7 laissée à la commission.
- Choix de l'enseignant : nom réel (SNCF) dans les cases entreprise ; case « Projet développé : Entreprise » ; R1 fin janvier (29/01), R2 mi-mars (19/03), R3 mi-mai (14/05), remise avec la R3, soutenance en juin (date académique).
- Schémas produits (`schemas/`) : synoptique, diagrammes SysML d'exigences, de contexte, de cas d'utilisation et de séquence, Gantt du 1er janvier au 15 mai 2027. Pour tout reconstruire : `python3 schemas.py && node rendu.js && python3 remplir_fiche.py`, puis `soffice --headless --convert-to pdf`.
- Dossier complet : abandonné (pas nécessaire).

### À vérifier
- Compléter à la main : adresse, site, téléphone et mail de l'entreprise ; nom et fonction du tuteur.
- La case « Entreprise » est cochée alors que le texte parle d'une maquette au lycée : à harmoniser si la commission le demande.
- Ouvrir le DOCX dans Word : mettre à jour la table des matières (numéros de page) et vérifier les cases ☐/☒ (police Segoe UI Symbol).

## Session du 11 novembre 2026 (projet d'Aziza)

### Fait
- **Dépôt réorganisé** (par l'enseignant) : un dossier `Projet apprenti N/` par apprenti. `CLAUDE.md`, `docs/apprentis.md` et `TODO.md` mis à jour avec les nouveaux chemins. Les modèles sont dans `Projet apprenti 1/` (dossier V3) et `Projet apprenti 2/` (synthèse).
- **Revue critique du projet d'Aziza** : 3 failles corrigées dans `projet.md`, en version simple pour une 2e année :
  - numéro de version dans le catalogue signé : un ancien kit est refusé (T14) ;
  - `catalogue.json` placé dans le dossier signé ;
  - un jeton par PC (fichier protégé par les droits NTFS) et par borne (bibliothèque `Preferences` de l'ESP32). Un rapport sans jeton est refusé (T15).
- **Simplifications** :
  - V2 = archive seule, avec une recherche SQL `LIKE` au lieu de FTS5 ;
  - propositions des techniciens et boîtier de sacoche en extension ;
  - ADXL345 retiré du banc V1 ;
  - charge : V1 116 h, V2 20 h, total 136 h.
- **Partie physique simplifiée** (au sens de l'enseignant : tout ce qui touche à l'ESP32) :
  - borne RFID : ESP32, RC522, badge de l'agent, étiquette anti-métal sur le PC, LED, buzzer ;
  - banc de mesure : ESP32, SHT40, 2 × DS18B20 ;
  - expérience de condensation, si elle est confirmée à la visite, plus un test court RFID ;
  - plan B : le test RFID devient l'expérience principale ;
  - retirés : chute, énergie, formule LC.
- **Lien « 4G »** : une seule commande `tc netem` sur le serveur, sans routage. La vraie 4G sert à mesurer, netem sert à reproduire les mesures. Raison : C10 = exploiter le réseau en place, pas le configurer.
- **Page HTML « vue d'ensemble »** : `Projet apprenti 4/apprentie4-aziza/livrables/pages-html/vue-ensemble.html`, publiée en lien privé : https://claude.ai/artifact/Dv15hHawi8Uup8GoMmdSiF. Les faits sur OneDrive, Intune et PDQ ont été vérifiés.

- **Page HTML « partie physique »** : `livrables/pages-html/partie-physique.html`, publiée : https://claude.ai/artifact/UA5s2RPduhQ5rM9qhdqb4G. Elle contient :
  - le câblage cliquable de la borne et du banc, et une borne animée (3 situations) ;
  - la condensation en 7 étapes : point de rosée, modèle de Newton, simulateur à curseurs, droite ln pour trouver τ, étalonnage, incertitudes par encadrement, confrontation coque/intérieur, étiquette pour le PC ;
  - le test RFID, 16 questions du jury avec leurs réponses, le boîtier en extension et le budget.
- Les deux pages sont reliées entre elles. Les scripts ont été testés avec jsdom (aucune erreur, tous les boutons cliqués). Le rendu visuel n'a pas été vu.
- `projet.md` : explications en mots simples ajoutées sur `tc netem` et sur le badge et l'étiquette RFID.
- **Nouveau PowerPoint de soutenance, style « tableau noir »** (fond sombre, serif, bleu, jaune, vert, rouge ; aucune couleur ni police façon Claude) : `livrables/powerpoint-3b1b/Projet_E6_Aziza_3b1b.pptx`, 32 diapositives, 559 animations au clic, notes de l'oratrice sur chaque diapositive. Plan : problème → solutions existantes → 5 principes → journée de Lina (scénario) → architecture, sécurité, réseau, physique, recette, planning, limites → conclusion. Pour le reconstruire : `build.sh` (pptxgenjs + `animate.py`, qui gère fondu, balayage, disparition et déplacement). Le fichier est validé. Le rendu a été contrôlé avec un aperçu approximatif seulement (pas de LibreOffice ici) : **il faut l'ouvrir dans PowerPoint et le relire.**

### Reste à faire (dans l'ordre)
1. Faire relire les deux pages par l'enseignant (style, contenu), corriger ce qu'il signale.
2. Vérifier l'affichage des deux pages dans un vrai navigateur, sur ordinateur et sur téléphone. Aucun navigateur n'est installé dans l'environnement de Claude.
3. **Ancien PowerPoint** (`livrables/powerpoint/`) : remplacé par le nouveau ; à archiver ou à mettre à jour. Reporter toutes les corrections (V2 = archive seule, extensions, jetons et numéro de version, T01–T15, physique simplifiée, netem sur le serveur).
4. **Fiche technique** (doc Claude en ligne) : mêmes corrections.
5. `projet.md` et `TODO.md` : relecture finale.
6. **En dernier : remplir la fiche Word** `Projet apprenti 4/Fiche presentation projet E6-projet-IR v2.docx`, c'est-à-dire toutes les zones « [A remplir] ». C'est le dossier officiel pour la commission académique, et **c'est elle que le tuteur signera**, pas l'ancienne fiche d'une page. Elle demande des diagrammes SysML et un Gantt.
7. Ensuite : dossier complet PDF (modèle de l'apprenti 1), puis synthèse de 3 pages (modèle de l'apprenti 2).

### Points ouverts (à trancher lors de la visite du 7 au 10 décembre)
- Les PC passent-ils du froid au chaud ? Si non, appliquer le plan B pour la physique (RFID).
- Qui administre les PC (DSI, Intune) ? Si c'est la DSI, l'agent devient un contrôle de conformité.
- Mesure du partage de connexion 4G sur place (débit, latence, pertes), pour régler netem.
- Valider le volet physique avec le collègue de physique avant janvier.
- Demande de validation de la réalisation au lycée à l'académie.
