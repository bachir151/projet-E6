const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");
const { applyTheme } = require(process.env.APPLY_THEME || "./apply_theme.js");

const THEME = {
  name: "Signal",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "1B1F24", lt1: "FFFFFF", dk2: "22313F", lt2: "EEF1F4",
    accent1: "F2A900", accent2: "1B998B", accent3: "D7263D",
    accent4: "5C6B7A", accent5: "8FB8DE", accent6: "F7D27A",
    hlink: "1B998B", folHlink: "5C6B7A",
  },
};
const HEX = THEME.colors;

async function iconData(Icon, color, size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Icon, { color: "#" + color, size: String(size) }));
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title = "Projet E6 – Des PC de maintenance à jour";
  pres.author = "Aziza – BTS CIEL option A";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;

  pres.defineSlideMaster({
    title: "TITRE_SOMBRE",
    background: { color: C.text2 },
  });
  pres.defineSlideMaster({
    title: "CONTENU",
    background: { color: C.background1 },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: 0.5, y: 0.25, w: 9, h: 0.7, fontSize: 26, bold: true, color: C.text2, valign: "middle", margin: 0 }, text: "" } },
      { text: { text: "Projet E6 · Aziza · BTS CIEL option A · maquette au lycée, données fictives", options: { x: 0.5, y: 5.28, w: 7.5, h: 0.25, fontSize: 9, color: C.accent4, margin: 0 } } },
    ],
    slideNumber: { x: 9.0, y: 5.26, w: 0.5, h: 0.28, fontSize: 9, color: C.accent4, align: "right" },
  });

  const I = {};
  const iconList = { key: fa.FaKey, laptop: fa.FaLaptop, badge: fa.FaIdBadge, archive: fa.FaArchive, file: fa.FaFileAlt,
    wifi: fa.FaWifi, power: fa.FaPowerOff, mobile: fa.FaMobileAlt, history: fa.FaHistory, sign: fa.FaFileSignature,
    shield: fa.FaShieldAlt, net: fa.FaNetworkWired, code: fa.FaCode, tasks: fa.FaTasks, comments: fa.FaComments,
    flask: fa.FaFlask, chip: fa.FaMicrochip, lock: fa.FaLock, robot: fa.FaRobot, gavel: fa.FaGavel, clock: fa.FaClock,
    snow: fa.FaSnowflake, server: fa.FaServer, check: fa.FaCheckCircle, warn: fa.FaExclamationTriangle, user: fa.FaUserTie,
    search: fa.FaSearch, broadcast: fa.FaBroadcastTower, camera: fa.FaCamera };
  for (const [k, v] of Object.entries(iconList)) I[k] = await iconData(v, HEX.dk2);
  const Iw = {};
  for (const k of ["key", "laptop", "badge", "archive"]) Iw[k] = await iconData(iconList[k], HEX.lt1);

  const circleIcon = (s, x, y, d, icon, name, fill = C.accent1) => {
    s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill }, objectName: name + "_c" });
    s.addImage({ data: icon, x: x + d * 0.24, y: y + d * 0.24, w: d * 0.52, h: d * 0.52, objectName: name + "_i", altText: "pictogramme" });
  };
  const card = (s, x, y, w, h, name, fill = C.background2) =>
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: fill }, line: { color: fill }, objectName: name });
  const txt = (s, text, o) => s.addText(text, Object.assign({ isTextBox: true, fontSize: 14, color: C.text1, valign: "top", margin: 0 }, o));
  const content = (title, section) => { const s = pres.addSlide({ masterName: "CONTENU", sectionTitle: section }); s.addText(title, { placeholder: "title" }); return s; };

  // ---------- 1. Titre
  pres.addSection({ title: "Introduction" });
  let s = pres.addSlide({ masterName: "TITRE_SOMBRE", sectionTitle: "Introduction" });
  txt(s, "BTS CIEL option A · Épreuve E6 « Valorisation de la donnée et cybersécurité » · Session 2027", { x: 0.5, y: 0.45, w: 9, h: 0.3, fontSize: 12, color: C.accent6 });
  txt(s, "Des PC de maintenance à jour, des documents archivés, un parc tracé", { x: 0.5, y: 1.2, w: 4.6, h: 1.9, fontSize: 27, bold: true, color: C.background1, fontFace: THEME.headFontFace, valign: "middle" });
  txt(s, "Aziza · apprentie au service de maintenance des équipements de télécommande", { x: 0.5, y: 3.25, w: 4.4, h: 0.6, fontSize: 14, color: C.background2 });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 4.1, w: 4.2, h: 0.45, rectRadius: 0.08, fill: { color: C.accent1 }, line: { color: C.accent1 } });
  txt(s, "Besoin issu de l'entreprise · réalisation au lycée", { x: 0.5, y: 4.1, w: 4.2, h: 0.45, fontSize: 14, bold: true, color: C.text2, align: "center", valign: "middle" });
  s.addImage({ path: "banc.png", x: 5.3, y: 1.35, w: 4.3, h: 4.3 * 941 / 1672, altText: "Illustration du banc de mesure : PC froid, sonde, ESP32 et courbe de réchauffement" });
  txt(s, "Illustration générée par IA, remplacée par la photo du vrai banc", { x: 5.3, y: 3.85, w: 4.3, h: 0.25, fontSize: 10, italic: true, color: C.accent5 });
  s.addNotes("Je présente mon projet E6. Le besoin vient de mon entreprise, mais tout est réalisé au lycée sur une maquette, avec des données fictives. Le titre résume les trois résultats : des PC à jour, des documents archivés et un parc tracé.");

  // ---------- 2. En une minute
  s = content("Le projet en une minute", "Introduction");
  const cols = [
    ["key", "Un kit signé", "Le référent valide les fichiers du service et les publie comme un tout, signé."],
    ["laptop", "Chaque PC se vérifie", "Un agent PowerShell télécharge seulement ce qui a changé, par la 4G du téléphone, et contrôle chaque fichier."],
    ["badge", "Contrôle au départ", "Avant une intervention, une borne à badge affiche vert ou rouge selon l'état du PC."],
  ];
  cols.forEach((c, i) => {
    const x = 0.5 + i * 3.1;
    card(s, x, 1.2, 2.8, 2.9, `anim_${i + 1}_card`);
    circleIcon(s, x + 0.3, 1.45, 0.75, I[c[0]], `anim_${i + 1}_ic`);
    txt(s, c[1], { x: x + 0.3, y: 2.35, w: 2.3, h: 0.4, fontSize: 18, bold: true, color: C.text2, objectName: `anim_${i + 1}_t` });
    txt(s, c[2], { x: x + 0.3, y: 2.8, w: 2.3, h: 1.2, fontSize: 14, objectName: `anim_${i + 1}_d` });
  });
  txt(s, "Et chaque version reste gardée : l'historique complet devient l'archive des documents du service.", { x: 0.5, y: 4.4, w: 9, h: 0.5, fontSize: 16, italic: true, color: C.accent2, objectName: "anim_4_t" });
  s.addNotes("Trois idées. Un : le référent publie un kit signé. Deux : chaque PC se met à jour seul et vérifie tout. Trois : une borne contrôle le PC avant le départ. En plus, toutes les versions sont gardées : c'est l'archive, le deuxième besoin du tuteur.");

  // ---------- 3. Contexte
  pres.addSection({ title: "Besoin" });
  s = content("Le contexte et les deux besoins du tuteur", "Besoin");
  const ctx = [["mobile", "≈ 10 PC portables Windows 11", "emportés par les agents en intervention"],
    ["broadcast", "Internet seulement par le téléphone", "partage de connexion 4G, souvent faible ou absent"],
    ["file", "Fichiers centralisés sur SharePoint", "paramètres, procédures, programmes"]];
  ctx.forEach((c, i) => {
    const y = 1.2 + i * 1.15;
    circleIcon(s, 0.5, y, 0.6, I[c[0]], `ctx${i}`);
    txt(s, c[1], { x: 1.3, y: y + 0.02, w: 3.6, h: 0.32, fontSize: 15, bold: true, color: C.text2 });
    txt(s, c[2], { x: 1.3, y: y + 0.34, w: 3.6, h: 0.3, fontSize: 14, color: C.accent4 });
  });
  card(s, 5.3, 1.15, 4.2, 1.7, "anim_1_b1", C.background2);
  txt(s, "Besoin 1 · Mise à jour des PC", { x: 5.5, y: 1.3, w: 3.8, h: 0.35, fontSize: 16, bold: true, color: C.text2, objectName: "anim_1_b1t" });
  txt(s, "Automatiser la mise à jour des fichiers, paramètres et programmes, ou à défaut fournir un mode opératoire.", { x: 5.5, y: 1.7, w: 3.8, h: 1.05, fontSize: 14, objectName: "anim_1_b1d" });
  card(s, 5.3, 3.05, 4.2, 1.6, "anim_2_b2", C.background2);
  txt(s, "Besoin 2 · Archives des documents", { x: 5.5, y: 3.2, w: 3.8, h: 0.35, fontSize: 16, bold: true, color: C.text2, objectName: "anim_2_b2t" });
  txt(s, "Organiser, améliorer et dématérialiser l'archivage des documents de modification.", { x: 5.5, y: 3.6, w: 3.8, h: 0.95, fontSize: 14, objectName: "anim_2_b2d" });
  s.addNotes("Le service gère une dizaine de PC portables. Ils partent avec les agents et n'ont Internet que par le téléphone. Le tuteur a deux besoins : tenir ces PC à jour, et mieux archiver les documents de modification. Le contexte est anonymisé.");

  // ---------- 4. Principes fondamentaux
  s = content("Repartir des principes fondamentaux", "Besoin");
  const pr = [["file", "Avoir un fichier ne prouve pas qu'il est le bon", "comparer son empreinte SHA-256 au catalogue"],
    ["lock", "Le réseau n'est pas de confiance (4G, Internet)", "c'est le catalogue signé qui fait foi, pas le chemin"],
    ["power", "Un PC éteint ne peut rien affirmer", "la borne lit le dernier rapport, jamais « à jour » par défaut"],
    ["snow", "Sur le terrain, le réseau manque souvent", "télécharger peu, reprendre après coupure, alerter si périmé"],
    ["history", "Chaque version a une valeur", "ne jamais écraser : l'historique devient l'archive"]];
  txt(s, "Constat", { x: 1.3, y: 1.0, w: 4.2, h: 0.3, fontSize: 12, bold: true, color: C.accent4 });
  txt(s, "Donc, dans le projet", { x: 5.7, y: 1.0, w: 3.8, h: 0.3, fontSize: 12, bold: true, color: C.accent4 });
  pr.forEach((p, i) => {
    const y = 1.35 + i * 0.75;
    circleIcon(s, 0.5, y, 0.55, I[p[0]], `anim_${i + 1}_p`);
    txt(s, p[1], { x: 1.3, y: y + 0.05, w: 4.2, h: 0.5, fontSize: 15, bold: true, color: C.text2, valign: "middle", objectName: `anim_${i + 1}_a` });
    txt(s, "→ " + p[2], { x: 5.7, y: y + 0.05, w: 3.8, h: 0.5, fontSize: 14, color: C.accent2, valign: "middle", objectName: `anim_${i + 1}_b` });
  });
  s.addNotes("Plutôt que de copier une solution existante, je suis reparti de cinq constats simples. Chaque constat impose un choix technique : empreintes, signature, rapport lu par la borne, téléchargement partiel et historique.");

  // ---------- 5. Besoin chiffré
  s = content("Le besoin chiffré", "Besoin");
  const st = [["≈ 10", "PC portables à tenir à jour"], ["20–30 min", "par PC et par mise à jour, à la main*"], ["3 à 10 h", "de mises à jour manuelles par mois*"]];
  st.forEach((v, i) => {
    const x = 0.5 + i * 3.1;
    txt(s, v[0], { x, y: 1.15, w: 2.8, h: 0.9, fontSize: 40, bold: true, color: C.accent1, fontFace: THEME.headFontFace, objectName: `anim_1_s${i}` });
    txt(s, v[1], { x, y: 2.05, w: 2.8, h: 0.6, fontSize: 14, color: C.text2, objectName: `anim_1_l${i}` });
  });
  txt(s, "Objectifs mesurés sur la maquette", { x: 0.5, y: 2.95, w: 9, h: 0.35, fontSize: 16, bold: true, color: C.text2 });
  const ob = [["100 %", "des fichiers altérés refusés"], ["< 2 min", "pour revenir à la version précédente"], ["< 5 s", "pour la réponse de la borne"]];
  ob.forEach((v, i) => {
    const x = 0.5 + i * 3.1;
    card(s, x, 3.35, 2.8, 1.15, `anim_2_o${i}`);
    txt(s, v[0], { x: x + 0.2, y: 3.45, w: 2.4, h: 0.5, fontSize: 24, bold: true, color: C.accent2, objectName: `anim_2_ov${i}` });
    txt(s, v[1], { x: x + 0.2, y: 3.95, w: 2.4, h: 0.45, fontSize: 14, objectName: `anim_2_ol${i}` });
  });
  txt(s, "* hypothèses écrites dans la fiche signée par le tuteur, à confirmer lors de la visite du service", { x: 0.5, y: 4.7, w: 9, h: 0.3, fontSize: 11, italic: true, color: C.accent4 });
  s.addNotes("Un jury attend un besoin chiffré. Les chiffres marqués d'une étoile sont des hypothèses écrites dans la fiche signée par le tuteur ; je les vérifie lors de la visite. Les objectifs du bas sont mesurés sur la maquette.");

  // ---------- 6. Pourquoi pas OneDrive
  s = content("Pourquoi ne pas se contenter des outils existants ?", "Besoin");
  const hdr = (t) => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text2 } } });
  s.addTable([
    [hdr("Outil"), hdr("Ce qu'il fait bien"), hdr("Ce que le projet ajoute")],
    ["OneDrive", "synchronise SharePoint, garde des fichiers hors ligne", "un kit validé d'un bloc, l'alerte « kit périmé »"],
    ["Versions SharePoint", "garde jusqu'à 500 versions par fichier (par défaut)", "la version présente sur tel PC le jour d'une intervention"],
    ["Intune", "déploie des logiciels sur un parc géré", "adapté à 10 PC de terrain, souvent sans réseau, gérés par le service"],
  ], { x: 0.5, y: 1.15, w: 9, colW: [2.0, 3.5, 3.5], fontSize: 14, color: C.text1, border: { type: "solid", pt: 0.75, color: HEX.lt2 }, fill: { color: C.background1 }, rowH: 0.62, valign: "middle", margin: 0.08 });
  txt(s, "Le projet ne prétend pas que ces outils sont insuffisants : il ajoute un déploiement contrôlé et une validation métier. Avant un usage réel, il faudra comparer avec ce que l'entreprise utilise déjà.", { x: 0.5, y: 4.0, w: 9, h: 0.8, fontSize: 14, italic: true, color: C.accent4 });
  s.addNotes("C'est la question que le jury posera. Je reconnais ce que font bien OneDrive, les versions SharePoint et Intune. Mon projet ajoute ce qu'une synchronisation ne donne pas seule : un kit validé, une preuve de version par PC, et une alerte hors réseau.");

  // ---------- 7. Architecture
  pres.addSection({ title: "Solution" });
  s = content("L'architecture de la maquette", "Solution");
  const aw = 6.1, ah = aw * 904 / 1344;
  s.addImage({ path: "archi.png", x: 0.5, y: 1.05, w: aw, h: ah, altText: "Schéma d'architecture : poste du référent, serveur Ubuntu, tableau de bord, borne, partage de connexion 4G, SharePoint en extension, PC de maintenance et boîtier" });
  const leg = [["Référent", "prépare et signe le kit"], ["Serveur Ubuntu", "joue le rôle du SharePoint"], ["PC + agent", "se vérifient par la 4G"], ["Borne ESP32", "contrôle avant le départ"]];
  leg.forEach((l, i) => {
    const y = 1.15 + i * 0.95;
    card(s, 6.85, y, 2.65, 0.8, `anim_${i + 1}_lg`);
    txt(s, l[0], { x: 7.0, y: y + 0.08, w: 2.4, h: 0.3, fontSize: 15, bold: true, color: C.text2, objectName: `anim_${i + 1}_lt` });
    txt(s, l[1], { x: 7.0, y: y + 0.4, w: 2.4, h: 0.3, fontSize: 14, color: C.accent4, objectName: `anim_${i + 1}_ld` });
  });
  s.addNotes("Le serveur Ubuntu du lycée remplace le SharePoint. Le référent y publie le kit signé. Les PC passent par un lien 4G simulé. La borne et le tableau de bord lisent l'état sur le serveur. Les traits en tirets sont la V2 et les extensions.");

  // ---------- 8. Scénario
  s = content("Un matin : Karim part en intervention", "Solution");
  const sc = [["8 h 00", "Nouvelle version publiée ; le PC de Karim est resté éteint"], ["8 h 01", "Badge + étiquette du PC à la borne : voyant rouge"],
    ["8 h 03", "Karim active le partage de connexion ; l'agent vérifie le catalogue signé"], ["8 h 04", "Seuls les fichiers modifiés sont téléchargés puis vérifiés"],
    ["8 h 07", "Rapport envoyé au serveur : PC, version, résultat"], ["8 h 08", "Retour à la borne : voyant vert, sortie enregistrée"]];
  s.addShape(pres.shapes.LINE, { x: 0.9, y: 2.15, w: 8.2, h: 0, line: { color: C.accent4, width: 1.5 } });
  sc.forEach((e, i) => {
    const x = 0.5 + i * 1.5;
    const col = i === 1 ? C.accent3 : i === 5 ? C.accent2 : C.accent1;
    s.addShape(pres.shapes.OVAL, { x: x + 0.25, y: 1.9, w: 0.5, h: 0.5, fill: { color: col }, line: { color: col }, objectName: `anim_${i + 1}_dot` });
    txt(s, e[0], { x, y: 1.3, w: 1.0, h: 0.35, fontSize: 15, bold: true, color: C.text2, align: "center", objectName: `anim_${i + 1}_h` });
    txt(s, e[1], { x: x - 0.1, y: 2.6, w: 1.3, h: 1.6, fontSize: 14, objectName: `anim_${i + 1}_d` });
  });
  txt(s, "Si le serveur ne répond pas, la borne affiche « vérification impossible », jamais « à jour ».", { x: 0.5, y: 4.55, w: 9, h: 0.4, fontSize: 15, bold: true, color: C.accent3, objectName: "anim_7_w" });
  s.addNotes("Je raconte un cas concret. La borne ne met pas à jour le PC : elle lit le dernier rapport. C'est le PC qui se met à jour par la 4G. Règle de sécurité : sans réponse du serveur, on n'affiche jamais vert.");

  // ---------- 9. Agent PowerShell
  pres.addSection({ title: "Technique" });
  s = content("L'agent PowerShell : vérifier avant d'installer", "Technique");
  const steps = ["Déclencher (tâche planifiée)", "Lire le catalogue", "Vérifier la signature", "Comparer les empreintes", "Télécharger le modifié (BITS)", "Vérifier tout le dossier", "Basculer, garder N-1", "Envoyer le rapport"];
  steps.forEach((t, i) => {
    const r = Math.floor(i / 4), c = i % 4;
    const x = 0.5 + c * 2.3, y = 1.15 + r * 1.25;
    card(s, x, y, 2.1, 1.0, `anim_${r + 1}_st${i}`);
    s.addShape(pres.shapes.OVAL, { x: x + 0.12, y: y + 0.12, w: 0.42, h: 0.42, fill: { color: C.accent1 }, line: { color: C.accent1 }, objectName: `anim_${r + 1}_n${i}` });
    txt(s, String(i + 1), { x: x + 0.12, y: y + 0.12, w: 0.42, h: 0.42, fontSize: 14, bold: true, color: C.text2, align: "center", valign: "middle", objectName: `anim_${r + 1}_nt${i}` });
    txt(s, t, { x: x + 0.62, y: y + 0.1, w: 1.4, h: 0.8, fontSize: 14, color: C.text2, valign: "middle", objectName: `anim_${r + 1}_tt${i}` });
  });
  const pal = [["Simulation", "affiche ce qu'il ferait"], ["Confirmation", "l'agent accepte"], ["Automatique", "documents seulement"]];
  txt(s, "Trois paliers de sécurité", { x: 0.5, y: 3.8, w: 3, h: 0.3, fontSize: 14, bold: true, color: C.accent4 });
  pal.forEach((p, i) => {
    const x = 0.5 + i * 3.05;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 4.15, w: 2.85, h: 0.75, rectRadius: 0.12, fill: { color: C.text2 }, line: { color: C.text2 }, objectName: `anim_3_pl${i}` });
    txt(s, [{ text: p[0], options: { bold: true, color: C.accent6, breakLine: true } }, { text: p[1], options: { color: C.background1 } }], { x: x + 0.15, y: 4.18, w: 2.6, h: 0.7, fontSize: 14, valign: "middle", objectName: `anim_3_pt${i}` });
  });
  s.addNotes("L'agent suit huit étapes. La règle d'or : il ne remplace le kit actif que si tout le nouveau kit est vérifié. Il garde la version précédente pour revenir en arrière. Les paliers de sécurité permettent de passer de la simulation à l'automatique.");

  // ---------- 10. Borne
  s = content("La borne de sortie : un ESP32 et un lecteur RFID", "Technique");
  const states = [[C.accent2, "Vert", "dernier rapport récent et version publiée : sortie enregistrée"],
    [C.accent3, "Rouge", "kit ancien ou PC pas vérifié récemment : mettre à jour d'abord"],
    [C.accent1, "Vert et rouge en alternance", "serveur injoignable : vérification impossible"]];
  states.forEach((v, i) => {
    const y = 1.2 + i * 1.1;
    s.addShape(pres.shapes.OVAL, { x: 0.5, y, w: 0.6, h: 0.6, fill: { color: v[0] }, line: { color: v[0] }, objectName: `anim_${i + 1}_led` });
    txt(s, v[1], { x: 1.3, y: y - 0.02, w: 3.7, h: 0.32, fontSize: 15, bold: true, color: C.text2, objectName: `anim_${i + 1}_lt` });
    txt(s, v[2], { x: 1.3, y: y + 0.3, w: 3.7, h: 0.6, fontSize: 14, color: C.accent4, objectName: `anim_${i + 1}_ld` });
  });
  s.addTable([
    [hdr("RC522"), hdr("ESP32")],
    ["SDA (SS)", "GPIO 5"], ["SCK", "GPIO 18"], ["MOSI", "GPIO 23"], ["MISO", "GPIO 19"], ["RST", "GPIO 22"], ["3.3V / GND", "3V3 / GND"],
  ], { x: 5.6, y: 1.15, w: 3.9, colW: [1.95, 1.95], fontSize: 14, color: C.text1, border: { type: "solid", pt: 0.75, color: HEX.lt2 }, rowH: 0.4, margin: 0.06 });
  txt(s, "LED sur GPIO 25 et 26 (220 Ω), buzzer sur GPIO 27. Le RC522 se branche en 3,3 V uniquement.", { x: 5.6, y: 4.1, w: 3.9, h: 0.7, fontSize: 14, color: C.accent4 });
  s.addNotes("La borne lit le badge de l'agent puis l'étiquette anti-métal du PC. Elle demande au serveur l'état du PC. Trois états possibles. Le câblage tient en sept fils sur le bus SPI. La borne reste au bureau : on ne badge pas sur le terrain.");

  // ---------- 11. Archivage
  s = content("V2 : archiver les documents et valider les propositions", "Technique");
  const fl = [["user", "Proposition", "un technicien envoie une correction"], ["archive", "Zone séparée", "jamais envoyée aux PC"], ["check", "Le chef décide", "il compare, valide ou refuse"], ["sign", "Version signée", "le référent publie le nouveau kit"], ["laptop", "PC et archive", "les PC la reçoivent, l'ancienne est gardée"]];
  fl.forEach((f, i) => {
    const x = 0.5 + i * 1.84;
    circleIcon(s, x + 0.45, 1.2, 0.7, I[f[0]], `anim_${i + 1}_f`);
    txt(s, f[1], { x, y: 2.05, w: 1.6, h: 0.35, fontSize: 15, bold: true, color: C.text2, align: "center", objectName: `anim_${i + 1}_ft` });
    txt(s, f[2], { x, y: 2.42, w: 1.6, h: 0.8, fontSize: 14, color: C.accent4, align: "center", objectName: `anim_${i + 1}_fd` });
    if (i < 4) s.addShape(pres.shapes.RIGHT_ARROW, { x: x + 1.5, y: 1.4, w: 0.4, h: 0.3, fill: { color: C.accent4 }, line: { color: C.accent4 }, objectName: `anim_${i + 2}_ar${i}` });
  });
  card(s, 0.5, 3.45, 9, 1.4, "meta");
  txt(s, "Chaque version archivée garde ses informations", { x: 0.7, y: 3.55, w: 8.6, h: 0.35, fontSize: 15, bold: true, color: C.text2 });
  txt(s, "qui l'a validée · quand · le motif de la modification · les équipements concernés · son empreinte SHA-256. On n'efface jamais : on ajoute une version. Une recherche retrouve un document par équipement, date ou auteur.", { x: 0.7, y: 3.95, w: 8.6, h: 0.8, fontSize: 14 });
  s.addNotes("La V2 répond au deuxième besoin. Une proposition d'un technicien ne part jamais directement sur les PC : le chef la valide, puis le référent publie une nouvelle version signée. La proposition sert de fiche de modification pour l'archive.");

  // ---------- 12. Réseau
  s = content("Exploiter le réseau en place (C10)", "Technique");
  s.addTable([
    [hdr("Flux"), hdr("Protocole"), hdr("Preuve")],
    ["Catalogue et fichiers", "HTTPS 443 (BITS)", "capture : seul du TLS circule"],
    ["Rapports, borne, mesures", "HTTPS 443", "journal du serveur"],
    ["Heure", "NTP, UDP 123", "décalage mesuré (w32tm)"],
    ["Adresses et noms", "DHCP, DNS", "bail et résolution capturés"],
    ["Publication du kit", "SFTP, TCP 22", "journal SSH"],
  ], { x: 0.5, y: 1.05, w: 5.7, colW: [1.9, 1.5, 2.3], fontSize: 13, color: C.text1, border: { type: "solid", pt: 0.75, color: HEX.lt2 }, rowH: 0.42, margin: 0.06, valign: "middle" });
  card(s, 6.4, 1.1, 3.1, 3.0, "anim_1_4g");
  circleIcon(s, 6.6, 1.25, 0.6, I.broadcast, "anim_1_4gi");
  txt(s, "Lien 4G simulé", { x: 7.35, y: 1.35, w: 2.0, h: 0.4, fontSize: 16, bold: true, color: C.text2, objectName: "anim_1_4gt" });
  txt(s, "Un PC Ubuntu imite le partage de connexion avec tc netem : débit, latence et coupures, réglés sur des mesures faites lors de la visite.", { x: 6.6, y: 2.0, w: 2.75, h: 2.0, fontSize: 14, objectName: "anim_1_4gd" });
  txt(s, "On utilise le réseau tel qu'il est : aucune configuration de switch ni de routeur (cela relève de l'E5).", { x: 0.5, y: 4.8, w: 9, h: 0.35, fontSize: 14, italic: true, color: C.accent4 });
  s.addNotes("Pour C10, j'exploite le réseau existant : DHCP, DNS, NTP, HTTPS. Je capture les flux avec Wireshark pour montrer qu'aucun fichier ne circule en clair. Je simule la 4G pour mesurer le gain du téléchargement partiel et la reprise après coupure.");

  // ---------- 13. Cyber
  s = content("Cybersécurité : la confiance repose sur la signature", "Technique");
  const cy = [["warn", "Fichier altéré", "refusé avant la bascule, kit actif intact"], ["server", "Faux serveur", "HTTPS vérifié et catalogue signé obligatoire"],
    ["code", "Script modifié", "stratégie AllSigned : il ne s'exécute plus"], ["wifi", "Coupure 4G", "reprise BITS, vérification avant bascule"],
    ["badge", "Badge cloné", "la borne trace, elle n'ouvre aucun accès"], ["user", "Données personnelles", "fictives ; chocs liés au PC, pas à l'agent"]];
  cy.forEach((c, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.5 + col * 3.05, y = 1.1 + row * 1.45;
    card(s, x, y, 2.85, 1.25, `anim_${row + 1}_cy${i}`);
    circleIcon(s, x + 0.15, y + 0.15, 0.5, I[c[0]], `anim_${row + 1}_cyi${i}`);
    txt(s, c[1], { x: x + 0.8, y: y + 0.18, w: 1.95, h: 0.4, fontSize: 15, bold: true, color: C.text2, objectName: `anim_${row + 1}_cyt${i}` });
    txt(s, c[2], { x: x + 0.15, y: y + 0.7, w: 2.6, h: 0.5, fontSize: 14, color: C.accent4, objectName: `anim_${row + 1}_cyd${i}` });
  });
  txt(s, "Liste rouge vérifiée en recette, y compris dans le code généré par IA : certificat non vérifié, ExecutionPolicy Bypass, secret écrit en dur, debug activé.", { x: 0.5, y: 4.15, w: 9, h: 0.75, fontSize: 14, bold: true, color: C.accent3, objectName: "anim_3_red" });
  s.addNotes("Les PC vont sur Internet par le téléphone, sans la protection du réseau de l'entreprise. Donc je ne fais confiance qu'au catalogue signé. Chaque menace a sa parade et son test de recette.");

  // ---------- 14. Physique condensation
  pres.addSection({ title: "Physique" });
  s = content("Physique : quand peut-on allumer un PC froid ?", "Physique");
  const tt = [], T = [], Td = [];
  for (let t = 0; t <= 90; t += 5) { tt.push(String(t)); T.push(+(20 - 20 * Math.exp(-t / 30)).toFixed(1)); Td.push(9.3); }
  s.addChart(pres.charts.LINE, [{ name: "Surface du PC (modèle)", labels: tt, values: T }, { name: "Point de rosée de l'air", labels: tt, values: Td }], {
    x: 0.4, y: 1.0, w: 5.4, h: 3.6, chartColors: [HEX.accent1, HEX.accent2], lineSize: 2.5, lineDataSymbol: "none",
    showLegend: true, legendPos: "b", legendFontSize: 12, legendFontFace: "+mn-lt",
    showTitle: true, title: "Exemple : PC à 0 °C, pièce à 20 °C et 50 %, τ = 30 min", titleFontSize: 12, titleFontFace: "+mn-lt", titleColor: HEX.dk2,
    catAxisTitle: "temps (min)", showCatAxisTitle: true, valAxisTitle: "température (°C)", showValAxisTitle: true,
    catAxisLabelColor: HEX.accent4, valAxisLabelColor: HEX.accent4, catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt",
    catAxisTitleFontFace: "+mn-lt", valAxisTitleFontFace: "+mn-lt", catAxisTitleFontSize: 11, valAxisTitleFontSize: 11, catAxisLabelFontSize: 11, valAxisLabelFontSize: 11,
    valAxisMinVal: 0, valAxisMaxVal: 22, valGridLine: { color: HEX.lt2, size: 0.75 }, catGridLine: { style: "none" },
  });
  card(s, 6.0, 1.05, 3.5, 3.55, "phys");
  txt(s, [
    { text: "Réchauffement (1er ordre)", options: { bold: true, color: C.text2, breakLine: true } },
    { text: "T(t) = Ta + (T0 − Ta)·e^(−t/τ)", options: { breakLine: true } },
    { text: " ", options: { breakLine: true, fontSize: 6 } },
    { text: "Point de rosée (Magnus)", options: { bold: true, color: C.text2, breakLine: true } },
    { text: "20 °C et 50 % → Td ≈ 9,3 °C", options: { breakLine: true } },
    { text: " ", options: { breakLine: true, fontSize: 6 } },
    { text: "Temps d'attente", options: { bold: true, color: C.text2, breakLine: true } },
    { text: "t = τ·ln[(T0 − Ta)/(Td − Ta)] ≈ 0,62 τ", options: { breakLine: true } },
    { text: " ", options: { breakLine: true, fontSize: 6 } },
    { text: "τ est mesuré sur le banc, puis le modèle est confronté aux mesures, avec leurs incertitudes.", options: { italic: true, color: C.accent4 } },
  ], { x: 6.2, y: 1.2, w: 3.1, h: 3.3, fontSize: 14, objectName: "anim_1_f" });
  s.addNotes("C'est l'expérience principale. Une question utile : combien de minutes attendre avant d'allumer un PC froid sans risque de condensation ? La courbe orange est le modèle du premier ordre, la ligne verte le point de rosée. Leur croisement donne le temps d'attente. Ici τ vaut 30 minutes à titre d'exemple : je le mesurerai sur le banc.");

  // ---------- 15. Banc
  s = content("Le banc de mesure et le protocole", "Physique");
  s.addImage({ path: "banc.png", x: 0.5, y: 1.1, w: 4.6, h: 4.6 * 941 / 1672, altText: "Illustration du banc : PC froid avec sonde, plaque témoin, ESP32, capteur d'humidité et courbe" });
  txt(s, "Illustration générée par IA : à remplacer par la photo du vrai banc", { x: 0.5, y: 3.75, w: 4.6, h: 0.3, fontSize: 10, italic: true, color: C.accent4 });
  const pro = ["Étalonner les deux sondes ensemble (eau et glace, température ambiante)", "Refroidir un vieux portable ou un bloc d'aluminium", "Mesurer la surface (DS18B20) et l'air (SHT40) toutes les 10 s", "Tracer ln(T − Ta) en fonction de t : la pente donne τ", "Comparer le moment prévu et la disparition de la buée sur la plaque témoin"];
  pro.forEach((p, i) => {
    const y = 1.1 + i * 0.72;
    s.addShape(pres.shapes.OVAL, { x: 5.4, y, w: 0.4, h: 0.4, fill: { color: C.accent1 }, line: { color: C.accent1 }, objectName: `anim_${i + 1}_pn` });
    txt(s, String(i + 1), { x: 5.4, y, w: 0.4, h: 0.4, fontSize: 13, bold: true, color: C.text2, align: "center", valign: "middle", objectName: `anim_${i + 1}_pnt` });
    txt(s, p, { x: 5.95, y: y - 0.03, w: 3.55, h: 0.65, fontSize: 14, objectName: `anim_${i + 1}_pt` });
  });
  s.addNotes("Le protocole suit la démarche attendue en physique : étalonnage, mesures, ajustement du modèle, confrontation et incertitudes. On n'utilise jamais un PC en service : un vieux portable ou un bloc d'aluminium. La plaque témoin permet de voir la buée disparaître.");

  // ---------- 16. RFID
  s = content("Physique : où coller l'étiquette RFID ?", "Physique");
  circleIcon(s, 0.5, 1.15, 0.8, I.broadcast, "rf");
  txt(s, "Le lecteur et l'étiquette sont deux circuits accordés à 13,56 MHz. Le métal proche du PC les désaccorde et réduit la portée.", { x: 1.5, y: 1.15, w: 8.0, h: 0.8, fontSize: 15, color: C.text2 });
  card(s, 0.5, 2.15, 4.3, 2.65, "anim_1_m");
  txt(s, [{ text: "Modèle", options: { bold: true, color: C.text2, breakLine: true } }, { text: "f = 1 / (2π·√(L·C))", options: { breakLine: true } }, { text: " ", options: { breakLine: true, fontSize: 6 } },
    { text: "Le champ d'une boucle décroît très vite avec la distance : la portée utile se compte en centimètres.", options: { color: C.accent4 } }], { x: 0.7, y: 2.3, w: 3.9, h: 2.4, fontSize: 14, objectName: "anim_1_mt" });
  card(s, 5.0, 2.15, 4.5, 2.65, "anim_2_x");
  txt(s, [{ text: "Mesures prévues", options: { bold: true, color: C.text2, breakLine: true } },
    { text: "distance de lecture, avec son incertitude", options: { bullet: true, breakLine: true } },
    { text: "orientation de l'étiquette (0°, 45°, 90°)", options: { bullet: true, breakLine: true } },
    { text: "étiquette normale ou anti-métal", options: { bullet: true, breakLine: true } },
    { text: "posée sur du plastique ou sur le capot métallique", options: { bullet: true } }], { x: 5.2, y: 2.3, w: 4.1, h: 2.4, fontSize: 14, paraSpaceAfter: 4, objectName: "anim_2_xt" });
  s.addNotes("Deuxième expérience, plus courte, directement utile à la borne : choisir l'étiquette et l'endroit où la coller. On mesure la portée selon l'orientation et le support, et on explique l'effet du métal par le désaccord du circuit résonant.");

  // ---------- 17. Gestion de projet
  pres.addSection({ title: "Gestion de projet" });
  s = content("150 heures : une V1 solide, une V2 utile", "Gestion de projet");
  s.addChart(pres.charts.BAR, [{ name: "Heures", labels: ["Gestion, revues, dossier", "Agent PowerShell", "Physique (banc, RFID)", "Recette", "Borne RFID", "Serveur et catalogue", "Réseau (C10)", "Relecture du code IA", "Tableau de bord", "V2 : archivage, propositions"], values: [30, 20, 15, 12, 11, 10, 8, 6, 4, 26] }], {
    x: 0.4, y: 1.0, w: 5.6, h: 3.9, barDir: "bar", chartColors: [HEX.dk2], showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 11, dataLabelColor: HEX.dk2, dataLabelFontFace: "+mn-lt",
    showLegend: false, showTitle: true, title: "Heures estimées (avec usage encadré de l'IA)", titleFontSize: 12, titleFontFace: "+mn-lt", titleColor: HEX.dk2,
    catAxisLabelColor: HEX.dk2, valAxisLabelColor: HEX.accent4, catAxisLabelFontSize: 11, valAxisLabelFontSize: 10, catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt",
    valGridLine: { color: HEX.lt2, size: 0.75 }, catGridLine: { style: "none" }, catAxisOrientation: "maxMin", valAxisMaxVal: 35,
  });
  const vv = [[C.accent2, "V1 · obligatoire · ≈ 116 h", "serveur, agent, borne, tableau de bord, réseau, physique"], [C.accent1, "V2 · visée · ≈ 26 h", "archivage et propositions des techniciens"], [C.accent4, "Extensions", "boîtier de sacoche, lien SharePoint, installation de programmes"]];
  vv.forEach((v, i) => {
    const y = 1.1 + i * 1.25;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.3, y, w: 3.2, h: 1.1, rectRadius: 0.08, fill: { color: v[0] }, line: { color: v[0] }, objectName: `anim_${i + 1}_v` });
    txt(s, [{ text: v[1], options: { bold: true, breakLine: true } }, { text: v[2] }], { x: 6.45, y: y + 0.08, w: 2.95, h: 0.95, fontSize: 14, color: i === 1 ? C.text2 : C.background1, objectName: `anim_${i + 1}_vt` });
  });
  s.addNotes("La V1 tient en environ 116 heures en comptant le temps de relecture du code généré par IA. Il reste de quoi faire la V2, l'archivage. Le boîtier de sacoche passe en extension : la physique n'en dépend pas, puisque le banc est en V1.");

  // ---------- 18. Planning
  s = content("Le planning de janvier à juin", "Gestion de projet");
  const months = ["Janv.", "Févr.", "Mars", "Avril", "Mai", "Juin"];
  const X0 = 3.0, MW = 1.08;
  months.forEach((m, i) => txt(s, m, { x: X0 + i * MW, y: 1.05, w: MW, h: 0.3, fontSize: 13, bold: true, color: C.accent4, align: "center" }));
  s.addShape(pres.shapes.LINE, { x: X0, y: 1.42, w: 6 * MW, h: 0, line: { color: C.accent4, width: 1 } });
  const ph = [[0, 1.2, C.accent2, "Serveur, catalogue signé, VM"], [0.9, 1.6, C.accent2, "Agent PowerShell V1"], [2.0, 1.5, C.accent2, "Borne RFID, banc de physique"],
    [3.0, 1.3, C.accent2, "Recette V1, mesures réseau"], [3.6, 1.6, C.accent1, "V2 : archivage, propositions"], [4.3, 1.2, C.accent4, "Dossier, soutenance"]];
  ph.forEach((p, i) => {
    const y = 1.6 + i * 0.42;
    txt(s, p[3], { x: 0.5, y, w: 2.4, h: 0.32, fontSize: 13, bold: true, color: C.text2, valign: "middle", objectName: `anim_${i + 1}_pht` });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: X0 + p[0] * MW, y, w: p[1] * MW, h: 0.32, rectRadius: 0.08, fill: { color: p[2] }, line: { color: p[2] }, objectName: `anim_${i + 1}_ph` });
  });
  [[1.0, "Revue 1"], [3.0, "Revue 2"], [4.5, "Revue 3"]].forEach((r) => {
    const x = X0 + r[0] * MW;
    s.addShape(pres.shapes.DIAMOND, { x: x - 0.14, y: 4.25, w: 0.28, h: 0.28, fill: { color: C.accent3 }, line: { color: C.accent3 } });
    txt(s, r[1], { x: x - 0.6, y: 4.55, w: 1.2, h: 0.28, fontSize: 12, bold: true, color: C.accent3, align: "center" });
  });
  txt(s, "Avant le projet : visite du service en décembre (semaine 50) pour vérifier les hypothèses et mesurer le partage de connexion.", { x: 0.5, y: 4.25, w: 2.4, h: 0.95, fontSize: 12, italic: true, color: C.accent4 });
  s.addNotes("Le planning suit V1 puis V2. Les revues de projet servent de jalons : la V2 ne démarre que si la V1 est validée à la revue 2. Les dates exactes des revues sont celles du lycée. La visite de décembre précède le début du projet.");

  // ---------- 19. Recette
  s = content("La recette : ce que le jury verra fonctionner", "Gestion de projet");
  s.addTable([
    [hdr("Test"), hdr("Situation"), hdr("Résultat attendu")],
    ["T01", "PC avec un kit ancien, 4G activée", "seuls les fichiers modifiés arrivent"],
    ["T02", "un octet modifié sur le serveur", "fichier refusé, kit actif intact"],
    ["T04", "coupure au milieu du téléchargement", "reprise, puis vérification"],
    ["T05", "retour arrière demandé", "version précédente en < 2 min"],
    ["T07", "borne : PC éteint ou rapport ancien", "voyant rouge"],
    ["T08", "borne : serveur arrêté", "« vérification impossible »"],
    ["T13", "proposition validée par le chef", "nouvelle version reçue par les PC"],
  ], { x: 0.5, y: 1.05, w: 9, colW: [0.9, 4.0, 4.1], fontSize: 14, color: C.text1, border: { type: "solid", pt: 0.75, color: HEX.lt2 }, rowH: 0.46, margin: 0.06, valign: "middle" });
  s.addNotes("Chaque test se rejoue en démonstration et laisse une preuve : journal, capture ou écran du tableau de bord. La liste complète va de T01 à T13 dans le dossier technique.");

  // ---------- 20. Risques
  s = content("Risques et décisions ouvertes", "Gestion de projet");
  s.addTable([
    [hdr("Risque"), hdr("Parade")],
    ["Réalisation au lycée : l'arrêté prévoit un projet d'apprenti développé en entreprise", "validation demandée à l'académie ; visite et démonstration au tuteur"],
    ["Les PC sont peut-être gérés par la DSI", "l'agent devient un contrôle de conformité ; question posée à la visite"],
    ["Retard sur les 150 h", "V2 seulement si la V1 est validée en revue 2 ; boîtier en extension"],
    ["Code généré par IA mal maîtrisé", "journal d'usage, explication orale à chaque revue, liste rouge"],
    ["Pas de licences Windows 11", "machines virtuelles avec TPM virtuel ; licences à vérifier"],
  ], { x: 0.5, y: 1.05, w: 9, colW: [4.6, 4.4], fontSize: 14, color: C.text1, border: { type: "solid", pt: 0.75, color: HEX.lt2 }, rowH: 0.62, margin: 0.06, valign: "middle" });
  s.addNotes("Je présente les risques honnêtement, en premier le point réglementaire : la réalisation au lycée doit être validée par l'académie. Pour l'IA, je tiens un journal d'usage et je dois pouvoir expliquer chaque ligne.");

  // ---------- 21. Référentiel
  pres.addSection({ title: "Conclusion" });
  s = content("Ce que le projet démontre pour l'E6", "Conclusion");
  const comp = [["comments", "C01 · Communiquer", "recueil du besoin avec le tuteur, mode opératoire, dossier, soutenance"], ["tasks", "C03 · Gérer un projet", "V1/V2/extensions, revues, planning, risques, journal d'usage de l'IA"],
    ["code", "C08 · Coder", "PowerShell, API Python, programme ESP32, tests T01 à T13"], ["net", "C10 · Exploiter un réseau", "DHCP, DNS, NTP, HTTPS, captures, lien 4G simulé"],
    ["flask", "Physique", "étalonnage, modèle du 1er ordre, point de rosée, incertitudes"], ["shield", "Donnée et cybersécurité", "signature, intégrité, traçabilité, archive"]];
  comp.forEach((c, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.5 + col * 4.6, y = 1.05 + row * 1.3;
    card(s, x, y, 4.4, 1.15, `anim_${row + 1}_cp${i}`);
    circleIcon(s, x + 0.15, y + 0.25, 0.65, I[c[0]], `anim_${row + 1}_cpi${i}`);
    txt(s, c[1], { x: x + 0.95, y: y + 0.1, w: 3.35, h: 0.35, fontSize: 15, bold: true, color: C.text2, objectName: `anim_${row + 1}_cpt${i}` });
    txt(s, c[2], { x: x + 0.95, y: y + 0.45, w: 3.35, h: 0.65, fontSize: 14, color: C.accent4, objectName: `anim_${row + 1}_cpd${i}` });
  });
  s.addNotes("Pour finir, je relie le projet aux compétences évaluées en E6 : C01, C03, C08 et C10, plus la physique et le volet donnée et cybersécurité. Pour chaque compétence, j'ai des preuves précises.");

  // ---------- 22. Conclusion
  s = pres.addSlide({ masterName: "TITRE_SOMBRE", sectionTitle: "Conclusion" });
  txt(s, "En résumé", { x: 0.5, y: 0.6, w: 9, h: 0.5, fontSize: 16, bold: true, color: C.accent6 });
  txt(s, "Un PC ne part plus en intervention sans avoir le bon kit, et chaque version de document reste retrouvable.", { x: 0.5, y: 1.2, w: 9, h: 1.5, fontSize: 30, bold: true, color: C.background1, fontFace: THEME.headFontFace, valign: "middle" });
  const fin = [["key", "Kit signé"], ["laptop", "PC vérifiés"], ["badge", "Sortie contrôlée"], ["archive", "Archive complète"]];
  fin.forEach((f, i) => {
    const x = 0.5 + i * 2.3;
    s.addShape(pres.shapes.OVAL, { x, y: 3.1, w: 0.7, h: 0.7, fill: { color: C.accent1 }, line: { color: C.accent1 }, objectName: `anim_${i + 1}_fc` });
    s.addImage({ data: I[f[0]], x: x + 0.17, y: 3.27, w: 0.36, h: 0.36, objectName: `anim_${i + 1}_fi`, altText: "pictogramme" });
    txt(s, f[1], { x: x + 0.85, y: 3.2, w: 1.4, h: 0.5, fontSize: 15, bold: true, color: C.background1, valign: "middle", objectName: `anim_${i + 1}_ft` });
  });
  txt(s, "Merci de votre attention. Place à la démonstration et à vos questions.", { x: 0.5, y: 4.4, w: 9, h: 0.5, fontSize: 18, color: C.accent6 });
  s.addNotes("Je conclus sur le message principal, puis je lance la démonstration : PC obsolète mis à jour, fichier altéré refusé, borne verte puis rouge.");

  await pres.writeFile({ fileName: "Projet_E6_Aziza.pptx" });
  await applyTheme("Projet_E6_Aziza.pptx", THEME);
  console.log("ok");
})();
