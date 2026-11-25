/* Vérification du laboratoire : node tests/verifier.js
   - chaque scénario donne la conclusion attendue ;
   - le moteur ne reçoit aucun champ de la réalité ;
   - une mesure absente n'est jamais 0 ; un délai SNMP n'est jamais « éteinte » ;
   - aucune action automatique en V1. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ctx = { console };
ctx.globalThis = ctx; vm.createContext(ctx);
for (const f of ['scenarios.js', 'simulation.js', 'regles.js', 'ticket.js']) {
  const p = path.join(__dirname, '..', 'js', f);
  if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f });
}
const L = ctx.LABO;
let echecs = 0, n = 0;
function verif(cond, msg) { n++; if (!cond) { echecs++; console.log('  ✗ ' + msg); } }

const CLES_REALITE = Object.keys(L.SCENARIOS[0].realite);
function parcourir(o, f, chemin = '') {
  if (o && typeof o === 'object') for (const k of Object.keys(o)) { f(k, o[k], chemin + '.' + k); parcourir(o[k], f, chemin + '.' + k); }
}

for (const sc of L.SCENARIOS) {
  const sim = L.SIM.observer(sc);
  const obs = JSON.parse(JSON.stringify(sim.observations));   // copie : ce que reçoit le moteur
  const diag = L.REGLES.diagnostiquer(obs);
  const c = diag.conclusion;
  const att = sc.attendu;
  console.log(`${sc.id.padEnd(10)} → ${c.code.padEnd(12)} [${c.confiance}] ${c.titre}`);

  // 1. conclusion
  verif(c.code === att.code, `${sc.id} : attendu ${att.code}, obtenu ${c.code}`);
  if (att.candidats) verif(JSON.stringify([...c.candidats].sort()) === JSON.stringify([...att.candidats].sort()), `${sc.id} : candidats ${c.candidats} ≠ ${att.candidats}`);
  if (att.constat) verif(c.constats.some(x => x.code === att.constat), `${sc.id} : constat ${att.constat} absent`);

  // 2. étanchéité : aucune clé de réalité ni le nom du scénario dans les observations
  parcourir(obs, (k, v, ch) => {
    verif(!['realite', 'attendu', 'scenario', 'id_scenario', 'cause'].includes(k), `${sc.id} : clé interdite ${ch}`);
    verif(!(CLES_REALITE.includes(k) && !['pages', 'raccordement'].includes(k)), `${sc.id} : clé de réalité ${ch}`);
  });
  verif(!JSON.stringify(obs).includes('"' + sc.id + '"'), `${sc.id} : nom du scénario visible dans les observations`);

  // 3. inconnu ≠ 0
  if (obs.vibration.boitier === 'hors_ligne') verif(obs.vibration.serie.every(x => x.rms === null), `${sc.id} : vibration hors ligne non nulle`);
  if (obs.snmp.applicable) obs.snmp.releves.filter(r => r.reponse !== 'ok').forEach(r => verif(r.compteur === undefined, `${sc.id} : compteur inventé sur timeout`));
  if (obs.pc.donnees && obs.pc.donnees.SpoolerRunning === false) verif(obs.pc.donnees.PendingJobs === null, `${sc.id} : file lue comme 0 alors que le spouleur est arrêté`);

  // 4. jamais « éteinte » affirmé seul
  const texte = JSON.stringify(diag.noeuds) + c.titre;
  verif(!/imprimante est éteinte/i.test(texte), `${sc.id} : « éteinte » affirmé`);
  if (obs.snmp.applicable && obs.snmp.releves.every(r => r.reponse !== 'ok')) verif(c.code !== 'ALIM', `${sc.id} : timeout SNMP → éteinte`);

  // 5. V1 : jamais d'action automatique
  verif(!/redémarrage automatique|redémarré automatiquement|le programme redémarre/i.test(JSON.stringify(c.recommandations)), `${sc.id} : action automatique proposée`);
  verif(['non', 'appel', 'deplacement', 'technicien', 'aucun'].includes(c.deplacement.code), `${sc.id} : décision inconnue`);

  // 6. cohérence des nœuds : chaque nœud a cherché, reçu, déduit
  diag.noeuds.forEach((nd, i) => verif(nd.cherche && nd.recu && nd.recu.length && nd.deduit, `${sc.id} : nœud ${i} incomplet`));

  // 7. ticket
  if (L.TICKET) {
    const t = L.TICKET.construire(sc, obs, diag);
    if (['OK', 'RIEN'].includes(c.code) && !c.constats.some(x => x.code === 'SUPERVISION') && !obs.signalement) verif(!t.cree, `${sc.id} : ticket créé sans raison`);
    else verif(t.cree, `${sc.id} : ticket attendu`);
    if (t.cree) verif(t.temoins.length === 4, `${sc.id} : le ticket doit montrer les quatre témoins`);
  }
}
// 8. le moteur ne dépend pas du nom : deux réalités aux observations identiques → même conclusion
const a = L.REGLES.diagnostiquer(JSON.parse(JSON.stringify(L.SIM.observer(L.scenario('ethernet')).observations)));
const b = L.REGLES.diagnostiquer(JSON.parse(JSON.stringify(L.SIM.observer(L.scenario('eteinte')).observations)));
verif(a.conclusion.code === b.conclusion.code, 'ethernet et éteinte doivent être indiscernables');

console.log(`\n${n - echecs}/${n} vérifications réussies` + (echecs ? ` — ${echecs} échec(s)` : ''));
process.exit(echecs ? 1 : 0);
