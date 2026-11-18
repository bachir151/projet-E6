# Wassim : questions difficiles du jury et réponses

Préparé le 12/11/2026.

**Base de travail** : dossier V3 du 8 novembre (`projet_E6_apprenti_1_guide_complet_V3_WASSIM.pdf`, 24 pages).
La V4 et le formulaire envoyé à l'académie ne sont pas dans le dépôt. Si la V4 a changé le périmètre, certaines réponses sont à ajuster.

**Hypothèse** : « jury » = la commission qui examine le projet. Wassim aura les mêmes questions à l'oral.

**Légende de la colonne « État »**
- **Prêt** : la réponse est déjà dans le dossier.
- **Fragile** : la réponse existe mais elle manque de preuves.
- **Manquant** : il n'y a pas encore de bonne réponse. Voir la liste à la fin.

## 1. Les cinq questions les plus dangereuses

| Question du jury | Réponse à donner | État |
|---|---|---|
| « Le texte dit que le projet d'un apprenti se fait en entreprise. Pourquoi au lycée ? » | Le besoin vient de l'hôpital. La production est interdite d'accès (données de santé, postes de soins). La maquette reproduit le besoin avec des données fictives. La validation est demandée à l'académie. | Prêt. Ne pas minimiser : le texte dit « impérativement ». |
| « Ce sont deux projets collés : des tickets et un banc batterie. Quel est le lien ? » | Le scénario 2 fait le lien : Windows *estime* l'usure, le banc la *mesure*, et le résultat revient dans le ticket avant de commander une batterie. | Prêt, à condition de présenter le scénario 2 en premier. |
| « Où sont les chiffres du besoin ? » | Il faut le nombre de chariots, de pannes par mois, de batteries changées par an, et le prix d'une batterie. | Manquant dans la V3. À demander à M. Goussard. |
| « Une charge dure 2 à 3 h. Pourquoi ne pas changer la batterie directement ? » | Le banc évite de changer une bonne batterie quand la cause est la veille ou un plantage. La preuve reste dans le ticket. | Fragile sans les chiffres de la ligne précédente. |
| « Trois langages en 150 h, avec l'IA : qu'a vraiment codé l'apprenti ? » | Page « Qui fait quoi », journal d'usage de l'IA, tests, modification du code en direct devant le jury. | Fragile. La charge n'a pas été revue comme pour Lorenzo et Yaksan (≈ 180 h chacun). Le banc et son firmware en 10 h semblent courts. |

## 2. Questions du professeur de physique

| Question | Réponse | État |
|---|---|---|
| « Vous mesurez côté chargeur. Que mesurez-vous vraiment ? » | L'énergie absorbée, pertes du circuit de charge comprises. D'où le mot rendement « apparent ». On compare des tendances, pas des valeurs absolues. | Prêt (page 16). |
| « Pourquoi le portable est-il éteint pendant la charge ? » | Allumé, il consomme une partie de l'énergie mesurée. L'énergie stockée serait surestimée. | Prêt (page 16). |
| « "Batterie presque vide" : selon qui ? Selon la jauge que vous contestez ? » | Le raisonnement tourne en rond dans la V3. Parade : décharger jusqu'à l'arrêt automatique du portable. Le point de départ devient physique. | Manquant. |
| « À partir de quel écart concluez-vous "batterie usée" ? » | Pas de seuil dans la V3. Parade : mesurer d'abord une batterie témoin en bon état, puis comparer. | Manquant. |
| « Quelle incertitude ? » | Elle vient surtout du shunt (tolérance à lire sur le composant, souvent 1 %). L'INA226 lui-même est bien plus précis (erreur de gain 0,1 % et décalage 10 µV au maximum, fiche Texas Instruments). L'étalonnage E1 au multimètre le vérifie. | Fragile : le calcul n'est pas écrit. |
| « Une lecture par seconde suffit-elle ? » | Oui, si l'INA226 moyenne entre deux lectures (réglage interne). | Fragile : à écrire dans le dossier. |
| « Combien de charges en 10 h de physique ? » | Trois ou quatre au mieux. Et la règle « charge surveillée » interdit de laisser tourner seul. | Fragile : planning à revoir. |

## 3. Questions réseau et sécurité

| Question | Réponse | État |
|---|---|---|
| « Où est C10 ? L'apprenti configure-t-il le pare-feu ? » | Non : le socle est préparé avec l'enseignant. Lui exploite : plan d'adressage, tableau des flux, captures (WinRM 5986, MQTT 8883), DNS, DHCP, NTP, mesure des temps de réponse, comportement en cas de coupure. | Prêt (page 17). |
| « Un courriel déclenche des commandes à distance, dans un hôpital. Et si le courriel est piégé ? » | Le texte du courriel ne devient jamais une commande. Le PC doit exister dans l'inventaire. Les commandes sont en lecture seule et listées par JEA (essai T07). | Prêt. |
| « Pourquoi JEA en fin de projet ? » | Compte restreint dès le début, JEA finalisé à la fin. | Fragile : point faible du planning. |
| « Votre système éteint le portable avant la mesure (page 15). Qui confirme ? » | C'est une action sur une machine : il faut une confirmation du technicien. | Manquant : à ajouter. |
| « Quelle différence avec les trois autres projets ? » | Lui : diagnostic déclenché par un ticket. Proposition pour sa question de sécurité : « Qui a le droit de lancer quoi ? » (moindre privilège). | Manquant : sa question de sécurité n'est pas dans le tableau de répartition de `docs/apprentis.md`. |

## 4. Trois points à vérifier avant la présentation

1. **Solutions existantes.** L'agent d'inventaire de GLPI remonte peut-être déjà la capacité des batteries. Non vérifié : à contrôler dans la documentation de GLPI. Le jury peut demander ce que le projet apporte en plus : la mesure indépendante et le lien avec le ticket.
2. **Chargeur à prise ronde.** Beaucoup de portables HP et Dell ont une broche centrale d'identification. Si le câble instrumenté ne la transmet pas, le portable peut refuser de charger. Ce risque n'est pas dans la V3. À tester sur le portable choisi.
3. **V1 / V2 / extensions.** La V3 ne les sépare pas clairement, alors que le cadre le demande. Le volet Wi-Fi n'est pas tranché non plus.

## 5. Ce qui n'a pas encore de bonne réponse

- [ ] Chiffres du besoin : chariots, pannes par mois, batteries changées par an, prix d'une batterie (M. Goussard).
- [ ] Point de départ de la charge : décharge jusqu'à l'arrêt automatique.
- [ ] Seuil de décision : mesure d'une batterie témoin.
- [ ] Calcul d'incertitude écrit (shunt, INA226, multimètre).
- [ ] Confirmation du technicien avant l'extinction du portable.
- [ ] Question de sécurité de Wassim dans le tableau de répartition.
- [ ] Découpage V1 / V2 / extensions.
- [ ] Revue de la charge (150 h) avec `/revue-projet`.
- [ ] Essai du câble instrumenté sur le portable choisi (broche d'identification).

## 6. Lectures utiles

- *Guide pour l'expression de l'incertitude de mesure* (GUM, JCGM 100:2008), gratuit en français sur le site du BIPM.
- Fiche technique INA226, Texas Instruments (tableau des erreurs).
- ANSSI, *Recommandations relatives à l'administration sécurisée des systèmes d'information* (guide PA-022), pour les questions sur WinRM et les comptes techniques.
- Microsoft Learn, « Just Enough Administration », déjà cité dans le dossier.
