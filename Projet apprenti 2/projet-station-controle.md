# Projet E6 de Yaksan (apprenti 2) — Station de contrôle de santé des portables

> **Brief complet, à donner tel quel à ChatGPT ou à Claude Code.** Version du 25/11/2026.
> Ce fichier est la **source unique** du projet. Il remplace `nouveau-projet-carte.md` (carte agent, abandonnée) et absorbe une version réduite de `piste-alcasar.md`. L'analyse des choix est dans `piste-banc-portables.md`.
> Contexte **anonymisé** : ne jamais citer le nom de l'administration, du service, ni de personnes réelles.

---

## 0. Consignes pour l'IA qui lit ce brief
- Écrire **en français**, avec des **mots simples** et des phrases courtes. Le code et la documentation technique peuvent être en anglais.
- Le besoin est une **proposition à faire valider par le tuteur**. Ne jamais l'écrire comme déjà validé par l'entreprise.
- Vérifier les faits techniques. Écrire « à vérifier » quand une chose n'a pas pu l'être. Donner les prix en **ordres de grandeur, à confirmer**.
- Ne pas ajouter de briques : le projet fait environ **150 h**, il est déjà plein.
- Respecter le § 11 (ce qu'il ne faut pas faire) et la charte IA (§ 12).
- **Claude Code seulement** : suivre `CLAUDE.md` à la racine (charte graphique `theme.css`, livrables, outils de génération).

---

## 1. Le cadre : l'épreuve E6 du BTS CIEL option A
- BTS CIEL (Cybersécurité, Informatique et réseaux, ÉLectronique), option A : Informatique et réseaux. Session 2027.
- Épreuve E6 « Valorisation de la donnée et cybersécurité », coefficient 7. Oral d'1 h appuyé sur un projet individuel d'environ **150 h**.
- Compétences évaluées : **C01** Communiquer, **C03** Gérer un projet, **C08** Coder, **C10** Exploiter un réseau informatique.
- **C10 = exploiter le réseau en place** : adressage, DHCP, DNS, NTP, protocoles, captures, supervision. Configurer des VLAN, des ACL ou du 802.1X relève de C09 (épreuve E5) : ce n'est pas le cœur du projet.
- Un **professeur de physique** évalue aussi. Il attend un vrai volet physique mesurable (étalonnage, incertitudes, modèle confronté aux mesures), utile au projet, jamais décoratif.
- Progression : **V1 obligatoire / V2 visée / extensions**.
- **Paliers de sécurité** dès qu'un système agit sur une machine : simulation, puis confirmation humaine, puis automatique.
- **Point réglementaire** : l'arrêté du 25 janvier 2023 indique « Pour les apprentis les projets doivent impérativement être développés dans l'entreprise ». Ici, la réalisation est prévue **au lycée, sur maquette**. Elle doit être **validée par l'académie**. Chaque dossier le dit.

## 2. L'apprenti et son contexte
- Yaksan est apprenti dans le **service informatique de proximité d'une administration de l'État** (service des ressources humaines et de la paye).
- Missions : support aux agents, accueil des nouveaux arrivants, **remise et restitution des ordinateurs portables**.
- **Il n'a pas de droits d'administrateur** sur les postes (rapporté, à confirmer par le tuteur).
- Le tuteur envisage de déployer **ALCASAR**, un portail captif libre. Il n'est pas encore en place (réponse du tuteur, 19/11/2026).

## 3. Le problème de départ
Quand un agent rend son portable, le contrôle se fait « à l'œil » : on l'allume, on regarde si ça marche, on le range.
- On ne voit pas un **ventilateur encrassé** ou une aération bouchée. Le PC chauffe, ralentit, s'use plus vite.
- On ne voit pas un **écran qui a perdu de la lumière** ou qui est devenu inégal.
- On ne teste pas tous les **ports, le Wi-Fi et le réseau**.
- **On ne garde aucune trace chiffrée.** Si l'agent conteste plus tard (« il marchait quand je l'ai rendu »), il n'y a rien à montrer.
- Sans droits d'administrateur, Windows ne montre ni la température du processeur ni la vitesse du ventilateur. **Les capteurs extérieurs voient ce que Windows cache.**

*Hypothèses à faire confirmer par le tuteur* : fréquence de ces pannes, nombre de PC rendus par mois, nombre de modèles dans le parc.

## 4. Les solutions qui existent (à vérifier et compléter)
| Solution | Ce qu'elle fait bien | Ce qui lui manque |
|---|---|---|
| Contrôle visuel | rapide, gratuit | rien de chiffré, aucune trace |
| Outils du constructeur (diagnostics au démarrage) | tests matériels complets | pas d'historique central ; pas de mesure du flux d'air ni de la lumière de l'écran |
| Logiciels de surveillance (températures, ventilateur) | lisent les capteurs internes | demandent des **droits d'administrateur** |
| `powercfg /batteryreport`, journaux Windows | lisibles en partie sans droits | rien sur le refroidissement ni l'écran |

## 5. La solution : une station de contrôle à trois axes
Yaksan pose le portable rendu sur la station. En environ 5 à 10 minutes (durée à mesurer), elle dit si le PC est en bonne santé, avec des mesures chiffrées, et garde une fiche infalsifiable.

### Axe 1 — Thermique : le PC refroidit-il bien ? (V1, physique principale)
- Le PC fait tourner une **charge processeur fixe** avec un script en **mode utilisateur** (sans droits). Le script relève le compteur Windows `\Processor Information(_Total)\% Processor Performance`. Ce compteur montre si le processeur ralentit pour ne pas chauffer. Sa lecture sans droits est **à vérifier**.
- Un **ESP32** mesure, à la sortie d'air : la température de l'air soufflé, la température de la pièce et la **vitesse de l'air** (anémomètre thermique).
- Verdict : « bon », « à surveiller », « à nettoyer », par rapport à une **référence par modèle de PC** (PC propre du même modèle).

### Axe 2 — Connectivité : le PC communique-t-il bien ? (V1, porte le C10)
- Script PowerShell en mode utilisateur : cartes réseau (Wi-Fi, Ethernet), adresse reçue par **DHCP**, résolution **DNS**, heure du poste comparée au serveur **NTP**, joignabilité du serveur, liste des périphériques USB.
- Test des ports USB (option à étudier) : un ESP32-S3 branché tour à tour sur chaque port se déclare comme périphérique USB. S'il est reconnu, le port fonctionne.
- **V2 — passage du portail ALCASAR** : le PC atteint-il la page de connexion ? Étapes testées et chronométrées : DNS, redirection vers le portail, authentification (compte de test), page atteinte.

### Axe 3 — Optique : l'écran est-il en bon état ? (V2)
- Le PC affiche une mire : plein écran blanc, puis noir.
- Un **capteur de lumière** posé sur **5 zones** (centre et quatre coins) mesure la luminosité et l'uniformité.
- On compare avec la mesure faite **à la remise** du même PC : perte de luminosité en %.
- Couleurs (capteur spectral) : en extension.

### Le socle commun (V1)
- **Serveur Ubuntu** : réception des mesures (MQTT ou HTTP), **base SQLite**, **tableau de bord** web (fiche par PC, courbes, verdict, historique remise / restitution).
- **Journal chaîné** (la question de sécurité de Yaksan, voir § 8).

## 6. Scénario concret
Sophie, gestionnaire de paye, rend son portable après trois ans. Yaksan le pose sur la station et lance le contrôle.
- **Thermique** : l'air sort à 52 °C au lieu de 42 °C pour ce modèle, et le débit d'air a baissé de 40 %. Verdict : **à nettoyer**.
- **Connectivité** : Wi-Fi, câble réseau, DHCP, DNS, heure et trois ports USB fonctionnent. Verdict : **bon**.
- **Écran** (V2) : 15 % de luminosité perdue depuis la remise, uniformité correcte. Verdict : **bon**.

La fiche est enregistrée dans le journal chaîné. Le PC part au nettoyage avant d'être prêté à un nouvel arrivant. *(Valeurs inventées pour l'exemple.)*

## 7. Architecture (maquette du lycée)
```
[Portable Windows à contrôler] --(script utilisateur : charge + compteurs + tests réseau)--> HTTP
        |  air soufflé / écran
[ESP32 + capteurs : température x2, anémomètre, capteur de lumière] --(Wi-Fi, MQTT ou HTTP)-->
                                                                    [Serveur Ubuntu]
                                                                     - réception, SQLite
                                                                     - journal chaîné
                                                                     - tableau de bord web
                                                                     - DNS, NTP (réseau en place)
[Switch HP ProCurve] --- [Routeur Cisco ISR 4331] --- (V2) [ALCASAR, portail captif, sur PC ou VM à 2 cartes réseau]
```
- **NTP est indispensable** : on aligne deux séries de mesures venues de deux appareils (ESP32 et PC). On mesure leur écart d'horloge.
- Le réseau de la maquette est **déjà configuré** (préparé une fois). Yaksan l'**exploite** : adressage, réservations DHCP, noms DNS, captures, supervision du banc.

## 8. Sécurité
- **Question de sécurité de Yaksan** : « Quelqu'un a-t-il effacé ou modifié ce qui s'est passé ? »
  - Chaque fiche de restitution est une ligne du **journal chaîné** : chaque ligne contient l'empreinte SHA-256 de la ligne précédente.
  - La dernière empreinte est copiée hors du serveur (sur l'ESP32 ou un second serveur).
  - Un outil de vérification parcourt la chaîne. Démonstration : « ligne effacée détectée », « ligne modifiée détectée ».
  - V2 : les journaux d'ALCASAR entrent aussi dans le journal chaîné.
- **Palier 1 seulement** : la station **ne modifie rien** sur le PC. Elle mesure et donne un avis. Toute réparation est faite par un technicien.
- Pas de mot de passe en dur ; certificats vérifiés (pas de `setInsecure()`).
- La question « le boîtier est-il le vrai ? » (défi-réponse HMAC) appartient à un autre apprenti : Yaksan ne la traite pas.

## 9. Physique (à valider avec le collègue de physique)
### Principal — le refroidissement par l'air (V1)
- **Bilan d'énergie de l'air soufflé** : `P = ρ · c_p · Q · ΔT`, avec `Q = v · S`.
  - ρ ≈ 1,2 kg/m³ (air à 20 °C) ; c_p ≈ 1005 J/(kg·K) ; v = vitesse mesurée ; S = section de la grille ; ΔT = air soufflé − pièce.
  - Ordre de grandeur : S = 12 cm², v = 2 m/s, ΔT = 10 K → P ≈ 29 W. C'est plausible pour un portable chargé, **à vérifier sur la maquette**.
- **Modèle testé** : à charge fixe, `Q · ΔT` reste à peu près constant tant que le processeur ne ralentit pas. Essais : aération bouchée à 0, 25, 50 et 75 % (carton ou papier). Quand le processeur ralentit (compteur de performance), le produit baisse.
- **Montée en température** : `ΔT(t) = ΔT∞ · (1 − e^(−t/τ))`. On ajuste les 3 à 5 premières minutes pour **prédire ΔT∞**, ce qui raccourcit le contrôle. On mesure l'erreur de prédiction.
- **Étalonnage** : les deux sondes de température sont comparées à un thermomètre de référence ; l'anémomètre à celui du laboratoire de physique. Incertitudes (répétition sur 10 passages, type A ; fiches techniques, type B).
- **Usage dans le projet** : les seuils « bon / à surveiller / à nettoyer » viennent de ces mesures.

### Court — la lumière de l'écran (V2)
- Mesure de la lumière sur 5 zones ; uniformité = valeur la plus faible ÷ valeur la plus forte.
- Étalonnage relatif avec un **luxmètre** ; capteur tenu à distance fixe, dans un cache noir.
- Usage : seuil de perte de luminosité acceptable entre remise et restitution.

*Note : un autre apprenti utilise aussi la loi en exponentielle (refroidissement d'un portable froid). Doublon accepté par l'enseignant.*

## 10. Découpage et charge (ordres de grandeur, avec IA encadrée)
| Version | Contenu | Heures |
|---|---|---|
| **V1 obligatoire** | socle (serveur, SQLite, journal chaîné, tableau de bord) ; axe thermique complet avec physique ; axe connectivité (script utilisateur, DHCP, DNS, NTP, USB) ; captures et exploitation réseau ; gestion de projet, recette, dossier | ≈ 110 h |
| **V2 visée** | ALCASAR sur la maquette (procédure fournie) et test « portail » chronométré, captures de la redirection et de l'authentification, journaux ALCASAR dans le journal chaîné (≈ 20 h) ; axe optique : luminosité et uniformité, comparaison remise / restitution (≈ 15 h) | ≈ 35 h |
| **Extensions** | couleurs de l'écran (capteur spectral) ; visiteur robot ESP32 qui passe le portail toutes les 5 min ; test de charge du portail | — |

Planning : du **1er janvier au 15 mai 2027** (Gantt dans le formulaire académique).

### Indicateurs mesurés sur la maquette (propositions, cibles à fixer avec le tuteur)
- Refroidissement dégradé détecté sur au moins 9 essais sur 10 (aération bouchée) ; fausses alertes sur un PC propre.
- Répétabilité de `Q · ΔT` sur 10 passages du même PC.
- Erreur de prédiction de ΔT∞ à partir des premières minutes.
- Durée d'un contrôle complet (objectif ≤ 10 min).
- Connectivité : bonne panne trouvée sur N pannes provoquées (câble débranché, DNS faux, heure fausse, port USB désactivé).
- V2 : temps de passage du portail, étape par étape (médiane et pire cas).
- Journal : 100 % des altérations détectées.

## 11. Ce qu'il ne faut pas faire
- Pas de **mesure électrique** (courant, tension) sur le PC. **Pas de 230 V.** **Pas de caméra** filmant des personnes.
- Pas de **droits d'administrateur** dans les scripts côté PC : tout doit marcher en compte utilisateur, pour être transposable au service.
- Pas d'**action** sur le PC (pas de modification de réglages, pas de réparation automatique).
- Pas de données réelles, pas d'accès à la production. Personnes fictives sur la maquette.
- Ne pas présenter « installer ALCASAR » comme le projet : le cœur, c'est le **code de Yaksan**.
- Pas de configuration de VLAN ni d'ACL comme cœur du projet (C09).
- Abandonnés : carte agent, impression sécurisée, « boîte noire du poste », axe acoustique, test du capot fermé.

## 12. Frontières avec les trois autres apprentis
| Apprenti | Son sujet | Différence avec Yaksan |
|---|---|---|
| 1 | diagnostic à distance des **imprimantes**, ticket enrichi ; station de **préparation des PC neufs** (V2, logiciel) | Yaksan contrôle les **PC rendus**, leur état **physique** |
| 3 | verrouillage de session par radar ; leurre réseau (fausse imprimante) | aucun recouvrement |
| 4 | kit de maintenance signé, archivage, **parc tracé par RFID** ; physique : portable qui sort du froid | Yaksan ne trace pas les sorties ; physique voisine (doublon accepté) |

## 13. Vie privée
La fiche dit **quel PC** a été rendu, **quand** et **par qui**. Rien d'autre sur l'agent : pas de contenu du disque, pas d'historique de navigation. Durée de conservation à fixer (à vérifier avec les recommandations de la CNIL). V2 : les journaux d'ALCASAR sont des données personnelles ; obligation de conservation à vérifier avec la source.

## 14. Matériel (prix à confirmer)
ESP32 (et un ESP32-S3 pour l'option ports USB) ; 2 sondes de température (DS18B20 ou SHT4x) ; anémomètre thermique (environ 20 à 40 €) ; capteur de lumière (type TSL2591, environ 10 €) ; capteur spectral en extension (type AS7341, environ 15 €) ; support réglable et cache noir ; un ou deux portables du lycée (idéalement du même modèle) ; serveur Ubuntu ; switch HP ProCurve, routeur Cisco ISR 4331 ; V2 : PC ou VM à deux cartes réseau pour ALCASAR, borne Wi-Fi (environ 30 à 60 €).

## 15. Charte d'usage de l'IA (pour Yaksan)
- Aucune information de l'entreprise dans une IA : ni document, ni nom, ni adresse IP, ni capture.
- Écrire d'abord le test, puis demander le code. **Yaksan écrit et comprend son code** ; il doit pouvoir l'expliquer et le modifier en direct.
- Vérifier chaque commande dans la documentation officielle (Microsoft Learn, Espressif).
- **Liste rouge** : `setInsecure()` ; contournement de la vérification de certificat en PowerShell ; `Set-ExecutionPolicy Bypass` ; mot de passe ou jeton en dur ; `debug=True` dans Flask.
- Tenir un **journal d'usage de l'IA** (annexe du dossier).
- Physique : l'IA aide aux calculs, jamais aux données. Garder les mesures brutes horodatées.

## 16. Livrables attendus (côté enseignant)
1. **Page HTML interactive** : problème, solutions existantes, solution, scénario avec Sophie, schéma d'architecture, sécurité, physique, vie privée, V1/V2, en bref.
2. **Formulaire académique** « Dossier de présentation et de validation du projet » (parties 1 à 6 ; DOCX + PDF ; schémas SysML et Gantt du 1er janvier au 15 mai). Il **remplace** celui envoyé le 12/11/2026 (ancien projet « boîte noire »).
3. **Présentation style 3Blue1Brown** : fond sombre, animations au clic, notes de l'orateur.

## 17. À vérifier ou à demander
**Au tuteur** : contrôle actuel des PC rendus (comment, combien par mois) ; PC qui reviennent encrassés, écrans usés, ports ou Wi-Fi en panne ; nombre de modèles dans le parc ; pour qui et pourquoi ALCASAR.
**Techniquement** : lecture des compteurs de performance et du journal Système sans droits sur un poste géré ; scripts PowerShell autorisés sur les postes du service ; précision d'un anémomètre thermique bon marché aux basses vitesses ; validation de la réalisation au lycée par l'académie.
