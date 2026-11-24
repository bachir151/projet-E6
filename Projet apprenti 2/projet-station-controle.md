# Yaksan (apprenti 2) – Station de contrôle des postes, de la remise à la restitution

> **Décision du 24/11/2026** : nouveau projet de Yaksan. **Le tuteur a validé l'idée du projet** (information donnée par l'enseignant le 24/11). Les chiffres du besoin restent à obtenir (§ 1).
> L'ancien projet « Boîte noire du poste » et les pistes du 19/11 (carte agent, ALCASAR) sont rangés dans `archives/`.
> Titre de travail. « QualiPC » est une autre idée de nom, mais il est peut-être déjà pris : à vérifier.
> Heures et prix : ordres de grandeur.

## En une phrase
Le PC affiche une couleur ou joue un son ; un capteur posé contre lui vérifie le résultat. On mesure le PC quand on le remet à un agent, on le remesure quand il est rendu, et on compare.

## 1. Le besoin
- Missions de Yaksan : support et **accueil des nouveaux agents** (service carrière et paye d'une administration de l'État, contexte anonymisé).
- Un agent qui arrive reçoit un portable. Un agent qui part le rend. Le PC est ensuite remis à quelqu'un d'autre.
- Aujourd'hui (à confirmer) : contrôle rapide à l'œil et à l'oreille, sans trace écrite.
- Les **défauts partiels** passent inaperçus : écran moins lumineux, haut-parleur faible ou d'un seul côté, micro étouffé, port USB qui charge mais ne transmet plus. Le nouvel agent les découvre, souvent le premier jour : ticket, temps perdu, mauvaise première impression.
- **Pourquoi un capteur** : Windows sait qu'un haut-parleur est branché, pas qu'il produit du son. Il sait qu'un écran est relié, pas qu'il éclaire bien. Le capteur remplace un jugement (« j'entends », « ça a l'air bien ») par une mesure qu'on garde et qu'on compare.

### Hypothèses chiffrées (valeurs proposées, à remplacer par celles du tuteur)
| Hypothèse | Valeur proposée | À quoi elle sert |
|---|---|---|
| PC remis + PC rendus par an | 20 à 40 | justifier une station |
| Durée du contrôle actuel | 5 à 10 min, sans rapport | comparer avec la station |
| PC remis avec un défaut découvert par l'agent | environ 1 sur 10 | gain attendu |
| Parc | portables Windows, 2 ou 3 modèles | seuils par modèle |

## 2. Scénario
1. **Arrivée de Karim.** Yaksan pose le portable sur la station, ouvre la page de test et choisit « remise ». En moins de 5 minutes, le rapport d'arrivée est enregistré.
2. **Deux ans plus tard, Karim part et rend le PC.** Même test, mode « restitution ». La station compare : luminance de l'écran −35 % (plus que l'usure normale), haut-parleur droit −18 dB par rapport à l'arrivée.
3. **Décision proposée** : « à réparer avant de le remettre ». Yaksan confirme. Le rapport décrit **l'état du PC**, il ne dit pas que c'est la faute de Karim.

## 3. Ce qui existe déjà
| Solution | Ce qu'elle fait bien | Ce qui lui manque |
|---|---|---|
| Contrôle à l'œil et à l'oreille | rapide, gratuit | subjectif ; rate les défauts partiels ; aucune trace |
| Diagnostics des fabricants lancés avant Windows (HP PC Hardware Diagnostics UEFI, Dell SupportAssist en pré-démarrage, Lenovo Diagnostics) | mémoire, disque, batterie ; indépendants de Windows | pour le son et l'écran, ils demandent souvent au technicien ; un outil par marque ; pas de comparaison remise/restitution (**à vérifier modèle par modèle**) |
| Outils des reconditionneurs (PC-Doctor, Eurosoft Pc-Check, PassMark BurnInTest) | tests complets, rapports | payants, à installer ; pour le son, jugement humain ou câble de bouclage (**à vérifier**) |
| Sites de test en ligne (clavier, pixels morts) | gratuits, rien à installer | aucun capteur, aucune trace, Internet nécessaire |
| Inventaire du parc (GLPI) | qui a quel PC | ne mesure rien |

## 4. La solution

### Architecture
| Élément | Rôle |
|---|---|
| **Portable testé** (Windows) | ouvre la page de test en HTTPS. Rien à installer, aucun droit d'administrateur |
| **Station** (PC Ubuntu) | serveur Flask + SQLite ; enchaîne les étapes du test (WebSocket) ; calcule les verdicts ; rapports chaînés ; copie hors ligne |
| **Tête de mesure** (ESP32 relié en USB à la station) | capteur de couleur TCS34725 dans un tube noir ; micro I²S INMP441 ; émetteur MAX98357A + petit haut-parleur |
| **Support** | gabarit qui place le PC toujours au même endroit ; mousse contre le bruit du bureau |
| **Réseau du lycée** | DHCP, DNS, NTP ; switch HP ProCurve (V2) |

L'ESP32 est relié en USB, pas par le réseau : la question « le capteur est-il le vrai ? » ne se pose pas (elle reste celle de Lorenzo).

### Déroulé d'un contrôle
1. Le technicien se connecte, saisit le numéro d'inventaire du PC (ou lit son code QR), choisit « remise » ou « restitution ».
2. La page passe en plein écran. Elle vérifie les réglages demandés (secteur branché, luminosité à 100 %) et les fait confirmer par le technicien.
3. Écran → son → micro → clavier et pavé tactile → liste de contrôle physique.
4. La station compare chaque mesure à deux références : le **rapport précédent du même PC** et la **plage des PC sains du même modèle**.
5. Elle propose un verdict par composant et une décision. **Le technicien valide** : c'est le palier « confirmation humaine ». La station n'agit jamais sur le PC.

## 5. Les tests en détail
| Test | Stimulus (page web) | Mesure | Verdict | Pièges à traiter | Version |
|---|---|---|---|---|---|
| **Écran** | rampe de gris (9 à 17 niveaux), puis rouge, vert, bleu, blanc | TCS34725 au centre de l'écran, tube noir | luminance max, gamma, réponse de chaque couleur | LED blanche de la carte à éteindre ; luminosité 100 % (pas de PWM) ; éclairage nocturne coupé ; réglage « luminosité selon le contenu » coupé (Windows 11, Intel DPST) ; temps d'intégration ≥ 100 ms | V1 |
| **Haut-parleurs** | 3 fréquences (≈ 500 Hz, 1 kHz, 4 kHz), canal gauche puis droit | INMP441 à distance fixe, algorithme de Goertzel | niveau relatif, équilibre gauche/droite, rapport signal/bruit | volume Windows et « améliorations audio » : comparer des **rapports** de niveaux, pas des niveaux absolus | V1 |
| **Micro du PC** | l'ESP32 joue une fréquence connue | la page l'analyse (Web Audio) | fréquence reçue, niveau minimal | `getUserMedia` exige HTTPS ; autorisation du navigateur | V1 |
| **Clavier, pavé tactile** | grille de touches, zone de tracé | la page enregistre les événements | « constaté par le technicien » | Fn n'envoie en général rien ; Ctrl+Alt+Suppr et certaines touches système n'arrivent pas au navigateur : le rapport le dit | V1 |
| **État physique** | liste de contrôle (coque, charnière, touches) | saisie | « constaté par le technicien » | — | V1 |
| **Webcam** | — | mire dans un capot fermé ; netteté (variance du laplacien), couleurs | netteté, couleurs | **aucune personne filmée**, image traitée dans le navigateur, **jamais gardée ni envoyée** | V2 |
| **USB** | — | un ESP32-S3 se présente comme clavier et tape un code ; INA219 : tension du port sous charge limitée à 500 mA | données OK, tension OK | l'ESP32 classique n'a pas d'USB natif | V2 |
| **Ethernet** | — | SNMP en lecture sur le port du ProCurve : vitesse négociée, erreurs | 1 Gb/s attendu, pas d'erreurs | — | V2 |
| Batterie, HDMI, uniformité de l'écran (9 points), couleur du blanc | — | — | — | batterie : accès sans droits d'administrateur à vérifier | extensions |

Chaque ligne du rapport indique son mode : **mesuré** ou **constaté par le technicien**.

## 6. Découpage et charge (avec IA, selon la charte)
| Bloc | Avec IA | Sans IA |
|---|---|---|
| Gestion, revues, dossier, soutenance | 30 | 30 |
| Page de test (enchaînement, couleurs, sons, micro, clavier, pavé) | 16 | 26 |
| Serveur, base, comparaison, rapport | 12 | 18 |
| Synchronisation page ↔ station ↔ ESP32 | 6 | 9 |
| ESP32 écran et audio, support mécanique | 18 | 24 |
| Rapports chaînés, HTTPS, comptes | 6 | 8 |
| Exploitation du réseau | 8 | 8 |
| Physique | 18 | 18 |
| Recette avec défauts injectés | 12 | 12 |
| Relecture et explication du code généré | 6 | — |
| **Total V1** | **≈ 132 h** | **≈ 153 h** |

- **V1 obligatoire (≈ 132 h)** : écran, haut-parleurs, micro, clavier et pavé tactile, liste de contrôle, rapports chaînés, comparaison avec seuils, réseau.
- **V2 visée (≈ 20 à 25 h)** : webcam, USB, Ethernet par SNMP, statistiques du parc.
- **Extensions** : batterie, HDMI, uniformité, couleur du blanc.

## 7. Physique (à valider avec le collègue de physique)
**Question** : à partir de quelle baisse de luminance un écran est-il « usé » ? Le capteur est-il assez fiable pour le dire ?

- **Principal : luminance et gamma de l'écran.**
  - Modèle : L(v) = Lmax · (v/255)^γ ; le modèle sRGB (IEC 61966-2-1) donne γ ≈ 2,2.
  - Étalonnage : le TCS34725 n'a pas la sensibilité de l'œil ; on le compare au luxmètre du lycée posé contre l'écran. Le luxmètre mesure un éclairement : pour un écran large, E ≈ π·L (approximation à discuter avec le collègue).
  - Mesures : rampe de gris, 10 répétitions, repositionnement du PC entre chaque série. Droite ln L = f(ln v) : la pente donne γ.
  - Incertitudes : type A (dispersion des répétitions), type B (notices du capteur et du luxmètre).
  - Confrontation : γ mesuré face à 2,2 ; Lmax d'un PC sain face à un PC « usé » (luminosité baissée).
- **Court : acoustique.** Niveau relatif en dB (20·log du rapport des amplitudes) ; étalonnage du micro avec le sonomètre du lycée à 1 kHz (notice INMP441 : −26 dBFS à 94 dB SPL) ; échantillonnage et Shannon (fréquences de test < fe/2) ; rapport signal/bruit dans un bureau.
- **Le fil commun : les seuils.** Le seuil OK/défaut vient de la dispersion mesurée sur des PC sains (par exemple moyenne − 3σ), avec le taux de fausses alarmes qui en découle. La physique fixe donc directement la décision.

## 8. Sécurité : la question de Yaksan
Elle découle de la répartition du 11/11 (« quelqu'un a-t-il effacé ce qui s'est passé ? ») : **« Le rapport de remise a-t-il été modifié avant la comparaison ? »**
- Chaque rapport contient l'empreinte SHA-256 du rapport précédent (chaîne). Les rapports sont horodatés par NTP.
- Le dernier haché est copié chaque jour **hors ligne** (clé USB).
- Démonstration : on change « Défaut » en « OK » dans la base → l'outil de vérification signale la rupture de la chaîne.
- Limite à dire : la chaîne **détecte** une modification, elle ne l'empêche pas. Quelqu'un qui recalcule toute la chaîne est trahi par la copie hors ligne.
- Comptes techniciens (mot de passe haché, jamais en dur), HTTPS par l'autorité de labo, liste rouge de la charte IA.
- Yaksan ne fait **pas** de HMAC (Lorenzo) ni de signature de fichiers (Aziza).

## 9. Vie privée
- Le rapport contient le PC, la date, le technicien et les mesures. Le lien avec l'agent est **facultatif** (à décider avec le tuteur) : il ne sert pas à la décision.
- Vocabulaire : « état du matériel », jamais « faute de l'agent ». L'usure normale est attendue et a son propre seuil.
- Aucun son enregistré, aucune image gardée : seulement des mesures.
- Durée de conservation à fixer (à vérifier dans les recommandations de la CNIL). Personnes fictives sur la maquette.

## 10. Réseau en place (C10)
- DHCP et DNS de la maquette : la station a un nom ; le PC testé l'obtient par le DNS.
- HTTPS : certificat signé par l'autorité de labo (préparée par l'enseignant, comme pour les autres apprentis) ; capture de la poignée de main TLS.
- NTP : horodatage des rapports, indispensable à la chaîne.
- Captures Wireshark des échanges entre la page et la station (WebSocket).
- V2 : SNMP en lecture sur le port du ProCurve (vitesse, erreurs).
- Pas de VLAN ni d'ACL à configurer (C09, épreuve E5).

## 11. Valorisation de la donnée
- Base SQLite : PC, modèle, rapports, mesures.
- Sauvegarde hors connexion (avec le dernier haché).
- Script de traitement : dérive de la luminance par modèle et par année, composants le plus souvent en défaut, part des PC rendus « à réparer ».
- Rapport d'analyse remis au tuteur.

## 12. Indicateurs mesurés sur la maquette
| Indicateur | Cible |
|---|---|
| Défauts injectés trouvés | ≥ 18 sur 20 |
| Fausses alarmes sur PC sains | ≤ 1 sur 20 passages |
| Répétabilité : même PC, 10 passages | 10 verdicts identiques |
| Durée d'un contrôle complet | < 5 min, comparée au contrôle à la main chronométré |
| Modifications de rapport détectées | 100 % sur N essais |

**Défauts injectés sans rien abîmer** : luminosité baissée ou film gris neutre sur l'écran ; adhésif sur un haut-parleur ; balance gauche/droite décalée dans Windows ; mousse sur le micro ; film translucide sur la webcam ; câble USB « charge seule ».

## 13. Frontières avec les autres apprentis
| | Ce qu'il fait | Ce que Yaksan ne fait pas |
|---|---|---|
| Wassim (1) | configure le PC neuf d'un médecin (domaine, applications) ; pannes d'imprimante ; GLPI ; SNMP de l'imprimante | pas de configuration du PC, pas de GLPI, pas d'imprimante |
| Aziza (4) | trace le passage des PC (étiquette RFID) et leurs fichiers métier | pas de RFID, pas de suivi des mouvements |
| Lorenzo (3) | radar, verrouillage, leurre réseau, HMAC | pas de HMAC |
| **Yaksan (2)** | **mesure l'état physique d'un PC qui change de main** | — |

## 14. Matériel (prix à confirmer)
| Matériel | Prix |
|---|---|
| TCS34725 | 8 à 15 € |
| INMP441 | 3 à 6 € |
| MAX98357A + petit haut-parleur | 6 à 10 € |
| ESP32 | lycée |
| ESP32-S3 (V2) | ≈ 10 € |
| INA219 (V2) | ≈ 5 € |
| Mousse, tube, support | 10 à 20 € |
| Luxmètre, sonomètre | labo de physique |
| 2 ou 3 portables Windows | **à trouver au lycée** |
| **Total** | **≈ 40 à 70 €** |

## 15. Risques
| Risque | Probabilité | Parade |
|---|---|---|
| Pas de portables Windows au lycée | moyenne | PC fixes du lycée avec écran et haut-parleurs USB (moins réaliste, mais la chaîne de mesure est la même) |
| Mesures peu répétables | moyenne | gabarit, tube noir, mousse ; essai de répétabilité dès janvier |
| Le navigateur bloque micro ou caméra | faible sur maquette | HTTPS par l'autorité de labo ; au ministère, à vérifier (stratégies Edge) |
| Trop de tests, retard | moyenne | V1 limitée à 4 mesures ; webcam, USB, Ethernet en V2 |
| Doublon perçu avec Wassim ou Aziza | moyenne | tableau du § 13 dans chaque dossier |
| Réalisation au lycée refusée | à connaître | demande de validation à l'académie (voir § 17) |
| Formulaire du 12/11 (boîte noire) déjà envoyé | certain | prévenir l'inspection qu'il est remplacé |

## 16. À demander ou vérifier
- Tuteur : les chiffres du § 1 ; qui reçoit le PC rendu et ce qu'il devient ; navigateur utilisé ; lien avec l'agent dans le rapport (oui/non) ; modèles de portables (pour les seuils).
- Lycée : portables disponibles ; luxmètre et sonomètre (collègue de physique).
- Banc d'essai d'une demi-journée avant le lancement : TCS34725 et rampe de gris sur un écran ; INMP441 et détection d'une fréquence.
- Fonctions exactes des diagnostics des fabricants (§ 3).
- Nom du projet.

## 17. Point réglementaire
L'arrêté du 25 janvier 2023 indique : « Pour les apprentis les projets doivent impérativement être développés dans l'entreprise. » La réalisation au lycée, sur maquette, avec des PC du lycée et des données fictives, **doit être validée par l'académie**. Aucun accès aux postes ni aux données du service.
