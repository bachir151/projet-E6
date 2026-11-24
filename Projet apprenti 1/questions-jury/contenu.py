# Questions difficiles du jury – Wassim (apprenti 1)
# Projet « Supervision instrumentée des imprimantes : de la panne au ticket » (décisions des 16 et 24/11/2026)
# Généré par : python3 docs/questions-jury/generer.py "Projet apprenti 1/questions-jury/contenu.py"

META = {
    "titre": "Questions difficiles du jury – projet de Wassim",
    "sous_titre": "« Supervision instrumentée des imprimantes : de la panne au ticket » : boîtier, sonde (SNMP, PC par JEA), quatre témoins, GLPI ; V2 : annuaire Samba et station des PC neufs · apprenti 1",
    "pied": "Questions du jury – apprenti 1 – document de préparation, ne pas diffuser",
    "pdf": "Questions_jury_Wassim.pdf",
    "cadre": [
        "<b>Sources :</b> formulaire académique refait le 16/11/2026 (<code>fiche-academique/</code>) et document de travail <code>projet-v4/</code>. Les anciennes versions (chariots, banc de batterie) sont dans <code>archives/</code>.",
        "<b>Deux publics.</b> Partie A : questions <b>à l'enseignant</b> (commission, jury). Parties B à G : questions <b>à l'apprenti</b> pendant l'oral (C01, C03, C08, C10, physique, sécurité).",
        "<b>Règle d'or pour l'oral :</b> une phrase de réponse, puis la preuve (essai, mesure, capture). Dire ce que le système ne sait pas faire fait partie de la réponse.",
    ],
    "fin": "Document de préparation pédagogique. Points non vérifiés sur le matériel : distinction vibration impression/veille, compteur de pages lu en SNMP sur l'imprimante du lycée, objets SNMP lus selon la marque et le modèle d'imprimante, accès JEA sans domaine (compte local).",
}

TOP = ["B1", "B2", "F1", "D2", "A2", "E1", "C2"]

SECTIONS = [
{
"titre": "A. Le cadre du sujet", "qui": "Enseignant",
"questions": [
{"id": "A1", "niv": 3,
 "q": "Le texte impose qu'un projet d'apprenti soit développé dans l'entreprise. Pourquoi au lycée ?",
 "piege": "Arrêté du 25 janvier 2023 : « Pour les apprentis les projets doivent impérativement être développés dans l'entreprise ».",
 "rep": "Le besoin vient du support d'un hôpital (imprimantes, tickets reçus par plusieurs canaux). On ne branche pas un projet d'apprenti sur les imprimantes ou le GLPI de production d'un hôpital. La réalisation se fait au lycée sur maquette, données fictives, sous réserve de validation par l'académie.",
},
{"id": "A2", "niv": 3,
 "q": "Le formulaire envoyé le 12 novembre parlait de chariots de soins. Pourquoi ce changement ?",
 "rep": "L'entretien du 16/11 avec l'apprenti a montré que les chariots ne posent pas de problème et que ses vraies pannes sont les imprimantes et la préparation des PC. Le projet a été recentré sur son travail réel ; un formulaire corrigé a été produit.",
 "preuve": "Notes de l'entretien du 16/11/2026.",
},
{"id": "A3", "niv": 2,
 "q": "Pourquoi n'y a-t-il pas d'Active Directory dans la V1 ?",
 "rep": "Le besoin est de savoir à distance s'il faut se déplacer : la sonde n'a besoin que de l'imprimante (SNMP), du PC (JEA) et du boîtier. Le réseau attendu vient d'un tableau dans GLPI. L'annuaire est prévu en V2, simulé par Samba sur Ubuntu (Windows 11 Famille ne rejoint aucun domaine ; le PC de la maquette est une machine virtuelle Windows 11 Entreprise en évaluation ou Pro). Point à tester d'abord : l'accès JEA sans domaine, avec un compte local.",
},
{"id": "A4", "niv": 2,
 "q": "Le projet semble très gros. Qu'est-ce qui est obligatoire ?",
 "rep": "V1 : boîtier, sonde, quatre témoins, règles, ticket GLPI au palier 1 (le système conseille), écran, tableau de bord. V2 : carte du technicien, preuve de réparation, encre, annuaire Samba et station des PC neufs. Les extensions (redémarrage à distance, fausse imprimante, cartes sécurisées) ne sont pas dues.",
},
]},
{
"titre": "B. Le besoin et la solution", "qui": "Apprenti · C01",
"questions": [
{"id": "B1", "niv": 3,
 "q": "Une imprimante réseau dit déjà son état. Pourquoi ajouter un boîtier ?",
 "piege": "Si l'apprenti ne sait pas répondre, tout le matériel paraît décoratif.",
 "rep": "Parce qu'elle peut se tromper : figée, elle répond « prête » alors que rien ne sort. Le boîtier sent si la machine travaille vraiment (vibration), et le compteur de pages dit ce qu'elle a réellement imprimé. C'est la comparaison avec ce qui a été envoyé qui trouve la cause.",
 "preuve": "Démonstration de l'imprimante figée : SNMP dit « prête », aucune vibration, compteur +0, ticket « imprimante figée ».",
},
{"id": "B2", "niv": 3,
 "q": "Que gagne concrètement le service ?",
 "rep": "Un ticket avec la cause au lieu de « ça ne marche pas » ; des déplacements évités (câble branché ou papier remis sur place, redémarrage fait à la main sur conseil) ; une preuve de réparation ; en V2, des PC neufs rangés dans le bon service.",
 "relance": "Avez-vous des chiffres ? → indicateurs E1 à E8 mesurés sur la maquette ; volumes réels à demander au tuteur.",
},
{"id": "B3", "niv": 2,
 "q": "À quoi sert le bouton si les capteurs détectent déjà les pannes ?",
 "rep": "Aux pannes qu'aucun capteur ne voit : page tachée, impression de travers, message à l'écran de l'imprimante. La secrétaire appuie, le ticket s'ouvre avec le nom exact de l'imprimante.",
},
]},
{
"titre": "C. Gérer le projet", "qui": "Apprenti · C03",
"questions": [
{"id": "C1", "niv": 2,
 "q": "Quel a été votre plus gros risque et comment l'avez-vous traité ?",
 "rep": "Que la vibration ne distingue pas « imprime » et « attend ». Testé dès la tâche 3 ; si c'était raté, le compteur de pages et l'état SNMP suffisaient comme témoins.",
},
{"id": "C2", "niv": 3,
 "q": "Pourquoi le système ne redémarre-t-il pas l'imprimante tout seul ?",
 "rep": "En V1, le système reste au palier 1 : il conseille, lit en lecture seule et ne modifie jamais l'imprimante. Passer à un palier supérieur (confirmation humaine, puis automatique) est une extension, décidée sur indicateurs : causes justes pendant toute la campagne d'essai, aucune action refusée par le technicien.",
},
]},
{
"titre": "D. Coder", "qui": "Apprenti · C08",
"questions": [
{"id": "D1", "niv": 2,
 "q": "Pourquoi ne pas compter les feuilles avec un capteur, plutôt que de croire le compteur de l'imprimante ?",
 "piege": "Le jury teste si l'apprenti sait justifier un choix de conception.",
 "rep": "Dans les 10 pannes de test, aucune n'a besoin d'un capteur de feuilles : la vibration et le compteur suffisent. Le compteur se lit par le réseau (SNMP, Printer MIB), sans rien fixer sur l'imprimante. Un capteur infrarouge est difficile à placer (sortie cachée, pile qui monte, feuilles serrées). Il est prévu en V2 pour vérifier que le compteur dit vrai.",
 "relance": "Et si le compteur se trompe ? → c'est justement la mesure de la V2 : 100 pages et 10 bourrages, compteur comparé au capteur.",
},
{"id": "D2", "niv": 3,
 "q": "Montrez la règle qui conclut « imprimante figée ».",
 "rep": "Travail envoyé (CUPS) ; aucune vibration et compteur de pages inchangé après le délai d'alerte ; SNMP répond « prête » sans erreur ; la file du PC est vide. Toutes les conditions vraies → cause « imprimante figée ».",
 "preuve": "Extrait du code Python et du ticket produit.",
},
{"id": "D3", "niv": 2,
 "q": "(V2) Que fait exactement votre script de préparation des PC neufs ?",
 "rep": "Il lit le numéro de série, demande sa commande au serveur, met le PC dans le domaine directement dans l'unité d'organisation du service (Add-Computer -OUPath), installe les applications du profil, vérifie et rend compte. Le mot de passe de jonction est demandé, jamais écrit.",
},
]},
{
"titre": "E. Exploiter le réseau", "qui": "Apprenti · C10",
"questions": [
{"id": "E1", "niv": 3,
 "q": "Une imprimante ne répond plus. Que vérifie votre système, dans quel ordre ?",
 "rep": "Ping ; nom DNS ; bail DHCP ; ports 9100 et 631 ; puis comparaison de son réseau avec le réseau attendu pour le service, lu dans un tableau de l'inventaire GLPI (en V2, dans l'AD). Le ticket dit l'étape qui bloque.",
 "preuve": "Capture Wireshark et ticket « hors du réseau attendu ».",
},
{"id": "E2", "niv": 2,
 "q": "Qu'est-ce qu'on voit dans une capture SNMP ?",
 "rep": "En version 2c, la communauté circule en clair et se lit dans la capture. C'est pour ça que le compte est en lecture seule, et que SNMP version 3 est prévu en extension.",
},
{"id": "E3", "niv": 2,
 "q": "Avez-vous configuré des VLAN ?",
 "piege": "Configurer des VLAN relève de C09 (E5), pas de l'E6.",
 "rep": "Non : j'exploite le réseau en place. Je vérifie si l'imprimante est dans le bon réseau, je ne change rien au réseau.",
},
]},
{
"titre": "F. Physique", "qui": "Apprenti · professeur de physique",
"questions": [
{"id": "F1", "niv": 3,
 "q": "Comment avez-vous choisi le seuil de vibration ?",
 "rep": "Accéléromètre étalonné (6 positions). Mesures en veille et en impression, 20 essais. Seuil = moyenne en veille + k écarts-types ; taux de fausses détections mesuré sur 1 h.",
 "relance": "Pourquoi cette fréquence d'échantillonnage ? → condition de Shannon sur les fréquences des moteurs.",
},
{"id": "F2", "niv": 2,
 "q": "Comment avez-vous fixé le délai avant de dire « rien ne bouge » ?",
 "rep": "Par la mesure : délai entre l'envoi du travail et le début de la vibration (préchauffage, mise en route), sur 20 essais, avec moyenne, écart-type et incertitude. Le délai d'alerte est pris au-dessus de la valeur maximale mesurée, avec une marge.",
},
]},
{
"titre": "G. Sécurité et vie privée", "qui": "Apprenti",
"questions": [
{"id": "G1", "niv": 3,
 "q": "Votre serveur peut agir sur les PC. Qu'est-ce qui l'empêche d'en faire trop ?",
 "rep": "Un point d'accès JEA : liste fermée de commandes, compte sans droit d'administrateur. Une commande hors liste est refusée et tracée.",
 "preuve": "Démonstration en direct et journal.",
},
{"id": "G2", "niv": 2,
 "q": "Quelqu'un peut-il copier la carte RFID du technicien ?",
 "rep": "Oui pour les cartes bon marché (MIFARE Classic, protection cassée depuis 2008). Le numéro de carte seul ne suffit donc pas : confirmation sur l'écran ; cartes sécurisées en extension.",
},
{"id": "G3", "niv": 2,
 "q": "Votre système lit-il des données patient ?",
 "rep": "Non. Il lit le nombre de documents en attente, jamais leur nom. Pas de micro, pas de caméra. La carte du technicien mesure la durée des pannes, pas l'activité des personnes.",
},
]},
]

A_CORRIGER = [
    "<b>Formulaire déjà envoyé (chariots).</b> Demander à l'inspection si le formulaire corrigé peut le remplacer ; sinon, expliquer le recentrage à la revue 1 (question A2).",
    "<b>Recouvrements à surveiller.</b> Station des PC neufs proche du projet de Lorenzo (installations des nouveaux agents) ; démonstration de la carte copiée proche de sa question « ce boîtier est-il le vrai ? ». Garder chez Wassim la question JEA comme question de sécurité principale.",
    "<b>Machines virtuelles Windows 11 Entreprise.</b> L'évaluation dure 90 jours : prévoir la réinstallation pendant le projet.",
    "<b>Chiffres réels.</b> Demander au tuteur la part des tickets « imprimante » et le nombre de PC préparés par mois, pour le bilan « adopter ou non ».",
]

LECTURES = [
    "RFC 3805, <i>Printer MIB v2</i> (2004) et RFC 2790, <i>Host Resources MIB</i> (2000) : objets SNMP d'état et de consommables.",
    "Microsoft Learn : « Just Enough Administration », <code>Add-Computer</code>, <code>Get-PrintJob</code>.",
    "Documentation Samba : « Setting up Samba as an Active Directory Domain Controller » (wiki.samba.org).",
    "F. D. Garcia <i>et al.</i>, « Dismantling MIFARE Classic », <i>ESORICS 2008</i>, LNCS 5283.",
    "J. Müller <i>et al.</i>, « SoK: Exploiting Network Printers », <i>IEEE S&amp;P</i>, 2017.",
]
