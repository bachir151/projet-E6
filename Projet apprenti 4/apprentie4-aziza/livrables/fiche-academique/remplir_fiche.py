# -*- coding: utf-8 -*-
"""Remplit le formulaire académique « Dossier de présentation et de validation du projet »
pour l'apprentie 4 (Aziza), en gardant la mise en page officielle.

Usage :
  python3 schemas.py && node rendu.js      # schémas SVG -> PNG
  python3 remplir_fiche.py                 # DOCX rempli
  soffice --headless --convert-to pdf Fiche_presentation_E6_Aziza.docx
"""
import copy
import os

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

ICI = os.path.dirname(os.path.abspath(__file__))
MODELE = os.path.join(ICI, "..", "..", "..", "Fiche presentation projet E6-projet-IR v2.docx")
SORTIE = os.path.join(ICI, "Fiche_presentation_E6_Aziza.docx")
IMG = lambda n: os.path.join(ICI, "schemas", n + ".png")

d = Document(MODELE)
from docx.text.paragraph import Paragraph as _Par
# indices = position dans le corps du modèle (paragraphes ET tableaux comptés), relevés avant insertion
P = {i: _Par(el, d._body) for i, el in enumerate(d.element.body.iterchildren()) if el.tag == qn("w:p")}
T = d.tables
NOIR = RGBColor(0, 0, 0)
BLEU = RGBColor(0x1D, 0x4E, 0xD8)
SYMB = "Segoe UI Symbol"


# ------------------------------------------------------------------ outils
def police(run, nom):
    run.font.name = nom
    rpr = run._r.get_or_add_rPr()
    rf = rpr.find(qn("w:rFonts"))
    if rf is None:
        rf = OxmlElement("w:rFonts")
        rpr.insert(0, rf)
    for a in ("w:ascii", "w:hAnsi", "w:eastAsia", "w:cs"):
        rf.set(qn(a), nom)


def est_case(run):
    if run.text == "☐":
        return True
    return run.text in ("o", "") and (run.font.name == "Wingdings" or run.text == "")


def cases(par):
    return [r for r in par.runs if est_case(r)]


def cocher(run, oui=True):
    run.text = "☒" if oui else "☐"
    police(run, SYMB)


def harmoniser_cases(doc):
    """Toutes les cases Wingdings -> ☐ (rendu identique sous Word et LibreOffice)."""
    def parcourir(pars):
        for p in pars:
            for r in p.runs:
                if est_case(r):
                    cocher(r, False)
    parcourir(doc.paragraphs)
    for t in doc.tables:
        for row in t.rows:
            for c in row.cells:
                parcourir(c.paragraphs)


def ecrire_run(run, texte, gras=False, couleur=NOIR, taille=None):
    run.text = texte
    run.bold = gras
    run.font.color.rgb = couleur
    run.font.highlight_color = None
    if taille:
        run.font.size = Pt(taille)


def remplacer_marque(par, texte, gras=False):
    """Remplace « [ A remplir ] » dans un paragraphe (rouge -> noir)."""
    for r in par.runs:
        if "A remplir" in r.text:
            ecrire_run(r, texte, gras=gras)
            return r
    raise ValueError("marque absente : " + par.text)


def nouveau_par_apres(ancre, style="Normal"):
    p = OxmlElement("w:p")
    ancre_el = ancre._p if hasattr(ancre, "_p") else ancre
    ancre_el.addnext(p)
    from docx.text.paragraph import Paragraph
    par = Paragraph(p, ancre._parent if hasattr(ancre, "_parent") else d._body)
    par.style = d.styles[style]
    return par


class Redac:
    """Écrit une suite de paragraphes à la place d'un paragraphe « [ A remplir ] »."""

    def __init__(self, par, attendu="A remplir"):
        assert attendu in par.text or attendu == "", "ancre inattendue : " + par.text
        self.ancre = par
        for r in list(par.runs):
            r._r.getparent().remove(r._r)
        self.premier = True

    def _par(self):
        if self.premier:
            self.premier = False
            return self.ancre
        self.ancre = nouveau_par_apres(self.ancre)
        return self.ancre

    def _fmt(self, p, avant=2, apres=2):
        pf = p.paragraph_format
        pf.space_before = Pt(avant)
        pf.space_after = Pt(apres)
        return p

    def texte(self, *morceaux, taille=10.5, avant=2, apres=2, align=None):
        """morceaux : chaînes, ou (texte, 'g') pour du gras, (texte, 'i') italique."""
        p = self._fmt(self._par(), avant, apres)
        if align:
            p.alignment = align
        for m in morceaux:
            t, f = (m, "") if isinstance(m, str) else m
            r = p.add_run(t)
            r.font.size = Pt(taille)
            r.bold = "g" in f
            r.italic = "i" in f
            if "b" in f:
                r.font.color.rgb = BLEU
        return p

    def titre(self, t):
        return self.texte((t, "gb"), taille=11, avant=8, apres=2)

    def puce(self, *morceaux, taille=10.5, niveau=0):
        p = self.texte(*(("• ",) + morceaux), taille=taille, avant=0, apres=1)
        pf = p.paragraph_format
        pf.left_indent = Cm(0.6 + 0.6 * niveau)
        pf.first_line_indent = Cm(-0.4)
        return p

    def image(self, chemin, largeur=17.6, legende=None):
        p = self._fmt(self._par(), 6, 2)
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.add_run().add_picture(chemin, width=Cm(largeur))
        if legende:
            self.texte((legende, "i"), taille=9, align=WD_ALIGN_PARAGRAPH.CENTER, apres=6)
        return p

    def tableau(self, entetes, lignes, largeurs, taille=9.5):
        t = d.add_table(rows=1, cols=len(entetes))
        t.style = d.styles["Table Grid"]
        for i, h in enumerate(entetes):
            c = t.rows[0].cells[i]
            c.text = ""
            r = c.paragraphs[0].add_run(h)
            r.bold = True
            r.font.size = Pt(taille)
            sh = OxmlElement("w:shd")
            sh.set(qn("w:val"), "clear")
            sh.set(qn("w:fill"), "E8F0FE")
            c._tc.get_or_add_tcPr().append(sh)
        for ligne in lignes:
            cells = t.add_row().cells
            for i, v in enumerate(ligne):
                cells[i].text = ""
                r = cells[i].paragraphs[0].add_run(v)
                r.font.size = Pt(taille)
        t.autofit = False
        grille = t._tbl.tblGrid
        for i, gc in enumerate(grille.findall(qn("w:gridCol"))):
            gc.set(qn("w:w"), str(int(largeurs[i] * 567)))
        lay = OxmlElement("w:tblLayout")
        lay.set(qn("w:type"), "fixed")
        t._tbl.tblPr.append(lay)
        for row in t.rows:
            for i, w in enumerate(largeurs):
                row.cells[i].width = Cm(w)
        self._par()  # paragraphe vide après le tableau (évite deux tableaux collés)
        self.ancre._p.addprevious(t._tbl)
        return t


def ajouter_dans_run(par, debut, texte):
    """Ajoute du texte (en gras) juste après le run qui commence par « debut »."""
    for r in par.runs:
        if r.text.startswith(debut):
            nr = copy.deepcopy(r._r)
            r._r.addnext(nr)
            from docx.text.run import Run
            run = Run(nr, par)
            run.text = texte
            run.bold = True
            return run
    raise ValueError(debut)


def vider_cellule_marques(cell):
    for p in cell.paragraphs:
        for r in p.runs:
            if "A remplir" in r.text:
                r.text = ""


harmoniser_cases(d)

# ================================================================== EN-TÊTE
remplacer_marque(T[0].cell(3, 0).paragraphs[0], " à attribuer par la commission")
remplacer_marque(T[0].cell(3, 1).paragraphs[0],
                 "Des PC de maintenance à jour, des documents archivés, un parc tracé", gras=True)

t = T[1]
cocher(cases(t.cell(0, 1).paragraphs[0])[0])          # projet nouveau : oui
cocher(cases(t.cell(0, 7).paragraphs[0])[0])          # projet interne : non
cocher(cases(t.cell(1, 7).paragraphs[0])[0])          # apprentissage
cocher(cases(t.cell(2, 2).paragraphs[0])[0])          # IR
r = t.cell(2, 5).paragraphs[0].add_run("  1 (projet individuel)")
r.bold = True
r.font.size = Pt(10)

# ================================================================== 1.1 CONTEXTE
t = T[2]
pars = t.cell(0, 1).paragraphs
r = pars[-1].add_run(" : Aziza (apprentie)")
r.bold = True
for c in (2, 3, 4):
    r = t.cell(0, c).paragraphs[-1].add_run("—")
cocher(cases(t.cell(1, 3).paragraphs[0])[0])          # projet développé : entreprise

c = t.cell(2, 1).paragraphs
cocher(cases(c[0])[0])                                 # commanditaire : oui
ajouter_dans_run(c[1], "Nom", "SNCF – service de maintenance des équipements de télécommande du réseau électrique")
ajouter_dans_run(c[2], "Adresse", "")
ajouter_dans_run(c[3], "Contact", "tuteur de l’apprentie (nom et fonction à compléter)")
cocher(cases(c[5])[1])                                 # idée : entreprise
for k in (6, 7):                                       # cahier des charges et suivi : lycée + entreprise
    for case in cases(c[k]):
        cocher(case)

c = t.cell(3, 1).paragraphs
ajouter_dans_run(c[0], "Nom de l", "SNCF")

# ================================================================== 1.2 PRÉSENTATION
R = Redac(P[38])
R.titre("Contexte")
R.texte("Aziza est apprentie dans un service de maintenance des équipements de télécommande du réseau "
        "électrique ferroviaire. Le service utilise une dizaine de PC portables sous Windows 11. Les agents "
        "les emportent en intervention ; sur le terrain, ils n’ont Internet que par le partage de connexion "
        "de leur téléphone. Les fichiers, paramètres et programmes de maintenance sont rangés sur un "
        "SharePoint, mais les PC sont mis à jour à la main. Les documents de modification sont dispersés "
        "et leurs anciennes versions sont difficiles à retrouver.")
R.titre("Principe de la solution")
R.texte("Un référent valide puis publie un ", ("« kit de maintenance » signé", "g"),
        " : la liste des fichiers, leur empreinte SHA-256 et un numéro de version. Chaque PC compare son kit "
        "au kit publié, télécharge ", ("seulement ce qui a changé", "g"), ", vérifie l’authenticité de chaque "
        "fichier, garde la version précédente et envoie un rapport au serveur. Avant une intervention, l’agent "
        "badge à une ", ("borne de sortie", "g"), " : voyant vert si le PC est à jour, rouge sinon. "
        "Toutes les versions publiées sont conservées : elles forment ", ("l’archive", "g"),
        " des documents de modification.")
R.image(IMG("0_synoptique"), 17.6, "Synoptique de l’architecture (maquette de démonstration).")
R.titre("Progression du projet")
R.puce(("V1 (obligatoire) : ", "g"), "serveur et kit signé, agent PowerShell sur 3 PC, borne RFID, tableau de "
       "bord avec export vers Excel, exploitation du réseau (mesure d’un vrai partage de connexion, "
       "reproduction avec tc netem, captures Wireshark), expérience de physique sur la condensation.")
R.puce(("V2 (visée) : ", "g"), "archive des documents de modification avec recherche (équipement, date, auteur).")
R.puce(("Extensions : ", "g"), "propositions de modification par les techniciens, boîtier de sacoche à écran "
       "e-ink, lien avec le vrai SharePoint (Microsoft Graph), installation de programmes.")
R.titre("Limites de l’étude")
R.puce("Maquette de démonstration avec des documents fictifs : aucun accès au réseau, aux PC ni au SharePoint "
       "de l’entreprise, aucune donnée réelle.")
R.puce("Aucune action sur les systèmes du réseau électrique (supervision, télécommandes, automates) : "
       "ni connexion, ni reproduction, ni test.")
R.puce("Le système ne juge pas le contenu des fichiers (rôle du référent), ne détruit aucun original papier "
       "et ne contrôle pas les agents : il trace des PC et des versions.")
R.puce("Pas de déploiement en entreprise pendant le projet ; ensuite, seulement avec l’accord du service informatique.")
R.titre("Attentes du client")
R.puce("Des PC toujours à jour avant de partir en intervention, sans perte de temps pour les agents.")
R.puce("Une preuve de la version présente sur chaque PC, visible d’un coup d’œil (borne, tableau de bord).")
R.puce("Peu de données mobiles consommées et une mise à jour qui résiste aux coupures.")
R.puce("Une archive où l’on retrouve vite une ancienne version, et des tableaux Excel toujours alimentés.")

# ================================================================== 1.3 DOMAINE
cell = T[3].cell(0, 1)
RETENUS = ("Internet des objets", "cybersécurité", "embarquée", "transports")
for p in cell.paragraphs:
    if not p.text.strip():
        continue
    ppr = p._p.get_or_add_pPr()
    num = ppr.find(qn("w:numPr"))
    if num is not None:
        ppr.remove(num)
    oui = any(k in p.text for k in RETENUS)
    r0 = p.runs[0]
    nr = copy.deepcopy(r0._r)
    r0._r.addprevious(nr)
    from docx.text.run import Run
    case = Run(nr, p)
    case.text = ("☒" if oui else "☐") + "  "
    police(case, SYMB)
    if oui:
        for r in p.runs[1:]:
            r.bold = True
    p.paragraph_format.left_indent = Cm(0.7)
    p.paragraph_format.first_line_indent = Cm(-0.6)

# ================================================================== 1.4 CAHIER DES CHARGES
R = Redac(P[47])
R.titre("Besoins exprimés par le tuteur")
R.puce(("Besoin 1 – ", "g"), "maintenir à jour une dizaine de PC de maintenance Windows 11 (fichiers, paramètres "
       "et programmes centralisés sur un SharePoint) ; automatiser, ou à défaut fournir un mode opératoire.")
R.puce(("Besoin 2 – ", "g"), "organiser, améliorer et dématérialiser l’archivage des documents de modification.")
R.puce(("Confirmé par le tuteur (10/11/2026) : ", "g"), "les PC partent en intervention et n’ont Internet que par "
       "le partage de connexion du téléphone.")
R.titre("Hypothèses chiffrées (à confirmer avec le tuteur lors de la visite de décembre 2026)")
R.puce("Le kit change une à deux fois par mois ; une mise à jour manuelle prend 20 à 30 minutes par PC.")
R.puce("Aucun outil ne distribue aujourd’hui ces fichiers automatiquement sur les PC.")
R.puce("Les PC passent parfois du froid (véhicule, extérieur) à un local chauffé.")
R.titre("Exigences et indicateurs mesurés sur la maquette")
R.tableau(
    ["Exigence", "Indicateur mesuré", "Test", "Étape"],
    [
        ["E1 – Mise à jour automatique", "3 PC Windows 11 mis à jour sans action manuelle ; kit périmé signalé à l’ouverture de session, même sans réseau", "T01, T09", "V1"],
        ["E2 – Authenticité", "100 % des fichiers modifiés, signés par un autre certificat ou anciens refusés", "T02, T03, T14", "V1"],
        ["E3 – Réseau mobile", "Seuls les fichiers modifiés téléchargés (volume comparé à une copie complète) ; reprise sans erreur après une coupure", "T01, T04", "V1"],
        ["E4 – Retour arrière", "Retour à la version précédente en moins de 2 minutes", "T05", "V1"],
        ["E5 – Borne de sortie", "Réponse en moins de 5 s ; 100 % des sorties enregistrées ; serveur arrêté = « vérification impossible »", "T06, T07, T08", "V1"],
        ["E6 – Échanges sûrs", "HTTPS ; rapport sans jeton valide refusé ; aucun secret dans le code", "T10, T15", "V1"],
        ["E7 – Archive", "Une ancienne version retrouvée par équipement, date ou auteur en moins d’1 minute", "T11", "V2"],
        ["E8 – Physique", "Temps d’attente avant d’allumer un PC froid : modèle confronté aux mesures, avec incertitudes", "mesures", "V1"],
    ],
    [4.2, 10.2, 2.3, 1.4])
R.titre("Niveaux de sécurité de l’agent")
R.texte("L’agent agit sur des PC : il fonctionne en trois paliers. ", ("Simulation", "g"),
        " (il affiche ce qu’il ferait), ", ("confirmation", "g"), " par l’agent pour les paramètres et programmes, ",
        ("automatique", "g"), " pour les documents (information après coup). La version précédente est toujours gardée.")

# ================================================================== 2.1 SYSML
R = Redac(P[52])
R.image(IMG("1_exigences"), 17.6, "Figure 1 – Diagramme d’exigences.")
R.image(IMG("2_contexte"), 17.0, "Figure 2 – Diagramme de contexte.")
R.image(IMG("3_cas_utilisation"), 16.5, "Figure 3 – Diagramme des cas d’utilisation.")
R.image(IMG("4_sequence"), 16.5, "Figure 4 – Diagramme de séquence : mise à jour d’un PC puis sortie à la borne.")

# ================================================================== 2.2 CONTRAINTES
R = Redac(P[55])
R.puce("Matériel à acheter pour la V1 : environ ", ("40 à 70 €", "g"), " (2 ESP32, lecteur RFID RC522, badges et "
       "étiquettes RFID anti-métal, LED, buzzer, boîtier, capteurs SHT40 et DS18B20). Prix à confirmer.")
R.puce("PC, serveur, réseau et licences : fournis par le lycée. Logiciels gratuits ou déjà disponibles.")
R.puce("Extension boîtier de sacoche : environ 40 à 60 € de plus, seulement si la V1 est terminée.")

R = Redac(P[60])
R.puce(("Postes : ", "g"), "Windows 11 et PowerShell 5.1 (agent signé, stratégie AllSigned, tâche planifiée, BITS, "
       "New-FileCatalog, Set-AuthenticodeSignature).")
R.puce(("Serveur : ", "g"), "Ubuntu Server 24.04, nginx (HTTPS), API Python Flask, base SQLite, chrony (NTP), "
       "SFTP pour la publication par le référent.")
R.puce(("Objets connectés : ", "g"), "ESP32 programmé en C++ (Arduino) ; RC522 en SPI, SHT40 en I²C, "
       "DS18B20 en 1-Wire ; Wi-Fi et HTTPS.")
R.puce(("Réseau : ", "g"), "réseau du lycée exploité tel quel (switchs HP ProCurve, routeurs Cisco ISR 4331) : "
       "adressage, DHCP, DNS, NTP, captures Wireshark. Lien 4G simulé par tc netem sur le serveur, réglé avec "
       "une vraie mesure de partage de connexion. Aucun VLAN ni ACL à créer.")
R.puce(("Interdits : ", "g"), "pas de câblage 230 V, pas de caméra, aucune donnée réelle de l’entreprise.")

R = Redac(P[64])
R.puce("Environ ", ("150 heures", "g"), " de janvier à mai 2027 : V1 ≈ 116 h, V2 ≈ 20 h, marge ≈ 14 h.")
R.puce("Trois revues de projet (fin janvier, mi-mars, mi-mai) avec démonstration et preuves.")
R.puce("Code commenté et versionné (Git) ; cahier de recette T01 à T15 avec captures, journaux et mesures.")
R.puce("Journal de bord et journal d’usage de l’IA (charte IA du lycée) ; chaque ligne de code doit pouvoir être expliquée.")
R.puce("Mesures de physique avec étalonnage des capteurs et calcul des incertitudes.")

R = Redac(P[68])
R.puce(("Authenticité : ", "g"), "catalogue signé par le référent, empreintes SHA-256, numéro de version "
       "(un ancien kit, même bien signé, est refusé).")
R.puce(("Échanges : ", "g"), "HTTPS partout ; un jeton par PC et par borne, jamais écrit dans le code "
       "(mémoire NVS sur l’ESP32, fichier protégé par les droits NTFS sur le PC).")
R.puce(("Sûreté de fonctionnement : ", "g"), "téléchargement dans un dossier de préparation, vérification, "
       "puis bascule ; version précédente gardée ; reprise après coupure (BITS).")
R.puce(("Honnêteté de l’état : ", "g"), "un PC ou un serveur muet n’est jamais affiché « à jour » : "
       "« vérification impossible ».")
R.puce(("Limite assumée : ", "g"), "le badge RFID identifie, il ne prouve pas (un badge simple se copie) : "
       "il trace une sortie, il ne contrôle pas un accès.")
R.puce(("Vie privée : ", "g"), "on trace des PC et des versions, pas des personnes. En déploiement réel : "
       "information des salariés et consultation du CSE.")

# ================================================================== 2.3 RESSOURCES
R = Redac(P[73])
R.puce(("Matériel du lycée : ", "g"), "un PC Ubuntu (serveur), 3 PC ou machines virtuelles Windows 11 "
       "(TPM virtuel si besoin, licences à vérifier), un poste « référent », switchs HP ProCurve, routeur "
       "Cisco ISR 4331, point d’accès Wi-Fi, ESP32, thermomètre de référence (laboratoire de physique).")
R.puce(("Matériel à commander (décembre 2026) : ", "g"), "lecteur RC522, badges et étiquettes RFID anti-métal, "
       "capteurs SHT40 et DS18B20, LED, buzzer, boîtier.")
R.puce(("Logiciels : ", "g"), "PowerShell, Visual Studio Code, Python et Flask, nginx, SQLite, Arduino IDE, "
       "Wireshark, Git, OpenSSL (certificats de test).")
R.puce(("Documents : ", "g"), "fiche de présentation signée par le tuteur, documents de modification fictifs, "
       "documentation Microsoft (catalogues de fichiers, signature Authenticode, BITS), fiches techniques "
       "des composants, charte IA du lycée.")
R.puce(("Mesure terrain : ", "g"), "un smartphone en partage de connexion pour mesurer débit, latence et pertes.")

# ================================================================== 3 RÉPARTITION
t = T[4]
cocher(cases(t.cell(1, 0).paragraphs[2])[1])           # étudiant 1 : IR
p = t.cell(1, 0).paragraphs[1]
r = p.add_run("Aziza")
r.bold = True
c1 = t.cell(1, 1)
lst = [
    "Projet individuel : toutes les fonctions.",
    "F1 Publier un kit signé et numéroté",
    "F2 Mettre à jour un PC (agent)",
    "F3 Revenir à la version précédente",
    "F4 Badger la sortie d’un PC (borne)",
    "F5 Suivre le parc, exporter vers Excel",
    "F6 Mesurer et simuler le lien 4G",
    "F7 Temps d’attente anti-condensation",
    "F8 Archive et recherche (V2)",
]
for i, s in enumerate(lst):
    pp = c1.add_paragraph()
    rr = pp.add_run(s)
    rr.font.size = Pt(9.5)
    rr.bold = i == 0
    pp.paragraph_format.space_after = Pt(1)

cell = t.cell(1, 2)
textes = {
    "Installation": "serveur Ubuntu 24.04 (nginx, Flask, SQLite, chrony) ; 3 PC ou VM Windows 11 ; poste du "
                    "référent ; Wireshark, Arduino IDE ; certificats de test.",
    "Mise en œuvre": "borne ESP32 + RC522 + LED + buzzer ; banc de physique (SHT40, DS18B20) ; lien 4G simulé "
                     "(tc netem) réglé avec une vraie mesure de partage de connexion.",
    "Configuration": "HTTPS, NTP, tâche planifiée, stratégie AllSigned, BITS, jetons des appareils, droits NTFS ; "
                     "exploitation du réseau en place (adressage, DHCP, DNS, NTP, captures).",
    "Réalisation": "scripts PowerShell de publication et agent (paliers simulation / confirmation / automatique) ; "
                   "API Flask, tableau de bord et export CSV ; programme de la borne ; archive (V2) ; expériences "
                   "de physique ; recette T01 à T15.",
    "Documentation": "dossier technique, mode opératoire « sans connexion », tableau « température → temps "
                     "d’attente », cahier de recette avec preuves, journal de bord et journal IA, support d’oral.",
}
for p in cell.paragraphs:
    for k, v in textes.items():
        if p.text.startswith(k):
            for r in p.runs:
                if "A remplir" in r.text:
                    ecrire_run(r, v, taille=9.5)
for row in (2, 3, 4):
    pp = t.cell(row, 1).paragraphs[0]
    rr = pp.add_run("  — sans objet (projet individuel)")
    rr.italic = True
    rr.font.size = Pt(9)

# ================================================================== 4 COMPÉTENCES
t = T[5]
for row in range(2, 6):
    cocher(cases(t.cell(row, 2).paragraphs[0])[0])
R = Redac(P[87], attendu="")
R.titre("Comment chaque compétence est évaluée pour Aziza")
R.puce(("C01 Communiquer : ", "g"), "revues de projet, échanges avec le tuteur, mode opératoire, dossier technique, soutenance.")
R.puce(("C03 Gérer un projet : ", "g"), "planning, journal de bord, passage V1 → V2 décidé en revue, suivi des risques et du budget.")
R.puce(("C08 Coder : ", "g"), "PowerShell (agent, publication), Python Flask et SQL (serveur), C++ sur ESP32 (borne).")
R.puce(("C10 Exploiter un réseau : ", "g"), "exploitation du réseau en place : adressage, DHCP, DNS, NTP, HTTPS ; "
       "captures Wireshark (TLS, téléchargements partiels BITS) ; mesure d’un vrai partage de connexion et "
       "reproduction avec netem ; suivi du parc sur le tableau de bord.")
R.puce(("Physique : ", "g"), "étalonnage des capteurs, incertitudes, modèle de refroidissement et point de rosée "
       "confrontés aux mesures (plan B : distance de lecture des étiquettes RFID).")

# ================================================================== 5 PLANNING
dates = {
    94: "lundi 4 janvier 2027",
    95: "vendredi 29 janvier 2027 – cahier des charges validé, architecture, serveur et kit signé démontrés",
    96: "vendredi 19 mars 2027 – agent V1 sur un PC par le lien 4G simulé, mesures réseau, capteurs étalonnés",
    97: "vendredi 14 mai 2027 – V1 recettée, V2 (archive), démonstration complète",
    98: "vendredi 14 mai 2027, avec la revue 3",
    99: "juin 2027, date fixée par l’académie",
}
for i, v in dates.items():
    r = P[i].add_run(" : " + v)
    r.bold = True
r = P[99].add_run("   (dates des revues à confirmer selon le calendrier d’alternance)")
r.italic = True
r.font.size = Pt(9)
R = Redac(P[101])
R.image(IMG("5_gantt"), 18.0, "Diagramme de Gantt prévisionnel (barres colorées selon la compétence principale travaillée).")
for i in range(102, 122):                               # lignes vides réservées au Gantt
    P[i]._p.getparent().remove(P[i]._p)

# ================================================================== 6 ÉVALUATION
cocher(cases(P[125])[0])                                 # équipement disponible : oui
R2 = nouveau_par_apres(P[125], "No Spacing")
rr = R2.add_run("Matériel du lycée ; petits composants à commander en décembre 2026 ; licences Windows 11 à vérifier "
                "(sinon machines virtuelles avec TPM virtuel).")
rr.italic = True
rr.font.size = Pt(9.5)

R = Redac(P[129])
R.texte("Lors d’une démonstration sur la maquette, devant le tuteur et le jury :")
R.puce("Trois PC Windows 11 passent d’un ancien kit au nouveau ", ("sans aucune action manuelle", "g"),
       " ; seuls les fichiers modifiés sont téléchargés (volume comparé à une copie complète).")
R.puce("Un fichier modifié d’un seul octet, un kit signé par un autre certificat et un ancien kit bien signé sont ",
       ("tous refusés", "g"), ".")
R.puce("Une coupure du réseau pendant un téléchargement : ", ("reprise puis vérification sans erreur", "g"), ".")
R.puce("Retour à la version précédente en ", ("moins de 2 minutes", "g"), ".")
R.puce("Borne : voyant vert ou rouge en ", ("moins de 5 secondes", "g"), ", 100 % des sorties enregistrées ; "
       "serveur arrêté → « vérification impossible ».")
R.puce("Tableau de bord à jour et ", ("export CSV ouvert dans Excel", "g"), ".")
R.puce("V2 : une ancienne version d’un document retrouvée en ", ("moins d’une minute", "g"), ".")
R.puce("Physique : un tableau « température extérieure → temps d’attente » justifié par le modèle et les mesures.")
R.puce("Le tuteur confirme que la solution et le mode opératoire répondent aux deux besoins du service.")

# ================================================================== MISE EN PAGE
# lignes vides qui créaient des pages blanches (avant un saut de page)
for i in (31, 74, 75, 76):
    if not P[i].text.strip():
        P[i]._p.getparent().remove(P[i]._p)
# tableau de répartition : enlever les lignes vides de la cellule de l'étudiant 1
for p in list(T[4].cell(1, 2).paragraphs):
    if not p.text.strip():
        p._p.getparent().remove(p._p)
for p in T[4].cell(1, 2).paragraphs:
    p.paragraph_format.space_after = Pt(4)
# 1.3 : ne pas couper le tableau du domaine, garder le titre avec lui
for i in (41, 42):
    P[i].paragraph_format.keep_with_next = True
trpr = T[3].rows[0]._tr.get_or_add_trPr()
trpr.append(OxmlElement("w:cantSplit"))

d.save(SORTIE)
print("Écrit :", SORTIE)
