# Yaksan (apprenti 2) – ce qu'il dit de son travail (23/11/2026)

Source : 4 pages manuscrites de l'enseignant, d'après Yaksan. Transcription, puis analyse. Rien n'est validé par le tuteur.

## Transcription
**Page 1 : la carte (badge)**
- La carte sert à **imprimer**, à **entrer dans le bâtiment** et à **accéder au portail** (par carte ou par mot de passe).
- Son travail : tickets **GLPI**, interventions sur des postes.
- **Problème de carte = certificat expiré**, donc il faut renouveler les certificats → paramètres du navigateur → supprimer ou renouveler le certificat.

**Page 2 : les problèmes = arrivée et départ des agents**
- Arrivée : le PC est **déjà préparé par une autre équipe**.
- Yaksan configure la **messagerie** et donne accès à des **boîtes mail partagées**.

**Page 3 : tickets et réseau**
- **La majorité des tickets : arrivées et départs.**
- Réseau **isolé d'Internet**. Un **compte « Orion »** (filtre), créé par Yaksan, permet d'accéder à Internet, avec **3 niveaux d'accès**.

**Page 4 : autres tâches**
- Installation de postes.
- Dépannage courant : périphérique qui ne marche plus, réglages Windows, navigateur, alimentation (fermeture du capot d'un **PC portable**).

## Ce que ça change pour la « Boîte noire du poste »
| Point du formulaire (12/11) | Ce que dit Yaksan | Effet |
|---|---|---|
| Besoin 2 : carte qui ne marche pas | Oui, et la cause est souvent un **certificat expiré**, réglé à la main dans le navigateur | **Confirmé, et précisé.** Le maillon « certificat » (dates de validité) devient central dans la chaîne carte |
| Physique P4 « carte vivante » (courant de la puce) | La carte n'est pas morte : son certificat est périmé | P4 perd de son intérêt pour ce besoin. À revoir avec le collègue de physique |
| Besoin 1 : mises à jour qui échouent (≈ 2 par mois) | **Pas cité** | Le cœur de la V1 n'est pas confirmé par l'apprenti. À reposer au tuteur |
| Boîtier : voyants, coupure secteur | Il y a des **PC portables** (fermeture du capot) | Sur batterie, une coupure secteur n'éteint pas le PC ; voyants peut-être cachés capot fermé. C'est la question de visite n° 1 : la classe « coupure » et la physique sont à revoir si tous les postes sont des portables |
| Besoin 3 : accueil des arrivants (V2, en scénario) | **La majorité des tickets** : arrivées et départs (messagerie, boîtes partagées, compte Internet filtré) | Le vrai volume de travail est là, et presque absent du projet actuel |
| Réseau isolé d'Internet | Confirmé ; accès Internet par un compte filtré à 3 niveaux | La contradiction avec la piste ALCASAR est levée : un accès filtré existe déjà |
| — | Tickets GLPI | GLPI est déjà le cœur du projet de Wassim : ne pas en faire un sujet chez Yaksan |

## Réponse de l'enseignant (23/11, soir)
**Tous les postes sont des portables.** Conséquences pour la Boîte noire :
- La classe « coupure secteur » disparaît (la batterie prend le relais). Restent : arrêt normal, **arrêt forcé** au bouton, **système figé** ; on ajoute **veille** (capot fermé) et **batterie vide**.
- Windows note bien la veille et le réveil, et souvent l'arrêt sur batterie critique : la valeur ajoutée du boîtier se réduit à l'arrêt forcé et au système figé. La mesure « Windows seul contre Windows + boîtier, sur les mêmes pannes » devient la preuve centrale (et peut conclure que le boîtier n'apporte presque rien).
- Voyants : peu nombreux sur un portable, parfois cachés capot fermé. Le boîtier s'appuie surtout sur le 5 V de l'USB et le battement ; P1 (voyants) devient très court.
- Un boîtier collé à un portable qui se déplace : à discuter (station d'accueil ?).
- Maquette : il faut un **portable Windows 11** au lycée (le formulaire prévoyait un poste fixe et des coupures sur multiprise).
- Piste physique de remplacement, à valider avec le collègue de physique : la **batterie du portable** (capacité réelle face à la capacité d'origine, décharge mesurée face au modèle, autonomie restante pendant une mise à jour).

## Questions à poser à Yaksan (courtes)
1. Que se passe-t-il quand on ferme le capot (veille, arrêt, perte de réseau) ? Les portables sont-ils posés sur une station d'accueil au bureau ?
2. Les mises à jour qui échouent : ça arrive encore ? Combien de fois par mois ?
3. Certificat expiré : combien de cas par mois ? Qui le renouvelle (lui, une autre équipe, l'agent) ? Combien de temps ça prend ? Le certificat est-il dans la carte ou dans Windows ?
4. Arrivées et départs : combien par mois ? Combien de temps pour un arrivant ? Au départ, qui retire les accès (messagerie, boîtes partagées, compte Internet) ?
5. « Orion » : outil interne ou produit du commerce ? Les 3 niveaux, que permettent-ils ? *(Non vérifié : ne pas citer ce nom dans un dossier.)*

## Pour la commission
On garde la Boîte noire (décision de l'enseignant). L'antisèche est mise à jour : maillon « certificat », réponse prête sur « quoi de neuf depuis l'envoi », et ne pas présenter les mises à jour ratées comme le problème n° 1.
Après la commission, les arrivées et départs (le gros des tickets) pourront nourrir l'avenant ou une V2 : **à décider plus tard, pas avant la commission.**
