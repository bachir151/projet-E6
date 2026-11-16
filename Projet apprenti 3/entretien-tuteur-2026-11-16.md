# Lorenzo – entretien avec le tuteur (16/11/2026)

Notes de l'enseignant, remises au propre. Document interne : ne pas recopier tel quel dans un dossier (anonymiser).

## 1. Ce que le tuteur a dit

### Les mises à jour aujourd'hui
- Les **portables** restent en **veille prolongée** (hibernation) quand ils ne servent pas. Ils sont **réveillés le week-end** pour faire les mises à jour.
- Certains agents **emportent leur portable chez eux**. Pour eux, la mise à jour se fait **pendant le temps de travail**.
- Une **fenêtre** apparaît : « installer maintenant ? oui / non ». Certains agents refusent toujours.
- Après **2 ou 3 refus**, l'agent n'a plus le choix : **mise à jour forcée**.
- Le service « tire les oreilles » de ceux qui refusent.

### Le verrouillage
- Les agents **ne font pas Windows + L** en quittant leur poste. On le leur demande, les étourdis oublient quand même.

### Les missions de Lorenzo
- **Soclage** : les postes ne tournent pas sous le Windows du commerce mais sous un **Windows 11 adapté par l'administration** (« socle »). Sans ce socle, **pas de connexion au domaine**.
- **Domaine national** : un agent de l'administration peut se connecter sur n'importe quel poste du réseau.
- **Annuaire (AD) national, centralisé, hors du site.** Une personne inscrite dans l'annuaire a une adresse mail et un compte créé dans l'AD. Lorenzo peut « créer des sessions » ; sans l'AD, il ne peut rien faire.
- **Image toute prête** (socle) sur une **clé USB rendue amorçable avec Rufus** : on démarre le poste sur la clé et on installe l'image.
- **Accompagnement** des collègues pour installer des imprimantes. Lorenzo **n'a pas les codes administrateur** : dès qu'une installation est bloquée, il faut un code admin.
- **Installer ou remplacer un écran** (avec un compte admin si un logiciel est nécessaire).

## 2. Réponses aux questions de visite

| Question | Réponse | Source |
|---|---|---|
| Q1 – Périphérique USB de type port série autorisé ? | **Pas de réponse.** Risque fort sur un socle verrouillé. | à reposer |
| Q2 – Agents administrateurs de leur poste ? | **Non** (même Lorenzo n'a pas les codes admin). | déduit, à confirmer d'un mot |
| Q3 – Délai actuel du verrouillage sur inactivité ? | **Pas de réponse.** | à reposer |
| Q4 – Comment les installations sont-elles lancées ? | Réveil des portables le week-end ; sinon fenêtre oui/non pendant le travail ; forcé après 2 ou 3 refus. | entretien |
| Q5 – Distance agent / usager au guichet ? | **Pas de réponse.** | à reposer |

## 3. Ce que l'entretien change pour « Poste attentif »

### Ce qui est confirmé
| Point du projet | Ce que dit le tuteur | Effet |
|---|---|---|
| Besoin 1 : écran laissé ouvert | « Ils ne font pas Windows + L, même quand on leur dit » | **Besoin confirmé par un fait**, plus seulement une hypothèse |
| Besoin 2 : installations qui dérangent | Fenêtre oui/non, refus répétés, mise à jour forcée | **Besoin confirmé** ; la règle réelle est connue |
| Recentrage du 11/11 : Lorenzo n'administre pas l'AD | AD nationale, hors site ; pas de code admin | **Recentrage justifié** : contrôleur de domaine commun préparé par l'enseignant, Lorenzo exploite (C10) |
| Agents non administrateurs | Lorenzo lui-même n'a pas les codes | Hypothèse quasi confirmée |

### Ce qui est faux ou incomplet dans les documents actuels
| Dans le formulaire / la page | Problème | Correction proposée |
|---|---|---|
| « Il s'occupe des postes, des comptes et des **stratégies de groupe** » | Exagéré : l'AD et les GPO sont gérées au niveau national | « Il prépare les postes à partir de l'image de l'administration, ouvre les premières sessions des nouveaux agents, installe écrans et imprimantes avec les collègues » |
| « 40 postes dont 8 d'accueil » ; boîtier « fixé sous le bureau » | Le parc est fait de **portables**, parfois emportés à domicile | Hypothèse : portables sur station d'accueil au bureau ; boîtier sur le bureau, branché sur la station |
| Rien sur le portable **hors du bureau** | Sans boîtier, le service ne doit ni alerter (« faux boîtier », « débranché ») ni bloquer les installations à vie | Ajouter un **mode « hors bureau »** (voir P2) |
| « 15 % de postes en retard faute d'être disponibles » (fictif) | La règle réelle est connue : 2 ou 3 refus puis forcé | Remplacer par la règle réelle ; garder les chiffres fictifs à valider |

## 4. Propositions

| # | Proposition | Intérêt | Coût | Étape | Avis |
|---|---|---|---|---|---|
| P1 | **Règle de report réelle** : l'agent peut reporter 2 fois (réglable) ; ensuite l'installation est **imposée, mais à la prochaine absence** détectée par le radar, pas devant l'agent ni l'usager. | Reprend la règle du service et montre ce que le radar ajoute : on garde la fermeté, on supprime la gêne. Bon indicateur pour l'essai R6. | ≈ 2 h (dans « installations pendant les absences ») | V2 | **Oui** |
| P2 | **Mode « hors bureau »** : le service sait si le portable est au bureau (contrôleur de domaine joignable, profil réseau « domaine »). Hors bureau et sans boîtier : retour au fonctionnement classique (fenêtre oui/non + compteur, blocage par inactivité), **sans alerte**. Au bureau sans boîtier : alerte (boîtier débranché). | Évite une faille de logique (portable à domicile pris pour une attaque) ; donne un vrai travail **C10** : enregistrements DNS SRV du domaine, LDAP, capture. | ≈ 3 h, pris sur les 8 h « exploitation réseau » | V1 | **Oui** |
| P3 | **Réveil du week-end** : le portable en veille prolongée est réveillé (paquet magique Wake-on-LAN ou réveil programmé), fait les installations en attente, puis repart en veille prolongée. Conditions : sur secteur, au bureau (P2). | Colle exactement à la pratique du service ; capture du paquet magique (UDP 9) et mesure du délai de réveil : bon support C10. | ≈ 8 h | **Extension** (V2 pleine, marge ≈ 2 h) | **Oui, en extension** |
| P4 | **Lien avec le soclage** : l'item V2 « installation d'un poste neuf à paliers » devient « **socle de maquette** » : Lorenzo prépare sa propre image Windows 11 de maquette (service, réglages, raccordement au domaine commun) et l'installe depuis une clé USB faite avec Rufus. Jamais l'image réelle. | Relie le projet à sa mission principale ; facile à expliquer à l'oral. | 0 h (reformulation d'un item existant) | V2 | **Oui** |
| P5 | **Corriger le contexte** du formulaire, de la page et de la présentation (missions réelles, parc de portables, AD nationale, pas de droits admin). | Le jury posera la question « que faites-vous en entreprise ? » : les documents doivent dire la même chose que Lorenzo. | ≈ 1 h de rédaction (enseignant) | — | **Oui, avant envoi** |
| P6 | **« Tirer les oreilles » et vie privée** : le tuteur veut savoir qui refuse. Proposition : le compteur de reports reste **par poste** (il faut bien appliquer la règle) ; le tableau de bord montre le nombre de reports et d'installations imposées par poste, **jamais** d'heures ni de durées d'absence. À présenter au délégué à la protection des données avant tout pilote réel. | Répond au besoin du service sans transformer le radar en outil de surveillance. | 0 h | V2 | **À trancher** (voir question 2) |

**Bilan des heures** si P1, P2, P4 sont retenues : V1 ≈ 108 h (P2 pris dans les 8 h réseau), V2 ≈ 42 h, **marge ≈ 0 h**. À surveiller ; si besoin, raccourcir R5.

## 5. Points techniques à vérifier (non vérifiés sur le matériel)
- **Réveil depuis la veille prolongée** : le Wake-on-LAN depuis l'hibernation (S4) marche en général **en filaire** (station d'accueil), si le BIOS et le pilote l'autorisent ; en **Wi-Fi**, en général non. Le réveil programmé (tâche planifiée « réveiller l'ordinateur ») dépend du micrologiciel. À tester sur le portable de la maquette.
- **Portable dans un sac** : un réveil programmé à domicile peut réveiller un portable fermé dans un sac (chauffe). D'où la condition « sur secteur et au bureau » de P3.
- **Paquet magique entre deux réseaux** : les routeurs Cisco refusent la diffusion dirigée par défaut (`no ip directed-broadcast` depuis IOS 12.0). Sur la maquette, rester dans le même réseau : pas de reconfiguration du routeur (C09, hors E6).
- **Socle réel** : un service maison et un périphérique série USB ne seraient sans doute pas acceptés sur le socle national sans validation. À dire dans les limites (c'est déjà le sens de Q1).

## 6. Questions encore ouvertes pour le tuteur
1. Q1, Q3, Q5 (voir tableau plus haut).
2. « Créer des sessions » : ouvrir la première session d'un nouvel agent sur son poste, ou créer des comptes ? (Probablement la première.)
3. Le réveil du week-end : par quel moyen (outil national, Wake-on-LAN, tâche planifiée) ? Les portables restent-ils sur leur station au bureau le week-end ?
4. Nombre de refus avant mise à jour forcée : 2 ou 3 ? Délai entre deux fenêtres ?

## 7. Lectures utiles
- NIST, *SP 800-40 Rev. 4 – Guide to Enterprise Patch Management Planning: Preventive Maintenance for Technology*, Souppaya & Scarfone, avril 2022 : arbitrage entre urgence de la mise à jour et gêne de l'utilisateur (reports, installation forcée). Pas de traduction française.
- Microsoft Learn, « Wake on LAN (WoL) behavior in Windows » : états S3/S4/S5, limites avec le démarrage rapide.
- ANSSI, *Guide d'hygiène informatique* (v2, 2017), mesure sur le verrouillage des sessions inactives.
