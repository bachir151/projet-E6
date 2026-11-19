# Lorenzo (apprenti 3) – suivi (au 18 novembre 2026)

## Décidé le 18/11 : la partie AD passe en extension
- Le poste Windows 11 de la maquette **n'est plus dans un domaine** en V1 (groupe de travail). Le filet de sécurité (blocage après 10 min) vient d'une **stratégie locale**.
- **En extension, si le temps le permet** : jonction à un domaine AD de maquette, filet par GPO, LAPS, captures Kerberos et LDAP.
- C10 en V1 : DHCP, DNS, NTP (dérive mesurée), HTTPS (TLS), SMB (débit mesuré), captures Wireshark. Plus de machine virtuelle Windows Server.
- Reporté dans le formulaire (13 p.), les schémas, la page HTML et la présentation 3Blue1Brown.

## Entretien avec le tuteur (16/11) : voir `entretien-tuteur-2026-11-16.md`
- Besoins **confirmés par des faits** : agents qui ne font pas Windows + L ; fenêtre « installer ? oui/non », refus répétés, mise à jour forcée après 2 ou 3 refus.
- Parc de **portables** (veille prolongée, réveil le week-end pour les mises à jour, certains emportés à domicile). AD nationale hors site ; Lorenzo n'a pas de code admin.
- Propositions à valider : P1 règle de report réelle (forcée à la prochaine absence), P2 mode « hors bureau », P3 réveil du week-end (extension), P4 « socle de maquette » (clé Rufus), P5 contexte corrigé, P6 compteur de reports par poste.
- [ ] Valider P1 à P6 (enseignant)
- [ ] **Formulaire non envoyé** : corriger le contexte et les hypothèses avant envoi, puis régénérer DOCX + PDF
- [ ] Mettre à jour la page HTML et la présentation 3Blue1Brown

## Décidé (11/11)
- [x] Répartition de la sécurité entre apprentis (voir `docs/apprentis.md`) : Lorenzo **garde** le défi-réponse HMAC et la démonstration du faux boîtier.
- [x] Lorenzo **laisse** la vérification d'authenticité des paquets à Aziza : son catalogue devient une simple liste de paquets en attente. Sa question = **quand installer sans déranger l'agent**.

- [x] **Ajouts en V2 (décidés le 11/11)**, pour renforcer la « valorisation de la donnée » :
  - tableau de bord du parc, sans aucune donnée sur les agents : installations réussies du premier coup, reports et leurs raisons, temps pour que le parc soit à jour, postes en retard (≈ 6 h) ;
  - mesure de l'apport (essai R6 remis) : séance de travail jouée, nombre d'installations qui seraient tombées devant l'agent avec l'outil classique, puis avec le boîtier (≈ 3 h).
  - Nouveau bilan : V1 ≈ 108 h, V2 ≈ 40 h, marge ≈ 2 h.
- [x] Extensions ajoutées : assistant de réglage (seuils proposés par le poste), détection d'un radar masqué. Refusés : radar multi-cibles LD2450 (trop long), veille du soir (déjà en extension).
- [x] Page de présentation : `livrables/page-html/poste-attentif.html` (https://claude.ai/artifact/UG9LExYjDUDHFMyMRyhCZ9), à jour.

## Recentrage de la revue du 11/11 : **validé par l'enseignant (11/11)**
| Aujourd'hui | Proposition |
|---|---|
| Défi toutes les 10 min, messages « présent » non signés (faille : faux boîtier branché entre deux défis) | Chaque message signé (HMAC + compteur) ; nouveau défi dès que le boîtier est rebranché |
| V1 sans défi-réponse | V1 = boîtier + service + verrou + filet GPO + défi-réponse + physique R1–R4 ; serveur et post-installation en V2 |
| Lorenzo monte lui-même le domaine, les UO, les GPO, LAPS | Contrôleur de domaine commun préparé par l'enseignant ; Lorenzo vérifie et capture (C10 = exploiter) |
| Sobriété (veille du soir) en V2 | Extension (la GPO de veille fait déjà presque la même chose) |
| Fiche de conformité (BitLocker, Defender…) | Extension (proche du diagnostic de l'apprenti 1) |
| 0 h pour le réseau | 8 h réservées à l'exploitation réseau |
| Charge réaliste ≈ 178 h avec IA | V1 ≈ 108 h, V2 ≈ 40 h (avec les ajouts du 11/11), marge ≈ 2 h |

## Installations : option B choisie (15/11)
- Constat : les grandes organisations règlent déjà l'essentiel (nuit + réveil à distance, heures d'activité de Windows Update, mises à jour en arrière-plan, hotpatch, PSAppDeployToolkit). Le radar ne les remplace pas : il leur donne l'information « l'agent est-il là ? ».
- Décision : l'orchestrateur maison est remplacé par **PSAppDeployToolkit** (PowerShell, libre). La présence devient une **condition** que l'outil interroge.
- Lorenzo écrit : `Test-PosteAbsent` (lecture de l'état de présence), le déclenchement sur l'événement « absent », les scripts de déploiement par paquet, le report si un logiciel est ouvert, l'envoi des résultats au serveur.
- Piège à vérifier : en mode silencieux, la fermeture des logiciels de PSADT peut les fermer sans demander → ne pas l'utiliser ; reporter à la place (règle « aucun logiciel fermé »).
- Essai R6 : comparer à un outil **bien réglé** (nuit + heures d'activité + report si logiciel ouvert), pas seulement à « heure fixe 12 h 30 ».
- [ ] Mettre à jour la page HTML, le formulaire et la présentation.

## Physique (validée par l'enseignant ; reste à valider avec le collègue de physique)
- Garder : R1 seuils, R2 + R3 zone de détection, R4 délai de détection (indicateur clé), R5 court ; exposition en calcul seul.
- Mettre de côté : E1–E3 (wattmètre, bilan énergétique), sauf E1 court si la sobriété revient.

## À faire
- [x] Maquette 3D animée (19/11) : `livrables/animation-3d/maquette-3d.html` (Three.js, 10 étapes, captures dans `captures/`). Bureau de Martine, boîtier ouvert (LD2410, ESP32, LED RVB), Windows 11 en VM, switch/routeur/serveur, oscilloscope. Vérifiée dans Brave avec le GPU (Iris Xe) : 0 erreur JavaScript, ≈ 50 images/s. Valeurs de l'oscilloscope et des seuils = exemples, à remplacer par les mesures R1 à R4.
- [x] Récit refait pour des **postes de bureau** (12/11) : formulaire, présentation, page HTML (https://claude.ai/artifact/3Bhga5UmEr3r67mo6Wus3j)
- [x] Poste Windows 11 (12/11) : **Windows 11 Entreprise en évaluation (90 j) en VM VirtualBox** sur le PC Ubuntu (le PC du commerce de l'enseignant est en édition Famille, qui ne rejoint pas un domaine). Installation ≈ 11/01, **réinstallation 5–9 avril** (dans le Gantt), après export des journaux et mesures ; couvre la soutenance de juin.
- [ ] Choisir le titre définitif (propositions du 12/11) et le reporter partout
- [x] Présentation 3Blue1Brown : `livrables/powerpoint-3b1b/Projet_E6_Lorenzo_3b1b.pptx` (30 diapositives, animations au clic, notes) ; à relire dans PowerPoint
- [x] Dossier V2 (PDF) : **pas de mise à jour** (décision du 11/11 : seuls la page HTML, le formulaire et la présentation sont demandés)
- [x] Propositions ci-dessus validées (11/11)
- [x] Formulaire académique rempli (version corrigée et enrichie) : `fiche-academique/Fiche_presentation_E6_Lorenzo.docx` et `.pdf` (13 p.). À compléter à la main : adresse, site, téléphone, mail de l'entreprise ; nom et fonction du tuteur
- [x] Contrôle avant envoi (12/11) : formulaire prêt ; coordonnées entreprise et tuteur à écrire à la main
- [ ] Validation de la réalisation au lycée par l'académie

## Questions pour la visite du tuteur (réponses du 16/11 : Q2 non, quasi sûr ; Q4 répondue ; Q1, Q3, Q5 à reposer)
1. Les périphériques USB de type port série sont-ils autorisés ?
2. Les agents sont-ils administrateurs de leur poste ?
3. Délai actuel du verrouillage sur inactivité ?
4. Comment les installations sont-elles lancées aujourd'hui (outil, horaires) ?
5. Disposition des bureaux : bureaux partagés ou plateau ouvert, distance au bureau voisin ? (et, à l'accueil, distance à l'usager)
6. Quel outil installe les logiciels aujourd'hui (SCCM, WAPT, Intune, autre) et à quelles heures ? Pourquoi les installations dérangent-elles quand même ? Les postes restent-ils allumés la nuit ?
7. Les agents ont-ils une carte à puce ? Sert-elle aussi de badge pour les portes ?
8. Durée moyenne d'une absence courte du poste (imprimante, collègue) ?
