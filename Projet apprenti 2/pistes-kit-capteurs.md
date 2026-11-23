# Yaksan (apprenti 2) – le kit de 38 modules, au service de son quotidien (23/11/2026)

> Source : liste des 38 modules d'un kit Arduino/ESP32 (vidéo Technifyi, résumé transmis par l'enseignant). Quotidien de Yaksan : arrivées et départs, certificat de carte expiré, portables (alimentation, capot), périphériques en panne. **Rien n'est décidé.**

## 1. Tri du kit
| Utile pour Yaksan | À éviter (doublon ou règle) | Sans rapport avec son travail |
|---|---|---|
| **Capteur de force + HX711** (pesée) | Radar micro-ondes, PIR : présence = apprenti 3 | Sol, pluie (sauf fuite d'eau sous une baie), ligne, obstacle |
| **Hall linéaire et numérique** (aimants, capot) | RFID : apprentis 1 et 4 | Flamme, laser, couleur, joystick |
| **DS18B20, thermistance NTC** (température) | Vibration, choc : apprenti 1 (imprimante) | Pouls : donnée de santé, exclu |
| Interrupteur à lame souple (porte, tiroir) | Empreinte digitale : biométrie au travail, très encadrée (CNIL, à vérifier) | Émetteur/récepteur IR (télécommandes) |
| Bouton, encodeur rotatif, LED RGB, buzzer (interface) | Relais sur 230 V : interdit sur la maquette | MQ-2 fumée : pas une détection certifiée |

**Manque dans le kit** (à acheter, quelques euros, à confirmer) : capteur de courant et tension **INA219/INA226** (indispensable pour tout ce qui est électrique), écran à encre, ESP32-S3 (hôte USB).

## 2. Quatre pistes avec ce kit
### P1. Le casier des arrivées et des départs
- **Quotidien** : la majorité des tickets. À l'arrivée, l'agent reçoit portable, chargeur, casque, souris ; au départ, il doit tout rendre, et ses accès doivent être coupés.
- **Principe** : un casier de remise posé sur un **capteur de force**, porte surveillée par un **interrupteur à lame souple**. Le casier sait si le kit est complet, à la remise comme au retour. Le serveur associe le casier à une fiche de mouvement : liste des accès à ouvrir (arrivée) ou à couper (départ), avec paliers.
- **Code** : firmware ESP32 (HX711, porte, LED, buzzer), serveur (fiche de mouvement, état du kit, liste des accès), mail automatique à l'agent et au technicien.
- **C10** : messagerie (SMTP, c'est son domaine), DNS, NTP, API du serveur ; captures.
- **Physique** : pont de Wheatstone, étalonnage avec des masses connues, linéarité, dérive dans le temps (fluage) et avec la température, incertitudes. **Décide** quels objets on peut reconnaître au poids (portable ≈ 1,3 kg, chargeur ≈ 300 g, souris ≈ 80 g, carte ≈ 5 g : sans doute indétectable, à mesurer) et le seuil de « manque ».
- **Sécurité** : « quelqu'un a-t-il effacé ce qui s'est passé ? » : journal chaîné des ouvertures, remises et coupures d'accès.
- **Attention** : « matériel qui sort » ressemble à la borne de sortie de l'apprentie 4. Différence à écrire : ni RFID ni suivi du parc ; on vérifie un **kit complet** et une **liste d'accès**.

### P2. L'établi du support, version kit (suite de `pistes-esp32-quotidien.md`)
- **Quotidien** : périphériques en panne, alimentation, chargeur qui chauffe.
- **Apport du kit** : **DS18B20** collés sur le chargeur et sur le câble ; un chargeur fatigué perd plus d'énergie, donc chauffe plus. Avec l'INA219 (à acheter) : puissance en entrée du portable.
- **Physique** : pertes = chaleur ; élévation de température ΔT ≈ R_th × P_pertes, constante de temps de chauffe ; mesure face au modèle, incertitudes. **Décide** d'un seuil « chargeur à remplacer ».
- **Interface** : encodeur rotatif pour choisir le test, LED RGB et buzzer pour le verdict.

### P3. Le portable qui s'endort tout seul
- **Quotidien** : « fermeture du capot ». Un portable détecte le capot fermé grâce à un capteur à effet Hall et un aimant. Un aimant extérieur (étui de téléphone, sacoche, support) peut le mettre en veille par erreur (à vérifier sur les modèles du service).
- **Principe** : un **Hall linéaire** sur ESP32 cartographie le champ autour du portable ; un script PowerShell lit dans les journaux de Windows pourquoi et quand le PC s'est mis en veille ; le programme croise les deux.
- **Physique** : très forte. Champ d'un aimant selon la distance (modèle du dipôle, B ∝ 1/d³) confronté aux mesures, étalonnage du capteur, incertitudes. **Décide** d'une distance de sécurité et d'une consigne simple pour les agents.
- **Critique** : besoin probablement rare ; C10 faible. Bonne **partie physique**, pas un projet entier.

### P4. La sonde du local technique (rappel de `pistes-libres.md`, idée 3)
- **Apport du kit** : plusieurs DS18B20 sur un seul fil (écart de température en haut et en bas de la baie), DHT11 (humidité), capteur de pluie posé au sol comme **détecteur de fuite d'eau**, interrupteur à lame souple sur la porte.
- **Critique** : ce n'est pas le quotidien de Yaksan (support aux agents), mais celui d'un service informatique.

## 3. Comparaison (notes de 1 à 5)
| Critère | P1 Casier | P2 Établi | P3 Veille par aimant | P4 Local |
|---|---|---|---|---|
| Lien avec son quotidien | 5 | 4 | 3 | 2 |
| Le kit sert vraiment | 4 | 3 | 4 | 5 |
| Physique utile et mesurable | 4 | 4 | 5 | 4 |
| Code personnel (C08) | 5 | 4 | 3 | 4 |
| C10 | 4 | 3 | 1 | 4 |
| Faisable en 150 h | 4 | 4 | 4 | 5 |
| Pas de doublon (5 = sûr) | 3 | 5 | 5 | 4 |
| **Total sur 35** | **29** | **27** | **25** | **28** |

## 4. Recommandation
**P1, le casier des arrivées et des départs**, parce qu'il touche le cœur du travail de Yaksan : ses accès (messagerie, boîtes partagées, compte Internet) et le matériel de l'agent, dans un même parcours. La pesée donne une vraie physique d'étalonnage, et la messagerie donne un C10 naturel.
- Idée d'enrichissement : **P3 comme second essai de physique** (court), si le problème du capot est confirmé.
- Risque principal : être vu comme proche de l'apprentie 4. À trancher par l'enseignant.

## 5. À demander à Yaksan
1. Que reçoit un arrivant, concrètement (portable, chargeur, casque, souris, station) ? Qui le lui remet ?
2. Au départ, le matériel revient-il au support ? Arrive-t-il qu'il manque quelque chose ?
3. Des portables se mettent-ils en veille « tout seuls » ? Avec un étui ou un support aimanté à côté ?
