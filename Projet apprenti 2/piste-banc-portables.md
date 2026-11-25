# Yaksan (apprenti 2) – pistes « banc des portables » (25/11/2026)

> **Statut : analyse, rien n'est décidé.** Point de départ : cinq pistes proposées à l'enseignant (refroidissement, écran, station d'accueil, armoire de prêt, mise en veille).
> **Faits nouveaux rapportés, à faire confirmer par le tuteur** : Yaksan n'a **pas de droits d'administrateur** ; il contrôle les portables rendus par les agents ; il a signalé un **problème de fermeture du capot**. Contrainte de l'enseignant : ESP32 + capteurs + base de données + tableau de bord, et **pas de mesure électrique**.
> **Question ouverte** : cette piste remplace-t-elle la carte agent (`nouveau-projet-carte.md`) et ALCASAR (`piste-alcasar.md`) ?
> **Les quatre axes de la proposition** (reçus le 25/11) : optique (écran), acoustique (micro et haut-parleurs), thermique (refroidissement), informatique (réseau et périphériques). Avis au § 8.

## 1. Deux doublons à éviter
| Piste | Doublon avec | Pourquoi |
|---|---|---|
| Refroidissement, si on mesure une constante de temps τ | **Aziza** | Sa physique principale est déjà la loi de refroidissement de Newton sur un portable (`T(t) = Ta + (T0 − Ta)·e^(−t/τ)`). |
| Bruit du ventilateur analysé par transformée de Fourier | **Wassim** | Il fait déjà la transformée de Fourier des vibrations de l'imprimante et la condition de Shannon. |
| Armoire de prêt (RFID) | **Aziza** | Sa borne RFID de sortie trace déjà le parc (« un parc tracé »). |
| Contrôle des PC rendus | **Wassim (V2)** | Sa station prépare les PC neufs (logiciel). La frontière reste nette : Wassim prépare les **PC qui arrivent** (logiciel), Yaksan contrôle les **PC rendus** (état physique). À écrire dans les deux dossiers. |

Conséquence : si Yaksan fait de la thermique, ce doit être un **bilan d'énergie de l'air soufflé** (convection forcée), pas une constante de temps.

## 2. Comparaison des cinq pistes
Notes de 1 (faible) à 3 (fort). Le « besoin » est une hypothèse tant que le tuteur ne l'a pas confirmé.

| Critère | 1 Refroidissement | 2 Écran | 3 Station d'accueil | 4 Armoire | 5 Mise en veille |
|---|---|---|---|---|---|
| Besoin plausible au service | 2 (poussière, ventilateur usé après 3 à 4 ans) | 1 (un coup d'œil suffit souvent) | 3 (ticket très courant) | 2 | 3 (signalé par Yaksan) |
| L'ESP32 voit ce que Windows cache sans droits | **3** (température CPU et vitesse du ventilateur illisibles sans droits) | 3 | 1 (l'ESP32 ne lit pas un signal vidéo) | 1 | **3** (`powercfg /sleepstudy` demande des droits) |
| Physique mesurable, utile au projet | 3 (débit d'air × écart de température) | 3 (photométrie) | 1 (risque décoratif) | 2 | 2 (échauffement dans un sac fermé) |
| Distinct des 3 autres projets | 2 (voir § 1) | 3 | 3 | **0** (Aziza) | 3 |
| C10, réseau en place | 2 (NTP indispensable pour aligner deux séries de mesures) | 1 | 2 | 1 | **3** (le PC fermé parle-t-il encore sur le réseau ? capture) |
| Faisabilité au lycée | 3 (un portable, du papier pour boucher l'aération) | 2 (boîte noire, étalonnage) | 1 (stations d'accueil à acheter, modèles variés) | 3 | 3 |
| **Total / 18** | **15** | 13 | 11 | 9 | **17** |

Avis :
- **Armoire** : écartée (doublon d'Aziza).
- **Station d'accueil** : bon besoin, mauvaise physique. L'ESP32 ne peut pas lire HDMI ou DisplayPort sans toucher au câble vidéo (mesure électrique). À garder comme **extension** au mieux.
- **Écran** : physique propre et sans doublon, mais besoin faible. C'est un **plan B** si le collègue de physique refuse la thermique (trop proche d'Aziza).
- **Mise en veille** seule : trop mince, comme le disait la proposition. Mais c'est le **seul besoin venu de Yaksan**. Il faut le garder comme fil rouge.
- **Refroidissement** : meilleure physique, à condition d'éviter τ.

## 3. Proposition : réunir 1 et 5
Titre de travail : **« Le portable rendu est-il en bonne santé ? Banc de contrôle thermique et de mise en veille, sans droits d'administrateur »**.

Idée : un agent rend son portable. Yaksan le pose sur le banc. Deux contrôles, 15 min en tout (durée à mesurer) :

### Contrôle A : le refroidissement (V1)
- Le PC lance une charge processeur fixe avec un script en mode utilisateur. Il relève le compteur `% Processor Performance`, lisible sans droits (à vérifier sur un poste sans droits). Ce compteur montre si le processeur ralentit pour ne pas chauffer.
- L'ESP32 mesure à la sortie d'air : la température de l'air soufflé, la température de la pièce et la vitesse de l'air (anémomètre thermique).
- **Physique** : puissance évacuée par l'air `P = ρ·c_p·Q·ΔT`, avec `Q = v·S` (débit d'air). Modèle testé : à charge fixe, **`Q·ΔT` reste constant** tant que le processeur ne ralentit pas. Essais : aération bouchée à 0, 25, 50 et 75 % ; quand le processeur ralentit, le produit baisse. Étalonnage des capteurs et incertitudes. C'est un vrai modèle confronté aux mesures, différent de celui d'Aziza.
- **Usage dans le projet** : seuil « refroidissement dégradé » par modèle de PC, fixé à partir des mesures (référence = PC propre du même modèle).

### Contrôle B : le capot fermé (V2)
- Le PC est fermé et mis dans une boîte qui joue le « sac ». L'ESP32 mesure la température dans la boîte et le niveau sonore (simple niveau, **pas de Fourier**, pour éviter le doublon avec Wassim).
- Côté réseau, le serveur Ubuntu regarde si le PC fermé envoie encore des paquets : ping, DHCP, capture sur un port recopié (*port mirroring*) **déjà configuré**. C'est de l'exploitation (C10), pas de la configuration (C09).
- Côté Windows : événements Kernel-Power 42 / 107 (veille classique) et 506 / 507 (veille moderne) dans le journal Système, en lecture seule (à vérifier sans droits).
- Verdict : « le PC dort », « le PC reste éveillé et chauffe », « le PC reste éveillé et parle au réseau ».

### Socle commun
- Serveur Ubuntu : base SQLite, tableau de bord (un PC = une fiche de restitution, courbes, verdict).
- **Question de sécurité de Yaksan, inchangée** : « quelqu'un a-t-il effacé ce qui s'est passé ? ». La fiche de restitution entre dans un **journal chaîné**. Un agent qui conteste (« il marchait quand je l'ai rendu ») trouve une trace datée et intacte. Démonstration : « ligne effacée détectée ».
- **C10** : NTP obligatoire (on aligne la série de l'ESP32 et celle du PC, on mesure leur écart d'horloge) ; DHCP avec réservation, DNS ; captures MQTT ou HTTP ; capture du PC fermé.
- **Paliers** : le banc ne change aucun réglage du PC. Il donne un avis (palier 1). Changer l'action du capot reste au technicien qui a les droits.
- **Vie privée** : la fiche dit qui a rendu quel PC. Pas d'autre donnée sur l'agent. Personnes fictives sur la maquette.

### Découpage (ordres de grandeur, avec IA, à chiffrer)
| Version | Contenu | Heures |
|---|---|---|
| V1 obligatoire | contrôle A complet, serveur, base, journal chaîné, tableau de bord simple, NTP et captures | ≈ 110 h |
| V2 visée | contrôle B (capot fermé) | ≈ 35 h |
| Extensions | écran (photométrie) ; aide au diagnostic d'une station d'accueil | — |

### Indicateurs mesurés sur la maquette (proposition)
- Refroidissement dégradé détecté sur N essais d'aération bouchée (objectif à fixer, par exemple 9 sur 10) ; fausses alertes sur un PC propre.
- Répétabilité : écart de `Q·ΔT` sur 10 passages du même PC.
- Durée d'un contrôle complet (objectif ≤ 15 min, à confirmer avec le tuteur).
- Capot fermé : bon verdict sur 10 essais par cas (veille réelle, veille ratée).

## 4. Limites et risques
- **Le besoin n'est pas confirmé.** Des portables qui chauffent ou qui ne dorment pas dans le sac : est-ce fréquent au service ? Le tuteur doit répondre. Sans cela, le jury dira « solution qui cherche un problème ».
- Le résultat dépend du modèle de PC et de la pièce. Il faut une référence par modèle ; un parc de quelques modèles seulement aide (hypothèse à vérifier).
- La sortie d'air varie d'un portable à l'autre (côté, arrière, dessous). Il faut un support réglable.
- Anémomètre thermique bon marché : précision à basse vitesse non vérifiée. Prévoir un étalonnage avec un anémomètre du labo de physique.
- Les scripts PowerShell peuvent être bloqués sur les postes du ministère (stratégie d'exécution, mode de langage restreint). On ne peut pas le vérifier depuis le lycée.
- Seule la veille moderne a des événements 506 / 507 ; les PC en veille classique (S3) donnent 42 / 107.

## 5. Faits vérifiés le 25/11 (et ce qui ne l'est pas)
- `powercfg /sleepstudy` demande une session administrateur et n'existe que sur les PC à veille moderne ([Microsoft Learn, options de powercfg](https://learn.microsoft.com/windows-hardware/design/device-experiences/powercfg-command-line-options)).
- La température lue par WMI (`MSAcpi_ThermalZoneTemperature`) n'est en général lisible qu'avec des droits d'administrateur, et parfois absente ou fausse (forums, **pas de source officielle**).
- Kernel-Power 506 / 507 = entrée et sortie de la veille moderne : vu sur Microsoft Q&A, **pas dans une page de documentation officielle**.
- **Non vérifié** : lecture des compteurs de performance et du journal Système sans droits sur un poste géré ; précision des anémomètres thermiques bon marché ; prix.

## 6. Matériel (prix à confirmer)
ESP32 ; 2 sondes de température étalonnées (par exemple DS18B20 ou SHT4x) ; anémomètre thermique (environ 20 à 40 €) ; micro numérique I²S (environ 5 €) ; boîte « sac » ; support réglable ; un portable du lycée (de préférence deux du même modèle). Pas de 230 V touché, pas de caméra.

## 7. À demander au tuteur (court)
1. Les portables rendus sont-ils contrôlés aujourd'hui ? Comment, et combien par mois ?
2. Voit-on des portables qui chauffent, des ventilateurs bruyants, des aérations encrassées ?
3. Le problème du capot : que se passe-t-il exactement (PC chaud dans le sac, batterie vide, écran externe éteint) ?
4. Combien de modèles de portables dans le parc ?

## 8. Les quatre axes de la proposition (avis du 25/11)
Station centrale (ESP32 + serveur Ubuntu + historique) et quatre axes : optique (écran), acoustique (micro et haut-parleurs), thermique (refroidissement), informatique (réseau et périphériques).

**Bonne architecture, mauvais équilibre si les quatre axes pèsent pareil.** En 150 h, quatre mesures physiques étalonnées avec incertitudes, c'est trop : on obtient quatre tests « marche / marche pas » et une physique mince partout. Le professeur de physique attend **un** modèle confronté aux mesures.

| Axe | Physique | Doublon | Besoin | Place proposée |
|---|---|---|---|---|
| Thermique | forte (`Q·ΔT`) | Aziza si on mesure τ | à confirmer | **V1, physique principale** |
| Informatique | aucune | non | fort (Wi-Fi, ports USB, réseau) | **V1, porte le C10** (script en mode utilisateur, NTP, DNS, DHCP, captures) |
| Optique | bonne (photométrie, étalonnage au luxmètre) | non | faible | **V2, mesure courte** |
| Acoustique | spectre = doublon Wassim ; niveau seul = maigre | Wassim | faible (une oreille suffit) | **Extension**, test fonctionnel sans physique |

Il manque aussi le **capot fermé**, le seul problème venu de Yaksan : à garder en V2 (rattaché aux axes thermique et informatique).

Point fort à garder : **comparer le même PC à la remise et à la restitution** (valorisation de la donnée : écart mesuré, et non « il a l'air d'aller »).

## 9. Décision de l'enseignant (25/11)
- **On garde trois axes : thermique, connectivité, optique.** Acoustique et capot fermé abandonnés.
- **Les doublons de physique ne gênent pas** (expérience du jury) : la thermique peut aussi utiliser la constante de temps τ, comme Aziza.
- Usage proposé de τ : ajuster le début de la montée en température (3 à 5 min) pour **prédire l'état final** et raccourcir le contrôle. Bilan `Q·ΔT` gardé pour le diagnostic (aération bouchée).

| Version | Contenu | Heures (ordre de grandeur, avec IA) |
|---|---|---|
| V1 obligatoire | socle (serveur Ubuntu, SQLite, journal chaîné, tableau de bord) ; **thermique** (physique principale) ; **connectivité** (script en mode utilisateur : Wi-Fi, Ethernet, ports USB, DHCP, DNS, NTP ; captures) | ≈ 110 h |
| V2 visée | **optique** : luminosité, uniformité sur 5 zones, couleurs (capteur spectral), étalonnage au luxmètre ; comparaison remise / restitution | ≈ 35 h |
| Extensions | à définir | — |

Reste ouvert : le besoin doit maintenant venir du tuteur (PC qui chauffent, écrans usés, ports ou Wi-Fi en panne au retour). Le problème du capot n'est plus l'appui du récit.

## 10. Décision de l'enseignant (25/11, suite) : ALCASAR en V2
- **Carte agent abandonnée** (`nouveau-projet-carte.md` devient historique). **ALCASAR gardé en V2**, rattaché à l'axe connectivité : « le PC rendu passe-t-il le portail captif ? ».
- Lien naturel : ALCASAR est envisagé par le tuteur (réponse du 19/11). C'est le besoin le plus solide du projet.
- **Attention aux heures** : la V2 (≈ 35 h) ne peut pas porter le pilote ALCASAR complet de `piste-alcasar.md` (visiteur robot, test de charge, injecteur de pannes, physique Wi-Fi) **et** l'optique.
- Version réduite proposée : ALCASAR installé sur la maquette (procédure fournie, ≈ 6 h) ; la station ajoute un test « portail » au contrôle de connectivité (DNS, redirection, authentification, page atteinte, temps de chaque étape) ; captures de la redirection et de l'authentification (C10) ; journaux d'ALCASAR exportés dans le journal chaîné. ≈ 20 h. Optique ramenée à ≈ 15 h (luminosité et uniformité ; couleurs en extension).
- Extensions : couleurs de l'écran ; visiteur robot ESP32 ; test de charge du portail.
