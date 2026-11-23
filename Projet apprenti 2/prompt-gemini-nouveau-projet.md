# Prompt à donner à Gemini : imaginer un nouveau projet E6 pour l'apprenti 2 (23/11/2026)

> Contexte anonymisé : ni nom d'administration, ni nom d'outil interne, ni nom de personne. Copier tout le bloc ci-dessous.

---

Tu es un concepteur de projets pédagogiques pour le BTS CIEL option A (Informatique et réseaux), en France. Je suis enseignant. J'ai besoin d'imaginer **un projet entièrement nouveau** pour l'épreuve E6 d'un de mes apprentis. Réponds **en français**, avec des **mots simples** et des phrases courtes. Quand tu n'es pas sûr d'un fait technique ou réglementaire, écris « à vérifier ». Donne les prix en ordres de grandeur (« à confirmer »).

## 1. Le cadre de l'épreuve (à respecter strictement)
- Épreuve E6 « Valorisation de la donnée et cybersécurité », coefficient 7, oral d'1 h, projet individuel d'environ **150 heures** (janvier à mi-mai), avec l'aide de l'IA (charge réaliste).
- Compétences évaluées : **C01 Communiquer, C03 Gérer un projet, C08 Coder, C10 Exploiter un réseau informatique**.
- **C10 = exploiter le réseau déjà en place** : adressage, DHCP, DNS, NTP, annuaire, messagerie, proxy, protocoles observés en captures Wireshark, supervision. Configurer des VLAN, des ACL ou du 802.1X relève d'une autre épreuve : ce ne doit pas être le cœur du projet.
- **C08** : l'apprenti doit écrire du vrai code (Python, PowerShell, C++ sur ESP32, SQL, page web…). Installer un logiciel tout fait ne suffit pas.
- Un **professeur de physique** évalue aussi le projet : il faut un **vrai volet physique mesurable** (étalonnage, incertitudes, modèle confronté aux mesures), **utile au projet** (il décide d'un choix technique), jamais décoratif.
- Progression obligatoire : **V1 obligatoire / V2 visée / extensions**, avec des heures.
- Dès que le système agit sur une machine : **paliers de sécurité** (simulation → confirmation humaine → automatique).
- Besoin **chiffré** : hypothèses écrites, à faire valider par le tuteur ; **indicateurs mesurés sur la maquette**.
- Le besoin est **une amélioration proposée au service**, pas un besoin déjà validé par l'entreprise.

## 2. Règles non négociables
- Réalisation **au lycée, sur maquette**. Aucune donnée réelle, aucun accès à la production, contexte anonymisé. (La réglementation demande que le projet d'un apprenti soit développé en entreprise : la réalisation au lycée devra être validée par l'académie. Le projet doit donc se justifier aussi par « on ne fait pas d'essais sur la production ».)
- Matériel du lycée : PC Ubuntu, switchs HP ProCurve, routeurs Cisco ISR 4331, ESP32 et capteurs courants, oscilloscope, multimètre. On peut acheter un peu de matériel (environ 100 à 150 € au total).
- **Interdits** : pas de câblage 230 V, pas de caméra qui filme des personnes, pas de données personnelles réelles.

## 3. Le terrain de l'apprenti (ce qu'il a dit lui-même)
- Il travaille au **support informatique d'un service RH (carrière et paye)** d'une administration. Ses missions : support aux agents et **accueil des nouveaux agents**.
- Le **réseau du service est isolé d'Internet**. L'accès à Internet passe par un **compte filtré** (3 niveaux d'accès), que l'apprenti crée pour les agents.
- **Tous les postes sont des PC portables Windows**, préparés par une autre équipe. L'annuaire est géré par une autre équipe.
- Chaque agent a une **carte** qui sert à imprimer, à entrer dans le bâtiment et à se connecter au portail des applications (par carte ou par mot de passe). **Panne fréquente : le certificat de la carte a expiré.** Aujourd'hui, l'apprenti le supprime ou le renouvelle à la main dans les paramètres du navigateur.
- **La majorité des tickets concerne les arrivées et les départs d'agents** : configurer la messagerie, donner accès à des boîtes mail partagées, créer le compte Internet filtré.
- Autres tâches : installation de postes ; dépannage courant (périphérique qui ne marche plus, réglages Windows, navigateur, alimentation, fermeture du capot du portable).
- Les tickets sont suivis dans un outil de gestion de tickets (GLPI).
- Le tuteur a cité un **portail captif libre** (ALCASAR), envisagé mais pas en place. Attention : un accès Internet filtré existe déjà, et nos essais ont trouvé que la physique et le code étaient faibles sur cette piste.
- Chiffres inconnus pour l'instant (à mettre en hypothèses) : nombre d'arrivées et de départs par mois, nombre de certificats expirés par mois, temps passé par ticket.

## 4. Les trois autres apprentis : ne pas faire de doublon
Le projet doit rester **clairement distinct** de ceux-ci :
- **Apprenti 1 (hôpital)** : pannes d'imprimantes (capteurs sur l'imprimante, SNMP, compteur de pages), tickets GLPI à paliers, carte RFID du technicien, station de préparation des PC neufs en PowerShell, annuaire simulé. → Pas de projet centré sur GLPI, sur les pannes d'imprimante ou sur la préparation de PC neufs.
- **Apprenti 3 (finances publiques)** : radar de présence qui verrouille la session Windows ; fausse imprimante réseau servant de leurre (ESP32 + Ethernet) ; authentification d'un boîtier par HMAC. → Pas de détection de présence, pas de leurre, pas d'authentification de boîtier par HMAC.
- **Apprentie 4 (maintenance ferroviaire)** : distribution de fichiers métier signés vers des PC nomades, catalogue signé, empreintes, archivage, parc tracé par RFID à une borne de sortie. → Pas de distribution de fichiers signés, pas de suivi de matériel par RFID.
- Chaque apprenti a **une seule question de sécurité**. Déjà prises : « le boîtier est-il authentique ? » (3), « ce fichier est-il le bon ? » (4), « le diagnostic à distance peut-il faire plus que permis ? » (1). La question de cet apprenti est de préférence : **« quelqu'un a-t-il effacé ce qui s'est passé ? »** (traces infalsifiables : journal chaîné par empreintes, ancré sur un serveur). Tu peux proposer mieux si c'est justifié.

## 5. Pistes déjà explorées (ne pas les reproposer telles quelles)
- « Boîte noire du poste » (boîtier ESP32 qui témoigne des arrêts brutaux d'un PC) : affaiblie parce que tous les postes sont des portables.
- Carte agent pour le PC + impression sécurisée libérée par la carte : doublon « badge + imprimante » avec l'apprenti 1.
- Contourner le portail captif avec du RFID : doublon avec les apprentis 1 et 3.
- Horodatage des traces (« l'heure des traces ») : jugé artificiel.
- « Angle mort radio LoRa » (une radio parallèle sort du réseau sans laisser de trace) : proposé, non retenu pour l'instant.

## 6. Ce que je te demande
1. **Trois idées de projet** vraiment différentes, qui partent du **vrai travail** de l'apprenti (en priorité : arrivées et départs, certificats expirés, portables). Pour chacune, en 5 lignes : le problème, la solution, ce que l'apprenti code, le volet physique, la question de sécurité.
2. Un **tableau comparatif multicritère** des trois idées, noté de 1 à 5 : besoin réel, utilité pour le service, quantité de code personnel (C08), richesse de C10 (réseau en place), physique utile et mesurable, faisabilité en 150 h, faisabilité sur maquette au lycée, risque de doublon, effet « démonstration » à l'oral. Puis ta **recommandation**, justifiée en 5 lignes.
3. Pour l'idée recommandée, un **dossier détaillé** :
   - le problème de départ, en mots simples ;
   - les solutions qui existent déjà (ce qu'elles font bien, ce qui leur manque) ;
   - la solution de l'apprenti ;
   - un **scénario concret** avec un personnage (un agent qui arrive, ou qui part) ;
   - l'**architecture** de la maquette (liste des machines, flux, protocoles) ;
   - le découpage **V1 / V2 / extensions**, avec les heures (total V1 + V2 ≤ 150 h) ;
   - **C10** : ce que l'apprenti exploite et capture sur le réseau en place ;
   - la **sécurité** : la question, la démonstration d'attaque, la limite assumée ;
   - les **paliers de sécurité** pour chaque action sur une machine ou un compte ;
   - la **physique** : grandeur mesurée, modèle, protocole, incertitudes, et **quel choix technique la mesure décide** ;
   - la **vie privée** : données traitées, durée de conservation, comptes fictifs ;
   - 4 à 6 **indicateurs mesurables sur la maquette**, avec une cible ;
   - les **hypothèses chiffrées** à faire valider par le tuteur ;
   - le **matériel à acheter** (prix en ordres de grandeur) ;
   - les **5 questions les plus difficiles** que le jury posera, avec une réponse courte ;
   - les **risques** et un plan B.
4. Termine par une liste de **ce qui est à vérifier** (faits techniques, réglementaires, prix) et de **ce qu'il faut demander au tuteur**.

Sois critique : si une idée a une physique faible ou un code trop mince, dis-le clairement plutôt que de l'embellir.
