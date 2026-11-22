
/* ---- son ---- */
let soundOn = true, actx = null;
function beep(freq = 2400, dur = 0.08, vol = 0.04) {
  if (!soundOn) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = 'sine'; o.frequency.value = freq; g.gain.value = vol;
    o.connect(g).connect(actx.destination); o.start(); o.stop(actx.currentTime + dur);
  } catch (e) { /* pas de son */ }
}

/* =====================================================================
   10. État du monde et écrans
   ===================================================================== */
const world = { vib: false, srvAct: -9, tickets: [], pastille: 'ok', hum: 46, temp: 22.4, offer: false, clicked: false, temoins: null, count: 0, jea: [] };

function drawLap(mode) {
  lap.screen.redraw((g, w, h) => {
    drawScreenBg(g, w, h, '#2b5f8a', '#173a5c');
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, h - 44, w, 44);
    g.fillStyle = '#d6e4ee'; g.font = `22px ${FONT}`; g.fillText('10:41', w - 90, h - 14);
    const x = 70, y = 60, ww = w - 140, hh = h - 160;
    g.fillStyle = '#f4f7f9'; g.fillRect(x, y, ww, hh);
    g.fillStyle = mode === 'jea' ? '#0c2348' : '#1d5a86'; g.fillRect(x, y, ww, 46);
    g.fillStyle = '#fff'; g.font = `bold 24px ${FONT}`;
    if (mode === 'jea') {
      g.fillText('Journal PowerShell (JEA) — PC de la secrétaire', x + 18, y + 31);
      g.fillStyle = '#0c2348'; g.fillRect(x, y + 46, ww, hh - 46);
      g.font = `23px ${MONO}`;
      world.jea.forEach(([t, c], i) => { g.fillStyle = c; g.fillText(t, x + 20, y + 90 + i * 36); });
      return;
    }
    g.fillText('Compte rendu.pdf', x + 18, y + 31);
    g.fillStyle = '#13222c'; g.font = `24px ${FONT}`;
    for (let i = 0; i < 7; i++) { g.fillStyle = '#c9d3da'; g.fillRect(x + 30, y + 80 + i * 34, ww * (i % 3 ? 0.75 : 0.55), 14); }
    if (mode === 'print' || mode === 'sent') {
      const dx = x + ww / 2 - 230, dy = y + 70;
      g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(dx + 8, dy + 8, 460, 290);
      g.fillStyle = '#fff'; g.fillRect(dx, dy, 460, 290);
      g.fillStyle = '#13222c'; g.font = `bold 30px ${FONT}`; g.fillText('Imprimer', dx + 24, dy + 48);
      g.font = `24px ${FONT}`; g.fillText('Imprimante : cardio-2', dx + 24, dy + 100);
      g.fillText('Pages : 5', dx + 24, dy + 140);
      g.fillStyle = mode === 'sent' ? '#23824f' : '#1d5a86'; rr(g, dx + 250, dy + 210, 180, 54, 10); g.fill();
      g.fillStyle = '#fff'; g.font = `bold 26px ${FONT}`; g.fillText(mode === 'sent' ? 'Envoyé ✓' : 'Imprimer', dx + 282, dy + 246);
    }
  });
}
function drawTech() {
  mon.screen.redraw((g, w, h) => {
    g.fillStyle = '#f3f6f7'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2a3a4a'; g.fillRect(0, 0, w, 66);
    g.fillStyle = '#fff'; g.font = `bold 30px ${FONT}`; g.fillText('GLPI · tickets', 26, 44);
    g.fillStyle = '#9fd0ff'; g.font = `24px ${FONT}`; g.fillText('+ tableau de bord (Grafana)', 260, 44);
    /* tickets */
    g.fillStyle = '#56656f'; g.font = `bold 22px ${FONT}`; g.fillText('N°', 30, 104); g.fillText('Ticket', 110, 104); g.fillText('État', 520, 104);
    if (!world.tickets.length) { g.fillStyle = '#6c7a84'; g.font = `24px ${FONT}`; g.fillText('Aucun ticket ouvert', 30, 150); }
    world.tickets.forEach((t, i) => {
      const y = 150 + i * 62;
      g.fillStyle = t.flash ? '#fff4c2' : (i % 2 ? '#e8eef1' : '#fff'); g.fillRect(16, y - 34, 690, 56);
      g.fillStyle = '#13222c'; g.font = `bold 24px ${FONT}`; g.fillText(t.id, 30, y);
      g.font = `22px ${FONT}`; g.fillText(t.txt, 110, y); g.fillStyle = '#56656f'; g.font = `18px ${FONT}`; g.fillText(t.sub || '', 110, y + 18);
      g.fillStyle = t.col; rr(g, 520, y - 24, 170, 34, 17); g.fill();
      g.fillStyle = '#fff'; g.font = `bold 20px ${FONT}`; g.fillText(t.st, 536, y);
    });
    if (world.offer) {
      g.fillStyle = world.clicked ? '#23824f' : '#c98a00'; rr(g, 30, h - 120, 660, 70, 12); g.fill();
      g.fillStyle = '#fff'; g.font = `bold 26px ${FONT}`;
      g.fillText(world.clicked ? '✓ Redémarrage validé par le technicien' : 'Palier 2 : redémarrer l\'imprimante ?  [ Valider ]', 50, h - 76);
    }
    /* tableau de bord */
    const X = 740; g.fillStyle = '#fff'; g.fillRect(X, 84, w - X - 20, h - 104);
    g.fillStyle = '#13222c'; g.font = `bold 26px ${FONT}`; g.fillText('Imprimantes', X + 20, 124);
    const pc = { ok: '#23824f', bad: '#c2382e', warn: '#c98a00' }[world.pastille];
    g.fillStyle = pc; g.beginPath(); g.arc(X + 40, 168, 18, 0, 7); g.fill();
    g.fillStyle = '#13222c'; g.font = `24px ${FONT}`; g.fillText('cardio-2', X + 70, 176);
    g.fillStyle = '#23824f'; g.beginPath(); g.arc(X + 40, 214, 18, 0, 7); g.fill();
    g.fillStyle = '#13222c'; g.fillText('pédiatrie-1', X + 70, 222);
    if (world.temoins) {
      g.font = `bold 22px ${FONT}`; g.fillText('Les 4 témoins (cardio-2)', X + 20, 280);
      g.font = `21px ${FONT}`;
      world.temoins.forEach(([k, v, c], i) => { g.fillStyle = '#56656f'; g.fillText(k, X + 20, 316 + i * 32); g.fillStyle = c || '#13222c'; g.fillText(v, X + 210, 316 + i * 32); });
    }
    /* humidité */
    const gy = h - 120;
    g.fillStyle = '#13222c'; g.font = `bold 22px ${FONT}`; g.fillText('Humidité du local (V2)', X + 20, gy);
    g.fillStyle = '#e1e7ea'; g.fillRect(X + 20, gy + 16, w - X - 80, 24);
    const k = Math.min(1, world.hum / 100); g.fillStyle = world.hum > 65 ? '#c98a00' : '#3d8bd9'; g.fillRect(X + 20, gy + 16, (w - X - 80) * k, 24);
    g.fillStyle = '#c2382e'; g.fillRect(X + 20 + (w - X - 80) * 0.65, gy + 10, 3, 36);
    g.fillStyle = '#13222c'; g.font = `22px ${FONT}`; g.fillText(`${Math.round(world.hum)} %  ·  ${world.temp.toFixed(1).replace('.', ',')} °C   (seuil 65 %)`, X + 20, gy + 74);
  });
}
function ticket(id, txt, st, col, sub) {
  const t = world.tickets.find(x => x.id === id);
  if (t) Object.assign(t, { txt, st, col, sub, flash: true }); else world.tickets.unshift({ id, txt, st, col, sub, flash: true });
  drawTech(); setTimeout(() => { world.tickets.forEach(x => x.flash = false); drawTech(); }, 1200);
}

/* feuilles */
function clearSheets() { for (const s of sheets) prn.remove(s); sheets.length = 0; }
async function printSheets(n) {
  world.vib = true; drawPrnLCD('Impression…', `${n} pages`, '#ffe08a');
  for (let i = 0; i < n; i++) {
    const s = new THREE.Mesh(sheetGeo, sheetMat); s.castShadow = true; s.receiveShadow = true; prn.add(s); sheets.push(s);
    const k0 = sheets.length;
    const end = SHEET_OUT.clone().add(V(0, k0 * 0.07, 0));
    let counted = false;
    s.position.copy(SHEET_IN); s.scale.z = 0.001;
    /* 1) la feuille sort de la fente (elle « pousse » vers l'avant) ; 2) elle retombe dans le réceptacle */
    await anim(1.0, k => {
      if (k < 0.75) { s.scale.z = Math.max(0.001, k / 0.75); s.position.copy(SHEET_IN); s.rotation.x = 0; }
      else { const q = (k - 0.75) / 0.25; s.scale.z = 1; s.position.lerpVectors(SHEET_IN, end, q); s.rotation.x = 0.035 * (1 - q); }
      if (!counted && k > 0.3) {
        counted = true; world.count++;
        setRead(readCnt, `compteur de pages : <b>+${world.count}</b> / ${n}`);
      }
    }, k => k);
    await sleep(150);
  }
  world.vib = false; drawPrnLCD('Prête', 'cardio-2 · 10.0.20.31');
}
async function einkShow(l1, l2) {
  await Promise.all([go('w_eSCK', { kind: 'sens', size: 0.14, noTrail: true }), go('w_eMOSI', { kind: 'sens', size: 0.14, noTrail: true })]);
  drawEink(l1, l2, true); await sleep(180); drawEink('', '', false); await sleep(160); drawEink(l1, l2, true); await sleep(160); drawEink(l1, l2);
}

function baseline(i) {
  clearSheets(); world.vib = false; world.count = 0; world.offer = false; world.clicked = false; world.temoins = null;
  world.tickets = []; world.pastille = 'ok'; world.hum = 46; world.temp = 22.4; world.jea = [];
  drawLap('idle'); drawTech(); drawPrnLCD('Prête', 'cardio-2 · 10.0.20.31'); drawEink('PRÊTE', 'tout va bien');
  prnLedMat.color.setRGB(0.2, 1, 0.45).multiplyScalar(3);
  setRGB(0x22ff55);
  for (const r of [readVib, readHum, readCnt, readSrv]) { r.userData.on = false; r.visible = false; }
  btn.userData.dome.position.y = 0.5;
  badge.position.copy(BADGE_HOME); badge.rotation.copy(BADGE_ROT);
}

/* =====================================================================
   11. Les étapes (le scénario)
   ===================================================================== */
function flyTo(pos, target, dur = 1.8) {
  const asp = camera.aspect, p = V(...pos), t = V(...target);
  if (asp < 1) p.sub(t).multiplyScalar(1.15 / asp).add(t);
  cam.from = { p: camera.position.clone(), t: controls.target.clone() }; cam.to = { p, t }; cam.k = 0; cam.dur = dur;
}
const cam = { k: 1, dur: 1 };
const BOXC = W(box, V(0, 3, 0));
const srv = html => setRead(readSrv, html);

async function normalPrint() {
  drawLap('print'); await sleep(900); drawLap('sent');
  await route(FROM_LAP, { kind: 'ipp', label: 'IPP 631 · 5 pages' });
  srv('CUPS : <b>5 pages</b> demandées');
  await route(TO_PRN, { kind: 'ipp', label: 'IPP · travail d\'impression' });
}

const steps = [
{
  title: 'Vue d\'ensemble',
  text: `<p>La maquette du lycée. À gauche, une <b>imprimante réseau</b> avec, fixé dessus, le <b>boîtier ESP32</b> et ses capteurs.</p>
         <p>Au fond, le réseau en place : <b>point d'accès Wi-Fi</b> et <b>switch</b>. À droite, le <b>serveur Ubuntu</b> (le « cerveau ») et le <b>poste du technicien</b> (GLPI). Devant, le <b>PC de la secrétaire</b>.</p>
         <p>Les points lumineux sont des <b>messages</b>. Tourne la scène à la souris, puis clique sur <b>Suivant</b>.</p>`,
  cam: [[60, 150, 230], [5, 12, -22]], labels: 'overview',
  async run() {
    while (true) {
      await sleep(1800);
      if (Math.random() < 0.6) route(UP, { kind: 'mqtt', size: 0.8 }).catch(() => {});
      else route(TO_PRN, { kind: 'snmp', size: 0.8 }).then(() => route(FROM_PRN, { kind: 'snmp', size: 0.8 })).catch(() => {});
    }
  }
},
{
  title: '1. Le boîtier, de près',
  text: `<p>Un boîtier en plexiglas, <b>collé de façon rigide</b> sur l'imprimante (sinon la vibration se perd). Dedans, des modules du commerce :</p>
         <p>• <b>ESP32 DevKit</b> : le petit ordinateur, en Wi-Fi.<br>• <b>MPU6050</b> (carte bleue GY-521) : sent la <b>vibration</b>, bus I²C.<br>• <b>SHT31</b> (carte violette, V2) : <b>température et humidité</b>, même bus I²C, près des trous d'aération.<br>• <b>Écran e-paper</b>, <b>bouton d'arcade</b> rouge, <b>LED RGB</b>, et le lecteur <b>RC522</b> (V2).</p>`,
  cam: [[-33, 55, -5], [-51, 34, -33]], labels: 'boitier',
  async run() {
    setRead(readVib, 'vibration : <b>0,01 g</b> (au repos)'); setRead(readHum, 'SHT31 : <b>46 %</b> · 22,4 °C');
    while (true) {
      await Promise.all([go('w_mpuSDA', { kind: 'sens', label: 'I²C 0x68', size: 0.16 }), go('w_shtSDA', { kind: 'sens', label: 'I²C 0x44', size: 0.16 })]);
      await sleep(700);
      await go('w_btn', { kind: 'sens', size: 0.14, noTrail: true });
      await sleep(900);
    }
  }
},
{
  title: '2. Une impression normale',
  text: `<p>La secrétaire imprime 5 pages. Le travail passe par <b>CUPS</b> sur le serveur, qui sait donc combien de pages sont demandées, puis part vers l'imprimante (<b>IPP</b>, port 631).</p>
         <p>L'imprimante <b>vibre</b> (MPU6050). Le boîtier l'envoie en <b>MQTT</b> (chiffré TLS) par le Wi-Fi.</p>
         <p>Le serveur interroge aussi l'imprimante en <b>SNMP</b> : « prête, encre 64 % », et son <b>compteur de pages</b> a avancé de 5. Les témoins sont d'accord : <b>aucun ticket</b>.</p>`,
  cam: [[34, 96, 112], [-22, 18, -26]], labels: 'overview',
  async run() {
    await normalPrint();
    setRead(readVib, 'vibration : <b>0,42 g</b>');
    await printSheets(5);
    setRead(readVib, 'vibration : <b>0,01 g</b>');
    await route(UP, { kind: 'mqtt', label: 'MQTT · vib 0,42 g' });
    await route(TO_PRN, { kind: 'snmp', label: 'SNMP GET état, compteur ?' });
    await route(FROM_PRN, { kind: 'snmp', label: '« prête » · compteur +5 · encre 64 %' });
    world.temoins = [['Vibration', 'oui'], ['Compteur (SNMP)', '+5 / 5'], ['Imprimante (SNMP)', '« prête »'], ['PC (file)', 'vide']];
    srv('4 témoins d\'accord → <b>tout va bien</b>');
    await route(TO_TEC, { kind: 'glpi', label: 'tableau de bord : vert' }); drawTech();
    await route(DOWN, { kind: 'mqtt', label: 'écran : PRÊTE' });
    await einkShow('PRÊTE', '5 pages imprimées');
  }
},
{
  title: '3. La panne : l\'imprimante figée',
  text: `<p>La secrétaire relance une impression. Le travail arrive… mais <b>rien ne vibre</b> et <b>aucune feuille ne sort</b>.</p>
         <p>Pourtant, en SNMP, l'imprimante répond « <b>prête</b> » : elle se trompe. Son <b>compteur de pages</b>, lui, n'a pas bougé. Le serveur demande aussi au PC, par un point d'accès PowerShell limité (<b>JEA</b>), si des documents y sont bloqués : non.</p>
         <p>Conclusion : <b>imprimante figée</b>. Le ticket GLPI s'ouvre avec la cause, et l'écran du boîtier prévient sur place.</p>`,
  cam: [[34, 96, 112], [-22, 18, -26]], labels: 'overview',
  async run() {
    await normalPrint();
    setRead(readVib, 'vibration : <b>0,00 g</b>'); setRead(readCnt, 'compteur de pages : <b>+0</b> / 5');
    for (let s = 5; s <= 30; s += 5) { srv(`attente de l'impression : <b>${s} s</b>`); await sleep(420); }
    await route(UP, { kind: 'mqtt', label: 'MQTT · vib 0,00 g pendant 30 s' });
    await route(TO_PRN, { kind: 'snmp', label: 'SNMP GET état, compteur ?' });
    await route(FROM_PRN, { kind: 'snmp', label: '« prête » (faux) · compteur +0' });
    await route(TO_LAP, { kind: 'jea', label: 'WinRM 5986 · Get-PrintJob (JEA)' });
    await route(FROM_LAP, { kind: 'jea', label: '0 document bloqué' });
    world.temoins = [['Vibration', 'non', '#c2382e'], ['Compteur (SNMP)', '+0 / 5', '#c2382e'], ['Imprimante (SNMP)', '« prête »'], ['PC (file)', 'vide']];
    srv('conclusion : <b style="color:#ff8a80">imprimante figée</b>');
    world.pastille = 'bad';
    await route(TO_TEC, { kind: 'glpi', label: 'API GLPI · ticket 1234' });
    ticket('1234', 'Imprimante cardio-2 figée', 'nouveau', '#c2382e', 'aucune vibration, compteur +0/5, SNMP « prête »');
    setRGB(0xff2a1a); prnLedMat.color.setRGB(1, 0.6, 0.1).multiplyScalar(3);
    await route(DOWN, { kind: 'mqtt', label: 'écran : BLOQUÉE' });
    await einkShow('BLOQUÉE', 'ticket 1234 · Wassim prévenu');
  }
},
{
  title: '4. Palier 2 : le technicien valide, le compteur prouve',
  text: `<p>Le système <b>propose</b> de redémarrer l'imprimante. Il n'agit pas seul : le technicien <b>valide d'un clic</b> (palier 2).</p>
         <p>L'imprimante redémarre et imprime les 5 pages : elle <b>vibre</b> et son <b>compteur</b> avance de 5. Ces deux mesures sont la <b>preuve</b> : le ticket est fermé « résolu, preuve : compteur +5/5 et vibration ». Personne ne s'est déplacé.</p>`,
  cam: [[70, 70, 120], [10, 18, -14]], labels: 'overview',
  async run() {
    world.pastille = 'bad'; ticket('1234', 'Imprimante cardio-2 figée', 'nouveau', '#c2382e', 'aucune vibration, compteur +0/5, SNMP « prête »');
    setRGB(0xff2a1a); drawEink('BLOQUÉE', 'ticket 1234 · Wassim prévenu');
    world.offer = true; drawTech(); await sleep(1600);
    world.clicked = true; drawTech(); beep(1200, 0.06);
    await route(FROM_TEC, { kind: 'glpi', label: 'validé : redémarrer' });
    flyTo([30, 92, 105], [-24, 18, -26], 1.6);
    await route(TO_PRN, { kind: 'snmp', label: 'SNMP SET · redémarrage' });
    drawPrnLCD('Redémarrage…', '', '#ffb020'); prnLedMat.color.setRGB(1, 0.6, 0.1).multiplyScalar(3);
    await sleep(1800); prnLedMat.color.setRGB(0.2, 1, 0.45).multiplyScalar(3);
    setRead(readVib, 'vibration : <b>0,41 g</b>');
    await printSheets(5);
    setRead(readVib, 'vibration : <b>0,01 g</b>');
    await route(UP, { kind: 'mqtt', label: 'MQTT · vib 0,41 g' });
    await route(TO_PRN, { kind: 'snmp', label: 'SNMP GET compteur ?' });
    await route(FROM_PRN, { kind: 'snmp', label: 'compteur +5 : preuve' });
    world.pastille = 'ok'; world.temoins = [['Vibration', 'oui'], ['Compteur (SNMP)', '+5 / 5'], ['Imprimante (SNMP)', '« prête »'], ['PC (file)', 'vide']];
    await route(TO_TEC, { kind: 'glpi', label: 'ticket 1234 résolu' });
    ticket('1234', 'Imprimante cardio-2 figée', 'résolu', '#23824f', 'preuve : compteur +5/5 et vibration');
    setRGB(0x22ff55);
    await route(DOWN, { kind: 'mqtt', label: 'écran : RÉPARÉ' });
    await einkShow('RÉPARÉ', 'preuve : 5 pages imprimées');
  }
},
{
  title: '5. L\'humidité du local (V2)',
  text: `<p>Le <b>SHT31</b> mesure la température et l'humidité de l'air autour de l'imprimante, toutes les minutes.</p>
         <p>Quand l'air devient trop humide, le papier absorbe de l'eau, gonfle et se coince plus souvent. Au-delà du <b>seuil</b> (ici 65 %), le serveur ouvre un <b>ticket préventif</b>.</p>
         <p><b>Physique :</b> au lycée, Wassim pèse des feuilles gardées 48 h à humidité basse puis haute (≈ 75 %, au-dessus d'eau salée). Le seuil vient de ces mesures, avec leurs incertitudes.</p>`,
  cam: [[-23, 50, -20], [-42, 34, -40]], labels: 'boitier',
  async run() {
    setRead(readHum, 'SHT31 : <b>46 %</b> · 22,4 °C');
    for (let k = 0; k <= 7; k++) {
      world.hum = 46 + k * 4; world.temp = 22.4 + k * 0.1;
      setRead(readHum, `SHT31 : <b>${world.hum} %</b> · ${world.temp.toFixed(1).replace('.', ',')} °C`);
      await go('w_shtSDA', { kind: 'sens', label: 'I²C 0x44', size: 0.16 });
    }
    flyTo([40, 110, 140], [-10, 18, -24], 1.6); labelMode = 'overview'; refreshLabels();
    await route(UP, { kind: 'mqtt', label: 'MQTT · HR 74 % · 23,1 °C' });
    srv('humidité <b>74 %</b> &gt; seuil 65 %');
    world.pastille = 'warn';
    await route(TO_TEC, { kind: 'glpi', label: 'ticket préventif' }); drawTech();
    ticket('1236', 'Local cardio-2 trop humide', 'préventif', '#c98a00', 'risque de bourrages : protéger le papier');
    setRGB(0xffb020);
    await route(DOWN, { kind: 'mqtt', label: 'écran : LOCAL HUMIDE' });
    await einkShow('HUMIDE 74 %', 'papier à protéger');
  }
},
{
  title: '6. Le gros bouton rouge',
  text: `<p>La secrétaire voit un problème que les capteurs ne voient pas (une impression pâle, par exemple). Elle appuie sur le <b>bouton</b>.</p>
         <p>Le ticket s'ouvre tout seul, avec le <b>nom exact de l'imprimante</b>. Elle n'a rien à écrire, et l'écran confirme le numéro du ticket.</p>`,
  cam: [[-27, 55, -9], [-44, 36, -31]], labels: 'boitier',
  async run() {
    await sleep(700);
    await anim(0.18, k => btn.userData.dome.position.y = lerp(0.5, 0.15, k)); beep(900, 0.05);
    btn.userData.domeMat.emissiveIntensity = 1.5;
    await go('w_btn', { kind: 'sens', label: 'GPIO 26', size: 0.18 });
    await anim(0.18, k => btn.userData.dome.position.y = lerp(0.15, 0.5, k)); btn.userData.domeMat.emissiveIntensity = 0.05;
    flyTo([40, 110, 140], [-10, 18, -24], 1.6); labelMode = 'overview'; refreshLabels();
    await route(UP, { kind: 'mqtt', label: 'MQTT · bouton · cardio-2' });
    await route(TO_TEC, { kind: 'glpi', label: 'API GLPI · ticket 1235' });
    ticket('1235', 'Signalé sur place : cardio-2', 'nouveau', '#c2382e', 'bouton du boîtier, 10:52');
    await route(DOWN, { kind: 'mqtt', label: 'écran : ticket 1235' });
    await einkShow('TICKET 1235', 'Wassim est prévenu');
  }
},
{
  title: '7. La carte du technicien (V2)',
  text: `<p>En arrivant devant l'imprimante, le technicien pose sa <b>carte RFID</b> sur le boîtier. Le lecteur <b>RC522</b> la lit à travers le couvercle.</p>
         <p>Le ticket note l'<b>heure d'arrivée</b>, puis la <b>durée</b> de l'intervention quand il repose sa carte en partant. Cela sert à mesurer le temps des pannes, pas à surveiller le technicien.</p>`,
  cam: [[-36, 54, -4], [-50, 35, -30]], labels: 'boitier',
  async run() {
    ticket('1235', 'Signalé sur place : cardio-2', 'nouveau', '#c2382e', 'bouton du boîtier, 10:52');
    const above = W(rc, V(0, 3.2, 0));
    const s = badge.position.clone(), r0 = badge.rotation.y;
    await anim(2.0, k => { badge.position.lerpVectors(s, above, k); badge.position.y += Math.sin(k * Math.PI) * 18; badge.rotation.y = lerp(r0, Math.PI / 2, k); });
    rings(W(rc, V(0, 1.4, 0)), 0xffffff, 3.5, 3, 'y', 0.9); beep(2600, 0.07);
    await Promise.all([go('w_rSCK', { kind: 'sens', size: 0.14, noTrail: true }), go('w_rMISO', { kind: 'sens', label: 'SPI · UID de la carte', size: 0.16 })]);
    await route(UP, { kind: 'mqtt', label: 'MQTT · carte technicien · 10:58' });
    await route(TO_TEC, { kind: 'glpi', label: 'arrivée notée' });
    ticket('1235', 'Signalé sur place : cardio-2', 'en cours', '#c98a00', 'technicien sur place à 10:58');
    await einkShow('TECHNICIEN', 'sur place · 10:58');
    await anim(1.6, k => { badge.position.lerpVectors(above, BADGE_HOME, k); badge.position.y += Math.sin(k * Math.PI) * 18; badge.rotation.y = lerp(Math.PI / 2, r0, k); });
  }
},
{
  title: '8. Sécurité : le diagnostic ne fait que ce qui est permis',
  text: `<p>La question de sécurité de Wassim : « <b>le diagnostic à distance peut-il faire plus que ce qu'on lui permet ?</b> »</p>
         <p>Sur le PC, un point d'accès PowerShell limité (<b>JEA</b>) n'accepte qu'une <b>liste fermée</b> de commandes, avec un compte sans droit d'administrateur. <code>Get-PrintJob</code> passe. Une commande hors liste est <b>refusée et tracée</b>.</p>
         <p>De même, le compte du serveur dans GLPI ne peut <b>rien supprimer</b>.</p>`,
  cam: [[40, 80, 120], [10, 14, -6]], labels: 'overview',
  async run() {
    world.jea = [['PS> Get-PrintJob -PrinterName cardio-2', '#e6edf3']]; drawLap('jea');
    await route(TO_LAP, { kind: 'jea', label: 'Get-PrintJob' });
    world.jea.push(['  autorisé · 0 document en attente', '#3ddc84']); drawLap('jea');
    await route(FROM_LAP, { kind: 'jea', label: '0 document' });
    await sleep(600);
    world.jea.push(['PS> Remove-Item C:\\Users\\* -Recurse', '#e6edf3']); drawLap('jea');
    await route(TO_LAP, { kind: 'err', label: 'Remove-Item … (hors liste)' });
    rings(W(lap.g, V(0, 12, -10)), COL.err, 10, 3, 'cam', 1.0); beep(300, 0.25, 0.05);
    world.jea.push(['  REFUSÉ : commande hors de la liste JEA', '#ff8a80'], ['  tracé dans le journal (10:59, compte diag)', '#ffb020']); drawLap('jea');
    await route(FROM_LAP, { kind: 'err', label: 'refusé · tracé' });
    srv('refus <b>tracé</b> dans le journal');
  }
},
];

/* =====================================================================
   12. Interface : étapes, boutons, clavier
   ===================================================================== */
let cur = 0, auto = false;
const dots = $('#dots');
steps.forEach((s, i) => { const b = document.createElement('button'); b.setAttribute('aria-label', 'Étape ' + i + ' : ' + s.title); b.onclick = () => goStep(i); dots.appendChild(b); });
function clearAnims() {
  for (const p of packets) { killPacket(p); p.rej(new Cancel()); }
  packets.length = 0;
  for (const t of tweens) t.rej(new Cancel());
  tweens.length = 0;
}
async function goStep(i) {
  i = Math.max(0, Math.min(steps.length - 1, i));
  runId++; const id = runId; clearAnims(); cur = i;
  const s = steps[i];
  baseline(i); shadowFrames = 3;
  labelMode = s.labels; refreshLabels();
  $('#stepno').textContent = i === 0 ? 'Introduction' : `Étape ${i} / ${steps.length - 1}`;
  $('#title').textContent = s.title;
  $('#text').innerHTML = s.text;
  $('#note').style.display = 'none';
  [...dots.children].forEach((d, k) => d.classList.toggle('on', k === i));
  $('#bNext').disabled = i === steps.length - 1;
  flyTo(...s.cam);
  controls.autoRotate = false;
  try {
    await s.run();
    if (auto && id === runId && i < steps.length - 1) { await sleep(2500); goStep(i + 1); }
  } catch (e) { if (!(e instanceof Cancel)) console.error(e); }
}
$('#bPrev').onclick = () => goStep(cur - 1);
$('#bNext').onclick = () => goStep(cur + 1);
$('#bReplay').onclick = () => goStep(cur);
$('#bAuto').onclick = e => { auto = !auto; e.currentTarget.setAttribute('aria-pressed', auto); e.currentTarget.classList.toggle('main', auto); if (auto) goStep(cur + 1 < steps.length ? cur : 0); };
$('#bLab').onclick = e => { showLabels = !showLabels; e.currentTarget.setAttribute('aria-pressed', showLabels); refreshLabels(); };
$('#bSnd').onclick = e => { soundOn = !soundOn; e.currentTarget.setAttribute('aria-pressed', soundOn); };
addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') goStep(cur + 1);
  else if (e.key === 'ArrowLeft') goStep(cur - 1);
  else if (e.key === 'r' || e.key === 'R') goStep(cur);
});
controls.addEventListener('start', () => { cam.k = 1; });

/* =====================================================================
   13. Boucle d'animation
   ===================================================================== */
const clock = new THREE.Clock();
let shadowFrames = 3;   // nombre d'images où l'on recalcule encore les ombres
function tick() {
  const dt = Math.min(clock.getDelta(), 0.05), now = clock.elapsedTime;
  if (cam.k < 1) {
    cam.k = Math.min(1, cam.k + dt / cam.dur); const e = easeIO(cam.k);
    camera.position.lerpVectors(cam.from.p, cam.to.p, e); controls.target.lerpVectors(cam.from.t, cam.to.t, e);
    if (cam.k >= 1 && cur === 0) controls.autoRotate = true;
  }
  controls.update();
  for (let i = tweens.length - 1; i >= 0; i--) {
    const t = tweens[i]; t.t += dt; const k = Math.min(1, t.t / t.dur); t.fn(t.ease(k));
    if (k >= 1) { tweens.splice(i, 1); t.res(); }
  }
  for (let i = packets.length - 1; i >= 0; i--) {
    const p = packets[i];
    p.t += p.dir * p.speed * dt / p.P.len;
    const done = p.dir > 0 ? p.t >= 1 : p.t <= 0;
    p.P.curve.getPointAt(Math.max(0, Math.min(1, p.t)), p.m.position);
    p.hist.unshift(p.m.position.clone()); if (p.hist.length > 18) p.hist.pop();
    p.trail.forEach((t, k) => { const h = p.hist[(k + 1) * 3]; if (h) { t.position.copy(h); t.visible = true; } });
    if (p.P.port !== undefined) portLEDs[p.P.port].last = now;
    if (done) { if (p.P.srv && p.dir > 0) world.srvAct = now; killPacket(p); packets.splice(i, 1); p.res('ok'); }
  }
  for (let i = fx.length - 1; i >= 0; i--) {
    const f = fx[i]; f.t += dt; if (f.t < 0) { f.m.visible = false; continue; } f.m.visible = true;
    const k = f.t / f.dur; f.m.scale.setScalar(0.2 + k * f.r); f.m.material.opacity = 0.9 * (1 - k);
    if (k >= 1) { scene.remove(f.m); f.m.material.dispose(); fx.splice(i, 1); }
  }
  /* vibration de l'imprimante (exagérée pour être visible) */
  if (world.vib) prnBody.position.set(Math.sin(now * 90) * 0.06, Math.abs(Math.sin(now * 70)) * 0.04, Math.cos(now * 80) * 0.04);
  else prnBody.position.set(0, 0, 0);
  portLEDs.forEach((L, i) => {
    if (!L.used) { L.m.color.setRGB(0.02, 0.06, 0.03); return; }
    const act = now - L.last < 0.25;
    const on = act ? Math.sin(now * 60 + i) > 0 : Math.sin(now * 1.3 + i * 2) > -0.6;
    L.m.color.setRGB(0.15, 1, 0.35).multiplyScalar(on ? (act ? 4 : 2.2) : 0.12);
  });
  const sd = server.userData;
  sd.pwr.material.color.setRGB(0.2, 1, 0.45).multiplyScalar(3);
  const dAct = now - world.srvAct < 0.6 || Math.sin(now * 2.1) > 0.97;
  sd.disk.material.color.setRGB(1, 0.6, 0.1).multiplyScalar(dAct && Math.sin(now * 40) > 0 ? 3 : 0.05);
  esp.userData.pled.material.color.setRGB(1, 0.16, 0.1).multiplyScalar(4);
  if (world.vib || tweens.length) shadowFrames = 2;          // feuilles, badge, bouton, vibration
  if (shadowFrames > 0) { renderer.shadowMap.needsUpdate = true; shadowFrames--; }
  composer.render();
  labelRenderer.render(scene, camera);
  requestAnimationFrame(tick);
}
function viewShift() {
  const w = innerWidth, h = innerHeight, panelW = $('#panel').offsetWidth + 16;
  if (w > 860) camera.setViewOffset(w, h, -panelW / 2, 0, w, h); else camera.clearViewOffset();
}
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; viewShift(); camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight); composer.setSize(innerWidth, innerHeight);
  labelRenderer.setSize(innerWidth, innerHeight);
});
camera.aspect = innerWidth / innerHeight; viewShift(); camera.updateProjectionMatrix();
(document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { if (cur === 0) baseline(0); });
goStep(0);
tick();
window.__goStep = goStep;
/* aide pour vérifier de près dans la console : __view([x, y, z], [cible x, y, z]) */
window.__stats = () => ({ appels: renderer.info.render.calls, triangles: renderer.info.render.triangles, objets: (() => { let n = 0; scene.traverse(o => { if (o.isMesh) n++; }); return n; })() });
window.__view = (p, t) => { cam.k = 1; controls.autoRotate = false; camera.position.set(...p); controls.target.set(...t); controls.update(); };
</script>
</body>
</html>
