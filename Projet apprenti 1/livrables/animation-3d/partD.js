
/* =====================================================================
   6. Projet de Wassim : imprimante, boîtier, capteurs, réseau
   Unité : 1 = 1 cm. Le dessus du bureau est à y = 0.
   ===================================================================== */
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const W = (obj, v) => { obj.updateWorldMatrix(true, false); return obj.localToWorld(v.clone()); };
function cable(points, mat, r = 0.3, seg = 140) {
  const c = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
  const t = new THREE.Mesh(new THREE.TubeGeometry(c, seg, r, 10, false), mat); t.castShadow = true; t.receiveShadow = true; scene.add(t);
  return c;
}
function reverseCurve(c) { return new THREE.CatmullRomCurve3(c.points.slice().reverse(), false, 'catmullrom', 0.5); }
const FONT = '"Atkinson Hyperlegible", Arial, sans-serif', MONO = '"IBM Plex Mono", Consolas, monospace';
const glowBasic = (hex, k = 3) => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), toneMapped: false });

/* ---------------------------------------------------------------------
   6.1 Imprimante laser réseau (sans marque)
   Origine = centre du dessous. Face avant vers +z.
   --------------------------------------------------------------------- */
const PRD = { w: 52, d: 44, h: 27 };
const prnPanelTex = canvasTex(512, 200, () => {});
function drawPrnLCD(text, sub = '', col = '#bfe9ff') {
  prnPanelTex.redraw((g, w, h) => {
    g.fillStyle = '#0c1a24'; g.fillRect(0, 0, w, h);
    g.fillStyle = col; g.font = `bold 58px ${FONT}`; g.fillText(text, 24, 92);
    g.fillStyle = '#7fa6bb'; g.font = `32px ${FONT}`; g.fillText(sub, 24, 150);
  });
}
const prnFrontTex = canvasTex(1040, 540, (g, w, h) => {
  g.fillStyle = '#dcdddf'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#c4c6c9'; g.fillRect(40, 300, w - 80, 200);                 // bac papier
  g.fillStyle = '#a9acb0'; g.fillRect(40, 296, w - 80, 6);
  g.fillStyle = '#8d9196'; rr(g, w / 2 - 110, 360, 220, 34, 14); g.fill();      // poignée
  g.fillStyle = '#b9bcc0'; g.fillRect(40, 270, w - 80, 4);
  g.fillStyle = '#5b6168'; g.font = `bold 34px ${FONT}`; g.fillText('LASER  RÉSEAU', 60, 80);
  g.font = `24px ${FONT}`; g.fillStyle = '#7b8188'; g.fillText('imprimante de test du lycée', 60, 118);
  g.fillStyle = '#b5b8bc'; for (let i = 0; i < 9; i++) g.fillRect(60 + i * 16, 180, 8, 60);   // aération
  g.fillStyle = '#5b6168'; g.font = `22px ${FONT}`; g.fillText('BAC 2', 60, 330);
  g.fillStyle = '#6b7178'; g.fillRect(w - 260, 470, 200, 10);                                   // jauge papier
  g.fillStyle = '#3c8d5a'; g.fillRect(w - 260, 470, 130, 10);
});
const prn = new THREE.Group(); prn.position.set(-60, 0, -28); scene.add(prn);
const prnBody = new THREE.Group(); prn.add(prnBody);
const prnMat = std(0xc9cbce, 0.6, 0.02), prnDark = std(0x3a3e44, 0.5, 0.1), prnMid = std(0xb8bbbf, 0.5, 0.05);
mesh(RB(PRD.w, PRD.h, PRD.d, 1.2), prnMat, 0, PRD.h / 2, 0, prnBody);
front(PRD.w - 0.4, PRD.h - 0.6, std(0xe6e6e6, 0.6, 0.02, { map: prnFrontTex.tex }), 0, PRD.h / 2, PRD.d / 2 + 0.04, prnBody);
for (const [x, z] of [[-22, -18], [22, -18], [-22, 18], [22, 18]]) mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.6, 14), M.rubber, x, 0.3, z, prnBody);
/* dessus : réceptacle de sortie à gauche, bloc plat à droite (le boîtier y est fixé) */
const OUT = { x0: -26, x1: 0, z0: -22, z1: 12 };               // réceptacle (coordonnées locales)
mesh(BOX(26, 1.2, 34), prnDark, -13, PRD.h + 0.2, -5, prnBody);  // fond du réceptacle
mesh(RB(26, 6, 8, 0.8), prnMat, -13, PRD.h + 3, -18, prnBody);   // barre arrière avec la fente de sortie
mesh(BOX(22, 0.5, 0.25), std(0x0a0b0c, 0.8), -13, PRD.h + 1.9, -13.95, prnBody, false); // fente
mesh(RB(26, 4.5, 44, 0.8), prnMat, 13, PRD.h + 2.25, 0, prnBody); // bloc droit
mesh(RB(1.4, 3.5, 34, 0.5), prnMat, -25.3, PRD.h + 1.75, -5, prnBody); // rebord gauche
/* panneau de commande (avant droit), incliné */
const panel = new THREE.Group(); panel.position.set(13, PRD.h + 4.5, 19); panel.rotation.x = -0.5; prnBody.add(panel);
mesh(RB(22, 1.2, 7, 0.4), prnDark, 0, 0, 0, panel);
const lcd = mesh(new THREE.PlaneGeometry(8.5, 3.3), makeScreenMat(prnPanelTex), -5, 0.62, 0, panel, false); lcd.rotation.x = -Math.PI / 2;
for (let i = 0; i < 4; i++) mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.3, 16), M.plGray, 2 + i * 2, 0.7, 0.8, panel);
const prnLedMat = glowBasic(0x32ff7a, 3); const prnLed = mesh(new THREE.CircleGeometry(0.35, 16), prnLedMat, 9.5, 0.64, -1.8, panel, false); prnLed.rotation.x = -Math.PI / 2;
/* prise réseau à l'arrière */
mesh(BOX(1.6, 1.3, 0.6), std(0x111214, 0.6), 20, 6, -PRD.d / 2 - 0.2, prnBody);
drawPrnLCD('Prête', 'cardio-2 · 10.0.20.31');

/* feuilles A4 qui sortent */
const sheetGeo = BOX(21, 0.06, 29.7); sheetGeo.translate(0, 0, 29.7 / 2);   // origine = bord arrière de la feuille
const sheetMat = std(0xf4f4f0, 0.8, 0);
const sheets = [];
/* SHEET_IN : la feuille sort de la fente (face avant de la barre, z = -14).
   SHEET_OUT : bord arrière de la feuille posée au fond du réceptacle (dessus du fond à PRD.h + 0,8). */
const SHEET_IN = V(-13, PRD.h + 1.9, -14.0), SHEET_OUT = V(-13, PRD.h + 0.84, -13.7);
function sheetWorld(local) { return W(prn, local); }

/* ---------------------------------------------------------------------
   6.2 Modules du commerce
   --------------------------------------------------------------------- */
function silk(w, h, draw) { return new THREE.MeshStandardMaterial({ map: canvasTex(w, h, draw).tex, transparent: true, roughness: 0.55 }); }
function header(n, pitch, parent, x0, y, z, axis = 'x') {
  const g = new THREE.Group(); parent.add(g);
  const L = n * pitch;
  mesh(BOX(axis === 'x' ? L : 0.25, 0.25, axis === 'x' ? 0.25 : L), M.plBlack, x0, y, z, g);
  for (let i = 0; i < n; i++) {
    const o = -L / 2 + pitch / 2 + i * pitch;
    mesh(pinGeo, M.gold, axis === 'x' ? x0 + o : x0, y + 0.2, axis === 'x' ? z : z + o, g, false);
  }
  return g;
}
function holes(parent, w, d, r = 0.15, inset = 0.25, y = 0.081) {
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const h = mesh(new THREE.CircleGeometry(r, 16), std(0xd8aa4c, 0.3, 1), sx * (w / 2 - inset), y, sz * (d / 2 - inset), parent, false);
    h.rotation.x = -Math.PI / 2;
  }
}
/** GY-521 (MPU6050) : carte bleue 2,1 × 1,6 cm, connecteur 8 broches. */
function makeGY521() {
  const g = new THREE.Group();
  mesh(BOX(2.1, 0.16, 1.6), M.pcbBlue, 0, 0, 0, g);
  flat(2.1, 1.6, silk(420, 320, (c, w, h) => {
    c.fillStyle = '#fff'; c.font = 'bold 34px Arial'; c.fillText('GY-521', 110, 120);
    c.font = '21px Arial'; ['VCC', 'GND', 'SCL', 'SDA', 'XDA', 'XCL', 'AD0', 'INT'].forEach((t, i) => { c.save(); c.translate(32 + i * 50, 300); c.rotate(-Math.PI / 2); c.fillText(t, 0, 0); c.restore(); });
    c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.moveTo(300, 70); c.lineTo(380, 70); c.moveTo(380, 70); c.lineTo(365, 58); c.moveTo(380, 70); c.lineTo(365, 82); c.stroke();
    c.fillText('X', 388, 78); c.beginPath(); c.moveTo(300, 70); c.lineTo(300, 150); c.stroke(); c.fillText('Y', 292, 176);
  }), 0, 0.082, 0, g);
  mesh(BOX(0.42, 0.09, 0.42), M.chip, 0.1, 0.125, -0.05, g);
  mesh(BOX(0.3, 0.08, 0.15), M.chip, -0.6, 0.12, -0.35, g);
  holes(g, 2.1, 1.6, 0.13, 0.22);
  header(8, 0.254, g, 0, 0.205, 0.67);
  return g;
}
/** Module SHT31 violet (GY-SHT31-D) : 1,4 × 1,1 cm, 4 broches. */
function makeSHT31() {
  const g = new THREE.Group();
  mesh(BOX(1.45, 0.16, 1.15), std(0x5b2a86, 0.45, 0.1), 0, 0, 0, g);
  flat(1.45, 1.15, silk(290, 230, (c, w, h) => {
    c.fillStyle = '#fff'; c.font = 'bold 30px Arial'; c.fillText('SHT31', 70, 70);
    c.font = '19px Arial'; ['VIN', 'GND', 'SCL', 'SDA'].forEach((t, i) => c.fillText(t, 22 + i * 64, 215));
  }), 0, 0.082, 0, g);
  mesh(BOX(0.26, 0.08, 0.26), std(0xb8bdc4, 0.3, 0.6), 0.25, 0.12, -0.1, g);       // capteur DFN
  mesh(BOX(0.1, 0.02, 0.1), std(0x202326, 0.6), 0.25, 0.165, -0.1, g, false);       // ouverture
  holes(g, 1.45, 1.15, 0.11, 0.18);
  header(4, 0.254, g, 0, 0.205, 0.45);
  return g;
}
/** Capteur infrarouge FC-51 (LM393) : 3,1 × 1,45 cm, LED émettrice et réceptrice à l'avant (+x). */
function makeFC51() {
  const g = new THREE.Group();
  mesh(BOX(3.1, 0.16, 1.45), M.pcbBlue, 0, 0, 0, g);
  flat(3.1, 1.45, silk(620, 290, (c, w, h) => {
    c.fillStyle = '#fff'; c.font = 'bold 26px Arial'; c.fillText('FC-51', 160, 60);
    c.font = '22px Arial'; ['OUT', 'GND', 'VCC'].forEach((t, i) => { c.save(); c.translate(36, 90 + i * 60); c.fillText(t, 0, 0); c.restore(); });
    c.fillText('PWR', 260, 250); c.fillText('OBS', 370, 250);
  }), 0, 0.082, 0, g);
  mesh(BOX(0.5, 0.12, 0.4), M.chip, 0.0, 0.14, 0.15, g);                          // LM393
  const pot = mesh(BOX(0.65, 0.45, 0.65), std(0x2a62c9, 0.4), -0.55, 0.3, -0.25, g);
  mesh(BOX(0.4, 0.06, 0.08), std(0xdddddd, 0.3, 0.8), -0.55, 0.54, -0.25, g, false);
  const ledClear = new THREE.MeshPhysicalMaterial({ color: 0xe8f4ff, roughness: 0.05, transmission: 0.6, transparent: true, opacity: 0.85 });
  for (const [z, mat] of [[-0.32, ledClear], [0.32, std(0x0b0b0d, 0.25)]]) {
    const l = mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.6, 20), mat, 1.75, 0.1, z, g); l.rotation.z = Math.PI / 2;
    const tip = mesh(new THREE.SphereGeometry(0.25, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat, 2.05, 0.1, z, g); tip.rotation.z = -Math.PI / 2;
  }
  const obs = mesh(BOX(0.16, 0.06, 0.1), glowBasic(0x22ff55, 0.1), 0.5, 0.11, 0.55, g, false);
  mesh(BOX(0.16, 0.06, 0.1), glowBasic(0xff2a1a, 3), 0.1, 0.11, 0.55, g, false);
  header(3, 0.254, g, -1.4, 0.205, 0, 'z');
  g.userData.obs = obs;
  return g;
}
/** Écran e-paper 2,9″ (module noir 8,9 × 3,8 cm). Écran vers +y. */
const einkTex = canvasTex(592, 256, () => {});
function drawEink(l1, l2 = '', inv = false) {
  einkTex.redraw((g, w, h) => {
    g.fillStyle = inv ? '#111' : '#eceae4'; g.fillRect(0, 0, w, h);
    g.fillStyle = inv ? '#eceae4' : '#151515';
    g.font = `bold 76px ${FONT}`; g.fillText(l1, 26, 110);
    g.font = `40px ${FONT}`; g.fillText(l2, 28, 190);
    g.fillRect(26, 214, w - 52, 4);
    g.font = `24px ${MONO}`; g.fillText('cardio-2', 28, 246);
  });
}
function makeEink() {
  const g = new THREE.Group();
  mesh(BOX(8.9, 0.16, 3.8), M.pcbBlack, 0, 0, 0, g);
  mesh(BOX(7.9, 0.12, 3.3), std(0xf5f5f2, 0.3), -0.2, 0.14, 0, g);
  const scr = flat(6.7, 2.9, new THREE.MeshStandardMaterial({ map: einkTex.tex, roughness: 0.9 }), -0.2, 0.205, 0, g);
  mesh(BOX(1.0, 0.04, 2.2), std(0xc58b2b, 0.4, 0.3), 3.9, 0.1, 0, g);               // nappe
  header(8, 0.254, g, 4.25, -0.2, 0, 'z');
  holes(g, 8.9, 3.8, 0.15, 0.3);
  return g;
}
/** Bouton d'arcade 60 mm, rouge. Dôme vers +y. */
function makeArcade() {
  const g = new THREE.Group();
  mesh(new THREE.CylinderGeometry(3.0, 3.0, 0.5, 40), std(0xc81e1e, 0.35), 0, 0.25, 0, g);
  const domeMat = new THREE.MeshPhysicalMaterial({ color: 0xe02020, roughness: 0.25, clearcoat: 1, emissive: 0xff1010, emissiveIntensity: 0.05 });
  const dome = new THREE.Group(); dome.position.y = 0.5; g.add(dome);
  mesh(new THREE.CylinderGeometry(2.35, 2.35, 0.6, 40), domeMat, 0, 0.3, 0, dome);
  /* calotte bombée : rayon 4,9 cm, base de 2,35 cm de rayon, 6 mm de haut (avant : petite calotte creuse et décollée) */
  const cap = mesh(new THREE.SphereGeometry(4.9, 48, 12, 0, Math.PI * 2, 0, Math.asin(2.35 / 4.9)), domeMat, 0, 1.2 - 4.9, 0, dome);
  mesh(new THREE.CylinderGeometry(2.6, 2.6, 2.4, 6), std(0x1b1b1b, 0.6), 0, -1.4, 0, g);   // écrou
  mesh(BOX(2.0, 1.4, 1.2), std(0xf2f2f2, 0.5), 0, -3.2, 0, g);                             // micro-rupteur
  g.userData = { dome, domeMat };
  return g;
}
/** LED RGB 5 mm diffusante. */
function makeRGB() {
  const g = new THREE.Group();
  const mat = new THREE.MeshPhysicalMaterial({ color: 0xf2f2f2, roughness: 0.4, transparent: true, opacity: 0.9, emissive: 0x000000, emissiveIntensity: 1 });
  for (let i = 0; i < 4; i++) mesh(new THREE.CylinderGeometry(0.025, 0.025, i === 1 ? 0.6 : 0.5, 6), M.steel, -0.19 + i * 0.127, 0.25, 0, g, false);
  mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.08, 24), mat, 0, 0.54, 0, g);
  mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.5, 24), mat, 0, 0.8, 0, g);
  mesh(new THREE.SphereGeometry(0.25, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat, 0, 1.05, 0, g);
  const pl = new THREE.PointLight(0xffffff, 0, 25, 2); pl.position.set(0, 2.4, 0.8); g.add(pl);   // hors de la LED, sinon elle s'éclaire elle-même en blanc
  g.userData = { mat, pl };
  return g;
}
function setRGB(hex) {
  const u = rgb.userData;
  if (hex === null) { u.mat.emissive.set(0x000000); u.pl.intensity = 0; return; }
  u.mat.emissive.set(hex).multiplyScalar(1.8); u.pl.color.set(hex); u.pl.intensity = 0.35;   // une LED 5 mm éclaire peu : sinon la plaque blanche voisine éblouit
}

/* ---------------------------------------------------------------------
   6.3 Le boîtier : plexiglas fixé sur le bloc droit de l'imprimante
   --------------------------------------------------------------------- */
const BX = { w: 18, h: 7, d: 22 };
const box = new THREE.Group(); box.position.set(13, PRD.h + 4.5 + 0.25, -6); prn.add(box);   // dessus du bloc droit + 2,5 mm d'adhésif
mesh(RB(BX.w, 0.4, BX.d, 0.3), std(0x1a1c1f, 0.6), 0, 0.2, 0, box);                 // fond
const acryl = new THREE.MeshPhysicalMaterial({ color: 0xb9d4e2, roughness: 0.18, transparent: true, opacity: 0.16, clearcoat: 0.25, clearcoatRoughness: 0.2, envMapIntensity: 0.6, depthWrite: false, side: THREE.DoubleSide });  // moins miroir : évite l'éblouissement en gros plan
mesh(BOX(BX.w, BX.h, 0.3), acryl, 0, BX.h / 2, BX.d / 2, box, false);
mesh(BOX(BX.w, BX.h, 0.3), acryl, 0, BX.h / 2, -BX.d / 2, box, false);
mesh(BOX(0.3, BX.h, BX.d), acryl, BX.w / 2, BX.h / 2, 0, box, false);
mesh(BOX(0.3, BX.h, BX.d), acryl, -BX.w / 2, BX.h / 2, 0, box, false);
mesh(BOX(BX.w + 0.4, 0.3, BX.d + 0.4), acryl, 0, BX.h + 0.15, 0, box, false);       // couvercle
for (let i = 0; i < 6; i++) mesh(new THREE.CircleGeometry(0.35, 14), std(0x0d0f12, 0.9), 5 + (i % 3) * 1.2, 3.5 + Math.floor(i / 3) * 1.2, -BX.d / 2 - 0.16, box, false).rotation.y = Math.PI; // aérations (SHT31)
for (const [x, z] of [[-8.5, -10.5], [8.5, -10.5], [-8.5, 10.5], [8.5, 10.5]]) mesh(new THREE.CylinderGeometry(0.3, 0.3, BX.h, 10), M.steel, x, BX.h / 2, z, box);
/* adhésif double face épais (fixation rigide, utile pour l'accéléromètre) */
mesh(BOX(BX.w - 1, 0.25, BX.d - 1), std(0xe9e3c9, 0.9), 0, -0.125, 0, box, false);

const bb = makeBreadboard(8.2, 5.5); bb.position.set(1.5, 0.4 + 0.85, 1); box.add(bb);
const esp = makeESP32(); esp.position.set(1.5, 0.4 + 0.85 + 0.75, 1); box.add(esp);
const mpu = makeGY521(); mpu.position.set(-6, 1.3, -6); box.add(mpu);                // vissé sur le fond (entretoises)
for (const [x, z] of [[-0.83, -0.58], [0.83, -0.58], [-0.83, 0.58], [0.83, 0.58]]) mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.9, 8), M.gold, -6 + x, 0.85, -6 + z, box);
const sht = makeSHT31(); sht.position.set(5.6, 1.3, -9.3); box.add(sht);            // près des aérations
for (const [x, z] of [[-0.55, -0.4], [0.55, -0.4], [-0.55, 0.4], [0.55, 0.4]]) mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.9, 8), M.nylon, 5.6 + x, 0.85, -9.3 + z, box);
const rgb = makeRGB(); rgb.position.set(-2.0, 1.25, -1.3); box.add(rgb);
for (const x of [-0.7, 0.3, 1.3]) { const r = makeResistor([0xc0392b, 0xc0392b, 0x6b3a1e, 0xd4af37]); r.scale.setScalar(0.8); r.position.set(x, 1.25, -1.5); box.add(r); }
/* écran e-paper sur la face avant, incliné vers l'utilisateur */
const eink = makeEink(); eink.position.set(-3.5, 3.8, BX.d / 2 + 0.35); eink.rotation.x = Math.PI / 2; box.add(eink);
/* bouton d'arcade sur le couvercle */
const btn = makeArcade(); btn.position.set(4.5, BX.h + 0.3, 4.5); box.add(btn);
/* lecteur RFID (V2) sous le couvercle, à l'avant gauche */
/* il pend sous le couvercle, tenu par ses 4 entretoises de 12 mm vissées dans le plexiglas (antenne à 1,5 cm de la carte posée dessus) */
const rc = makeRC522(true); rc.rotation.y = Math.PI / 2; rc.position.set(-5.2, BX.h - 1.28, 5.5); box.add(rc);

/* capteur infrarouge au-dessus de la sortie du papier, sur une équerre */
const brk = new THREE.Group(); brk.position.set(-13, PRD.h + 7.4, -13.2); prn.add(brk);
mesh(BOX(4.2, 0.25, 3.2), M.alu, 0, 0, 0.6, brk);
mesh(BOX(4.2, 4.0, 0.25), M.alu, 0, -1.9, -1.0, brk);                 // collée sur la face avant de la barre
for (const x of [-1.4, 1.4]) mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.12, 12), M.steel, x, -2.9, -0.86, brk).rotation.x = Math.PI / 2;  // vis
const ir = makeFC51(); ir.rotation.z = -Math.PI / 2; ir.position.set(0, -1.7, 1.2); brk.add(ir);  // carte sous l'équerre, LED vers le bas
/* bloc USB 5 V + multiprise sur le bureau */
const strip = new THREE.Group(); strip.position.set(-22, 0, -60); scene.add(strip);
mesh(RB(30, 3.6, 5.5, 0.6), M.plWhite, 0, 1.8, 0, strip);
for (let i = 0; i < 4; i++) mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.2, 24), std(0xb9b9b9, 0.5), -10 + i * 6.5, 3.62, 0, strip);
mesh(BOX(2, 0.6, 1), glowBasic(0xff5a2a, 2), 12.5, 3.62, 0, strip, false);
mesh(RB(4.5, 3.6, 4.5, 0.5), M.plWhite, -10, 5.4, 0, strip);   // chargeur USB 5 V

scene.updateMatrixWorld(true);

/* ---------------------------------------------------------------------
   6.4 Câblage dans le boîtier (fils dupont)
   --------------------------------------------------------------------- */
const ESPA = { D14: 10, D12: 11, D13: 12, D25: 7, D26: 8, D27: 9, GND: 13 };
const ESPB = { D23: 0, D22: 1, D21: 4, D19: 5, D18: 6, D5: 7, D4: 10, D2: 11, D15: 12, GND: 13, V33: 14 };
const pA = (k, o = 0.55) => W(esp, espHole('A', ESPA[k], o));
const pB = (k, o = 0.55) => W(esp, espHole('B', ESPB[k], o));
const gyPin = i => W(mpu, V(-0.889 + i * 0.254, 0.42, 0.67));
const shPin = i => W(sht, V(-0.381 + i * 0.254, 0.42, 0.45));
const irPin = i => W(ir, V(-1.4, 0.42, -0.254 + i * 0.254));
const ekPin = i => W(eink, V(4.25, -0.4, -0.889 + i * 0.254));
const rcP = k => W(rc, rcPin(RC[k]));
const btnP = W(btn, V(0.5, -3.9, 0));
const rgbP = i => W(rgb, V(-0.19 + i * 0.127, 0, 0));
const wires = {};
/* I²C partagé : MPU6050 et SHT31 sur D21 (SDA) et D22 (SCL) */
wires.mpuSCL = wire(gyPin(2), pB('D22'), 0xf4d03f, 1.6);
wires.mpuSDA = wire(gyPin(3), pB('D21'), 0x3498db, 1.8);
wire(gyPin(0), pB('V33', 0.8), 0xe74c3c, 1.4); wire(gyPin(1), pB('GND', 0.8), 0x222222, 1.3);
wires.shtSCL = wire(shPin(2), pB('D22', 0.8), 0xf4d03f, 2.0);
wires.shtSDA = wire(shPin(3), pB('D21', 0.8), 0x3498db, 2.2);
wire(shPin(0), pB('V33', 1.05), 0xe74c3c, 1.8); wire(shPin(1), pB('GND', 1.05), 0x222222, 1.7);
/* capteur infrarouge (long fil à travers une encoche du boîtier) : sortie sur D27 */
{
  const a = irPin(0), b = pA('D27');
  const ent = W(box, V(-BX.w / 2, 2.2, -4));
  const pts = [a, a.clone().add(V(0, 2.5, 0)), V(a.x + 4, a.y + 3, a.z + 1), ent.clone().add(V(-3, 1.5, 0)), ent, b.clone().add(V(-1.5, 1, 0)), b];
  wires.ir = new THREE.CatmullRomCurve3(pts);
  for (const [col, dz] of [[0x2ecc71, 0], [0x222222, 0.14], [0xe74c3c, 0.28]]) {
    const c = new THREE.CatmullRomCurve3(pts.map(p => p.clone().add(V(0, 0, dz))));
    const t = new THREE.Mesh(new THREE.TubeGeometry(c, 80, 0.045, 8), wireMat(col)); t.castShadow = true; scene.add(t);
  }
}
/* bouton : D26 */
wires.btn = wire(btnP, pA('D26'), 0xff8c1a, 1.2);
/* LED RGB : D25 (R), D14 (V), D12 (B) */
wires.rgb = wire(rgbP(0), pA('D25'), 0xe74c3c, 0.8); wire(rgbP(2), pA('D14'), 0x2ecc71, 0.9); wire(rgbP(3), pA('D12'), 0x3498db, 1.0);
/* écran e-paper (SPI) : SCK D18, MOSI D23, CS D5, DC D4 */
wires.eSCK = wire(ekPin(0), pB('D18'), 0xf4d03f, 1.5);
wires.eMOSI = wire(ekPin(1), pB('D23'), 0x2ecc71, 1.7);
wire(ekPin(2), pB('D5'), 0xff8c1a, 1.9); wire(ekPin(3), pB('D4'), 0x9b59b6, 2.1);
/* RC522 (SPI, V2) : même bus, CS D15, MISO D19 */
wires.rSCK = wire(rcP('SCK'), pB('D18', 0.8), 0xf4d03f, 0.2);
wires.rMISO = wire(rcP('MISO'), pB('D19'), 0x3498db, 0.25);
wire(rcP('SDA'), pB('D15'), 0xff8c1a, 0.3); wire(rcP('GND'), pB('GND', 1.3), 0x222222, 0.2); wire(rcP('V33'), pB('V33', 1.3), 0xe74c3c, 0.25);
/* câble USB : ESP32 → chargeur 5 V */
{ const a = W(esp, V(-2.75, 0.22, 0)); const sl = W(box, V(-BX.w / 2 - 0.3, 1.0, 2));
  const top = PRD.h + 4.5 + 0.2;   // dessus du bloc droit + rayon du câble
  cable([a, a.clone().add(V(-1.2, 0, 0)), sl, W(prn, V(2.2, top + 0.3, -3)), W(prn, V(1.8, top, -10)), W(prn, V(1.8, top, -20.5)),
         W(prn, V(1.8, top - 1, -22.6)), W(prn, V(2.2, PRD.h - 4, -22.4)), W(prn, V(3, 2, -22.6)), W(prn, V(5, 0.25, -27)),
         V(-40, 0.25, -56), V(-33.5, 1.5, -57.2), W(strip, V(-10, 4, 2.3))], M.cableBlack, 0.18); }

/* ---------------------------------------------------------------------
   6.5 Réseau, serveur, postes
   --------------------------------------------------------------------- */
const sw = makeSwitch(); sw.position.set(24, 0, -60); scene.add(sw);
const ap = makeAP(); ap.position.set(-2, 0, -58); ap.rotation.y = 0.1; scene.add(ap);
const server = makeServer(); server.position.set(92, 0, -42); scene.add(server);
const lap = makeLaptop({ body: 0x9aa1a9 }); lap.g.position.set(-14, 0, 22); lap.g.rotation.y = 0.35; scene.add(lap.g);
const mon = makeMonitor(); mon.g.position.set(54, 0, 6); mon.g.rotation.y = -0.18; scene.add(mon.g);
const sff = makeSFF(); sff.position.set(94, 0, 4); sff.rotation.y = -0.18; scene.add(sff);
mesh(RB(42, 1.6, 14, 0.5), std(0x1b1d20, 0.6), 54, 0.8, 30, scene).rotation.y = -0.18;   // clavier
/* badge du technicien (V2) */
const badgeTex = canvasTex(512, 324, (g, w, h) => {
  g.fillStyle = '#f6f7f9'; g.fillRect(0, 0, w, h); g.fillStyle = '#1d5a86'; g.fillRect(0, 0, w, 70);
  g.fillStyle = '#fff'; g.font = 'bold 34px Arial'; g.fillText('SERVICE INFORMATIQUE', 24, 48);
  g.fillStyle = '#c9d3da'; g.fillRect(28, 100, 130, 160);
  g.fillStyle = '#13222c'; g.font = 'bold 44px Arial'; g.fillText('Technicien', 180, 160);
  g.font = '24px Arial'; g.fillStyle = '#56656f'; g.fillText('carte RFID 13,56 MHz', 180, 205);
});
const badge = mesh(RB(8.56, 0.08, 5.4, 0.3, 2), std(0xc8c8c8, 0.45, 0, { map: badgeTex.tex }), 84, 0.04, 34);
badge.rotation.y = -0.3;
const BADGE_HOME = badge.position.clone(), BADGE_ROT = badge.rotation.clone();
scene.updateMatrixWorld(true);

const P_SRV = 0, P_PRN = 2, P_AP = 4, P_LAP = 6, P_TEC = 8;
const swP = i => W(sw, swPortLocal(i));
const out = (p, dz = 2.5) => p.clone().add(V(0, 0, dz));
function plug(p) { mesh(BOX(1.3, 1.1, 1.8), new THREE.MeshPhysicalMaterial({ color: 0xdfe8ee, transparent: true, opacity: 0.6, roughness: 0.1 }), p.x, p.y, p.z + 0.9); }
const cSrv = cable([swP(P_SRV), out(swP(P_SRV)), V(16, 0.3, -38), V(50, 0.3, -36), V(78, 0.3, -36), V(81.5, 4, -40), W(server, V(-10.1, 8, 2))], M.cableBlue);
const cPrn = cable([swP(P_PRN), out(swP(P_PRN)), V(16, 0.3, -42), V(-6, 0.3, -48), V(-22, 0.3, -54), V(-38, 0.3, -55), V(-40, 2, -52.5), W(prn, V(20, 6, -PRD.d / 2 - 0.5))], M.cableYellow);
const cAP = cable([swP(P_AP), out(swP(P_AP), 3), V(14, 0.3, -44), V(4, 0.3, -48), W(ap, V(0, 1.6, -7.2))], M.cableGray);
const cLap = cable([swP(P_LAP), out(swP(P_LAP), 3), V(26, 0.3, -36), V(10, 0.3, -10), V(-4, 0.3, 4), W(lap.g, V(0, 1, -11.2))], M.cableBlue);
const cTec = cable([swP(P_TEC), out(swP(P_TEC), 3), V(40, 0.3, -38), V(76, 0.3, -24), V(88, 0.3, -14), W(sff, V(0, 10, -14.2))], M.cableYellow);
for (const i of [P_SRV, P_PRN, P_AP, P_LAP, P_TEC]) { plug(swP(i)); portLEDs[i].used = true; }

/* =====================================================================
   7. Chemins des messages
   ===================================================================== */
const paths = {};
function addPath(name, curve, o = {}) { paths[name] = { curve, len: curve.getLength(), size: 1.1, speed: 75, ...o }; }
function arc(a, b, h) { const m = a.clone().lerp(b, 0.5); m.y += h; return new THREE.QuadraticBezierCurve3(a, m, b); }
const pESP = W(esp, V(2.2, 0.5, 0)), pAP = W(ap, V(0, 4, 0));
addPath('boxToAP', arc(pESP, pAP, 28), { speed: 110, wifi: true, size: 0.9 });
addPath('apToSw', reverseCurve(cAP), { port: P_AP });
addPath('srvLink', cSrv, { port: P_SRV, srv: true });
addPath('prnLink', cPrn, { port: P_PRN });
addPath('lapLink', cLap, { port: P_LAP });
addPath('tecLink', cTec, { port: P_TEC });
for (const k in wires) addPath('w_' + k, wires[k], { speed: k === 'ir' ? 22 : 9, size: 0.14 });
const UP = ['boxToAP', 'apToSw', 'srvLink'], DOWN = ['-srvLink', '-apToSw', '-boxToAP'];
const TO_PRN = ['-srvLink', 'prnLink'], FROM_PRN = ['-prnLink', 'srvLink'];
const TO_LAP = ['-srvLink', 'lapLink'], FROM_LAP = ['-lapLink', 'srvLink'];
const TO_TEC = ['-srvLink', 'tecLink'], FROM_TEC = ['-tecLink', 'srvLink'];

/* couleurs des messages */
Object.assign(COL, { sens: 0xc18cff, mqtt: 0xffb020, snmp: 0x3ddc84, ipp: 0x4aa8ff, jea: 0xb07cff, glpi: 0x9fd0ff, err: 0xff5a4d });
Object.assign(CSS, { sens: '#c18cff', mqtt: '#ffb020', snmp: '#3ddc84', ipp: '#4aa8ff', jea: '#b07cff', glpi: '#9fd0ff', err: '#ff5a4d' });

/* =====================================================================
   8. Étiquettes 3D
   ===================================================================== */
const labelGroups = { overview: [], boitier: [] };
function label(group, pos, title, sub, cls = '') {
  const d = document.createElement('div'); d.className = 'lab ' + cls;
  d.innerHTML = `<b>${title}</b>${sub ? `<span>${sub}</span>` : ''}`;
  const o = new CSS2DObject(d); o.position.copy(pos); scene.add(o); labelGroups[group].push(o); return o;
}
label('overview', W(prn, V(-14, 13, PRD.d / 2 + 1)), 'Imprimante réseau', 'SNMP 161 · IPP 631 · RAW 9100');
label('overview', W(box, V(0, 12, 0)), 'Boîtier ESP32', 'vibration · feuilles · humidité · bouton · écran');
label('overview', V(-2, 24, -58), 'Point d\'accès Wi-Fi', 'réseau en place');
label('overview', V(24, 9, -62), 'Switch du lycée', 'réseau en place');
label('overview', V(92, 50, -42), 'Serveur Ubuntu', 'Mosquitto · Python · CUPS · PostgreSQL · GLPI · Grafana');
label('overview', W(lap.g, V(0, 27, -14)), 'PC de la secrétaire', 'Windows 11 · point d\'accès JEA');
label('overview', V(54, 50, 6), 'Poste du technicien', 'GLPI et tableau de bord');
label('overview', V(-22, 10, -60), 'Bloc USB 5 V', 'aucun câblage 230 V', 'small');
label('boitier', W(esp, V(0.9, 0.7, 0)), 'ESP32 DevKit', 'Wi-Fi · MQTT/TLS · heure NTP', 'small');
label('boitier', W(mpu, V(0, 0.5, 0)), 'MPU6050 (GY-521)', 'vibration · I²C 0x68', 'small');
label('boitier', W(sht, V(0, 0.5, 0)), 'SHT31 (V2)', 'température, humidité · I²C 0x44', 'small');
label('boitier', W(ir, V(2, 0.2, 0)), 'FC-51 infrarouge', 'compte les feuilles · GPIO 27', 'small');
label('boitier', W(eink, V(-2.5, 0.4, 2.6)), 'Écran e-paper 2,9″', 'SPI · garde l\'image sans courant', 'small');
label('boitier', W(btn, V(0, 1.6, 0)), 'Bouton d\'arcade', '« ça ne marche pas » · GPIO 26', 'small');
label('boitier', W(rgb, V(0, 1.4, 0)), 'LED RGB', 'état du boîtier', 'small');
label('boitier', W(rc, V(0, 0.4, 0)), 'Lecteur RC522 (V2)', 'carte du technicien · SPI', 'small');
function mkRead(pos, col) { const d = document.createElement('div'); d.className = 'read'; d.style.borderLeftColor = col; const o = new CSS2DObject(d); o.position.copy(pos); o.visible = false; scene.add(o); return o; }
const readVib = mkRead(W(mpu, V(0, 2.6, -1)), '#c18cff');
const readHum = mkRead(W(sht, V(0, 3.2, -1)), '#c18cff');
const readCnt = mkRead(W(ir, V(2.5, 2.5, 0)), '#c18cff');
const readSrv = mkRead(V(92, 62, -42), '#ffb020');

let showLabels = true, labelMode = 'overview';
function refreshLabels() {
  for (const g in labelGroups) for (const o of labelGroups[g]) o.visible = showLabels && g === labelMode;
  /* le rendu des étiquettes impose display selon .visible : on agit donc sur .visible, pas sur le style */
  for (const r of [readVib, readHum, readCnt, readSrv]) r.visible = !!r.userData.on && showLabels;
}
function setRead(o, html) { o.element.innerHTML = html; o.userData.on = !!html; o.visible = o.userData.on && showLabels; }
