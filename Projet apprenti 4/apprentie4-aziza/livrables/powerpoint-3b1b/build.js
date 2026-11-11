// Présentation E6 d'Aziza, style « tableau noir mathématique » (fond sombre, serif, bleu / jaune / vert / rouge).
// node build.js  →  deck_brut.pptx, puis apply_theme, puis python animate.py deck_brut.pptx Projet_E6_Aziza_3b1b.pptx
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");

const THEME = {
  name: "Tableau noir",
  headFontFace: "Cambria",
  bodyFontFace: "Cambria",
  colors: {
    dk1: "0C0D10", lt1: "ECECEC", dk2: "1A1D24", lt2: "8A8F98",
    accent1: "58C4DD", accent2: "F4D345", accent3: "83C167", accent4: "FC6255",
    accent5: "9A72AC", accent6: "5CD0B3", hlink: "58C4DD", folHlink: "9A72AC",
  },
};
const BG = "0C0D10", PANEL = "1A1D24", PANEL2 = "232731", LINE = "3A3F48", WHITE = "ECECEC", GREY = "8A8F98";
const BLUE = "58C4DD", YEL = "F4D345", GRN = "83C167", RED = "FC6255", PUR = "9A72AC", TEAL = "5CD0B3", PSBLUE = "012456";
const MONO = "Consolas";

const iconCache = {};
async function icon(Icon, color) {
  const k = Icon.name + color;
  if (!iconCache[k]) {
    const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Icon, { color: "#" + color, size: "256" }));
    iconCache[k] = "image/png;base64," + (await sharp(Buffer.from(svg)).png().toBuffer()).toString("base64");
  }
  return iconCache[k];
}

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title = "Projet E6 – Un PC peut-il prouver qu'il est à jour ?";
  pres.author = "Aziza – BTS CIEL option A";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };

  const FOOT = "Projet E6 · Aziza · BTS CIEL option A · maquette au lycée, données fictives";
  pres.defineSlideMaster({ title: "TITRE", background: { color: BG } });
  pres.defineSlideMaster({
    title: "SECTION", background: { color: BG },
    objects: [{ placeholder: { options: { name: "title", type: "title", x: 0.6, y: 2.35, w: 8.8, h: 0.9, fontSize: 36, color: WHITE, valign: "top", margin: 0 }, text: "" } }],
  });
  pres.defineSlideMaster({
    title: "CONTENU", background: { color: BG },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: 0.5, y: 0.28, w: 9.0, h: 0.62, fontSize: 26, color: WHITE, valign: "middle", margin: 0 }, text: "" } },
      { text: { text: FOOT, options: { x: 0.5, y: 5.24, w: 7.8, h: 0.25, fontSize: 10, color: GREY, margin: 0 } } },
    ],
    slideNumber: { x: 9.0, y: 5.22, w: 0.5, h: 0.28, fontSize: 10, color: GREY, align: "right" },
  });

  // ---------- aides ----------
  const T = (s, text, o) => s.addText(text, Object.assign({ margin: 0, isTextBox: true, color: WHITE, fontSize: 16, valign: "top" }, o));
  const R = (s, x, y, w, h, o = {}) => s.addShape(o.round === false ? pres.shapes.RECTANGLE : pres.shapes.ROUNDED_RECTANGLE,
    Object.assign({ x, y, w, h, fill: { color: o.fill || PANEL }, line: { color: o.line || o.fill || PANEL, width: o.lw || 1 }, objectName: o.n },
      o.round === false ? {} : { rectRadius: o.r ?? 0.08 }, o.dash ? { line: { color: o.line, width: o.lw || 1.5, dashType: "dash" } } : {},
      o.rot ? { rotate: o.rot } : {}));
  const O = (s, x, y, d, color, n, lineCol) => s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color }, line: { color: lineCol || color, width: lineCol ? 2 : 1 }, objectName: n });
  function L(s, x1, y1, x2, y2, o = {}) {
    s.addShape(pres.shapes.LINE, {
      x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.max(Math.abs(x2 - x1), 0.001), h: Math.max(Math.abs(y2 - y1), 0.001),
      flipH: x2 < x1, flipV: y2 < y1, objectName: o.n,
      line: Object.assign({ color: o.c || LINE, width: o.w || 2 }, o.dash ? { dashType: "dash" } : {}, o.arrow === false ? {} : { endArrowType: "triangle" }),
    });
  }
  async function I(s, Icon, color, x, y, size, n) { s.addImage({ data: await icon(Icon, color), x, y, w: size, h: size, objectName: n }); }
  const nm = (base, suf) => (base ? base + suf : undefined);

  // PC portable dessiné : écran + base
  function laptop(s, x, y, w, o = {}) {
    const h = w * 0.62;
    R(s, x, y, w, h, { fill: "22262E", line: LINE, r: 0.06, n: nm(o.n, "f") });
    R(s, x + w * 0.05, y + h * 0.07, w * 0.9, h * 0.86, { fill: o.scr || "2B3038", round: false, n: nm(o.n, "s") });
    if (o.t) T(s, o.t, { x: x + w * 0.05, y: y + h * 0.07, w: w * 0.9, h: h * 0.86, align: "center", valign: "middle", fontSize: o.fs || 14, color: o.tc || GREY, fontFace: o.mono ? MONO : undefined, bold: !!o.bold, objectName: nm(o.n, "t") });
    R(s, x - w * 0.08, y + h, w * 1.16, w * 0.07, { fill: "3A3F48", r: 0.03, n: nm(o.n, "b") });
    if (o.label) T(s, o.label, { x: x - 0.1, y: y + h + w * 0.1, w: w + 0.2, h: 0.28, align: "center", fontSize: o.lfs || 12, color: GREY, objectName: nm(o.n, "l") });
    return { x, y, w, h };
  }
  // écran seul (pour changer l'état d'un portable déjà dessiné)
  function screen(s, x, y, w, color, text, tc, n, fs) {
    const h = w * 0.62;
    R(s, x + w * 0.05, y + h * 0.07, w * 0.9, h * 0.86, { fill: color, round: false, n: nm(n, "s") });
    T(s, text, { x: x + w * 0.05, y: y + h * 0.07, w: w * 0.9, h: h * 0.86, align: "center", valign: "middle", fontSize: fs || 14, bold: true, color: tc, objectName: nm(n, "t") });
  }
  // serveur : trois tiroirs avec voyants
  function server(s, x, y, w, o = {}) {
    const hh = w * 0.32;
    for (let i = 0; i < 3; i++) {
      R(s, x, y + i * (hh + 0.05), w, hh, { fill: PANEL2, line: LINE, r: 0.04, n: nm(o.n, "d" + i) });
      O(s, x + w * 0.08, y + i * (hh + 0.05) + hh * 0.33, hh * 0.34, i === 0 ? GRN : BLUE, nm(o.n, "v" + i));
      R(s, x + w * 0.3, y + i * (hh + 0.05) + hh * 0.42, w * 0.6, hh * 0.16, { fill: LINE, round: false, n: nm(o.n, "r" + i) });
    }
    if (o.label) T(s, o.label, { x: x - 0.3, y: y + 3 * (hh + 0.05) + 0.04, w: w + 0.6, h: 0.28, align: "center", fontSize: 12, color: GREY, objectName: nm(o.n, "l") });
  }
  // téléphone avec barres de réseau
  function phone(s, x, y, h, o = {}) {
    const w = h * 0.52;
    R(s, x, y, w, h, { fill: "22262E", line: LINE, r: 0.1, n: nm(o.n, "f") });
    R(s, x + w * 0.1, y + h * 0.1, w * 0.8, h * 0.78, { fill: "2B3038", round: false, n: nm(o.n, "s") });
    const bars = o.bars ?? 3;
    for (let i = 0; i < 4; i++) {
      const bh = h * 0.08 * (i + 1);
      R(s, x + w * 0.22 + i * w * 0.15, y + h * 0.55 - bh, w * 0.1, bh, { fill: i < bars ? (o.c || BLUE) : LINE, round: false, n: nm(o.n, "b" + i) });
    }
    T(s, o.t || "4G", { x: x + w * 0.1, y: y + h * 0.6, w: w * 0.8, h: h * 0.2, align: "center", fontSize: o.fs || 12, bold: true, color: o.c || BLUE, objectName: nm(o.n, "t") });
    if (o.label) T(s, o.label, { x: x - 0.5, y: y + h + 0.06, w: w + 1.0, h: 0.28, align: "center", fontSize: 12, color: GREY, objectName: nm(o.n, "l") });
  }
  // borne de sortie : boîtier, deux voyants, zone de pose
  function borne(s, x, y, w, o = {}) {
    const h = w * 1.25;
    R(s, x, y, w, h, { fill: "15171C", line: LINE, r: 0.12, n: nm(o.n, "f") });
    const d = w * 0.22;
    O(s, x + w * 0.22, y + h * 0.1, d, "2A2F37", nm(o.n, "g0"), "3F4650");
    O(s, x + w * 0.56, y + h * 0.1, d, "2A2F37", nm(o.n, "r0"), "3F4650");
    R(s, x + w * 0.15, y + h * 0.42, w * 0.7, h * 0.4, { fill: "15171C", line: "5A6270", dash: true, n: nm(o.n, "p") });
    if (w >= 1.2) T(s, "badge puis PC", { x: x + w * 0.15, y: y + h * 0.42, w: w * 0.7, h: h * 0.4, align: "center", valign: "middle", fontSize: 11, color: GREY, objectName: nm(o.n, "pt") });
    return { gx: x + w * 0.22, rx: x + w * 0.56, ly: y + h * 0.1, d, h };
  }
  function ledOn(s, b, which, n) { // voyant allumé, posé sur le voyant éteint
    const col = which === "g" ? GRN : RED, cx = which === "g" ? b.gx : b.rx;
    O(s, cx - b.d * 0.25, b.ly - b.d * 0.25, b.d * 1.5, col === GRN ? "2C4A2A" : "4F2422", nm(n, "h"));
    O(s, cx, b.ly, b.d, col, nm(n, "c"));
  }
  // badge RFID (carte)
  function badge(s, x, y, w, n) {
    const h = w * 0.63;
    R(s, x, y, w, h, { fill: "2E5E6E", line: BLUE, r: 0.08, n: nm(n, "f") });
    R(s, x + w * 0.1, y + h * 0.2, w * 0.22, h * 0.28, { fill: YEL, r: 0.03, n: nm(n, "c") });
    T(s, "A-12", { x: x + w * 0.4, y: y + h * 0.18, w: w * 0.55, h: h * 0.3, fontSize: 12, bold: true, color: WHITE, objectName: nm(n, "t") });
    T(s, "agent", { x: x + w * 0.1, y: y + h * 0.6, w: w * 0.8, h: h * 0.3, fontSize: 10, color: "CFE6EE", objectName: nm(n, "u") });
  }
  // étiquette RFID (autocollant avec antenne)
  function tag(s, x, y, w, n) {
    R(s, x, y, w, w * 0.6, { fill: "E8E3D0", line: "B9B39C", r: 0.04, n: nm(n, "f") });
    for (let i = 0; i < 3; i++) R(s, x + w * (0.1 + i * 0.07), y + w * (0.06 + i * 0.07), w * (0.8 - i * 0.14), w * (0.48 - i * 0.14), { fill: "E8E3D0", line: "C08A2A", lw: 1, r: 0.02, n: nm(n, "a" + i) });
    R(s, x + w * 0.42, y + w * 0.24, w * 0.16, w * 0.12, { fill: "333333", round: false, n: nm(n, "c") });
  }
  // document
  function doc(s, x, y, w, label, color, n) {
    const h = w * 1.25;
    R(s, x, y, w, h, { fill: PANEL2, line: color || LINE, r: 0.04, lw: 1.5, n: nm(n, "f") });
    for (let i = 0; i < 4; i++) R(s, x + w * 0.15, y + h * (0.22 + i * 0.15), w * (i === 3 ? 0.45 : 0.7), h * 0.05, { fill: color || LINE, round: false, n: nm(n, "l" + i) });
    if (label) T(s, label, { x: x - 0.4, y: y + h + 0.05, w: w + 0.8, h: 0.28, align: "center", fontSize: 12, color: GREY, objectName: nm(n, "t") });
  }
  // marque ✓ ✗ ~
  function mark(s, x, y, kind, n) {
    const col = kind === "y" ? GRN : kind === "n" ? RED : YEL, ch = kind === "y" ? "✓" : kind === "n" ? "✗" : "~";
    O(s, x, y, 0.3, BG, nm(n, "o"), col);
    T(s, ch, { x, y, w: 0.3, h: 0.3, align: "center", valign: "middle", fontSize: 13, bold: true, color: col, fontFace: "Segoe UI Symbol", objectName: nm(n, "t") });
  }
  const chip = (s, x, y, text, color, n, w) => {
    R(s, x, y, w || 1.1, 0.34, { fill: BG, line: color, r: 0.17, lw: 1.5, n: nm(n, "f") });
    T(s, text, { x, y, w: w || 1.1, h: 0.34, align: "center", valign: "middle", fontSize: 12, bold: true, color, objectName: nm(n, "t") });
  };
  const content = (title, sec) => { const s = pres.addSlide({ masterName: "CONTENU", sectionTitle: sec }); s.addText(title, { placeholder: "title" }); return s; };
  const clock = (s, text) => chip(s, 8.4, 0.42, text, YEL, undefined, 1.1);
  function section(num, title, sub, sec) {
    pres.addSection({ title: sec });
    const s = pres.addSlide({ masterName: "SECTION", sectionTitle: sec });
    T(s, String(num), { x: 0.6, y: 1.0, w: 1.5, h: 1.2, fontSize: 72, color: BLUE });
    s.addText(title, { placeholder: "title" });
    T(s, sub, { x: 0.6, y: 3.35, w: 8.4, h: 0.8, fontSize: 16, color: GREY });
    return s;
  }

  // ======================= 1. TITRE =======================
  pres.addSection({ title: "Ouverture" });
  let s = pres.addSlide({ masterName: "TITRE", sectionTitle: "Ouverture" });
  T(s, "BTS CIEL option A · Épreuve E6 · Session 2027", { x: 0.6, y: 0.55, w: 6, h: 0.3, fontSize: 12, color: GREY });
  T(s, [{ text: "Un PC peut-il " }, { text: "prouver", options: { color: YEL } }, { text: " qu'il est à jour ?" }], { x: 0.6, y: 1.25, w: 5.6, h: 1.7, fontSize: 40 });
  T(s, "Des PC de maintenance à jour, des documents archivés, un parc tracé", { x: 0.6, y: 3.1, w: 5.4, h: 0.7, fontSize: 16, color: GREY });
  T(s, "Aziza · apprentie · besoin issu de l'entreprise, réalisation au lycée sur maquette", { x: 0.6, y: 4.55, w: 8.6, h: 0.3, fontSize: 12, color: GREY });
  laptop(s, 6.7, 1.35, 2.6, { t: "?", fs: 60, tc: YEL, bold: true });
  chip(s, 6.85, 3.35, "v12 ?", GREY, "anim_1_f_c1");
  chip(s, 8.05, 3.35, "v13 ?", BLUE, "anim_1_f~d300_c2");
  s.addNotes("Ouvrir par la question. Un PC portable part chaque jour en intervention. Comment savoir qu'il emporte la bonne version des documents et des paramètres, et surtout comment le prouver ? Tout le projet répond à cette question, en partant de zéro.");

  // ======================= 2. PROBLÈME =======================
  s = section(1, "Le problème", "Partir des faits du terrain, sans supposer de solution.", "1 · Le problème");
  s.addNotes("Première partie : le problème, tel que le tuteur l'a décrit.");

  s = content("Dix PC, une nouvelle version du kit", "1 · Le problème");
  const PX = [0.6, 2.15, 3.7, 5.25, 6.8], PY = [1.2, 2.65], PW = 1.25;
  const pos = (i) => [PX[i % 5], PY[Math.floor(i / 5)]];
  for (let i = 0; i < 10; i++) { const [x, y] = pos(i); laptop(s, x, y, PW, { t: "v12", label: "PC " + (i + 1), mono: true }); }
  await I(s, fa.FaFileAlt, BLUE, 8.65, 1.2, 0.6, "anim_1_f_kd");
  T(s, "Kit v13 publié", { x: 8.25, y: 1.88, w: 1.4, h: 0.3, fontSize: 13, color: BLUE, align: "center", objectName: "anim_1_f_kt" });
  T(s, "8 h 00", { x: 8.25, y: 2.15, w: 1.4, h: 0.3, fontSize: 12, color: GREY, align: "center", objectName: "anim_1_f_kh" });
  await I(s, fa.FaClock, YEL, 8.75, 2.75, 0.4, "anim_2_f_ck");
  T(s, "3 PC : 1 h 15", { x: 8.05, y: 3.2, w: 1.7, h: 0.35, fontSize: 14, bold: true, color: YEL, align: "center", objectName: "anim_2_f~d1000_ckA" });
  const upd = (i, step, d) => { const [x, y] = pos(i); screen(s, x, y, PW, "26412F", "v13", GRN, `anim_${step}_f~d${d}_u${i}`); };
  [0, 1, 2].forEach((i, k) => upd(i, 2, k * 350));
  [3, 8].forEach((i) => { const [x, y] = pos(i); screen(s, x, y, PW, "4A2321", "v12", RED, `anim_3_f_r${i}`); });
  await I(s, fa.FaTruck, RED, PX[3] + 0.9, PY[0] - 0.32, 0.38, "anim_3_f~d200_t1");
  await I(s, fa.FaTruck, RED, PX[3] + 0.9, PY[1] - 0.32, 0.38, "anim_3_f~d400_t2");
  T(s, "partis en intervention", { x: 8.05, y: 3.6, w: 1.6, h: 0.5, fontSize: 12, color: RED, align: "center", objectName: "anim_3_f~d500_pt" });
  [4, 5, 6, 7, 9].forEach((i, k) => upd(i, 4, k * 300));
  T(s, "8 PC : 3 h 20", { x: 8.05, y: 4.1, w: 1.7, h: 0.35, fontSize: 14, bold: true, color: YEL, align: "center", objectName: "anim_4_f~d1500_ckB" });
  T(s, [{ text: "Personne ne sait quels PC sont à jour. " }, { text: "Personne ne peut le prouver.", options: { color: YEL } }], { x: 0.6, y: 4.5, w: 8.9, h: 0.4, fontSize: 18, objectName: "anim_5_f_concl" });
  s.addNotes("Le référent publie une nouvelle version du kit : documents, paramètres, petits programmes. Il faut passer sur chaque PC à la main, 20 à 30 minutes par PC (hypothèse à confirmer). Pendant ce temps, des agents partent. Ici, les PC 4 et 9 partent avec la version 12. Personne ne s'en rend compte, et après coup personne ne peut dire quelle version était sur quel PC.");

  s = content("Trois contraintes, en partant de zéro", "1 · Le problème");
  const cards3 = [
    { ic: fa.FaMobileAlt, col: BLUE, big: "4G", h: "Pas de réseau de l'entreprise", b: "Dehors, seulement la 4G du téléphone de l'agent (confirmé par le tuteur)." },
    { ic: fa.FaClock, col: YEL, big: "3 à 10 h", h: "par mois de mises à jour à la main", b: "10 PC × 20 à 30 min × 1 à 2 fois par mois. Hypothèses à confirmer lors de la visite." },
    { ic: fa.FaQuestion, col: RED, big: "?", h: "Aucune preuve", b: "« Quelle version était sur le PC-04 le 12 mars ? » Aujourd'hui, personne ne peut répondre." },
  ];
  for (let i = 0; i < 3; i++) {
    const c = cards3[i], x = 0.5 + i * 3.1, n = `anim_${i + 1}_f_k${i}`;
    R(s, x, 1.2, 2.85, 3.55, { fill: PANEL, n: n + "bg" });
    await I(s, c.ic, c.col, x + 0.3, 1.45, 0.5, n + "ic");
    T(s, c.big, { x: x + 0.3, y: 2.1, w: 2.3, h: 0.7, fontSize: 36, bold: true, color: c.col, objectName: n + "big" });
    T(s, c.h, { x: x + 0.3, y: 2.85, w: 2.3, h: 0.6, fontSize: 16, bold: true, objectName: n + "h" });
    T(s, c.b, { x: x + 0.3, y: 3.5, w: 2.3, h: 1.1, fontSize: 14, color: GREY, objectName: n + "b" });
  }
  s.addNotes("Trois faits de départ. Un : sur le terrain, pas de réseau de l'entreprise, seulement la 4G du téléphone. Deux : la mise à jour manuelle coûte des heures chaque mois. Trois : il n'existe aucune trace de qui avait quelle version. Toute solution devra respecter ces trois faits.");

  s = pres.addSlide({ masterName: "TITRE", sectionTitle: "1 · Le problème" });
  T(s, [{ text: "Comment être sûr, " }, { text: "avant le départ", options: { color: BLUE } }, { text: ", qu'un PC emporte la bonne version… " }, { text: "et le prouver ?", options: { color: YEL } }],
    { x: 1.0, y: 1.5, w: 8.0, h: 1.8, fontSize: 32, align: "center", valign: "middle" });
  T(s, "Et, en plus (besoin 2 du tuteur) : retrouver facilement les documents de modification et leurs anciennes versions.", { x: 1.5, y: 3.6, w: 7.0, h: 0.7, fontSize: 15, color: GREY, align: "center", objectName: "anim_1_f_b2" });
  s.addNotes("Voilà la vraie question du projet. On ne cherche pas un outil de synchronisation : on cherche une preuve, vérifiable avant le départ. Le deuxième besoin du tuteur, l'archivage, viendra naturellement de la solution.");

  // ======================= 3. EXISTANT =======================
  s = section(2, "Les solutions existantes", "Elles sont bonnes. Mais répondent-elles à ce besoin, et le service peut-il les mettre en place ?", "2 · Solutions existantes");
  s.addNotes("Avant de construire, on regarde ce qui existe.");

  s = content("Six solutions, cinq critères", "2 · Solutions existantes");
  const crit = ["Kit complet d'un bloc", "Marche hors réseau", "Preuve par PC", "Alerte kit périmé", "Le service l'installe seul"];
  crit.forEach((c, i) => T(s, c, { x: 3.0 + i * 1.3, y: 1.1, w: 1.25, h: 0.55, fontSize: 12, color: GREY, align: "center", valign: "bottom" }));
  const rows = [
    ["Clé USB, à la main", "mynny"], ["OneDrive / SharePoint", "nmnny"], ["Microsoft Intune", "myynn"],
    ["Configuration Manager", "myynn"], ["PDQ Deploy", "mnynn"], ["PDQ Connect", "myynn"], ["Projet d'Aziza", "yyyyy"],
  ];
  rows.forEach((r, j) => {
    const y = 1.8 + j * 0.44, step = j < 6 ? Math.floor(j / 2) + 1 : 4, n = `anim_${step}_f~d${(j % 2) * 250}_row${j}`;
    if (j === 6) R(s, 0.45, y - 0.06, 9.1, 0.42, { fill: "17303A", line: BLUE, r: 0.06, n: n + "bg" });
    T(s, r[0], { x: 0.6, y, w: 2.4, h: 0.3, fontSize: 14, bold: j === 6, color: j === 6 ? BLUE : WHITE, valign: "middle", objectName: n + "t" });
    [...r[1]].forEach((k, i) => mark(s, 3.0 + i * 1.3 + 0.475, y, k, n + "m" + i));
  });
  T(s, "✓ oui · ~ en partie, ou avec beaucoup de réglages · ✗ non", { x: 0.6, y: 4.95, w: 6, h: 0.25, fontSize: 11, color: GREY });
  s.addNotes("Cinq critères tirés du problème. Aucune solution du marché ne coche à la fois : kit complet d'un bloc, hors réseau, preuve par PC, alerte de péremption, et installation possible par le service lui-même. C'est surtout la dernière colonne qui bloque : les bons outils appartiennent à la direction informatique.");

  s = content("OneDrive : proche, mais fichier par fichier", "2 · Solutions existantes");
  s.addShape(pres.shapes.CLOUD, { x: 0.9, y: 1.15, w: 2.2, h: 1.0, fill: { color: PANEL }, line: { color: BLUE, width: 1.5 } });
  T(s, "SharePoint", { x: 0.9, y: 1.45, w: 2.2, h: 0.4, align: "center", fontSize: 14, color: BLUE });
  L(s, 1.4, 2.2, 1.4, 2.85, { c: GRN }); L(s, 2.0, 2.2, 2.0, 2.85, { c: YEL, dash: true }); L(s, 2.6, 2.2, 2.6, 2.85, { c: RED, dash: true });
  laptop(s, 1.1, 2.95, 1.8, { t: "un PC", label: "PC de l'agent" });
  const files = [["procedure_poste_A.pdf", "✓ v13", GRN], ["parametres_RTU.xml", "☁ en ligne seulement", YEL], ["schema_armoire.pdf", "v12 (pas encore copié)", RED]];
  for (let i = 0; i < 3; i++) {
    const y = 1.25 + i * 0.68, n = `anim_1_f~d${i * 300}_fl${i}`;
    R(s, 3.9, y, 5.6, 0.55, { fill: PANEL, n: n + "bg" });
    await I(s, fa.FaFileAlt, GREY, 4.05, y + 0.12, 0.3, n + "ic");
    T(s, files[i][0], { x: 4.5, y, w: 2.6, h: 0.55, fontSize: 14, valign: "middle", fontFace: MONO, objectName: n + "t" });
    T(s, files[i][1], { x: 7.1, y, w: 2.3, h: 0.55, fontSize: 13, valign: "middle", bold: true, color: files[i][2], align: "right", objectName: n + "s" });
  }
  R(s, 3.9, 1.93, 5.6, 0.55, { fill: "4A2321", line: RED, n: "anim_2_f_off" });
  T(s, "sans Internet : le fichier ne s'ouvre pas", { x: 4.05, y: 1.93, w: 5.3, h: 0.55, fontSize: 14, bold: true, color: RED, valign: "middle", objectName: "anim_2_f_offt" });
  T(s, [{ text: "Résultat : un PC peut partir avec ", options: {} }, { text: "la moitié du nouveau kit", options: { color: YEL } }, { text: ", sans le savoir." }], { x: 3.9, y: 3.45, w: 5.6, h: 0.7, fontSize: 18, objectName: "anim_3_f_r" });
  T(s, "Il faut cocher « Toujours conserver sur cet appareil » sur chaque PC. Aucune preuve de version par PC, aucune alerte. Source : support Microsoft, fichiers à la demande.", { x: 3.9, y: 4.25, w: 5.6, h: 0.7, fontSize: 12, color: GREY, objectName: "anim_3_f_s" });
  s.addNotes("Le SharePoint existe déjà, donc OneDrive est la première idée. Mais il copie fichier par fichier : un PC peut avoir une partie de la nouvelle version seulement. Et par défaut, certains fichiers restent en ligne seulement : sans Internet, ils ne s'ouvrent pas. Pas de preuve, pas d'alerte.");

  s = content("Intune, SCCM, PDQ : bons outils, pas pour ce service", "2 · Solutions existantes");
  R(s, 0.5, 1.15, 4.3, 3.0, { fill: PANEL, n: "anim_1_f_aBg" });
  await I(s, fa.FaBuilding, BLUE, 0.8, 1.4, 0.6, "anim_1_f_aI");
  T(s, "Direction informatique", { x: 1.55, y: 1.45, w: 3.0, h: 0.5, fontSize: 15, bold: true, color: BLUE, valign: "middle", objectName: "anim_1_f_aT" });
  chip(s, 1.55, 2.0, "licences", BLUE, "anim_1_f_aC1", 1.0); chip(s, 2.65, 2.0, "PC enrôlés", BLUE, "anim_1_f_aC2", 1.25);
  await I(s, fa.FaUserCog, GREY, 0.8, 2.85, 0.55, "anim_1_f~d300_aU");
  T(s, "Service de maintenance", { x: 1.55, y: 2.85, w: 3.0, h: 0.35, fontSize: 15, bold: true, objectName: "anim_1_f~d300_aS" });
  T(s, "✗ pas les droits d'administration", { x: 1.55, y: 3.2, w: 3.15, h: 0.35, fontSize: 13, color: RED, objectName: "anim_1_f~d300_aX" });
  T(s, "Intune, Configuration Manager", { x: 0.8, y: 3.65, w: 3.8, h: 0.35, fontSize: 13, color: GREY, objectName: "anim_1_f~d300_aN" });
  R(s, 5.2, 1.15, 4.3, 3.0, { fill: PANEL, n: "anim_2_f_bBg" });
  laptop(s, 5.5, 1.45, 1.1, { t: "PDQ", tc: BLUE, bold: true, label: "console", n: "anim_2_f_bC" });
  laptop(s, 8.0, 1.45, 1.1, { t: "PC", label: "en 4G", n: "anim_2_f_bP" });
  L(s, 6.75, 1.8, 7.85, 1.8, { c: RED, dash: true, n: "anim_2_f_bL" });
  T(s, "✗", { x: 7.1, y: 1.45, w: 0.4, h: 0.4, fontSize: 22, bold: true, color: RED, align: "center", objectName: "anim_2_f~d300_bX" });
  T(s, "PDQ Deploy doit joindre chaque PC par le réseau interne : un PC en 4G est hors de portée.", { x: 5.45, y: 2.75, w: 3.85, h: 0.65, fontSize: 13, objectName: "anim_2_f~d300_bT" });
  T(s, "PDQ Connect passe par Internet, mais c'est un cloud payant et externe : il faut l'accord de la sécurité.", { x: 5.45, y: 3.4, w: 3.85, h: 0.65, fontSize: 13, color: GREY, objectName: "anim_2_f~d300_bT2" });
  T(s, [{ text: "Si la DSI gère déjà ces PC : ", options: { color: GREY } }, { text: "l'agent d'Aziza devient un contrôle de conformité, à côté d'Intune.", options: { color: BLUE } }], { x: 0.5, y: 4.4, w: 9.0, h: 0.5, fontSize: 15, objectName: "anim_3_f_c" });
  s.addNotes("Intune et Configuration Manager savent faire beaucoup, mais ils appartiennent à la direction informatique : licences, PC enrôlés, droits d'administration que le service n'a pas. PDQ Deploy pousse depuis une console et doit joindre le PC par le réseau interne. PDQ Connect passe par Internet mais c'est un service cloud payant. Point à vérifier lors de la visite : qui administre les PC.");

  // ======================= 4. SOLUTION =======================
  s = section(3, "La solution d'Aziza", "Cinq principes simples, chacun répond à un fait du problème.", "3 · La solution");
  s.addNotes("On construit la solution brique par brique, chaque principe répondant à un fait.");

  s = content("Principe 1 · Avoir un fichier ne prouve rien", "3 · La solution");
  const hashRow = async (y, label, hash, col, step, extra) => {
    const n = `anim_${step}_f`;
    doc(s, 0.9, y, 0.75, undefined, extra ? RED : LINE, n + "~d0_d" + step);
    T(s, label, { x: 1.85, y: y + 0.25, w: 1.6, h: 0.4, fontSize: 14, fontFace: MONO, objectName: n + "~d0_l" + step });
    if (extra) chip(s, 0.6, y - 0.42, "1 octet modifié", RED, n + "~d0_x" + step, 1.5);
    L(s, 3.5, y + 0.47, 4.2, y + 0.47, { c: GREY, n: n + "~d200_a" + step });
    R(s, 4.3, y + 0.12, 1.7, 0.7, { fill: PANEL, line: BLUE, n: n + "~d300_b" + step });
    T(s, "SHA-256", { x: 4.3, y: y + 0.12, w: 1.7, h: 0.7, fontSize: 16, bold: true, color: BLUE, align: "center", valign: "middle", objectName: n + "~d300_bt" + step });
    L(s, 6.1, y + 0.47, 6.8, y + 0.47, { c: GREY, n: n + "~d500_c" + step });
    T(s, hash, { x: 6.9, y: y + 0.27, w: 2.7, h: 0.4, fontSize: 16, bold: true, color: col, fontFace: MONO, objectName: n + "~d700_h" + step });
  };
  await hashRow(1.25, "parametres.xml", "9f3a 61c2 … 0b7e", GRN, 1, false);
  await hashRow(2.85, "parametres.xml", "e71c 04aa … 9d31", RED, 2, true);
  T(s, [{ text: "Une empreinte, c'est l'« ADN » du fichier : un seul octet change, tout change. " }, { text: "L'agent compare chaque empreinte à celle du catalogue : différente = refusé.", options: { color: YEL } }],
    { x: 0.6, y: 4.2, w: 8.8, h: 0.75, fontSize: 16, objectName: "anim_3_f_c" });
  s.addNotes("Premier principe. Avoir un fichier portant le bon nom ne prouve pas que c'est le bon fichier. On calcule son empreinte SHA-256. Changez un seul octet et l'empreinte n'a plus rien à voir. L'agent compare donc chaque empreinte à celle donnée par le référent.");

  s = content("Principe 2 · Seul le catalogue signé fait foi", "3 · La solution");
  R(s, 0.5, 1.2, 3.1, 2.75, { fill: PANEL, n: "anim_1_f_catBg" });
  T(s, "Catalogue v13", { x: 0.7, y: 1.3, w: 2.7, h: 0.35, fontSize: 15, bold: true, color: BLUE, objectName: "anim_1_f_catT" });
  ["procedure.pdf  9f3a…", "parametres.xml 41bd…", "schema.pdf     c07e…", "version 13 · valable 30 j"].forEach((l, i) =>
    T(s, l, { x: 0.7, y: 1.75 + i * 0.38, w: 2.8, h: 0.32, fontSize: 12, fontFace: MONO, color: i === 3 ? YEL : WHITE, objectName: `anim_1_f~d${200 + i * 150}_catL${i}` }));
  O(s, 2.75, 3.25, 0.6, YEL, "anim_1_f~d900_seal");
  await I(s, fa.FaLock, BG, 2.88, 3.38, 0.34, "anim_1_f~d900_sealI");
  T(s, "signé par le référent", { x: 0.7, y: 3.4, w: 2.0, h: 0.35, fontSize: 12, color: YEL, objectName: "anim_1_f~d900_sealT" });
  s.addShape(pres.shapes.CLOUD, { x: 4.0, y: 1.75, w: 2.0, h: 1.05, fill: { color: PANEL }, line: { color: LINE, width: 1.5 } });
  T(s, "4G · Internet", { x: 4.0, y: 2.05, w: 2.0, h: 0.4, fontSize: 13, color: GREY, align: "center" });
  await I(s, fa.FaUserSecret, RED, 4.75, 3.05, 0.5, "anim_2_f~d600_att");
  T(s, "et si on modifie un fichier en route ?", { x: 3.8, y: 3.6, w: 2.4, h: 0.5, fontSize: 12, color: RED, align: "center", objectName: "anim_2_f~d600_attT" });
  R(s, 3.45, 2.2, 0.28, 0.28, { fill: BLUE, r: 0.04, n: "anim_2_f~t200+m~3.15:0~t1600~d200_pk" });
  laptop(s, 6.75, 1.25, 2.6, { t: "agent", tc: WHITE });
  ["signature du référent ✓", "version 13 > 12 ✓", "empreintes identiques ✓"].forEach((l, i) =>
    T(s, l, { x: 6.75, y: 3.3 + i * 0.36, w: 2.8, h: 0.32, fontSize: 14, color: GRN, objectName: `anim_3_f~d${i * 400}_ok${i}` }));
  s.addNotes("Deuxième principe. Le fichier passe par la 4G, par Internet, peut-être même par une clé USB. On ne fait confiance à aucun de ces chemins. Seul compte le catalogue signé par le référent : la liste des fichiers, leurs empreintes, et le numéro de version. L'agent vérifie la signature, refuse un numéro de version plus ancien, puis compare les empreintes.");

  s = content("Principes 3 et 4 · PC éteint, réseau absent", "3 · La solution");
  laptop(s, 0.6, 1.3, 1.5, { scr: "111316", t: "éteint", tc: "555B66", label: "PC" });
  server(s, 2.75, 1.25, 1.2, { label: "serveur" });
  T(s, "dernier rapport :\n8 h 12 · v13", { x: 2.45, y: 2.95, w: 1.8, h: 0.6, fontSize: 12, color: GRN, align: "center", objectName: "anim_1_f_rep" });
  const bb = borne(s, 0.75, 3.1, 0.75);
  L(s, 1.6, 3.55, 2.4, 3.2, { c: BLUE, n: "anim_1_f~d300_q" });
  T(s, "La borne lit le dernier rapport. Serveur muet : « vérification impossible », jamais « à jour ».", { x: 2.05, y: 3.65, w: 2.5, h: 1.2, fontSize: 13, objectName: "anim_1_f~d500_bt" });
  T(s, "Volume par la 4G (exemple)", { x: 5.2, y: 1.2, w: 4.3, h: 0.3, fontSize: 14, bold: true });
  T(s, "copie complète", { x: 5.2, y: 1.6, w: 1.8, h: 0.3, fontSize: 12, color: GREY });
  R(s, 7.0, 1.62, 2.5, 0.26, { fill: BLUE, round: false, n: "anim_2_w~t900_v1" });
  T(s, "1 200 Mo", { x: 7.0, y: 1.62, w: 2.45, h: 0.26, fontSize: 11, bold: true, color: BG, align: "right", valign: "middle", objectName: "anim_2_f~d900_v1t" });
  T(s, "fichiers modifiés", { x: 5.2, y: 2.0, w: 1.8, h: 0.3, fontSize: 12, color: GREY });
  R(s, 7.0, 2.02, 0.08, 0.26, { fill: GRN, round: false, n: "anim_2_w~t300~d300_v2" });
  T(s, "35 Mo", { x: 7.15, y: 2.02, w: 1.0, h: 0.26, fontSize: 11, bold: true, color: GRN, valign: "middle", objectName: "anim_2_f~d600_v2t" });
  T(s, "Téléchargement BITS", { x: 5.2, y: 2.75, w: 4.3, h: 0.3, fontSize: 14, bold: true });
  R(s, 5.2, 3.15, 4.3, 0.4, { fill: PANEL2, line: LINE, round: false });
  R(s, 5.2, 3.15, 2.58, 0.4, { fill: BLUE, round: false, n: "anim_3_w~t1300_p1" });
  T(s, "✗ coupure à 60 %", { x: 6.4, y: 3.62, w: 2.6, h: 0.3, fontSize: 13, bold: true, color: RED, objectName: "anim_3_f~d1300+x~d2600_cut" });
  R(s, 7.78, 3.15, 1.72, 0.4, { fill: BLUE, round: false, n: "anim_3_w~t1000~d2900_p2" });
  T(s, "reprise là où il s'était arrêté · 100 %", { x: 5.2, y: 3.62, w: 4.3, h: 0.3, fontSize: 13, bold: true, color: GRN, objectName: "anim_3_f~d3900_ok" });
  T(s, "Sur la 4G, on envoie seulement ce qui a changé, et une coupure ne fait rien perdre.", { x: 5.2, y: 4.1, w: 4.3, h: 0.7, fontSize: 14, color: GREY, objectName: "anim_3_f~d4200_c" });
  s.addNotes("Troisième principe : un PC éteint ne peut rien affirmer. La borne ne parle donc pas au PC, elle lit son dernier rapport sur le serveur. Si le serveur ne répond pas, elle dit « vérification impossible », jamais « à jour ». Quatrième principe : le réseau manque. On télécharge seulement les fichiers modifiés, et BITS, intégré à Windows, reprend après une coupure sans tout recommencer. Les volumes sont des exemples.");

  s = content("Principe 5 · Chaque version a une valeur", "3 · La solution");
  const vers = [["v11", "12 janv.", "nouveau schéma armoire B"], ["v12", "3 févr.", "paramètres poste A corrigés"], ["v13", "10 mars", "procédure mise à jour"]];
  for (let i = 0; i < 3; i++) {
    const x = 0.6 + i * 3.05, n = `anim_${i + 1}_f_v${i}`, col = i === 2 ? BLUE : GREY;
    R(s, x, 1.35, 2.6, 2.0, { fill: PANEL, line: i === 2 ? BLUE : PANEL, n: n + "bg" });
    T(s, vers[i][0], { x: x + 0.2, y: 1.45, w: 1.0, h: 0.55, fontSize: 28, bold: true, color: col, objectName: n + "v" });
    T(s, vers[i][1], { x: x + 1.3, y: 1.55, w: 1.1, h: 0.35, fontSize: 13, color: GREY, align: "right", objectName: n + "d" });
    T(s, [{ text: "validée par : chef d'équipe", options: { breakLine: true } }, { text: "motif : " + vers[i][2], options: { breakLine: true } }, { text: "équipements : 3" }], { x: x + 0.2, y: 2.1, w: 2.25, h: 1.15, fontSize: 12, color: WHITE, objectName: n + "m" });
    if (i < 2) L(s, x + 2.65, 2.35, x + 3.0, 2.35, { c: GREY, n: `anim_${i + 2}_f_va${i}` });
  }
  T(s, "Rien n'est écrasé : l'historique des versions forme l'archive (besoin 2).", { x: 0.6, y: 3.7, w: 8.8, h: 0.4, fontSize: 18, color: YEL, objectName: "anim_4_f_c" });
  await I(s, fa.FaSearch, BLUE, 0.6, 4.25, 0.36, "anim_4_f~d300_si");
  T(s, "Retrouver la v12 du 3 février : moins d'une minute (test T11, V2)", { x: 1.1, y: 4.25, w: 8.0, h: 0.36, fontSize: 14, color: GREY, valign: "middle", objectName: "anim_4_f~d300_st" });
  s.addNotes("Cinquième principe. On ne remplace jamais une version, on en ajoute une. Chaque version garde qui l'a validée, quand, pourquoi, et pour quels équipements. Ainsi l'historique devient l'archive des documents de modification : c'est le deuxième besoin du tuteur, traité en V2.");

  s = content("La solution en une image", "3 · La solution");
  const flow = [["Référent", "signe le kit"], ["Serveur", "range les versions"], ["4G", "transporte"], ["PC", "vérifie, se met à jour"], ["Borne", "contrôle le départ"]];
  const FX = [0.55, 2.45, 4.35, 6.25, 8.15];
  laptop(s, FX[0], 1.55, 1.25, { t: "PS>", tc: WHITE, mono: true, scr: PSBLUE });
  server(s, FX[1] + 0.12, 1.45, 1.0);
  phone(s, FX[2] + 0.35, 1.3, 1.15);
  laptop(s, FX[3], 1.55, 1.25, { t: "v13 ✓", tc: GRN, scr: "26412F", bold: true });
  const fb = borne(s, FX[4] + 0.25, 1.3, 0.8);
  ledOn(s, fb, "g");
  flow.forEach((f, i) => {
    T(s, f[0], { x: FX[i] - 0.2, y: 2.75, w: 1.65, h: 0.35, fontSize: 16, bold: true, align: "center", color: [BLUE, BLUE, BLUE, GRN, GRN][i] });
    T(s, f[1], { x: FX[i] - 0.25, y: 3.1, w: 1.75, h: 0.5, fontSize: 13, color: GREY, align: "center" });
    if (i < 4) L(s, FX[i] + 1.4, 2.0, FX[i + 1] - 0.15, 2.0, { c: LINE });
  });
  R(s, 1.85, 1.86, 0.26, 0.26, { fill: BLUE, r: 0.04, n: "anim_1_f~t150+m~5.7:0~t3000~d150_pk" });
  T(s, [{ text: "Le PC prouve sa version par un rapport ; la borne vérifie ce rapport avant le départ. " }, { text: "Le service garde la main, sans outil de la DSI.", options: { color: YEL } }], { x: 0.6, y: 3.95, w: 8.8, h: 0.8, fontSize: 16, objectName: "anim_2_f_c" });
  s.addNotes("La solution complète en une image : le référent signe, le serveur range, la 4G transporte, le PC vérifie et se met à jour, la borne contrôle le départ.");

  // ======================= 5. SCÉNARIO =======================
  s = section(4, "Un exemple : la journée de Lina", "Lina est technicienne (personnage fictif). Suivons son PC, le PC-04, du bureau au terrain.", "4 · Scénario");
  s.addNotes("Un scénario concret rend le système vivant pour le jury.");

  s = content("Le référent publie le kit v13", "4 · Scénario"); clock(s, "7 h 30");
  laptop(s, 0.6, 1.2, 4.6, { scr: PSBLUE });
  const ps = ["PS> New-FileCatalog .\\kit kit.cat", "PS> Set-AuthenticodeSignature kit.cat", "    Statut : Valid", "PS> publication SFTP → serveur", "    3 fichiers modifiés + catalogue"];
  ps.forEach((l, i) => T(s, l, { x: 0.95, y: 1.45 + i * 0.4, w: 4.0, h: 0.35, fontSize: 12, fontFace: MONO, color: i === 2 ? GRN : "E8EEF5", objectName: `anim_1_f~d${i * 450}_ps${i}` }));
  server(s, 7.4, 1.5, 1.5, { label: "serveur Ubuntu" });
  for (let i = 0; i < 3; i++) R(s, 5.5, 1.9 + i * 0.35, 0.25, 0.3, { fill: BLUE, r: 0.03, n: `anim_2_f~t150~d${i * 350}+m~1.7:0~t1200~d${i * 350 + 150}_f${i}` });
  T(s, "Le kit est signé avant de partir : personne ne peut le modifier sans que cela se voie.", { x: 0.6, y: 4.55, w: 8.8, h: 0.5, fontSize: 16, color: YEL, objectName: "anim_3_f_c" });
  s.addNotes("7 h 30. Le référent a modifié trois fichiers. Un script PowerShell calcule les empreintes, signe le catalogue avec le certificat du référent, puis publie sur le serveur en SFTP. Ce sont des commandes Windows natives : New-FileCatalog et Set-AuthenticodeSignature.");

  s = content("Le PC de Lina démarre au bureau", "4 · Scénario"); clock(s, "8 h 00");
  const chk = [["catalogue reçu", WHITE], ["signature du référent ✓", GRN], ["version 13 > version 12 ✓", GRN], ["3 fichiers différents", YEL], ["niveau : confirmation par l'agent", BLUE]];
  chk.forEach((c, i) => T(s, c[0], { x: 0.6, y: 1.3 + i * 0.5, w: 3.6, h: 0.4, fontSize: 15, color: c[1], objectName: `anim_1_f~d${i * 400}_c${i}` }));
  laptop(s, 4.6, 1.2, 4.6, { scr: "1E3348" });
  R(s, 6.2, 2.15, 2.75, 1.4, { fill: "2B3038", line: LINE, r: 0.06, n: "anim_2_f_toast" });
  await I(s, fa.FaBell, YEL, 6.35, 2.28, 0.28, "anim_2_f_ti");
  T(s, "Kit de maintenance v13", { x: 6.7, y: 2.25, w: 2.2, h: 0.32, fontSize: 13, bold: true, objectName: "anim_2_f_tt" });
  T(s, "3 fichiers modifiés · 35 Mo", { x: 6.35, y: 2.62, w: 2.5, h: 0.3, fontSize: 12, color: GREY, objectName: "anim_2_f_ts" });
  chip(s, 6.35, 3.05, "Installer", GRN, "anim_2_f_tb1", 1.1); chip(s, 7.6, 3.05, "Plus tard", GREY, "anim_2_f_tb2", 1.1);
  T(s, "Paramètres et programmes : on demande toujours à l'agent. Documents : mise à jour automatique.", { x: 0.6, y: 4.5, w: 8.8, h: 0.5, fontSize: 15, color: GREY, objectName: "anim_3_f_c" });
  s.addNotes("8 heures. Le PC de Lina démarre ; une tâche planifiée lance l'agent. Il récupère le catalogue, vérifie la signature et le numéro de version, compare les empreintes : trois fichiers diffèrent. Comme ce sont des paramètres, l'agent demande confirmation à Lina. Trois niveaux existent : simulation, confirmation, automatique.");

  s = content("Téléchargement 4G, avec une coupure", "4 · Scénario"); clock(s, "8 h 05");
  server(s, 0.7, 1.35, 1.3, { label: "serveur" });
  phone(s, 4.4, 1.2, 1.4, { label: "partage de connexion" });
  laptop(s, 7.2, 1.35, 2.0, { scr: "1E3348", label: "PC-04" });
  L(s, 2.15, 1.95, 4.25, 1.95, { c: LINE, arrow: false }); L(s, 5.3, 1.95, 7.05, 1.95, { c: LINE, arrow: false });
  for (let i = 0; i < 3; i++) R(s, 2.2, 1.82, 0.26, 0.26, { fill: BLUE, r: 0.04, n: `anim_1_f~t100~d${i * 500}+m~4.8:0~t1500~d${i * 500 + 100}+x~t200~d${i * 500 + 1600}_k${i}` });
  T(s, "✗", { x: 3.0, y: 1.6, w: 0.5, h: 0.6, fontSize: 30, bold: true, color: RED, align: "center", objectName: "anim_2_f+x~d2500_cx" });
  R(s, 0.7, 3.55, 8.6, 0.42, { fill: PANEL2, line: LINE, round: false });
  R(s, 0.7, 3.55, 5.16, 0.42, { fill: BLUE, round: false, n: "anim_1_w~t2200_b1" });
  T(s, "60 %", { x: 5.0, y: 3.55, w: 0.8, h: 0.42, fontSize: 13, bold: true, color: BG, align: "right", valign: "middle", objectName: "anim_1_f~d2200_b1t" });
  R(s, 5.86, 3.55, 3.44, 0.42, { fill: BLUE, round: false, n: "anim_3_w~t1500_b2" });
  T(s, "100 %", { x: 8.3, y: 3.55, w: 0.9, h: 0.42, fontSize: 13, bold: true, color: BG, align: "right", valign: "middle", objectName: "anim_3_f~d1500_b2t" });
  T(s, "[BITS] coupure réseau · travail en attente", { x: 0.7, y: 4.1, w: 8.6, h: 0.32, fontSize: 13, fontFace: MONO, color: RED, objectName: "anim_2_f_l1" });
  T(s, "[BITS] réseau revenu · reprise à 60 % (Range: bytes=21000000-) · terminé", { x: 0.7, y: 4.45, w: 8.6, h: 0.32, fontSize: 13, fontFace: MONO, color: GRN, objectName: "anim_3_f~d300_l2" });
  s.addNotes("8 h 05. Lina accepte. BITS télécharge les trois fichiers par le partage de connexion de son téléphone. À 60 %, la connexion coupe. BITS met le travail en attente, puis reprend exactement là où il s'était arrêté grâce aux requêtes Range. Au lycée, cette coupure est simulée avec netem.");

  s = content("Vérifier, basculer, rendre compte", "4 · Scénario"); clock(s, "8 h 12");
  const fold = [["preparation", "v13 téléchargé", BLUE], ["actif", "v12 → v13", GRN], ["precedent", "v12 gardé", GREY]];
  for (let i = 0; i < 3; i++) {
    const x = 0.6 + i * 1.9, n = `anim_1_f~d${i * 400}_fo${i}`;
    await I(s, fa.FaFolder, fold[i][2], x + 0.35, 1.3, 0.9, n + "i");
    T(s, fold[i][0], { x: x - 0.1, y: 2.25, w: 1.8, h: 0.35, fontSize: 14, bold: true, align: "center", fontFace: MONO, color: fold[i][2], objectName: n + "t" });
    T(s, fold[i][1], { x: x - 0.1, y: 2.6, w: 1.8, h: 0.35, fontSize: 12, align: "center", color: GREY, objectName: n + "s" });
  }
  T(s, "Test-FileCatalog -Detailed → Valid : chaque fichier revérifié avant la bascule. Retour arrière possible en moins de 2 min.", { x: 0.6, y: 3.15, w: 5.6, h: 0.75, fontSize: 13, color: GREY, objectName: "anim_1_f~d1200_tf" });
  server(s, 7.7, 1.3, 1.3, { label: "serveur" });
  R(s, 6.4, 1.6, 0.85, 0.36, { fill: GRN, r: 0.05, n: "anim_2_f~t150+m~0.95:0~t1000~d150+x~t200~d1200_rp" });
  T(s, "rapport", { x: 6.4, y: 1.6, w: 0.85, h: 0.36, fontSize: 11, bold: true, color: BG, align: "center", valign: "middle", objectName: "anim_2_f~t150+m~0.95:0~t1000~d150+x~t200~d1200_rpt" });
  R(s, 6.6, 3.15, 2.9, 0.9, { fill: PANEL, line: GRN, n: "anim_2_f~d1300_tab" });
  T(s, [{ text: "PC-04 · v13 · 8 h 12", options: { breakLine: true, bold: true, color: GRN } }, { text: "jeton du PC vérifié ✓", options: { color: GREY } }], { x: 6.75, y: 3.2, w: 2.7, h: 0.8, fontSize: 13, valign: "middle", objectName: "anim_2_f~d1300_tabt" });
  await I(s, fa.FaKey, YEL, 6.15, 2.1, 0.32, "anim_2_f_key");
  T(s, "Le rapport est accepté seulement avec le jeton du PC : impossible d'envoyer un faux « à jour ».", { x: 0.6, y: 4.35, w: 8.8, h: 0.5, fontSize: 15, color: YEL, objectName: "anim_3_f_c" });
  s.addNotes("8 h 12. Chaque fichier est revérifié avec le catalogue. Tout est bon : l'ancien kit passe dans « precedent », le nouveau dans « actif ». Puis le PC envoie son rapport au serveur, avec son jeton personnel. Sans jeton valide, le serveur refuse : c'est le test T15.");

  s = content("À la borne de sortie", "4 · Scénario"); clock(s, "8 h 20");
  const b1 = borne(s, 3.6, 1.15, 2.2);
  badge(s, 0.6, 1.4, 1.5, "anim_1_f~t150+m~3.45:0.75~t1100~d150+x~t300~d1500_bd");
  laptop(s, 0.6, 3.0, 1.5, { scr: "1E3348", t: "PC-04", tc: WHITE, n: "anim_2_f~t150+m~3.45:-0.65~t1100~d150+x~t300~d1500_pc" });
  tag(s, 0.7, 3.08, 0.4, "anim_2_f~t150+m~3.45:-0.65~t1100~d150+x~t300~d1500_tg");
  ledOn(s, b1, "g", "anim_3_f~d800_led");
  T(s, "♪ bip", { x: 4.2, y: 4.0, w: 1.0, h: 0.35, fontSize: 14, color: GRN, align: "center", objectName: "anim_3_f~d900_bip" });
  const bsteps = [["badge lu", "agent A-12 : qui part"], ["étiquette lue", "PC-04 : quel PC part"], ["question au serveur", "rapport : 8 min · v13 = publiée"], ["feu vert", "sortie enregistrée"]];
  bsteps.forEach((b, i) => {
    const st = [1, 2, 3, 3][i], d = [1400, 1400, 0, 800][i], n = `anim_${st}_f~d${d}_bs${i}`;
    O(s, 6.3, 1.25 + i * 0.85, 0.36, i === 3 ? GRN : BLUE, n + "o");
    T(s, String(i + 1), { x: 6.3, y: 1.25 + i * 0.85, w: 0.36, h: 0.36, fontSize: 13, bold: true, color: BG, align: "center", valign: "middle", objectName: n + "n" });
    T(s, b[0], { x: 6.8, y: 1.2, w: 2.7, h: 0.3, fontSize: 15, bold: true, objectName: n + "t", ...{ y: 1.2 + i * 0.85 } });
    T(s, b[1], { x: 6.8, y: 1.5 + i * 0.85, w: 2.7, h: 0.3, fontSize: 12, color: GREY, objectName: n + "s" });
  });
  s.addNotes("8 h 20. Lina passe son badge : la borne sait qui part. Puis elle présente le PC, côté étiquette RFID : la borne sait quel PC part. Elle interroge le serveur : dernier rapport il y a 8 minutes, version 13 égale à la version publiée. Feu vert, un bip, la sortie est enregistrée.");

  s = content("Et si quelque chose ne va pas ?", "4 · Scénario"); clock(s, "8 h 21");
  const b2 = borne(s, 1.2, 1.2, 1.5); ledOn(s, b2, "r", "anim_1_f_l1");
  T(s, "PC-09 : rapport d'hier, version 12", { x: 0.5, y: 3.25, w: 3.9, h: 0.35, fontSize: 15, bold: true, align: "center", objectName: "anim_1_f_t1" });
  T(s, "rouge · 3 bips · mettre à jour avant de partir", { x: 0.5, y: 3.6, w: 3.9, h: 0.35, fontSize: 13, color: RED, align: "center", objectName: "anim_1_f_t1b" });
  const b3 = borne(s, 6.3, 1.2, 1.5);
  ledOn(s, b3, "g", "anim_2_f_l2a"); ledOn(s, b3, "r", "anim_2_f~d300_l2b");
  T(s, "↔", { x: 6.65, y: 1.15, w: 0.8, h: 0.5, fontSize: 18, bold: true, color: YEL, align: "center", objectName: "anim_2_f~d300_l2c" });
  T(s, "Serveur arrêté : aucune réponse", { x: 5.4, y: 3.25, w: 3.9, h: 0.35, fontSize: 15, bold: true, align: "center", objectName: "anim_2_f_t2" });
  T(s, "vert et rouge en alternance · « vérification impossible »", { x: 5.4, y: 3.6, w: 3.9, h: 0.6, fontSize: 13, color: YEL, align: "center", objectName: "anim_2_f_t2b" });
  T(s, "Jamais « à jour » par défaut : en cas de doute, la borne le dit.", { x: 0.6, y: 4.35, w: 8.8, h: 0.5, fontSize: 18, align: "center", objectName: "anim_3_f_c" });
  s.addNotes("Deux cas qui montrent la sécurité. Le PC-09 est resté éteint depuis hier : son dernier rapport porte la version 12, la borne passe au rouge. Si le serveur est arrêté, la borne ne prétend rien : elle clignote et affiche « vérification impossible ». La sortie est gardée en mémoire et envoyée plus tard.");

  s = content("Sur le terrain, sans réseau", "4 · Scénario"); clock(s, "14 h 00");
  laptop(s, 0.6, 1.25, 3.6, { scr: "1E3348", label: "PC-04, chez un client" });
  phone(s, 4.7, 1.4, 1.2, { bars: 0, t: "aucun", c: RED });
  R(s, 1.0, 1.55, 2.8, 1.0, { fill: "2B3038", line: GRN, r: 0.06, n: "anim_1_f_ok" });
  T(s, [{ text: "Kit v13 valable", options: { bold: true, color: GRN, breakLine: true } }, { text: "jusqu'au 9 avril ✓", options: { color: WHITE } }], { x: 1.15, y: 1.6, w: 2.5, h: 0.9, fontSize: 14, valign: "middle", objectName: "anim_1_f_okt" });
  R(s, 1.0, 2.65, 2.8, 0.65, { fill: "4A2321", line: RED, r: 0.06, n: "anim_2_f_ko" });
  T(s, "Si la date est dépassée : alerte « kit périmé », même sans réseau", { x: 1.15, y: 2.65, w: 2.55, h: 0.65, fontSize: 12, bold: true, color: RED, valign: "middle", objectName: "anim_2_f_kot" });
  R(s, 6.35, 1.3, 3.1, 2.4, { fill: "F1EEE3", line: WHITE, r: 0.06, n: "anim_3_f_st" });
  await I(s, fa.FaSnowflake, "2F6FA8", 6.55, 1.45, 0.4, "anim_3_f_sti");
  T(s, "PC sorti du froid ?", { x: 7.05, y: 1.45, w: 2.3, h: 0.4, fontSize: 15, bold: true, color: "1A1D24", valign: "middle", objectName: "anim_3_f_stt" });
  T(s, [{ text: "0 °C → attendre 20 min", options: { breakLine: true } }, { text: "−10 °C → attendre 35 min", options: { breakLine: true } }, { text: "avant d'allumer (buée)" }], { x: 6.55, y: 2.0, w: 2.8, h: 1.1, fontSize: 14, color: "1A1D24", objectName: "anim_3_f_stb" });
  T(s, "étiquette issue de la partie physique · exemple", { x: 6.55, y: 3.2, w: 2.8, h: 0.4, fontSize: 10, color: "5A6270", objectName: "anim_3_f_sts" });
  T(s, "Même sans réseau, le PC sait si son kit est encore valable. Et Lina sait combien de temps attendre avant de l'allumer.", { x: 0.6, y: 4.2, w: 8.8, h: 0.7, fontSize: 15, color: GREY, objectName: "anim_3_f~d300_c" });
  s.addNotes("14 heures, chez un client, pas de réseau. Le kit porte une date de validité inscrite dans le catalogue signé : le PC sait seul s'il est encore valable. Si la date est dépassée, Lina voit une alerte. Et sur le PC, une étiquette issue de l'expérience de physique lui dit combien de minutes attendre avant d'allumer un PC sorti du froid.");

  // ======================= 6. ARCHITECTURE ET AUTRES =======================
  s = section(5, "Architecture et réalisation", "Les briques, la sécurité, le réseau, la physique, la recette et le planning.", "5 · Architecture");
  s.addNotes("Dernière partie : comment c'est construit.");

  s = content("Sept briques sur la maquette du lycée", "5 · Architecture");
  const box = async (x, y, w, h, ic, title, sub, col) => {
    R(s, x, y, w, h, { fill: PANEL, line: col || LINE });
    await I(s, ic, col || BLUE, x + 0.15, y + 0.15, 0.36);
    T(s, title, { x: x + 0.6, y: y + 0.12, w: w - 0.7, h: 0.4, fontSize: 15, bold: true, valign: "middle" });
    T(s, sub, { x: x + 0.15, y: y + 0.55, w: w - 0.3, h: h - 0.6, fontSize: 11, color: GREY });
  };
  await box(0.4, 1.15, 2.4, 0.95, fa.FaUserTie, "Référent", "Windows 11 · PowerShell");
  await box(0.4, 2.45, 2.4, 0.95, fa.FaChartBar, "Tableau de bord", "navigateur · CSV pour Excel");
  await box(0.4, 3.75, 2.4, 0.95, fa.FaThermometerHalf, "Banc de mesure", "ESP32 · SHT40 · 2 × DS18B20", YEL);
  await box(3.7, 1.05, 2.4, 1.45, fa.FaServer, "Serveur", "Ubuntu 24.04 · nginx · Flask · SQLite · chrony · archive (V2)");
  await box(3.7, 3.1, 2.4, 0.9, fa.FaSignal, "Lien « 4G »", "tc netem sur le serveur");
  await box(7.1, 1.15, 2.4, 0.95, fa.FaIdCard, "Borne de sortie", "ESP32 · RC522 · LED · buzzer", YEL);
  await box(7.1, 3.1, 2.4, 0.9, fa.FaLaptop, "PC × 3", "Windows 11 · agent · BITS");
  L(s, 2.8, 1.6, 3.7, 1.6, { c: GREY }); T(s, "SFTP", { x: 2.85, y: 1.3, w: 0.8, h: 0.25, fontSize: 10, color: BLUE, fontFace: MONO });
  L(s, 4.9, 2.5, 4.9, 3.1, { c: GREY }); T(s, "HTTPS", { x: 4.98, y: 2.65, w: 0.8, h: 0.25, fontSize: 10, color: BLUE, fontFace: MONO });
  L(s, 6.1, 3.55, 7.1, 3.55, { c: GREY }); T(s, "BITS", { x: 6.3, y: 3.25, w: 0.8, h: 0.25, fontSize: 10, color: BLUE, fontFace: MONO });
  L(s, 7.1, 1.6, 6.1, 1.6, { c: GREY }); T(s, "HTTPS", { x: 6.3, y: 1.3, w: 0.8, h: 0.25, fontSize: 10, color: BLUE, fontFace: MONO });
  L(s, 3.7, 2.3, 2.8, 2.85, { c: GREY });
  L(s, 8.3, 2.1, 8.3, 3.1, { c: YEL, dash: true, arrow: false }); T(s, "étiquette RFID", { x: 8.4, y: 2.45, w: 1.2, h: 0.25, fontSize: 10, color: YEL });
  L(s, 2.8, 4.4, 8.3, 4.4, { c: YEL, dash: true, arrow: false }); L(s, 8.3, 4.4, 8.3, 4.0, { c: YEL, dash: true, arrow: false });
  T(s, "résultat : temps d'attente avant d'allumer un PC froid", { x: 3.3, y: 4.45, w: 4.6, h: 0.3, fontSize: 11, color: YEL, align: "center" });
  R(s, 2.85, 1.48, 0.22, 0.22, { fill: BLUE, r: 0.04, n: "anim_1_f~t100+m~0.65:0~t800~d100+x~t100~d950_p1" });
  R(s, 4.79, 2.55, 0.22, 0.22, { fill: BLUE, r: 0.04, n: "anim_1_f~t100~d1000+m~0:0.4~t700~d1100+x~t100~d1850_p2" });
  R(s, 6.15, 3.44, 0.22, 0.22, { fill: BLUE, r: 0.04, n: "anim_1_f~t100~d1900+m~0.7:0~t800~d2000+x~t100~d2850_p3" });
  R(s, 6.85, 3.44, 0.22, 0.22, { fill: GRN, r: 0.04, n: "anim_2_f~t100+m~-0.7:0~t800~d100+x~t100~d950_p4" });
  R(s, 6.85, 1.48, 0.22, 0.22, { fill: GRN, r: 0.04, n: "anim_2_f~t100~d1000+m~-0.7:0~t800~d1100+x~t100~d1950_p5" });
  s.addNotes("Les sept briques. Au centre, le serveur Ubuntu : nginx pour le HTTPS, Flask pour l'API, SQLite pour les données, chrony pour l'heure. Le référent publie, les PC téléchargent par le lien 4G simulé, envoient leur rapport, la borne interroge le serveur. Les deux montages ESP32 forment la partie physique. Clic 1 : le kit descend. Clic 2 : les rapports remontent.");

  s = content("Quatre tentatives, quatre refus", "5 · Architecture");
  const atk = [["Un fichier modifié", "un octet changé sur le serveur", "empreinte différente", "T02"], ["Un faux référent", "catalogue signé par un autre certificat", "certificat inconnu", "T03"], ["Le retour d'un ancien kit", "catalogue v11, bien signé", "11 n'est pas > 12", "T14"], ["Un faux rapport", "« à jour », sans le jeton du PC", "jeton absent", "T15"]];
  atk.forEach((a, i) => {
    const x = 0.5 + (i % 2) * 4.6, y = 1.15 + Math.floor(i / 2) * 1.85, n = `anim_${i + 1}_f_a${i}`;
    R(s, x, y, 4.4, 1.65, { fill: PANEL, n: n + "bg" });
    T(s, a[0], { x: x + 0.25, y: y + 0.15, w: 2.8, h: 0.4, fontSize: 16, bold: true, objectName: n + "t" });
    T(s, a[1], { x: x + 0.25, y: y + 0.6, w: 2.6, h: 0.4, fontSize: 13, color: GREY, objectName: n + "d" });
    T(s, "→ " + a[2], { x: x + 0.25, y: y + 1.05, w: 2.6, h: 0.4, fontSize: 13, color: YEL, objectName: n + "r" });
    T(s, a[3], { x: x + 3.55, y: y + 0.18, w: 0.7, h: 0.3, fontSize: 11, color: GREY, fontFace: MONO, align: "right", objectName: n + "id" });
    R(s, x + 2.95, y + 0.75, 1.25, 0.5, { fill: PANEL, line: RED, lw: 2, r: 0.06, rot: -8, n: `anim_${i + 1}_f~d400_st${i}` });
    T(s, "REFUSÉ", { x: x + 2.95, y: y + 0.75, w: 1.25, h: 0.5, fontSize: 15, bold: true, color: RED, align: "center", valign: "middle", rotate: -8, objectName: `anim_${i + 1}_f~d400_stt${i}` });
  });
  s.addNotes("La sécurité se prouve par des tests. Fichier modifié : refusé. Faux référent : refusé. Retour d'un ancien kit bien signé : refusé grâce au numéro de version. Faux rapport sans jeton : refusé, la borne reste rouge. Et une règle de code : rien de la liste rouge de la charte IA, ni setInsecure, ni contournement de certificat, ni mot de passe écrit dans le code.");

  s = content("Réseau (C10) : mesurer, reproduire, observer", "5 · Architecture");
  const col3 = [0.5, 3.6, 6.7];
  T(s, "1 · Mesurer", { x: col3[0], y: 1.15, w: 2.8, h: 0.4, fontSize: 17, bold: true, color: BLUE, objectName: "anim_1_f_m" });
  phone(s, col3[0] + 0.1, 1.7, 1.2, { n: "anim_1_f_mp" });
  T(s, [{ text: "débit", options: { breakLine: true } }, { text: "latence", options: { breakLine: true } }, { text: "pertes" }], { x: col3[0] + 1.0, y: 1.8, w: 1.8, h: 1.0, fontSize: 15, objectName: "anim_1_f_mt" });
  T(s, "un vrai partage de connexion, avec le téléphone, lors de la visite", { x: col3[0], y: 3.1, w: 2.8, h: 0.7, fontSize: 12, color: GREY, objectName: "anim_1_f_ms" });
  T(s, "2 · Reproduire", { x: col3[1], y: 1.15, w: 2.8, h: 0.4, fontSize: 17, bold: true, color: YEL, objectName: "anim_2_f_r" });
  R(s, col3[1], 1.7, 2.85, 1.25, { fill: "0A0B0D", line: LINE, n: "anim_2_f_rb" });
  T(s, "$ sudo tc qdisc add dev eth0 root netem delay 80ms loss 1% rate 5mbit", { x: col3[1] + 0.12, y: 1.78, w: 2.6, h: 1.1, fontSize: 11, fontFace: MONO, color: GRN, objectName: "anim_2_f_rc" });
  T(s, "une commande sur le serveur, rien à configurer sur le réseau du lycée", { x: col3[1], y: 3.1, w: 2.8, h: 0.7, fontSize: 12, color: GREY, objectName: "anim_2_f_rs" });
  T(s, "3 · Observer", { x: col3[2], y: 1.15, w: 2.8, h: 0.4, fontSize: 17, bold: true, color: GRN, objectName: "anim_3_f_o" });
  R(s, col3[2], 1.7, 2.8, 1.25, { fill: PANEL, line: LINE, n: "anim_3_f_ob" });
  ["TLS Client Hello", "GET … Range: bytes=21000000-", "206 Partial Content"].forEach((l, i) =>
    T(s, l, { x: col3[2] + 0.12, y: 1.8 + i * 0.36, w: 2.6, h: 0.32, fontSize: 11, fontFace: MONO, color: [BLUE, WHITE, GRN][i], objectName: `anim_3_f~d${i * 300}_ol${i}` }));
  T(s, "captures Wireshark : la reprise après coupure, en vrai", { x: col3[2], y: 3.1, w: 2.8, h: 0.7, fontSize: 12, color: GREY, objectName: "anim_3_f_os" });
  ["DHCP", "DNS", "NTP", "HTTPS", "BITS", "SFTP"].forEach((p, i) => chip(s, 0.5 + i * 1.18, 4.0, p, BLUE, "anim_4_f~d" + i * 120 + "_ch" + i, 1.0));
  T(s, "On exploite le réseau en place. Configurer VLAN ou ACL relève de l'épreuve E5.", { x: 0.5, y: 4.55, w: 9.0, h: 0.4, fontSize: 13, color: GREY, objectName: "anim_4_f~d800_e5" });
  s.addNotes("Pour C10, Aziza exploite le réseau existant. Elle mesure la vraie 4G avec son téléphone, reproduit ces valeurs avec une seule commande netem sur le serveur, et observe les échanges dans Wireshark : la poignée de main TLS, les requêtes Range et les réponses 206 de la reprise. Elle ne configure ni routeur ni switch : c'est le domaine de l'E5.");

  s = content("La partie physique : deux montages ESP32", "5 · Architecture");
  R(s, 0.5, 1.15, 3.6, 1.6, { fill: PANEL });
  await I(s, fa.FaIdCard, YEL, 0.7, 1.32, 0.4);
  T(s, "Borne de sortie", { x: 1.25, y: 1.3, w: 2.7, h: 0.45, fontSize: 16, bold: true, valign: "middle" });
  T(s, "ESP32 · lecteur RC522 (SPI, 3,3 V) · badge · étiquette anti-métal · LED 220 Ω · buzzer", { x: 0.7, y: 1.85, w: 3.25, h: 0.8, fontSize: 12, color: GREY });
  R(s, 0.5, 2.95, 3.6, 1.95, { fill: PANEL });
  await I(s, fa.FaThermometerHalf, YEL, 0.7, 3.12, 0.4);
  T(s, "Banc de mesure", { x: 1.25, y: 3.1, w: 2.7, h: 0.45, fontSize: 16, bold: true, valign: "middle" });
  T(s, "ESP32 · SHT40 (I²C) · 2 × DS18B20 (1-Wire) · étalonnage eau + glace · incertitudes", { x: 0.7, y: 3.65, w: 3.25, h: 0.6, fontSize: 12, color: GREY });
  T(s, "t = τ · ln[(T₀ − Tₐ)/(T_d − Tₐ)]", { x: 0.7, y: 4.3, w: 3.3, h: 0.4, fontSize: 14, color: YEL, italic: true });
  const tt = [], tp = [], td = [];
  for (let t = 0; t <= 80; t += 5) { tt.push(String(t)); tp.push(+(20 - 20 * Math.exp(-t / 22)).toFixed(2)); td.push(9.3); }
  s.addChart(pres.charts.LINE, [{ name: "PC (modèle)", labels: tt, values: tp }, { name: "point de rosée", labels: tt, values: td }], {
    x: 4.4, y: 1.15, w: 5.1, h: 3.4, chartColors: [BLUE, PUR], lineSize: 3, lineDataSymbol: "none",
    showLegend: true, legendPos: "b", legendColor: WHITE, legendFontSize: 11, legendFontFace: "+mn-lt",
    catAxisLabelColor: GREY, valAxisLabelColor: GREY, catAxisLabelFontSize: 10, valAxisLabelFontSize: 10, catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt",
    valAxisMinVal: 0, valAxisMaxVal: 22, valAxisMajorUnit: 5, valGridLine: { color: "2A2E36", size: 0.75 }, catGridLine: { style: "none" },
    showValAxisTitle: true, valAxisTitle: "°C", valAxisTitleColor: GREY, valAxisTitleFontSize: 11, showCatAxisTitle: true, catAxisTitle: "minutes", catAxisTitleColor: GREY, catAxisTitleFontSize: 11,
    catAxisLineShow: false, valAxisLineShow: false, plotArea: { fill: { color: BG } }, showTitle: true, title: "PC sorti à 0 °C, pièce à 20 °C / 50 % (exemple, τ = 22 min)", titleColor: WHITE, titleFontSize: 12, titleFontFace: "+mn-lt",
  });
  T(s, "Sous la ligne violette, la buée peut se former. Ici : attendre au moins 14 min, puis ajouter une marge.", { x: 4.4, y: 4.6, w: 5.1, h: 0.5, fontSize: 12, color: GREY });
  s.addNotes("La partie physique, ce sont deux montages ESP32. La borne : lecteur RFID en SPI, alimenté en 3,3 volts, LED protégées par des résistances de 220 ohms. Le banc : trois capteurs pour répondre à une question de terrain, combien de minutes attendre avant d'allumer un PC sorti du froid. Modèle de Newton, point de rosée par la formule de Magnus, étalonnage dans l'eau avec de la glace, incertitudes. Tout le détail est dans la page web de la partie physique. Les valeurs sont des exemples.");

  s = content("Quinze tests écrits avant le code", "5 · Architecture");
  const tests = [["T01", "seuls les fichiers modifiés", "v1"], ["T02", "un octet modifié → refusé", "v1"], ["T03", "autre certificat → refusé", "v1"], ["T04", "coupure → reprise", "v1"], ["T05", "retour arrière < 2 min", "v1"],
    ["T06", "borne verte", "v1"], ["T07", "borne rouge", "v1"], ["T08", "serveur arrêté → « impossible »", "v1"], ["T09", "kit périmé hors réseau", "v1"], ["T10", "liste rouge IA : 0", "v1"],
    ["T14", "ancien kit signé → refusé", "v1n"], ["T15", "rapport sans jeton → refusé", "v1n"], ["T11", "ancienne version < 1 min", "v2"], ["T12", "proposition refusée", "ext"], ["T13", "proposition validée", "ext"]];
  tests.forEach((t, i) => {
    const x = 0.5 + (i % 5) * 1.82, y = 1.15 + Math.floor(i / 5) * 1.12, col = t[2] === "v2" ? BLUE : t[2] === "ext" ? GREY : GRN;
    const n = `anim_${Math.floor(i / 5) + 1}_f~d${(i % 5) * 120}_t${i}`;
    R(s, x, y, 1.7, 0.98, { fill: PANEL, line: t[2] === "v1n" ? YEL : PANEL, lw: 1.5, n: n + "bg" });
    T(s, t[0], { x: x + 0.12, y: y + 0.08, w: 0.7, h: 0.3, fontSize: 14, bold: true, color: col, fontFace: MONO, objectName: n + "id" });
    T(s, t[2] === "v2" ? "V2" : t[2] === "ext" ? "ext." : "V1", { x: x + 0.9, y: y + 0.1, w: 0.68, h: 0.26, fontSize: 10, color: col, align: "right", objectName: n + "v" });
    T(s, t[1], { x: x + 0.12, y: y + 0.42, w: 1.5, h: 0.5, fontSize: 12, objectName: n + "d" });
  });
  T(s, "Encadré jaune : tests ajoutés pour fermer deux failles (rejeu d'un ancien kit, faux rapport).", { x: 0.5, y: 4.62, w: 9.0, h: 0.35, fontSize: 12, color: GREY });
  s.addNotes("Chaque test a un résultat attendu et une preuve : capture, journal ou mesure. Ils sont écrits avant le code, comme le demande la charte IA. T14 et T15 ont été ajoutés après la revue critique pour fermer deux failles.");

  s = content("136 heures prévues sur 150", "5 · Architecture");
  R(s, 0.5, 1.2, 116 / 150 * 9, 0.6, { fill: GRN, round: false, n: "anim_1_w~t1200_h1" });
  T(s, "V1 obligatoire · 116 h", { x: 0.65, y: 1.2, w: 4, h: 0.6, fontSize: 15, bold: true, color: BG, valign: "middle", objectName: "anim_1_f~d1200_h1t" });
  R(s, 0.5 + 116 / 150 * 9, 1.2, 20 / 150 * 9, 0.6, { fill: BLUE, round: false, n: "anim_1_w~t500~d1300_h2" });
  T(s, "V2 · 20 h", { x: 0.5 + 116 / 150 * 9, y: 1.2, w: 20 / 150 * 9, h: 0.6, fontSize: 13, bold: true, color: BG, align: "center", valign: "middle", objectName: "anim_1_f~d1800_h2t" });
  R(s, 0.5 + 136 / 150 * 9, 1.2, 14 / 150 * 9, 0.6, { fill: PANEL2, line: LINE, round: false, n: "anim_1_f~d1900_h3" });
  T(s, "marge", { x: 0.5 + 136 / 150 * 9, y: 1.2, w: 14 / 150 * 9, h: 0.6, fontSize: 11, color: GREY, align: "center", valign: "middle", objectName: "anim_1_f~d1900_h3t" });
  const months = ["janv.", "févr.", "mars", "avril", "mai", "juin"];
  months.forEach((m, i) => T(s, m, { x: 2.6 + i * 1.15, y: 2.1, w: 1.1, h: 0.3, fontSize: 12, color: GREY, align: "center" }));
  const gantt = [["Serveur, catalogue", 0, GRN], ["Agent PowerShell", 1, GRN], ["Borne, banc", 2, GRN], ["Recette V1 · revue 2", 3, YEL], ["V2, dossier", 4, BLUE], ["Soutenance", 5, WHITE]];
  gantt.forEach((g, i) => {
    const y = 2.5 + i * 0.4, n = `anim_2_f~d${i * 200}_g${i}`;
    T(s, g[0], { x: 0.5, y, w: 2.0, h: 0.3, fontSize: 13, valign: "middle", objectName: n + "t" });
    R(s, 2.62 + g[1] * 1.15, y + 0.03, 1.06, 0.24, { fill: g[2], r: 0.05, n: n + "b" });
  });
  T(s, "Extensions si le temps le permet : propositions des techniciens, boîtier de sacoche, lien SharePoint réel.", { x: 0.5, y: 4.95 - 0.1, w: 9.0, h: 0.3, fontSize: 12, color: GREY, objectName: "anim_3_f_ext" });
  s.addNotes("V1 obligatoire : 116 heures, avec une IA encadrée. V2, l'archive : 20 heures. Il reste 14 heures de marge. La revue d'avril donne le feu vert pour la V2 si la recette V1 est passée. L'IA accélère le code, pas le câblage, ni les mesures, ni la recette.");

  s = content("Limites assumées et suite", "5 · Architecture");
  R(s, 0.5, 1.15, 4.35, 3.6, { fill: PANEL });
  await I(s, fa.FaExclamationTriangle, YEL, 0.75, 1.35, 0.4);
  T(s, "Ce que le projet ne fait pas", { x: 1.3, y: 1.35, w: 3.4, h: 0.4, fontSize: 16, bold: true, valign: "middle" });
  T(s, [
    { text: "Aucun accès aux systèmes du réseau électrique", options: { bullet: true, breakLine: true } },
    { text: "Maquette au lycée, données fictives", options: { bullet: true, breakLine: true } },
    { text: "Le badge identifie, il ne prouve rien", options: { bullet: true, breakLine: true } },
    { text: "L'archive aide à retrouver, ne remplace pas l'original", options: { bullet: true } },
  ], { x: 0.75, y: 1.95, w: 3.9, h: 2.6, fontSize: 14, paraSpaceAfter: 8 });
  R(s, 5.15, 1.15, 4.35, 3.6, { fill: PANEL });
  await I(s, fa.FaRoute, BLUE, 5.4, 1.35, 0.4);
  T(s, "Pour un vrai déploiement", { x: 5.95, y: 1.35, w: 3.4, h: 0.4, fontSize: 16, bold: true, valign: "middle" });
  T(s, [
    { text: "Accord de la direction informatique", options: { bullet: true, breakLine: true } },
    { text: "Information des salariés et avis du CSE (Code du travail)", options: { bullet: true, breakLine: true } },
    { text: "Aucune destruction d'original sans visa (archives)", options: { bullet: true, breakLine: true } },
    { text: "Lien réel avec SharePoint (Microsoft Graph)", options: { bullet: true } },
  ], { x: 5.4, y: 1.95, w: 3.9, h: 2.6, fontSize: 14, paraSpaceAfter: 8 });
  s.addNotes("Être clair sur les limites rassure le jury. Le projet ne touche à aucun système du réseau électrique. Le badge enregistre une sortie, il ne sécurise pas un accès. Pour un vrai déploiement : accord de la DSI, information des salariés et consultation du CSE, articles L1222-4 et L2312-38 du Code du travail, et respect des règles d'archives publiques.");

  // ======================= CONCLUSION =======================
  pres.addSection({ title: "Conclusion" });
  s = pres.addSlide({ masterName: "TITRE", sectionTitle: "Conclusion" });
  T(s, [{ text: "Un PC peut-il prouver qu'il est à jour ? " }, { text: "Oui.", options: { color: YEL } }], { x: 0.6, y: 0.85, w: 8.8, h: 1.25, fontSize: 32, align: "center", valign: "middle" });
  const chain = [["empreinte", "le bon fichier"], ["signature", "du bon référent"], ["rapport", "avec le jeton du PC"], ["borne", "vérifie avant le départ"]];
  chain.forEach((c, i) => {
    const x = 0.7 + i * 2.25, n = `anim_1_f~d${i * 400}_ch${i}`;
    R(s, x, 2.4, 1.85, 1.1, { fill: PANEL, line: [BLUE, BLUE, GRN, GRN][i], n: n + "b" });
    T(s, c[0], { x, y: 2.5, w: 1.85, h: 0.45, fontSize: 18, bold: true, align: "center", color: [BLUE, BLUE, GRN, GRN][i], objectName: n + "t" });
    T(s, c[1], { x: x + 0.1, y: 2.95, w: 1.65, h: 0.45, fontSize: 12, align: "center", color: GREY, objectName: n + "s" });
    if (i < 3) L(s, x + 1.9, 2.95, x + 2.2, 2.95, { c: GREY, n: n + "a" });
  });
  T(s, "Merci. Place aux questions.", { x: 0.6, y: 4.1, w: 8.8, h: 0.5, fontSize: 20, align: "center", color: GREY, objectName: "anim_2_f_end" });
  s.addNotes("Retour à la question de départ. Oui, un PC peut prouver qu'il est à jour : l'empreinte prouve le bon fichier, la signature prouve le bon référent, le rapport avec jeton prouve l'état du PC, et la borne vérifie tout cela avant le départ.");

  await pres.writeFile({ fileName: "deck_brut.pptx" });
  console.log("écrit : deck_brut.pptx");
})().catch((e) => { console.error(e); process.exit(1); });
