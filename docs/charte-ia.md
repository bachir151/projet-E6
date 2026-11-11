# Charte d'usage de l'IA pour les projets E6

Le cadre national (juin 2025) autorise l'IA au lycée dans un cadre défini par l'enseignant. Ce document est ce cadre.

## Règles pour l'apprenti
1. Aucune information de l'entreprise dans une IA : ni document, ni nom, ni adresse IP, ni capture d'écran.
2. Écrire d'abord le test (T0x), puis demander le code.
3. Vérifier chaque commande et chaque bibliothèque proposées dans la documentation officielle (Microsoft Learn, Espressif, Arduino).
4. **Liste rouge** (échec de la recette si présent) : `setInsecure()` sur ESP32 ; contournement de la vérification de certificat en PowerShell ; `Set-ExecutionPolicy Bypass` ; mot de passe ou jeton écrit en dur ; `debug=True` dans Flask.
5. Tenir un **journal d'usage de l'IA** (date, outil, demande, ce qui est gardé, modifié ou refusé, et pourquoi) → annexe du dossier.
6. À chaque revue : expliquer à l'oral un bloc de code choisi par l'enseignant et faire une petite modification en direct.
7. Physique : l'IA peut aider aux calculs, jamais fournir de données. Garder les mesures brutes horodatées.

## Effet sur la charge (estimation pour l'apprentie 4)
| Bloc | Sans IA | Avec IA |
|---|---|---|
| Gestion, revues, dossier, soutenance | 30 | 30 |
| Serveur, catalogue signé, API | 15 | 10 |
| Agent PowerShell | 30 | 20 |
| Borne RFID | 14 | 11 |
| Tableau de bord | 8 | 4 |
| Exploitation réseau | 8 | 8 |
| Physique | 15 | 15 |
| Recette | 10 | 12 |
| Relecture et explication du code généré | — | 6 |
| **Total V1** | **≈ 130 h** | **≈ 116 h** |

L'IA accélère le code, pas le câblage, les mesures ni la recette. Le temps gagné va aux tests et à la compréhension, pas à des briques en plus.
