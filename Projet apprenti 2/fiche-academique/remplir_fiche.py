# -*- coding: utf-8 -*-
"""Remplit le formulaire académique « Dossier de présentation et de validation du projet »
pour l’apprenti 2 (Yaksan), en gardant la mise en page officielle.

Usage :
  python3 schemas.py && node rendu.js      # schémas SVG -> PNG
  python3 remplir_fiche.py                 # DOCX rempli
  soffice --headless --convert-to pdf Fiche_presentation_E6_Yaksan.docx
"""
import copy
import os

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

ICI = os.path.dirname(os.path.abspath(__file__))
MODELE = os.path.join(ICI, "..", "Fiche presentation projet E6-projet-IR v2.docx")
SORTIE = os.path.join(ICI, "Fiche_presentation_E6_Yaksan.docx")
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
remplacer_marque(T[0].cell(3, 1).paragraphs[0], "Boîte noire du poste", gras=True)

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
r = t.cell(0, 1).paragraphs[-1].add_run(" : Yaksan (apprenti)")
r.bold = True
for c in (2, 3, 4):
    t.cell(0, c).paragraphs[-1].add_run("—")
cocher(cases(t.cell(1, 3).paragraphs[0])[0])          # projet développé : entreprise

c = t.cell(2, 1).paragraphs
cocher(cases(c[0])[0])                                 # commanditaire : oui
ajouter_dans_run(c[1], "Nom", "Ministère de l’Intérieur – service carrière et paye (ressources humaines)")
ajouter_dans_run(c[3], "Contact", "tuteur de l’apprenti (nom et fonction à compléter)")
cocher(cases(c[5])[1])                                 # idée : entreprise
for k in (6, 7):                                       # cahier des charges et suivi : lycée + entreprise
    for case in cases(c[k]):
        cocher(case)
ajouter_dans_run(t.cell(3, 1).paragraphs[0], "Nom de l", "Ministère de l’Intérieur")

# ================================================================== 1.2 PRÉSENTATION
R = Redac(P[38])
R.titre("Contexte")
R.texte("Yaksan est apprenti au support informatique du service carrière et paye d’une administration. Il aide "
        "les usagers et accueille les nouveaux arrivants. Le réseau du service est isolé d’Internet. Le support "
        "reçoit deux plaintes récurrentes : des ", ("mises à jour obligatoires qui échouent", "g"),
        " (environ deux par mois) et une ", ("carte qui dysfonctionne au moment du badgeage", "g"),
        " pour l’accès à la plateforme sécurisée qui contient l’ensemble des logiciels métiers. Dans les deux "
        "cas, on répare « à l’aveugle » (redémarrer, effacer les cookies) sans connaître la cause.")
R.titre("La question de départ")
R.texte("Qui sait ce qui s’est passé ? Windows ne peut rien écrire quand il est coupé net, arrêté de force au "
        "bouton ou figé, et il ne voit pas si la puce d’une carte est alimentée. Il faut donc un ",
        ("témoin extérieur", "g"), ", comme la boîte noire d’un avion, et un outil qui remonte la chaîne "
        "carte → plateforme sécurisée maillon par maillon.")
R.titre("Principe de la solution")
R.texte("Un ", ("boîtier ESP32", "g"), ", posé sans ouvrir le PC et relié seulement par USB, observe les voyants "
        "du poste, le 5 V de l’USB et le courant du lecteur de carte. Il horodate les événements et les garde "
        "même après une coupure. Au redémarrage, des ", ("outils PowerShell", "g"), " croisent ce récit avec les "
        "journaux de Windows et donnent la ", ("cause probable", "g"), ". Un serveur rassemble les conclusions "
        "dans des tableaux de bord pour le support.")
R.image(IMG("0_synoptique"), 17.6, "Synoptique de l’architecture (maquette de démonstration).")
R.titre("Progression du projet")
R.puce(("V1 (obligatoire, ≈ 95 h) : ", "g"), "boîtier (voyants, 5 V, battement), récit conservé après une "
       "coupure, corrélateur des pannes, serveur minimal.")
R.puce(("V2 (visée, ≈ 135 h) : ", "g"), "diagnostic de la chaîne carte (courant du lecteur, 5 maillons, heure), "
       "remèdes à paliers, LED de prévention pendant les mises à jour, accueil des arrivants, libre-service, sécurité.")
R.puce(("Extensions : ", "g"), "température de sortie d’air, compteur d’insertions du lecteur, écran bleu, "
       "lien avec l’outil de tickets.")
R.titre("Limites de l’étude")
R.puce("Maquette de démonstration : aucun accès au réseau, à l’annuaire (géré par une autre équipe) ni aux "
       "applications du service ; aucune donnée de carrière ou de paye.")
R.puce("Cartes PIV de laboratoire seulement, jamais de carte d’agent ; aucun nom d’agent ni identifiant de carte stocké.")
R.puce("Le PC n’est jamais ouvert : capteurs collés sur la façade ; boîtier sans Wi-Fi ni Bluetooth.")
R.puce("Le contrôleur de domaine commun de la maquette est utilisé, pas administré.")
R.titre("Attentes du client")
R.puce("Connaître la cause réelle d’une panne ou d’une mise à jour ratée au lieu de réparer à l’aveugle.")
R.puce("Trouver vite le maillon en panne quand la carte n’est pas reconnue.")
R.puce("Moins d’arrêts forcés pendant les mises à jour et des arrivants opérationnels dès le premier jour.")
R.puce("Des statistiques sur les causes, pour agir sur les pannes qui reviennent.")

# ================================================================== 1.3 DOMAINE
cell = T[3].cell(0, 1)
RETENUS = ("Internet des objets", "cybersécurité", "embarquée", "centres de services")
from docx.text.run import Run
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
R.puce(("Besoin 1 – ", "g"), "comprendre et réduire les mises à jour obligatoires qui échouent sur les postes.")
R.puce(("Besoin 2 – ", "g"), "diagnostiquer vite les dysfonctionnements de la carte au badgeage pour l’accès à la plateforme sécurisée des logiciels métiers.")
R.puce(("Besoin 3 – ", "g"), "mieux accompagner les usagers et les nouveaux arrivants (cœur du métier de l’apprenti).")
R.titre("Hypothèses chiffrées (à valider par le tuteur)")
R.puce("Environ deux mises à jour ratées par mois sur les postes suivis.")
R.puce("Les échecs de carte sont aujourd’hui traités sans diagnostic (redémarrage, effacement des cookies).")
R.puce("Type de carte (à contacts ou sans contact) et produits du ministère à confirmer.")
R.titre("Exigences et indicateurs mesurés sur la maquette")
R.tableau(
    ["Exigence", "Indicateur mesuré", "Vérification", "Étape"],
    [
        ["E1 – Témoigner", "Arrêt normal, coupure, arrêt forcé, système figé : au moins 19 pannes sur 20 bien classées", "20 pannes provoquées", "V1"],
        ["E2 – Mémoire", "Récit horodaté conservé après une coupure secteur ; réserve d’énergie suffisante (≈ 25 s estimées)", "coupures + essai P3", "V1"],
        ["E3 – Expliquer", "Mise à jour ratée : cause probable donnée, ou « non concluant » si les sources ne sont pas d’accord", "mises à jour interrompues", "V1"],
        ["E4 – Chaîne carte", "100 % des maillons en panne désignés sur la maquette (carte, lecteur, Windows, logiciel, navigateur, heure)", "pannes provoquées", "V2"],
        ["E5 – Prévenir", "LED orange pendant une mise à jour ; arrêts forcés en baisse", "mesure avant / après", "V2"],
        ["E6 – Accompagner", "Chaîne carte → portail testée le premier jour ; message simple en libre-service ; temps de résolution d’un incident carte réduit", "scénarios d’accueil", "V2"],
        ["E7 – Sécurité", "Faux boîtier démasqué (HMAC) ; ligne effacée détectée (journal chaîné) ; API avec jeton et TLS", "démonstration d’attaque", "V2"],
        ["E8 – Physique", "Seuils des voyants, fréquence d’échantillonnage, énergie de secours, seuil « carte vivante », dérive d’horloge", "essais P1 à P6", "V1–V2"],
    ],
    [3.4, 10.0, 3.3, 1.4])
R.titre("Niveaux de sécurité des remèdes")
R.texte("Toute action sur le poste suit trois paliers : ", ("simulation", "g"), " (le remède est seulement proposé), ",
        ("confirmation", "g"), " par le technicien, puis ", ("automatique", "g"), " pour les remèdes sans risque.")

# ================================================================== 2.1 SYSML
R = Redac(P[52])
R.image(IMG("1_exigences"), 17.6, "Figure 1 – Diagramme d’exigences.")
R.image(IMG("2_contexte"), 17.0, "Figure 2 – Diagramme de contexte.")
R.image(IMG("3_cas_utilisation"), 16.5, "Figure 3 – Diagramme des cas d’utilisation.")
R.image(IMG("4_sequence"), 16.5, "Figure 4 – Diagramme de séquence : une mise à jour interrompue par un arrêt forcé.")

# ================================================================== 2.2 CONTRAINTES
R = Redac(P[55])
R.puce("Matériel à acheter : environ ", ("80 à 120 €", "g"), " (prix à confirmer) :")
R.puce("boîtier : phototransistors, INA219, supercondensateur 1 F, horloge DS3231, carte microSD, boîtier ≈ 30 € ;", niveau=1)
R.puce("lecteur de carte USB à contacts ≈ 15 € ; 3 cartes PIV de laboratoire 20 à 40 € ;", niveau=1)
R.puce("rallonge de carte pour observer le signal à l’oscilloscope 15 à 25 €.", niveau=1)
R.puce("PC, serveur, réseau, oscilloscope et licences d’évaluation : fournis par le lycée.")

R = Redac(P[60])
R.puce(("Poste : ", "g"), "Windows 11 physique (vraies coupures et arrêts au bouton), PowerShell signé, tâche planifiée.")
R.puce(("Serveur : ", "g"), "Ubuntu, API Python FastAPI, base SQLite, page web ; portail de labo exigeant un certificat client.")
R.puce(("Boîtier : ", "g"), "ESP32 programmé en C++ (Arduino), relié au poste par USB seulement, sans radio.")
R.puce(("Laboratoire commun : ", "g"), "contrôleur de domaine Windows Server (évaluation) avec DNS, NTP et autorité "
       "de certification de labo, préparé une fois pour plusieurs apprentis.")
R.puce(("Réseau : ", "g"), "réseau du lycée isolé d’Internet, exploité tel quel (switchs HP ProCurve, routeur "
       "Cisco ISR 4331) : DNS, Kerberos, LDAP, SMB, NTP, TLS ; aucun VLAN ni ACL à créer.")
R.puce(("Interdits : ", "g"), "pas de câblage 230 V (coupures faites sur une multiprise à interrupteur), pas de caméra, "
       "aucune donnée réelle.")

R = Redac(P[64])
R.puce(("150 heures", "g"), " de janvier à mai 2027 ; trois revues de projet (fin janvier, mi-mars, mi-mai).")
R.puce("Code commenté et versionné (Git) ; essais reproductibles avec un protocole écrit et des preuves "
       "(captures, journaux, mesures).")
R.puce("Journal de bord et journal d’usage de l’IA (charte IA du lycée).")
R.puce("Mesures de physique avec incertitudes (P1 à P6).")

R = Redac(P[68])
R.puce(("Authenticité du boîtier : ", "g"), "défi-réponse HMAC ; un faux boîtier est démasqué.")
R.puce(("Intégrité du récit : ", "g"), "journal chaîné ; une ligne effacée ou modifiée est détectée.")
R.puce(("Surface d’attaque réduite : ", "g"), "pas de radio sur le boîtier ; scripts PowerShell signés.")
R.puce(("Échanges : ", "g"), "API avec jeton et TLS ; file d’attente si le serveur est arrêté.")
R.puce(("Sûreté : ", "g"), "remèdes à trois paliers ; le corrélateur répond « non concluant » plutôt que de se tromper.")
R.puce(("Vie privée : ", "g"), "aucune donnée personnelle, aucun nom d’agent ni identifiant de carte stocké.")
R.puce(("Risque à lever : ", "g"), "le boîtier USB doit être accepté par la sécurité du service (pilote sur quelques "
       "postes) ; le diagnostic carte reste utilisable seul.")

# ================================================================== 2.3 RESSOURCES
R = Redac(P[73])
R.puce(("Matériel du lycée : ", "g"), "PC Ubuntu (serveur et contrôleur de domaine virtualisé), poste Windows 11 "
       "physique, switchs HP ProCurve, routeur Cisco ISR 4331, ESP32, oscilloscope, multimètre.")
R.puce(("Matériel à commander (décembre 2026) : ", "g"), "phototransistors, INA219, supercondensateur, DS3231, "
       "microSD, lecteur de carte USB, cartes PIV de laboratoire, rallonge de carte.")
R.puce(("Logiciels : ", "g"), "PowerShell, Visual Studio Code, Python et FastAPI, SQLite, Arduino IDE, Wireshark, "
       "Git, certutil, OpenSSL ; Windows Server en version d’évaluation.")
R.puce(("Documents : ", "g"), "fiche de présentation validée par le tuteur, documentation Microsoft (journaux "
       "Kernel-Power, Windows Update, cartes à puce), fiches techniques des composants, norme de l’ATR (ISO 7816), "
       "charte IA du lycée.")

# ================================================================== 3 RÉPARTITION
t = T[4]
cocher(cases(t.cell(1, 0).paragraphs[2])[1])           # étudiant 1 : IR
r = t.cell(1, 0).paragraphs[1].add_run("Yaksan")
r.bold = True
c1 = t.cell(1, 1)
lst = [
    "Projet individuel : toutes les fonctions.",
    "F1 Enregistrer les événements du poste",
    "F2 Conserver le récit après coupure",
    "F3 Donner la cause d’une panne",
    "F4 Diagnostiquer la chaîne carte (V2)",
    "F5 Prévenir pendant une mise à jour (V2)",
    "F6 Accueil et libre-service (V2)",
    "F7 Tableaux de bord du support",
    "F8 Sécuriser boîtier, récit et API",
]
for i, s in enumerate(lst):
    pp = c1.add_paragraph()
    rr = pp.add_run(s)
    rr.font.size = Pt(9.5)
    rr.bold = i == 0
    pp.paragraph_format.space_after = Pt(1)
textes = {
    "Installation": "serveur Ubuntu (FastAPI, SQLite, page web), portail de labo à certificat client, poste "
                    "Windows 11, lecteur et cartes PIV de labo (certificats émis par l’autorité de labo).",
    "Mise en œuvre": "boîtier ESP32 : phototransistors sur les voyants, mesure du 5 V, INA219 sur le lecteur, "
                     "DS3231, microSD, supercondensateur, LED ; USB instrumenté.",
    "Configuration": "tâche planifiée et signature des scripts, jeton de l’API, TLS, NTP ; exploitation du réseau "
                     "en place (DNS, Kerberos, LDAP, SMB, NTP, TLS mutuel) et captures Wireshark.",
    "Réalisation": "firmware du boîtier (récit chaîné, HMAC), agent de battement et collecteur PowerShell, "
                   "corrélateur, diagnostic carte à 5 maillons et remèdes à paliers, serveur et tableaux de bord, "
                   "essais de physique P1 à P6, démonstration d’attaque.",
    "Documentation": "dossier technique, règles du corrélateur, guide d’accueil d’un arrivant, message de "
                     "libre-service, protocoles d’essais et preuves, journal de bord et journal IA, support d’oral.",
}
for p in t.cell(1, 2).paragraphs:
    for k, v in textes.items():
        if p.text.startswith(k):
            for r in p.runs:
                if "A remplir" in r.text:
                    ecrire_run(r, v, taille=9.5)
for row in (2, 3, 4):
    rr = t.cell(row, 1).paragraphs[0].add_run("  — sans objet (projet individuel)")
    rr.italic = True
    rr.font.size = Pt(9)

# ================================================================== 4 COMPÉTENCES
t = T[5]
for row in range(2, 6):
    cocher(cases(t.cell(row, 2).paragraphs[0])[0])
R = Redac(P[87], attendu="")
R.titre("Comment chaque compétence est évaluée pour Yaksan")
R.puce(("C01 Communiquer : ", "g"), "revues de projet, échanges avec le tuteur, guide d’accueil, message de "
       "libre-service, dossier technique, soutenance.")
R.puce(("C03 Gérer un projet : ", "g"), "planning, journal de bord, passage V1 → V2 décidé en revue, suivi des risques et du budget.")
R.puce(("C08 Coder : ", "g"), "C++ sur ESP32 (boîtier), PowerShell (agent, collecteur, corrélateur, diagnostic), "
       "Python FastAPI et SQL (serveur).")
R.puce(("C10 Exploiter un réseau : ", "g"), "DNS, Kerberos, LDAP, SMB et NTP vers le contrôleur de domaine ; "
       "captures du TLS mutuel (certificat client visible en TLS 1.2, chiffré en TLS 1.3) ; échec TLS si le "
       "certificat est expiré ou l’horloge décalée ; HTTPS vers l’API avec file d’attente.")
R.puce(("Physique : ", "g"), "P1 voyants, P2 échantillonnage, P3 énergie de secours, P4 carte vivante, P5 signal "
       "de la carte (ATR), P6 dérive des horloges ; mesures, modèles et incertitudes.")

# ================================================================== 5 PLANNING
dates = {
    94: "lundi 4 janvier 2027",
    95: "vendredi 29 janvier 2027 – cahier des charges validé, laboratoire prêt, premier boîtier",
    96: "vendredi 19 mars 2027 – boîtier, récit et corrélateur démontrés sur des pannes provoquées",
    97: "vendredi 14 mai 2027 – V1 recettée, V2 (chaîne carte, prévention, accueil, sécurité)",
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
R.image(IMG("5_gantt"), 18.0, "Diagramme de Gantt prévisionnel (heures de la synthèse ; couleur = compétence principale).")
for i in range(102, 122):
    P[i]._p.getparent().remove(P[i]._p)

# ================================================================== 6 ÉVALUATION
cocher(cases(P[125])[0])
R2 = nouveau_par_apres(P[125], "No Spacing")
rr = R2.add_run("Matériel du lycée ; composants du boîtier, lecteur et cartes de labo à commander en décembre 2026 ; "
                "Windows Server en version d’évaluation.")
rr.italic = True
rr.font.size = Pt(9.5)

R = Redac(P[129])
R.texte("Lors d’une démonstration sur la maquette, devant le tuteur et le jury :")
R.puce("Sur 20 pannes provoquées (arrêt normal, coupure, arrêt au bouton, système figé), ",
       ("au moins 19 sont bien classées", "g"), ", et le récit survit à la coupure.")
R.puce("Une mise à jour interrompue par un arrêt forcé est ", ("expliquée", "g"), " par le corrélateur "
       "(ou déclarée « non concluante » si les sources divergent).")
R.puce("Pour chaque maillon de la chaîne carte mis en panne, le diagnostic ", ("désigne le bon maillon", "g"),
       " et propose un remède à paliers.")
R.puce("Pendant une mise à jour, la LED orange s’allume ; le nombre d’arrêts forcés ", ("baisse", "g"), " (mesure avant / après).")
R.puce("Un faux boîtier est ", ("démasqué", "g"), " et une ligne effacée du récit est ", ("détectée", "g"), ".")
R.puce("Le technicien lit la cause probable sur la page web ; les tableaux de bord montrent les causes et les maillons en panne.")
R.puce("Le tuteur confirme que le diagnostic et le guide d’accueil répondent aux besoins du support.")

# ================================================================== MISE EN PAGE
for i in (31, 74, 75, 76):
    if not P[i].text.strip():
        P[i]._p.getparent().remove(P[i]._p)
for p in list(T[4].cell(1, 2).paragraphs):
    if not p.text.strip():
        p._p.getparent().remove(p._p)
for p in T[4].cell(1, 2).paragraphs:
    p.paragraph_format.space_after = Pt(4)
for i in (41, 42):
    P[i].paragraph_format.keep_with_next = True
T[3].rows[0]._tr.get_or_add_trPr().append(OxmlElement("w:cantSplit"))

d.save(SORTIE)
print("Écrit :", SORTIE)
