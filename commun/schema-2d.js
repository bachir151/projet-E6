/* =====================================================================
   schema-2d.js — moteur des « schémas réseau à plat, pas à pas ».
   Une page architecture-2d.html définit window.SCHEMA = { noeuds, liens, etapes }
   puis charge ce fichier. Le matériel est dessiné vu de face (pas de pictogramme).
   Couleurs : variables de theme.css uniquement.

   Nœud  : { id, k: 'switch'|'routeur'|'serveur'|'pc'|'portable'|'ap'|'imprimante'|'boitier'|
             'radar'|'leurre'|'telephone'|'oscillo'|'banc-papier'|'banc-froid'|'borne'|'personne'|'netem',
             x, y, nom, sous, cote: 'bas'|'haut'|'gauche'|'droite' (étiquette), cache: true }
   Lien  : [a, b, 'eth'|'wifi'|'usb'|'fixe', 'texte', { via: [[x, y], …], t: 0.5 (position du texte) }]
   Étape : { t, x, on: [ids] | all: true, init(S), run: async (S) => … }
   Outils S : go, bulle, sans, etat, led, ecran, lien, montre, onde, flash, sleep, bg
   ===================================================================== */
(function () {
'use strict';
/* « ?cadre » dans l'adresse : page intégrée dans un autre document (diaporama du quartier) → sans en-tête ni règles */
if (/[?&]cadre\b/.test(location.search)) document.documentElement.classList.add('cadre');
var D = window.SCHEMA, NS = 'http://www.w3.org/2000/svg', svg = document.getElementById('schema');
var REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches, CANCEL = { cancel: true };
function el(tag, attrs, parent, text) {
  var e = document.createElementNS(NS, tag);
  if (attrs) for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
  if (text != null) e.textContent = text;
  if (parent) parent.appendChild(e);
  return e;
}
function r1(n) { return Math.round(n * 10) / 10; }

/* ---------- le matériel, vu de face (centré sur 0,0) ---------- */
function R(x, y, w, h, fill, cls, rx) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '" class="' + (cls || 'tr') + '" style="fill:' + fill + '"/>'; }
function Tx(x, y, s, st, anchor) { return '<text x="' + x + '" y="' + y + '" style="' + st + '"' + (anchor ? ' text-anchor="' + anchor + '"' : '') + '>' + s + '</text>'; }
function ledD(x, y, r, c) { return '<circle cx="' + x + '" cy="' + y + '" r="' + (r || 3) + '" class="led ' + (c || '') + ' fin"/>'; }
function ports(x0, y0, n, rows, dx, dy) { var s = ''; for (var r = 0; r < rows; r++) for (var i = 0; i < n; i++) { var x = x0 + i * dx + Math.floor(i / 6) * 4, y = y0 + r * dy; s += R(x, y, 7, 6, 'var(--m-noir)', 'ns', .6) + R(x + 2, y + 1, 3, 1.4, 'var(--m-alu-2)', 'ns'); } return s; }
function ecran(x, y, w, h) { return R(x, y, w, h, 'var(--m-ecran)', 'tr ecran-fond', 1.5) + '<g class="ecran-txt" data-x="' + (x + 5) + '" data-y="' + (y + 12) + '" data-w="' + (w - 10) + '"></g>'; }
var HW = {
  'switch': { w: 230, h: 40, s: function () {
    return R(-122, -14, 10, 28, 'var(--m-alu-2)', 'tr', 1) + R(112, -14, 10, 28, 'var(--m-alu-2)', 'tr', 1) +
      R(-112, -20, 224, 40, 'var(--m-alu)', 'tr', 3) + Tx(-104, -6, 'HP ProCurve', 'font-size:8px;font-weight:900') + Tx(-104, 4, 'Switch 2530-24', 'font-size:6px;font-weight:700;fill:var(--encre-2)') +
      ports(-48, -12, 12, 2, 11.5, 11) + ledD(-100, 12, 2.2, 'vert') + ledD(-92, 12, 2.2, 'vert') + R(98, -10, 9, 20, 'var(--m-noir-2)', 'fin', 1);
  } },
  routeur: { w: 230, h: 40, s: function () {
    return R(-122, -14, 10, 28, 'var(--m-noir-2)', 'tr', 1) + R(112, -14, 10, 28, 'var(--m-noir-2)', 'tr', 1) +
      R(-112, -20, 224, 40, 'var(--m-noir)', 'tr', 3) + Tx(-102, -4, 'CISCO', 'font-size:9px;font-weight:1000;fill:var(--blanc);letter-spacing:.08em') + Tx(-102, 7, 'ISR 4331', 'font-size:6.5px;font-weight:700;fill:var(--m-alu-2)') +
      R(-46, -13, 50, 26, 'var(--m-noir-2)', 'fin', 2) + R(10, -13, 50, 26, 'var(--m-noir-2)', 'fin', 2) + Tx(-21, 3, 'NIM', 'font-size:6px;font-weight:800;fill:var(--m-alu-2)', 'middle') + Tx(35, 3, 'NIM', 'font-size:6px;font-weight:800;fill:var(--m-alu-2)', 'middle') +
      ports(68, -4, 3, 1, 11, 0) + ledD(72, -11, 2.2, 'vert') + ledD(80, -11, 2.2, 'vert') + ledD(88, -11, 2.2, 'vert');
  } },
  serveur: { w: 74, h: 116, s: function () {
    var s = R(-34, -58, 68, 116, 'var(--m-noir)', 'tr', 4);
    for (var i = 0; i < 3; i++) s += R(-26, -48 + i * 15, 52, 11, 'var(--m-noir-2)', 'fin', 1.5) + R(14, -45 + i * 15, 8, 3, 'var(--m-alu-2)', 'ns');
    for (var j = 0; j < 7; j++) s += R(-24, 4 + j * 6, 48, 2.4, 'var(--m-noir-2)', 'ns');
    return s + ledD(0, 50, 3, 'vert');
  } },
  pc: { w: 130, h: 112, s: function () {
    return R(-58, -56, 116, 76, 'var(--m-noir)', 'tr', 4) + ecran(-52, -50, 104, 62) + R(-6, 20, 12, 14, 'var(--m-noir-2)', 'tr') + R(-30, 34, 60, 6, 'var(--m-noir-2)', 'tr', 3) +
      R(-50, 44, 100, 10, 'var(--m-alu)', 'tr', 2) + '<path d="M-44 49h88" class="fin" style="stroke-dasharray:3 2"/>';
  } },
  portable: { w: 130, h: 96, s: function () {
    return R(-54, -48, 108, 70, 'var(--m-noir)', 'tr', 4) + ecran(-48, -42, 96, 58) + '<path d="M-64 22h128l-8 14h-112z" class="tr" style="fill:var(--m-noir-2)"/>' + R(-14, 26, 28, 5, 'var(--m-noir)', 'ns', 2);
  } },
  ap: { w: 90, h: 70, s: function () {
    return '<path d="M-26 -8l-8 -26M26 -8l8 -26" class="tr" style="stroke-width:4;stroke-linecap:round"/>' + R(-38, -10, 76, 26, 'var(--blanc)', 'tr', 12) + ledD(-20, 3, 3, 'vert') + '<path d="M-8 3h30" class="fin"/>';
  } },
  imprimante: { w: 150, h: 112, s: function () {
    return R(-62, -40, 124, 30, 'var(--m-alu)', 'tr', 3) + R(-70, -12, 140, 62, 'var(--blanc)', 'tr', 4) + R(-50, 2, 100, 7, 'var(--m-noir)', 'ns', 2) +
      '<g class="feuilles"></g>' + R(-56, 10, 112, 8, 'var(--m-alu)', 'tr', 1) + R(-60, 30, 120, 14, 'var(--m-alu)', 'tr', 2) + '<path d="M-14 37h28" class="tr"/>' +
      R(30, -34, 26, 14, 'var(--m-ecran)', 'fin', 2) + '<text class="lcd" x="43" y="-24.5" text-anchor="middle" style="font-size:6.5px;font-weight:900;fill:var(--vert)">Prête</text>' + ledD(22, -27, 2.4, 'vert');
  } },
  /* tour de PC vue de face : voyant d'alimentation (led 0) et voyant d'activité du disque (led 1) */
  tour: { w: 64, h: 124, s: function () {
    var s = R(-30, -62, 60, 124, 'var(--m-noir)', 'tr', 5) + R(-22, -52, 44, 7, 'var(--m-noir-2)', 'ns', 1.5) + R(-22, -40, 44, 7, 'var(--m-noir-2)', 'ns', 1.5);
    for (var j = 0; j < 6; j++) s += R(-20, 18 + j * 6, 40, 2.4, 'var(--m-noir-2)', 'ns');
    return s + '<circle cx="-6" cy="-14" r="8" class="tr" style="fill:var(--m-noir-2)"/>' + ledD(-6, -14, 3.6, 'vert') + ledD(12, -14, 2.6, '') +
      Tx(-6, 2, '⏻', 'font-size:7px;font-weight:900;fill:var(--m-alu)', 'middle') + Tx(12, 2, 'HDD', 'font-size:5px;font-weight:900;fill:var(--m-alu)', 'middle');
  } },
  /* boîtier témoin (boîte noire) : ESP32, horloge, carte mémoire, réserve d'énergie, LED (led 0) */
  temoin: { w: 130, h: 80, s: function () {
    return R(-62, -36, 124, 72, 'color-mix(in srgb,var(--encre) 12%,var(--blanc))', 'tr', 6) +
      R(-54, -28, 40, 22, 'var(--m-noir)', 'tr', 2) + R(-50, -24, 14, 14, 'var(--m-alu)', 'ns', 1) + Tx(-33, -14, 'ESP32', 'font-size:6px;font-weight:900;fill:var(--blanc)') +
      R(-8, -28, 22, 14, 'var(--m-pcb)', 'fin', 1.5) + Tx(3, -18.5, 'HORLOGE', 'font-size:3.8px;font-weight:900;fill:var(--blanc)', 'middle') +
      R(20, -28, 14, 18, 'var(--m-alu)', 'fin', 1.5) + Tx(27, -16, 'SD', 'font-size:5px;font-weight:900', 'middle') +
      '<rect x="-54" y="2" width="30" height="26" rx="13" class="tr" style="fill:var(--m-noir-2)"/>' + Tx(-39, 18, '1 F', 'font-size:6px;font-weight:900;fill:var(--blanc)', 'middle') +
      R(-16, 4, 46, 22, 'var(--blanc)', 'tr', 1.5) + '<text class="epaper" x="7" y="18" text-anchor="middle" style="font-size:6px;font-weight:1000">RÉCIT</text>' +
      ledD(46, 0, 5, 'vert') + '<path d="M62 -18h10M62 -10h10" class="fin"/>';
  } },
  boitier: { w: 130, h: 80, s: function () {
    return R(-62, -36, 124, 72, 'color-mix(in srgb,var(--bleu-pale) 60%,var(--blanc))', 'tr', 6) +
      R(-54, -28, 40, 22, 'var(--m-noir)', 'tr', 2) + R(-50, -24, 14, 14, 'var(--m-alu)', 'ns', 1) + Tx(-33, -14, 'ESP32', 'font-size:6px;font-weight:900;fill:var(--blanc)') +
      R(-8, -28, 18, 14, 'var(--m-pcb)', 'fin', 1.5) + Tx(1, -9, 'MPU', 'font-size:4.5px;font-weight:800', 'middle') + R(14, -28, 14, 14, 'var(--jaune-fonce)', 'fin', 1.5) + Tx(21, -9, 'SHT', 'font-size:4.5px;font-weight:800', 'middle') +
      R(-54, 0, 40, 28, 'var(--m-pcb)', 'fin', 2) + '<rect x="-50" y="4" width="32" height="20" rx="4" style="fill:none;stroke:var(--bleu-pale);stroke-width:1.2"/>' + Tx(-34, 26.5, 'RC522', 'font-size:4.5px;font-weight:800;fill:var(--blanc)', 'middle') +
      R(-8, 2, 38, 18, 'var(--blanc)', 'tr', 1.5) + '<text class="epaper" x="11" y="14" text-anchor="middle" style="font-size:6.4px;font-weight:1000">PRÊTE</text>' +
      '<circle cx="45" cy="16" r="11" class="tr bouton" style="fill:var(--rouge)"/>' + ledD(45, -20, 4, 'vert');
  } },
  radar: { w: 100, h: 64, s: function () {
    return R(-46, -28, 92, 56, 'var(--blanc)', 'tr', 6) + R(-36, -18, 34, 26, 'var(--m-pcb)', 'tr', 2) +
      [[-31, -13], [-21, -13], [-31, -3], [-21, -3]].map(function (p) { return R(p[0], p[1], 7, 7, 'var(--jaune-fonce)', 'ns', 1); }).join('') + Tx(-19, 16, 'LD2410', 'font-size:5.5px;font-weight:900', 'middle') +
      R(4, -18, 32, 20, 'var(--m-noir)', 'tr', 2) + Tx(20, -5, 'ESP32', 'font-size:5.5px;font-weight:900;fill:var(--blanc)', 'middle') + ledD(20, 15, 4, 'vert');
  } },
  leurre: { w: 140, h: 70, s: function () {
    return R(-64, -26, 76, 44, 'var(--m-pcb)', 'tr', 3) + R(-56, -18, 30, 26, 'var(--m-alu)', 'tr', 1.5) + Tx(-41, 0, 'ESP32', 'font-size:6px;font-weight:900', 'middle') + ledD(0, -16, 3.2, 'vert') +
      R(16, -26, 48, 44, 'var(--m-pcb-vert)', 'tr', 3) + Tx(40, -14, 'W5500', 'font-size:6px;font-weight:900;fill:var(--blanc)', 'middle') + R(26, -6, 28, 20, 'var(--m-alu)', 'tr', 1.5) + R(33, 0, 14, 10, 'var(--m-noir)', 'ns', 1) +
      '<path d="M-10 18v8M0 18v8M10 18v8" class="fin"/>';
  } },
  telephone: { w: 46, h: 82, s: function () {
    return R(-20, -38, 40, 76, 'var(--m-noir)', 'tr', 6) + R(-16, -30, 32, 58, 'var(--m-ecran)', 'ns', 2) + Tx(0, 2, '4G', 'font-size:12px;font-weight:1000;fill:var(--blanc)', 'middle');
  } },
  oscillo: { w: 120, h: 80, s: function () {
    return R(-56, -34, 112, 68, 'var(--m-alu)', 'tr', 4) + ecran(-48, -26, 60, 44) + '<polyline class="trace-osc" points="-44,4 8,4" style="fill:none;stroke:var(--jaune);stroke-width:1.6"/>' +
      [[26, -18], [42, -18], [26, -2], [42, -2], [26, 14], [42, 14]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="5" class="tr" style="fill:var(--m-noir-2)"/>'; }).join('');
  } },
  'banc-papier': { w: 150, h: 90, s: function () {
    return R(-70, -40, 74, 64, 'color-mix(in srgb,var(--bleu-pale) 55%,transparent)', 'tr', 4) + R(-62, -6, 26, 28, 'var(--bleu)', 'tr', 3) + R(-30, 8, 28, 6, 'var(--blanc)', 'tr', 1) +
      R(-24, -32, 24, 13, 'var(--blanc)', 'fin', 1.5) + '<text class="hr" x="-12" y="-22.5" text-anchor="middle" style="font-size:7px;font-weight:1000">46 %</text>' +
      R(14, 4, 60, 22, 'var(--m-alu)', 'tr', 3) + R(20, -2, 48, 6, 'var(--m-alu-2)', 'tr', 1) + R(26, -10, 36, 8, 'var(--blanc)', 'tr', 1) +
      R(28, 12, 32, 10, 'var(--m-ecran)', 'ns', 1.5) + '<text class="masse" x="44" y="19.5" text-anchor="middle" style="font-size:6.5px;font-weight:900;fill:var(--vert)">50,0 g</text>' +
      '<path d="M-74 26h152" class="tr" style="stroke-width:3"/>';
  } },
  'banc-froid': { w: 150, h: 90, s: function () {
    return R(-66, -16, 60, 34, 'var(--m-alu)', 'tr bloc', 2) + '<path d="M-36 -16v-18q0 -6 6 -6h30" class="tr" style="fill:none"/>' + R(-2, -46, 8, 12, 'var(--m-alu-2)', 'tr', 2) +
      R(10, -14, 54, 30, 'var(--m-pcb)', 'tr', 3) + R(16, -8, 22, 18, 'var(--m-alu)', 'ns', 1) + Tx(42, 4, 'ESP32', 'font-size:5.5px;font-weight:900;fill:var(--blanc)') +
      R(44, -34, 18, 14, 'var(--m-pcb)', 'fin', 1.5) + Tx(53, -24, 'SHT40', 'font-size:4.5px;font-weight:900;fill:var(--blanc)', 'middle') +
      '<text class="temp" x="-36" y="5" text-anchor="middle" style="font-size:9px;font-weight:1000">20 °C</text>' + '<path d="M-74 22h148" class="tr" style="stroke-width:3"/>';
  } },
  borne: { w: 120, h: 80, s: function () {
    return R(-56, -34, 112, 68, 'var(--blanc)', 'tr', 6) + R(-48, -26, 40, 24, 'var(--m-noir)', 'tr', 2) + Tx(-28, -11, 'ESP32', 'font-size:6px;font-weight:900;fill:var(--blanc)', 'middle') +
      R(2, -26, 46, 46, 'var(--m-pcb)', 'tr', 3) + '<rect x="8" y="-20" width="34" height="34" rx="6" style="fill:none;stroke:var(--bleu-pale);stroke-width:1.4"/>' + Tx(25, 26, 'RC522', 'font-size:5px;font-weight:900', 'middle') +
      ledD(-38, 14, 5, 'vert') + '<circle cx="-20" cy="14" r="5" class="led led2 fin"/>' + Tx(-8, 17, 'BIP', 'font-size:6px;font-weight:900');
  } },
  personne: { w: 50, h: 96, s: function () {
    return '<circle cx="0" cy="-34" r="11" class="tr" style="fill:var(--m-peau)"/>' + '<path d="M-18 14v-22q0 -12 12 -12h12q12 0 12 12v22z" class="tr" style="fill:var(--focus)"/>' + R(-11, 14, 9, 30, 'var(--m-noir)', 'tr', 2) + R(2, 14, 9, 30, 'var(--m-noir)', 'tr', 2);
  } },
  netem: { w: 70, h: 40, s: function () {
    return R(-32, -14, 64, 28, 'var(--jaune)', 'tr netem-fond', 4) + Tx(0, 4, 'tc netem', 'font-size:10px;font-weight:1000', 'middle');
  } }
};

/* ---------- calques ---------- */
var layLien = el('g', {}, svg), layOnde = el('g', {}, svg), layNoeud = el('g', {}, svg), layTrace = el('g', {}, svg), layTok = el('g', {}, svg), layBul = el('g', {}, svg);
var N = {}, L = [];
function pill(parent, x, y, lines) {
  var g = el('g', { 'class': 'nom' }, parent), sh = el('rect', { 'class': 'ombre' }, g), bg = el('rect', { 'class': 'fond' }, g), tg = el('g', {}, g);
  el('text', { x: 0, y: 0, 'class': 'p1', 'text-anchor': 'middle' }, tg, lines[0]);
  if (lines[1]) el('text', { x: 0, y: 14.5, 'class': 'p2', 'text-anchor': 'middle' }, tg, lines[1]);
  var b = tg.getBBox(), h = b.height + 9, w = b.width + 18, rx = lines[1] ? 9 : h / 2;
  [[sh, 3], [bg, 0]].forEach(function (p) { p[0].setAttribute('x', b.x - 9 + p[1]); p[0].setAttribute('y', b.y - 4.5 + p[1]); p[0].setAttribute('width', w); p[0].setAttribute('height', h); p[0].setAttribute('rx', rx); });
  g.setAttribute('transform', 'translate(' + r1(x) + ' ' + r1(y - b.y + 4.5) + ')');
  return { g: g, w: w, h: h };
}
/* « ?cadre » (diaporama) : pas de volet physique (matériel de mesure masqué, étapes « physique » retirées) */
var PHYS = {};
if (document.documentElement.classList.contains('cadre')) {
  D.noeuds.forEach(function (n) { if (/^(oscillo|banc-papier|banc-froid)$/.test(n.k)) { PHYS[n.id] = 1; n.cache = true; } });
  var phys = function (e) { return /physique|humidit/i.test(e.t) || (e.on || []).some(function (id) { return PHYS[id]; }); };
  D.etapes = D.etapes.filter(function (e) { return !phys(e); });
  var num = 0;
  D.etapes.forEach(function (e) { if (/^\d+\.\s/.test(e.t)) e.t = e.t.replace(/^\d+\./, ++num + '.'); });
  D.etapes.forEach(function (e) {
    e.x = e.x.replace(/, le <b>PC de supervision<\/b> \(tableau de bord\) et le <b>banc de physique<\/b>/g, ' et le <b>PC de supervision</b> (tableau de bord)')
             .replace(/ Devant à droite, le <b>banc de physique<\/b>\./g, '')
             .replace(/,? et le <b>banc de physique<\/b>/g, '');
  });
}
D.noeuds.forEach(function (n) {
  var hw = HW[n.k], g = el('g', { 'class': 'noeud', 'data-id': n.id, transform: 'translate(' + n.x + ' ' + n.y + ')' }, layNoeud);
  var dessin = el('g', { 'class': 'dessin' }, g); dessin.innerHTML = hw.s();
  var cote = n.cote || 'bas', lx = 0, ly = hw.h / 2 + 8;
  if (n.nom) {
    var p = pill(g, 0, 0, [n.nom, n.sous]);
    if (cote === 'haut') ly = -hw.h / 2 - 8 - p.h; else if (cote === 'gauche') { lx = -hw.w / 2 - 10 - p.w / 2; ly = -p.h / 2; } else if (cote === 'droite') { lx = hw.w / 2 + 10 + p.w / 2; ly = -p.h / 2; }
    p.g.setAttribute('transform', 'translate(' + r1(lx) + ' ' + r1(ly - p.g.querySelector('g').getBBox().y + 4.5) + ')');
  }
  var et = el('g', { 'class': 'etat', style: 'display:none' }, g);
  N[n.id] = { n: n, g: g, hw: hw, etat: et, etatY: -hw.h / 2 - 16 };
});
/* lignes droites : chaque segment oblique devient un angle droit (horizontal puis vertical, ou l'inverse) */
function orthogonal(pts) {
  var out = [pts[0]];
  for (var i = 1; i < pts.length; i++) {
    var p = out[out.length - 1], q = pts[i], dx = q[0] - p[0], dy = q[1] - p[1];
    if (Math.abs(dx) > 1 && Math.abs(dy) > 1) out.push(Math.abs(dx) >= Math.abs(dy) ? [q[0], p[1]] : [p[0], q[1]]);
    out.push(q);
  }
  return out;
}
D.liens.forEach(function (l) {
  var a = N[l[0]].n, b = N[l[1]].n, o = l[4] || {}, pts = orthogonal([[a.x, a.y]].concat(o.via || []).concat([[b.x, b.y]]));
  var g = el('g', { 'class': 'lien-g' }, layLien);
  var p = el('path', { d: 'M' + pts.map(function (q) { return q.join(' '); }).join('L'), 'class': 'lien ' + (l[2] || 'eth') }, g);
  if (l[3]) {
    var len = p.getTotalLength(), q = p.getPointAtLength(len * (o.t == null ? 0.5 : o.t));
    var bgR = el('rect', { 'class': 'lien-fond', rx: 4 }, g), t = el('text', { x: r1(q.x), y: r1(q.y + 4), 'text-anchor': 'middle', 'class': 'lien-txt' }, g, l[3]), bb = t.getBBox();
    bgR.setAttribute('x', bb.x - 5); bgR.setAttribute('y', bb.y - 2); bgR.setAttribute('width', bb.width + 10); bgR.setAttribute('height', bb.height + 4);
  }
  L.push({ a: l[0], b: l[1], pts: pts, g: g, p: p });
});
/* cadrage (en comptant les nœuds cachés au départ, qui apparaissent pendant une étape), puis on les cache */
D.noeuds.forEach(function (n) { if (PHYS[n.id]) { N[n.id].g.classList.add('cache'); L.forEach(function (l) { if (l.a === n.id || l.b === n.id) l.g.classList.add('cache'); }); } });
(function () { var b = svg.getBBox(), m = 24; svg.setAttribute('viewBox', [r1(b.x - m), r1(b.y - m - 30), r1(b.width + 2 * m), r1(b.height + 2 * m + 30)].join(' ')); })();
D.noeuds.forEach(function (n) { if (n.cache) { N[n.id].g.classList.add('cache'); L.forEach(function (l) { if (l.a === n.id || l.b === n.id) l.g.classList.add('cache'); }); } });

/* ---------- outils des étapes ---------- */
var RUN = 0, BUL = {};
/* pause : une horloge virtuelle qui s'arrête pendant la pause ; minuteurs et trajets suivent cette horloge */
var PAUSE = false, pauseA = 0, decal = 0, MINUTEURS = [];
function vt() { return (PAUSE ? pauseA : performance.now()) - decal; }
function armer(m) { m.h = setTimeout(function () { var i = MINUTEURS.indexOf(m); if (i >= 0) MINUTEURS.splice(i, 1); m.fn(); }, Math.max(0, m.due - vt())); }
function plusTard(fn, ms) { var m = { fn: fn, due: vt() + ms, h: 0 }; MINUTEURS.push(m); if (!PAUSE) armer(m); return m; }
function sleep(ms) { var id = RUN; return new Promise(function (res, rej) { plusTard(function () { id === RUN ? res() : rej(CANCEL); }, REDUCED ? Math.min(ms, 400) : ms); }); }
function bg(p) { p.catch(function () {}); return p; }
function chemin(ids) {
  var out = [];
  for (var i = 0; i < ids.length - 1; i++) {
    var a = ids[i], b = ids[i + 1], seg = null;
    L.forEach(function (l) { if (l.a === a && l.b === b) seg = l.pts; else if (l.a === b && l.b === a) seg = l.pts.slice().reverse(); });
    if (!seg) seg = orthogonal([[N[a].n.x, N[a].n.y], [N[b].n.x, N[b].n.y]]);
    out = out.concat(i ? seg.slice(1) : seg);
  }
  return out;
}
function go(ids, kind, label, o) {
  if (ids.some(function (id) { return PHYS[id]; })) return Promise.resolve();
  o = o || {}; var id = RUN, pts = chemin(ids);
  return new Promise(function (res, rej) {
    var tr = el('path', { d: 'M' + pts.map(function (q) { return q.join(' '); }).join('L'), 'class': 'trace k-' + (kind || 'bleu') }, layTrace), Lg = tr.getTotalLength();
    if (o.noTrace) tr.style.display = 'none';
    tr.style.strokeDasharray = Lg; tr.style.strokeDashoffset = Lg;
    var tok = el('g', { 'class': 'tok k-' + (kind || 'bleu') }, layTok);
    el('circle', { r: o.size || 8 }, tok);
    if (label) {
      var lg = el('g', {}, tok), rb = el('rect', { 'class': 'fond-tok', rx: 9 }, lg), t = el('text', { x: 0, y: -17, 'text-anchor': 'middle' }, lg, label), b = t.getBBox();
      rb.setAttribute('x', b.x - 8); rb.setAttribute('y', b.y - 3); rb.setAttribute('width', b.width + 16); rb.setAttribute('height', b.height + 6);
    }
    var dur = REDUCED ? 300 : Math.max(700, Lg / (o.speed || 260) * 1000), stopAt = o.dropAt == null ? 1 : o.dropAt, t0 = null;
    function frame() {
      if (id !== RUN) { tr.remove(); tok.remove(); return rej(CANCEL); }
      var t = vt(); if (t0 == null) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = 0.5 - Math.cos(Math.PI * k) / 2, kk = Math.min(e, stopAt), pt = tr.getPointAtLength(kk * Lg);
      tok.setAttribute('transform', 'translate(' + r1(pt.x) + ' ' + r1(pt.y) + ')');
      tr.style.strokeDashoffset = Lg * (1 - kk);
      if (e >= stopAt) {
        if (o.dropAt != null) tok.classList.add('perdu');
        plusTard(function () { tr.classList.add('fini'); plusTard(function () { tr.remove(); }, 650); if (o.dropAt == null) tok.remove(); else plusTard(function () { tok.remove(); }, 700); }, 150);
        return res();
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });
}
function bulle(id, lines, o) {
  if (PHYS[id]) return;
  o = o || {}; sans(id);
  var nd = N[id], hw = nd.hw, cote = o.cote || 'haut', ax = nd.n.x, ay = nd.n.y;
  var off = { haut: [0, -hw.h / 2], bas: [0, hw.h / 2], gauche: [-hw.w / 2, 0], droite: [hw.w / 2, 0] }[cote];
  ax += off[0] * 0.6; ay += off[1] * 0.6;
  var x = ax + (o.dx || 0) + (cote === 'droite' ? 40 : cote === 'gauche' ? -40 : 0), y = ay + (o.dy || 0) + (cote === 'haut' ? -40 : cote === 'bas' ? 40 : 0);
  var g = el('g', { 'class': 'bulle ' + (o.cls || '') }, layBul);
  el('line', { x1: r1(ax), y1: r1(ay), x2: r1(x), y2: r1(y), 'class': 'attache' }, g);
  var bx = el('g', {}, g), sh = el('rect', { style: 'fill:var(--encre)' }, bx), fd = el('rect', { 'class': 'fond' }, bx), tg = el('g', {}, bx);
  lines.forEach(function (t, i) {
    var mono = t.charAt(0) === '>', titre = t.charAt(0) === '#';
    el('text', { x: 0, y: i * 17, 'class': mono ? 'mono' : titre ? 'titre' : '' }, tg, mono || titre ? t.slice(1) : t);
  });
  var b = tg.getBBox(), w = b.width + 22, h = b.height + 14;
  [[sh, 3], [fd, 0]].forEach(function (p) { p[0].setAttribute('x', b.x - 11 + p[1]); p[0].setAttribute('y', b.y - 7 + p[1]); p[0].setAttribute('width', w); p[0].setAttribute('height', h); p[0].setAttribute('rx', 8); });
  var left = cote === 'droite' ? x : cote === 'gauche' ? x - w : x - w / 2, top = cote === 'haut' ? y - h : cote === 'bas' ? y : y - h / 2;
  bx.setAttribute('transform', 'translate(' + r1(left - b.x + 11) + ' ' + r1(top - b.y + 7) + ')');
  BUL[id] = g; return g;
}
function sans(id) { if (BUL[id]) { BUL[id].remove(); delete BUL[id]; } }
function etat(id, txt, cls) {
  var e = N[id].etat; e.innerHTML = '';
  if (!txt) { e.style.display = 'none'; return; }
  e.style.display = ''; e.setAttribute('class', 'etat ' + (cls || ''));
  var rr = el('rect', { rx: 10 }, e), t = el('text', { x: 0, y: 0, 'text-anchor': 'middle' }, e, txt), b = t.getBBox();
  var y = N[id].etatY; t.setAttribute('y', r1(y)); b = t.getBBox();
  rr.setAttribute('x', b.x - 9); rr.setAttribute('y', b.y - 4); rr.setAttribute('width', b.width + 18); rr.setAttribute('height', b.height + 8);
}
function led(id, c, n) { var l = N[id].g.querySelectorAll('.led')[n || 0]; if (l) l.setAttribute('class', 'led fin ' + (c || '')); }
function ecranTxt(id, lines, fond) {
  var g = N[id].g.querySelector('.ecran-txt'), f = N[id].g.querySelector('.ecran-fond'); if (!g) return;
  var F = { clair: 'var(--blanc)', sombre: 'var(--m-ecran)', jaune: 'var(--jaune)', bleu: 'var(--focus)' };
  f.style.fill = F[fond || 'sombre'];
  g.innerHTML = ''; var x = +g.dataset.x, y = +g.dataset.y, clair = fond === 'clair' || fond === 'jaune';
  (lines || []).forEach(function (l, i) {
    var s = typeof l === 'string' ? [l] : l;
    var t = el('text', { x: x, y: y + i * 10, 'class': 'mono', style: 'font-size:7.6px;font-weight:700;fill:' + (s[1] || (clair ? 'var(--encre)' : 'var(--blanc)')) }, g, s[0]);
    if (t.getComputedTextLength() > +g.dataset.w) { t.setAttribute('textLength', g.dataset.w); t.setAttribute('lengthAdjust', 'spacingAndGlyphs'); }   // texte trop long : on le resserre dans l'écran
  });
}
function lien(a, b, cls, on) { L.forEach(function (l) { if ((l.a === a && l.b === b) || (l.a === b && l.b === a)) l.p.classList.toggle(cls, on !== false); }); }
function montre(id, on) {
  if (PHYS[id]) on = false;
  N[id].g.classList.toggle('cache', !on);
  L.forEach(function (l) { if (l.a === id || l.b === id) l.g.classList.toggle('cache', !on); });
}
function onde(id, dir, rmax) {
  var nd = N[id].n, p = el('path', { 'class': 'onde' }, layOnde), dx = dir === 'gauche' ? -1 : 1, id0 = RUN;
  var t0 = null, dur = 1300, R0 = rmax || 120;
  return new Promise(function (res, rej) {
    function f() {
      if (id0 !== RUN) { p.remove(); return rej(CANCEL); }
      var t = vt(); if (t0 == null) t0 = t; var k = Math.min(1, (t - t0) / dur), r = 20 + (R0 - 20) * k, x0 = nd.x + dx * N[id].hw.w / 2;
      p.setAttribute('d', 'M' + r1(x0 + dx * r * Math.cos(.7)) + ' ' + r1(nd.y - r * Math.sin(.7)) + 'A' + r + ' ' + r + ' 0 0 ' + (dx > 0 ? 1 : 0) + ' ' + r1(x0 + dx * r * Math.cos(.7)) + ' ' + r1(nd.y + r * Math.sin(.7)));
      p.style.opacity = 1 - k;
      if (k < 1) requestAnimationFrame(f); else { p.remove(); res(); }
    }
    requestAnimationFrame(f);
  });
}
function flash(id) { var g = N[id].g; g.classList.remove('flash'); void g.getBBox(); g.classList.add('flash'); }
function q(id, sel) { return N[id].g.querySelector(sel); }
var S = { go: go, bulle: bulle, sans: sans, etat: etat, led: led, ecran: ecranTxt, lien: lien, montre: montre, onde: onde, flash: flash, sleep: sleep, bg: bg, q: q, N: N };

/* ---------- navigation ---------- */
var STEPS = D.etapes, cur = 0, vus = {};
var eNum = document.getElementById('eNum'), eTitre = document.getElementById('eTitre'), eTexte = document.getElementById('eTexte');
var pointsBox = document.getElementById('points'), bNext = document.getElementById('bNext'), bPrev = document.getElementById('bPrev');
var INIT = {};   // état de départ de chaque nœud, pour tout remettre à zéro à chaque étape
D.noeuds.forEach(function (n) { INIT[n.id] = { html: N[n.id].g.querySelector('.dessin').innerHTML }; });
STEPS.forEach(function (s, i) {
  var b = document.createElement('button'); b.type = 'button'; b.textContent = i; b.setAttribute('aria-label', 'Étape ' + i + ' : ' + s.t);
  b.addEventListener('click', function () { show(i); }); pointsBox.appendChild(b);
});
function reset() {
  RUN++; MINUTEURS.forEach(function (m) { clearTimeout(m.h); }); MINUTEURS = []; layTok.innerHTML = ''; layTrace.innerHTML = ''; layOnde.innerHTML = ''; layBul.innerHTML = ''; BUL = {};
  D.noeuds.forEach(function (n) { var nd = N[n.id]; nd.g.querySelector('.dessin').innerHTML = INIT[n.id].html; etat(n.id, null); montre(n.id, !n.cache); nd.g.classList.remove('flash'); });
  L.forEach(function (l) { l.p.classList.remove('coupe'); });
}
function show(i) {
  cur = Math.max(0, Math.min(STEPS.length - 1, i)); var s = STEPS[cur]; vus[cur] = true;
  pause(false); reset();
  if (D.init) D.init(S);
  if (s.init) s.init(S);
  eNum.textContent = 'Étape ' + cur + ' sur ' + (STEPS.length - 1);
  eTitre.textContent = s.t; eTexte.innerHTML = s.x;
  D.noeuds.forEach(function (n) { N[n.id].g.classList.toggle('on', !!s.all || (s.on || []).indexOf(n.id) >= 0); });
  L.forEach(function (l) { l.g.classList.toggle('on', !!s.all || ((s.on || []).indexOf(l.a) >= 0 && (s.on || []).indexOf(l.b) >= 0)); });
  svg.classList.toggle('focus', !s.all);
  bPrev.disabled = cur === 0;
  bNext.textContent = cur === STEPS.length - 1 ? 'Recommencer ↺' : 'Suivant ▶';
  Array.prototype.forEach.call(pointsBox.children, function (b, j) { if (j === cur) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); b.classList.toggle('vu', !!vus[j]); });
  try { history.replaceState(null, '', '#etape-' + cur); } catch (e) {}
  if (s.run) s.run(S).catch(function (e) { if (e !== CANCEL) console.error(e); });
}
bNext.addEventListener('click', function () { show(cur === STEPS.length - 1 ? 0 : cur + 1); });
bPrev.addEventListener('click', function () { show(cur - 1); });
document.getElementById('bReplay').addEventListener('click', function () { show(cur); });
/* bouton pause (ajouté après « Rejouer ») ; touche P ; message « schema-pause » envoyé par le diaporama */
var FIGEES = [], bPause = document.createElement('button'); bPause.type = 'button'; bPause.className = 'btn'; bPause.id = 'bPause';
document.getElementById('bReplay').after(bPause);
function pause(on) {
  if (on === PAUSE) { majPause(); return; }
  if (on) { PAUSE = true; pauseA = performance.now(); MINUTEURS.forEach(function (m) { clearTimeout(m.h); }); }
  else { decal += performance.now() - pauseA; PAUSE = false; MINUTEURS.forEach(armer); }
  /* les animations CSS s'arrêtent par la classe « en-pause » ; on fige en plus les transitions en cours */
  if (on && document.getAnimations) FIGEES = document.getAnimations().filter(function (a) { return a.playState === 'running' && !(window.CSSAnimation && a instanceof CSSAnimation); });
  FIGEES.forEach(function (a) { try { on ? a.pause() : a.play(); } catch (e) {} });
  if (!on) FIGEES = [];
  majPause();
}
function majPause() {
  document.documentElement.classList.toggle('en-pause', PAUSE);
  bPause.textContent = PAUSE ? '▶ Reprendre' : '❚❚ Pause'; bPause.setAttribute('aria-pressed', String(PAUSE));
  try { if (parent !== window) parent.postMessage({ schema: 'etat', pause: PAUSE }, '*'); } catch (e) {}
}
bPause.addEventListener('click', function () { pause(!PAUSE); });
addEventListener('message', function (e) { var d = e.data; if (d && d.schema === 'pause') pause(d.on == null ? !PAUSE : !!d.on); });
var bLab = document.getElementById('bLab');
function toggleLab() { var on = bLab.getAttribute('aria-pressed') !== 'true'; bLab.setAttribute('aria-pressed', String(on)); svg.classList.toggle('sans-lab', !on); }
bLab.addEventListener('click', toggleLab);
addEventListener('keydown', function (e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); if (cur < STEPS.length - 1) show(cur + 1); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); if (cur > 0) show(cur - 1); }
  else if (e.key === 'r' || e.key === 'R') show(cur);
  else if (e.key === 'p' || e.key === 'P') pause(!PAUSE);
  else if (e.key === 'e' || e.key === 'E') toggleLab();
});
var h = /#etape-(\d+)/.exec(location.hash);
show(h ? +h[1] : 0);
})();
