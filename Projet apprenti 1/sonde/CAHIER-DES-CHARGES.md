# La sonde d'imprimante : cahier des charges (travail de Wassim)

> Ce document dit **quoi** faire et **comment le vérifier**. Il ne contient pas le code : Wassim l'écrit, le teste et sait l'expliquer (charte IA, `docs/charte-ia.md`). Faits venant de l'entretien du 23/11/2026 : **rapportés, à confirmer par le tuteur**.

## 1. À quoi sert la sonde
Quand un ticket « l'imprimante ne marche pas » arrive (GLPI, téléphone, mail ou chat), la sonde **interroge** l'imprimante et le PC, puis rend **un résultat court** que le moteur de règles écrit dans le ticket.

Elle répond d'abord à une question : **faut-il se déplacer ?**

## 2. Trois façons de brancher l'imprimante

| Raccordement | Adresse IP | Comment la sonde interroge | Témoin principal |
|---|---|---|---|
| Réseau filaire | oui | ping, ports 9100 et 631, SNMP | SNMP |
| Wi-Fi | oui | comme le réseau filaire ; panne en plus : « pas sur le bon réseau sans fil » | SNMP |
| USB (ou Bluetooth, Wi-Fi Direct) | non | le **PC**, par PowerShell JEA (lecture seule) | le PC |

Wassim a parlé de Bluetooth ; le Wi-Fi est plus probable (à confirmer). **V1 : réseau filaire et USB.** Wi-Fi ensuite.

## 3. Ce que la sonde rend
Un enregistrement par interrogation, avec la **date** et la **qualité** de chaque mesure. Une mesure absente reste « inconnue » : **jamais 0**. Un timeout veut dire « pas de réponse », pas « imprimante éteinte ».

| Champ | Exemple de valeurs |
|---|---|
| Raccordement | réseau, USB |
| Joignable | oui, non, inconnu |
| État | prêt, impression, bourrage, bac vide, inconnu |
| Compteur de pages | nombre, ou inconnu |
| Niveau de consommable | pourcentage, ou inconnu (seulement si les deux valeurs sont valides) |
| Vue par le PC | vue, absente, file bloquée, inconnu |
| Source et date | SNMP / PC ; heure de la mesure |

## 4. Modules à écrire, dans cet ordre
1. **Vérifications réseau** : ping, ports 9100 et 631.
2. **Lecture SNMP** : état, compteur, consommables. Chaque lecture a un délai d'expiration.
3. **Profils par marque** : une table « marque → objets à lire », OID standard d'abord, OID propres à la marque en secours. Profils : HP, Konica Minolta, générique. Le choix du profil vient de la description de l'appareil (`sysDescr`).
4. **Lecture côté PC** (JEA, liste fermée) : l'imprimante est-elle vue ? file d'impression ? Aucun nom de document.
5. **Mode simulé** : la sonde lit un fichier de scénario au lieu d'un vrai appareil.
6. **Sortie** : le résultat du § 3, transmis au moteur de règles du serveur (guide § 11).

Une panne d'une source ne bloque pas les autres.

## 5. Les tests, à écrire AVANT le code (charte IA, règle 2)

| N° | Situation simulée | Résultat attendu |
|---|---|---|
| T01 | Tout va bien, 5 pages envoyées, compteur +5 | « prêt », compteur cohérent |
| T02 | Bac vide | état « bac vide » |
| T03 | Bourrage | état « bourrage » |
| T04 | Imprimante figée : « prêt » mais compteur immobile | incohérence signalée |
| T05 | Pas de réponse SNMP | « inconnu », jamais « éteinte » |
| T06 | Consommable « inconnu » | pas de pourcentage, pas 0 % |
| T07 | Capacité nulle ou unités différentes | pas de calcul |
| T08 | USB : le PC ne voit plus l'imprimante | « vue : absente » |
| T09 | Compteur qui diminue (redémarrage) | nouvelle référence, pas d'alerte |
| T10 | Commande hors liste JEA | refusée et tracée |

## 6. Développer sans imprimante, puis sur de vrais appareils
- **Simulateur SNMP** (snmpsim) : un fichier par scénario (T01 à T07), valeurs écrites d'après la norme [RFC 3805](https://www.rfc-editor.org/rfc/rfc3805). Gratuit.
- **Appareil simulé sur le réseau** (VM Ubuntu ou Raspberry Pi) pour tester les pannes réseau réelles. Un Raspberry Pi coûte quelques dizaines d'euros (à confirmer) ; vérifier d'abord le matériel du lycée.
- **Vrai appareil, en dernier** : `snmpwalk` sur les arbres `1.3.6.1.2.1.43` et `1.3.6.1.2.1.25.3.5`, puis une **fiche de relevé** : objet, valeur reçue, cohérente ? Les modèles ne renvoient pas tous les mêmes objets (toner absent ou approximatif, compteur à un autre indice).

**À écrire dans le dossier :** « validé sur simulateur, puis sur *N* imprimante(s) réelle(s) : modèle, résultat de chaque objet ». Ne jamais présenter le simulateur comme une preuve sur le matériel.

## 7. Modèles de l'hôpital (à confirmer)
Wassim cite des Konica Minolta et des HP LaserJet. Il relève **le modèle exact** sur l'étiquette, **sans** accès au réseau de l'hôpital, et note : copieur ou imprimante ? réseau ou USB ? Dans la maquette, on ne met que des informations sur le modèle, jamais une adresse ou un nom réel.

## 8. Règles de sécurité
- **Lecture seule** : communauté SNMP en lecture ; aucune écriture, aucun redémarrage dans la V1.
- SNMPv2c circule en clair : LAN de laboratoire seulement ; le noter dans le dossier.
- Aucun secret écrit dans le code. Liste rouge de la charte IA respectée.
- Aucune donnée de l'hôpital dans une IA.

## 9. Indicateurs à mesurer (objectifs à valider par le tuteur)

| Indicateur | Mesure | Objectif |
|---|---|---|
| Bonne cause | 10 pannes provoquées dont « câble USB débranché » | au moins 9 sur 10 |
| Vitesse | temps entre l'arrivée du ticket et le résultat | moins d'1 minute |
| Déplacements évités | pannes où le ticket dit « vérifier le branchement » | à comparer au nombre de déplacements inutiles, chiffre à demander au tuteur |
| Profils | objets lus correctement, par modèle réel | tableau de relevé |

## 10. Charge et suivi
Dans la tâche 5 du dossier (22 h). Les heures ne changent pas : la sonde en est une partie, pas une tâche en plus. Wassim tient le **journal d'usage de l'IA** et, à chaque revue, explique un bloc de code choisi par l'enseignant.
