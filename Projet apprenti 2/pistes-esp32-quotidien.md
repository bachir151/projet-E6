# Yaksan (apprenti 2) – pistes ESP32 + capteurs pour son travail quotidien (23/11/2026)

> Point de départ : ce que Yaksan a décrit le 23/11 (portables, certificat de carte expiré, périphériques qui ne marchent plus, alimentation, arrivées et départs). **Rien n'est décidé.** Besoins à faire confirmer par le tuteur.
> Garde-fous : pas de GLPI au centre, pas d'imprimante, pas de préparation de PC neufs (apprenti 1) ; pas de détection de présence, pas de leurre, pas de HMAC de boîtier (apprenti 3) ; pas de RFID de suivi du parc, pas de fichiers signés (apprentie 4) ; pas de Wi-Fi comme physique (déjà chez l'apprentie 4).

## Cinq pistes
### A. La station carte : « ta carte va-t-elle marcher ? »
- **Quotidien visé** : certificat expiré (panne la plus citée), carte qui « ne marche pas » au portail.
- **Principe** : l'agent pose sa carte. Le PC lit le certificat (dates, émetteur) ; un ESP32 mesure le courant du lecteur (la puce répond-elle ?) et teste la partie sans contact ; un écran à encre affiche « carte saine, certificat valable jusqu'au 12/03 » ou « certificat expiré : voici la marche à suivre ».
- **Code** : PowerShell (lecture du certificat), firmware ESP32 (INA219, lecteur sans contact, écran), serveur et alerte « expire dans moins de 30 jours ».
- **C10** : NTP (heure juste, sinon faux « expiré »), accès à la liste de révocation en HTTP, TLS avec certificat client capturé.
- **Physique** : courant de la puce (saine, sale, morte ; 20 essais ; incertitudes) → **décide** du seuil « carte vivante ». Variante : résonance de l'antenne sans contact (13,56 MHz) et portée.
- **Critique** : la panne réelle (certificat expiré) se règle **par logiciel** ; l'ESP32 apporte peu sur ce point. Lecture sans contact : proche du RFID des apprentis 1 et 4.

### B. Le banc des périphériques et des câbles USB
- **Quotidien visé** : « le périphérique ne marche plus » (souris, clavier, casque, station d'accueil, câble).
- **Principe** : on branche le périphérique sur le banc, pas sur un PC. Un ESP32-S3 (qui peut jouer l'hôte USB) lit ce que l'appareil déclare (type, consommation annoncée), un capteur mesure le courant réel et la tension. Verdict : « périphérique HS », « câble trop résistant », « consomme plus que ce qu'il annonce ».
- **Code** : firmware hôte USB, mesures, base des verdicts par modèle, page web.
- **C10** : envoi des résultats au serveur (HTTPS ou MQTT), DHCP, DNS, NTP ; captures. **Moyen.**
- **Physique** : résistance d'un câble R = ΔU / I sous charge connue, comparée au modèle R = ρL/S ; chute de tension en bout de câble face à la tension minimale admise par l'USB (à vérifier) ; courant mesuré face au courant déclaré. **Décide** : câble accepté ou jeté, longueur maximale.
- **Sécurité** : le banc protège le PC d'une clé piégée (un appareil qui se déclare clavier alors qu'il est vendu comme clé). Question possible : « ce périphérique est-il ce qu'il prétend être ? » **À comparer** avec la question de l'apprenti 3 (authenticité de son boîtier) ; sinon garder le journal chaîné.

### C. La station énergie des portables : chargeur, câble ou batterie ?
- **Quotidien visé** : « alimentation », portable qui ne charge pas ou s'éteint.
- **Principe** : on place la station entre le chargeur USB-C et le portable. L'ESP32 lit la tension négociée (5, 9, 15 ou 20 V), le courant et la puissance, et les compare à ce que le chargeur annonce. Le portable donne l'état de sa batterie (rapport Windows lu par PowerShell). Verdict : le coupable est le chargeur, le câble ou la batterie.
- **Code** : firmware de mesure (et lecture de la négociation USB-C, à vérifier selon le circuit), PowerShell (rapport batterie), serveur, historique par portable.
- **C10** : lecture du rapport batterie à distance (PowerShell à distance), envoi au serveur, NTP ; captures.
- **Physique** : P = U·I, pertes dans le câble (R·I² à 3 A), rendement, énergie réellement stockée face à la capacité annoncée par Windows. **Décide** de l'élément à remplacer et d'un seuil « batterie à changer ».
- **Critique** : chargeur branché sur une prise murale (appareil du commerce, pas de câblage) : à valider avec le lycée. Ne pas mesurer une pile nue (jugé artificiel chez Wassim).

### D. Le testeur de prise réseau et de compte Internet
- **Quotidien visé** : arrivée d'un agent (compte Internet filtré à 3 niveaux), « Internet ne marche pas ».
- **Principe** : un ESP32 avec Ethernet, branché sur la prise du bureau, enchaîne les tests : lien, adresse DHCP, DNS, proxy, puis une page de test par niveau d'accès. Il dit quel maillon casse, et confirme qu'un nouveau compte a bien le bon niveau.
- **Code** : firmware de tests, serveur, historique par prise.
- **C10** : **très riche** (DHCP, DNS, authentification au proxy, codes HTTP, captures).
- **Physique** : **faible**. Seule piste sérieuse : la réflectométrie du câble (voir `pistes-libres.md`, idée 2), qui demande l'oscilloscope.
- **Critique** : ressemble au « visiteur robot » de la piste ALCASAR ; module Ethernet W5500 aussi utilisé par l'apprenti 3 (pour un autre usage).

### E. Le portable qui chauffe capot fermé sur sa station d'accueil
- **Quotidien visé** : « fermeture du capot », ralentissements, arrêts.
- **Principe** : capteurs de température et de flux d'air autour du portable ; le PC fournit sa température interne et sa fréquence ; comparaison capot ouvert ou fermé, à plat ou sur support.
- **Physique** : **forte** (échauffement, constante de temps, modèle face aux mesures) → **décide** de la consigne (support vertical, capot ouvert).
- **Critique** : besoin étroit, C10 faible ; le problème réel du capot est peut-être la veille, pas la chaleur (à demander).

## Comparaison (notes de 1 à 5)
| Critère | A Carte | B USB | C Énergie | D Prise réseau | E Chaleur |
|---|---|---|---|---|---|
| Lien avec le quotidien cité | 5 | 4 | 4 | 4 | 2 |
| ESP32 vraiment utile | 2 | 5 | 5 | 4 | 4 |
| Physique utile et mesurable | 3 | 5 | 4 | 1 | 4 |
| Code personnel (C08) | 4 | 5 | 4 | 4 | 3 |
| C10 | 3 | 3 | 3 | 5 | 1 |
| Faisable en 150 h | 4 | 4 | 3 | 5 | 4 |
| Pas de doublon (5 = sûr) | 2 | 5 | 4 | 3 | 5 |
| **Total sur 35** | **23** | **31** | **27** | **26** | **23** |

## Recommandation
**Fusionner B et C en un seul projet : « l'établi du support »**, une station de diagnostic **électrique** des portables et de leurs accessoires (chargeur, câbles, périphériques USB).
- Une seule physique, cohérente : U, I, R, P, pertes, énergie.
- L'ESP32 y est indispensable, le code est riche, aucun doublon.
- V1 : banc USB (périphériques et câbles) + serveur et historique. V2 : énergie (chargeur, câble USB-C, batterie). La lecture du certificat de la carte (piste A) peut s'ajouter en extension, côté logiciel.
- Point faible : C10 moyen. On le renforce avec la lecture à distance de l'état des portables (PowerShell à distance), l'envoi des résultats au serveur et des captures commentées.
- **Nom à éviter** : « station », déjà utilisé pour les PC neufs de l'apprenti 1.

## Matériel (prix à confirmer)
ESP32-S3 environ 10 à 15 € ; INA219 ou INA226 environ 5 € ; circuit de lecture USB-C (négociation de puissance) environ 5 à 15 € ; résistances de puissance environ 10 € ; écran à encre environ 15 à 25 € ; câbles et périphériques de test usagés (récupération).

## À demander à Yaksan
1. Combien de tickets « périphérique » et « alimentation » par mois ? Que fait-il aujourd'hui (il change l'appareil ? le câble ?)
2. Les portables se chargent-ils en USB-C ? Y a-t-il des stations d'accueil ?
3. Que deviennent les périphériques et chargeurs « en panne » (jetés, renvoyés, testés) ?
