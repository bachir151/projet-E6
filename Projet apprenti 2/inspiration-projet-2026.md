# Yaksan (apprenti 2) – s'inspirer du projet E6 de l'an dernier (23/11/2026)

> Source : mémoire E6 d'un étudiant de la session 2026 (32 p.), transmis par l'enseignant. Document interne : ne pas citer son nom dans les dossiers de Yaksan. **Rien n'est décidé.**

## 1. Le projet de l'an dernier en bref
**« Station de maintenance déclenchée par badge RFID »**
- Le technicien passe un badge sur un lecteur RC522 relié à un ESP32. L'ESP32 demande à une API (Flask sur Raspberry Pi) si le badge est autorisé ; si l'API ne répond pas, il utilise une liste locale (mode dégradé).
- L'ESP32 envoie l'ordre au PC par liaison série ; un orchestrateur PowerShell lance une des **cinq actions** : diagnostic, inventaire, nettoyage, verrouillage, redémarrage vers le menu de démarrage (avec 4 garde-fous et une confirmation).
- Chaque action produit un **rapport HTML** et une trace à trois niveaux (console, fichier CSV, API). Tableau de bord web, page d'administration des badges.
- Second sous-système : une **prise Shelly** mesure la consommation du PC ; un programme Python la lit et l'affiche en graphique.
- Démarche : projet de départ (démarrage réseau PXE, effacement, déploiement) jugé trop lourd → **recalibrage** en début de projet, phases A (local), B (réseau), C (énergie).

## 2. Ce qu'on garde, ce qui manque pour la session 2027
| Critère E6 2027 | L'an dernier | Pour Yaksan |
|---|---|---|
| Idée directrice | **Un geste physique = une action calibrée + un rapport lisible + une trace** | À garder : c'est simple à expliquer et à démontrer |
| Démonstration | De bout en bout, avec mode dégradé (serveur coupé, Wi-Fi coupé) | À garder, avec les mêmes essais de résilience |
| Paliers de sécurité | Confirmation et garde-fous sur l'action la plus risquée | À généraliser : simulation → confirmation → automatique pour chaque action |
| Gestion de projet (C03) | Recalibrage écrit et justifié, phasage A/B/C, tableau de tests | À garder comme modèle de méthode |
| **Physique** | Prise Shelly : on **affiche** une consommation, sans modèle ni incertitude | **Insuffisant** : il faut étalonnage, modèle, incertitudes et une décision |
| **C10** | Wi-Fi, adresse fixe, appels HTTP | **Trop mince** : exploiter DNS, NTP, annuaire, messagerie, proxy, avec captures commentées |
| **Sécurité** | Badge Mifare Classic : numéro (UID) copiable ; mot de passe d'administration par défaut ; HTTP en clair | Pas d'ouverture sur un numéro de badge ; HTTPS ; journal **chaîné** plutôt que « triple » |
| **Besoin chiffré** | Aucun chiffre, aucun indicateur | Hypothèses écrites et indicateurs mesurés |

## 3. Attention au doublon
Le projet de l'an dernier ressemble déjà beaucoup à celui de **Wassim** (carte RFID du technicien, station PowerShell des PC neufs). Pour Yaksan : **pas de badge RFID, pas de « station de maintenance »**. On garde l'idée directrice, pas le déclencheur.

## 4. Deux adaptations pour Yaksan
### A. Le guichet des mouvements (inspiration + casier de `pistes-kit-capteurs.md`)
- **Déclencheur** : le **capteur**, pas un badge. On pose le portable de l'agent dans le casier (capteur de force + interrupteur de porte) : c'est le geste.
- **Arrivée** : le serveur propose un catalogue d'actions PowerShell, en simulation puis avec confirmation : compte Internet filtré au bon niveau, accès aux boîtes partagées, réglage de la messagerie, **contrôle de la date du certificat de la carte**. À la fin, un **rapport HTML d'accueil** remis à l'agent (ce qui est prêt, à qui s'adresser).
- **Départ** : le casier vérifie que le kit est complet (pesée) ; coupure des accès à paliers ; **rapport de restitution**.
- **Trace** : journal chaîné, dernier haché envoyé par mail à une boîte séparée (question de Yaksan : « quelqu'un a-t-il effacé ce qui s'est passé ? »).
- **Mode dégradé** (repris de l'an dernier) : serveur coupé → le casier garde les événements et les renvoie.
- **Physique** : pesée (pont de Wheatstone, étalonnage, dérive, incertitudes) → **décide** quels objets on reconnaît et le seuil de « manque ».
- **C10** : messagerie (SMTP/IMAP), proxy et son authentification, annuaire (lecture LDAP), NTP, DNS ; captures.

### B. L'établi automatique (inspiration + établi de `pistes-esp32-quotidien.md`)
- **Déclencheur** : on branche un périphérique ou un chargeur ; le capteur de courant détecte l'appareil et lance les tests tout seul.
- **Rapport HTML** par appareil, historique par modèle, tableau de bord.
- **Physique** : là où l'an dernier se contentait d'afficher, on **modélise** : résistance du câble, pertes et échauffement du chargeur, énergie de la batterie, incertitudes → décision « garder / remplacer ».
- **C10** : plus faible ; à compléter par la lecture à distance de l'état des portables et des captures.

## 5. Comparaison rapide (notes de 1 à 5)
| Critère | A Guichet des mouvements | B Établi automatique |
|---|---|---|
| Lien avec le quotidien (arrivées, départs, certificats) | 5 | 3 |
| Physique utile | 4 | 5 |
| Code (C08) | 5 | 4 |
| C10 | 5 | 3 |
| Démonstration de bout en bout | 5 | 4 |
| Pas de doublon | 3 (borne de l'apprentie 4 à distinguer) | 5 |
| **Total sur 30** | **27** | **24** |

**Recommandation : A, le guichet des mouvements.** Il reprend ce qui a marché l'an dernier (geste simple, rapport, trace, mode dégradé, recalibrage) et corrige ce qui manquait (physique, C10, sécurité, chiffres).

## Décision de l'enseignant (23/11)
**Le guichet des mouvements est jugé artificiel** : le support sait déjà ce que contient un kit, une liste à cocher suffit. La balance ne répond à aucune vraie question. Piste écartée, comme le casier de `pistes-kit-capteurs.md`.
Leçon : le capteur doit mesurer **ce que le technicien ignore et ne peut pas savoir autrement**. Sinon, c'est décoratif.
