// Présentation E6 de Wassim, style « tableau noir mathématique » (fond sombre, serif, bleu / jaune / vert / rouge).
// node build.js  →  deck_brut.pptx, puis apply_theme, puis python animate.py deck_brut.pptx Projet_E6_Wassim_3b1b.pptx
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
  pres.title = "Projet E6 – Diagnostic à distance des imprimantes : valorisation des données et ticket enrichi";
  pres.author = "Wassim – BTS CIEL option A";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };

  const FOOT = "Projet E6 · Wassim · BTS CIEL option A · maquette au lycée, données fictives";
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


  // ---------- aides propres à ce projet ----------
  const A = (clic, d, id) => `anim_${clic}_f~d${d}_${id}`;
  // imprimante dessinée : corps, bac, sortie, petit écran
  function printer(s, x, y, w, o = {}) {
    const h = w * 0.62;
    R(s, x, y + h * 0.2, w, h * 0.8, { fill: "22262E", line: o.line || LINE, r: 0.06, n: nm(o.n, "f") });
    R(s, x + w * 0.12, y, w * 0.76, h * 0.28, { fill: "2B3038", line: LINE, r: 0.04, n: nm(o.n, "t") });
    R(s, x + w * 0.1, y + h * 0.62, w * 0.8, h * 0.08, { fill: "0C0D10", round: false, n: nm(o.n, "s") });
    R(s, x + w * 0.7, y + h * 0.36, w * 0.2, h * 0.14, { fill: o.scr || "1A2A33", round: false, n: nm(o.n, "e") });
    if (o.label) T(s, o.label, { x: x - 0.3, y: y + h + 0.06, w: w + 0.6, h: 0.28, align: "center", fontSize: o.lfs || 12, color: GREY, objectName: nm(o.n, "l") });
    return { x, y, w, h };
  }
  const card = (s, x, y, w, h, title, body, col, n, bs) => {
    R(s, x, y, w, h, { fill: PANEL, line: col, lw: 1.5, n: n + "b" });
    T(s, title, { x: x + 0.12, y: y + 0.1, w: w - 0.24, h: 0.4, fontSize: 15, bold: true, color: col, objectName: n + "t" });
    T(s, body, { x: x + 0.12, y: y + 0.55, w: w - 0.24, h: h - 0.62, fontSize: bs || 13, color: WHITE, objectName: n + "c" });
  };
  const bullets = (s, x, y, w, lines, step, fs, gap) => lines.forEach((l, i) =>
    T(s, l, { x, y: y + i * (gap || 0.5), w, h: (gap || 0.5) - 0.05, fontSize: fs || 15, objectName: A(step + i, 0, "b" + i) }));

  // ======================= 1. TITRE =======================
  pres.addSection({ title: "Ouverture" });
  let s = pres.addSlide({ masterName: "TITRE", sectionTitle: "Ouverture" });
  T(s, "BTS CIEL option A · Épreuve E6 · Session 2027", { x: 0.6, y: 0.55, w: 6, h: 0.3, fontSize: 12, color: GREY });
  T(s, [{ text: "Faut-il " }, { text: "se déplacer", options: { color: YEL } }, { text: " ?" }], { x: 0.6, y: 1.25, w: 5.6, h: 1.2, fontSize: 44 });
  T(s, "Diagnostic à distance des imprimantes : valorisation des données et ticket enrichi", { x: 0.6, y: 2.75, w: 5.4, h: 1.0, fontSize: 17, color: GREY });
  T(s, "Wassim · apprenti · besoin issu du service, réalisation au lycée sur maquette", { x: 0.6, y: 4.55, w: 8.6, h: 0.3, fontSize: 12, color: GREY });
  printer(s, 6.5, 1.5, 2.8, { label: "« Elle ne marche pas »" });
  T(s, "?", { x: 7.5, y: 3.35, w: 0.8, h: 0.8, fontSize: 48, bold: true, color: YEL, align: "center", objectName: A(1, 0, "q") });
  s.addNotes("Ouvrir par la question que Wassim se pose au quotidien : un ticket dit « l'imprimante ne marche pas ». Faut-il se déplacer ? Tout le projet sert à répondre avant de partir.");

  // ======================= 2. PROBLÈME =======================
  s = section(1, "Le problème", "Partir de ce que Wassim vit au service informatique.", "1 · Le problème");
  s.addNotes("Première partie : le problème, tel que l'apprenti l'a décrit. Ces faits sont rapportés par l'apprenti : le tuteur doit les confirmer.");

  s = content("Un ticket, quatre chemins, une seule phrase", "1 · Le problème");
  const CAN = [[fa.FaTicketAlt, "GLPI", 1.2], [fa.FaPhone, "téléphone", 2.0], [fa.FaEnvelope, "mail", 2.8], [fa.FaComments, "chat GLPI", 3.6]];
  for (let i = 0; i < 4; i++) {
    await I(s, CAN[i][0], BLUE, 0.8, CAN[i][2], 0.5, A(1, i * 300, "ci" + i));
    T(s, CAN[i][1], { x: 1.5, y: CAN[i][2] + 0.08, w: 1.8, h: 0.35, fontSize: 15, color: BLUE, objectName: A(1, i * 300, "ct" + i) });
    L(s, 3.1, CAN[i][2] + 0.25, 4.2, 2.65, { c: GREY, n: A(2, i * 150, "ca" + i) });
  }
  R(s, 4.3, 2.1, 1.7, 1.1, { fill: PANEL, line: GRN, lw: 1.5, n: A(2, 600, "gb") });
  T(s, "GLPI", { x: 4.3, y: 2.1, w: 1.7, h: 1.1, fontSize: 22, bold: true, color: GRN, align: "center", valign: "middle", objectName: A(2, 600, "gt") });
  L(s, 6.05, 2.65, 6.75, 2.65, { c: GREY, n: A(3, 0, "ga") });
  R(s, 6.8, 1.9, 2.7, 1.5, { fill: PANEL2, line: RED, lw: 1.5, n: A(3, 200, "tb") });
  T(s, "« L'imprimante ne marche pas. »", { x: 6.95, y: 2.1, w: 2.4, h: 0.7, fontSize: 16, color: WHITE, objectName: A(3, 200, "tt") });
  T(s, "cause : ?", { x: 6.95, y: 2.85, w: 2.4, h: 0.4, fontSize: 16, bold: true, color: RED, objectName: A(3, 600, "tc") });
  T(s, "Les agents appellent, écrivent ou passent par le chat. Dans tous les cas, le ticket ne dit pas pourquoi.", { x: 0.6, y: 4.3, w: 8.8, h: 0.7, fontSize: 16, color: YEL, objectName: A(4, 0, "bas") });
  s.addNotes("Les tickets arrivent par GLPI, mais aussi par téléphone, par mail ou par le chat de GLPI. Quel que soit le chemin, le ticket ne contient que la phrase de l'utilisateur. La cause est inconnue. Fait rapporté par l'apprenti, à confirmer par le tuteur.");

  s = content("Un déplacement pour rien", "1 · Le problème");
  laptop(s, 0.7, 1.6, 1.9, { t: "?", fs: 36, tc: YEL, bold: true, label: "PC du bureau" });
  printer(s, 4.3, 1.9, 1.8, { label: "imprimante en bon état" });
  L(s, 2.7, 2.7, 4.3, 2.7, { c: GREY, arrow: false, n: A(1, 0, "cab") });
  T(s, "câble USB", { x: 2.9, y: 2.35, w: 1.3, h: 0.3, fontSize: 12, color: GREY, objectName: A(1, 0, "cabt") });
  await I(s, fa.FaPhone, BLUE, 8.3, 1.4, 0.5, A(2, 0, "ph"));
  T(s, "« Elle ne marche pas »", { x: 7.5, y: 1.95, w: 2.1, h: 0.5, fontSize: 13, color: BLUE, align: "center", objectName: A(2, 200, "pht") });
  await I(s, fa.FaWalking, YEL, 7.9, 3.1, 0.6, "anim_3_f~t200+m~-3.3:0~t1800~d300_w");
  T(s, "Wassim se déplace", { x: 6.9, y: 3.8, w: 2.4, h: 0.3, fontSize: 13, color: YEL, objectName: A(3, 300, "wt") });
  L(s, 2.7, 2.7, 4.3, 2.7, { c: RED, dash: true, arrow: false, n: A(4, 0, "cabx") });
  chip(s, 2.9, 3.05, "débranché", RED, A(4, 200, "chp"), 1.2);
  T(s, "L'imprimante marche. Le câble n'est pas branché au PC. Déplacement inutile.", { x: 0.6, y: 4.45, w: 8.8, h: 0.6, fontSize: 16, color: RED, objectName: A(5, 0, "res") });
  s.addNotes("Cas décrit par Wassim : il se déplace pour un dépannage d'imprimante, et c'est seulement la prise qui n'est pas branchée au PC. Il se déplace pour rien. C'est le cœur du besoin : un indicateur à mesurer sera donc le nombre de déplacements évités. Le chiffre réel est à demander au tuteur.");

  s = content("Personne ne voit les imprimantes avant l'appel", "1 · Le problème");
  const IMP = [["réseau", fa.FaNetworkWired, 0.8], ["Wi-Fi", fa.FaWifi, 3.5], ["USB", fa.FaUsb, 6.2]];
  IMP.forEach((m, i) => {
    R(s, m[2], 1.3, 2.5, 1.9, { fill: PANEL, line: LINE, n: A(1, i * 400, "k" + i) });
    printer(s, m[2] + 0.3, 1.55, 1.1, { n: A(1, i * 400, "p" + i) });
    T(s, m[0], { x: m[2] + 1.45, y: 1.55, w: 1.0, h: 0.4, fontSize: 16, bold: true, color: BLUE, objectName: A(1, i * 400, "kt" + i) });
  });
  T(s, "adresse IP", { x: 0.9, y: 2.75, w: 2.3, h: 0.3, fontSize: 13, color: GRN, align: "center", objectName: A(2, 0, "ip0") });
  T(s, "adresse IP", { x: 3.6, y: 2.75, w: 2.3, h: 0.3, fontSize: 13, color: GRN, align: "center", objectName: A(2, 150, "ip1") });
  T(s, "pas d'adresse IP", { x: 6.3, y: 2.75, w: 2.3, h: 0.3, fontSize: 13, color: RED, align: "center", objectName: A(2, 300, "ip2") });
  bullets(s, 0.7, 3.5, 8.8, [
    "Pas de supervision centralisée des imprimantes dans le service (dit Wassim, à confirmer).",
    "Même avec une supervision, une imprimante en USB resterait invisible : elle n'a pas d'adresse.",
  ], 3, 15, 0.65);
  s.addNotes("Trois façons de brancher une imprimante : en réseau filaire, en Wi-Fi, ou en USB au PC. Wassim a parlé de Bluetooth ; le Wi-Fi est plus probable, c'est à confirmer. Les deux premières ont une adresse IP, donc on peut les interroger. L'USB n'en a pas : seul le PC voit la panne. Et dans le service, il n'y a pas de supervision centralisée des imprimantes, selon Wassim.");

  // ======================= 3. EXISTANT =======================
  s = section(2, "Ce qui existe déjà", "Ce que chaque outil fait bien, et ce qui lui manque.", "2 · L'existant");
  s.addNotes("Deuxième partie : on ne part pas de zéro. Chaque outil a un vrai intérêt.");

  s = content("De bons outils. Aucun ne compare.", "2 · L'existant");
  const EX = [
    ["Page web de l'imprimante", "état, encre", "une à la fois ; peut dire « ça va » alors qu'elle est figée", "p"],
    ["Supervision (Zabbix…)", "toutes les imprimantes réseau", "absente du service ; ne voit pas l'USB ; ne regarde pas le PC", "n"],
    ["Prise en main à distance", "voir le PC", "mêmes vérifications à la main, ticket après ticket", "p"],
    ["GLPI", "suivi des tickets", "le ticket ne contient que la phrase de l'utilisateur", "p"],
  ];
  T(s, "Outil", { x: 0.6, y: 1.1, w: 2.4, h: 0.3, fontSize: 12, bold: true, color: GREY });
  T(s, "Ce qu'il fait bien", { x: 3.1, y: 1.1, w: 2.2, h: 0.3, fontSize: 12, bold: true, color: GREY });
  T(s, "Ce qui manque", { x: 5.4, y: 1.1, w: 4, h: 0.3, fontSize: 12, bold: true, color: GREY });
  EX.forEach((r, i) => {
    const y = 1.5 + i * 0.85, n = A(i + 1, 0, "e" + i);
    R(s, 0.5, y, 9.0, 0.75, { fill: PANEL, line: LINE, n: n + "b" });
    T(s, r[0], { x: 0.6, y: y + 0.05, w: 2.4, h: 0.65, fontSize: 14, bold: true, color: BLUE, valign: "middle", objectName: n + "o" });
    T(s, r[1], { x: 3.1, y: y + 0.05, w: 2.2, h: 0.65, fontSize: 13, color: GRN, valign: "middle", objectName: n + "f" });
    T(s, r[2], { x: 5.4, y: y + 0.05, w: 4.0, h: 0.65, fontSize: 13, color: WHITE, valign: "middle", objectName: n + "m" });
  });
  T(s, "Ce qui manque partout : comparer ce que dit l'imprimante, ce que mesure un capteur, et ce que voit le PC.", { x: 0.6, y: 4.95, w: 8.8, h: 0.35, fontSize: 14, color: YEL, objectName: A(5, 0, "cl") });
  s.addNotes("Aucun outil ne croise les sources. La page web ne voit qu'une imprimante. La supervision, si elle existait, ne verrait que les imprimantes réseau et ne regarde pas le PC. La prise en main à distance fait refaire les mêmes vérifications. GLPI garde le ticket mais ne le complète pas. Le jury peut demander pourquoi ne pas installer Zabbix : la réponse est qu'il ne verrait pas l'USB et ne ferait pas la comparaison.");

  // ======================= 4. SOLUTION =======================
  s = section(3, "La solution de Wassim", "Cinq principes, chacun répond à un fait du problème.", "3 · La solution");
  s.addNotes("Troisième partie : la solution, brique par brique.");

  s = content("Principe 1 · Quatre témoins valent mieux qu'un", "3 · La solution");
  const TEM = [["Vibration", "boîtier ESP32 : elle travaille ?", BLUE], ["Compteur", "SNMP : les pages avancent ?", BLUE], ["État", "SNMP : prêt, bourrage, bac vide", GRN], ["PC", "PowerShell JEA : il la voit ?", YEL]];
  TEM.forEach((t, i) => card(s, 0.5 + i * 2.3, 1.3, 2.1, 1.9, t[0], t[1], t[2], A(i + 1, 0, "t" + i)));
  T(s, [{ text: "Un seul témoin peut se tromper. " }, { text: "Le serveur compare les quatre.", options: { color: YEL } }], { x: 0.6, y: 3.6, w: 8.8, h: 0.5, fontSize: 18, objectName: A(5, 0, "bas") });
  T(s, "Pour une imprimante en USB, seul le PC répond : il devient le témoin principal.", { x: 0.6, y: 4.3, w: 8.8, h: 0.5, fontSize: 14, color: GREY, objectName: A(6, 0, "usb") });
  s.addNotes("Premier principe. La vibration dit si la machine travaille. Le compteur de pages dit si des pages sortent. L'état dit ce que l'imprimante déclare. Le PC dit s'il voit l'imprimante et si des documents attendent. Le compteur remplace le capteur de feuilles, repoussé en V2.");

  s = content("Principe 2 · On croise : la cause apparaît", "3 · La solution");
  const CR = [
    ["Tout va bien", "oui", "+5", "prête", "vue", GRN, "aucun ticket"],
    ["Figée", "non", "0", "« ça va »", "vue", RED, "figée : l'état est contredit"],
    ["Câble débranché", "non", "—", "pas de SNMP (USB)", "absente", YEL, "vérifier le câble"],
  ];
  ["Cas", "Vibration", "Compteur", "État", "PC", "Conclusion"].forEach((h, i) =>
    T(s, h, { x: [0.5, 2.2, 3.4, 4.5, 6.4, 7.5][i], y: 1.1, w: 1.7, h: 0.3, fontSize: 12, bold: true, color: GREY }));
  CR.forEach((r, i) => {
    const y = 1.5 + i * 0.95, n = A(i + 1, 0, "r" + i);
    R(s, 0.4, y, 9.2, 0.8, { fill: PANEL, line: r[5], lw: 1.5, n: n + "b" });
    [r[0], r[1], r[2], r[3], r[4]].forEach((v, k) =>
      T(s, v, { x: [0.5, 2.2, 3.4, 4.5, 6.4][k], y: y + 0.05, w: [1.7, 1.2, 1.1, 1.9, 1.0][k], h: 0.7, fontSize: 13, color: k === 0 ? r[5] : WHITE, bold: k === 0, valign: "middle", objectName: n + "v" + k }));
    T(s, r[6], { x: 7.5, y: y + 0.05, w: 2.0, h: 0.7, fontSize: 13, bold: true, color: r[5], valign: "middle", objectName: n + "c" });
  });
  T(s, "Si un témoin manque, le ticket dit « diagnostic incomplet ». Une mesure absente n'est jamais comptée comme zéro.", { x: 0.6, y: 4.5, w: 8.8, h: 0.6, fontSize: 14, color: YEL, objectName: A(4, 0, "bas") });
  s.addNotes("Deuxième principe : le croisement. Imprimante figée : elle dit « ça va », mais rien ne vibre et le compteur n'avance pas. Câble débranché : le PC ne voit plus l'imprimante, il n'y a pas de SNMP en USB, donc la cause probable est le branchement. On écrit « cause probable », pas « l'imprimante est en bon état », car en USB le boîtier ne peut pas le prouver au repos.");

  s = content("Principe 3 · La sonde interroge, sans rien modifier", "3 · La solution");
  const SO = [["1", "Réseau", "ping, ports 9100 et 631"], ["2", "SNMP", "état, compteur, consommables"], ["3", "Profil", "HP, Konica Minolta, générique"], ["4", "PC", "JEA, liste fermée"], ["5", "Résultat", "court, daté, qualité"]];
  SO.forEach((m, i) => {
    const x = 0.45 + i * 1.82, n = A(i + 1, 0, "m" + i);
    R(s, x, 1.5, 1.65, 1.8, { fill: PANEL, line: i === 4 ? GRN : BLUE, lw: 1.5, n: n + "b" });
    T(s, m[0], { x, y: 1.55, w: 1.65, h: 0.45, fontSize: 22, bold: true, color: YEL, align: "center", objectName: n + "n" });
    T(s, m[1], { x, y: 2.05, w: 1.65, h: 0.35, fontSize: 15, bold: true, color: i === 4 ? GRN : BLUE, align: "center", objectName: n + "t" });
    T(s, m[2], { x: x + 0.1, y: 2.45, w: 1.45, h: 0.8, fontSize: 12, color: WHITE, align: "center", objectName: n + "c" });
  });
  bullets(s, 0.7, 3.6, 8.8, [
    "Lecture seule : aucune écriture, aucun redémarrage en V1.",
    "Le profil est choisi d'après la description de l'appareil. Chaque lecture a un délai d'expiration.",
  ], 6, 14, 0.6);
  s.addNotes("Troisième principe : la sonde. C'est le programme que Wassim écrit lui-même. Elle teste le réseau, lit le SNMP, choisit un profil par marque, interroge le PC par JEA, et rend un résultat court avec la date et la qualité de chaque mesure. Les modèles ne renvoient pas tous les mêmes informations, d'où les profils. Une mesure absente reste inconnue : jamais zéro. Une panne d'une source ne bloque pas les autres.");

  s = content("Principe 4 · Le ticket arrive avec sa cause", "3 · La solution");
  R(s, 0.6, 1.2, 5.2, 2.9, { fill: "0C0D10", line: LINE, n: A(1, 0, "tb") });
  const TK = [["GLPI · nouveau ticket · imprimante CARDIO-01", WHITE], ["Vibration : non · Compteur : — · PC : absente", GREY], ["Cause probable : imprimante absente du PC (USB non détecté)", YEL], ["Niveau 1 : demander de vérifier le câble USB", GRN], ["Niveau 2 : si toujours absente après 10 min, déplacement", GRN]];
  TK.forEach((l, i) => T(s, l[0], { x: 0.75, y: 1.35 + i * 0.52, w: 4.95, h: 0.5, fontSize: 12, fontFace: MONO, color: l[1], objectName: A(1 + i, 0, "tk" + i) }));
  await I(s, fa.FaPrint, BLUE, 6.4, 1.3, 0.5, A(6, 0, "pi"));
  T(s, "Le boîtier affiche : « Vérifiez le câble »", { x: 6.2, y: 1.95, w: 3.3, h: 0.6, fontSize: 14, color: BLUE, objectName: A(6, 0, "pt") });
  T(s, "L'utilisateur est informé sur place. Wassim ne se déplace qu'ensuite, et si besoin.", { x: 6.2, y: 2.75, w: 3.3, h: 1.0, fontSize: 14, color: WHITE, objectName: A(7, 0, "pu") });
  s.addNotes("Quatrième principe : le résultat de la sonde est écrit dans le ticket GLPI, à paliers. Niveau 1 : un geste simple, ici vérifier le câble. Niveau 2 : un déplacement si le problème persiste. L'écran à encre électronique du boîtier donne aussi un message à l'utilisateur. Le serveur ne ferme jamais un ticket sans preuve.");

  s = content("Principe 5 · Prouver la réparation (V2)", "3 · La solution");
  const V2 = [[fa.FaIdCard, "Wassim pose sa carte RFID", "arrivée, départ, durée"], [fa.FaPrint, "Page de test envoyée", "le compteur doit avancer de 1"], [fa.FaCheck, "Ticket fermé avec la preuve", "pas de fermeture sans preuve"]];
  for (let i = 0; i < 3; i++) {
    const x = 0.6 + i * 3.1;
    R(s, x, 1.5, 2.8, 2.0, { fill: PANEL, line: GRN, lw: 1.5, n: A(i + 1, 0, "v" + i) });
    await I(s, V2[i][0], GRN, x + 1.1, 1.65, 0.6, A(i + 1, 0, "vi" + i));
    T(s, V2[i][1], { x: x + 0.15, y: 2.4, w: 2.5, h: 0.5, fontSize: 14, bold: true, align: "center", objectName: A(i + 1, 0, "vt" + i) });
    T(s, V2[i][2], { x: x + 0.15, y: 2.9, w: 2.5, h: 0.5, fontSize: 12, color: GREY, align: "center", objectName: A(i + 1, 0, "vc" + i) });
  }
  chip(s, 4.1, 3.9, "V2 : visée, pas obligatoire", YEL, A(4, 0, "ch"), 2.4);
  T(s, "V2 aussi : annuaire AD (Samba) et station des PC neufs (trois cartes RFID).", { x: 0.6, y: 4.45, w: 8.8, h: 0.4, fontSize: 14, color: GREY, align: "center", objectName: A(5, 0, "ad") });
  s.addNotes("Cinquième principe, prévu en V2 : prouver que la réparation a marché. Le technicien pose sa carte RFID, le serveur envoie une page de test, le compteur doit avancer. Seulement alors, le ticket se ferme. La V1 ne dépend pas de cette partie.");

  // ======================= 5. SCÉNARIO =======================
  s = section(4, "Une journée de Wassim", "Deux pannes, deux diagnostics.", "4 · Le scénario");
  s.addNotes("Quatrième partie : un scénario concret, avec les deux cas les plus parlants.");

  s = content("9 h 05 · La secrétaire n'imprime plus", "4 · Le scénario");
  laptop(s, 0.7, 1.4, 1.7, { t: "5 pages en attente", fs: 11, tc: YEL, label: "PC de la secrétaire" });
  printer(s, 4.3, 1.6, 1.6, { label: "imprimante" });
  L(s, 2.5, 2.4, 4.3, 2.4, { c: RED, dash: true, arrow: false, n: A(1, 0, "x") });
  await I(s, fa.FaPhone, BLUE, 7.2, 1.4, 0.5, A(2, 0, "ph"));
  T(s, "Elle appelle le service : « ça n'imprime pas »", { x: 6.4, y: 2.0, w: 3.1, h: 0.7, fontSize: 13, color: BLUE, align: "center", objectName: A(2, 200, "pt") });
  T(s, "Wassim ouvre le ticket. La sonde part :", { x: 0.6, y: 3.45, w: 8.8, h: 0.4, fontSize: 15, objectName: A(3, 0, "s0") });
  T(s, "le PC ne trouve plus le périphérique USB", { x: 0.9, y: 3.9, w: 8.5, h: 0.4, fontSize: 15, color: YEL, objectName: A(4, 0, "s1") });
  T(s, "Message : « vérifiez le câble ». Elle le rebranche. Les 5 pages sortent. Aucun déplacement.", { x: 0.6, y: 4.4, w: 8.8, h: 0.7, fontSize: 15, color: GRN, objectName: A(5, 0, "s2") });
  s.addNotes("Scénario 1. La secrétaire appelle. Wassim crée le ticket et la sonde interroge le PC : le périphérique USB n'est plus détecté. Le ticket dit de vérifier le câble. Elle le rebranche, les pages sortent. Wassim ne s'est pas déplacé.");

  s = content("14 h 20 · Elle dit « prête », mais ne bouge pas", "4 · Le scénario");
  printer(s, 0.7, 1.4, 1.9, { label: "imprimante en réseau" });
  const FG = [["état SNMP : « prêt »", GRN], ["vibration : aucune", RED], ["compteur : immobile (0 / 5)", RED], ["PC : 5 pages envoyées", GREY]];
  FG.forEach((f, i) => T(s, f[0], { x: 3.3, y: 1.45 + i * 0.5, w: 4.5, h: 0.45, fontSize: 16, color: f[1], objectName: A(i + 1, 0, "f" + i) }));
  T(s, "Cause probable : imprimante figée. L'état « prêt » est contredit par les mesures.", { x: 0.6, y: 3.7, w: 8.8, h: 0.6, fontSize: 16, bold: true, color: YEL, objectName: A(5, 0, "c") });
  T(s, "Palier 1 : le serveur conseille un redémarrage ; on le fait à la main. Le compteur avance : réparation prouvée.", { x: 0.6, y: 4.4, w: 8.8, h: 0.7, fontSize: 14, color: GRN, objectName: A(6, 0, "p") });
  s.addNotes("Scénario 2 : la panne qu'aucun outil actuel ne voit. L'imprimante dit prête. Mais la vibration est nulle et le compteur n'avance pas alors que le PC a envoyé cinq pages. Le serveur conclut : figée. Il conseille un redémarrage dans le ticket et sur l'écran du boîtier ; la secrétaire ou Wassim le fait à la main. C'est le palier 1 : le serveur ne modifie jamais l'imprimante. Le compteur et la vibration prouvent ensuite la réparation.");

  // ======================= 6. ARCHITECTURE =======================
  s = section(5, "Architecture et sécurité", "Qui parle à qui, et ce que le système n'a pas le droit de faire.", "5 · Architecture");
  s.addNotes("Cinquième partie : l'architecture, puis les limites de sécurité.");

  s = content("Qui parle à qui", "5 · Architecture");
  server(s, 4.0, 1.2, 1.5, { label: "serveur Ubuntu (sonde, règles, GLPI)" });
  printer(s, 0.6, 1.5, 1.5, { label: "imprimante" });
  R(s, 0.75, 3.0, 1.2, 0.5, { fill: PANEL2, line: BLUE, n: A(1, 0, "bx") });
  T(s, "boîtier ESP32", { x: 0.75, y: 3.0, w: 1.2, h: 0.5, fontSize: 11, align: "center", valign: "middle", color: BLUE, objectName: A(1, 0, "bxt") });
  laptop(s, 7.4, 1.4, 1.7, { t: "PC", tc: WHITE, label: "PC Windows (VM)" });
  L(s, 2.2, 2.0, 3.9, 2.0, { c: GRN, n: A(2, 0, "l1") });
  T(s, "SNMP", { x: 2.5, y: 1.65, w: 1.2, h: 0.3, fontSize: 12, color: GRN, objectName: A(2, 200, "t1") });
  L(s, 2.05, 3.25, 3.9, 2.6, { c: BLUE, n: A(3, 0, "l2") });
  T(s, "MQTT sur TLS", { x: 2.2, y: 3.25, w: 1.6, h: 0.3, fontSize: 12, color: BLUE, objectName: A(3, 200, "t2") });
  L(s, 5.6, 2.0, 7.3, 2.0, { c: YEL, n: A(4, 0, "l3") });
  T(s, "JEA (lecture seule)", { x: 5.5, y: 1.65, w: 1.9, h: 0.3, fontSize: 12, color: YEL, objectName: A(4, 200, "t3") });
  T(s, "API de GLPI · tableau de bord · V2 : annuaire AD (Samba) pour ranger les PC neufs", { x: 0.6, y: 4.5, w: 8.8, h: 0.6, fontSize: 14, color: GREY, objectName: A(5, 0, "bas") });
  s.addNotes("Le serveur Ubuntu héberge la sonde, les règles et GLPI. Il lit l'imprimante en SNMP, reçoit les mesures du boîtier par MQTT chiffré, et interroge le PC par JEA en lecture seule. Le PC Windows de la maquette est une machine virtuelle. L'annuaire AD (Samba) et la station des PC neufs sont prévus en V2.");

  s = content("Le système touche des PC. Il reste borné.", "5 · Architecture");
  const PAL = [["1 · Il conseille (V1)", "il écrit ce qu'il ferait, sans le faire", BLUE], ["2 · Confirmation (extension)", "Wassim valide chaque action", YEL], ["3 · Automatique (extension)", "seulement si les indicateurs sont atteints", GRN]];
  PAL.forEach((p, i) => card(s, 0.5 + i * 3.1, 1.3, 2.9, 1.5, p[0], p[1], p[2], A(i + 1, 0, "p" + i)));
  bullets(s, 0.7, 3.2, 8.8, [
    "JEA : une liste fermée de commandes, compte sans droit d'administrateur. Hors liste : refusé et tracé.",
    "Compte GLPI : ne supprime rien, ne ferme qu'avec une preuve.",
    "SNMPv2c circule en clair : LAN de laboratoire seulement, noté dans le dossier.",
  ], 4, 14, 0.62);
  s.addNotes("Le système agit sur des machines, donc trois paliers de sécurité. En V1, le système reste au palier 1 : il conseille, il n'agit pas. La confirmation humaine, puis l'automatique, sont des extensions, seulement si les indicateurs le permettent. JEA limite les commandes du PC à une liste fermée. Question de sécurité posée au jury : le diagnostic à distance peut-il faire plus que ce qu'on lui permet ? La démonstration : une commande hors liste est refusée et tracée.");

  s = content("Vie privée : on regarde les machines, pas les gens", "5 · Architecture");
  const VP = [["Aucun contenu", "le script compte les documents, jamais leur nom", GRN], ["Ni caméra ni micro", "le boîtier mesure une vibration et lit un badge", GRN], ["Aucune donnée réelle", "maquette au lycée, contexte anonymisé", GRN]];
  VP.forEach((p, i) => card(s, 0.5 + i * 3.1, 1.5, 2.9, 1.8, p[0], p[1], p[2], A(i + 1, 0, "v" + i)));
  s.addNotes("Aucune donnée de patient : le script lit le nombre de documents en attente, jamais leur nom. Pas de caméra, pas de micro. Toute la maquette est au lycée, avec des données fictives.");

  // ======================= 7. PHYSIQUE =======================
  s = section(6, "La physique", "Quand peut-on dire que l'imprimante imprime ?", "6 · Physique");
  s.addNotes("Sixième partie : le volet physique, utile au projet.");

  s = content("Un seuil sur la vibration", "6 · Physique");
  const N = 60, X0 = 0.8, W = 7.2, YB = 2.75;
  let prev = null;
  for (let i = 0; i <= N; i++) {
    const active = i > 20 && i < 45, a = active ? 0.7 : 0.1, y = YB + a * Math.sin(i * 2.3) * (0.6 + 0.4 * Math.sin(i * 0.7 + 1)), x = X0 + (i / N) * W;
    if (prev) L(s, prev[0], prev[1], x, y, { c: active ? BLUE : GREY, w: 1.5, arrow: false, n: A(i > 20 ? 2 : 1, i * 12, "c" + i) });
    prev = [x, y];
  }
  T(s, "veille", { x: 0.8, y: 3.7, w: 1.6, h: 0.3, fontSize: 12, color: GREY, objectName: A(1, 0, "tv") });
  T(s, "impression", { x: 3.9, y: 3.7, w: 1.6, h: 0.3, fontSize: 12, color: BLUE, objectName: A(2, 0, "ti") });
  L(s, 0.8, 2.15, 8.0, 2.15, { c: YEL, dash: true, arrow: false, n: A(3, 0, "seuil") });
  T(s, "seuil", { x: 8.1, y: 2.0, w: 1.2, h: 0.3, fontSize: 13, bold: true, color: YEL, objectName: A(3, 0, "st") });
  T(s, "Seuil = moyenne en veille + k écarts-types. Trop bas : fausses alertes. Trop haut : l'impression est ratée.", { x: 0.6, y: 4.2, w: 8.8, h: 0.7, fontSize: 15, objectName: A(4, 0, "bas") });
  T(s, "Courbe illustrative. La valeur de k et le délai de réaction sont à déterminer sur des mesures réelles.", { x: 0.6, y: 4.85, w: 8.8, h: 0.35, fontSize: 12, color: GREY, objectName: A(5, 0, "avis") });
  s.addNotes("Le boîtier mesure l'énergie de vibration. En veille, on calcule la moyenne et l'écart-type. Le seuil est la moyenne plus k écarts-types. Le choix de k est un compromis entre fausses alertes et impressions manquées. La courbe affichée ici est illustrative : les vraies valeurs viendront de mesures sur une imprimante réelle, avec incertitudes, et les mesures brutes seront conservées horodatées.");

  // ======================= 8. MAQUETTE =======================
  s = section(7, "Réaliser et prouver", "Sans imprimante, puis avec de vraies imprimantes.", "7 · Réalisation");
  s.addNotes("Septième partie : comment le projet sera réalisé et vérifié.");

  s = content("Développer d'abord sur simulateur, puis sur du vrai", "7 · Réalisation");
  const ET = [["1", "Simulateur SNMP", "scénarios : tout va bien, bac vide, bourrage, figée", BLUE], ["2", "Appareil simulé", "VM ou Raspberry Pi : pannes réseau réelles", BLUE], ["3", "Vraie imprimante", "fiche de relevé : objet, valeur, cohérente ?", GRN]];
  ET.forEach((e, i) => {
    const x = 0.5 + i * 3.1;
    card(s, x, 1.3, 2.9, 1.9, e[0] + " · " + e[1], e[2], e[3], A(i + 1, 0, "e" + i));
    if (i < 2) L(s, x + 2.92, 2.25, x + 3.08, 2.25, { c: GREY, n: A(i + 2, 0, "a" + i) });
  });
  bullets(s, 0.7, 3.5, 8.8, [
    "Les marques de l'hôpital (HP LaserJet, Konica Minolta) ne renvoient pas tous les mêmes objets SNMP : seule une vraie imprimante le montre.",
    "Dans le dossier : « validé sur simulateur, puis sur N imprimante(s) réelle(s) ».",
  ], 4, 14, 0.7);
  s.addNotes("Les tests sont écrits avant le code. On développe d'abord avec un simulateur SNMP, gratuit, puis sur un appareil simulé sur le réseau, puis sur une vraie imprimante. Les sources montrent que les HP et les Konica Minolta ne renvoient pas toutes les mêmes informations, par exemple le niveau de toner. Un simulateur ne le révèle pas. Le dossier dira donc honnêtement sur combien d'imprimantes réelles le programme a été validé. Modèles de l'hôpital rapportés par l'apprenti, à confirmer.");

  s = content("Le réseau en place : ce que Wassim exploite", "7 · Réalisation");
  const RES = [["Adressage", "réservation DHCP et nom DNS pour le serveur et les boîtiers"], ["Heure", "NTP commun pour dater les mesures"], ["Vérifications", "ping, ports 9100 et 631, bon réseau pour le service"], ["Captures", "Wireshark : SNMP en clair, IPP, MQTT, LDAP"]];
  RES.forEach((r, i) => card(s, 0.5 + (i % 2) * 4.6, 1.2 + Math.floor(i / 2) * 1.75, 4.4, 1.55, r[0], r[1], BLUE, A(i + 1, 0, "r" + i)));
  s.addNotes("Compétence C10 : exploiter le réseau en place. Adressage, DHCP, DNS, NTP, vérifications d'une imprimante, captures. Le système lit le réseau, il ne le configure pas.");

  s = content("Recette : ce qu'on mesure", "7 · Réalisation");
  const IND = [["E1", "10 pannes provoquées, dont câble USB débranché", "cause juste ≥ 9 / 10"], ["E2", "1 h d'impressions normales", "aucun ticket"], ["E3", "de l'impression ratée au ticket", "moins d'1 minute"], ["E4", "compteur sur 100 pages", "au plus 1 écart"], ["E5", "commande hors liste JEA", "refusée et tracée"]];
  IND.forEach((r, i) => {
    const y = 1.2 + i * 0.7, n = A(i + 1, 0, "i" + i);
    R(s, 0.5, y, 9.0, 0.6, { fill: PANEL, line: LINE, n: n + "b" });
    T(s, r[0], { x: 0.6, y, w: 0.6, h: 0.6, fontSize: 16, bold: true, color: YEL, valign: "middle", objectName: n + "k" });
    T(s, r[1], { x: 1.3, y, w: 4.6, h: 0.6, fontSize: 13, valign: "middle", objectName: n + "m" });
    T(s, r[2], { x: 6.0, y, w: 3.4, h: 0.6, fontSize: 13, bold: true, color: GRN, valign: "middle", objectName: n + "o" });
  });
  T(s, "Objectifs à valider par le tuteur. Aussi à chiffrer : part des déplacements inutiles (hypothèse à demander).", { x: 0.6, y: 4.8, w: 8.8, h: 0.4, fontSize: 12, color: GREY, objectName: A(6, 0, "av") });
  s.addNotes("Les indicateurs sont mesurés sur la maquette. Les objectifs sont à valider par le tuteur. Le plus important pour le besoin : combien de déplacements un ticket complété aurait évités. Ce chiffre dépend de données du service, donc à demander au tuteur, jamais inventé.");

  // ======================= 9. PARCOURS =======================
  s = section(8, "Parcours et limites", "V1 obligatoire, V2 visée, extensions.", "8 · Parcours");
  s.addNotes("Huitième partie : ce qui est promis, ce qui est visé, et les limites.");

  s = content("Une V1 complète, une V2 visée", "8 · Parcours");
  card(s, 0.5, 1.2, 4.4, 2.7, "V1 · obligatoire", "boîtier (vibration, bouton, écran)\nsonde : SNMP et PC, profils par marque\nserveur : comparaison des témoins\nticket GLPI au palier 1 (il conseille)\ntableau de bord", GRN, A(1, 0, "v1"), 13);
  card(s, 5.1, 1.2, 4.4, 2.7, "V2 · visée", "carte RFID du technicien\npreuve de réparation\nencre surveillée avant la panne\nhumidité du local, capteur de feuilles\nannuaire AD (Samba) et station des PC neufs", YEL, A(2, 0, "v2"), 13);
  T(s, "Extensions : redémarrage à distance (paliers 2 et 3), SNMPv3, Wi-Fi, cartes RFID sécurisées.", { x: 0.6, y: 4.2, w: 8.8, h: 0.5, fontSize: 14, color: GREY, objectName: A(3, 0, "ext") });
  s.addNotes("La V1 est complète et obligatoire. La V2 est visée selon l'avancement. Les extensions ne sont pas promises. La sonde fait partie de la V1.");

  s = content("Limites, dites franchement", "8 · Parcours");
  bullets(s, 0.6, 1.2, 8.8, [
    "Le besoin vient de l'apprenti : il n'est pas validé par l'entreprise. Les chiffres sont à demander au tuteur.",
    "Réalisation au lycée sur maquette, sans donnée réelle ni accès à la production. L'arrêté du 25 janvier 2023 demande de développer les projets en entreprise : cette organisation doit être validée par l'académie.",
    "V1 sans annuaire : un serveur Ubuntu et un PC Windows en machine virtuelle (compte local). L'annuaire AD (Samba) arrive en V2.",
    "Le niveau d'encre dépend du modèle : le projet n'en dépend pas.",
  ], 1, 14, 0.85);
  s.addNotes("Limites assumées : besoin non validé par l'entreprise, réalisation au lycée à valider par l'académie, machine virtuelle pour le PC, niveau d'encre variable selon le modèle. Il vaut mieux les dire avant que le jury les trouve.");

  // ======================= 10. CONCLUSION =======================
  pres.addSection({ title: "Conclusion" });
  s = pres.addSlide({ masterName: "SECTION", sectionTitle: "Conclusion" });
  s.addText("Faut-il se déplacer ?", { placeholder: "title" });
  T(s, "Avant de partir, le ticket répond.", { x: 0.6, y: 3.35, w: 8.4, h: 0.5, fontSize: 20, color: YEL, objectName: A(1, 0, "r") });
  [["témoins croisés", BLUE], ["sonde en lecture seule", BLUE], ["cause dans le ticket", GRN], ["paliers de sécurité", GRN]].forEach((c, i) =>
    chip(s, 0.6 + i * 2.2, 4.1, c[0], c[1], A(2, i * 300, "ch" + i), 2.0));
  T(s, "Merci. Place aux questions.", { x: 0.6, y: 4.75, w: 8.8, h: 0.4, fontSize: 16, color: GREY, objectName: A(3, 0, "end") });
  s.addNotes("Retour à la question. Oui : avant de partir, le ticket peut répondre. Quatre témoins croisés, une sonde en lecture seule, la cause écrite dans le ticket, et des paliers de sécurité tant que le système agit sur des machines.");

  await pres.writeFile({ fileName: "deck_brut.pptx" });
  console.log("écrit : deck_brut.pptx");
})().catch((e) => { console.error(e); process.exit(1); });
