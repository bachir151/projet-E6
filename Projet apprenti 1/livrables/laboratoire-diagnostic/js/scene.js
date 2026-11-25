/* =====================================================================
   scene.js — LA SCÈNE 2,5D (SVG isométrique)
   Même projection et mêmes matériaux que architecture-2-5d.html.
   Couleurs : variables de theme.css uniquement (via labo.css).
   API : LABO.creerScene(svg) → { route, jeton, bulle, effacerBulles,
         etat, imprimer, vibrer, telephone, choc, ecranPC, eink, glpi, focus }
   ===================================================================== */
(function (racine) {
  'use strict';
  var LABO = racine.LABO = racine.LABO || {};
  var NS = 'http://www.w3.org/2000/svg';
  var C = Math.cos(Math.PI / 6), S = 0.5;

  function P(x, y, z) { return [(x - y) * C, (x + y) * S - (z || 0)]; }
  function r1(n) { return Math.round(n * 10) / 10; }
  function pts(a) { return a.map(function (p) { var q = P(p[0], p[1], p[2]); return r1(q[0]) + ',' + r1(q[1]); }).join(' '); }
  function dPath(a) { return a.map(function (p, i) { var q = P(p[0], p[1], p[2]); return (i ? 'L' : 'M') + r1(q[0]) + ' ' + r1(q[1]); }).join(''); }
  function dEcran(a) { return a.map(function (q, i) { return (i ? 'L' : 'M') + r1(q[0]) + ' ' + r1(q[1]); }).join(''); }
  function el(tag, attrs, parent, text) {
    var e = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function m(name, f) { return 'var(--m-' + name + '-' + f + ')'; }
  function poly(g, a, fill, cls) { return el('polygon', { points: pts(a), style: 'fill:' + fill, 'class': cls }, g); }
  function box(g, x, y, z, w, d, h, mat, cls) {
    var gg = el('g', { 'class': cls }, g);
    return {
      g: gg,
      r: poly(gg, [[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], m(mat, 'r')),
      l: poly(gg, [[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], m(mat, 'l')),
      t: poly(gg, [[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], m(mat, 't'))
    };
  }
  function faceL(g, x0, Y, ztop) { var o = P(x0, Y, ztop); return el('g', { transform: 'matrix(' + C + ' ' + S + ' 0 1 ' + r1(o[0]) + ' ' + r1(o[1]) + ')' }, g); }
  function faceR(g, X, y0, ztop) { var o = P(X, y0, ztop); return el('g', { transform: 'matrix(' + C + ' ' + (-S) + ' 0 1 ' + r1(o[0]) + ' ' + r1(o[1]) + ')' }, g); }
  function faceT(g, x0, y0, Z) { var o = P(x0, y0, Z); return el('g', { transform: 'matrix(' + C + ' ' + S + ' ' + (-C) + ' ' + S + ' ' + r1(o[0]) + ' ' + r1(o[1]) + ')' }, g); }
  function desk(g, x, y, w, d, h) {
    [[x + 3, y + 3], [x + w - 7, y + 3], [x + 3, y + d - 7], [x + w - 7, y + d - 7]].forEach(function (p) { box(g, p[0], p[1], 0, 4, 4, h - 4, 'noir'); });
    return box(g, x, y, h - 4, w, d, 4, 'bois');
  }
  function txt(g, x, y, s, style, anchor, cls) { return el('text', { x: x, y: y, 'text-anchor': anchor || null, style: style, 'class': cls }, g, s); }
  function rev(a) { return a.slice().reverse(); }

  LABO.creerScene = function (svg, opts) {
    svg.innerHTML = '';
    var monde = el('g', { 'class': 'monde' }, svg);
    var laySol = el('g', {}, monde), layCable = el('g', {}, monde), layDev = el('g', {}, monde);
    var layReel = el('g', { 'class': 'reel' }, svg), layLab = el('g', { 'class': 'etiq' }, svg);
    var layTrace = el('g', {}, svg), layTok = el('g', {}, svg), layBul = el('g', {}, svg);
    var DEV = {};
    function dev(k) { var g = el('g', { 'class': 'dev', 'data-dev': k }, layDev); DEV[k] = g; return g; }

    /* ---------- la pièce ---------- */
    var FX = 660, FY = 500;
    box(laySol, 0, 0, -14, FX, FY, 14, 'sol');
    var grille = '';
    for (var gx = 40; gx < FX; gx += 40) grille += dPath([[gx, 0, 0], [gx, FY, 0]]);
    for (var gy = 40; gy < FY; gy += 40) grille += dPath([[0, gy, 0], [FX, gy, 0]]);
    el('path', { d: grille, 'class': 'sol-grille' }, laySol);
    poly(laySol, [[0, 0, 0], [0, FY, 0], [0, FY, 175], [0, 0, 175]], m('mur', 'r'));
    poly(laySol, [[0, 0, 0], [FX, 0, 0], [FX, 0, 175], [0, 0, 175]], m('mur', 'l'));
    var zA = faceT(laySol, 150, 455, 0.2); txt(zA, 0, 0, 'SECRÉTARIAT · CARDIOLOGIE (fictif)', 'font-size:13px;font-weight:1000;letter-spacing:.08em', null, 'sol-txt');
    var zB = faceT(laySol, 420, 150, 0.2); txt(zB, 0, 0, 'SERVICE INFORMATIQUE', 'font-size:13px;font-weight:1000;letter-spacing:.08em', null, 'sol-txt');

    /* ---------- câbles : chemins réutilisés par les messages ---------- */
    function versSwitch(px, lane) { return [[px, lane, 0], [px, 66, 0], [px, 64, 0], [px, 64, 62], [px, 60, 68]]; }
    var SEG = {
      srv: [[65, 85, 10], [65, 90, 0]].concat(versSwitch(160, 90)),
      pc: [[44, 300, 40], [100, 300, 34], [104, 300, 0], [104, 122, 0]].concat(versSwitch(174, 122)),
      imp: [[252, 372, 60], [246, 372, 40], [236, 372, 0], [222, 372, 0], [222, 140, 0]].concat(versSwitch(190, 140)),
      tec: [[623, 95, 6], [623, 110, 0]].concat(versSwitch(205, 110)),
      ap: [[330, 11, 128], [330, 4, 122], [330, 4, 2], [330, 8, 0], [330, 100, 0]].concat(versSwitch(216, 100))
    };
    var USB = [[96, 320, 38], [104, 320, 30], [106, 320, 0], [236, 320, 0], [236, 360, 0], [246, 360, 40], [252, 360, 56]];
    var WIFI = (function () { var a = [290, 366, 112], b = [330, 12, 132], out = []; for (var i = 0; i <= 24; i++) { var t = i / 24; out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t + 60 * Math.sin(Math.PI * t)]); } return out; })();
    var cables = {};
    ['srv', 'pc', 'tec', 'ap'].forEach(function (k) { cables[k] = el('path', { d: dPath(SEG[k]), 'class': 'cable' }, layCable); });
    cables.imp = el('path', { d: dPath(SEG.imp), 'class': 'cable' }, layCable);
    cables.impCoupe = el('path', { d: dPath(SEG.imp.slice(2)), 'class': 'cable', style: 'display:none' }, layCable);
    cables.usb = el('path', { d: dPath(USB), 'class': 'cable usb', style: 'display:none' }, layCable);
    cables.usbCoupe = el('path', { d: dPath(USB.slice(0, 4)), 'class': 'cable usb', style: 'display:none' }, layCable);
    var onde = el('path', { d: dPath(WIFI), 'class': 'onde' }, layCable);

    /* ---------- borne Wi-Fi ---------- */
    (function () {
      var g = dev('ap');
      box(g, 310, 0, 120, 40, 10, 14, 'blanc');
      el('path', { d: dPath([[316, 6, 134], [312, 6, 160]]) + dPath([[344, 6, 134], [348, 6, 160]]), 'class': 'tr', style: 'fill:none;stroke-width:3' }, g);
      var f = faceL(g, 310, 10, 134);
      el('circle', { cx: 8, cy: 7, r: 2.2, 'class': 'ns', style: 'fill:var(--vert)' }, f);
    })();

    /* ---------- serveur Ubuntu (VM 2) ---------- */
    (function () {
      var g = dev('srv');
      box(g, 40, 30, 0, 50, 55, 100, 'noir');
      var f = faceL(g, 40, 85, 100);
      [8, 20, 32].forEach(function (y) { el('rect', { x: 6, y: y, width: 38, height: 8, rx: 1, 'class': 'tr', style: 'fill:var(--m-noir-t);stroke-width:.8' }, f); el('rect', { x: 34, y: y + 3, width: 6, height: 2, 'class': 'ns', style: 'fill:var(--contour-2)' }, f); });
      for (var i = 0; i < 6; i++) el('rect', { x: 8, y: 52 + i * 6, width: 34, height: 2.2, 'class': 'ns', style: 'fill:var(--m-noir-t)' }, f);
      el('circle', { cx: 25, cy: 92, r: 2.6, 'class': 'ns voyant-srv', style: 'fill:var(--vert)' }, f);
    })();

    /* ---------- baie + switch HP ProCurve ---------- */
    (function () {
      var g = dev('sw');
      box(g, 140, 20, 0, 92, 42, 62, 'gris');
      var fb = faceL(g, 140, 62, 62);
      el('path', { d: 'M8 10h76M8 20h76M8 30h76M8 40h76M8 50h76', 'class': 'tr', style: 'fill:none;stroke:var(--contour-2);stroke-width:1' }, fb);
      box(g, 144, 23, 62, 84, 37, 11, 'alu');
      var f = faceL(g, 144, 60, 73);
      for (var i = 0; i < 12; i++) {
        el('rect', { x: 6 + i * 5.6, y: 3, width: 4, height: 4.4, 'class': 'ns', style: 'fill:var(--encre)' }, f);
        el('rect', { x: 6.8 + i * 5.6, y: 8.4, width: 2.4, height: 1.3, 'class': 'ns', style: 'fill:' + (i < 6 ? 'var(--vert)' : 'var(--jaune-fonce)') }, f);
      }
      txt(f, 76, 8, 'HP', 'font-size:4px;font-weight:900');
    })();

    /* ---------- poste du technicien (GLPI) ---------- */
    var glpiLignes = [], glpiTete;
    (function () {
      var g = dev('tec');
      desk(g, 420, 30, 180, 80, 38);
      box(g, 608, 40, 0, 30, 55, 70, 'noir');
      box(g, 480, 60, 38, 40, 20, 2, 'noir');
      box(g, 496, 65, 40, 8, 6, 14, 'noir');
      box(g, 440, 58, 52, 120, 7, 72, 'noir');
      var f = faceL(g, 440, 65, 124);
      el('rect', { x: 4, y: 4, width: 112, height: 64, 'class': 'ns', style: 'fill:var(--blanc)' }, f);
      el('rect', { x: 4, y: 4, width: 112, height: 9, 'class': 'ns', style: 'fill:var(--encre)' }, f);
      glpiTete = el('circle', { cx: 109, cy: 8.5, r: 2.6, 'class': 'ns', style: 'fill:var(--vert)' }, f);
      txt(f, 8, 11, 'GLPI · tickets', 'font-size:6px;font-weight:900;fill:var(--blanc)');
      for (var i = 0; i < 6; i++) glpiLignes.push(txt(f, 8, 22 + i * 8.2, '', 'font-size:5px;font-weight:' + (i ? 700 : 900)));
      box(g, 460, 82, 38, 80, 16, 2, 'gris');
      // le technicien
      box(g, 500, 122, 0, 30, 30, 22, 'gris');
      box(g, 500, 150, 22, 30, 5, 30, 'gris');
      var q = P(515, 132, 22);
      var gp = el('g', { 'class': 'perso' }, g);
      el('path', { d: 'M' + (q[0] - 13) + ' ' + q[1] + 'q0 -30 13 -32q13 2 13 32z', style: 'fill:var(--m-pcb-t)', 'class': 'tr' }, gp);
      el('circle', { cx: q[0], cy: q[1] - 40, r: 8.5, style: 'fill:var(--m-bois-t)', 'class': 'tr' }, gp);
      el('path', { d: 'M' + (q[0] - 8.5) + ' ' + (q[1] - 42) + 'q8.5 -12 17 0q-8.5 -5 -17 0z', style: 'fill:var(--encre)', 'class': 'ns' }, gp);
    })();

    /* ---------- PC de Nadia + Nadia ---------- */
    var pcLignes = [], pcTitre;
    (function () {
      var g = dev('pc');
      desk(g, 15, 190, 85, 150, 38);
      box(g, 22, 245, 38, 20, 40, 2, 'noir');
      box(g, 30, 262, 40, 6, 8, 14, 'noir');
      box(g, 40, 215, 52, 7, 100, 68, 'noir');
      var f = faceR(g, 47, 215, 120);
      el('rect', { x: 4, y: 4, width: 92, height: 60, 'class': 'ns', style: 'fill:var(--ecran-sombre)' }, f);
      el('rect', { x: 4, y: 4, width: 92, height: 7, 'class': 'ns', style: 'fill:var(--encre-2)' }, f);
      pcTitre = txt(f, 8, 9.6, 'PC-SECRETARIAT · Windows 11', 'font-size:5px;font-weight:800;fill:var(--blanc)');
      for (var i = 0; i < 5; i++) pcLignes.push(txt(f, 8, 21 + i * 9, '', 'font-size:6px;font-weight:800;fill:var(--blanc)'));
      box(g, 62, 230, 38, 18, 70, 2, 'gris');
      box(g, 66, 310, 38, 10, 7, 2.5, 'gris');
      // téléphone
      box(g, 70, 325, 38, 16, 12, 3, 'noir');
      box(g, 72, 326, 41, 12, 4, 3, 'noir');
    })();
    var nadia = (function () {
      var g = dev('nadia');
      box(g, 112, 250, 0, 30, 30, 22, 'gris');
      box(g, 138, 250, 22, 5, 30, 30, 'gris');
      var q = P(124, 265, 22), gp = el('g', { 'class': 'perso' }, g);
      el('path', { d: 'M' + (q[0] - 13) + ' ' + q[1] + 'q0 -30 13 -32q13 2 13 32z', style: 'fill:var(--m-jaune-t)', 'class': 'tr' }, gp);
      el('circle', { cx: q[0], cy: q[1] - 40, r: 8.5, style: 'fill:var(--m-bois-t)', 'class': 'tr' }, gp);
      el('path', { d: 'M' + (q[0] - 9) + ' ' + (q[1] - 38) + 'q0 -14 9 -12q9 -2 9 12q-2 6 0 12q-4 -6 -9 -9q-5 3 -9 9q2 -6 0 -12z', style: 'fill:var(--encre)', 'class': 'ns' }, gp);
      var combine = el('path', { d: 'M' + (q[0] + 6) + ' ' + (q[1] - 48) + 'q8 4 4 16', style: 'fill:none;stroke:var(--encre);stroke-width:3.5;stroke-linecap:round;display:none' }, gp);
      return { g: g, tete: [q[0], q[1] - 52], combine: combine };
    })();

    /* ---------- imprimante + boîtier ESP32 ---------- */
    var I = {};
    (function () {
      var g = dev('imp');
      box(g, 240, 330, 0, 128, 96, 40, 'gris');
      var fm = faceL(g, 240, 426, 40);
      el('path', { d: 'M6 18h116M60 6v28', 'class': 'tr', style: 'fill:none;stroke-width:1' }, fm);
      I.corps = el('g', { 'class': 'corps-imp' }, g);
      box(I.corps, 252, 338, 40, 92, 72, 46, 'blanc');
      box(I.corps, 252, 338, 86, 92, 72, 6, 'gris');
      var ff = faceL(I.corps, 252, 410, 86);
      el('rect', { x: 10, y: 8, width: 72, height: 6, rx: 1, 'class': 'ns', style: 'fill:var(--encre)' }, ff);
      el('rect', { x: 8, y: 28, width: 76, height: 14, rx: 1.5, 'class': 'tr', style: 'fill:var(--papier-2);stroke-width:.8' }, ff);
      I.papier = el('rect', { x: 11, y: 31, width: 70, height: 8, 'class': 'ns', style: 'fill:var(--blanc)' }, ff);
      I.papierVide = txt(ff, 46, 38, 'BAC VIDE', 'font-size:6px;font-weight:1000;fill:var(--rouge-texte);display:none', 'middle');
      var fr = faceR(I.corps, 344, 346, 86);
      el('rect', { x: 8, y: 6, width: 40, height: 13, rx: 1.5, 'class': 'tr', style: 'fill:var(--ecran-sombre);stroke-width:.8' }, fr);
      I.lcd = txt(fr, 28, 14.6, 'Prête', 'font-size:5.6px;font-weight:900;fill:var(--vert)', 'middle');
      I.voyant = el('circle', { cx: 55, cy: 12.5, r: 3, 'class': 'tr', style: 'stroke-width:.8;fill:var(--vert)' }, fr);
      box(I.corps, 262, 410, 54, 60, 18, 2, 'gris');
      I.feuilles = el('g', {}, I.corps);
      // boîtier en plexiglas (V1 : accéléromètre, bouton, écran e-ink)
      box(I.corps, 262, 346, 92, 56, 40, 13, 'verre');
      var ft = faceT(I.corps, 262, 346, 105);
      el('rect', { x: 4, y: 4, width: 24, height: 13, rx: 1, 'class': 'tr', style: 'fill:var(--m-noir-r);stroke-width:.8' }, ft);
      el('rect', { x: 6, y: 6, width: 9, height: 9, rx: .8, 'class': 'ns', style: 'fill:var(--m-alu-t)' }, ft);
      txt(ft, 16.5, 12.5, 'ESP32', 'font-size:3.3px;font-weight:900;fill:var(--blanc)');
      I.mpu = el('rect', { x: 32, y: 4, width: 11, height: 9, rx: .8, 'class': 'tr mpu', style: 'fill:var(--focus);stroke-width:.7' }, ft);
      txt(ft, 37.5, 17, 'MPU6050', 'font-size:2.6px;font-weight:900', 'middle');
      I.led = el('circle', { cx: 9, cy: 30, r: 3.2, 'class': 'tr', style: 'stroke-width:.8;fill:var(--vert)' }, ft);
      I.bouton = el('circle', { cx: 44, cy: 30, r: 7, 'class': 'tr', style: 'stroke-width:1;fill:var(--rouge)' }, ft);
      var fe = faceL(I.corps, 262, 386, 105);
      el('rect', { x: 4, y: 1.5, width: 48, height: 10, rx: 1, 'class': 'tr', style: 'fill:var(--blanc);stroke-width:.8' }, fe);
      I.eink = txt(fe, 28, 6.6, 'PRÊTE', 'font-size:4.4px;font-weight:1000', 'middle');
      I.eink2 = txt(fe, 28, 10.4, 'màj 9 h 08', 'font-size:2.8px;font-weight:700', 'middle');
    })();

    /* ---------- les étiquettes ---------- */
    function pastille(parent, x, y, l1, l2) {
      var g = el('g', { 'class': 'pill' }, parent);
      var sh = el('rect', { 'class': 'ombre' }, g), bg = el('rect', { 'class': 'fond' }, g), tg = el('g', {}, g);
      el('text', { x: 0, y: 0, 'class': 'p1', 'text-anchor': 'middle' }, tg, l1);
      var t2 = l2 ? el('text', { x: 0, y: 14.5, 'class': 'p2', 'text-anchor': 'middle' }, tg, l2) : null;
      var b = tg.getBBox(), h = b.height + 9, w = b.width + 18, rx = l2 ? 9 : h / 2;
      [[sh, 3], [bg, 0]].forEach(function (p) { p[0].setAttribute('x', b.x - 9 + p[1]); p[0].setAttribute('y', b.y - 4.5 + p[1]); p[0].setAttribute('width', w); p[0].setAttribute('height', h); p[0].setAttribute('rx', rx); });
      g.setAttribute('transform', 'translate(' + r1(x) + ' ' + r1(y - (b.y + b.height + 4.5)) + ')');
      return { g: g, t2: t2 };
    }
    var ETIQ = [
      ['srv', [65, 57, 100], -40, -78, 'Serveur Ubuntu', 'VM 2 · 192.168.50.20'],
      ['sw', [186, 41, 74], 46, -22, 'Switch HP ProCurve', 'réseau en place'],
      ['ap', [330, 5, 160], 0, -8, 'Borne Wi-Fi', 'du laboratoire'],
      ['tec', [500, 62, 124], 30, -16, 'Poste du technicien', 'navigateur · GLPI'],
      ['pc', [44, 265, 120], -30, -18, 'PC de Nadia', 'Windows 11 · ' + LABO.DECOR.ipPc],
      ['esp', [290, 366, 105], 112, -24, 'Boîtier ESP32', 'MPU6050 · bouton · e-ink'],
      ['imp', [300, 426, 20], -40, 96, 'Imprimante IMP-CARDIO', 'réseau · 192.168.50.30']
    ];
    var ancreEtiq = {}, lignesEtiq = {};
    ETIQ.forEach(function (L) {
      var a = P(L[1][0], L[1][1], L[1][2]), x = a[0] + L[2], y = a[1] + L[3];
      var g = el('g', { 'data-lab': L[0] }, layLab);
      el('line', { x1: a[0], y1: a[1], x2: x, y2: y, 'class': 'attache' }, g);
      el('circle', { cx: a[0], cy: a[1], r: 3, 'class': 'lab-dot' }, g);
      lignesEtiq[L[0]] = pastille(g, x, y, L[4], L[5]);
      ancreEtiq[L[0]] = [x, y];
    });

    /* ---------- les services du serveur (là où arrivent les messages) ---------- */
    var SRV0 = P(65, 57, 100), SERV = {};
    (function () {
      var g = el('g', { 'class': 'services' }, layLab), x0 = SRV0[0] - 330, y0 = SRV0[1] - 120;
      el('rect', { x: x0 + 3, y: y0 + 3, width: 180, height: 128, rx: 12, 'class': 'ombre-srv' }, g);
      el('rect', { x: x0, y: y0, width: 180, height: 128, rx: 12, 'class': 'fond-srv' }, g);
      txt(g, x0 + 12, y0 + 19, 'DANS LE SERVEUR', 'font-size:10px;font-weight:900;letter-spacing:.12em', null, 'srv-titre');
      [['cups', 'CUPS', 'file d\'impression'], ['mqtt', 'Mosquitto', 'MQTT/TLS 8883'], ['py', 'Python', 'sonde + règles'], ['glpi', 'GLPI', '+ MariaDB, HTTPS']].forEach(function (s, i) {
        var y = y0 + 32 + i * 24, gg = el('g', { 'class': 'service', 'data-s': s[0] }, g);
        el('rect', { x: x0 + 8, y: y, width: 164, height: 20, rx: 10, 'class': 'srv-ligne' }, gg);
        txt(gg, x0 + 18, y + 14, s[1], 'font-size:11px;font-weight:900');
        txt(gg, x0 + 166, y + 14, s[2], 'font-size:8.5px;font-weight:700', 'end', 'srv-sous');
        SERV[s[0]] = [x0 + 180, y + 10];
      });
      el('path', { d: 'M' + (x0 + 180) + ' ' + (y0 + 64) + 'C' + (x0 + 220) + ' ' + (y0 + 64) + ' ' + (SRV0[0] - 30) + ' ' + (SRV0[1] - 60) + ' ' + SRV0[0] + ' ' + (SRV0[1] - 2), 'class': 'attache pointille' }, g);
    })();

    /* ---------- couche « réalité » (cachée en mode masqué) ---------- */
    function marque(x, y, texte) {
      var g = el('g', { 'class': 'marque-reel' }, layReel);
      var t = el('text', { x: x, y: y, 'text-anchor': 'middle' }, g, texte);
      var b = t.getBBox();
      el('rect', { x: b.x - 8, y: b.y - 4, width: b.width + 16, height: b.height + 8, rx: 8 }, g).parentNode.insertBefore(g.lastChild, t);
      return g;
    }

    /* ---------- routes des messages ---------- */
    function pt(p) { return P(p[0], p[1], p[2]); }
    function chemin(a) { return a.map(pt); }
    var HAUT = { pc: P(44, 265, 122), imp: P(300, 374, 92), esp: P(290, 366, 108), tec: P(500, 62, 126), srv: SRV0 };
    function service(proto, sens) {
      if (/IPP/.test(proto)) return 'cups';
      if (/MQTT/.test(proto)) return 'mqtt';
      if (/API/.test(proto)) return sens === 'vers' ? 'glpi' : 'py';
      if (proto === 'HTTPS') return 'glpi';
      return 'py';
    }
    function versServeur(pts, proto) { return pts.concat([SRV0, SERV[service(proto, 'vers')]]); }
    function route(de, vers, proto) {
      var r;
      if (de === 'srv' && vers === 'glpi') return [SERV.py, [SERV.py[0] + 30, SERV.py[1] + 12], SERV.glpi];
      if (de === 'glpi' && vers === 'srv') return [SERV.glpi, [SERV.py[0] + 30, SERV.py[1] + 12], SERV.py];
      if (de === 'mqtt') return [SERV.mqtt, [SERV.mqtt[0] + 30, SERV.mqtt[1] + 12], SERV.py];
      if ((de === 'pc' && vers === 'imp') || (de === 'imp' && vers === 'pc')) { r = chemin(USB); r.unshift(HAUT.pc); r.push(HAUT.imp); return de === 'pc' ? r : rev(r); }
      if (de === 'esp' || vers === 'esp') {
        r = [HAUT.esp].concat(chemin(WIFI), chemin(SEG.ap), chemin(rev(SEG.srv)));
        r = r.concat([SRV0, SERV.mqtt]);
        return de === 'esp' ? r : rev(r);
      }
      var a = de === 'srv' ? vers : de;
      r = [HAUT[a]].concat(chemin(SEG[a]), chemin(rev(SEG.srv)));
      r = versServeur(r, proto);
      if (de === 'srv') { r = rev(r); r[0] = SERV[service(proto, 'de')]; }
      return r;
    }

    /* ---------- jetons animés ---------- */
    function longueur(r) { var L = 0; for (var i = 1; i < r.length; i++) L += Math.hypot(r[i][0] - r[i - 1][0], r[i][1] - r[i - 1][1]); return L; }
    function point(r, f) {
      var L = longueur(r) * f, acc = 0;
      for (var i = 1; i < r.length; i++) {
        var s = Math.hypot(r[i][0] - r[i - 1][0], r[i][1] - r[i - 1][1]);
        if (acc + s >= L) { var u = s ? (L - acc) / s : 0; return [r[i - 1][0] + (r[i][0] - r[i - 1][0]) * u, r[i - 1][1] + (r[i][1] - r[i - 1][1]) * u]; }
        acc += s;
      }
      return r[r.length - 1];
    }
    function famille(proto) {
      if (/MQTT/.test(proto)) return 'k-mqtt';
      if (/IPP|USB/.test(proto)) return 'k-ipp';
      if (/SNMP|ICMP|TCP/.test(proto)) return 'k-snmp';
      if (/WinRM/.test(proto)) return 'k-jea';
      return 'k-glpi';
    }
    function jeton(r, proto, opts, ctx) {
      opts = opts || {};
      var k = famille(proto), stop = opts.stop || 1;
      var trace = el('path', { d: dEcran(r), 'class': 'trace ' + k }, layTrace);
      if (ctx.instant) { trace.classList.add('fin'); setTimeout(function () { trace.remove(); }, 50); return Promise.resolve(); }
      var g = el('g', { 'class': 'tok ' + k }, layTok);
      var lab = opts.label || proto, w = Math.max(40, lab.length * 6.6 + 16);
      el('rect', { x: -w / 2, y: -27, width: w, height: 17, rx: 8.5, 'class': 'fond-tok' }, g);
      el('text', { x: 0, y: -14.5, 'text-anchor': 'middle' }, g, lab);
      el('circle', { r: 6.5 }, g);
      var L = longueur(r), duree = Math.max(700, Math.min(2000, L * 2.4)) / ctx.vitesse;
      return new Promise(function (res) {
        var t0 = null;
        function pas(ts) {
          if (ctx.annule) { g.remove(); trace.remove(); return res(); }
          if (t0 == null) t0 = ts;
          var f = Math.min(1, (ts - t0) / duree), e = f < .5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2, q = point(r, e * stop);
          g.setAttribute('transform', 'translate(' + r1(q[0]) + ' ' + r1(q[1]) + ')');
          trace.style.strokeDasharray = L; trace.style.strokeDashoffset = L * (1 - e * stop);
          if (f < 1) return requestAnimationFrame(pas);
          if (opts.echec) {
            g.classList.add('perdu'); el('text', { x: 0, y: 6, 'text-anchor': 'middle', 'class': 'croix' }, g, '✕');
            setTimeout(function () { g.remove(); }, 900 / ctx.vitesse);
          } else g.remove();
          trace.classList.add('fin'); setTimeout(function () { trace.remove(); }, 700);
          res();
        }
        requestAnimationFrame(pas);
      });
    }

    /* ---------- bulles d'observation ---------- */
    var POS_BULLE = { pc: P(30, 250, 190), imp: [P(368, 380, 100)[0] + 80, P(368, 380, 100)[1] + 30], esp: P(250, 330, 170), srv: [SRV0[0] + 60, SRV0[1] - 96], tec: P(520, 40, 200), nadia: null, sw: P(186, 41, 120) };
    function bulle(cible, lignes, type) {
      Array.prototype.forEach.call(layBul.querySelectorAll('[data-b="' + cible + '"]'), function (b) { b.remove(); });
      var pos = cible === 'nadia' ? [nadia.tete[0] + 10, nadia.tete[1] - 10] : POS_BULLE[cible];
      var g = el('g', { 'class': 'bulle ' + (type || ''), 'data-b': cible }, layBul);
      var bg = el('rect', { 'class': 'fond' }, g), tg = el('g', {}, g);
      lignes.forEach(function (l, i) {
        var t = el('text', { x: 0, y: i * 16, 'class': i === 0 ? 'titre' : (/[=:{]|0x/.test(l) ? 'mono' : '') }, tg, l);
      });
      var b = tg.getBBox();
      bg.setAttribute('x', b.x - 10); bg.setAttribute('y', b.y - 7); bg.setAttribute('width', b.width + 20); bg.setAttribute('height', b.height + 14); bg.setAttribute('rx', 10);
      var x = pos[0] - b.width / 2, y = pos[1] - b.height - 10;
      g.setAttribute('transform', 'translate(' + r1(x) + ' ' + r1(y) + ')');
      return g;
    }
    function effacerBulles() { layBul.innerHTML = ''; }

    /* ---------- écrans et états ---------- */
    function ecranPC(lignes, alerte) { pcLignes.forEach(function (t, i) { t.textContent = lignes[i] || ''; t.style.fill = alerte && i === 0 ? 'var(--jaune)' : 'var(--blanc)'; }); }
    function eink(l1, l2) { I.eink.textContent = l1; I.eink2.textContent = l2 || ''; }
    function glpi(lignes, alerte) { glpiLignes.forEach(function (t, i) { t.textContent = lignes[i] || ''; }); glpiTete.style.fill = alerte ? 'var(--rouge)' : 'var(--vert)'; }
    function lcd(t, couleur) { I.lcd.textContent = t; I.lcd.style.fill = couleur || 'var(--vert)'; }

    var marques = [];
    function etat(reel, masque) {
      // remise à zéro
      marques.forEach(function (g) { g.remove(); }); marques = [];
      I.feuilles.innerHTML = '';
      var usb = reel.raccordement === 'usb';
      cables.imp.style.display = usb ? 'none' : ''; cables.impCoupe.style.display = 'none';
      cables.usb.style.display = usb ? '' : 'none'; cables.usbCoupe.style.display = 'none';
      lignesEtiq.imp.t2.textContent = usb ? 'USB, branchée au PC' : 'réseau · 192.168.50.30';
      onde.classList.remove('coupee');
      nadia.combine.style.display = 'none';
      ecranPC(['Bureau de Nadia', 'Courrier.docx (fictif)']);
      glpi(['Aucun nouveau ticket']);
      I.mpu.classList.remove('pulse');
      // ce que l'on voit en vrai
      var on = reel.alimentation;
      if (masque) { lcd('• • •', 'var(--blanc)'); I.voyant.style.fill = 'var(--led-off)'; I.papier.style.display = ''; I.papierVide.style.display = 'none'; }
      else {
        lcd(!on ? '' : reel.toner <= 0 ? 'Toner vide' : 'Prête', reel.toner <= 0 ? 'var(--jaune)' : 'var(--vert)');
        I.voyant.style.fill = !on ? 'var(--led-off)' : reel.toner <= 0 ? 'var(--jaune-fonce)' : 'var(--vert)';
        I.papier.style.display = reel.papier ? '' : 'none'; I.papierVide.style.display = reel.papier ? 'none' : '';
      }
      I.led.style.fill = reel.boitierEnLigne ? 'var(--vert)' : 'var(--led-off)';
      eink(reel.boitierEnLigne ? 'PRÊTE' : 'PRÊTE', reel.boitierEnLigne ? 'màj 9 h 08' : 'liaison perdue ? màj 8 h 58');
      if (!reel.boitierEnLigne) onde.classList.add('coupee');
      if (masque) return;
      if (!usb && !reel.cableEthernet) { cables.imp.style.display = 'none'; cables.impCoupe.style.display = ''; var q = pt(SEG.imp[2]); marques.push(marque(q[0] - 40, q[1] + 26, 'câble réseau débranché')); }
      if (usb && !reel.cableUSB) { cables.usb.style.display = 'none'; cables.usbCoupe.style.display = ''; var u = pt(USB[3]); marques.push(marque(u[0], u[1] + 22, 'câble USB débranché')); }
      if (!on) { var a = P(368, 380, 70); marques.push(marque(a[0] + 46, a[1] + 8, 'éteinte')); }
      if (!reel.reseauAttendu) { var s = P(232, 62, 62); marques.push(marque(s[0] + 40, s[1] + 34, 'branchée dans un autre VLAN')); }
      if (reel.figee) { var f = P(368, 380, 70); marques.push(marque(f[0] + 66, f[1] + 8, 'micrologiciel bloqué')); }
      if (!reel.agentSnmp) { var n = P(368, 380, 70); marques.push(marque(n[0] + 70, n[1] + 8, 'agent SNMP désactivé')); }
      if (!reel.winrm) { var w = P(44, 300, 40); marques.push(marque(w[0] - 10, w[1] + 34, 'WinRM arrêté')); }
      if (!reel.boitierEnLigne) { var e = P(310, 190, 200); marques.push(marque(e[0], e[1], 'Wi-Fi du boîtier perdu')); }
      if (!reel.spouleur) { var sp = P(44, 300, 40); marques.push(marque(sp[0] - 10, sp[1] + 34, 'spouleur arrêté')); }
      if (reel.pilote === 'erreur') { var pl = P(44, 300, 40); marques.push(marque(pl[0] - 10, pl[1] + 34, 'pilote abîmé')); }
    }

    function feuille(i, coincee) {
      var g = el('g', { 'class': 'feuille' + (coincee ? ' coincee' : '') }, I.feuilles), z = 56.5 + i * 0.7;
      el('polygon', { points: pts([[268, 404, z], [316, 404, z], [316, 426, z], [268, 426, z]]), 'class': 'tr', style: 'fill:var(--blanc);stroke-width:.8' }, g);
      return g;
    }
    function attendre(ms, ctx) { return ctx.instant ? Promise.resolve() : new Promise(function (r) { setTimeout(r, ms / ctx.vitesse); }); }
    function vibrer(on) { I.corps.classList.toggle('vibre', !!on); I.mpu.classList.toggle('pulse', !!on); }
    async function imprimer(n, coincee, ctx) {
      if (n === 0 && !coincee) return;
      vibrer(true); await attendre(700, ctx);
      for (var i = 0; i < n; i++) { if (ctx.annule) break; feuille(i); await attendre(420, ctx); }
      if (coincee) { feuille(n, true); await attendre(300, ctx); }
      vibrer(false);
    }
    async function tentative(ctx) { vibrer(true); await attendre(500, ctx); vibrer(false); }
    async function choc(ctx) { for (var i = 0; i < 3; i++) { vibrer(true); await attendre(220, ctx); vibrer(false); await attendre(260, ctx); } }
    function telephone(on) {
      nadia.combine.style.display = on ? '' : 'none';
      Array.prototype.forEach.call(layTrace.querySelectorAll('.appel'), function (x) { x.remove(); });
      if (on) {
        var a = nadia.tete, b = P(515, 132, 70), mid = [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 120];
        el('path', { d: 'M' + a[0] + ' ' + a[1] + 'Q' + mid[0] + ' ' + mid[1] + ' ' + b[0] + ' ' + b[1], 'class': 'appel' }, layTrace);
      }
    }
    function focus(liste) {
      svg.classList.toggle('focus', !!(liste && liste.length));
      Array.prototype.forEach.call(svg.querySelectorAll('.dev, [data-lab]'), function (g) {
        var k = g.getAttribute('data-dev') || g.getAttribute('data-lab');
        var on = liste && (liste.indexOf(k) >= 0 || (k === 'imp' && liste.indexOf('esp') >= 0) || (k === 'nadia' && liste.indexOf('pc') >= 0));
        g.classList.toggle('on', !!on);
      });
    }
    function cerveau(on) { svg.classList.toggle('pense', !!on); }
    function service_on(s) { Array.prototype.forEach.call(svg.querySelectorAll('.service'), function (g) { g.classList.toggle('on', g.getAttribute('data-s') === s); }); }

    /* cadrage : viewBox ajustée au dessin */
    var bb = svg.getBBox();
    var vbLarge = [Math.floor(bb.x) - 14, Math.floor(bb.y) - 90, Math.ceil(bb.width) + 28, Math.ceil(bb.height) + 104].join(' ');
    // cadrage serré (projection) : le matériel et ses étiquettes, sans les coins vides du sol
    var u = null;
    [layDev, layLab].forEach(function (g) { var b2 = g.getBBox(); if (!u) u = { x0: b2.x, y0: b2.y, x1: b2.x + b2.width, y1: b2.y + b2.height }; else { u.x0 = Math.min(u.x0, b2.x); u.y0 = Math.min(u.y0, b2.y); u.x1 = Math.max(u.x1, b2.x + b2.width); u.y1 = Math.max(u.y1, b2.y + b2.height); } });
    var vbSerre = [Math.floor(u.x0) - 10, Math.floor(u.y0) - 120, Math.ceil(u.x1 - u.x0) + 20, Math.ceil(u.y1 - u.y0) + 130].join(' ');
    svg.setAttribute('viewBox', opts && opts.serre ? vbSerre : vbLarge);

    return {
      route: route, jeton: jeton, bulle: bulle, effacerBulles: effacerBulles, etat: etat,
      imprimer: imprimer, tentative: tentative, choc: choc, vibrer: vibrer, telephone: telephone,
      ecranPC: ecranPC, eink: eink, glpi: glpi, lcd: lcd, focus: focus, cerveau: cerveau, service: service_on, attendre: attendre
    };
  };
})(window);
