# Lorenzo (apprenti 3) – suivi (au 11 novembre 2026)

## Décidé (11/11)
- [x] Répartition de la sécurité entre apprentis (voir `docs/apprentis.md`) : Lorenzo **garde** le défi-réponse HMAC et la démonstration du faux boîtier.
- [x] Lorenzo **laisse** la vérification d'authenticité des paquets à Aziza : son catalogue devient une simple liste de paquets en attente. Sa question = **quand installer sans déranger l'agent**.

- [x] **Ajouts en V2 (décidés le 11/11)**, pour renforcer la « valorisation de la donnée » :
  - tableau de bord du parc, sans aucune donnée sur les agents : installations réussies du premier coup, reports et leurs raisons, temps pour que le parc soit à jour, postes en retard (≈ 6 h) ;
  - mesure de l'apport (essai R6 remis) : séance de travail jouée, nombre d'installations qui seraient tombées devant l'agent avec l'outil classique, puis avec le boîtier (≈ 3 h).
  - Nouveau bilan : V1 ≈ 108 h, V2 ≈ 40 h, marge ≈ 2 h.
- [x] Extensions ajoutées : assistant de réglage (seuils proposés par le poste), détection d'un radar masqué. Refusés : radar multi-cibles LD2450 (trop long), veille du soir (déjà en extension).
- [x] Page de présentation : `livrables/page-html/poste-attentif.html` (https://claude.ai/artifact/UG9LExYjDUDHFMyMRyhCZ9), à jour.

## Proposé par la revue du 11/11 (à valider par l'enseignant)
| Aujourd'hui | Proposition |
|---|---|
| Défi toutes les 10 min, messages « présent » non signés (faille : faux boîtier branché entre deux défis) | Chaque message signé (HMAC + compteur) ; nouveau défi dès que le boîtier est rebranché |
| V1 sans défi-réponse | V1 = boîtier + service + verrou + filet GPO + défi-réponse + physique R1–R4 ; serveur et post-installation en V2 |
| Lorenzo monte lui-même le domaine, les UO, les GPO, LAPS | Contrôleur de domaine commun préparé par l'enseignant ; Lorenzo vérifie et capture (C10 = exploiter) |
| Sobriété (veille du soir) en V2 | Extension (la GPO de veille fait déjà presque la même chose) |
| Fiche de conformité (BitLocker, Defender…) | Extension (proche du diagnostic de l'apprenti 1) |
| 0 h pour le réseau | 8 h réservées à l'exploitation réseau |
| Charge réaliste ≈ 178 h avec IA | V1 ≈ 108 h, V2 ≈ 40 h (avec les ajouts du 11/11), marge ≈ 2 h |

## Physique (à valider avec le collègue de physique)
- Garder : R1 seuils, R2 + R3 zone de détection, R4 délai de détection (indicateur clé), R5 court ; exposition en calcul seul.
- Mettre de côté : E1–E3 (wattmètre, bilan énergétique), sauf E1 court si la sobriété revient.

## À faire
- [ ] Valider les propositions ci-dessus
- [ ] Mettre à jour le dossier V2 (V1/V2, faille corrigée, physique réduite)
- [ ] Remplir le formulaire académique (`Projet apprenti 3/Fiche presentation projet E6-projet-IR v2.docx`), comme pour Aziza et Yaksan
- [ ] Validation de la réalisation au lycée par l'académie

## Questions pour la visite du tuteur
1. Les périphériques USB de type port série sont-ils autorisés ?
2. Les agents sont-ils administrateurs de leur poste ?
3. Délai actuel du verrouillage sur inactivité ?
4. Comment les installations sont-elles lancées aujourd'hui (outil, horaires) ?
5. Distance entre l'agent et l'usager au guichet ?
