# Yaksan (apprenti 2) – revue de la proposition de Gemini (23/11/2026)

Prompt : `prompt-gemini-nouveau-projet.md`. Idée recommandée par Gemini : **« SAS-RH »**, un outil qui prépare, fait valider puis exécute les arrivées et les départs d'agents (compte Internet filtré, boîtes partagées), avec un journal chaîné ; physique : résistance interne de la batterie des portables rendus.
Statut : **piste à l'étude, rien n'est décidé.** On continue de défendre la Boîte noire devant la commission.

## Verdict
Le cœur est bon : il part du vrai volume de tickets, le code est riche, C10 est naturel (annuaire, messagerie, proxy) et la question de sécurité reste la même. Trois points sont à corriger : la physique (une pile 18650 seule n'est pas la batterie d'un portable), l'ancrage sur un ESP32 en réseau (trop proche de Lorenzo) et l'absence des certificats expirés.

## Ce qui est bon
| Point | Pourquoi |
|---|---|
| Part des arrivées et des départs | C'est la majorité des tickets de Yaksan (23/11) |
| Code personnel | Lecture de l'annuaire, page web, actions sur le proxy et la messagerie, journal chaîné, vérificateur |
| C10 | LDAP, SMTP/IMAP, authentification au proxy, NTP, DNS : on exploite des services, on ne configure pas le réseau |
| Paliers | Simulation, puis confirmation, puis automatique pour la seule coupure d'urgence : naturel et défendable |
| Sécurité | « Quelqu'un a-t-il effacé ce qui s'est passé ? » : preuve qu'un accès a bien été coupé à l'heure dite |
| Doublons | Pas de GLPI, pas d'imprimante, pas de préparation de PC, pas de RFID |

## Problèmes et corrections
| Problème | Pourquoi c'est gênant | Correction proposée |
|---|---|---|
| **Physique sur une pile 18650 seule** | Ce n'est pas la batterie du portable : Gemini le reconnaît lui-même (question 2). Le professeur de physique la jugera décorative. Un banc batterie a déjà été jugé artificiel chez Wassim (12/11). Manipuler du Li-ion nu au lycée demande des précautions | Mesurer **le vrai portable** : énergie réellement rendue par la batterie (décharge à charge constante, puis recharge mesurée par un wattmètre USB-C posé entre chargeur et PC, sans câblage 230 V), comparée à la capacité annoncée par Windows (`powercfg /batteryreport`). Modèle E = ∫P·dt, incertitudes, autonomie prévue face à l'autonomie mesurée. **Décision** : le portable rendu est réattribué ou part en maintenance |
| Précision annoncée < 5 % sur Rint | Avec 10 Ω, le courant fait environ 0,4 A : la chute de tension est de l'ordre de 20 mV, pour une résolution de 4 mV sur l'INA219. On est vers 20 %, pas 5 % (calcul à vérifier). Seuil de 250 mΩ arbitraire | Sans objet si on passe à la mesure d'énergie ; sinon, courant plus fort et seuil fixé par l'expérience |
| **Ancrage sur un ESP32 + W5500 avec « accusé signé »** | Même matériel que le leurre de Lorenzo, et un accusé signé ressemble à son HMAC. L'argument « un ESP32 est plus sûr qu'un serveur » est faible | Ancrer ailleurs : **reçu d'empreinte envoyé par mail** chaque jour à une boîte que l'administrateur de l'outil ne gère pas (C10 : SMTP), plus une copie sur un serveur séparé |
| **Certificats expirés absents** | C'est la panne la plus citée par Yaksan | V2 : **veille des certificats** (PowerShell : certificats de l'utilisateur qui expirent dans moins de 30 jours ; alerte par mail ; renouvellement guidé à paliers). Autorité de certification du labo préparée par l'enseignant |
| Source des départs = unité « Départs » de l'annuaire | L'annuaire est géré par une autre équipe ; Yaksan apprend sans doute un départ par un ticket ou par le service RH lui-même | Source = **fiche de mouvement** (formulaire ou fichier) ; l'annuaire est seulement lu. À demander au tuteur |
| 25 h pour installer 3 serveurs | C'est de l'installation (E5), pas du code ni de l'exploitation | Contrôleur de domaine commun déjà prévu (préparé par l'enseignant) ; Yaksan n'installe que le proxy et la messagerie de labo (court) |
| « Boîtes partagées » | Notion de messagerie Microsoft ; avec Dovecot, ce sont des droits partagés, plus pénibles | Vérifier l'outil réel ; sur la maquette, droits partagés Dovecot ou simulation documentée |
| Indicateur « < 3 s sur 10 000 lignes » | Trop facile, il ne prouve rien | Remplacer par : **comptes orphelins trouvés** par un audit qui compare annuaire, proxy et boîtes partagées (objectif 100 % sur 20 cas préparés) |

## Version corrigée (ébauche, heures en ordres de grandeur)
| Version | Contenu | Heures |
|---|---|---|
| **V1** | Fiche de mouvement → plan d'actions en simulation → confirmation → exécution (compte Internet filtré à 3 niveaux, boîtes partagées, message d'accueil) ; **audit des comptes orphelins** ; journal chaîné + reçu d'empreinte par mail ; captures LDAP, SMTP/IMAP, proxy, NTP | ≈ 95 h |
| **V2** | Veille des certificats (alerte avant expiration) ; physique de la batterie du portable rendu et décision de réattribution ; tableau de bord des mouvements | ≈ 40 h |
| **Extensions** | Coupure d'urgence automatique (palier 3) ; lecture de la carte au guichet | — |

## Questions à poser (Yaksan ou tuteur)
1. Comment apprenez-vous une arrivée ou un départ (ticket, mail du service RH, liste) ? Combien par mois ?
2. Qui coupe aujourd'hui les accès au départ, et en combien de temps ?
3. Les portables rendus reviennent-ils au support ou à l'autre équipe ? Qui décide de les réattribuer ? **Si ce n'est pas le support, la physique proposée tombe.**
4. Quelle messagerie (Exchange, autre) ? Comment donnez-vous l'accès à une boîte partagée ?
5. Les portables ont-ils une charge en USB-C ? (pour le wattmètre)

## À vérifier
- Durée de conservation des traces : la CNIL recommande de l'ordre de 6 mois à 1 an pour les journaux (recommandation de 2021 sur la journalisation) : **à vérifier**.
- Résolution réelle de l'INA219 et précision d'un wattmètre USB-C du commerce : **à vérifier** sur les fiches techniques.
- Prix : wattmètre USB-C environ 15 à 30 € (**à confirmer**).
