/* =====================================================================
   maisons.js — la liste des maisons du quartier et leurs vignettes dessinées.
   Partagé par le quartier 3D (index.html) et le plan 2D (plan-2d.html) :
   on ajoute ou modifie une maquette ICI, et les deux versions suivent.

   Pour ajouter la 4e maquette (ou une 5e) : remplacer l'entrée « libre »
   (ou en ajouter une) avec son titre, sa couleur et le chemin `url` de sa
   page (chemin relatif au dossier quartier-3d/), et `url25` celui de sa
   version 2,5D « pas à pas » et `url2d` celui de son schéma réseau à plat
   (boutons « Version 2,5D » et « Version 2D » ; facultatifs), et `urlPage` celui de
   sa page HTML interactive (bouton « Page du projet » ; facultatif). Les maisons se répartissent
   seules autour du carrefour (4 places au minimum).
   `prop` = petit objet devant la porte : 'printer', 'radar', 'kit', 'boite', 'station' ou null.
   `color` = couleur d'identité du projet (la même en 2D et en 3D).
   Script classique (pas un module) : fonctionne aussi en ouvrant le fichier directement.
   ===================================================================== */
(function () {
var Q = window.QUARTIER = {
  maisons: [
  { who: 'Wassim', n: 1, color: '#ffb020', prop: 'printer',
    title: 'Diagnostic à distance des imprimantes', sub: 'valorisation des données et ticket enrichi',
    desc: 'Un boîtier ESP32 écoute l’imprimante. Le serveur compare quatre témoins et ouvre un ticket GLPI quand une panne se prépare.',
    url: '../Projet apprenti 1/livrables/animation-3d/maquette-3d.html',
    url25: '../Projet apprenti 1/livrables/pages-html/architecture-2-5d.html',
    url2d: '../Projet apprenti 1/livrables/pages-html/architecture-2d.html',
    urlPage: '../Projet apprenti 1/livrables/pages-html/service-augmente.html' },
  { who: 'Yaksan', n: 2, color: '#4ea8ff', prop: 'station',
    title: 'Station de contrôle de santé des portables', sub: 'refroidissement · connectivité · écran',
    desc: 'Un portable rendu passe sur la station : un ESP32 mesure l’air soufflé et la lumière de l’écran, un script sans droits teste le réseau. Chaque fiche entre dans un journal qui ne s’efface pas.',
    url: '../Projet apprenti 2/livrables/animation-3d/maquette-3d.html' },   /* nouveau projet du 25/11 ; l'ancienne maquette (boîte noire) est dans quartier-3d/archives/ */
  { who: 'Lorenzo', n: 3, color: '#c18cff', prop: 'radar',
    title: 'Capteur de présence authentifié', sub: 'un radar pour le poste, un leurre pour le réseau',
    desc: 'Un radar LD2410 voit que l’agent est parti et le poste Windows se verrouille seul. Un second ESP32 joue une fausse imprimante : toute connexion devient un signal à examiner.',
    url: '../Projet apprenti 3/livrables/animation-3d/maquette-3d.html',
    url25: '../Projet apprenti 3/livrables/page-html/architecture-2-5d.html',
    url2d: '../Projet apprenti 3/livrables/page-html/architecture-2d.html' },
  { who: 'Aziza', n: 4, color: '#3ddc84', prop: 'kit',
    title: 'Maintien en condition opérationnelle d’un parc de PC', sub: 'PC à jour · documents archivés · parc tracé',
    desc: 'Des PC de maintenance toujours à jour : un catalogue signé distribue les bons fichiers, et chaque machine est tracée.',
    url: '../Projet apprenti 4/apprentie4-aziza/livrables/animation-3d/maquette-3d.html',
    url25: '../Projet apprenti 4/apprentie4-aziza/livrables/pages-html/architecture-2-5d.html',
    url2d: '../Projet apprenti 4/apprentie4-aziza/livrables/pages-html/architecture-2d.html' },
  ],
  /* les trois vues d'une maquette : champ de l'URL, nom du bouton (et nom court sur téléphone), suffixe du titre */
  vues: [
    { k: '3d', champ: 'url', bouton: 'Maquette 3D', court: '3D', suffixe: '' },
    { k: '25', champ: 'url25', bouton: 'Version 2,5D', court: '2,5D', suffixe: ' · version 2,5D' },
    { k: '2d', champ: 'url2d', bouton: 'Version 2D', court: '2D', suffixe: ' · version 2D' },
    { k: 'page', champ: 'urlPage', bouton: 'Page du projet', court: 'Page', suffixe: ' · page du projet' },
  ],
};
/* vignettes dessinées (trait noir épais, aplats, ombre dure décalée) */
Q.illus = function (kind, col) {
  const K = 'var(--encre,#16150F)', W = 'var(--carte,#FFFBF2)';
  const sh = (d) => `<path d="${d}" fill="${K}" transform="translate(4 4)"/>`;
  const head = '<svg viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg"><g stroke="' + K + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">';
  const foot = '</g></svg>';
  if (kind === 'carrefour') return head +
    `<path d="M52 100V22" fill="none"/><ellipse cx="52" cy="101" rx="16" ry="4" fill="${K}" stroke="none"/>
     <g class="bob">${sh('M54 26h36l10 9-10 9H54z')}<path d="M54 26h36l10 9-10 9H54z" fill="${Q.maisons[0].color}"/>
     ${sh('M50 50H16L6 59l10 9h34z')}<path d="M50 50H16L6 59l10 9h34z" fill="${Q.maisons[1].color}"/>
     ${sh('M54 74h32l9 8-9 8H54z')}<path d="M54 74h32l9 8-9 8H54z" fill="${Q.maisons[2].color}"/></g>
     <circle cx="52" cy="17" r="6" fill="${col}"/>` + foot;
  if (kind === 'printer') return head +
    `<ellipse cx="55" cy="96" rx="40" ry="5" fill="${K}" stroke="none"/>
     <path d="M32 18h46v26H32z" fill="${W}"/><path d="M39 27h30M39 34h22" fill="none"/>
     ${sh('M14 42h82v40H14z')}<path d="M14 42h82v40H14z" fill="${col}"/>
     <path d="M28 82v12h54V82" fill="${W}"/><path d="M36 88h30" fill="none"/>
     <circle cx="82" cy="54" r="5" fill="var(--vert-led,#3ddc84)"/>
     <g class="bob">${sh('M62 6h28v20H62z')}<path d="M62 6h28v20H62z" fill="var(--bleu,#9CC3E6)"/><circle cx="70" cy="16" r="3" fill="var(--rouge,#C8372D)" stroke="none"/><path d="M78 13h7M78 19h7" fill="none"/></g>` + foot;
  if (kind === 'radar') return head +
    `<ellipse cx="44" cy="98" rx="30" ry="5" fill="${K}" stroke="none"/>
     <path d="M44 96V66" fill="none"/><path d="M30 96h28" fill="none"/>
     ${sh('M18 36h52v32H18z')}<path d="M18 36h52v32H18z" fill="${col}"/>
     <circle cx="44" cy="52" r="8" fill="${W}"/><circle cx="44" cy="52" r="2.5" fill="${K}" stroke="none"/>
     <g class="bob" fill="none"><path d="M76 40c8 6 8 18 0 24"/><path d="M84 32c13 10 13 30 0 40"/><path d="M92 24c18 14 18 42 0 56"/></g>` + foot;
  if (kind === 'kit') return head +
    `<ellipse cx="55" cy="97" rx="40" ry="5" fill="${K}" stroke="none"/>
     <path d="M40 32v-9h30v9" fill="none"/>
     ${sh('M12 32h86v56H12z')}<path d="M12 32h86v56H12z" fill="${col}"/><path d="M12 52h86" fill="none"/>
     <path d="M48 48h14v10H48z" fill="${W}"/>
     <g class="bob">${sh('M74 58a14 14 0 1 0 0.1 0z')}<circle cx="74" cy="72" r="14" fill="${W}"/><path d="M67 72l5 5 9-10" fill="none"/></g>` + foot;
  if (kind === 'boite') return head +
    `<ellipse cx="55" cy="97" rx="40" ry="5" fill="${K}" stroke="none"/>
     ${sh('M14 30h82v58H14z')}<path d="M14 30h82v58H14z" fill="${col}"/>
     <path d="M24 40h62v30H24z" fill="${W}"/><path d="M28 56h12l5-10 7 20 6-14 4 4h14" fill="none"/>
     <path d="M24 78h26M60 78h26" fill="none"/>
     <g class="bob"><circle cx="86" cy="22" r="7" fill="var(--rouge,#C8372D)"/></g>` + foot;
  if (kind === 'station') return head +   /* portable sur le banc : air chaud qui sort, thermomètre */
    `<ellipse cx="52" cy="97" rx="42" ry="5" fill="${K}" stroke="none"/>
     ${sh('M20 30h56v40H20z')}<path d="M20 30h56v40H20z" fill="${W}"/><path d="M28 38h40v24H28z" fill="${col}"/>
     <path d="M10 76h76l-6 12H16z" fill="${W}"/><path d="M28 82h40" fill="none"/>
     <g class="bob" fill="none"><path d="M86 70c6-4 6-10 0-14"/><path d="M94 74c9-7 9-17 0-24"/></g>
     <g class="bob">${sh('M94 2a5 5 0 0 1 5 5v18a8 8 0 1 1-10 0V7a5 5 0 0 1 5-5z')}<path d="M94 2a5 5 0 0 1 5 5v18a8 8 0 1 1-10 0V7a5 5 0 0 1 5-5z" fill="${W}"/><circle cx="94" cy="31" r="4" fill="var(--rouge,#C8372D)"/><path d="M94 27V12" fill="none" stroke="var(--rouge,#C8372D)"/></g>` + foot;
  return head +   /* emplacement libre : maison en pointillés */
    `<ellipse cx="55" cy="96" rx="38" ry="5" fill="${K}" stroke="none" opacity=".35"/>
     <path d="M20 52 55 22l35 30v40H20z" fill="none" stroke-dasharray="7 6"/>
     <text x="55" y="80" text-anchor="middle" font-size="30" font-weight="900" fill="${K}" stroke="none" font-family="Nunito,sans-serif">?</text>` + foot;
};
})();
