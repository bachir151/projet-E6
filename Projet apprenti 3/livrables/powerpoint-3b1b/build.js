// Présentation E6 de Lorenzo, style « tableau noir mathématique » (3Blue1Brown) : fond sombre, serif,
// bleu / jaune / vert / rouge, animations au clic, notes de l'orateur.
// Reconstruire : ./build.sh  (node build.js → apply_theme → python3 animate.py)
const pptxgen = require("pptxgenjs");

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
const BLUE = "58C4DD", YEL = "F4D345", GRN = "83C167", RED = "FC6255", PUR = "9A72AC", TEAL = "5CD0B3";
const SKIN = "D9A17C", DESK = "7A6448", MONO = "Consolas";

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "Projet E6 – Un ordinateur peut-il savoir si quelqu'un est devant lui ?";
pres.author = "Lorenzo – BTS CIEL option A";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };

const FOOT = "Projet E6 · Lorenzo · BTS CIEL option A · maquette au lycée, données fictives";
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
    o.round === false ? {} : { rectRadius: o.r ?? 0.08 }, o.dash ? { line: { color: o.line, width: o.lw || 1.5, dashType: "dash" } } : {}));
const O = (s, x, y, d, color, n, lineCol) => s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color }, line: { color: lineCol || color, width: lineCol ? 2 : 1 }, objectName: n });
function L(s, x1, y1, x2, y2, o = {}) {
  s.addShape(pres.shapes.LINE, {
    x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.max(Math.abs(x2 - x1), 0.001), h: Math.max(Math.abs(y2 - y1), 0.001),
    flipH: x2 < x1, flipV: y2 < y1, objectName: o.n,
    line: Object.assign({ color: o.c || LINE, width: o.w || 2 }, o.dash ? { dashType: "dash" } : {}, o.arrow === false ? {} : { endArrowType: "triangle" }),
  });
}
const nm = (base, suf) => (base ? base + suf : undefined);
const chip = (s, x, y, text, color, n, w) => {
  R(s, x, y, w || 1.1, 0.34, { fill: BG, line: color, r: 0.17, lw: 1.5, n: nm(n, "f") });
  T(s, text, { x, y, w: w || 1.1, h: 0.34, align: "center", valign: "middle", fontSize: 12, bold: true, color, objectName: nm(n, "t") });
};
function mark(s, x, y, kind, n) {
  const col = kind === "y" ? GRN : kind === "n" ? RED : YEL, ch = kind === "y" ? "✓" : kind === "n" ? "✗" : "~";
  O(s, x, y, 0.3, BG, nm(n, "o"), col);
  T(s, ch, { x, y, w: 0.3, h: 0.3, align: "center", valign: "middle", fontSize: 13, bold: true, color: col, fontFace: "Segoe UI Symbol", objectName: nm(n, "t") });
}
const content = (title, sec) => { const s = pres.addSlide({ masterName: "CONTENU", sectionTitle: sec }); s.addText(title, { placeholder: "title" }); return s; };
const clock = (s, text, n) => chip(s, 8.3, 0.42, text, YEL, n, 1.2);
function section(num, title, sub, sec) {
  pres.addSection({ title: sec });
  const s = pres.addSlide({ masterName: "SECTION", sectionTitle: sec });
  T(s, String(num), { x: 0.6, y: 1.0, w: 1.5, h: 1.2, fontSize: 72, color: BLUE });
  s.addText(title, { placeholder: "title" });
  T(s, sub, { x: 0.6, y: 3.35, w: 8.4, h: 0.8, fontSize: 16, color: GREY });
  return s;
}
// personnage assis ou debout
function person(s, x, y, h, color, n) {
  const d = h * 0.3;
  O(s, x + h * 0.11, y, d, SKIN, nm(n, "h"));
  R(s, x, y + d + 0.03, h * 0.52, h * 0.66, { fill: color, r: 0.12, n: nm(n, "b") });
}
// écran : cadre + contenu (ouvert / bloqué / installation)
function monitor(s, x, y, w, state, n) {
  const h = w * 0.62;
  R(s, x, y, w, h, { fill: "22262E", line: LINE, r: 0.05, n: nm(n, "f") });
  R(s, x + w * 0.42, y + h, w * 0.16, h * 0.18, { fill: LINE, round: false, n: nm(n, "p") });
  screenState(s, x, y, w, state, n);
  return h;
}
function screenState(s, x, y, w, state, n) {
  const h = w * 0.62, sx = x + w * 0.05, sy = y + h * 0.08, sw = w * 0.9, sh = h * 0.84;
  if (state === "open") {
    R(s, sx, sy, sw, sh, { fill: "DDE6EC", round: false, n: nm(n, "s") });
    T(s, "CONFIDENTIEL", { x: sx + 0.08, y: sy + 0.06, w: sw - 0.1, h: 0.25, fontSize: Math.max(8, w * 6), bold: true, color: "C0392B", objectName: nm(n, "c") });
    for (let i = 0; i < 3; i++) R(s, sx + 0.08, sy + sh * (0.42 + i * 0.17), sw * (i === 2 ? 0.5 : 0.8), sh * 0.07, { fill: "A9B8C3", round: false, n: nm(n, "l" + i) });
  } else if (state === "locked") {
    R(s, sx, sy, sw, sh, { fill: "07090C", round: false, n: nm(n, "s") });
    T(s, "🔒  verrouillé", { x: sx, y: sy, w: sw, h: sh, align: "center", valign: "middle", fontSize: Math.max(9, w * 7), color: GREY, fontFace: "Segoe UI Symbol", objectName: nm(n, "c") });
  } else {
    R(s, sx, sy, sw, sh, { fill: "07090C", round: false, n: nm(n, "s") });
    T(s, "installation…", { x: sx, y: sy + sh * 0.18, w: sw, h: 0.3, align: "center", fontSize: Math.max(9, w * 6), color: GREY, objectName: nm(n, "c") });
    R(s, sx + sw * 0.12, sy + sh * 0.62, sw * 0.76, sh * 0.12, { fill: LINE, round: false, n: nm(n, "l0") });
  }
}
// bureau + boîtier radar avec sa lumière
function desk(s, x, y, w) {
  R(s, x, y, w, 0.12, { fill: DESK, round: false });
  R(s, x + 0.1, y + 0.12, 0.08, 1.0, { fill: "5C4A35", round: false });
  R(s, x + w - 0.18, y + 0.12, 0.08, 1.0, { fill: "5C4A35", round: false });
}
function box(s, x, y, ledColor, n) {
  R(s, x, y, 0.55, 0.24, { fill: PANEL2, line: BLUE, r: 0.05, lw: 1.5, n: nm(n, "f") });
  O(s, x + 0.38, y + 0.06, 0.12, ledColor || GREY, nm(n, "l"));
}

// ======================= OUVERTURE =======================
pres.addSection({ title: "Ouverture" });
let s = pres.addSlide({ masterName: "TITRE", sectionTitle: "Ouverture" });
T(s, "BTS CIEL option A · Épreuve E6 · Session 2027", { x: 0.6, y: 0.55, w: 6, h: 0.3, fontSize: 12, color: GREY });
T(s, [{ text: "Un ordinateur peut-il " }, { text: "savoir", options: { color: YEL } }, { text: " si quelqu'un est devant lui ?" }], { x: 0.6, y: 1.2, w: 5.6, h: 1.9, fontSize: 38 });
T(s, "Poste attentif : sécurité et installations guidées par la présence de l'agent", { x: 0.6, y: 3.2, w: 5.4, h: 0.7, fontSize: 16, color: GREY });
T(s, "Lorenzo · apprenti · besoin issu de l'entreprise, réalisation au lycée sur maquette", { x: 0.6, y: 4.55, w: 8.6, h: 0.3, fontSize: 12, color: GREY });
monitor(s, 6.6, 1.3, 2.6, "open");
person(s, 7.55, 3.05, 1.1, "2F5D8A", "anim_1_x_p");
T(s, "?", { x: 7.3, y: 2.95, w: 1.2, h: 1.2, fontSize: 72, color: YEL, align: "center", objectName: "anim_1_f~d400_q" });
s.addNotes("Ouvrir par la question. Votre ordinateur sait si vous tapez au clavier. Mais sait-il si vous êtes là ? Je fais disparaître l'agent : pour l'ordinateur, rien n'a changé. Tout le projet part de cette question.");

// ======================= 1. PROBLÈME =======================
s = section(1, "Le problème", "Des bureaux partagés, des dossiers confidentiels, un agent qui se lève.", "1 · Le problème");
s.addNotes("Première partie : le problème, tel que le tuteur l'a décrit.");

s = content("L'agent part. L'écran reste ouvert.", "1 · Le problème");
desk(s, 1.0, 3.6, 4.2);
monitor(s, 2.2, 1.95, 1.9, "open");
person(s, 0.9, 2.35, 1.3, "2F5D8A", "anim_1_m~-1.2:0~t900+x~t500~d700_ag");
person(s, 6.4, 2.0, 1.7, PUR, "anim_2_f_us");
T(s, "un collègue, un visiteur…", { x: 5.6, y: 3.8, w: 2.4, h: 0.3, fontSize: 12, color: PUR, align: "center", objectName: "anim_2_f_ust" });
L(s, 6.4, 2.25, 4.15, 2.45, { c: RED, dash: true, arrow: false, n: "anim_2_f~d400_vue" });
T(s, "0:00", { x: 7.0, y: 1.05, w: 2.4, h: 0.6, fontSize: 32, color: RED, fontFace: MONO, align: "right", objectName: "anim_1_f~d900_c0" });
T(s, "3:00", { x: 7.0, y: 1.05, w: 2.4, h: 0.6, fontSize: 32, color: RED, fontFace: MONO, align: "right", fill: { color: BG }, objectName: "anim_2_f~d600_c3" });
T(s, "10:00", { x: 7.0, y: 1.05, w: 2.4, h: 0.6, fontSize: 32, color: RED, fontFace: MONO, align: "right", fill: { color: BG }, objectName: "anim_3_f_c10" });
screenState(s, 2.2, 1.95, 1.9, "locked", "anim_3_f~d500_lk");
T(s, "Aujourd'hui : blocage automatique après 10 minutes sans clavier.", { x: 0.5, y: 4.85, w: 9, h: 0.3, fontSize: 14, color: GREY, objectName: "anim_3_f~d800_ex" });
s.addNotes("Clic 1 : l'agent se lève, le compteur démarre. Clic 2 : dans un bureau partagé, un collègue, un visiteur ou un prestataire passe. Il peut lire l'écran, ou même agir au nom de l'agent. Clic 3 : au bout de 10 minutes seulement, l'écran se bloque. Dix minutes pendant lesquelles un dossier couvert par le secret est accessible à une personne non habilitée. Aux postes d'accueil, c'est le public qui voit l'écran.");

s = content("Inactif ne veut pas dire absent", "1 · Le problème");
T(s, "Ce que voit Windows : le clavier et la souris.", { x: 0.5, y: 1.05, w: 9, h: 0.35, fontSize: 16, color: GREY });
const rowCase = (y, label, col, real, n, step) => {
  T(s, label, { x: 0.5, y, w: 2.3, h: 0.5, fontSize: 15, color: col, valign: "middle", objectName: `anim_${step}_f_${n}l` });
  for (let i = 0; i < 8; i++) R(s, 2.9 + i * 0.18, y + 0.5 - (0.15 + (i * 37 % 5) * 0.06), 0.1, 0.15 + (i * 37 % 5) * 0.06, { fill: BLUE, round: false, n: `anim_${step}_f_${n}b${i}` });
  L(s, 4.4, y + 0.5, 7.0, y + 0.5, { c: BLUE, w: 2.5, arrow: false, n: `anim_${step}_f~d300_${n}z` });
  T(s, "aucune activité", { x: 4.6, y: y + 0.12, w: 2.2, h: 0.3, fontSize: 12, color: GREY, objectName: `anim_${step}_f~d300_${n}t` });
  T(s, real, { x: 7.2, y, w: 2.4, h: 0.5, fontSize: 14, bold: true, color: col, valign: "middle", objectName: `anim_3_f~d${step * 200}_${n}r` });
};
rowCase(1.65, "Martine lit un dossier", GRN, "elle est là", "a", 1);
rowCase(2.75, "Martine est partie", RED, "personne", "b", 2);
T(s, [{ text: "Même signal, deux réalités. " }, { text: "Il faut une mesure physique de la présence.", options: { color: YEL } }], { x: 0.5, y: 4.0, w: 9, h: 0.8, fontSize: 20, objectName: "anim_4_f_k" });
s.addNotes("Deux situations. Martine lit un dossier papier : elle ne touche plus au clavier. Martine est partie : elle ne touche plus au clavier. Pour Windows, les deux courbes sont identiques. C'est la cause de tout : l'ordinateur confond inactif et absent. Il faut mesurer physiquement la présence.");

s = content("Deux conséquences", "1 · Le problème");
R(s, 0.5, 1.2, 4.3, 3.6, { fill: PANEL, line: RED, lw: 2 });
T(s, "PREMIÈRE", { x: 0.8, y: 1.4, w: 3.8, h: 0.3, fontSize: 12, color: RED, bold: true });
T(s, "La session reste ouverte", { x: 0.8, y: 1.75, w: 3.8, h: 0.5, fontSize: 22 });
T(s, "Pendant 10 minutes, un collègue non habilité, un visiteur ou un prestataire peut lire un dossier couvert par le secret, ou agir au nom de l'agent. À l'accueil, c'est le public.", { x: 0.8, y: 2.4, w: 3.7, h: 2.2, fontSize: 15, color: GREY });
R(s, 5.2, 1.2, 4.3, 3.6, { fill: PANEL, line: YEL, lw: 2, n: "anim_1_f_c2" });
T(s, "DEUXIÈME", { x: 5.5, y: 1.4, w: 3.8, h: 0.3, fontSize: 12, color: YEL, bold: true, objectName: "anim_1_f_c2a" });
T(s, "Les installations tombent mal", { x: 5.5, y: 1.75, w: 3.8, h: 0.5, fontSize: 22, objectName: "anim_1_f_c2b" });
T(s, "Lancées en journée, elles dérangent l'agent en plein travail. Ses vraies absences (réunion, déjeuner) ne servent pas. Reportées le soir, elles trouvent des postes éteints.", { x: 5.5, y: 2.4, w: 3.7, h: 2.2, fontSize: 15, color: GREY, objectName: "anim_1_f_c2c" });
s.addNotes("Première conséquence, la sécurité : la session ouverte. Lorenzo intervient surtout sur des postes d'employés de bureau, souvent en bureau partagé ; l'accueil n'est qu'un cas particulier, le plus exposé. Deuxième conséquence, qui touche le métier de l'apprenti : un employé de bureau travaille toute la journée sur son poste. Lorenzo installe des logiciels, et il ne sait jamais quand le faire sans déranger, alors que les réunions et le déjeuner seraient de bons moments.");

// ======================= 2. EXISTANT =======================
s = section(2, "Ce qui existe déjà", "Des outils qui font bien leur travail. Aucun ne sait si l'agent est là.", "2 · Existant");
s.addNotes("Deuxième partie : avant d'inventer, regarder ce qui existe, et être juste avec ces outils.");

s = content("Protéger l'écran : le test des trois situations", "2 · Existant");
const heads = ["Elle lit sans bouger :\nl'écran reste ouvert ?", "Elle part, ses affaires\nrestent : l'écran se bloque ?", "Autorisé,\nrien à porter ?"];
heads.forEach((h, i) => T(s, h, { x: 4.0 + i * 1.85, y: 1.0, w: 1.8, h: 0.6, fontSize: 11, color: GREY, align: "center" }));
const rowsE = [
  ["Blocage après inactivité court", "n", "y", "y"], ["Détecteur de mouvement", "n", "y", "y"], ["Téléphone Bluetooth", "y", "n", "n"],
  ["Carte à puce", "y", "n", "y"], ["Tapis sur la chaise", "y", "n", "y"], ["Caméra", "y", "y", "n"], ["Radar de Lorenzo", "y", "y", "y"],
];
rowsE.forEach((r, i) => {
  const y = 1.7 + i * 0.47, last = i === rowsE.length - 1;
  if (last) R(s, 0.45, y - 0.06, 9.1, 0.44, { fill: "15343A", line: TEAL, n: "anim_4_f_hl" });
  T(s, r[0], { x: 0.6, y, w: 3.3, h: 0.32, fontSize: 14, bold: last, color: last ? TEAL : WHITE, valign: "middle", objectName: last ? "anim_4_f_hlt" : undefined });
  for (let c = 0; c < 3; c++) mark(s, 4.75 + c * 1.85, y + 0.01, r[c + 1], `anim_${last ? 4 : c + 1}_f~d${i * 120}_m${i}${c}`);
});
s.addNotes("Je remplis le tableau colonne par colonne. Clic 1 : Martine lit sans bouger. Les solutions à base d'inactivité ou de mouvement la croient partie. Clic 2 : elle part en laissant téléphone, carte ou sac : ces solutions la croient encore là. Clic 3 : la caméra réussit tout, mais filmer un agent à son poste est interdit sauf cas particuliers. Clic 4 : seul le radar réussit les trois.");

s = content("Installer : les outils de l'administration", "2 · Existant");
const tools = ["Image « master »", "GPO", "WSUS", "SCCM", "WAPT", "Intune"];
tools.forEach((t, i) => { R(s, 0.5 + (i % 3) * 1.6, 1.2 + Math.floor(i / 3) * 0.75, 1.45, 0.55, { fill: PANEL2, line: LINE }); T(s, t, { x: 0.5 + (i % 3) * 1.6, y: 1.2 + Math.floor(i / 3) * 0.75, w: 1.45, h: 0.55, fontSize: 14, align: "center", valign: "middle" }); });
T(s, "Ils gèrent des milliers de postes : image du poste neuf, règles, correctifs, logiciels.", { x: 0.5, y: 2.85, w: 4.7, h: 0.8, fontSize: 14, color: GREY });
const q = [["QUOI installer ?", "y", "la liste des paquets"], ["Sur QUELS postes ?", "y", "groupes, inventaire"], ["QUAND, pour l'agent ?", "n", "heure fixe ou inactivité"]];
q.forEach(([t, k, sub], i) => {
  const y = 1.25 + i * 1.05;
  R(s, 5.5, y, 4.0, 0.85, { fill: PANEL, line: k === "y" ? GRN : RED, lw: 2, n: `anim_${i + 1}_f_q${i}` });
  T(s, t, { x: 5.7, y: y + 0.1, w: 3.0, h: 0.4, fontSize: 18, bold: true, color: k === "y" ? WHITE : RED, objectName: `anim_${i + 1}_f_q${i}t` });
  T(s, sub, { x: 5.7, y: y + 0.48, w: 3.0, h: 0.3, fontSize: 12, color: GREY, objectName: `anim_${i + 1}_f_q${i}s` });
  mark(s, 9.0, y + 0.27, k, `anim_${i + 1}_f~d300_q${i}m`);
});
T(s, "Le boîtier ne remplace aucun de ces outils : il leur donne le « quand ».", { x: 0.5, y: 4.55, w: 9, h: 0.4, fontSize: 17, color: YEL, objectName: "anim_4_f_k" });
s.addNotes("Le tuteur l'a confirmé : le service a déjà une image toute prête pour chaque poste neuf, des stratégies de groupe, et des outils de télédistribution. Ils savent quoi installer et sur quels postes. Il leur manque une seule chose : savoir si l'agent est devant l'écran. Ils choisissent une heure fixe, ou détectent seulement l'inactivité du clavier. Je ne remplace rien : j'ajoute l'information qui manque.");

s = content("Le test de la journée de Martine", "2 · Existant");
const headsI = ["Elle lit sans bouger :\nrien ne s'installe ?", "Elle déjeune :\nça s'installe ?", "Le soir : elle part\nsans attendre ?"];
headsI.forEach((h, i) => T(s, h, { x: 4.0 + i * 1.85, y: 1.0, w: 1.8, h: 0.6, fontSize: 11, color: GREY, align: "center" }));
const rowsI = [["Heure fixe (12 h 30)", "n", "p", "y"], ["La nuit + réveil à distance", "y", "n", "p"], ["Inactivité du clavier", "n", "y", "y"], ["À la fermeture de session", "y", "n", "n"], ["Outil + boîtier", "y", "y", "y"]];
rowsI.forEach((r, i) => {
  const y = 1.8 + i * 0.58, last = i === rowsI.length - 1;
  if (last) R(s, 0.45, y - 0.08, 9.1, 0.48, { fill: "15343A", line: TEAL, n: "anim_4_f_hl" });
  T(s, r[0], { x: 0.6, y, w: 3.3, h: 0.32, fontSize: 14, bold: last, color: last ? TEAL : WHITE, valign: "middle", objectName: last ? "anim_4_f_hlt" : undefined });
  for (let c = 0; c < 3; c++) mark(s, 4.75 + c * 1.85, y + 0.01, r[c + 1], `anim_${last ? 4 : c + 1}_f~d${i * 120}_m${i}${c}`);
});
T(s, "~ = parfois", { x: 0.6, y: 4.85, w: 3, h: 0.3, fontSize: 11, color: YEL });
s.addNotes("Même méthode pour les installations. L'heure fixe installe même si Martine est là. La nuit, on ne profite pas des pauses, et un portable fermé ne se réveille pas. L'inactivité installe pendant qu'elle lit. À la fermeture de session, elle attend le soir. Seul l'outil de l'administration associé au boîtier réussit les trois.");

// ======================= 3. SOLUTION =======================
s = section(3, "La solution", "Une seule information, mesurée physiquement : quelqu'un est-il là ?", "3 · Solution");
s.addNotes("Troisième partie : la solution, construite à partir de la cause.");

s = content("Une information, deux décisions", "3 · Solution");
R(s, 0.5, 1.9, 2.6, 1.4, { fill: PANEL2, line: BLUE, lw: 2 });
T(s, "Boîtier radar", { x: 0.5, y: 2.05, w: 2.6, h: 0.4, fontSize: 18, bold: true, align: "center" });
T(s, "sous le bureau", { x: 0.5, y: 2.5, w: 2.6, h: 0.3, fontSize: 13, color: GREY, align: "center" });
chip(s, 3.45, 2.42, "présent ?", YEL, "anim_1_f_ch", 1.3);
L(s, 3.1, 2.6, 3.45, 2.6, { c: YEL, n: "anim_1_f_a0" });
L(s, 4.75, 2.6, 5.4, 1.75, { c: GRN, n: "anim_2_f_a1" });
R(s, 5.4, 1.2, 4.1, 1.15, { fill: PANEL, line: GRN, lw: 2, n: "anim_2_f_d1" });
T(s, "V1 · Bloquer l'écran", { x: 5.6, y: 1.3, w: 3.8, h: 0.4, fontSize: 18, bold: true, color: GRN, objectName: "anim_2_f_d1t" });
T(s, "l'agent part : orange 3 s, puis verrouillage", { x: 5.6, y: 1.75, w: 3.8, h: 0.4, fontSize: 13, color: GREY, objectName: "anim_2_f_d1s" });
L(s, 4.75, 2.6, 5.4, 3.45, { c: BLUE, n: "anim_3_f_a2" });
R(s, 5.4, 2.9, 4.1, 1.15, { fill: PANEL, line: BLUE, lw: 2, n: "anim_3_f_d2" });
T(s, "V2 · Installer au bon moment", { x: 5.6, y: 3.0, w: 3.8, h: 0.4, fontSize: 18, bold: true, color: BLUE, objectName: "anim_3_f_d2t" });
T(s, "absent depuis 20 min : les paquets prévus s'installent", { x: 5.6, y: 3.45, w: 3.8, h: 0.4, fontSize: 13, color: GREY, objectName: "anim_3_f_d2s" });
T(s, "Règle d'or : boîtier en panne → le blocage après 10 min protège encore. Rien ne ferme le travail de l'agent.", { x: 0.5, y: 4.4, w: 9, h: 0.6, fontSize: 15, color: YEL, objectName: "anim_4_f_r" });
s.addNotes("Le boîtier ne fait qu'une chose : dire chaque seconde si quelqu'un est assis. Le PC en tire deux décisions. Version 1, obligatoire : bloquer l'écran. Version 2, visée : installer pendant les absences. Et une règle d'or : la sécurité ne dépend jamais du boîtier seul.");

s = content("Comment un radar voit quelqu'un d'immobile", "3 · Solution");
box(s, 0.6, 2.6, GRN);
for (let i = 0; i < 4; i++) L(s, 1.25 + i * 0.9, 2.72, 1.95 + i * 0.9, 2.72, { c: BLUE, w: 2.5, n: `anim_1_f~d${i * 200}_w${i}` });
person(s, 5.2, 1.6, 2.2, "2F5D8A");
L(s, 5.1, 3.0, 1.25, 3.0, { c: TEAL, dash: true, n: "anim_2_f_ret" });
T(s, "l'écho revient", { x: 2.2, y: 3.1, w: 2.2, h: 0.3, fontSize: 12, color: TEAL, objectName: "anim_2_f_rett" });
R(s, 6.6, 1.2, 2.9, 3.4, { fill: PANEL, line: LINE });
T(s, [{ text: "λ = c / f", options: { color: YEL, fontFace: MONO, breakLine: true } }, { text: "= 3·10⁸ / 24·10⁹ = 12,5 mm", options: { fontSize: 13, color: GREY } }], { x: 6.8, y: 1.35, w: 2.6, h: 0.8, fontSize: 18, objectName: "anim_3_f_f1" });
T(s, [{ text: "Δφ = 4π·Δd / λ", options: { color: YEL, fontFace: MONO, breakLine: true } }, { text: "respiration Δd ≈ 1 mm → Δφ ≈ 1 rad", options: { fontSize: 13, color: GREY } }], { x: 6.8, y: 2.3, w: 2.6, h: 0.8, fontSize: 18, objectName: "anim_4_f_f2" });
T(s, "Pas d'image : seulement des échos et leurs variations.", { x: 6.8, y: 3.3, w: 2.6, h: 1.0, fontSize: 14, color: GRN, objectName: "anim_5_f_f3" });
s.addNotes("Le radar émet une onde à 24 gigahertz et écoute l'écho. Sa longueur d'onde fait 12,5 millimètres. Quand on respire, la poitrine bouge d'environ un millimètre : la phase de l'écho change d'environ un radian. C'est mesurable. Le radar sait donc qu'une personne immobile est là, sans jamais faire d'image.");

s = content("Le service de présence : une machine à états", "3 · Solution");
const st = [["PRÉSENT", GRN, "vert"], ["DOUTE", GREY, "5 s"], ["DÉPART", YEL, "orange 3 s"], ["ABSENT", RED, "écran bloqué"], ["ABSENCE LONGUE", BLUE, "20 min : installation"]];
st.forEach(([t, c, sub], i) => {
  const x = 0.4 + i * 1.88;
  R(s, x, 2.0, 1.6, 0.9, { fill: PANEL, line: c, lw: 2, n: `anim_${i + 1}_f_s${i}` });
  T(s, t, { x, y: 2.08, w: 1.6, h: 0.4, fontSize: t.length > 10 ? 12 : 15, bold: true, color: c, align: "center", objectName: `anim_${i + 1}_f_s${i}t` });
  T(s, sub, { x, y: 2.48, w: 1.6, h: 0.35, fontSize: 11, color: GREY, align: "center", objectName: `anim_${i + 1}_f_s${i}s` });
  if (i > 0) L(s, x - 0.28, 2.45, x - 0.02, 2.45, { c: GREY, n: `anim_${i + 1}_f_s${i}a` });
});
L(s, 6.0, 3.05, 1.2, 3.05, { c: GRN, dash: true, n: "anim_6_f_back" });
T(s, "il revient → PRÉSENT (tout s'annule pendant l'orange)", { x: 1.2, y: 3.15, w: 5, h: 0.3, fontSize: 13, color: GRN, objectName: "anim_6_f_backt" });
T(s, "Chaque changement écrit un événement numéroté dans un journal Windows. Des tâches planifiées s'y déclenchent : « Verrou » (événement 120), « Maintenance » (130).", { x: 0.5, y: 3.8, w: 9, h: 0.9, fontSize: 14, color: GREY, objectName: "anim_7_f_j" });
s.addNotes("Le radar hésite parfois. Le service transforme cette mesure qui hésite en décisions sûres. Présent. Personne pendant 5 secondes : doute. Puis départ : lumière orange 3 secondes. Puis absent : l'écran se bloque. Après 20 minutes : absence longue, une installation peut commencer. Si l'agent revient, tout s'annule. Chaque étape est écrite dans le journal de Windows, ce qui rend tout visible et facile à diagnostiquer.");

// ======================= 4. MARTINE =======================
s = section(4, "Une journée avec Martine", "Une gestionnaire dans un bureau partagé, du matin au soir.", "4 · Martine");
s.addNotes("Quatrième partie : un scénario concret. Martine est fictive. Elle est gestionnaire et partage son bureau avec deux collègues ; des visiteurs et des prestataires passent dans la journée.");

function bureau(sl, state, led, agent, nameP) {
  desk(sl, 0.8, 3.65, 3.8);
  monitor(sl, 2.0, 2.0, 1.8, state, nameP);
  box(sl, 2.6, 3.8, led, nameP ? nameP + "bx" : undefined);
  if (agent) person(sl, 0.75, 2.4, 1.3, "2F5D8A");
}
s = content("9 h 00 · Martine lit un dossier", "4 · Martine");
clock(s, "9 h 00");
bureau(s, "open", GRN, true);
R(s, 1.6, 2.75, 0.4, 0.5, { fill: "DDE6EC", line: "A9B8C3" });
T(s, "Elle ne touche plus au clavier depuis 10 minutes.", { x: 5.6, y: 1.4, w: 3.9, h: 0.8, fontSize: 17, objectName: "anim_1_f_t1" });
T(s, "Sans le projet : écran bloqué en pleine lecture.", { x: 5.6, y: 2.35, w: 3.9, h: 0.8, fontSize: 15, color: RED, objectName: "anim_2_f_t2" });
T(s, "Avec le projet : le radar voit sa respiration. Rien ne se passe.", { x: 5.6, y: 3.25, w: 3.9, h: 0.8, fontSize: 15, color: GRN, objectName: "anim_3_f_t3" });
s.addNotes("9 heures. Martine lit un dossier papier, sans toucher au clavier. Aujourd'hui, au bout de 10 minutes, Windows la bloquerait. Avec le boîtier, la lumière reste verte : elle est là.");

s = content("10 h 00 · Elle part en réunion", "4 · Martine");
clock(s, "10 h 00");
desk(s, 0.8, 3.65, 3.8); monitor(s, 2.0, 2.0, 1.8, "open"); box(s, 2.6, 3.8, GRN);
person(s, 0.75, 2.4, 1.3, "2F5D8A", "anim_1_m~-0.9:0~t700+x~t400~d600_ag");
O(s, 2.98, 3.86, 0.12, YEL, "anim_2_f_led1");
T(s, "orange 3 s : « je crois que vous partez »", { x: 5.4, y: 1.4, w: 4.1, h: 0.6, fontSize: 15, color: YEL, objectName: "anim_2_f_t2" });
screenState(s, 2.0, 2.0, 1.8, "locked", "anim_3_f_lk");
O(s, 2.98, 3.86, 0.12, RED, "anim_3_f_led2");
T(s, "≈ 8 s après le départ : écran bloqué", { x: 5.4, y: 2.2, w: 4.1, h: 0.6, fontSize: 15, color: GRN, objectName: "anim_3_f_t3" });
person(s, 5.6, 2.9, 1.5, PUR, "anim_4_f_us");
T(s, "Un collègue passe : il ne voit qu'un écran verrouillé.", { x: 7.0, y: 3.4, w: 2.6, h: 0.8, fontSize: 15, objectName: "anim_4_f_t4" });
s.addNotes("10 heures. Martine se lève pour aller en réunion. Le radar ne la voit plus. Après 5 secondes de confirmation, la lumière passe à l'orange pendant 3 secondes : si elle était seulement penchée, tout s'annule. Elle ne revient pas : l'écran se bloque, environ 8 secondes après son départ. La valeur exacte sera mesurée par l'essai R4. Le collègue qui passe derrière son bureau ne voit qu'un écran verrouillé, et ne peut rien faire en son nom.");

s = content("12 h 20 · La pause déjeuner", "4 · Martine");
clock(s, "12 h 20");
desk(s, 0.8, 3.65, 3.8); monitor(s, 2.0, 2.0, 1.8, "locked"); box(s, 2.6, 3.8, RED);
T(s, "Absente depuis 20 minutes", { x: 5.4, y: 1.3, w: 4.1, h: 0.4, fontSize: 17, objectName: "anim_1_f_t1" });
screenState(s, 2.0, 2.0, 1.8, "install", "anim_2_f_in");
R(s, 2.25, 3.06, 1.0, 0.13, { fill: BLUE, round: false, n: "anim_2_w~t2500~d300_bar" });
const checks = ["empreinte du paquet vérifiée", "logiciel cible fermé", "aucune autre installation", "pas de redémarrage avec session ouverte"];
checks.forEach((c, i) => { mark(s, 5.4, 1.9 + i * 0.5, "y", `anim_2_f~d${300 + i * 300}_k${i}`); T(s, c, { x: 5.85, y: 1.92 + i * 0.5, w: 3.7, h: 0.3, fontSize: 14, objectName: `anim_2_f~d${300 + i * 300}_kt${i}` }); });
T(s, "Elle revient au milieu ? L'installation commencée se termine, rien de son travail n'est touché.", { x: 5.4, y: 4.05, w: 4.1, h: 0.8, fontSize: 14, color: GRN, objectName: "anim_3_f_t3" });
s.addNotes("12 heures 20. Martine est partie déjeuner depuis 20 minutes. Le technicien avait prévu une mise à jour. Avant d'installer, le système vérifie : le paquet est authentique, le logiciel est fermé, rien d'autre n'est en cours, et aucun redémarrage ne sera imposé. Si Martine revient au milieu, l'installation déjà commencée se termine, sans toucher à son travail.");

// ======================= 5. ARCHITECTURE =======================
s = section(5, "Le schéma du projet", "Qui parle à qui, et ce que Lorenzo réalise.", "5 · Architecture");
s.addNotes("Cinquième partie : l'architecture de la maquette.");

s = content("Architecture de la maquette", "5 · Architecture");
const node = (x, y, w, h, t, sub, col, n, dash) => {
  R(s, x, y, w, h, { fill: PANEL, line: col, lw: 2, dash: !!dash, n: nm(n, "r") });
  T(s, t, { x, y: y + 0.1, w, h: 0.35, fontSize: 15, bold: true, align: "center", objectName: nm(n, "t") });
  T(s, sub, { x: x + 0.05, y: y + 0.45, w: w - 0.1, h: h - 0.5, fontSize: 11, color: GREY, align: "center", objectName: nm(n, "s") });
};
node(0.4, 1.9, 2.0, 1.1, "Boîtier", "radar + ESP32 + lumière", BLUE);
node(3.2, 1.75, 2.4, 1.4, "Poste Windows 11", "service de présence\njournal + tâches", BLUE);
node(6.6, 1.0, 2.9, 1.1, "Serveur Ubuntu", "API, base, tableau de bord", BLUE, "anim_3_f_sv");
node(3.3, 3.75, 2.2, 1.0, "Contrôleur de domaine", "commun : comptes, GPO, heure", GREY, "anim_2_f_dc", true);
node(6.8, 3.75, 2.6, 1.0, "Routeur ISR 4331", "source d'heure (NTP)", GREY, "anim_2_f~d300_rt", true);
L(s, 2.4, 2.45, 3.2, 2.45, { c: BLUE, arrow: false, n: "anim_1_f_l1" });
T(s, "USB · signé", { x: 2.35, y: 2.1, w: 0.9, h: 0.3, fontSize: 10, color: BLUE, align: "center", objectName: "anim_1_f_l1t" });
O(s, 2.4, 2.38, 0.14, YEL, "anim_1_f~t200+m~0.7:0~t900~d300_pk1");
L(s, 4.4, 3.15, 4.4, 3.75, { c: GREY, arrow: false, n: "anim_2_f_l2" });
T(s, "Kerberos, DNS, LDAP", { x: 4.5, y: 3.3, w: 1.8, h: 0.3, fontSize: 10, color: GREY, objectName: "anim_2_f_l2t" });
L(s, 5.5, 4.25, 6.8, 4.25, { c: GREY, arrow: false, n: "anim_2_f_l3" });
T(s, "NTP", { x: 5.9, y: 3.95, w: 0.6, h: 0.3, fontSize: 10, color: GREY, objectName: "anim_2_f_l3t" });
L(s, 5.6, 2.1, 6.6, 1.6, { c: BLUE, arrow: false, n: "anim_3_f_l4" });
T(s, "HTTPS · jour, sans heure", { x: 5.0, y: 1.25, w: 1.6, h: 0.5, fontSize: 10, color: BLUE, objectName: "anim_3_f_l4t" });
O(s, 5.55, 2.03, 0.14, YEL, "anim_3_f~t200+m~1.0:-0.5~t900~d300_pk2");
R(s, 0.4, 3.75, 2.6, 1.0, { fill: BG, line: BLUE, lw: 2, n: "anim_4_f_lg1" });
T(s, "cadre plein : réalisé par Lorenzo\npointillés : fourni par le lycée", { x: 0.5, y: 3.85, w: 2.4, h: 0.8, fontSize: 11, color: GREY, objectName: "anim_4_f_lg2" });
s.addNotes("Clic 1 : le boîtier parle au poste par USB, chaque message est signé. Clic 2 : le poste utilise le réseau en place, le contrôleur de domaine commun et l'heure donnée par le routeur. Lorenzo ne les configure pas : il les exploite et capture les échanges, c'est la compétence C10. Clic 3 : le serveur reçoit seulement les résultats d'installation, datés au jour, jamais l'heure des absences.");

// ======================= 6. SÉCURITÉ =======================
s = section(6, "Et si on triche ?", "Un faux boîtier qui dit toujours « présent ».", "6 · Sécurité");
s.addNotes("Sixième partie : la cybersécurité, avec une démonstration.");

s = content("Le faux boîtier", "6 · Sécurité");
T(s, "Sans protection", { x: 0.5, y: 1.05, w: 4.3, h: 0.4, fontSize: 18, bold: true, color: RED });
R(s, 0.5, 1.55, 1.3, 0.5, { fill: PANEL2, line: RED, lw: 2 }); T(s, "faux", { x: 0.5, y: 1.55, w: 1.3, h: 0.5, fontSize: 14, color: RED, align: "center", valign: "middle" });
L(s, 1.8, 1.8, 3.0, 1.8, { c: RED });
R(s, 3.0, 1.55, 1.6, 0.5, { fill: PANEL2, line: LINE }); T(s, "PC", { x: 3.0, y: 1.55, w: 1.6, h: 0.5, fontSize: 14, align: "center", valign: "middle" });
T(s, "« présent » « présent » « présent »…", { x: 0.5, y: 2.2, w: 4.3, h: 0.4, fontSize: 14, color: GREY, fontFace: MONO, objectName: "anim_1_f_a1" });
T(s, "Le PC le croit : écran ouvert, personne devant.", { x: 0.5, y: 2.7, w: 4.3, h: 0.6, fontSize: 15, color: RED, objectName: "anim_1_f~d500_a2" });
T(s, "Avec le code secret", { x: 5.2, y: 1.05, w: 4.3, h: 0.4, fontSize: 18, bold: true, color: GRN, objectName: "anim_2_f_b0" });
T(s, [{ text: "message = « présent » + compteur", options: { breakLine: true } }, { text: "preuve = HMAC-SHA256(clé, message)" }], { x: 5.2, y: 1.55, w: 4.3, h: 0.8, fontSize: 14, fontFace: MONO, color: YEL, objectName: "anim_2_f_b1" });
T(s, "La clé est créée par le vrai boîtier à son installation (appui physique). Le faux ne la connaît pas.", { x: 5.2, y: 2.45, w: 4.3, h: 0.8, fontSize: 14, color: GREY, objectName: "anim_3_f_b2" });
T(s, "Preuve fausse → message refusé → alerte → écran bloqué.", { x: 5.2, y: 3.3, w: 4.3, h: 0.6, fontSize: 15, color: GRN, bold: true, objectName: "anim_4_f_b3" });
T(s, "Le compteur empêche de rejouer un vieux message enregistré.", { x: 0.5, y: 4.3, w: 9, h: 0.4, fontSize: 15, color: GREY, objectName: "anim_5_f_c" });
s.addNotes("La démonstration qui marque le jury. Sans protection, un second ESP32 programmé pour dire toujours présent garde la session ouverte. Avec la protection, chaque message porte une preuve calculée avec une clé que seul le vrai boîtier connaît. Le faux est démasqué en une seconde. Le compteur empêche de rejouer un ancien message. Limite à annoncer : la clé est aussi sur le poste, un administrateur local pourrait la lire ; d'où des agents non administrateurs.");

s = content("Les autres protections, et la vie privée", "6 · Sécurité");
const prot = [["Journal protégé", "un agent ne peut pas écrire un faux « absence longue »"], ["Programmes signés", "un script modifié refuse de démarrer"], ["Agents non administrateurs", "ni arrêt du service, ni lecture de la clé"], ["Filet de sécurité", "radar masqué ou débranché : blocage après 10 min"]];
prot.forEach(([t, d], i) => { mark(s, 0.5, 1.15 + i * 0.68, "y", `anim_1_f~d${i * 200}_p${i}`); T(s, t, { x: 0.95, y: 1.1 + i * 0.68, w: 3.8, h: 0.3, fontSize: 15, bold: true, objectName: `anim_1_f~d${i * 200}_pt${i}` }); T(s, d, { x: 0.95, y: 1.4 + i * 0.68, w: 3.8, h: 0.3, fontSize: 12, color: GREY, objectName: `anim_1_f~d${i * 200}_pd${i}` }); });
R(s, 5.2, 1.1, 2.0, 2.7, { fill: PANEL, line: TEAL, lw: 2, n: "anim_2_f_k" });
T(s, "Reste sur le poste", { x: 5.3, y: 1.2, w: 1.8, h: 0.4, fontSize: 13, bold: true, color: TEAL, objectName: "anim_2_f_kt" });
T(s, "présent / absent\nheures de départ\net de retour", { x: 5.3, y: 1.7, w: 1.8, h: 1.5, fontSize: 12, color: GREY, objectName: "anim_2_f_kd" });
R(s, 7.5, 1.1, 2.0, 2.7, { fill: PANEL, line: GREY, lw: 2, n: "anim_3_f_e" });
T(s, "Part au serveur", { x: 7.6, y: 1.2, w: 1.8, h: 0.4, fontSize: 13, bold: true, objectName: "anim_3_f_et" });
T(s, "« installé », avec le jour, sans l'heure\nreports et raisons\npannes du boîtier", { x: 7.6, y: 1.7, w: 1.8, h: 1.8, fontSize: 12, color: GREY, objectName: "anim_3_f_ed" });
T(s, "On sait si le bureau est occupé. Jamais qui, ni combien de temps.", { x: 5.2, y: 4.0, w: 4.3, h: 0.7, fontSize: 15, color: YEL, objectName: "anim_4_f_v" });
s.addNotes("Les autres protections sont classiques et démontrées par des tests. Et la vie privée : la présence d'un agent est une donnée personnelle. Elle ne quitte jamais le poste. En entreprise, il faudrait l'avis du délégué à la protection des données et l'information des agents avant tout essai.");

// ======================= 7. PHYSIQUE =======================
s = section(7, "La physique", "Chaque réglage vient d'une mesure.", "7 · Physique");
s.addNotes("Septième partie : le volet physique, qui fixe les réglages.");

s = content("L'agent, ou le collègue d'à côté ?", "7 · Physique");
const X0 = 0.9, PXm = 2.4;
R(s, X0 - 0.5, 2.05, 0.4, 0.5, { fill: PANEL2, line: BLUE, lw: 2 });
for (let g = 0; g < 3; g++) { R(s, X0 + g * 0.75 * PXm, 1.4, 0.75 * PXm, 1.8, { fill: g % 2 ? PANEL : PANEL2, line: LINE, round: false }); T(s, "porte " + g, { x: X0 + g * 0.75 * PXm, y: 1.1, w: 0.75 * PXm, h: 0.3, fontSize: 12, color: GREY, align: "center", fontFace: MONO }); }
R(s, X0, 1.4, 1.0 * PXm, 1.8, { fill: "15343A", line: TEAL, round: false, n: "anim_2_f_zone" });
T(s, "zone retenue ≈ 1,0 m (essais R2–R3)", { x: X0, y: 3.25, w: 2.6, h: 0.3, fontSize: 12, color: TEAL, objectName: "anim_2_f_zt" });
O(s, X0 + 0.6 * PXm - 0.2, 2.1, 0.4, "2F5D8A", "anim_1_f_ag");
T(s, "agent 0,6 m", { x: X0 + 0.6 * PXm - 0.6, y: 2.55, w: 1.2, h: 0.3, fontSize: 11, color: WHITE, align: "center", objectName: "anim_1_f_agt" });
O(s, X0 + 1.4 * PXm - 0.2, 2.1, 0.4, PUR, "anim_3_f_us");
T(s, "collègue 1,4 m : ignoré", { x: X0 + 1.4 * PXm - 1.0, y: 2.55, w: 2.0, h: 0.3, fontSize: 11, color: PUR, align: "center", objectName: "anim_3_f_ust" });
T(s, [{ text: "ΔR = c / (2B) = 3·10⁸ / (2 × 250·10⁶) = 0,6 m", options: { fontFace: MONO, color: YEL, breakLine: true } }, { text: "le module découpe l'espace en tranches de 0,75 m", options: { fontSize: 13, color: GREY } }], { x: 0.5, y: 3.75, w: 9, h: 0.8, fontSize: 16, objectName: "anim_4_f_f" });
s.addNotes("Le radar ne donne pas une distance au centimètre : il découpe l'espace en tranches de 0,75 mètre, les portes. La finesse théorique vaut c sur 2B, soit 0,6 mètre pour un balayage de 250 mégahertz. Les essais R2 et R3 placent l'agent puis un collègue à différentes distances pour fixer la limite, environ 1 mètre ici : le collègue du bureau voisin, ou celui qui passe dans l'allée, n'est pas compté. À l'accueil, c'est la même chose pour l'usager de l'autre côté du comptoir.");

s = content("Les mesures, avec leurs incertitudes", "7 · Physique");
const es = [["R1", "Seuils", "chaise vide, agent immobile, agent qui lit : énergie par porte"], ["R2–R3", "Zone", "agent de 0,4 à 1,0 m, puis collègue au bureau voisin ou dans l'allée"], ["R4", "Délai", "20 départs chronométrés à l'oscilloscope : l'indicateur clé"], ["R5", "Fausses alertes", "ventilateur, rideau, mobilier métallique"]];
es.forEach(([c, t, d], i) => { T(s, c, { x: 0.5, y: 1.15 + i * 0.62, w: 0.9, h: 0.4, fontSize: 16, bold: true, color: BLUE, fontFace: MONO, objectName: `anim_${i + 1}_f_e${i}` }); T(s, [{ text: t + " · ", options: { bold: true } }, { text: d, options: { color: GREY } }], { x: 1.45, y: 1.15 + i * 0.62, w: 4.3, h: 0.55, fontSize: 13, objectName: `anim_${i + 1}_f_et${i}` }); });
R(s, 6.0, 1.15, 3.5, 1.3, { fill: PANEL, line: YEL, n: "anim_5_f_u" });
T(s, [{ text: "u = s / √N", options: { fontFace: MONO, color: YEL, fontSize: 20, breakLine: true } }, { text: "sur les 20 départs de R4 ; chaque réglage est donné avec son incertitude", options: { fontSize: 12, color: GREY } }], { x: 6.15, y: 1.25, w: 3.2, h: 1.1, objectName: "anim_5_f_ut" });
R(s, 6.0, 2.7, 3.5, 1.6, { fill: PANEL, line: GRN, n: "anim_6_f_x" });
T(s, [{ text: "Et les ondes ?", options: { bold: true, breakLine: true } }, { text: "S = PIRE/(4πr²) ≈ 0,03 W/m²", options: { fontFace: MONO, color: GRN, fontSize: 13, breakLine: true } }, { text: "limite public : 10 W/m² → ≈ 0,3 % (majorant)", options: { fontSize: 12, color: GREY } }], { x: 6.15, y: 2.8, w: 3.2, h: 1.4, fontSize: 15, objectName: "anim_6_f_xt" });
s.addNotes("Quatre essais utiles. R1 fixe le seuil de présence. R2 et R3 fixent la zone. R4 est l'indicateur clé : vingt départs chronométrés à l'oscilloscope donnent le délai moyen et son incertitude, u égale s sur racine de N. R5 vérifie les fausses alertes. Enfin, l'exposition aux ondes : même avec un majorant de 100 milliwatts à 50 centimètres, on est à environ 0,3 % de la limite pour le public. Ce calcul est une estimation, pas une mesure.");

// ======================= 8. DONNÉE =======================
s = section(8, "Valoriser la donnée", "Des chiffres sur les postes, jamais sur les personnes.", "8 · Donnée");
s.addNotes("Huitième partie : la valorisation de la donnée, qui donne son nom à l'épreuve.");

s = content("Le tableau de bord du parc et l'apport mesuré", "8 · Donnée");
R(s, 0.5, 1.1, 4.4, 3.6, { fill: PANEL, line: LINE });
T(s, "Tableau de bord du technicien", { x: 0.7, y: 1.2, w: 4, h: 0.35, fontSize: 15, bold: true });
const kp = [["installées du premier coup", GRN], ["reportées : logiciel ouvert", YEL], ["reportées : agent revenu", YEL], ["postes en retard", RED]];
kp.forEach(([t, c], i) => { R(s, 0.75, 1.75 + i * 0.68, 0.25, 0.25, { fill: c, round: false, n: `anim_1_f~d${i * 200}_k${i}` }); T(s, t, { x: 1.15, y: 1.72 + i * 0.68, w: 3.6, h: 0.3, fontSize: 14, objectName: `anim_1_f~d${i * 200}_kt${i}` }); });
T(s, "Essai R6 : une journée de travail jouée", { x: 5.3, y: 1.15, w: 4.2, h: 0.35, fontSize: 15, bold: true, objectName: "anim_2_f_r6" });
T(s, "installations qui tombent devant l'agent", { x: 5.3, y: 1.5, w: 4.2, h: 0.3, fontSize: 12, color: GREY, objectName: "anim_2_f_r6s" });
L(s, 5.5, 4.3, 9.3, 4.3, { c: GREY, arrow: false, n: "anim_2_f_ax" });
R(s, 6.0, 2.1, 1.1, 2.2, { fill: RED, round: false, n: "anim_3_f_b1" });
T(s, "N", { x: 6.0, y: 1.8, w: 1.1, h: 0.3, fontSize: 16, bold: true, color: RED, align: "center", objectName: "anim_3_f_b1n" });
T(s, "outil seul\n(inactivité)", { x: 5.8, y: 4.35, w: 1.5, h: 0.5, fontSize: 11, color: GREY, align: "center", objectName: "anim_3_f_b1t" });
R(s, 7.8, 4.25, 1.1, 0.05, { fill: GRN, round: false, n: "anim_4_f_b2" });
T(s, "0", { x: 7.8, y: 3.9, w: 1.1, h: 0.3, fontSize: 16, bold: true, color: GRN, align: "center", objectName: "anim_4_f_b2n" });
T(s, "outil\n+ boîtier", { x: 7.6, y: 4.35, w: 1.5, h: 0.5, fontSize: 11, color: GREY, align: "center", objectName: "anim_4_f_b2t" });
s.addNotes("Le technicien suit son parc : ce qui s'est installé du premier coup, ce qui a été reporté et pourquoi, les postes en retard. Aucune donnée sur les agents. Puis l'essai R6 : une séance de travail jouée, avec frappe, lecture, collègue qui passe et vraies absences (réunion, déjeuner). On compte les installations qui seraient tombées devant l'agent avec l'inactivité de Windows : N, valeur à mesurer. Avec le boîtier : zéro.");

// ======================= 9. PARCOURS =======================
s = section(9, "Le parcours", "Environ 150 heures, de janvier à mai.", "9 · Parcours");
s.addNotes("Neuvième partie : l'organisation du projet.");

s = content("V1 obligatoire, V2 visée, puis les extensions", "9 · Parcours");
const cols = [["V1 · ≈ 108 h", GRN, "boîtier et lumière\nblocage avec avertissement\nmessages signés\nfilet de sécurité\nessais R1 à R5\nréseau capturé"], ["V2 · ≈ 40 h", BLUE, "installation pendant les absences\nserveur\ntableau de bord du parc\nessai R6\nposte neuf à paliers"], ["Extensions", GREY, "assistant de réglage\nradar masqué détecté\nveille du soir\nlien avec l'outil réel"]];
cols.forEach(([t, c, d], i) => { R(s, 0.5 + i * 3.05, 1.1, 2.85, 2.6, { fill: PANEL, line: c, lw: 2, dash: i === 2, n: `anim_${i + 1}_f_c${i}` }); T(s, t, { x: 0.7 + i * 3.05, y: 1.2, w: 2.5, h: 0.4, fontSize: 17, bold: true, color: c, objectName: `anim_${i + 1}_f_ct${i}` }); T(s, d, { x: 0.7 + i * 3.05, y: 1.7, w: 2.5, h: 1.9, fontSize: 13, color: GREY, objectName: `anim_${i + 1}_f_cd${i}` }); });
const rv = [["R1 · 29/01", "besoin chiffré, maquette, le radar détecte"], ["R2 · 19/03", "V1 complète"], ["R3 · 14/05", "V2, démonstration complète"]];
rv.forEach(([t, d], i) => { chip(s, 0.5 + i * 3.05, 3.95, t, YEL, `anim_4_f~d${i * 200}_r${i}`, 1.4); T(s, d, { x: 0.5 + i * 3.05, y: 4.38, w: 2.85, h: 0.5, fontSize: 12, color: GREY, objectName: `anim_4_f~d${i * 200}_rt${i}` }); });
s.addNotes("La version 1 représente environ 108 heures, la version 2 environ 40 heures. Il ne reste presque pas de marge : les extensions ne viennent que si Lorenzo est en avance à la revue 2. Trois revues jalonnent le projet : fin janvier, mi-mars, mi-mai. Dates à confirmer avec le calendrier d'alternance.");

// ======================= CONCLUSION =======================
pres.addSection({ title: "Conclusion" });
s = pres.addSlide({ masterName: "TITRE", sectionTitle: "Conclusion" });
T(s, "En une phrase", { x: 0.6, y: 0.6, w: 6, h: 0.35, fontSize: 14, color: GREY });
T(s, [{ text: "Le poste se " }, { text: "protège", options: { color: GRN } }, { text: " quand l'agent part, et " }, { text: "travaille", options: { color: BLUE } }, { text: " quand il n'est pas là." }], { x: 0.6, y: 1.05, w: 8.8, h: 1.3, fontSize: 32 });
const kpis = [["≈ 10 s", "avant le blocage, au lieu de 10 min (R4)", GRN], ["0", "installation devant l'agent, contre N (R6)", BLUE], ["0", "image filmée : un radar, pas une caméra", YEL]];
kpis.forEach(([v, d, c], i) => { T(s, v, { x: 0.6 + i * 3.0, y: 2.8, w: 2.8, h: 0.8, fontSize: 40, bold: true, color: c, objectName: `anim_${i + 1}_f_k${i}` }); T(s, d, { x: 0.6 + i * 3.0, y: 3.65, w: 2.7, h: 0.7, fontSize: 13, color: GREY, objectName: `anim_${i + 1}_f_kd${i}` }); });
T(s, "Besoin issu de l'entreprise, réalisation au lycée sur maquette, à faire valider par l'académie.", { x: 0.6, y: 4.75, w: 8.8, h: 0.3, fontSize: 11, color: GREY });
s.addNotes("Conclure par la phrase et les trois chiffres. Les deux premiers seront remplacés par les vraies mesures. Rappeler que le boîtier ne remplace pas les outils de l'administration : il leur apporte l'information qui leur manque. Puis ouvrir aux questions.");

pres.writeFile({ fileName: "deck_brut.pptx" }).then(() => console.log("deck_brut.pptx écrit"));
