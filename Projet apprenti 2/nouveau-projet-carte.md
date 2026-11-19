# Yaksan (apprenti 2) – nouveau projet : la carte agent, du poste à l'imprimante

> **Décision de l'enseignant, 19/11/2026** : on abandonne la « Boîte noire du poste ». On ignore pour l'instant les 5 questions de visite. Nouveau projet : **une carte agent qui sert au PC (session et navigateur) et à l'imprimante (impression sécurisée)**, plus une station qui dit pourquoi la carte ne marche pas. **Pas de porte** (écartée le 19/11).
> Statut : **ébauche à valider**. Les heures sont des ordres de grandeur.

## 1. Le besoin (point de départ réel)
- Plainte remontée par le tuteur : « le navigateur ne détecte pas la carte ». Aujourd'hui, on répare au hasard.
- Service carrière et paye : on imprime des **documents sensibles** (bulletins, dossiers de carrière). Un document oublié dans le bac peut être lu par n'importe qui. *(Hypothèse à faire confirmer par le tuteur.)*
- Missions de Yaksan : support et accueil des nouveaux agents.

## 2. Frontière avec Wassim (apprenti 1)
| | Wassim | Yaksan |
|---|---|---|
| Question | « L'imprimante **marche-t-elle** ? » (disponibilité) | « **Qui récupère** le document ? » (confidentialité) |
| Ce qu'il fait | témoins de panne, SNMP, GLPI, carte du **technicien** | impression retenue, libérée par la carte de l'**agent** |
| Yaksan ne fait pas | — | pas de détection de panne, pas de GLPI, pas de SNMP de supervision, pas de carte technicien |

Point à surveiller : deux projets avec « imprimante + badge ». À dire clairement dans les deux dossiers.

## 3. La carte
- **Carte hybride** : puce à contacts au format **PIV** (certificat, lue nativement par Windows 11) + puce **sans contact** 13,56 MHz (type MIFARE DESFire EV2/EV3, authentification AES) pour l'imprimante.
- Jamais d'ouverture sur le seul numéro de carte (UID), copiable.
- Variante plus ambitieuse (extension) : PIV aussi en sans contact (carte à double interface) → une seule PKI pour les deux usages. Disponibilité des cartes à vérifier.
- Cartes de test uniquement ; type réel de la carte agent du ministère : **non vérifié**.

## 4. Ce que Yaksan fabrique
1. **Connexion par carte au PC** : portail de labo (nginx) qui exige un certificat client signé par l'autorité de labo (OpenSSL, préparée par l'enseignant).
2. **Station de diagnostic** : ESP32 + capteur de courant (INA219) sur le câble USB du lecteur (« la puce est-elle vivante ? ») + script PowerShell qui teste les maillons : carte, lecteur, lecture par Windows, certificat (dates, liste noire), heure du poste, réseau et portail. Le premier maillon en échec est la cause.
3. **Impression sécurisée** : le poste Windows imprime vers un serveur CUPS (Ubuntu) qui **retient** le travail ; à l'imprimante, un ESP32 + lecteur NFC (PN532) + petit écran lit la carte et demande au serveur de **libérer** les documents de l'agent.
4. **Serveur** (Python, SQLite) : table carte ↔ agent (empreinte de la carte, pas son numéro), journal, tableau de bord.

## 5. Scénario (à développer)
Karim arrive au service paye. Sa carte ne marche pas dans le navigateur : la station dit « maillon heure : poste en retard de 7 min » et propose de remettre l'heure. Plus tard, il imprime un bulletin à corriger : rien ne sort tant qu'il n'a pas posé sa carte sur l'imprimante. Un document jamais récupéré est supprimé au bout de quelques heures.

## 6. Découpage proposé (à chiffrer en détail)
| Version | Contenu | Heures (ordre de grandeur, avec IA) |
|---|---|---|
| **V1 obligatoire** | connexion par carte au portail ; station de diagnostic (mesure + maillons) ; impression retenue et libérée par la carte ; serveur avec journal chaîné | ≈ 110 h |
| **V2 visée** | diagnostic étendu à l'imprimante (« carte lue ? serveur joint ? document en attente ? ») ; remèdes à paliers ; suppression automatique des documents oubliés ; tableau de bord ; parcours d'accueil d'un arrivant | ≈ 35 h |
| **Extensions** | impression chiffrée (IPPS) ; PIV en sans contact (une seule PKI) ; libre-service pour l'agent | — |

## 7. Sécurité, vie privée, paliers
- **Question de sécurité de Yaksan (inchangée, décision du 11/11)** : « quelqu'un a-t-il effacé ce qui s'est passé ? » → journal chaîné des connexions et des impressions libérées, dernier haché envoyé au serveur ; démonstration « ligne effacée détectée ».
- **Paliers** pour toute action sur une machine (remède, suppression d'un document) : simulation → confirmation humaine → automatique.
- **Vie privée** : le journal dit qui a imprimé quoi et quand → données personnelles : on ne garde pas le contenu ni le titre des documents, conservation limitée (durée à fixer, à vérifier auprès des recommandations CNIL), personnes fictives sur la maquette.

## 8. Réseau en place (C10)
DNS et NTP de la maquette ; protocole d'impression IPP (port 631) observé à Wireshark (un document qui passe **en clair** sur le réseau, puis en IPPS en extension) ; échange TLS avec demande de certificat client ; accès HTTP à la liste noire (CRL).

## 9. Physique (à valider avec le collègue de physique)
- **Principal : le sans-contact.** La carte n'a pas de pile, le lecteur l'alimente par son champ magnétique. Résonance de l'antenne f = 1/(2π√(LC)) comparée à 13,56 MHz ; **portée de lecture** selon la distance, l'orientation et la présence de métal (le capot de l'imprimante !), avec incertitudes → décide où placer le lecteur.
- **Court** : courant consommé par la puce à contacts (saine, sale, morte ; 20 insertions, incertitude).
- **Court** : dérive de l'horloge du poste face au NTP (explique un refus de certificat).

## 10. Indicateurs mesurés sur la maquette (proposition)
- Diagnostic : bonne cause trouvée sur ≥ 18 pannes injectées sur 20.
- Temps pour trouver la cause, avec et sans la station (chronométré).
- Impression : délai entre la carte posée et la première page (cible à fixer).
- Lecture de la carte : 100 % de réussite à la distance choisie, sur 50 essais.

## 11. Matériel (prix à confirmer)
Cartes hybrides PIV + DESFire (environ 10 à 30 € pièce, × 5) ; 2 lecteurs à contacts USB CCID (environ 15 à 25 €) ; PN532 (environ 10 €) ; INA219 (environ 5 €) ; petit écran OLED ; une imprimante du lycée.

## 12. À vérifier
- Le type réel de la carte agent et la façon d'imprimer dans le service (le tuteur).
- Disponibilité des cartes hybrides et bibliothèque DESFire AES pour ESP32 : **banc d'essai à faire avant de lancer Yaksan**.
- Doublon perçu avec Wassim : à relire quand les deux projets seront écrits.
- Prénom de Yaksan = apprenti 2 : toujours à confirmer.
