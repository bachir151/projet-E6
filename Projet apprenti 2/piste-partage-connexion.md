# Yaksan (apprenti 2) – piste « le partage de connexion qui contourne le réseau » (23/11/2026)

> Consigne de l'enseignant : **rien sur le courant électrique** (énergie, chargeur, batterie, courant). Test retenu : le capteur doit mesurer **ce que le technicien ignore et ne peut pas savoir autrement**. **Ébauche, rien n'est décidé.**

## Le problème
Le réseau du service est isolé ; Internet passe par un compte filtré (3 niveaux). Un agent peut contourner tout cela en une seconde : il active le **partage de connexion de son téléphone** et y connecte son portable. Le portable sort alors du réseau du service, sans filtre et sans trace côté service. Si l'agent efface ensuite l'historique Wi-Fi du portable, personne ne le saura.
*Hypothèse à faire confirmer par Yaksan : cela arrive-t-il ? Le Wi-Fi des portables est-il actif ?*

## Le test « est-ce artificiel ? »
| Question | Réponse |
|---|---|
| Le technicien peut-il le savoir autrement ? | En partie : Windows note les connexions Wi-Fi (journal WLAN-AutoConfig), **mais ce journal s'efface**. Un téléphone en partage de connexion émet des balises radio : seul un témoin radio indépendant le voit |
| La physique décide-t-elle de quelque chose ? | Oui. Un capteur radio voit des dizaines de réseaux, ceux des voisins et de la rue. Seule la **mesure de puissance reçue** permet de dire « ce point d'accès est **dans nos bureaux** » |

## La solution
- **Sentinelles radio** : deux ou trois ESP32 posés dans les bureaux. Ils écoutent **seulement les balises des points d'accès** (nom du réseau, identifiant, puissance reçue). Ils n'écoutent pas les téléphones des passants et ne lisent aucun contenu.
- **Côté portable** : un script PowerShell relève les connexions Wi-Fi du journal Windows et l'état des cartes réseau.
- **Serveur** : il croise les deux sources. « Point d'accès inconnu apparu dans le bureau 2 à 14 h 05, le portable P12 a quitté le réseau du service à 14 h 06 » → alerte. Si le journal du portable a été effacé, le témoin radio, lui, a gardé la trace.
- **Paliers** : simulation (on signale seulement) → confirmation du technicien → automatique (couper le Wi-Fi du portable par script) pour les seuls cas sans ambiguïté.

## Physique (sans courant électrique : propagation des ondes radio)
- **Grandeur** : puissance reçue RSSI (dBm) selon la distance, les murs et l'orientation.
- **Modèle** : affaiblissement en log de la distance, RSSI(d) = RSSI(d0) − 10·n·log10(d/d0) ; exposant n mesuré dans les locaux (couloir, bureau, mur).
- **Protocole** : un téléphone en partage de connexion placé à des distances connues ; N mesures par point ; fluctuations (évanouissements) de plusieurs dB → moyenne, écart-type, incertitude σ/√N ; effet d'un mur, d'une porte.
- **Décision** : seuil de puissance « dans nos locaux », avec son **taux d'erreur** (voisin pris pour un intrus, intrus manqué) ; nombre et place des sentinelles.

## Code (C08)
Firmware ESP32 (balayage des balises, filtrage, envoi au serveur), PowerShell (journal Wi-Fi, cartes réseau), serveur Python + base SQL (corrélation dans le temps, règles), tableau de bord, journal chaîné.

## Réseau en place (C10)
- Captures Wireshark des **trames de balise** 802.11 (champs, intervalle d'émission).
- Table des adresses MAC du switch et baux DHCP : le portable **disparaît** du réseau du service au moment du contournement.
- Journaux du proxy : un portable actif qui ne passe plus par le proxy.
- NTP : heure commune indispensable pour croiser sentinelles, portable et switch.

## Sécurité
Question de Yaksan, inchangée : **« quelqu'un a-t-il effacé ce qui s'est passé ? »** Démonstration : on contourne, puis on efface l'historique Wi-Fi du portable ; le témoin radio et le journal chaîné (dernier haché envoyé à une boîte séparée) montrent le contournement.
**Limite assumée** : un partage de connexion par **câble USB** n'émet aucune balise ; seul le côté réseau (portable disparu du switch) le révèle.

## Vie privée et droit (à vérifier)
- Balises des points d'accès seulement ; pas de capture des téléphones des personnes, aucun contenu.
- Le nom d'un partage de connexion contient souvent un prénom (« iPhone de Karim ») → nom tronqué ou haché, conservation courte.
- Surveillance au travail : information préalable des agents, avis des instances (règles CNIL et code du travail : **à vérifier**).
- Maquette : téléphones et comptes de test uniquement.

## Doublons
- Apprenti 3 : leurre réseau (quelqu'un touche une fausse imprimante). Ici : un **contournement radio du réseau**. Différent.
- Apprentie 4 : physique thermique (condensation). Pas de radio.
- Reprend l'esprit de l'« angle mort LoRa » (une sortie du réseau sans trace), mais à partir d'un geste **réel et courant** au lieu d'une radio inventée.

## Découpage (ordres de grandeur)
| Version | Contenu | Heures |
|---|---|---|
| V1 | 2 sentinelles, script PowerShell, corrélation sur le serveur, journal chaîné, essai de physique (modèle et seuil), captures | ≈ 105 h |
| V2 | Corrélation avec le switch et le proxy, paliers jusqu'à l'action automatique, tableau de bord, 3e sentinelle | ≈ 35 h |
| Extensions | Bluetooth (partage par Bluetooth), localisation grossière du point d'accès par plusieurs sentinelles | — |

## Matériel (prix à confirmer)
ESP32 du lycée ; 1 ou 2 ESP32 en plus (environ 5 à 10 € pièce) ; téléphones de test ; rien d'autre.

## À demander à Yaksan
1. Des agents utilisent-ils le partage de connexion de leur téléphone sur leur portable ? L'a-t-il déjà vu ?
2. Le Wi-Fi des portables est-il actif, ou bloqué par une règle ?
3. Les bureaux : combien de pièces, quelle taille (pour le nombre de sentinelles) ?

## Objection de l'enseignant (23/11) : « ils filtrent sûrement l'adresse MAC »
- Le filtrage par adresse MAC (ou 802.1X) décide **qui entre** sur le réseau du service. Il n'empêche pas un portable déjà autorisé d'aller **ailleurs** par sa carte Wi-Fi (partage du téléphone) : il ne protège donc pas contre ce contournement. (Et une adresse MAC se change facilement.)
- **Mais l'objection est juste sur le fond** : une administration protège sans doute le **portable lui-même** : liste blanche des réseaux Wi-Fi par stratégie de groupe, Wi-Fi coupé quand le câble est branché, **VPN permanent** qui force tout le trafic vers le ministère (probable sur des portables nomades), outil de sécurité sur le poste.
- Si ces protections existent, le partage de connexion ne donne rien : **la piste tombe** (ou se réduit à « vérifier que les protections tiennent », trop mince).
- **À demander à Yaksan** : VPN toujours actif ? Wi-Fi limité à certains réseaux ? Un portable peut-il se connecter au partage d'un téléphone ?
