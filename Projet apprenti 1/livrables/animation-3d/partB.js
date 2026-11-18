<script type="module">
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

/* =====================================================================
   1. Moteur : rendu, caméra, lumières, post-traitement
   Unité : 1 = 1 cm. Le dessus du bureau est à y = 0.
   ===================================================================== */
const $ = s => document.querySelector(s);
/* ?lite : mode léger pour les PC peu puissants (moins de pixels, ombres plus simples) */
const LITE = new URLSearchParams(location.search).has('lite');
const PR = LITE ? 1 : Math.min(devicePixelRatio, 2);
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas: $('#scene'), antialias: !LITE, powerPreference: 'high-performance' });
} catch (e) { $('#err').style.display = 'grid'; throw e; }
renderer.setPixelRatio(PR);
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;

const scene = new THREE.Scene();
const BG = 0x0b1016;
scene.background = new THREE.Color(BG);
scene.fog = new THREE.Fog(BG, 520, 1300);

const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.5, 4000);
camera.position.set(70, 160, 250);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.target.set(0, 5, -12);
controls.maxPolarAngle = Math.PI * 0.495;
controls.minDistance = 6;
controls.maxDistance = 800;
controls.autoRotateSpeed = 0.35;

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

scene.add(new THREE.HemisphereLight(0xbfd4ff, 0x20160e, 0.35));
const key = new THREE.DirectionalLight(0xfff0dc, 1.6);
key.position.set(110, 280, 170);
key.target.position.set(0, 0, -10);
key.castShadow = true;
key.shadow.mapSize.setScalar(LITE ? 1024 : 4096);
Object.assign(key.shadow.camera, { left: -150, right: 150, top: 110, bottom: -110, near: 50, far: 700 });
key.shadow.bias = -0.0004;
key.shadow.normalBias = 0.04;
key.shadow.radius = 3;
scene.add(key, key.target);
const rim = new THREE.DirectionalLight(0x86b8ff, 0.9);
rim.position.set(-220, 140, -220);
scene.add(rim);

const composer = new EffectComposer(renderer);
composer.setPixelRatio(PR);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.8, 0.45, 1.9);
composer.addPass(bloom);
composer.addPass(new OutputPass());

const labelRenderer = new CSS2DRenderer({ element: $('#labels') });
labelRenderer.setSize(innerWidth, innerHeight);

/* =====================================================================
   2. Petits outils : géométries, textures dessinées, matériaux
   ===================================================================== */
function RB(w, h, d, r = 0.3, seg = 3) {
  const rr = Math.max(0.001, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));
  return new RoundedBoxGeometry(w, h, d, seg, rr);
}
const BOX = (w, h, d) => new THREE.BoxGeometry(w, h, d);
function mesh(geo, mat, x = 0, y = 0, z = 0, parent = scene, shadow = true) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = shadow; m.receiveShadow = true;
  parent.add(m);
  return m;
}
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return { tex: t, canvas: c, ctx: g, redraw(fn) { fn(g, w, h); t.needsUpdate = true; } };
}
/* plan posé à plat (face vers le haut) */
function flat(w, d, mat, x, y, z, parent) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
  m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.receiveShadow = true;
  parent.add(m); return m;
}
/* plan vertical (face vers +z) */
function front(w, h, mat, x, y, z, parent) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(x, y, z); m.receiveShadow = true; parent.add(m); return m;
}
const std = (color, roughness = 0.5, metalness = 0, extra = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });

const M = {
  pcbBlack: std(0x16191d, 0.5, 0.1),
  pcbBlue: std(0x1f55ad, 0.45, 0.1),
  modPCB: std(0x1d2733, 0.5, 0.1),
  shield: std(0xd9dce1, 0.26, 1),
  chrome: std(0xdfe2e6, 0.18, 1),
  gold: std(0xd8aa4c, 0.28, 1),
  chip: std(0x101114, 0.4, 0.05),
  plBlack: std(0x121314, 0.55, 0),
  plWhite: std(0xcfcdc6, 0.5, 0),
  plGray: std(0x8e959b, 0.4, 0.55),
  alu: std(0xc9cdd2, 0.36, 1),
  steel: std(0xb8bcc2, 0.25, 1),
  darkMetal: std(0x24282d, 0.42, 0.75),
  rubber: std(0x1a1a1a, 0.85, 0),
  orangeRub: std(0xd2621c, 0.7, 0),
  nylon: std(0xf3f0e6, 0.6, 0),
  cork: std(0xa57a52, 0.95, 0),
  acrylic: new THREE.MeshPhysicalMaterial({ color: 0x8fa6b4, roughness: 0.15, metalness: 0, transparent: true, opacity: 0.22, clearcoat: 0.6, envMapIntensity: 0.4 }),
  cableBlue: std(0x2a6fd6, 0.45, 0),
  cableYellow: std(0xe8c130, 0.45, 0),
  cableGray: std(0x9aa1a8, 0.5, 0),
  cableBlack: std(0x1b1c1e, 0.5, 0),
  glassDark: std(0x050608, 0.15, 0),
};
const wireMats = {};
const wireMat = c => wireMats[c] || (wireMats[c] = std(c, 0.45, 0));

/* =====================================================================
   3. La pièce : sol, bureau
   ===================================================================== */
const floorTex = canvasTex(1024, 1024, (g, w, h) => {
  g.fillStyle = '#1b1f23'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * 0.035})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
  g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = 3;
  for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * w / 4, 0); g.lineTo(i * w / 4, h); g.stroke(); g.beginPath(); g.moveTo(0, i * h / 4); g.lineTo(w, i * h / 4); g.stroke(); }
});
floorTex.tex.wrapS = floorTex.tex.wrapT = THREE.RepeatWrapping; floorTex.tex.repeat.set(10, 10);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), std(0xffffff, 0.85, 0, { map: floorTex.tex }));
floor.rotation.x = -Math.PI / 2; floor.position.y = -76; floor.receiveShadow = true; scene.add(floor);

const deskTex = canvasTex(2048, 1024, (g, w, h) => {
  g.fillStyle = '#7d7a74'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 26000; i++) { const a = Math.random() * 0.05; g.fillStyle = Math.random() < .5 ? `rgba(0,0,0,${a})` : `rgba(255,255,255,${a})`; g.fillRect(Math.random() * w, Math.random() * h, 3, 1.5); }
});
const deskTop = mesh(RB(240, 4, 122, 0.8), std(0xffffff, 0.78, 0, { map: deskTex.tex, envMapIntensity: 0.5 }), 0, -2, -10);
deskTop.castShadow = false;
mesh(BOX(240.4, 1.2, 122.4), std(0x2c2f33, 0.5, 0.2), 0, -3.4, -10);
for (const [x, z] of [[-114, -66], [114, -66], [-114, 46], [114, 46]]) mesh(BOX(5, 72, 5), M.darkMetal, x, -40, z);
mesh(BOX(232, 4, 3), M.darkMetal, 0, -60, -66);

/* =====================================================================
   4. Composants électroniques (cartes, capteurs, LED, fils)
   ===================================================================== */
const pinGeo = BOX(0.064, 0.62, 0.064);
const dotGeo = BOX(0.12, 0.06, 0.12);

const espSilk = canvasTex(520, 285, (g, w, h) => {
  g.clearRect(0, 0, w, h); g.fillStyle = '#f2f2f2'; g.font = 'bold 15px Arial';
  g.fillText('ESP32 DEVKIT V1', 150, 148);
  g.font = '10px Arial';
  const A = ['EN', 'VP', 'VN', 'D34', 'D35', 'D32', 'D33', 'D25', 'D26', 'D27', 'D14', 'D12', 'D13', 'GND', 'VIN'];
  const B = ['D23', 'D22', 'TX0', 'RX0', 'D21', 'D19', 'D18', 'D5', 'TX2', 'RX2', 'D4', 'D2', 'D15', 'GND', '3V3'];
  for (let i = 0; i < 15; i++) {
    const x = (2.6 - 0.35 + 1.778 - i * 0.254) / 5.2 * w;
    g.save(); g.translate(x + 3, 46); g.rotate(-Math.PI / 2); g.fillText(A[i], -18, 0); g.restore();
    g.save(); g.translate(x + 3, h - 30); g.rotate(-Math.PI / 2); g.fillText(B[i], -18, 0); g.restore();
  }
  g.strokeStyle = '#f2f2f2'; g.lineWidth = 2; g.strokeRect(20, 105, 70, 75);
  g.fillText('EN', 16, 30); g.fillText('BOOT', 16, h - 12);
});
const espSilkMat = new THREE.MeshStandardMaterial({ map: espSilk.tex, transparent: true, roughness: 0.6 });
const modMark = canvasTex(256, 256, (g, w, h) => {
  g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(40,44,50,.85)';
  g.font = 'bold 26px Arial'; g.fillText('ESP32-WROOM-32', 14, 92);
  g.font = '18px Arial'; g.fillText('Wi-Fi + Bluetooth', 14, 128); g.fillText('2,4 GHz', 14, 156);
  g.strokeStyle = 'rgba(40,44,50,.6)'; g.lineWidth = 3; g.strokeRect(10, 50, 236, 130);
});
const modMarkMat = new THREE.MeshStandardMaterial({ map: modMark.tex, transparent: true, roughness: 0.3, metalness: 1, color: 0xdddddd });
const antTex = canvasTex(140, 360, (g, w, h) => {
  g.fillStyle = '#1d2733'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#c99a45'; g.lineWidth = 12; g.beginPath();
  let y = 20; g.moveTo(20, h - 10); g.lineTo(20, y);
  for (let i = 0; i < 4; i++) { g.lineTo(115, y); y += 40; g.lineTo(115, y); g.lineTo(45, y); y += 40; g.lineTo(45, y); }
  g.stroke();
});
const antMat = std(0xffffff, 0.4, 0.2, { map: antTex.tex });

/** Carte ESP32 DevKit (30 broches). Antenne vers +x, USB vers -x. Origine = centre du circuit imprimé. */
function makeESP32() {
  const g = new THREE.Group();
  mesh(BOX(5.2, 0.16, 2.85), M.pcbBlack, 0, 0, 0, g);
  flat(5.2, 2.85, espSilkMat, 0, 0.082, 0, g);
  mesh(BOX(2.55, 0.08, 1.8), M.modPCB, 1.3, 0.12, 0, g);
  mesh(RB(1.76, 0.3, 1.72, 0.04, 2), M.shield, 0.92, 0.31, 0, g);
  flat(1.6, 1.6, modMarkMat, 0.92, 0.462, 0, g);
  flat(0.72, 1.8, antMat, 2.21, 0.161, 0, g);
  mesh(RB(0.6, 0.28, 0.76, 0.06, 2), M.chrome, -2.42, 0.22, 0, g);
  mesh(BOX(0.5, 0.1, 0.5), M.chip, -1.15, 0.13, 0.35, g);
  mesh(BOX(0.35, 0.12, 0.25), M.chip, -1.7, 0.14, -0.55, g);
  mesh(BOX(0.25, 0.1, 0.18), M.chip, -0.4, 0.13, -0.6, g);
  for (const z of [-1.0, 1.0]) {
    mesh(BOX(0.6, 0.12, 0.38), M.chrome, -1.95, 0.14, z, g);
    mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 16), M.plBlack, -1.95, 0.24, z, g);
  }
  const pled = mesh(BOX(0.12, 0.06, 0.08), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xff2a1a).multiplyScalar(4), toneMapped: false }), -0.95, 0.11, -1.05, g, false);
  for (const z of [-1.27, 1.27]) mesh(BOX(3.81, 0.25, 0.25), M.plBlack, -0.35, -0.205, z, g);
  const legs = new THREE.InstancedMesh(pinGeo, M.gold, 30);
  const dots = new THREE.InstancedMesh(dotGeo, M.gold, 30);
  const mtx = new THREE.Matrix4(); let k = 0;
  for (const z of [-1.27, 1.27]) for (let i = 0; i < 15; i++) {
    const x = -0.35 + 1.778 - i * 0.254;
    mtx.makeTranslation(x, -0.48, z); legs.setMatrixAt(k, mtx);
    mtx.makeTranslation(x, 0.09, z); dots.setMatrixAt(k, mtx); k++;
  }
  g.add(legs, dots);
  g.userData.pled = pled;
  return g;
}
/** Position locale (dans la carte) du trou de la plaque à essais à côté d'une broche. côté A = -z (EN…VIN), côté B = +z (D23…3V3). i = 0 près de l'antenne. */
function espHole(side, i, out = 0.55) {
  return new THREE.Vector3(-0.35 + 1.778 - i * 0.254, -0.3, side === 'A' ? -1.27 - out : 1.27 + out);
}
const ESP_B = { D23: 0, D22: 1, D21: 4, D19: 5, D18: 6, D5: 7, D4: 10, GND: 13, '3V3': 14 };
const ESP_A = { D25: 7, D26: 8, D27: 9, GND: 13 };

function bbTex(w, h) {
  return canvasTex(Math.round(w * 100), Math.round(h * 100), (g, W, H) => {
    g.fillStyle = '#f1efe8'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#d9d6cc'; g.fillRect(0, H / 2 - 9, W, 18);
    const p = 25.4;
    for (let x = p / 2; x < W; x += p) {
      for (let r = 0; r < 5; r++) {
        g.fillStyle = '#4c4c48';
        g.fillRect(x - 4, H / 2 - 22 - r * p - 4, 8, 8);
        g.fillRect(x - 4, H / 2 + 22 + r * p - 4, 8, 8);
      }
      if (H > 400) { g.fillRect(x - 4, 22, 8, 8); g.fillRect(x - 4, H - 30, 8, 8); }
    }
    if (H > 400) { g.fillStyle = '#c0392b'; g.fillRect(0, 40, W, 3); g.fillStyle = '#2a5db0'; g.fillRect(0, H - 42, W, 3); }
  });
}
/** Plaque à essais blanche. Origine = centre du dessus. */
function makeBreadboard(w = 8.2, d = 5.5) {
  const g = new THREE.Group();
  mesh(RB(w, 0.85, d, 0.08, 2), M.plWhite, 0, -0.425, 0, g);
  flat(w, d, std(0xcfcdc6, 0.6, 0, { map: bbTex(w, d).tex }), 0, 0.002, 0, g);
  return g;
}

const rcTex = canvasTex(400, 600, (g, w, h) => {
  g.fillStyle = '#1f55ad'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d29a4a'; g.lineWidth = 7;
  for (let i = 0; i < 4; i++) { const m = 30 + i * 16; rr(g, m, m, w - 2 * m, 360 - m, 30); g.stroke(); }
  g.fillStyle = '#101114'; g.fillRect(150, 400, 100, 100);
  g.fillStyle = '#c9c9c9'; g.fillRect(60, 420, 60, 28);
  g.fillStyle = '#ffffff'; g.font = 'bold 26px Arial'; g.fillText('RFID-RC522', 120, 200);
  g.font = '15px Arial';
  const pins = ['SDA', 'SCK', 'MOSI', 'MISO', 'IRQ', 'GND', 'RST', '3.3V'];
  pins.forEach((p, k) => { const x = w / 2 + (k - 3.5) * 25.4 * 1; g.save(); g.translate(x + 5, 560); g.rotate(-Math.PI / 2); g.fillText(p, 0, 0); g.restore(); });
  for (let k = 0; k < 8; k++) { g.fillStyle = '#d8aa4c'; g.beginPath(); g.arc(w / 2 + (k - 3.5) * 25.4, h - 18, 9, 0, 7); g.fill(); }
});
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

/** Lecteur RFID RC522 : 4 cm (x) × 6 cm (z), connecteur 8 broches sur le bord -z. Origine = centre du circuit. */
function makeRC522() {
  const g = new THREE.Group();
  mesh(BOX(4, 0.16, 6), M.pcbBlue, 0, 0, 0, g);
  flat(4, 6, std(0xffffff, 0.45, 0.1, { map: rcTex.tex }), 0, 0.082, 0, g);
  mesh(BOX(1, 0.12, 1), M.chip, 0, 0.14, 1.0, g);
  for (const [x, z] of [[-1.6, -2.6], [1.6, -2.6], [-1.6, 2.6], [1.6, 2.6]]) mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.2, 12), M.nylon, x, -0.68, z, g);
  mesh(BOX(2.03, 0.25, 0.25), M.plBlack, 0, 0.205, -2.7, g);
  for (let k = 0; k < 8; k++) mesh(pinGeo, M.gold, (k - 3.5) * 0.254, 0.4, -2.7, g, false);
  return g;
}
const rcPin = k => new THREE.Vector3((k - 3.5) * 0.254, 0.75, -2.7);
const RC = { SDA: 0, SCK: 1, MOSI: 2, MISO: 3, IRQ: 4, GND: 5, RST: 6, V33: 7 };

/** LED 5 mm. Origine = point d'entrée dans la plaque. */
const ledLights = {};
function makeLED(name, color) {
  const g = new THREE.Group();
  const mat = new THREE.MeshPhysicalMaterial({ color, roughness: 0.12, transparent: true, opacity: 0.82, emissive: color, emissiveIntensity: 0.05, clearcoat: 1 });
  for (const x of [-0.127, 0.127]) mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.5, 6), M.steel, x, 0.25, 0, g, false);
  mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.08, 24), mat, 0, 0.54, 0, g);
  mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.5, 24), mat, 0, 0.8, 0, g);
  mesh(new THREE.SphereGeometry(0.25, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat, 0, 1.05, 0, g);
  const pl = new THREE.PointLight(color, 0, 30, 2); pl.position.set(0, 1.0, 0.2); g.add(pl);
  ledLights[name] = { mat, pl };
  return g;
}
function setLED(name, on) {
  const L = ledLights[name]; if (!L) return;
  L.mat.emissiveIntensity = on ? 14 : 0.05; L.pl.intensity = on ? 40 : 0;
}
function makeResistor(bands) {
  const g = new THREE.Group();
  const body = mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.62, 16), std(0xd9c49a, 0.6), 0, 0.55, 0, g);
  body.rotation.z = Math.PI / 2;
  bands.forEach((c, i) => { const b = mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.06, 16), std(c, 0.5), -0.18 + i * 0.12, 0.55, 0, g, false); b.rotation.z = Math.PI / 2; });
  for (const s of [-1, 1]) {
    const h = mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 6), M.steel, s * 0.41, 0.55, 0, g, false); h.rotation.z = Math.PI / 2;
    mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.55, 6), M.steel, s * 0.51, 0.28, 0, g, false);
  }
  return g;
}
/** Fil de liaison (« dupont ») entre deux points du monde. Renvoie la courbe. */
function wire(a, b, color, lift = 1.6, r = 0.045) {
  const mid = a.clone().lerp(b, 0.5); mid.y = Math.max(a.y, b.y) + lift;
  const c = new THREE.CatmullRomCurve3([a, a.clone().add(new THREE.Vector3(0, lift * 0.55, 0)), mid, b.clone().add(new THREE.Vector3(0, lift * 0.55, 0)), b]);
  const t = new THREE.Mesh(new THREE.TubeGeometry(c, 40, r, 8, false), wireMat(color));
  t.castShadow = true; scene.add(t);
  for (const p of [a, b]) mesh(BOX(0.24, 0.55, 0.24), M.plBlack, p.x, p.y + 0.27, p.z);
  return c;
}

/* =====================================================================
   5. Gros appareils : serveur, switch, borne Wi-Fi, PC, téléphone, écran
   ===================================================================== */
function drawScreenBg(g, w, h, top = '#173a5c', bot = '#0d1e30') {
  const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, top); gr.addColorStop(1, bot);
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
}
function makeScreenMat(ct) {
  return new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: ct.tex, emissiveIntensity: 0.9, roughness: 0.18, metalness: 0 });
}
const keyTex = canvasTex(1024, 420, (g, w, h) => {
  g.fillStyle = '#1b1d20'; g.fillRect(0, 0, w, h);
  const rows = [14, 14, 13, 12, 9]; const kh = 70, gap = 12;
  rows.forEach((n, r) => {
    const kw = (w - gap * (n + 1)) / n;
    for (let i = 0; i < n; i++) {
      let ww = kw; if (r === 4 && i === 4) ww = kw * 3;
      if (r === 4 && i > 4) continue;
      g.fillStyle = '#2b2e33'; rr(g, gap + i * (kw + gap), gap + r * (kh + gap / 1.5), ww, kh, 8); g.fill();
    }
  });
});
/** Ordinateur portable. Origine = centre du dessous. Écran animé (canvas). */
function makeLaptop({ body = 0x3a3f46, rugged = false, w = 32, d = 22 } = {}) {
  const g = new THREE.Group();
  const bmat = std(body, 0.45, 0.6);
  mesh(RB(w, 1.8, d, 0.7), bmat, 0, 0.9, 0, g);
  flat(w - 4, d * 0.42, std(0xffffff, 0.7, 0, { map: keyTex.tex }), 0, 1.805, -d * 0.12, g);
  flat(10, 6, std(body, 0.3, 0.5, { color: new THREE.Color(body).multiplyScalar(1.15) }), 0, 1.806, d * 0.3, g);
  const pivot = new THREE.Group(); pivot.position.set(0, 1.8, -d / 2 + 0.4); g.add(pivot);
  const lh = d - 0.8;
  mesh(RB(w, lh, 0.7, 0.35), bmat, 0, lh / 2, -0.1, pivot);
  const sc = canvasTex(1024, 640, () => {});
  const scr = front(w - 2.2, lh - 2.4, makeScreenMat(sc), 0, lh / 2 + 0.2, 0.26, pivot);
  mesh(BOX(w - 1.4, lh - 1.6, 0.05), M.glassDark, 0, lh / 2 + 0.2, 0.23, pivot, false);
  pivot.rotation.x = -0.24;
  if (rugged) {
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) mesh(RB(3.2, 2.4, 3.2, 0.5), M.orangeRub, x * (w / 2 - 1.2), 1.0, z * (d / 2 - 1.2), g);
    for (const x of [-1, 1]) mesh(RB(3.2, 3.2, 1.2, 0.4), M.orangeRub, x * (w / 2 - 1.2), lh - 1.3, -0.1, pivot);
    mesh(RB(w * 0.5, 0.35, 2.6, 0.15), M.rubber, 0, 1.0, d / 2 + 0.3, g);
  }
  return { g, pivot, screen: sc, lh };
}

/** Serveur tour Ubuntu. */
const srvFront = canvasTex(400, 880, (g, w, h) => {
  g.fillStyle = '#1b1e22'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#25292e'; for (let i = 0; i < 2; i++) g.fillRect(30, 40 + i * 90, w - 60, 72);
  g.strokeStyle = '#3a3f46'; g.lineWidth = 3; for (let i = 0; i < 2; i++) g.strokeRect(30, 40 + i * 90, w - 60, 72);
  g.fillStyle = '#0d0f11';
  for (let y = 260; y < h - 70; y += 22) for (let x = 40 + ((y / 22) % 2) * 11; x < w - 40; x += 22) { g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill(); }
  g.fillStyle = '#c8d0d6'; g.font = 'bold 26px Arial'; g.fillText('SERVEUR', 30, h - 30);
  g.font = '18px Arial'; g.fillStyle = '#8a96a0'; g.fillText('Ubuntu Server 24.04', 170, h - 32);
});
function makeServer() {
  const g = new THREE.Group();
  mesh(RB(20, 44, 46, 0.8), M.darkMetal, 0, 22, 0, g);
  front(19, 41.8, std(0xffffff, 0.5, 0.4, { map: srvFront.tex }), 0, 22, 23.02, g);
  mesh(new THREE.TorusGeometry(0.9, 0.18, 12, 32), M.chrome, 6.5, 41, 23.1, g);
  const glow = (c) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(3), toneMapped: false });
  const pwr = mesh(new THREE.CircleGeometry(0.35, 20), glow(0x32ff7a), 6.5, 41, 23.12, g, false);
  const disk = mesh(new THREE.CircleGeometry(0.3, 20), glow(0xffa31a), 4.0, 41, 23.12, g, false);
  for (const [x, z] of [[-8, -20], [8, -20], [-8, 20], [8, 20]]) mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.8, 16), M.rubber, x, -0.4 + 0.4, z, g);
  g.userData = { pwr, disk };
  return g;
}

/** Switch 24 ports du lycée. */
const SW = { w: 44, h: 4.4, d: 24 };
const portPx = i => ({ x: 760 + Math.floor(i / 2) * 80 + 30, y: i % 2 ? 123 : 63 });
const swFront = canvasTex(1760, 176, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#a3aab0'); gr.addColorStop(1, '#868d93');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = '#20262c'; g.font = 'bold 34px Arial'; g.fillText('SWITCH 24 PORTS', 60, 80);
  g.font = '24px Arial'; g.fillText('réseau du lycée (en place)', 60, 120);
  for (let i = 0; i < 24; i++) {
    const p = portPx(i);
    g.fillStyle = '#111417'; g.fillRect(p.x - 28, p.y - 22, 56, 44);
    g.fillStyle = '#2a2f35'; g.fillRect(p.x - 12, p.y + 14, 24, 8);
    g.fillStyle = '#b8902f'; for (let k = 0; k < 8; k++) g.fillRect(p.x - 20 + k * 5.5, p.y - 20, 2.4, 8);
    g.fillStyle = '#3a3f45'; g.fillRect(p.x - 38, p.y - 18, 6, 6);
  }
});
const portLEDs = [];
function makeSwitch() {
  const g = new THREE.Group();
  mesh(RB(SW.w, SW.h, SW.d, 0.25), M.plGray, 0, SW.h / 2, 0, g);
  front(SW.w, SW.h, std(0xffffff, 0.45, 0.5, { map: swFront.tex }), 0, SW.h / 2, SW.d / 2 + 0.01, g);
  for (let i = 0; i < 24; i++) {
    const p = portPx(i);
    const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x2bff6a).multiplyScalar(0.15), toneMapped: false });
    const led = mesh(new THREE.PlaneGeometry(0.16, 0.16), m, (p.x - 35) / 1760 * SW.w - SW.w / 2, SW.h - (p.y - 15) / 176 * SW.h, SW.d / 2 + 0.03, g, false);
    portLEDs.push({ m, last: -9, used: false });
  }
  for (const x of [-20, 20]) for (const z of [-10, 10]) mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.3, 12), M.rubber, x, 0.15, z, g);
  return g;
}
function swPortLocal(i) { const p = portPx(i); return new THREE.Vector3(p.x / 1760 * SW.w - SW.w / 2, SW.h - p.y / 176 * SW.h, SW.d / 2); }

function makeAP() {
  const g = new THREE.Group();
  mesh(RB(18, 3.4, 14, 1.4, 4), M.plWhite, 0, 1.7, 0, g);
  for (const x of [-6, 6]) {
    const a = mesh(RB(1.2, 15, 0.7, 0.3), M.plBlack, x, 9, -6.6, g); a.rotation.z = x < 0 ? 0.12 : -0.12;
  }
  const led = mesh(new THREE.CircleGeometry(0.3, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(0x3d9bff).multiplyScalar(3), toneMapped: false }), 0, 1.4, 7.01, g, false);
  return g;
}

function makeMonitor() {
  const g = new THREE.Group();
  mesh(RB(22, 1.2, 16, 0.5), M.darkMetal, 0, 0.6, 0, g);
  mesh(RB(4, 18, 2.4, 0.6), M.darkMetal, 0, 9, -3, g);
  const panel = new THREE.Group(); panel.position.set(0, 26, -1.5); panel.rotation.x = -0.06; g.add(panel);
  mesh(RB(56, 33.5, 2.4, 0.6), std(0x16181b, 0.4, 0.4), 0, 0, 0, panel);
  const sc = canvasTex(1280, 740, () => {});
  front(54, 31.2, makeScreenMat(sc), 0, 0.3, 1.22, panel);
  return { g, screen: sc };
}

function makeSFF() {
  const g = new THREE.Group();
  mesh(RB(9, 30, 28, 0.6), std(0x202327, 0.45, 0.6), 0, 15, 0, g);
  const glow = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x4fc3ff).multiplyScalar(3), toneMapped: false });
  mesh(new THREE.CircleGeometry(0.4, 16), glow, 0, 27, 14.02, g, false);
  for (const y of [21, 19]) mesh(BOX(1.4, 0.6, 0.1), M.plBlack, 0, y, 14.02, g, false);
  return g;
}

/** Antenne relais 4G (mode terrain), au loin. */
/* =====================================================================
   9. Animations : paquets, effets, attentes annulables
   ===================================================================== */
class Cancel extends Error {}
let runId = 0;
const packets = [], tweens = [], fx = [];
const sphereGeo = new THREE.SphereGeometry(1, 20, 12);
const glowMat = (hex, k = 3) => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), toneMapped: false, transparent: true });
const COL = { kit: 0x3ddc84, req: 0x9fd0ff, rep: 0x4aa8ff, borne: 0xffb020, capt: 0xc18cff, err: 0xff5a4d, spi: 0xf4d03f };
const CSS = { kit: '#3ddc84', req: '#9fd0ff', rep: '#4aa8ff', borne: '#ffb020', capt: '#c18cff', err: '#ff5a4d' };

function tag(text, col) {
  const d = document.createElement('div'); d.className = 'pkt'; d.style.color = col; d.innerHTML = `<i>${text}</i>`;
  return new CSS2DObject(d);
}
/** Envoie un paquet lumineux sur un chemin. Renvoie 'ok' ou 'lost'. */
function go(name, o = {}) {
  const P = paths[name.replace(/^-/, '')];
  const reverse = name.startsWith('-') !== !!o.reverse;
  const id = runId;
  return new Promise((res, rej) => {
    const kind = o.kind || 'req';
    const m = new THREE.Mesh(sphereGeo, glowMat(COL[kind] ?? kind, o.glow ?? 7));
    m.scale.setScalar(o.size ?? P.size); scene.add(m);
    const trail = [];
    if (!o.noTrail) for (let i = 0; i < 6; i++) { const t = new THREE.Mesh(sphereGeo, glowMat(COL[kind] ?? kind, 3)); t.scale.setScalar((o.size ?? P.size) * (0.8 - i * 0.11)); t.material.opacity = 0.5 - i * 0.07; t.visible = false; scene.add(t); trail.push(t); }
    let lab = null;
    if (o.label && showLabels) { lab = tag(o.label, CSS[kind] || '#fff'); lab.position.set(0, 1.2, 0); m.add(lab); }
    packets.push({ m, trail, hist: [], lab, P, t: reverse ? 1 : 0, dir: reverse ? -1 : 1, speed: o.speed ?? P.speed, dropAt: o.dropAt, res, rej, id, seed: Math.random() * 10, falling: false });
    if (P.wifi) rings(reverse ? P.curve.getPoint(1) : P.curve.getPoint(0), COL[kind] ?? kind, 6);
  });
}
function killPacket(p) {
  if (p.lab) { p.m.remove(p.lab); p.lab.element.remove(); }
  scene.remove(p.m); p.m.material.dispose();
  for (const t of p.trail) { scene.remove(t); t.material.dispose(); }
}
/** Enchaîne plusieurs chemins (préfixe « - » = sens inverse). */
async function route(list, o = {}) {
  for (const n of list) { const r = await go(n, o); if (r === 'lost') return 'lost'; }
  return 'ok';
}
function anim(dur, fn, ease = easeIO) {
  const id = runId;
  return new Promise((res, rej) => tweens.push({ t: 0, dur, fn, ease, res, rej, id }));
}
function sleep(ms) {
  const id = runId;
  return new Promise((res, rej) => setTimeout(() => (id === runId ? res() : rej(new Cancel())), ms));
}
const easeIO = k => k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const lerp = (a, b, k) => a + (b - a) * k;

const ringGeo = new THREE.RingGeometry(0.92, 1, 64);
function rings(pos, hex, r = 6, n = 3, axis = 'y', dur = 1.1) {
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(2.5), transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }));
    if (axis === 'y') m.rotation.x = -Math.PI / 2; else m.lookAt(camera.position);
    m.position.copy(pos); m.scale.setScalar(0.01); scene.add(m);
    fx.push({ m, t: -i * 0.22, dur, r });
  }
}
