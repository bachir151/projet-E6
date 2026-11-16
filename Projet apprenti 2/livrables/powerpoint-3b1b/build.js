// Présentation E6 de Yaksan, style « tableau noir mathématique » (3Blue1Brown) : fond sombre, serif,
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
pres.title = "Projet E6 – Qui sait ce qui s'est passé ? La boîte noire du poste";
pres.author = "Yaksan – BTS CIEL option A";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };

const FOOT = "Projet E6 · Yaksan · BTS CIEL option A · maquette au lycée, données fictives";
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


// ---------- aides propres à ce projet ----------
// écran noir (PC éteint ou coupé)
function blackScreen(s, x, y, w, n) {
  const h = w * 0.62;
  R(s, x, y, w, h, { fill: "22262E", line: LINE, r: 0.05, n: nm(n, "f") });
  R(s, x + w * 0.42, y + h, w * 0.16, h * 0.18, { fill: LINE, round: false, n: nm(n, "p") });
  R(s, x + w * 0.05, y + h * 0.08, w * 0.9, h * 0.84, { fill: "030405", round: false, n: nm(n, "s") });
  return h;
}
// écran allumé, sans contenu précis
function plainScreen(s, x, y, w, n) {
  const h = w * 0.62;
  R(s, x, y, w, h, { fill: "22262E", line: LINE, r: 0.05, n: nm(n, "f") });
  R(s, x + w * 0.42, y + h, w * 0.16, h * 0.18, { fill: LINE, round: false, n: nm(n, "p") });
  R(s, x + w * 0.05, y + h * 0.08, w * 0.9, h * 0.84, { fill: "2E3A48", round: false, n: nm(n, "s") });
  for (let i = 0; i < 3; i++) R(s, x + w * 0.1, y + h * (0.22 + i * 0.22), w * (i === 2 ? 0.4 : 0.7), h * 0.07, { fill: "4A5A6C", round: false, n: nm(n, "l" + i) });
  return h;
}
// ligne de journal en police à chasse fixe
const logLine = (s, x, y, w, text, color, n) => T(s, text, { x, y, w, h: 0.28, fontSize: 12, fontFace: MONO, color: color || WHITE, objectName: n });
// boîte de texte avec un titre, un sous-titre et un cadre coloré
const card = (s, x, y, w, h, title, sub, col, n) => {
  R(s, x, y, w, h, { fill: PANEL, line: col, lw: 2, n: nm(n, "r") });
  T(s, title, { x: x + 0.15, y: y + 0.1, w: w - 0.3, h: 0.4, fontSize: 16, bold: true, color: col, objectName: nm(n, "t") });
  T(s, sub, { x: x + 0.15, y: y + 0.55, w: w - 0.3, h: h - 0.65, fontSize: 13, color: WHITE, objectName: nm(n, "s") });
};
// ligne d'un tableau de comparaison (3 colonnes de ✓ ✗ ~)
function tableRows(s, rows, heads, y0, step, lastIsOurs) {
  heads.forEach((h, i) => T(s, h, { x: 4.0 + i * 1.85, y: y0 - 0.75, w: 1.8, h: 0.6, fontSize: 11, color: GREY, align: "center" }));
  rows.forEach((r, i) => {
    const y = y0 + i * step, last = lastIsOurs && i === rows.length - 1;
    if (last) R(s, 0.45, y - 0.07, 9.1, 0.46, { fill: "15343A", line: TEAL, n: "anim_4_f_hl" });
    T(s, r[0], { x: 0.6, y, w: 3.3, h: 0.32, fontSize: 14, bold: last, color: last ? TEAL : WHITE, valign: "middle", objectName: last ? "anim_4_f_hlt" : undefined });
    for (let c = 0; c < 3; c++) mark(s, 4.75 + c * 1.85, y + 0.01, r[c + 1], `anim_${last ? 4 : c + 1}_f~d${i * 120}_m${i}${c}`);
  });
}

// ======================= OUVERTURE =======================
pres.addSection({ title: "Ouverture" });
let s = pres.addSlide({ masterName: "TITRE", sectionTitle: "Ouverture" });
T(s, "BTS CIEL option A · Épreuve E6 · Session 2027", { x: 0.6, y: 0.55, w: 6, h: 0.3, fontSize: 12, color: GREY });
T(s, [{ text: "Qui " }, { text: "sait", options: { color: YEL } }, { text: " ce qui s'est passé ?" }], { x: 0.6, y: 1.2, w: 5.6, h: 1.9, fontSize: 40 });
T(s, "Boîte noire du poste : un témoin extérieur pour comprendre les pannes, les mises à jour ratées et les échecs de carte", { x: 0.6, y: 3.2, w: 5.4, h: 0.9, fontSize: 16, color: GREY });
T(s, "Yaksan · apprenti · besoin issu de l'entreprise, réalisation au lycée sur maquette", { x: 0.6, y: 4.55, w: 8.6, h: 0.3, fontSize: 12, color: GREY });
blackScreen(s, 6.6, 1.3, 2.6);
box(s, 7.2, 3.35, GRN, "anim_1_x_bx");
T(s, "?", { x: 7.3, y: 1.6, w: 1.2, h: 1.2, fontSize: 72, color: YEL, align: "center", objectName: "anim_1_f~d400_q" });
s.addNotes("Ouvrir par la question. Un PC vient de s'éteindre pendant une mise à jour. Personne ne sait pourquoi. Windows ne peut rien écrire quand il est coupé net. Tout le projet part de cette question : qui sait ce qui s'est passé ? La réponse : un témoin extérieur, comme la boîte noire d'un avion.");

// ======================= 1. PROBLÈME =======================
s = section(1, "Le problème", "Un service administratif, deux plaintes qui reviennent, et des réparations à l'aveugle.", "1 · Le problème");
s.addNotes("Première partie : le problème, tel que le tuteur l'a décrit. Le réseau du service est isolé d'Internet, les agents travaillent sur Windows 11.");

s = content("Deux plaintes qui reviennent", "1 · Le problème");
card(s, 0.5, 1.15, 4.3, 2.55, "Mises à jour qui échouent", "Les mises à jour obligatoires échouent environ deux fois par mois sur les postes suivis.", YEL, "p1");
T(s, "≈ 2 / mois", { x: 0.7, y: 2.75, w: 3.9, h: 0.7, fontSize: 36, bold: true, color: YEL, objectName: "anim_1_f_n1" });
card(s, 5.2, 1.15, 4.3, 2.55, "Carte qui dysfonctionne", "Au badgeage, la carte ne permet plus d'entrer sur la plateforme sécurisée qui contient tous les logiciels métiers.", BLUE, "anim_2_f_p2");
T(s, [{ text: "Dans les deux cas : on répare " }, { text: "à l'aveugle", options: { color: RED, bold: true } }, { text: " (redémarrer, effacer les cookies) sans connaître la cause." }], { x: 0.5, y: 4.0, w: 9, h: 0.9, fontSize: 18, objectName: "anim_3_f_k" });
s.addNotes("Clic 1 : première plainte, les mises à jour obligatoires qui échouent, environ deux par mois. Clic 2 : seconde plainte, la carte qui dysfonctionne au badgeage pour entrer sur la plateforme qui contient les logiciels métiers. Clic 3 : dans les deux cas on répare à l'aveugle. C'est une hypothèse chiffrée à valider par le tuteur.");

s = content("Windows ne peut rien écrire quand il est coupé net", "1 · Le problème");
T(s, "Ce que Sophie vit :", { x: 0.5, y: 1.05, w: 9, h: 0.35, fontSize: 15, color: GREY });
R(s, 0.8, 1.9, 5.2, 0.4, { fill: BLUE, round: false, n: "anim_1_w~t1500_bar" });
T(s, "installation de la mise à jour…", { x: 0.9, y: 1.93, w: 5.0, h: 0.34, fontSize: 13, color: BG, bold: true, objectName: "anim_1_f~d300_bart" });
L(s, 6.0, 1.45, 6.0, 2.75, { c: RED, w: 3, arrow: false, n: "anim_2_f_cut" });
T(s, "appui long sur le bouton", { x: 4.7, y: 1.1, w: 2.6, h: 0.3, fontSize: 13, color: RED, bold: true, align: "center", objectName: "anim_2_f_cutt" });
R(s, 6.0, 1.9, 3.4, 0.4, { fill: "030405", line: LINE, round: false, n: "anim_2_f~d300_dark" });
T(s, "écran noir", { x: 6.1, y: 1.93, w: 3.2, h: 0.34, fontSize: 13, color: GREY, objectName: "anim_2_f~d300_darkt" });
T(s, "Ce que Windows a écrit dans son journal :", { x: 0.5, y: 3.0, w: 9, h: 0.35, fontSize: 15, color: GREY, objectName: "anim_3_f_j0" });
logLine(s, 0.8, 3.45, 5.2, "…installation en cours", WHITE, "anim_3_f_j1");
R(s, 6.0, 3.42, 3.4, 0.34, { fill: BG, line: RED, dash: true, round: false, n: "anim_3_f~d400_j2" });
T(s, "rien : coupé net", { x: 6.0, y: 3.42, w: 3.4, h: 0.34, fontSize: 13, color: RED, align: "center", valign: "middle", objectName: "anim_3_f~d400_j2t" });
T(s, [{ text: "Au redémarrage, le journal dit qu'il y a eu un arrêt. " }, { text: "Il ne dit pas pourquoi.", options: { color: YEL, bold: true } }], { x: 0.5, y: 4.2, w: 9, h: 0.7, fontSize: 18, objectName: "anim_4_f_k" });
s.addNotes("Clic 1 : Sophie lance la mise à jour, la barre avance. Clic 2 : le PC se fige, elle appuie longuement sur le bouton, l'écran devient noir. Clic 3 : dans le journal Windows, il y a la dernière ligne avant la coupure, puis rien : Windows n'a pas eu le temps d'écrire. Clic 4 : au redémarrage on sait qu'il y a eu un arrêt anormal, pas s'il s'agit d'un bouton, d'une coupure de courant ou d'un PC figé.");

s = content("Un seul symptôme, cinq causes possibles", "1 · Le problème");
person(s, 0.5, 1.55, 1.3, PUR);
T(s, "Karim badge.\nRien ne se passe.", { x: 0.3, y: 3.2, w: 2.2, h: 0.7, fontSize: 13, color: GREY, align: "center" });
const maillons = ["Carte", "Lecteur", "Windows", "Logiciel de la carte", "Plateforme"];
maillons.forEach((m, i) => {
  const x = 2.7 + i * 1.4;
  R(s, x, 1.9, 1.2, 0.95, { fill: PANEL, line: YEL, lw: 2, n: `anim_${i + 1}_f_c${i}` });
  T(s, m, { x, y: 1.9, w: 1.2, h: 0.95, fontSize: 13, bold: true, align: "center", valign: "middle", objectName: `anim_${i + 1}_f_c${i}t` });
  T(s, "?", { x, y: 2.9, w: 1.2, h: 0.5, fontSize: 28, color: YEL, align: "center", objectName: `anim_${i + 1}_f_c${i}q` });
});
T(s, [{ text: "Où est la panne ? Aujourd'hui, on essaie " }, { text: "au hasard", options: { color: RED, bold: true } }, { text: "." }], { x: 0.5, y: 4.1, w: 9, h: 0.6, fontSize: 18, objectName: "anim_6_f_k" });
s.addNotes("Pour l'agent, il n'y a qu'un symptôme : ça ne marche pas. Mais entre la carte et la plateforme il y a cinq maillons : la carte elle-même, le lecteur, Windows, le logiciel de la carte, puis la plateforme. N'importe lequel peut être en cause. Aujourd'hui, le support redémarre, efface les cookies, et espère.");

// ======================= 2. EXISTANT =======================
s = section(2, "Ce qui existe déjà", "Des outils utiles. Aucun ne répond à la question : pourquoi ?", "2 · Existant");
s.addNotes("Deuxième partie : avant d'inventer, regarder ce qui existe. Attention : cette partie est écrite de mémoire, elle doit être vérifiée avant le dossier final.");

s = content("Pannes : ce que font les outils existants", "2 · Existant");
tableRows(s, [
  ["Observateur d'événements", "y", "p", "y"], ["Moniteur de fiabilité", "y", "n", "y"], ["WSUS · SCCM · Intune", "p", "n", "n"],
  ["Gestion matérielle hors système", "y", "p", "n"], ["Boîtier + corrélateur", "y", "y", "y"],
], ["Voit qu'il y a eu\nun arrêt ?", "Dit la cause :\nbouton, secteur, figé ?", "Utilisable par\nle support ?"], 1.75, 0.6, true);
T(s, "~ = parfois, à vérifier sur la maquette", { x: 0.6, y: 4.95, w: 5, h: 0.3, fontSize: 11, color: YEL });
s.addNotes("Je remplis le tableau colonne par colonne. L'observateur d'événements et le moniteur de fiabilité voient l'arrêt, mais ne voient que ce que Windows a pu écrire. Windows note parfois l'heure d'un appui long sur le bouton : à vérifier sur la maquette, le jury peut poser la question. Les outils de gestion centrale, WSUS, SCCM, Intune, sont gérés par une autre équipe et donnent des codes d'erreur de mise à jour. La gestion matérielle hors système existe sur certains PC pros, mais elle est chère et lourde. La dernière ligne : le boîtier avec le corrélateur.");

s = content("Carte : chaque outil ne voit qu'un morceau", "2 · Existant");
maillons.forEach((m, i) => {
  R(s, 0.5 + i * 1.82, 1.1, 1.7, 0.6, { fill: PANEL, line: GREY });
  T(s, m, { x: 0.5 + i * 1.82, y: 1.1, w: 1.7, h: 0.6, fontSize: 12, bold: true, align: "center", valign: "middle" });
});
const bars = [["certutil -scinfo : carte et certificats", 2, 2, BLUE], ["Journaux « SmartCard » de Windows", 1, 2, GRN], ["Outils des fabricants (OpenSC, pcsc_scan)", 0, 2, PUR]];
bars.forEach(([t, from, n, c], i) => {
  const y = 2.0 + i * 0.62;
  R(s, 0.5 + from * 1.82, y, n * 1.82 - 0.12, 0.45, { fill: PANEL2, line: c, lw: 2, n: `anim_${i + 1}_f_b${i}` });
  T(s, t, { x: 0.6 + from * 1.82, y, w: n * 1.82 - 0.3, h: 0.45, fontSize: 11, color: c, valign: "middle", objectName: `anim_${i + 1}_f_b${i}t` });
});
T(s, "Aucun outil ne remonte toute la chaîne, dans l'ordre, jusqu'à la plateforme.", { x: 0.5, y: 4.0, w: 9, h: 0.5, fontSize: 18, color: YEL, objectName: "anim_4_f_k" });
T(s, "Les tickets de support (GLPI…) gardent la trace, mais ne font aucun diagnostic.", { x: 0.5, y: 4.6, w: 9, h: 0.3, fontSize: 13, color: GREY, objectName: "anim_5_f_t" });
s.addNotes("Pour la carte, il existe des outils : certutil lit la carte et ses certificats, les journaux SmartCard de Windows suivent le lecteur, et les outils des fabricants testent la carte et le lecteur. Chacun voit un morceau. Personne ne remonte la chaîne entière, dans l'ordre, jusqu'à la plateforme. Les tickets gardent la trace, mais ne diagnostiquent rien. Les zones couvertes par chaque outil sont schématiques.");

s = content("Ce que le projet apporte de nouveau", "2 · Existant");
const nw = [["1", "Un témoin indépendant de Windows", "il garde ce qui s'est passé, même quand le PC est coupé net"], ["2", "Une cause probable, en croisant deux sources", "le boîtier et les journaux ; s'ils divergent : « non concluant »"], ["3", "La chaîne de la carte, dans l'ordre", "le premier maillon qui échoue est la cause"], ["4", "Des statistiques pour agir", "les causes et les maillons qui reviennent"]];
nw.forEach(([n, t, d], i) => {
  const y = 1.1 + i * 0.92;
  O(s, 0.55, y + 0.1, 0.5, BG, `anim_${i + 1}_f_o${i}`, TEAL);
  T(s, n, { x: 0.55, y: y + 0.1, w: 0.5, h: 0.5, fontSize: 18, bold: true, color: TEAL, align: "center", valign: "middle", objectName: `anim_${i + 1}_f_n${i}` });
  T(s, t, { x: 1.3, y, w: 8.2, h: 0.4, fontSize: 18, bold: true, objectName: `anim_${i + 1}_f_t${i}` });
  T(s, d, { x: 1.3, y: y + 0.42, w: 8.2, h: 0.35, fontSize: 14, color: GREY, objectName: `anim_${i + 1}_f_d${i}` });
});
T(s, "Le projet complète les outils de l'administration. Il ne les remplace pas.", { x: 0.5, y: 4.75, w: 9, h: 0.4, fontSize: 15, color: YEL, objectName: "anim_5_f_k" });
s.addNotes("Quatre apports. Un : un témoin indépendant de Windows. Deux : une cause probable obtenue en croisant le boîtier et les journaux, avec le droit de répondre non concluant. Trois : la chaîne de la carte vérifiée dans l'ordre. Quatre : des statistiques pour agir sur les pannes qui reviennent. Le projet n'a aucun accès au réseau du service ni aux outils de l'administration : il les complète.");

// ======================= 3. SOLUTION =======================
s = section(3, "La solution", "Un boîtier témoin, un outil qui croise les récits, un diagnostic qui remonte la chaîne.", "3 · Solution");
s.addNotes("Troisième partie : la solution, construite à partir de la cause.");

s = content("Le boîtier : un témoin posé sur le PC", "3 · Solution");
const sens = [["Voyants du PC", "phototransistors sur la façade"], ["5 V de l'USB", "présent ou perdu"], ["Courant du lecteur", "INA219 sur câble USB"]];
sens.forEach(([t, d], i) => {
  card(s, 0.4, 1.05 + i * 1.1, 3.0, 0.95, t, d, BLUE, `anim_${i + 1}_f_s${i}`);
  L(s, 3.4, 1.52 + i * 1.1, 4.1, 2.55, { c: BLUE, arrow: false, n: `anim_${i + 1}_f_a${i}` });
});
R(s, 4.1, 1.7, 2.4, 1.7, { fill: PANEL2, line: GRN, lw: 2, n: "anim_4_f_bx" });
T(s, "Boîtier (ESP32)", { x: 4.1, y: 1.8, w: 2.4, h: 0.4, fontSize: 16, bold: true, align: "center", color: GRN, objectName: "anim_4_f_bxt" });
T(s, "horloge\nmémoire du récit\nréserve d'énergie", { x: 4.2, y: 2.25, w: 2.2, h: 1.0, fontSize: 12, color: GREY, align: "center", objectName: "anim_4_f_bxs" });
L(s, 6.5, 2.55, 7.2, 2.55, { c: YEL, arrow: false, n: "anim_5_f_usb" });
T(s, "USB", { x: 6.5, y: 2.2, w: 0.7, h: 0.3, fontSize: 12, color: YEL, align: "center", objectName: "anim_5_f_usbt" });
plainScreen(s, 7.2, 1.7, 2.2, "anim_5_f_pc");
T(s, "Poste Windows 11", { x: 7.1, y: 3.35, w: 2.4, h: 0.3, fontSize: 12, color: GREY, align: "center", objectName: "anim_5_f_pct" });
T(s, "Posé sans ouvrir le PC · relié seulement par USB · sans Wi-Fi ni Bluetooth", { x: 0.5, y: 4.6, w: 9, h: 0.4, fontSize: 15, color: GRN, objectName: "anim_6_f_k" });
s.addNotes("Le boîtier observe trois choses : les voyants du PC avec des phototransistors collés sur la façade, le 5 volts de l'USB, et le courant du lecteur de carte grâce à un câble USB instrumenté. Il contient un ESP32, une horloge, une mémoire pour le récit et une petite réserve d'énergie. Il se pose sans ouvrir le PC et ne se relie que par USB. Il n'a ni Wi-Fi ni Bluetooth : peu de surface d'attaque.");

s = content("Le battement et le récit", "3 · Solution");
T(s, "Chaque seconde, le PC envoie un « battement ».", { x: 0.5, y: 1.05, w: 9, h: 0.35, fontSize: 16, color: GREY });
for (let i = 0; i < 8; i++) L(s, 0.8 + i * 0.5, 1.9, 0.8 + i * 0.5, 1.5, { c: GRN, w: 3, arrow: false, n: `anim_1_f~d${i * 150}_tk${i}` });
L(s, 4.8, 1.95, 7.5, 1.95, { c: RED, w: 3, dash: true, arrow: false, n: "anim_2_f_gap" });
T(s, "plus de battement", { x: 4.8, y: 1.45, w: 2.7, h: 0.3, fontSize: 13, color: RED, align: "center", objectName: "anim_2_f_gapt" });
R(s, 0.5, 2.4, 5.4, 2.4, { fill: "07090C", line: LINE, n: "anim_3_f_log" });
const rec = [["12:00:01  battement · voyant ON · 5 V ok", GRN], ["12:00:02  battement · voyant ON · 5 V ok", GRN], ["12:00:03  battement perdu", RED], ["12:00:07  voyant OFF", YEL], ["12:00:07  5 V perdu", YEL]];
rec.forEach(([t, c], i) => logLine(s, 0.65, 2.55 + i * 0.4, 5.1, t, c, `anim_3_f~d${i * 300}_r${i}`));
card(s, 6.2, 2.4, 3.3, 2.4, "Après la coupure", "Une petite réserve d'énergie laisse au boîtier le temps d'écrire le dernier événement. Le récit est conservé et horodaté.", TEAL, "anim_4_f_aft");
s.addNotes("Clic 1 : le PC envoie un battement chaque seconde, le boîtier le note. Clic 2 : le battement disparaît d'un coup. Clic 3 : voici le récit horodaté que le boîtier écrit : dernier battement, battement perdu, quatre secondes plus tard le voyant s'éteint et le 5 volts disparaît. Clic 4 : après la coupure, la réserve d'énergie, un supercondensateur, donne quelques secondes pour écrire. C'est l'objet d'un essai de physique.");

s = content("Les règles du corrélateur", "3 · Solution");
const regles = [["« arrêt » annoncé, puis voyant éteint", "Arrêt normal", GRN], ["battement, voyant et 5 V perdus ensemble", "Coupure", BLUE], ["battement perdu, voyant éteint ≈ 4 s après", "Arrêt forcé", RED], ["battement perdu, voyant allumé > 30 s", "Système figé", YEL], ["l'un des cas ci-dessus, pendant une installation", "Mise à jour interrompue", PUR], ["sources en désaccord, récit incomplet", "Non concluant", GREY]];
T(s, "Le boîtier voit…", { x: 0.6, y: 1.0, w: 5, h: 0.3, fontSize: 12, color: GREY });
T(s, "Conclusion", { x: 6.3, y: 1.0, w: 3, h: 0.3, fontSize: 12, color: GREY });
regles.forEach(([a, b, c], i) => {
  const y = 1.35 + i * 0.58;
  R(s, 0.5, y, 9.0, 0.48, { fill: PANEL, line: c, n: `anim_${i + 1}_f_r${i}` });
  T(s, a, { x: 0.65, y, w: 5.5, h: 0.48, fontSize: 13, valign: "middle", objectName: `anim_${i + 1}_f_a${i}` });
  T(s, b, { x: 6.3, y, w: 3.1, h: 0.48, fontSize: 15, bold: true, color: c, valign: "middle", objectName: `anim_${i + 1}_f_b${i}` });
});
s.addNotes("Le corrélateur est un ensemble de règles simples, faciles à expliquer. Il croise le récit du boîtier avec les journaux Windows. Un arrêt annoncé puis un voyant éteint : arrêt normal. Tout disparaît ensemble : coupure. Le battement s'arrête, puis le voyant s'éteint environ quatre secondes après : arrêt forcé au bouton. Le voyant reste allumé plus de trente secondes : système figé. Si l'un de ces cas arrive pendant une installation : mise à jour interrompue. Et si les sources se contredisent, le système répond non concluant plutôt que de se tromper. Les seuils sont à mesurer sur la maquette.");

s = content("La chaîne de la carte : le premier maillon qui échoue", "3 · Solution");
const verif = ["courant du lecteur\n(boîtier)", "reconnu par Windows\n(PnP, service)", "carte lue\n(ATR, certutil)", "certificat visible\n(magasin, version)", "certificat proposé\n(portail, état TLS)"];
maillons.forEach((m, i) => {
  const x = 0.4 + i * 1.85;
  R(s, x, 1.3, 1.6, 0.8, { fill: PANEL, line: i < 3 ? GRN : i === 3 ? RED : GREY, lw: 2, n: `anim_${i + 1}_f_m${i}` });
  T(s, m, { x, y: 1.3, w: 1.6, h: 0.8, fontSize: 13, bold: true, align: "center", valign: "middle", objectName: `anim_${i + 1}_f_m${i}t` });
  T(s, verif[i], { x: x - 0.1, y: 2.2, w: 1.8, h: 0.6, fontSize: 10, color: GREY, align: "center", objectName: `anim_${i + 1}_f_v${i}` });
  if (i > 0) L(s, x - 0.25, 1.7, x - 0.02, 1.7, { c: GREY, n: `anim_${i + 1}_f_l${i}` });
  if (i < 3) mark(s, x + 0.65, 2.9, "y", `anim_${i + 1}_f~d200_k${i}`);
});
mark(s, 0.4 + 3 * 1.85 + 0.65, 2.9, "n", "anim_4_f~d200_k3");
T(s, "Premier maillon en échec = cause probable", { x: 0.5, y: 3.5, w: 9, h: 0.4, fontSize: 20, bold: true, color: RED, objectName: "anim_4_f~d500_cause" });
T(s, "Contrôle transversal : l'heure du poste (un certificat est refusé si l'horloge est fausse).", { x: 0.5, y: 4.1, w: 9, h: 0.4, fontSize: 14, color: GREY, objectName: "anim_5_f_h" });
T(s, "Vert : vérifié par le boîtier · autres maillons : vérifiés par PowerShell sur le poste", { x: 0.5, y: 4.6, w: 9, h: 0.3, fontSize: 11, color: GREY, objectName: "anim_5_f_leg" });
s.addNotes("On remonte la chaîne de gauche à droite. Carte : est-elle alimentée ? Le boîtier le voit par le courant du lecteur. Lecteur : Windows le voit-il ? Carte lue : l'ATR, avec certutil. Logiciel de la carte : le certificat est-il visible dans le magasin ? Plateforme : le certificat est-il proposé ? Le premier maillon qui échoue est la cause probable. Ici, le logiciel de la carte. Un contrôle transversal vérifie l'heure du poste : un certificat est refusé si l'horloge est fausse.");

s = content("Agir avec prudence : trois paliers", "3 · Solution");
const pal = [["1 · Simulation", "le remède est seulement proposé", BLUE], ["2 · Confirmation", "le technicien valide avant d'agir", YEL], ["3 · Automatique", "seulement les remèdes sans risque", GRN]];
pal.forEach(([t, d, c], i) => {
  card(s, 0.5 + i * 3.1, 1.3, 2.8, 1.9, t, d, c, `anim_${i + 1}_f_p${i}`);
  if (i > 0) L(s, 0.5 + i * 3.1 - 0.3, 2.25, 0.5 + i * 3.1 - 0.02, 2.25, { c: GREY, n: `anim_${i + 1}_f_pa${i}` });
});
T(s, "Le corrélateur répond « non concluant » plutôt que de se tromper.", { x: 0.5, y: 3.7, w: 9, h: 0.4, fontSize: 17, color: YEL, objectName: "anim_4_f_k" });
T(s, "Aucune action sur un poste sans passer par ces paliers.", { x: 0.5, y: 4.3, w: 9, h: 0.4, fontSize: 14, color: GREY, objectName: "anim_4_f_k2" });
s.addNotes("Dès que le système peut agir sur un poste, trois paliers. Premier palier, simulation : le remède est seulement proposé. Deuxième palier : le technicien confirme. Troisième palier : automatique, uniquement pour les remèdes sans risque. Et si le système n'est pas sûr, il répond non concluant.");

// ======================= 4. SCÉNARIOS =======================
s = section(4, "Trois histoires", "Sophie, Karim et Léa : le même service, trois situations.", "4 · Scénarios");
s.addNotes("Quatrième partie : des scénarios concrets. Les personnages sont fictifs. Le premier est la version 1 obligatoire, les suivants relèvent de la version 2.");

s = content("Sophie : la mise à jour qui se fige (V1)", "4 · Scénarios");
clock(s, "10 h 15");
desk(s, 0.8, 3.65, 3.8);
monitor(s, 2.0, 2.0, 1.8, "install", "anim_1_x_mon");
blackScreen(s, 2.0, 2.0, 1.8, "anim_2_f_blk");
box(s, 2.6, 3.8, GRN, "anim_1_x_bxg");
box(s, 2.6, 3.8, RED, "anim_2_f_bxr");
person(s, 0.75, 2.4, 1.3, "2F5D8A");
T(s, "La mise à jour s'installe. Le PC se fige.", { x: 5.3, y: 1.35, w: 4.2, h: 0.6, fontSize: 15, objectName: "anim_1_f_t1" });
T(s, "Sophie appuie longuement sur le bouton.", { x: 5.3, y: 2.0, w: 4.2, h: 0.6, fontSize: 15, color: RED, objectName: "anim_2_f_t2" });
logLine(s, 5.3, 2.75, 4.3, "boîtier : battement perdu,", GRN, "anim_3_f_l1");
logLine(s, 5.3, 3.05, 4.3, "voyant OFF 4 s après", GRN, "anim_3_f_l2");
logLine(s, 5.3, 3.35, 4.3, "Windows : installation en cours", YEL, "anim_3_f~d300_l3");
T(s, "Cause probable : mise à jour interrompue par un arrêt forcé.", { x: 5.3, y: 3.85, w: 4.2, h: 0.9, fontSize: 16, bold: true, color: GRN, objectName: "anim_4_f_c" });
s.addNotes("10 heures 15. Clic 1 : Sophie lance la mise à jour, le PC se fige. Clic 2 : elle appuie longuement sur le bouton, l'écran devient noir. Clic 3 : le boîtier a vu le battement disparaître et le voyant s'éteindre quatre secondes après. Le journal de Windows dit seulement : installation en cours. Clic 4 : le corrélateur croise les deux et conclut : mise à jour interrompue par un arrêt forcé. Le lendemain, Yaksan lit la cause sur la page web, au lieu de réparer à l'aveugle.");

s = content("Karim : la carte qui ne répond plus (V2)", "4 · Scénarios");
clock(s, "9 h 00");
person(s, 0.5, 1.45, 1.2, PUR);
T(s, "Karim badge.\nRien ne se passe.", { x: 0.3, y: 2.9, w: 2.2, h: 0.6, fontSize: 12, color: GREY, align: "center" });
const stp = [["Carte alimentée ?", "y", "courant du lecteur normal"], ["Lecteur reconnu ?", "y", "Windows le voit"], ["Carte lue ?", "y", "réponse de la carte (ATR)"], ["Logiciel de la carte ?", "n", "certificat non propagé"]];
stp.forEach(([t, k, d], i) => {
  const y = 1.2 + i * 0.72;
  mark(s, 2.9, y + 0.12, k, `anim_${i + 1}_f_k${i}`);
  T(s, t, { x: 3.35, y, w: 3.0, h: 0.35, fontSize: 16, bold: true, color: k === "n" ? RED : WHITE, objectName: `anim_${i + 1}_f_t${i}` });
  T(s, d, { x: 3.35, y: y + 0.34, w: 3.2, h: 0.3, fontSize: 12, color: GREY, objectName: `anim_${i + 1}_f_d${i}` });
});
R(s, 6.7, 1.2, 2.8, 2.9, { fill: PANEL, line: RED, lw: 2, n: "anim_5_f_rem" });
T(s, "Maillon en panne : logiciel de la carte", { x: 6.85, y: 1.3, w: 2.5, h: 0.8, fontSize: 14, bold: true, color: RED, objectName: "anim_5_f_remt" });
T(s, "Remède proposé (palier 1 : simulation). Le technicien confirme avant d'agir.", { x: 6.85, y: 2.2, w: 2.5, h: 1.5, fontSize: 13, objectName: "anim_5_f_rems" });
T(s, "Temps de résolution mesuré avec le diagnostic, comparé à l'essai au hasard.", { x: 0.5, y: 4.4, w: 9, h: 0.4, fontSize: 14, color: YEL, objectName: "anim_6_f_k" });
s.addNotes("9 heures. Karim badge pour entrer sur la plateforme, rien ne se passe. Le diagnostic remonte la chaîne. Clic 1 : la carte est alimentée, le courant du lecteur est normal. Clic 2 : le lecteur est reconnu. Clic 3 : la carte répond, l'ATR est lu. Clic 4 : le logiciel de la carte ne propose pas le certificat : premier maillon en échec. Clic 5 : le système propose un remède au palier simulation. Yaksan confirme. Clic 6 : on mesure le temps de résolution avant et après, c'est l'un des indicateurs.");

s = content("« Ne pas éteindre » : prévenir plutôt que réparer (V2)", "4 · Scénarios");
desk(s, 0.8, 3.65, 3.8);
monitor(s, 2.0, 2.0, 1.8, "install");
box(s, 2.6, 3.8, GREY, "bx");
O(s, 2.98, 3.86, 0.12, YEL, "anim_1_f_led");
T(s, "LED orange pendant une mise à jour :\n« ne pas éteindre »", { x: 5.0, y: 1.3, w: 4.5, h: 0.8, fontSize: 16, color: YEL, objectName: "anim_1_f_t1" });
T(s, "Arrêts forcés pendant une mise à jour", { x: 5.0, y: 2.35, w: 4.5, h: 0.3, fontSize: 13, color: GREY, objectName: "anim_2_f_ct" });
L(s, 5.2, 4.3, 9.3, 4.3, { c: GREY, arrow: false, n: "anim_2_f_ax" });
R(s, 5.7, 2.9, 1.1, 1.4, { fill: RED, round: false, n: "anim_3_f_b1" });
T(s, "N", { x: 5.7, y: 2.6, w: 1.1, h: 0.3, fontSize: 16, bold: true, color: RED, align: "center", objectName: "anim_3_f_b1n" });
T(s, "avant", { x: 5.7, y: 4.35, w: 1.1, h: 0.3, fontSize: 11, color: GREY, align: "center", objectName: "anim_3_f_b1t" });
R(s, 7.6, 3.7, 1.1, 0.6, { fill: GRN, round: false, n: "anim_4_f_b2" });
T(s, "?", { x: 7.6, y: 3.4, w: 1.1, h: 0.3, fontSize: 16, bold: true, color: GRN, align: "center", objectName: "anim_4_f_b2n" });
T(s, "avec la LED", { x: 7.5, y: 4.35, w: 1.3, h: 0.3, fontSize: 11, color: GREY, align: "center", objectName: "anim_4_f_b2t" });
s.addNotes("Mieux vaut prévenir que réparer. Pendant une mise à jour, le boîtier allume une LED orange : ne pas éteindre. Les agents voient que le PC travaille et évitent d'appuyer sur le bouton. On compare ensuite le nombre d'arrêts forcés avant et avec la LED. Les valeurs N et point d'interrogation sont à mesurer sur la maquette : je ne les invente pas.");

s = content("Léa : le premier jour (V2, en scénario)", "4 · Scénarios");
clock(s, "Jour 1");
person(s, 0.5, 1.5, 1.4, "5CD0B3");
const acc = [["Yaksan teste la chaîne carte → plateforme, devant Léa", "y"], ["Les problèmes sont réglés avant qu'elle en ait besoin", "y"], ["Un raccourci lance le diagnostic de la carte", "y"], ["Message simple : « votre carte semble défectueuse, contactez le support »", "y"]];
acc.forEach(([t, k], i) => {
  const y = 1.3 + i * 0.8;
  mark(s, 2.4, y + 0.04, k, `anim_${i + 1}_f_k${i}`);
  T(s, t, { x: 2.9, y, w: 6.6, h: 0.6, fontSize: 16, valign: "middle", objectName: `anim_${i + 1}_f_t${i}` });
});
T(s, "Accueillir et libre-service : décrits en scénarios, réalisés si la V2 le permet.", { x: 0.5, y: 4.6, w: 9, h: 0.4, fontSize: 14, color: GREY, objectName: "anim_5_f_k" });
s.addNotes("Léa arrive dans le service. Yaksan teste devant elle la chaîne carte vers plateforme : les problèmes sont réglés avant qu'elle en ait besoin. Ensuite, un raccourci lance le diagnostic de la carte, avec un message simple si la carte semble défectueuse. Ces deux usages sont décrits en scénarios dans le projet. Ils ne sont réalisés que si la version 2 avance bien.");

// ======================= 5. ARCHITECTURE =======================
s = section(5, "Le schéma du projet", "Qui parle à qui, et ce que Yaksan réalise.", "5 · Architecture");
s.addNotes("Cinquième partie : l'architecture de la maquette. Le réseau est isolé d'Internet, comme celui du service.");

s = content("Architecture de la maquette", "5 · Architecture");
const node = (x, y, w, h, t, sub, col, n, dash) => {
  R(s, x, y, w, h, { fill: PANEL, line: col, lw: 2, dash: !!dash, n: nm(n, "r") });
  T(s, t, { x, y: y + 0.08, w, h: 0.35, fontSize: 14, bold: true, align: "center", objectName: nm(n, "t") });
  T(s, sub, { x: x + 0.05, y: y + 0.42, w: w - 0.1, h: h - 0.45, fontSize: 10.5, color: GREY, align: "center", objectName: nm(n, "s") });
};
node(0.3, 1.0, 1.8, 0.95, "Lecteur + carte", "carte PIV de labo", GREY);
node(0.3, 2.35, 1.8, 1.15, "Boîtier ESP32", "voyants · 5 V\ncourant · horloge", BLUE);
node(3.0, 1.75, 3.0, 1.75, "Poste Windows 11", "agent « battement »\ncollecteur du journal\ndiagnostic de la chaîne carte\ncorrélateur", BLUE);
node(7.0, 1.0, 2.7, 1.3, "Serveur Ubuntu", "API FastAPI · base SQLite\npage web du support\nportail à certificat client", BLUE, "anim_3_f_sv");
node(3.3, 3.9, 2.6, 1.0, "Contrôleur de domaine", "commun : DNS, Kerberos,\nLDAP, NTP, autorité de labo", GREY, "anim_2_f_dc", true);
node(7.0, 3.9, 2.7, 1.0, "Routeur ISR 4331", "source d'heure (NTP)", GREY, "anim_2_f~d300_rt", true);
L(s, 2.1, 2.9, 3.0, 2.7, { c: BLUE, arrow: false, n: "anim_1_f_l1" });
T(s, "USB", { x: 2.2, y: 2.35, w: 0.7, h: 0.3, fontSize: 10, color: BLUE, objectName: "anim_1_f_l1t" });
L(s, 1.2, 1.95, 1.2, 2.35, { c: GREY, arrow: false, n: "anim_1_f_l0" });
L(s, 4.5, 3.5, 4.5, 3.9, { c: GREY, arrow: false, n: "anim_2_f_l2" });
L(s, 5.9, 4.4, 7.0, 4.4, { c: GREY, arrow: false, n: "anim_2_f_l3" });
T(s, "NTP", { x: 6.1, y: 4.1, w: 0.6, h: 0.3, fontSize: 10, color: GREY, objectName: "anim_2_f_l3t" });
L(s, 6.0, 2.2, 7.0, 1.7, { c: BLUE, arrow: false, n: "anim_3_f_l4" });
T(s, "HTTPS · jeton", { x: 5.9, y: 1.3, w: 1.2, h: 0.3, fontSize: 10, color: BLUE, objectName: "anim_3_f_l4t" });
R(s, 0.3, 3.9, 2.7, 1.0, { fill: BG, line: BLUE, lw: 2, n: "anim_4_f_lg1" });
T(s, "cadre plein : réalisé par Yaksan\npointillés : fourni par le lycée", { x: 0.4, y: 4.0, w: 2.5, h: 0.8, fontSize: 10.5, color: GREY, objectName: "anim_4_f_lg2" });
s.addNotes("Clic 1 : le boîtier ne parle qu'au poste, par USB ; la carte est dans son lecteur, relié au poste. Clic 2 : le poste utilise le réseau en place : contrôleur de domaine commun et heure donnée par le routeur. Yaksan exploite ces services, il ne les configure pas. L'autorité de certification de laboratoire est préparée une fois pour plusieurs apprentis. Clic 3 : seul le poste parle au serveur Ubuntu, en HTTPS avec un jeton ; le serveur rassemble les conclusions pour le support. Clic 4 : le cadre plein est réalisé par Yaksan, les pointillés sont fournis par le lycée.");

// ======================= 6. SÉCURITÉ =======================
s = section(6, "Et si on efface les traces ?", "Quelqu'un a-t-il effacé ce qui s'est passé ?", "6 · Sécurité");
s.addNotes("Sixième partie : la cybersécurité. Le défi-réponse du boîtier est traité dans le projet de Lorenzo. La question de Yaksan est : quelqu'un a-t-il effacé ou modifié le récit ?");

s = content("Le journal chaîné", "6 · Sécurité");
const lines = ["ligne 1", "ligne 2", "ligne 3", "ligne 4"];
lines.forEach((t, i) => {
  const x = 0.5 + i * 2.3;
  R(s, x, 1.3, 2.0, 1.1, { fill: PANEL, line: i === 2 ? RED : BLUE, lw: 2, n: `anim_${i === 2 ? 2 : 1}_f${i === 2 ? "" : "~d" + i * 200}_ln${i}` });
  T(s, t, { x, y: 1.35, w: 2.0, h: 0.35, fontSize: 14, bold: true, align: "center", objectName: `anim_${i === 2 ? 2 : 1}_f${i === 2 ? "" : "~d" + i * 200}_lt${i}` });
  T(s, `h${i + 1} = H(h${i} + ligne ${i + 1})`, { x, y: 1.8, w: 2.0, h: 0.5, fontSize: 10, fontFace: MONO, color: YEL, align: "center", objectName: `anim_${i === 2 ? 2 : 1}_f${i === 2 ? "" : "~d" + i * 200}_lh${i}` });
});
T(s, "Chaque ligne contient l'empreinte de la précédente (SHA-256).", { x: 0.5, y: 2.65, w: 9, h: 0.35, fontSize: 14, color: GREY, objectName: "anim_1_f~d900_ex" });
R(s, 0.5 + 2 * 2.3, 1.3, 2.0, 1.1, { fill: BG, line: RED, dash: true, n: "anim_3_f_gap" });
T(s, "ligne effacée", { x: 0.5 + 2 * 2.3, y: 1.6, w: 2.0, h: 0.4, fontSize: 14, color: RED, align: "center", objectName: "anim_3_f_gapt" });
T(s, "h4 ne correspond plus à h2 : le trou est détecté.", { x: 0.5, y: 3.2, w: 9, h: 0.4, fontSize: 18, bold: true, color: RED, objectName: "anim_4_f_det" });
T(s, "Le dernier haché est envoyé au serveur : on ne peut pas réécrire tout le journal sans qu'on le voie.", { x: 0.5, y: 3.9, w: 9, h: 0.7, fontSize: 16, color: GRN, objectName: "anim_5_f_srv" });
s.addNotes("Clic 1 : le récit est écrit en lignes, et chaque ligne contient l'empreinte SHA-256 de la précédente. Clic 2 : quelqu'un efface la ligne trois. Clic 3 : l'empreinte de la ligne quatre ne correspond plus à celle de la ligne deux : le trou est détecté. Clic 5 : le dernier haché est envoyé au serveur, donc on ne peut pas réécrire tout le journal sans qu'on le voie. Démonstration d'attaque prévue : ligne effacée détectée.");

s = content("Les autres protections, et la vie privée", "6 · Sécurité");
const prot = [["Boîtier sans radio", "ni Wi-Fi ni Bluetooth : surface d'attaque réduite"], ["Scripts PowerShell signés", "un script modifié refuse de démarrer"], ["API avec jeton et TLS", "file d'attente si le serveur est arrêté"], ["Honnêteté du diagnostic", "« non concluant » plutôt qu'une cause inventée"]];
prot.forEach(([t, d], i) => { mark(s, 0.5, 1.15 + i * 0.75, "y", `anim_1_f~d${i * 200}_p${i}`); T(s, t, { x: 0.95, y: 1.1 + i * 0.75, w: 4.3, h: 0.3, fontSize: 15, bold: true, objectName: `anim_1_f~d${i * 200}_pt${i}` }); T(s, d, { x: 0.95, y: 1.42 + i * 0.75, w: 4.3, h: 0.3, fontSize: 12, color: GREY, objectName: `anim_1_f~d${i * 200}_pd${i}` }); });
R(s, 5.7, 1.1, 3.8, 3.2, { fill: PANEL, line: TEAL, lw: 2, n: "anim_2_f_v" });
T(s, "Vie privée", { x: 5.9, y: 1.2, w: 3.4, h: 0.4, fontSize: 16, bold: true, color: TEAL, objectName: "anim_2_f_vt" });
T(s, "Aucune donnée personnelle.\nAucun nom d'agent, aucun identifiant de carte stocké.\nCartes PIV de laboratoire seulement, jamais de carte d'agent.", { x: 5.9, y: 1.7, w: 3.4, h: 2.4, fontSize: 14, objectName: "anim_2_f_vd" });
T(s, "On sait ce qui s'est passé sur un poste. Jamais qui était devant.", { x: 0.5, y: 4.55, w: 9, h: 0.4, fontSize: 15, color: YEL, objectName: "anim_3_f_k" });
s.addNotes("Les autres protections sont classiques. Le boîtier n'a pas de radio. Les scripts sont signés. L'API demande un jeton et passe par TLS, avec une file d'attente si le serveur est arrêté. Le diagnostic préfère répondre non concluant plutôt que d'inventer une cause. Côté vie privée : aucune donnée personnelle, aucun nom d'agent, aucun identifiant de carte stocké, et seulement des cartes de laboratoire.");

// ======================= 7. PHYSIQUE =======================
s = section(7, "La physique", "Quelques mesures, et des réglages qui en découlent.", "7 · Physique");
s.addNotes("Septième partie : le volet physique. Les essais principaux sont P3 et P4, les essais P1 et P6 sont courts. Le contenu est à valider avec le professeur de physique avant janvier.");

s = content("P3 · Combien de temps tient la réserve d'énergie ?", "7 · Physique");
T(s, "Le supercondensateur de 1 F doit laisser au boîtier le temps d'écrire le dernier événement.", { x: 0.5, y: 1.05, w: 9, h: 0.5, fontSize: 15, color: GREY });
const p3 = [["Modèle", "E = ½ C (U₁² − U₂²)\n5 V → 3,5 V : E ≈ 6,4 J\nt ≈ η E / P ≈ 25 s (estimation)", BLUE], ["Mesure", "charge et décharge\nτ = R·C\ntension U(t) relevée", YEL], ["Décision", "valeurs de C et de la\nrésistance de charge\navec leur incertitude", GRN]];
p3.forEach(([t, d, c], i) => {
  card(s, 0.5 + i * 3.1, 1.7, 2.85, 2.3, t, d, c, `anim_${i + 1}_f_p${i}`);
  if (i > 0) L(s, 0.5 + i * 3.1 - 0.25, 2.8, 0.5 + i * 3.1 - 0.02, 2.8, { c: GREY, n: `anim_${i + 1}_f_a${i}` });
});
T(s, "Le modèle est confronté aux mesures. Si la mesure dit moins de 25 s, on change C.", { x: 0.5, y: 4.3, w: 9, h: 0.5, fontSize: 15, color: YEL, objectName: "anim_4_f_k" });
s.addNotes("Le supercondensateur de 1 farad doit laisser au boîtier le temps d'écrire le dernier événement. Le modèle : l'énergie utile vaut un demi C fois U1 carré moins U2 carré. En passant de 5 volts à 3,5 volts, on récupère environ 6,4 joules. Avec un rendement et la puissance du boîtier, on estime environ 25 secondes. C'est une estimation, pas un résultat : on la confronte à la mesure. On relève la tension pendant la décharge, on exploite la constante de temps R fois C, et on décide la valeur de C et de la résistance de charge, avec l'incertitude. Si la mesure est trop courte, on change le condensateur.");

s = content("P4 · carte vivante, et deux essais courts", "7 · Physique");
card(s, 0.5, 1.15, 4.4, 2.5, "P4 · La carte est-elle alimentée ?", "I = U_shunt / R_shunt\nmesure du courant du lecteur : sans carte, carte saine, carte sale, carte défectueuse\n20 insertions : u = s / √N\n→ seuil « carte vivante »", BLUE, "anim_1_f_p4");
card(s, 5.1, 1.15, 4.4, 1.15, "P1 · Voyants", "U_s = R · I_C ; lumière ambiante\n→ seuil et hystérésis", GRN, "anim_2_f_p1");
card(s, 5.1, 2.5, 4.4, 1.15, "P6 · Horloges", "Δt = d · t ; 2 ppm → 0,17 s par jour\nDS3231 comparée au NTP sur 24 h", YEL, "anim_3_f_p6");
T(s, "Chaque essai se termine par une décision de réglage, avec son incertitude.", { x: 0.5, y: 4.05, w: 9, h: 0.4, fontSize: 15, color: YEL, objectName: "anim_4_f_k" });
T(s, "À valider avec le professeur de physique avant janvier.", { x: 0.5, y: 4.6, w: 9, h: 0.3, fontSize: 12, color: GREY, objectName: "anim_4_f_k2" });
s.addNotes("P4, l'essai principal pour la carte : on mesure le courant du lecteur avec une résistance de shunt, I égale U shunt sur R shunt, pour quatre cas : sans carte, carte saine, carte sale, carte défectueuse. Vingt insertions donnent la moyenne et l'incertitude, u égale s sur racine de N. Cela fixe le seuil carte vivante. P1 : les phototransistors, U égale R fois I, avec la lumière ambiante : on fixe un seuil et une hystérésis. P6 : les horloges, une dérive de 2 ppm donne 0,17 seconde par jour, on compare l'horloge du boîtier au NTP sur 24 heures. Les essais d'échantillonnage et de signal de la carte ont été abandonnés pour tenir en 150 heures.");

// ======================= 8. RÉSEAU ET DONNÉE =======================
s = section(8, "Réseau et donnée", "Exploiter le réseau en place, et valoriser ce que le système apprend.", "8 · Réseau et donnée");
s.addNotes("Huitième partie : la compétence C10 (exploiter un réseau) et la valorisation de la donnée.");

s = content("Exploiter le réseau en place", "8 · Réseau et donnée");
card(s, 0.5, 1.1, 4.5, 3.6, "Réseau du lycée, tel quel", "DNS, Kerberos, LDAP, SMB, NTP vers le contrôleur de domaine\nTLS mutuel vers le portail : en TLS 1.2 le certificat client est visible, en TLS 1.3 il est chiffré\nÉchec TLS si le certificat est expiré ou si l'horloge est décalée\nHTTPS vers l'API, avec file d'attente", BLUE, "anim_1_f_r1");
card(s, 5.2, 1.1, 4.3, 1.7, "Captures Wireshark", "On voit passer les échanges et on explique ce que l'on observe.", GRN, "anim_2_f_r2");
card(s, 5.2, 3.0, 4.3, 1.7, "Pas de configuration", "Ni VLAN ni ACL à créer : on exploite le réseau en place.", GREY, "anim_3_f_r3");
s.addNotes("Le réseau est exploité tel qu'il est. DNS, Kerberos, LDAP, SMB et NTP vers le contrôleur de domaine. Le TLS mutuel vers le portail : en TLS 1.2 on voit le certificat client dans la capture, en TLS 1.3 il est chiffré. Si le certificat est expiré ou si l'horloge est décalée, la connexion échoue : c'est l'un des maillons du diagnostic. On capture avec Wireshark et on explique. Aucun VLAN ni ACL à configurer : c'est l'exploitation du réseau en place.");

s = content("Valoriser la donnée : le tableau de bord du support", "8 · Réseau et donnée");
R(s, 0.5, 1.1, 4.6, 3.6, { fill: PANEL, line: LINE });
T(s, "Page web du support", { x: 0.7, y: 1.2, w: 4.2, h: 0.35, fontSize: 15, bold: true });
const kp = [["causes des mises à jour ratées", YEL], ["maillons de carte en panne", BLUE], ["pannes qui reviennent, par poste", GRN], ["conclusions « non concluant »", GREY]];
kp.forEach(([t, c], i) => { R(s, 0.75, 1.8 + i * 0.7, 0.25, 0.25, { fill: c, round: false, n: `anim_1_f~d${i * 200}_k${i}` }); T(s, t, { x: 1.15, y: 1.76 + i * 0.7, w: 3.8, h: 0.3, fontSize: 14, objectName: `anim_1_f~d${i * 200}_kt${i}` }); });
card(s, 5.4, 1.1, 4.1, 1.55, "Indicateur 1", "au moins 19 pannes sur 20 bien classées", GRN, "anim_2_f_i1");
card(s, 5.4, 2.85, 4.1, 1.85, "Indicateur 2", "100 % des maillons de carte en panne désignés sur la maquette", BLUE, "anim_3_f_i2");
s.addNotes("Le serveur rassemble les conclusions du corrélateur. La page web du support montre les causes des mises à jour ratées, les maillons de carte en panne, les pannes qui reviennent par poste, et le nombre de conclusions non concluantes. Deux indicateurs se mesurent sur la maquette : au moins 19 pannes sur 20 bien classées, et 100 pour cent des maillons de carte en panne désignés. Ces valeurs sont des objectifs, pas des résultats.");

// ======================= 9. PARCOURS =======================
s = section(9, "Le parcours", "Environ 150 heures, de janvier à mai 2027.", "9 · Parcours");
s.addNotes("Neuvième partie : l'organisation du projet.");

s = content("V1 obligatoire, V2 visée, puis les extensions", "9 · Parcours");
const cols = [["V1 · ≈ 113 h", GRN, "boîtier, voyants, 5 V, battement\nrécit conservé après coupure\ncorrélateur des pannes\nserveur minimal"], ["V2 · ≈ 35 h", BLUE, "chaîne de la carte (5 maillons)\nremèdes à paliers\naccueil et libre-service\n(en scénarios)"], ["Extensions", GREY, "température de sortie d'air\ncompteur d'insertions\nécran bleu"]];
cols.forEach(([t, c, d], i) => { R(s, 0.5 + i * 3.05, 1.1, 2.85, 2.6, { fill: PANEL, line: c, lw: 2, dash: i === 2, n: `anim_${i + 1}_f_c${i}` }); T(s, t, { x: 0.7 + i * 3.05, y: 1.2, w: 2.5, h: 0.4, fontSize: 17, bold: true, color: c, objectName: `anim_${i + 1}_f_c${i}t` }); T(s, d, { x: 0.7 + i * 3.05, y: 1.75, w: 2.5, h: 1.8, fontSize: 12, objectName: `anim_${i + 1}_f_c${i}d` }); });
const rv = [["R1 · 29/01", "besoin chiffré, boîtier de départ"], ["R2 · 19/03", "boîtier, récit et corrélateur démontrés"], ["R3 · 14/05", "V1 recettée, V2, démonstration"]];
rv.forEach(([t, d], i) => { chip(s, 0.5 + i * 3.05, 3.95, t, YEL, `anim_4_f~d${i * 200}_r${i}`, 1.4); T(s, d, { x: 0.5 + i * 3.05, y: 4.38, w: 2.85, h: 0.5, fontSize: 12, color: GREY, objectName: `anim_4_f~d${i * 200}_rt${i}` }); });
T(s, "Heures : objectif à confirmer après la visite chez le tuteur.", { x: 0.5, y: 4.95, w: 9, h: 0.25, fontSize: 11, color: YEL, objectName: "anim_5_f_k" });
s.addNotes("La version 1 représente environ 113 heures : le boîtier, le récit conservé après coupure, le corrélateur et un serveur minimal. La version 2 environ 35 heures : la chaîne de la carte et les remèdes à paliers, avec l'accueil et le libre-service en scénarios. Les extensions ne viennent que si Yaksan est en avance à la revue 2. Ces heures sont un objectif à confirmer après la visite chez le tuteur, qui doit préciser notamment si les PC sont fixes ou portables et si les périphériques USB sont filtrés. Trois revues : le 29 janvier, le 19 mars et le 14 mai.");

// ======================= CONCLUSION =======================
pres.addSection({ title: "Conclusion" });
s = pres.addSlide({ masterName: "TITRE", sectionTitle: "Conclusion" });
T(s, "En une phrase", { x: 0.6, y: 0.6, w: 6, h: 0.35, fontSize: 14, color: GREY });
T(s, [{ text: "Avant de réparer, savoir " }, { text: "ce qui s'est vraiment passé", options: { color: YEL } }, { text: "." }], { x: 0.6, y: 1.05, w: 8.8, h: 1.4, fontSize: 36 });
const kpis = [["≥ 19 / 20", "pannes bien classées (objectif, essai sur 20 pannes provoquées)", GRN], ["5", "maillons de la chaîne carte, le premier en échec désigné", BLUE], ["0", "donnée personnelle stockée", YEL]];
kpis.forEach(([v, d, c], i) => { T(s, v, { x: 0.6 + i * 3.0, y: 2.8, w: 2.8, h: 0.8, fontSize: 36, bold: true, color: c, objectName: `anim_${i + 1}_f_k${i}` }); T(s, d, { x: 0.6 + i * 3.0, y: 3.65, w: 2.7, h: 0.8, fontSize: 13, color: GREY, objectName: `anim_${i + 1}_f_kd${i}` }); });
T(s, "Besoin issu de l'entreprise, réalisation au lycée sur maquette, à faire valider par l'académie.", { x: 0.6, y: 4.75, w: 8.8, h: 0.3, fontSize: 11, color: GREY });
s.addNotes("Conclure par la phrase : avant de réparer, savoir ce qui s'est vraiment passé. Trois chiffres : au moins 19 pannes sur 20 bien classées, c'est un objectif ; cinq maillons dans la chaîne de la carte ; zéro donnée personnelle stockée. Rappeler que le projet complète les outils de l'administration et que la réalisation au lycée, à partir d'un besoin confirmé par le tuteur, doit être validée par l'académie.");

pres.writeFile({ fileName: "deck_brut.pptx" }).then(() => console.log("deck_brut.pptx écrit"));
