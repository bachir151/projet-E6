# Prompt pour chercher des idées avec Fable (23/11/2026)

> Version 2 du prompt (la v1 pour Gemini : `prompt-gemini-nouveau-projet.md`). Elle ajoute tout ce qui a été écarté depuis, et le test « est-ce artificiel ? ». Contexte anonymisé. Copier tout le bloc ci-dessous.

---

Tu m'aides à trouver un projet pour l'épreuve E6 d'un apprenti en BTS CIEL option A (Informatique et réseaux), en France. Je suis son enseignant. Je cherche des **idées neuves et honnêtes**, pas des idées qui cochent des cases. Réponds en français, avec des mots simples et des phrases courtes. Écris « à vérifier » quand tu n'es pas sûr d'un fait technique ou réglementaire. Prix en ordres de grandeur.

## Le défi
On a déjà écarté beaucoup d'idées parce qu'elles étaient **artificielles** : on collait un capteur sur un problème qui n'en avait pas besoin, juste pour avoir de la physique. Je veux sortir de ce piège.

**Le test que chaque idée doit passer :**
1. **Le problème existe sans l'examen.** Le service le connaît ou le reconnaîtrait tout de suite.
2. **Le capteur apprend quelque chose que le technicien ignore et ne peut pas savoir autrement.** Si une liste, un journal Windows, un script ou un simple coup d'œil donne déjà la réponse, la physique est décorative : l'idée est rejetée.
3. **La mesure physique décide d'un choix concret** (un seuil, un emplacement, un réglage, une réparation).

## Le cadre de l'épreuve
- Épreuve E6 « Valorisation de la donnée et cybersécurité », oral d'1 h, projet individuel d'environ **150 heures** (janvier à mi-mai), avec l'IA (charge réaliste).
- Compétences : **C01 Communiquer, C03 Gérer un projet, C08 Coder** (vrai code : Python, PowerShell, C++ sur ESP32, SQL, web), **C10 Exploiter le réseau déjà en place** (DHCP, DNS, NTP, annuaire, messagerie, proxy, captures Wireshark, supervision). Configurer des VLAN, des ACL ou du 802.1X n'est pas le sujet.
- Un **professeur de physique** évalue aussi : vrai volet mesurable (étalonnage, incertitudes, modèle confronté aux mesures), utile au projet.
- **V1 obligatoire / V2 visée / extensions**, avec des heures. **Paliers de sécurité** dès qu'on agit sur une machine (simulation → confirmation humaine → automatique). Besoin chiffré par des hypothèses ; indicateurs mesurés sur la maquette.
- Réalisation **au lycée, sur maquette** : aucune donnée réelle, aucun accès à la production.
- Matériel : PC Ubuntu, switchs HP ProCurve, routeurs Cisco ISR 4331, ESP32 et un kit de capteurs courants (température, humidité, lumière, son, ultrasons, effet Hall, force, infrarouge…), oscilloscope, multimètre. Budget d'achat : 100 à 150 €.
- **Interdits** : pas de câblage 230 V, pas de caméra qui filme des personnes, pas de données personnelles réelles.
- **Exclu par l'enseignant : tout ce qui touche au courant électrique** (consommation, énergie, chargeurs, batteries, mesure de courant ou de tension). Cherche d'autres domaines de la physique : ondes, optique, acoustique, thermique, mécanique, magnétisme, temps, matériaux…

## Le terrain de l'apprenti
- Support informatique d'un **service RH (carrière et paye)** d'une administration. Missions : support aux agents, accueil des nouveaux agents.
- Réseau du service **isolé d'Internet** ; Internet passe par un **compte filtré à 3 niveaux**, que l'apprenti crée. L'annuaire et la préparation des PC sont gérés par d'autres équipes.
- **Tous les postes sont des PC portables Windows.**
- La carte de l'agent sert à entrer dans le bâtiment, à imprimer et à se connecter au portail des applications. **Panne fréquente : certificat de la carte expiré**, réglé à la main dans le navigateur.
- **La majorité des tickets : arrivées et départs d'agents** (messagerie, boîtes mail partagées, compte Internet filtré).
- Dépannage courant : périphériques, réglages Windows, navigateur, fermeture du capot du portable. Tickets suivis dans GLPI.
- Tu peux aussi proposer une idée qui ne vient pas de son quotidien, si elle reste utile à un service informatique comme le sien (« amélioration proposée au service »). Dis-le clairement.

## Les trois autres apprentis (pas de doublon)
- **Apprenti 1** : pannes d'imprimantes (vibration, SNMP, compteur de pages), tickets GLPI à paliers, carte RFID du technicien, préparation des PC neufs en PowerShell.
- **Apprenti 3** : radar de présence qui verrouille la session Windows ; fausse imprimante réseau servant de leurre (ESP32 + Ethernet) ; authentification d'un boîtier par HMAC.
- **Apprentie 4** : distribution de fichiers métier signés vers des PC nomades, archivage, suivi du matériel par RFID à une borne de sortie ; physique : condensation d'un PC qui sort du froid (thermique).
- Questions de sécurité déjà prises : « le boîtier est-il authentique ? », « ce fichier est-il le bon ? », « le diagnostic à distance peut-il faire plus que permis ? ». Celle de cet apprenti est de préférence : **« quelqu'un a-t-il effacé ce qui s'est passé ? »** (journal chaîné par empreintes, ancré ailleurs). Tu peux proposer mieux si c'est justifié.

## Déjà écarté (ne pas reproposer, même déguisé)
| Idée | Pourquoi écartée |
|---|---|
| Boîtier ESP32 « boîte noire » des arrêts brutaux du PC | Les postes sont des portables : la batterie absorbe les coupures |
| Carte agent + impression libérée par la carte | Doublon « badge + imprimante » avec l'apprenti 1 |
| RFID sous toutes ses formes | Doublon apprentis 1 et 4 |
| Horodatage des traces (« l'heure des traces ») | Artificiel |
| Radio LoRa parallèle qui sort du réseau | Radio inventée, pas un geste réel |
| Portail captif (ALCASAR) | Un accès filtré existe déjà ; physique et code faibles |
| Casier ou « guichet » qui pèse le kit de l'arrivant | **Artificiel** : le support sait déjà ce qu'il y a dans le kit |
| Banc batterie, chargeur, câble USB, consommation des PC | Exclu : courant électrique |
| Détecteur de partage de connexion du téléphone (Wi-Fi) | Sans doute bloqué par le VPN permanent et les règles du poste |
| Réflectométrie d'un câble réseau | Électrique, et loin du quotidien |
| Fuite de données par ultrasons d'un PC isolé | Démonstration amusante, besoin réel faible, peu de réseau |
| Local technique qui chauffe | Pas le quotidien de l'apprenti (à garder seulement si tu trouves un angle vraiment nouveau) |

## Ce que je te demande
1. **Dix idées** très différentes les unes des autres, en 4 lignes chacune : le problème réel, ce que fait le système, le phénomène physique mesuré (hors électricité), ce que l'apprenti code.
2. **Passe chaque idée au test** (les 3 questions) et **élimine sans pitié** celles qui échouent. Dis franchement pourquoi. Je préfère 2 bonnes idées à 10 moyennes.
3. Pour les survivantes, un **tableau** noté de 1 à 5 : réalité du besoin, physique non artificielle, code personnel (C08), richesse de C10, faisabilité en 150 h sur maquette, absence de doublon, effet démonstration à l'oral.
4. Pour **les deux meilleures**, une explication **concrète** : le matériel posé sur la table, puis un scénario pas à pas avec un personnage (« lundi, Sophie… »), la physique (grandeur, modèle, protocole, incertitudes, décision), le réseau exploité, la question de sécurité et sa démonstration, V1/V2 en heures, et les 3 questions à poser à l'apprenti pour vérifier que le besoin existe.
5. Pour chaque idée retenue, la **question qui pourrait la tuer** (par exemple : « le service l'a-t-il déjà bloqué par une règle ? »).

Sois critique, y compris envers tes propres idées. Si tu ne trouves rien qui passe vraiment le test, dis-le.
