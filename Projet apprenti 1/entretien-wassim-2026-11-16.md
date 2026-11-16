# Wassim – entretien avec l'apprenti (16/11/2026)

Notes de l'enseignant, remises au propre à partir d'une transcription orale. Document interne : ne pas recopier tel quel dans un dossier (anonymiser).
Passages incertains de la transcription, interprétés ici : « PC d'élan » = **PC lent** ; « vélan / bon Vélan » = **VLAN** ; « nuque » = **NUC** (mini-PC Intel) ; « les jeux viennent directement » = **les gens viennent directement** au service ; « il y a juste trop checker » = sens incertain, suivi de « il y a trop de tickets ».

## 1. Ce que Wassim a dit

### Préparer le poste d'un nouveau médecin
- Le service a en stock des **postes neufs, des écrans neufs**, parfois des **micros** pour les médecins.
- Wassim **met le PC dans le domaine** : il apparaît alors dans l'AD. Il le **range ensuite dans le bon service** (l'unité d'organisation du service).
- Il installe les applications dont le médecin a besoin. Souvent avec des **scripts déjà faits** : il saisit un **chemin d'accès** (un partage réseau) sur le PC, le script installe toutes les applications.
- « **Sans le domaine, on ne peut rien faire.** » « En vrai, c'est rapide. »

### Les pannes
- **Le plus gros problème : les imprimantes.** Elles sont allumées mais n'impriment pas. Il vérifie si l'imprimante est **dans le bon VLAN**, s'il manque de l'**encre**.
- **Deuxième problème : les applications** (logiciels métier du médecin). « C'est compliqué. »
- **PC lent** : il regarde d'abord à distance si le disque est un **SSD ou un HDD** (« les médecins ne savent pas »). Il ajoute de la **RAM**. Le parc est presque tout en SSD ; **un PC encore en HDD est en général remplacé**.
- Méthode : **prise en main à distance** d'abord ; s'il voit que ça a vraiment « bugué », il **se déplace**. Connecter une imprimante déjà branchée : **à distance**, c'est plus rapide.
- **Trop de tickets.** Certains utilisateurs viennent aussi directement au service.

### Les chariots de soins
- Les chariots n'ont pas de tour ni de portable : un **NUC** (petit boîtier) fixé sur le chariot, **l'écran juste derrière**.
- Le NUC est alimenté par **la batterie du chariot**. Elle se vide **lentement** ; on la recharge ou on **branche le chariot sur une prise**.
- Les chariots sont bien gérés par son service.
- « **Les chariots, il n'y a pas de problème.** »

## 2. Ce que l'entretien change pour le projet envoyé

Le formulaire envoyé le 12/11 (« Supervision instrumentée des chariots de soins : de la coupure au ticket ») repose sur un fait **rapporté, à confirmer par le tuteur** : « en cardiologie, le PC d'un chariot s'éteignait seul deux à trois fois par jour ».

### Ce qui est confirmé
| Point du projet | Ce que dit Wassim | Effet |
|---|---|---|
| Wassim traite des tickets de niveau 1 et 2 | Oui, « trop de tickets » | Confirmé : GLPI et les paliers restent pertinents |
| Diagnostic à distance | Il prend la main à distance avant de se déplacer | Confirmé : le diagnostic JEA en lecture seule colle à sa pratique |
| Chariots gérés par son service | Oui | Confirmé |

### Ce qui est faux ou fragile
| Dans le formulaire | Ce que dit Wassim | Gravité |
|---|---|---|
| « Chariots équipés d'un **PC portable** » | **NUC sans batterie interne**, alimenté par la batterie du chariot | Moyenne : répond à la question au tuteur « portables ou petits PC sans batterie ? » ; les règles « batterie du PC » tombent |
| Problème central : **coupures intermittentes** des PC de chariot | « **Les chariots, il n'y a pas de problème** » | **Forte** : le besoin du projet n'est pas celui que vit l'apprenti |
| Rien sur les imprimantes, les PC lents, les postes neufs | Ce sont **ses vraies tâches**, imprimantes en tête | Forte : à l'oral, le jury demandera « que faites-vous en entreprise ? » |

**Risque principal** : à l'oral, Wassim dira lui-même que les chariots ne posent pas de problème. Le besoin du projet s'effondre devant le jury. Ce risque passe avant la question du formulaire déjà envoyé.

## 3. Options

| | A. Garder le projet, corriger le contexte | B. **Même architecture, autre panne : imprimantes et PC lents** | C. Préparation des postes neufs |
|---|---|---|---|
| Idée | NUC sur batterie du chariot ; le boîtier surveille la batterie du chariot et les coupures | Quand un ticket « l'imprimante n'imprime pas » ou « mon PC est lent » arrive, le serveur fait le pré-diagnostic et l'écrit dans le ticket GLPI | Mise au domaine, rangement dans le bon service, installation par profil de médecin |
| Lien avec ses tâches | Faible (« pas de problème ») | **Fort** (ses deux premières pannes, ses gestes réels : VLAN, encre, SSD/HDD, RAM) | Fort |
| Ce qu'on garde du formulaire envoyé | Presque tout | **Serveur, JEA, compte GLPI restreint, paliers, PostgreSQL, Gantt** ; la question de sécurité reste la même | Peu |
| Ce qu'on perd | — | Boîtier ESP32 sur le chariot, INA219, Li-Po, chutes contrôlées | Boîtier et physique |
| Doublons | Aucun | Léger avec Yaksan (diagnostic du poste) : à séparer (voir §4) | **Fort** avec Lorenzo (installations, socle) et Aziza (distribution) |
| C10 | Correct | **Très bon** : SNMP, adressage et VLAN **vérifiés** (pas configurés), DHCP/DNS, ports 9100 et 631, captures | Correct (DNS du domaine, partage SMB) |
| Physique | Bonne (déjà écrite) | **À reconstruire** (proposition au §4) | Difficile à trouver |
| Avis | Non : besoin fragile | **Oui (recommandée)** | Non : doublons |

## 4. Proposition détaillée (option B)

Titre provisoire : **« Imprimante muette, PC lent : le ticket arrive avec son diagnostic »**.

### Principe
1. Un ticket GLPI arrive (catégorie « imprimante » ou « PC lent »).
2. Le serveur lance le pré-diagnostic, **en lecture seule** :
   - **Imprimante** : répond-elle (ping) ? Est-elle **dans le bon réseau** (adresse et masque comparés au plan d'adressage du service, bail DHCP, nom DNS) ? Ports 9100 (impression brute) et 631 (IPP) ouverts ? **État et niveau d'encre lus en SNMP** (Printer-MIB, RFC 3805 ; HOST-RESOURCES-MIB, RFC 2790 : `hrPrinterStatus`, `hrPrinterDetectedErrorState`, `prtMarkerSuppliesLevel`) ? File d'attente bloquée sur le PC (JEA) ?
   - **PC lent** (JEA, comme dans le formulaire) : type de disque (`Get-PhysicalDisk`, `MediaType`), RAM et taux d'utilisation, mémoire paginée, espace disque, latence disque mesurée.
3. Le serveur écrit dans le ticket la **cause probable** et le **geste conseillé** (« encre noire à 2 % », « imprimante hors du réseau du service », « disque HDD : poste à remplacer », « 4 Go de RAM saturés : ajouter 4 Go »).
4. **Paliers** (inchangés dans l'esprit) : 1. simulation (il note ce qu'il aurait écrit) ; 2. il propose, le technicien valide ; 3. il écrit seul. Une action corrective (relancer le spouleur d'impression) n'existe qu'au palier 2, avec confirmation humaine, et reste **hors de la liste JEA de V1**.

### Séparation avec Yaksan (2)
Yaksan : mises à jour Windows ratées et chaîne carte → navigateur, vues par un boîtier témoin. Wassim : **imprimantes réseau** et **performance matérielle** (disque, RAM), déclenchés par le ticket. Pas de boîtier témoin chez Wassim.

### Volet physique proposé : « Pourquoi un disque dur rend-il le PC lent ? »
Le geste réel de Wassim (« HDD → on remplace le poste ») a une explication physique simple : le disque dur est **mécanique**.

| Étape | Mesure | Modèle, exploitation |
|---|---|---|
| Modèle | — | Plateau à N tr/min : une rotation dure T = 60/N (7 200 tr/min → 8,33 ms ; 5 400 tr/min → 11,1 ms). Attente moyenne d'un secteur = T/2 (4,17 ms ; 5,56 ms), plus le déplacement de la tête. SSD : pas de pièce mobile, ≈ 0,1 ms (ordre de grandeur, à mesurer). |
| Latence mesurée | Lectures aléatoires de petits blocs, 1 000 essais, sur un PC de récupération à HDD puis à SSD | Histogramme, moyenne, écart-type, incertitude s/√N ; confrontation au modèle ; rapport HDD/SSD |
| Vibration (à tester d'abord) | MPU6050 (ESP32) posé sur le boîtier du PC, échantillonné à 1 kHz, disque en marche puis arrêté | Pic attendu à N/60 (120 Hz à 7 200 tr/min ; 90 Hz à 5 400 tr/min) ; transformée de Fourier ; condition de Shannon (fréquence d'échantillonnage > 2 × 120 Hz) |
| Lien avec le projet | Le seuil « latence > x ms → disque mécanique ou malade » vient de la mesure | Règle écrite dans le ticket, justifiée par le modèle |

**Points non vérifiés** : (1) la vibration du disque est peut-être trop faible pour le bruit du MPU6050 ; à tester en tâche 1, sinon ne garder que la latence (le volet reste valable) ; (2) il faut au lycée un PC de récupération **avec HDD** et un **avec SSD** ; (3) à faire valider par le professeur de physique.

Variante si le professeur de physique refuse : humidité du papier et bourrages (SHT31), mais il faudrait de vrais bourrages : plus fragile.

### Charge (ordre de grandeur, à recaler)
| Tâche | Heures |
|---|---|
| Analyse du besoin, planification | 12 |
| Maquette : 2 imprimantes réseau du lycée (ou 1 + simulateur SNMP), GLPI, serveur | 12 |
| Pré-diagnostic imprimante (ping, adressage, ports, SNMP) | 22 |
| Pré-diagnostic PC lent (JEA, script PowerShell) | 18 |
| GLPI : API, lecture des tickets, écriture du diagnostic, paliers | 18 |
| Physique : latence, vibration, incertitudes | 14 |
| Exploitation du réseau : DHCP, DNS, NTP, captures SNMP et IPP | 12 |
| Campagne d'essai (pannes provoquées), indicateurs, bilan | 14 |
| Dossier et soutenance | 12 |
| **Total** | **≈ 134 h** (marge ≈ 16 h) |

### Indicateurs possibles
- 10 pannes d'imprimante provoquées (câble débranché, mauvais réseau, encre basse simulée, file bloquée) : cause juste dans au moins 8 cas.
- Temps entre l'arrivée du ticket et le diagnostic écrit : moins d'1 minute.
- PC HDD et PC SSD : bien classés 10 fois sur 10.
- Aucune commande hors liste JEA acceptée (même démonstration que prévu).

## 5. Le formulaire déjà envoyé
- Il a été envoyé à l'académie le 12/11. Deux choix :
  - **envoyer une version corrigée** avant la commission (si l'académie l'accepte) ;
  - ou **garder le formulaire** et expliquer le recentrage à la revue 1 (fin janvier) ; risque : la commission valide un projet qui ne sera pas réalisé.
- À demander à l'inspection : peut-on remplacer un formulaire déjà déposé ?

## 6. Questions pour le tuteur (M. Goussard)
1. Confirmez-vous que les chariots (NUC sur batterie du chariot) posent peu de problèmes ? Le cas de cardiologie a-t-il existé ?
2. Parmi les tickets, quelle part concerne les **imprimantes** ? les **PC lents** ? (ordre de grandeur sur un mois)
3. Les imprimantes sont-elles **réseau** (adresse IP) ou branchées en USB ? Dans un VLAN dédié ?
4. Wassim a-t-il le droit de **lire l'état des imprimantes** (page web, SNMP) ?
5. Les « scripts déjà faits » d'installation : qui les écrit ? (Pour savoir si Wassim peut en parler sans les reproduire.)

## 7. Lectures utiles
- C. Ruemmler, J. Wilkes, « An Introduction to Disk Drive Modeling », *IEEE Computer*, 27(3), 1994 : le modèle de référence (déplacement de la tête, attente de rotation). Pas de traduction française.
- R. et A. Arpaci-Dusseau, *Operating Systems: Three Easy Pieces*, chapitre « Hard Disk Drives » (en ligne, gratuit, ostep.org) : même modèle, avec calculs simples. Lisible par un apprenti.
- RFC 3805, *Printer MIB v2* (2004) et RFC 2790, *Host Resources MIB* (2000) : objets SNMP de l'état et des consommables d'une imprimante.
- Microsoft Learn, « Just Enough Administration » : déjà utilisé dans le formulaire.
