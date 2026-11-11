---
description: Contrôle d'un dossier ou d'une fiche E6 avant envoi (structure, règles, rendu PDF)
argument-hint: [fichier PDF ou HTML]
---

Contrôle le livrable : $ARGUMENTS

1. **Structure** : compare au plan attendu dans `CLAUDE.md` (dossier complet, synthèse de 3 pages ou fiche d'une page). Liste les sections manquantes.
2. **Règles non négociables** : mention « besoin issu de l'entreprise, réalisation au lycée » ; point réglementaire (arrêté du 25 janvier 2023, validation de l'académie) ; données fictives ; contexte anonymisé (aucun nom d'entreprise) ; rien sur les systèmes d'exploitation du réseau électrique ; pas de 230 V ; pas de caméra.
3. **Exigences E6** : C01, C03, C08, C10 (exploitation du réseau en place, pas de configuration d'équipements) ; volet physique avec étalonnage, incertitudes, modèle confronté aux mesures ; V1 / V2 / extensions ; paliers de sécurité ; besoin chiffré.
4. **Faits** : chiffres, commandes, normes et articles de loi cités ; signale ceux à vérifier.
5. **Rendu** : `pdfinfo` (nombre de pages attendu), puis `pdftoppm -r 80` et regarde chaque page (débordements, chevauchements, pages blanches).

Rends une liste courte : bloquant / à corriger / suggestion.
