# Yaksan (apprenti 2) – pistes libres, hors du cadre (23/11/2026)

> Remue-méninges demandé par l'enseignant : on oublie le tuteur et le quotidien de Yaksan. On garde seulement le cadre E6 (C01, C03, C08, C10, vraie physique, maquette, pas de 230 V câblé, pas de caméra), et pas de doublon avec les trois autres. Le lien avec le service (« proposition de valeur ») viendra après. **Rien n'est décidé.**

## Six idées
### 1. La diode optique : faire entrer des fichiers dans un réseau isolé, sans aucun retour possible
- **Problème** : un réseau coupé d'Internet a quand même besoin de recevoir des fichiers (documentation, listes, mises à jour). Une clé USB ou un câble réseau ouvrent un chemin dans les deux sens.
- **Solution** : un lien à sens unique par la lumière. Côté « extérieur », un ESP32 et une LED envoient ; côté « isolé », une photodiode et un autre ESP32 reçoivent. Il n'y a **physiquement pas** d'émetteur dans l'autre sens. Une fibre plastique relie les deux.
- **Code** : découpage des fichiers en trames, correction d'erreurs (pas d'accusé de réception possible), reconstitution et contrôle (CRC), serveur de dépôt d'un côté, de réception de l'autre, tableau de bord.
- **C10** : services de part et d'autre (partage SMB ou HTTP, DNS, NTP) ; captures qui montrent qu'aucun paquet ne revient.
- **Physique** : atténuation de la fibre (dB/m), puissance reçue, temps de montée de la photodiode, taux d'erreur selon le débit et la distance. **Décide** du débit maximal et du niveau de correction d'erreurs.
- **Sécurité** : « le réseau isolé peut-il fuir par ce lien ? » Démonstration : on tente de renvoyer des données ; rien ne passe, par construction.
- **Points d'attention** : produit du commerce existant (cher) : c'est l'argument. Transfert de fichiers : ne pas faire de signature (domaine de l'apprentie 4).

### 2. Le stéthoscope du câble : savoir où un câble est abîmé, et si quelqu'un s'y est branché
- **Problème** : une liaison réseau « qui marche mal » (erreurs, débit qui tombe) : on change le câble au hasard. Et personne ne sait si un câble a été modifié.
- **Solution** : réflectométrie. On envoie une impulsion très brève dans le câble et on écoute l'écho à l'oscilloscope ; le temps de retour donne la distance du défaut. Un programme compare chaque câble à sa « signature » de référence.
- **Code** : pilotage de l'oscilloscope par le réseau (commandes SCPI en Python), analyse des échos, base des signatures, croisement avec les compteurs d'erreurs des switchs.
- **C10** : compteurs d'interfaces des switchs ProCurve et du routeur (SNMP), vitesse négociée, LLDP/CDP pour savoir quel câble relie quoi.
- **Physique** : vitesse de propagation dans le câble (étalonnée sur une longueur connue), coefficient de réflexion Γ = (Z − Z0)/(Z + Z0), résolution liée au temps de montée, incertitudes. **Décide** de l'endroit du défaut et du seuil à partir duquel une signature « a changé ».
- **Sécurité** : « quelqu'un a-t-il branché quelque chose sur le câble ? » Démonstration : on insère un raccord ou une dérivation, la signature change.
- **Points d'attention** : mesure sur câble débranché (pas en service) ; il faut un générateur à front rapide (porte logique rapide, quelques euros) et un oscilloscope d'au moins 100 MHz (à vérifier au lycée).

### 3. Le local technique qui prévient avant de chauffer
- **Problème** : une baie réseau ou un petit local serveur chauffe quand la ventilation s'arrête. On l'apprend quand un équipement s'éteint.
- **Solution** : capteurs de température et de flux d'air sur ESP32, plus les sondes internes des équipements lues par le réseau, plus un **modèle** qui prédit « dans 18 minutes, on dépasse 35 °C ».
- **Code** : collecteur Python, modèle de prédiction, alertes, tableau de bord, firmware ESP32.
- **C10** : SNMP (températures internes du routeur Cisco, charge des interfaces), syslog, NTP.
- **Physique** : modèle de refroidissement de Newton, constante de temps mesurée sur une maquette de baie chauffée par une résistance en basse tension, incertitudes. **Décide** du seuil et du délai d'alerte.
- **Sécurité** : « peut-on faire taire l'alarme ? » Le silence d'un capteur devient lui-même une alarme (battement).
- **Points d'attention** : SNMP aussi chez l'apprenti 1 (imprimantes), mais pour autre chose.

### 4. Le parc qui dort bien
- **Problème** : des PC allumés la nuit et le week-end consomment pour rien ; mais les éteindre empêche les mises à jour nocturnes.
- **Solution** : mesurer la consommation réelle de chaque état (allumé, veille, veille prolongée, éteint), puis piloter le sommeil et le réveil du parc (Wake-on-LAN) selon une politique choisie par la mesure.
- **Code** : orchestrateur Python, scripts PowerShell sur les postes, lecture des prises mesureuses, tableau de bord énergie.
- **C10** : paquets de réveil (UDP en diffusion), DHCP, ARP, captures ; prises mesureuses lues en HTTP ou MQTT sur le réseau local.
- **Physique** : énergie E = Σ P·t par état, étalonnage des prises, incertitudes, prévision de la consommation de la semaine comparée à la mesure. **Décide** de la politique (veille ou arrêt) et de l'heure de réveil.
- **Sécurité** : « qui a éteint ou réveillé ce poste ? » → journal chaîné (la question gardée par Yaksan).
- **Points d'attention** : physique plutôt « mesure » que « modèle » (note moyenne) ; le réveil à distance des portables est incertain (à vérifier) ; prises du commerce branchées sur une prise murale, sans câblage (à valider avec le lycée).

### 5. L'arrêt propre en cascade quand le courant tombe
- **Problème** : coupure de courant, l'onduleur tient quelques minutes, puis tout s'éteint d'un coup. Les serveurs ne s'arrêtent pas dans le bon ordre.
- **Solution** : un orchestrateur lit l'onduleur (logiciel libre NUT) et arrête les machines dans l'ordre, au bon moment, selon l'autonomie réelle prévue.
- **Code** : orchestrateur Python, arrêt par SSH et PowerShell à paliers, simulateur de coupure.
- **C10** : SNMP ou NUT, ICMP, SSH, WinRM.
- **Physique** : autonomie de la batterie selon la charge (loi de Peukert) mesurée face au modèle. **Décide** de l'ordre et des délais d'arrêt.
- **Sécurité** : « un faux signal de coupure peut-il tout éteindre ? » **Trop proche** de l'authentification de l'apprenti 3.
- **Points d'attention** : il faut un onduleur ; des essais avec des appareils sur 230 V (branchés, pas câblés) : à valider.

### 6. Le PC isolé qui fuit par le son
- **Problème** : on croit qu'un PC coupé du réseau ne peut rien laisser sortir.
- **Solution** : démonstration rouge et bleue. Un programme fait « chanter » le haut-parleur en ultrasons ; un ESP32 avec micro capte et décode. Puis un détecteur qui écoute et alerte.
- **Code** : modulation et démodulation, FFT sur ESP32, détecteur.
- **C10** : **faible** (presque pas de réseau).
- **Physique** : acoustique, atténuation avec la distance, rapport signal sur bruit, spectre. Très forte.
- **Sécurité** : « un PC isolé peut-il fuir quand même ? »
- **Points d'attention** : même idée de « canal caché » que la piste LoRa non retenue ; C10 trop mince.

## Comparaison (notes de 1 à 5)
| Critère | 1 Diode | 2 Câble | 3 Local | 4 Sommeil | 5 Onduleur | 6 Son |
|---|---|---|---|---|---|---|
| Physique utile et mesurable | 5 | 5 | 4 | 3 | 4 | 5 |
| Code personnel (C08) | 5 | 4 | 4 | 4 | 4 | 4 |
| Richesse de C10 | 3 | 5 | 4 | 4 | 4 | 1 |
| Effet démonstration | 5 | 4 | 4 | 3 | 4 | 5 |
| Faisable en 150 h | 4 | 4 | 5 | 4 | 3 | 4 |
| Pas de doublon (5 = sûr) | 4 | 5 | 4 | 5 | 2 | 3 |
| Lien possible avec un service à réseau isolé | 5 | 4 | 4 | 4 | 4 | 3 |
| **Total sur 35** | **31** | **31** | **29** | **27** | **25** | **25** |

## À creuser en premier
1. **Diode optique** : colle parfaitement à un réseau isolé d'Internet ; physique très solide ; démonstration frappante. Faiblesse : C10 moyen ; à renforcer par les services des deux côtés.
2. **Stéthoscope du câble** : la meilleure association physique + C10 ; une question de sécurité nouvelle. Faiblesse : dépend de l'oscilloscope du lycée.
3. **Local technique** : le plus sûr à réaliser en 150 h.
