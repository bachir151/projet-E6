# Yaksan (apprenti 2) – piste ALCASAR (19/11/2026)

> **Fait nouveau** : c'est **le tuteur** qui a cité ALCASAR (plaquette 3.6.1 transmise par l'enseignant). Cette piste passe donc devant « carte + imprimante » (`nouveau-projet-carte.md`) et « borne USB ». **Ébauche à valider**, heures en ordres de grandeur.

## ALCASAR en bref (d'après la plaquette)
Logiciel libre (GPLv3) installé sur un petit PC ou une machine virtuelle à deux cartes réseau, placé en coupure entre Internet et un réseau local : portail captif, authentification (RADIUS, connecteur LDAP/AD), filtrage par utilisateur ou groupe, DHCP/DNS/NTP, pare-feu, antimalware, statistiques de flux (nfdump/nfsen), journaux conformes aux obligations de conservation (art. L34-1 du CPCE, décret 2021-1362).

## Idée de projet : « Le parcours de connexion, de bout en bout »
Yaksan reproduit au lycée la chaîne d'accès du service (poste ou téléphone → Wi-Fi → DHCP → DNS → portail ALCASAR → authentification → page demandée), y provoque les pannes une par une et construit les outils qui les trouvent. Il garantit aussi que les traces de connexion ne peuvent pas être effacées sans que ça se voie.

| Brique | Ce que fait Yaksan | Compétence |
|---|---|---|
| ALCASAR sur maquette | installation courte (procédure fournie), relié au contrôleur de domaine commun ; c'est ensuite le réseau en place qu'il exploite | C10 |
| **Visiteur robot** (ESP32) | toutes les 5 min : association Wi-Fi, adresse DHCP, redirection vers le portail, connexion, page de test ; chronomètre chaque étape ; dit quelle étape casse | C08, C10 |
| **Outil de diagnostic du poste** (PowerShell) | « la page de connexion ne s'affiche pas » : DNS, DNS chiffré du navigateur, page en HTTPS, certificat d'ALCASAR installé, proxy, heure ; premier maillon en échec = cause ; remèdes à paliers | C08 |
| **Injecteur de pannes** | le technicien choisit une panne (DNS coupé, portail arrêté, heure fausse, compte expiré…), le banc la provoque, les outils doivent la retrouver | C08, C03 |
| **Traces inaltérables** (sa question de sécurité) | export des journaux ALCASAR vers un serveur d'archive, chaînage par empreinte, outil de vérification ; démonstration « ligne effacée détectée » | sécurité |
| Tableau de bord | disponibilité du portail, temps de connexion par étape, causes des pannes | donnée |
| **Physique** | couverture Wi-Fi de la zone : puissance reçue (RSSI) selon distance, murs, orientation ; modèle d'affaiblissement en log(distance) ; incertitudes ; décide de la place et de la puissance de la borne | physique |

## Découpage (à chiffrer)
- **V1 (≈ 110 h)** : ALCASAR sur maquette, visiteur robot, traces chaînées, physique Wi-Fi, captures (redirection du portail, DHCP, DNS, RADIUS).
- **V2 (≈ 35 h)** : outil de diagnostic du poste avec remèdes à paliers, injecteur de pannes, tableau de bord.
- **Extensions** : comptes temporaires pour les arrivants (si le tuteur le souhaite), visiteur robot sur plusieurs emplacements.

## Points d'attention
- **C08** : ALCASAR fait presque tout ; le code de Yaksan (visiteur robot, diagnostic, chaînage, injecteur) doit être le cœur. Ne pas vendre « installer ALCASAR » comme projet.
- **C09/C10** : l'installation reste courte ; la configuration de VLAN ou d'ACL n'est pas le sujet.
- **Réseau isolé** : l'ancienne synthèse disait que le service est coupé d'Internet. ALCASAR suppose un accès Internet (ou un réseau à part : visiteurs, formation). À éclaircir.
- **Obligation de conservation** : son application au réseau de cette administration est à vérifier ; durée et contenu des journaux à citer avec la source.
- **Vie privée** : journaux = données personnelles ; comptes fictifs sur la maquette.
- **Matériel en plus** : une borne Wi-Fi (environ 30 à 60 €, à confirmer).

## Ce qu'il faut savoir du tuteur
1. ALCASAR est-il **déjà en place** dans le service, ou **envisagé** ?
2. **Pour qui** : visiteurs, nouveaux arrivants, salle de formation, agents ?
3. **Quel problème** rencontre le support avec (ou sans) lui ?
