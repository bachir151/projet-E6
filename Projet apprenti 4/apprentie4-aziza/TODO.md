# Aziza – suivi (au 11 novembre 2026)

## Fait
- [x] Revue critique du projet (forces, faiblesses, risques, faisabilité 150 h, améliorations)
- [x] Fiche de présentation d'une page à signer (`livrables/fiche/Fiche_projet_E6_Aziza.pdf`), mise à jour avec les réponses du tuteur
- [x] Fiche technique détaillée (doc Claude, résumé dans `projet.md`)
- [x] Brouillon de réponse au tuteur pour la visite de la semaine 50
- [x] PowerPoint 22 diapositives (`livrables/powerpoint/`) et présentation animée style 3Blue1Brown (`livrables/presentation-animee/`, publiée : https://claude.ai/artifact/5QmQjfLHFvt1T8ps5yHTca)
- [x] Prompts : image du banc (ChatGPT), présentation 3D (Gemini)
- [x] Animation 3D interactive de la maquette (`livrables/animation-3d/maquette-3d.html`, Three.js, 8 étapes, vues maquette / terrain, `?lite` pour les PC peu puissants) (14/11)
- [x] Page de révision pour l'enseignant (`Révision/revision-jury.html`) : 5 essentiels animés, 35 fiches, mode quiz, liste « à vérifier » (23/11)

## À faire
- [ ] **12 nov.** : signature et cachet de la fiche par le tuteur ; retour au plus tard le **13 nov.**
- [ ] Choisir le jour de la visite (7, 8, 9 ou 10 déc. 2026, 8 h 30–16 h 30) et répondre au tuteur
- [ ] Demander la validation de la réalisation au lycée à l'académie (commission de validation des sujets)
- [ ] Faire valider le volet physique par le collègue de physique avant janvier
- [x] Modèles disponibles : `Projet apprenti 1/` (dossier V3) et `Projet apprenti 2/` (synthèse)
- [ ] Reporter les corrections du 11/11 dans le PowerPoint 3Blue1Brown (la fiche technique n'est plus un livrable)
- [x] Formulaire académique « Dossier de présentation et de validation du projet » rempli (`livrables/fiche-academique/`, DOCX + PDF, 14 p.) : à compléter à la main (adresse, contact, site, téléphone, mail de l'entreprise ; nom du tuteur)
- [ ] ~~Étape 3 : dossier complet~~ : pas nécessaire (décision de l'enseignant, 11/11)
- [ ] Après la visite : mettre à jour les hypothèses chiffrées (diapo 5 du PowerPoint, fiche technique, dossier)
- [ ] Commander le matériel en décembre
- [ ] Vérifier les licences Windows 11 du lycée (ou VM avec TPM virtuel)
- [ ] Remplacer l'illustration générée du banc par des photos réelles au fil du projet

## Décisions prises
- V1 : serveur + catalogue signé, agent PowerShell, borne RFID, tableau de bord, réseau, physique sur banc
- V2 : archive seule (recherche simple SQL `LIKE`)
- Extensions : propositions des techniciens, boîtier de sacoche e-ink, lien SharePoint réel, installation de programmes
- Physique : condensation seulement (si confirmée à la visite) + test court RFID ; plan B = RFID ; chute, énergie et formule LC retirées
- Sécurité ajoutée (11/11) : numéro de version dans le catalogue signé (anti-retour), `catalogue.json` signé, jeton par PC et par borne (T14, T15)
- Distribution en HTTPS + BITS (pas SFTP + VPN) ; SFTP pour la publication seulement
- Programmes : fichiers et paramètres en V1, installation de programmes en extension
- Tableau de bord qui alimente Excel (export CSV) au lieu de le remplacer
- Vocabulaire : « kit de maintenance », « fichiers métier », jamais « mises à jour Windows »
