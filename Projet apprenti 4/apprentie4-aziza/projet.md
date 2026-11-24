# Apprentie 4 – Aziza : « Des PC de maintenance à jour, des documents archivés, un parc tracé »

Version complète et à jour (doc Claude) : « Fiche technique du projet E6 – Aziza : architecture et technologies » — https://claude.ai/artifact/KNSSzg4rpnRtWgM4XdVhSt
Ce fichier en est le résumé de travail pour Claude Code. Schéma : `livrables/architecture.png`.

## Contexte (à anonymiser dans les dossiers)
- Service de maintenance des équipements de télécommande d'un réseau électrique ferroviaire (grande entreprise de transport).
- Missions d'Aziza : tableaux de suivi Excel des équipements, montage/démontage de PC, câblage avec les agents, programmation des installations, archivage et dématérialisation des documents de modification, tableaux types, exposé de sensibilisation cyber.
- **Besoin 1 (tuteur)** : maintenir à jour une dizaine de PC de maintenance Windows 11 ; paramètres, fichiers et programmes centralisés sur un SharePoint ; automatiser, ou à défaut un mode opératoire.
- **Besoin 2 (tuteur)** : organiser, améliorer et dématérialiser l'archivage des documents de modification.
- **Confirmé par le tuteur (10/11/2026)** : les agents emportent les PC en intervention ; Internet **uniquement** par le partage de connexion du téléphone. Projet accepté.
- Le projet ne touche **pas** aux systèmes d'exploitation du réseau électrique (supervision, télécommandes, automates) : ni connexion, ni reproduction, ni test.

## Principes fondamentaux (fil de la soutenance)
1. Avoir un fichier ne prouve pas qu'il est le bon → empreinte SHA-256 comparée au catalogue.
2. Le réseau n'est pas de confiance (4G, Internet) → seul le catalogue signé fait foi.
3. Un PC éteint ne peut rien affirmer → la borne lit le dernier rapport ; serveur muet = « vérification impossible », jamais « à jour ».
4. Sur le terrain, le réseau manque → téléchargement des seuls fichiers modifiés, reprise après coupure (BITS), alerte « kit périmé ».
5. Chaque version a une valeur → rien n'est écrasé ; l'historique = l'archive.

## Architecture (maquette au lycée)
| Brique | Technologie | Étape |
|---|---|---|
| Poste du référent | Windows 11, PowerShell 5.1 : `New-FileCatalog` (v2, SHA-256) + `Set-AuthenticodeSignature` ; publication SFTP | V1 |
| Serveur | Ubuntu Server 24.04, nginx (HTTPS, Range pour BITS), API Flask, SQLite, chrony (NTP), cron d'intégrité | V1 |
| Agent sur chaque PC | PowerShell 5.1 signé (AllSigned), tâche planifiée, BITS, journal Windows, notifications | V1 |
| Lien « 4G » simulé | une commande `tc netem` sur la carte réseau du serveur, activée seulement pendant les tests de l'agent ; profil réglé avec une vraie mesure de partage de connexion (visite). Pas de routage ni de configuration réseau : le réseau du lycée est exploité tel quel (C10) | V1 |
| Borne de sortie | ESP32-WROOM-32 + RC522 (SPI) + LED verte/rouge + buzzer ; Wi-Fi du bureau ; HTTPS | V1 |
| Tableau de bord | pages Flask, export CSV pour Excel | V1 |
| Archive | dépôt par empreintes, métadonnées SQLite, recherche simple (SQL `LIKE` sur titre, équipement, date) | V2 |
| Propositions des techniciens | proposition d'un technicien, validée par le chef, publiée par le référent | Extension |
| Boîtier de sacoche | ESP32-S3 + e-ink 2,9″, SHT40, DS18B20, ADXL345, LiPo (peut afficher « attendre encore X min ») | Extension |
| Lien SharePoint réel | Microsoft Graph | Extension |

**Qui parle à qui** : nginx reçoit tout en HTTPS (port 443) et transmet l'API à Flask (reverse proxy ; hypothèse à confirmer avec Aziza). Les PC des techniciens (rapports, téléchargement BITS) et la borne ESP32 passent tous par nginx. Flask n'est jamais exposé seul. Le PC du référent publie le kit signé en SFTP, pas par nginx.

**Pourquoi un lien simulé et pas un vrai partage de connexion** : le serveur est sur le réseau du lycée ; par la vraie 4G, il faudrait l'exposer sur Internet. Le vrai partage de connexion sert à **mesurer** (débit, latence, pertes), netem sert à **reproduire** ces mesures et à couper à volonté (T04, T08). Les tests de la borne se font netem coupé.

## Lien « 4G » simulé : ce que fait `tc netem` (en mots simples)
- **Problème** : au lycée, le réseau est rapide et ne coupe jamais. Sur le terrain, la 4G du téléphone est lente, a du retard, perd des données et coupe parfois. Tester seulement au lycée ne prouve rien.
- **netem** est un outil de Linux qui **abîme volontairement** le réseau du serveur pour qu'il ressemble à de la 4G. On peut le comparer à un ralentisseur et un péage à la sortie du serveur : les données attendent (retard), sortent au compte-gouttes (débit limité) et certaines sont jetées (pertes).
- **Trois commandes** (valeurs d'exemple, remplacées par les mesures faites avec le téléphone) :
  - ajouter : `sudo tc qdisc add dev eth0 root netem delay 80ms loss 1% rate 5mbit`
  - simuler une coupure : `sudo tc qdisc change dev eth0 root netem loss 100%`
  - tout remettre normal : `sudo tc qdisc del dev eth0 root`
- **Pourquoi c'est simple** : une seule machine (le serveur, qui existe déjà), aucun routeur, switch ni VLAN à configurer. Le réseau du lycée reste tel quel.
- **Démarche** : mesurer la vraie 4G → reproduire avec netem → tester (seulement les fichiers modifiés ? reprise après coupure ? durée ?) → observer avec Wireshark (C10).
- **Limite** : netem ralentit tout ce qui sort du serveur, y compris les réponses à la borne. On l'active seulement pendant les tests de l'agent.

**Pourquoi HTTPS + BITS et pas SFTP + VPN pour distribuer** : BITS est intégré à Windows et reprend après coupure ; pas de VPN à monter par la 4G ; SFTP en PowerShell demande un module tiers. SFTP seulement pour la publication par le référent.

## Agent PowerShell (10 étapes)
Déclenchement (démarrage, ouverture de session, toutes les 30 min) → catalogue → signature (empreinte du certificat du référent connue) → **numéro de version plus grand que celui installé, sinon refus** → comparaison des empreintes → palier (simulation / confirmation / automatique) → téléchargement BITS du modifié dans `preparation` → `Test-FileCatalog -Detailed` → bascule (`actif`→`precedent`, `preparation`→`actif`) → rapport au serveur → alerte « kit périmé » à l'ouverture de session (date de validité).
- `catalogue.json` (version, date de validité) est placé **dans** le dossier du kit avant `New-FileCatalog` : il est donc signé comme le reste.
- L'agent garde le dernier numéro de version installé dans un petit fichier local. Un ancien kit, même bien signé, est refusé.
- Retour arrière : remettre `precedent` après revérification (< 2 min). C'est le seul cas où une version plus ancienne est acceptée, et seulement sur décision locale.
- Le serveur ne peut pas « pousser » vers un PC en 4G : c'est le PC qui interroge.
- Notifications : documents = automatique (info après coup) ; paramètres/programmes = confirmation ; kit périmé.

## Jetons des appareils (simple)
- Chaque PC et la borne ont un **jeton** propre, enregistré dans SQLite côté serveur. Flask refuse toute requête `POST` sans jeton valide (en-tête `Authorization`).
- PC : jeton dans un fichier sous `C:\ProgramData\agent\`, lisible seulement par les administrateurs (droits NTFS).
- Borne : jeton enregistré une fois avec la bibliothèque `Preferences` de l'ESP32 (mémoire NVS), **jamais écrit dans le code** (liste rouge de la charte IA).
- **Création du jeton** (proposition, à valider avec Aziza) :
  1. L'administrateur lance sur le serveur `python creer_jeton.py PC-04`.
  2. Le script tire 32 octets au hasard : `secrets.token_hex(32)` (64 caractères impossibles à deviner).
  3. SQLite garde le **hash SHA-256** du jeton (pas le jeton), avec le nom du PC et la date.
  4. Le jeton est affiché **une seule fois**. L'administrateur le copie dans `C:\ProgramData\agent\jeton.txt` (droits NTFS : administrateurs seulement). Pour la borne : écriture unique en NVS au flashage.
- **Vérification** : le PC envoie le jeton dans `Authorization`. Flask hache le jeton reçu et le compare à la base avec `hmac.compare_digest`. Un jeton lié à un seul PC : un jeton volé ne sert que pour ce PC.
- Limites : copie manuelle (suppose un administrateur de confiance à l'installation) ; pas de rotation prévue ; **révocation** = supprimer la ligne côté serveur. Extension possible : certificat client (mTLS).
- Limite assumée : le badge RFID **identifie**, il ne **prouve** pas (un badge simple se copie). Il trace une sortie, il ne contrôle pas un accès.

## API du serveur
| Chemin | Appelant | Rôle |
|---|---|---|
| GET /kit/catalogue | agent | catalogue.json + catalogue.cat |
| GET /kit/fichiers/{sha256} | agent (BITS) | fichier par empreinte |
| POST /pc/{id}/rapport | agent | état après vérification |
| GET /pc/{id}/etat | borne | à jour ou non, version, date du rapport |
| POST /sorties | borne | badge, PC, version, heure |
| POST /boitiers/{id}/mesures | boîtier | chocs, températures, humidité |
| GET /tableau-de-bord, /export.csv | navigateur | état du parc |
| GET /archive?q= | navigateur | recherche (V2) |
| POST /propositions | agent (extension) | proposition d'un technicien |
| POST /propositions/{id}/decision | chef (extension) | validation ou refus |

## Propositions des techniciens (extension)
Copie modifiée dans un dossier « brouillons » (jamais le kit actif) → « Proposer une modification » → POST HTTPS (auteur, motif, équipement, empreinte ; file locale si hors réseau) → zone séparée, jamais distribuée → notification au chef → validation → **nouvelle version du kit signée par le référent** → distribuée ; l'ancienne reste archivée. La proposition sert de fiche de modification pour l'archive. Contrôle renforcé pour paramètres et programmes.

## Borne (V1) – matériel et câblage
### Badge et étiquette, en mots simples
L'étiquette est un **autocollant collé sur le PC** : c'est la « carte d'identité » du PC. Badge et étiquette utilisent la **même technologie RFID**, sous deux formes :

| | Badge | Étiquette |
|---|---|---|
| Forme | carte ou porte-clés | autocollant plat et fin |
| Où | dans la poche de l'agent | collé sur le PC |
| Ce qu'il dit à la borne | « je suis l'agent A-12 » | « je suis le PC-04 » |

- À l'intérieur : une toute petite puce et une antenne enroulée, **sans pile**. Le champ magnétique du lecteur RC522 alimente la puce un instant ; elle renvoie son **numéro unique** gravé en usine (ex. `04:A3:7F:12`). Le serveur garde la correspondance `04:A3:7F:12` = PC-04.
- **Pourquoi les deux** : badge → **qui** part ; étiquette → **quel PC** part ; la borne demande au serveur si ce PC est à jour → vert ou rouge.
- **Pourquoi anti-métal** : la coque du PC est souvent en métal, qui gêne le champ du lecteur ; une étiquette normale se lit mal ou pas du tout. L'étiquette anti-métal a une fine couche de **ferrite** qui la protège (≈ 1 à 3 €, à confirmer). C'est ce que mesure le test RFID.

Matériel : ESP32, module RC522, badge de l'agent (qui sort), étiquette RFID anti-métal collée sur chaque PC (quel PC sort), LED verte et rouge + 2 × 220 Ω, buzzer, boîtier, alimentation USB 5 V.
RC522 → ESP32 : SDA/SS GPIO 5, SCK 18, MOSI 23, MISO 19, RST 22, 3.3V → 3V3 (jamais 5 V), GND. LED verte GPIO 25, rouge GPIO 26 (220 Ω), buzzer GPIO 27.
États : vert (rapport récent + version publiée, sortie enregistrée) ; rouge (rapport ancien) ; alternance (serveur injoignable = vérification impossible, sortie mémorisée). La borne est fixe au bureau ; pas de badge sur le terrain.

## Banc de physique (V1) – câblage
ESP32 : SHT40 sur I²C (SDA GPIO 21, SCL GPIO 22, adresse 0x44), DS18B20 sur 1-Wire GPIO 4 avec 4,7 kΩ DATA–3V3.

## Physique (seulement ce qui sert au projet)
**Question (V1)** : combien de temps attendre avant d'allumer un PC qui sort du froid, pour éviter la condensation ? *À confirmer lors de la visite (question 4).*
- Modèle : `T(t) = Ta + (T0 − Ta)·e^(−t/τ)` ; point de rosée (Magnus, a = 17,62 ; b = 243,12 °C) ; `t_att = τ·ln[(T0 − Ta)/(Td − Ta)]`. Exemple : 0 °C → 20 °C / 50 % : Td ≈ 9,3 °C, t ≈ 0,62 τ (calcul vérifié).
- Étalonnage : DS18B20 et SHT40 comparés à un thermomètre de référence ; incertitudes.
- Mesures : bloc d'aluminium refroidi, une mesure toutes les 10 s ; τ tiré de ln(T − Ta) = f(t) ; puis **un essai sur un vrai portable** pour confronter le modèle.
- Plaque témoin : la buée apparaît-elle au moment prévu par le calcul ?
- **Usage dans le projet** : tableau « température extérieure → temps d'attente » dans le mode opératoire et étiquette collée sur chaque PC.

**Test court (V1) : choix de l'étiquette RFID du PC.** Distance de lecture selon l'étiquette (normale ou anti-métal) posée sur le portable et son orientation. Mesures seulement, pas de théorie.

**Plan B** (si le froid → chaud n'est pas confirmé) : le test RFID devient l'expérience principale (répétitions, incertitudes). À valider avec le collègue de physique.

Précisions des capteurs citées de mémoire (DS18B20 ±0,5 °C ; SHT40 ±0,2 °C / ±2 %HR) : **à vérifier dans les fiches techniques**.

## Charge et planning (avec IA encadrée)
V1 ≈ 116 h ; V2 ≈ 20 h (archive seule) ; total ≈ 136 h, marge ≈ 14 h. Extensions : propositions des techniciens, boîtier de sacoche, lien SharePoint réel, installation de programmes. Janvier : serveur, catalogue, VM ; février : agent V1 ; mars : borne, banc ; avril : recette V1 (revue 2 = feu vert V2) ; mai : V2, dossier ; juin : soutenance. Dates des revues à fixer par le lycée.

## Budget (ordres de grandeur, à confirmer)
V1 : ESP32 ×2 12–20 € ; RC522 3–8 € ; badges et étiquettes anti-métal 0,5–3 € pièce ; LED, buzzer, boîtier 5–10 € ; SHT40 5–15 € ; DS18B20 ×2 2–5 € ; thermomètre de référence (lycée ?). Total V1 ≈ 40–70 €. Extension boîtier : ESP32-S3 + e-ink 25–35 € ; ADXL345 3–10 € ; LiPo + chargeur 10–15 €. PC, serveur et réseau fournis par le lycée. Licences Windows 11 à vérifier.

## Recette (T01–T15)
T01 kit ancien → seuls les fichiers modifiés · T02 octet modifié → refusé · T03 autre certificat → refusé · T04 coupure → reprise puis vérification · T05 retour arrière < 2 min · T06 borne verte · T07 borne rouge · T08 serveur arrêté → vérification impossible · T09 kit périmé hors réseau → notification · T10 liste rouge IA → aucune occurrence · T11 (V2) recherche d'une ancienne version < 1 min · T12 (extension) proposition hors réseau puis refusée · T13 (extension) proposition validée → reçue par les autres PC · **T14 ancien kit bien signé → refusé** · **T15 rapport sans jeton valide → refusé, la borne ne passe pas au vert**.

## Questions pièges et réponses
- OneDrive ? Synchronise fichier par fichier ; pas de kit validé d'un bloc, pas de preuve de version par PC, pas d'alerte de péremption, n'installe rien.
- Intune ? Bon outil pour un parc géré et enrôlé ; ici 10 PC de terrain gérés par le service. Si la DSI les gère, l'agent devient un contrôle de conformité.
- Versions SharePoint ? 500 versions par fichier par défaut, mais fichier par fichier, sans lien avec la modification, l'équipement ou le validateur.
- Surveillance ? On trace des PC et des versions ; chocs liés au PC. En vrai déploiement : information des salariés (L1222-4) et consultation du CSE (L2312-38).
- Et si on renvoie un ancien kit signé ? Refusé : le numéro de version est dans le catalogue signé et l'agent n'accepte qu'un numéro plus grand (T14).
- Et si quelqu'un envoie un faux rapport « à jour » ? Refusé sans le jeton du PC (T15).
- Boîtier plutôt qu'appli ? Une appli ne voit rien quand le PC est éteint ; lire l'état d'un PC froid obligerait à l'allumer.
