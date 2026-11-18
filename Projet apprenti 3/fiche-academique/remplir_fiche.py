# -*- coding: utf-8 -*-
"""Remplit le formulaire académique « Dossier de présentation et de validation du projet »
pour l’apprenti 3 (Lorenzo), en gardant la mise en page officielle.

Usage :
  python3 schemas.py && node rendu.js      # schémas SVG -> PNG
  python3 remplir_fiche.py                 # DOCX rempli
  soffice --headless --convert-to pdf Fiche_presentation_E6_Lorenzo.docx
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
SORTIE = os.path.join(ICI, "Fiche_presentation_E6_Lorenzo.docx")
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
remplacer_marque(T[0].cell(3, 1).paragraphs[0], "Poste attentif", gras=True)

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
r = t.cell(0, 1).paragraphs[-1].add_run(" : Lorenzo (apprenti)")
r.bold = True
for c in (2, 3, 4):
    t.cell(0, c).paragraphs[-1].add_run("—")
cocher(cases(t.cell(1, 3).paragraphs[0])[0])          # projet développé : entreprise
c = t.cell(2, 1).paragraphs
cocher(cases(c[0])[0])
ajouter_dans_run(c[1], "Nom", "DGFiP de Bobigny")
ajouter_dans_run(c[2], "Adresse", "8 rue Michel de l’Hospital, 93000 Bobigny")
ajouter_dans_run(c[3], "Contact", "Mathurin TOURET, CID 93 (tuteur)")
cocher(cases(c[5])[1])
for k in (6, 7):
    for case in cases(c[k]):
        cocher(case)
ajouter_dans_run(t.cell(3, 1).paragraphs[0], "Nom de l", "DGFiP de Bobigny")
ajouter_dans_run(t.cell(3, 1).paragraphs[1], "Adresse", "8 rue Michel de l’Hospital, 93000 Bobigny")
for r in t.cell(3, 1).paragraphs[2].runs:
    r.text = r.text.replace("http://", "")
ajouter_dans_run(t.cell(3, 1).paragraphs[3], "Tel", "01.88.50.92.20")
ajouter_dans_run(t.cell(3, 1).paragraphs[3], "\tMail", "mathurin.touret@dgfip.finances.gouv.fr")

# ================================================================== 1.2 PRÉSENTATION
R = Redac(P[38])
R.titre("Contexte")
R.texte("Lorenzo est apprenti dans une administration qui traite des données couvertes par le secret "
        "professionnel. Il intervient surtout sur les postes des ", ("employés de bureau", "g"), " (bureaux "
        "partagés, plateaux ouverts), et aussi sur quelques postes d’accueil qui reçoivent du public. Il prépare "
        "les postes à partir de l’image Windows 11 de l’administration, ouvre les premières sessions des nouveaux agents et "
        "installe écrans et imprimantes avec ses collègues, sans droits d’administrateur. Le parc est fait de portables, posés "
        "sur une station d’accueil au bureau et parfois emportés à domicile. L’annuaire (AD) et les stratégies de groupe sont "
        "gérés au niveau national, hors du site.")
R.titre("Le problème")
R.texte(("Quand l’agent quitte son poste, l’ordinateur ne le sait pas.", "g"), " Il voit seulement si l’on touche "
        "le clavier. Première conséquence : ", ("la session reste ouverte", "g"), " jusqu’au blocage automatique, "
        "après environ 10 minutes. Pendant ce temps, un collègue non habilité, un visiteur ou un prestataire peut "
        "lire un dossier, ou agir au nom de l’agent. Aux postes d’accueil, c’est le public qui voit l’écran. "
        "Deuxième conséquence : ", ("les mises à jour dérangent", "g"), " : une fenêtre demande « installer "
        "maintenant ? oui / non » ; après 2 ou 3 refus, l’installation est imposée, souvent devant l’agent. Ses vraies "
        "absences (réunion, déjeuner) restent inutilisées. Inactif ne veut pas dire absent.")
R.titre("Principe de la solution")
R.texte("Trois parties, chacune avec son rôle. ", ("L’ESP32 s’occupe du monde physique", "g"), " : un boîtier "
        "(radar 24 GHz, lumière tricolore) posé sur le bureau et branché en USB dit chaque seconde si quelqu’un est assis, "
        "même immobile (le radar voit la respiration, sans aucune image) ; chaque message est signé. ",
        ("PowerShell s’occupe de Windows", "g"), " : un service local verrouille la session quelques secondes après le "
        "départ, avec un avertissement orange, ", ("sans dépendre du serveur ni du réseau", "g"), " ; un agent relève "
        "l’état du poste (redémarrage en attente, version de Windows). ", ("Le serveur Ubuntu centralise", "g"),
        " : une API Python reçoit les états et les événements, un tableau de bord les affiche. En V2, la maintenance "
        "imposée après 2 reports se fait ", ("à la prochaine absence", "g"), ", jamais devant l’agent.")
R.image(IMG("0_synoptique"), 17.6, "Synoptique de l’architecture (maquette de démonstration).")
R.titre("Progression du projet")
R.puce(("V1 (obligatoire, ≈ 108 h) : ", "g"), "boîtier, messages signés (faux boîtier refusé), service de présence, "
       "verrou local avec avertissement, filet de sécurité (blocage après inactivité réglé par stratégie locale), "
       "événements envoyés à l’API, essais de physique R1 à R5, exploitation du réseau.")
R.puce(("V2 (visée, ≈ 40 h) : ", "g"), "maintenance en attente faite à la prochaine absence (règle des 2 reports), "
       "retour de l’agent sans perte, agent PowerShell (redémarrage en attente, version de Windows), tableau de bord "
       "du parc, mesure de l’apport (essai R6).")
R.puce(("Extensions : ", "g"), "assistant de réglage, détection d’un radar masqué, mode « hors bureau » complet, "
       "réveil du week-end, autres informations de supervision ; ", ("si le temps le permet", "g"), " : jonction du "
       "poste à un domaine AD de maquette (filet par GPO, mot de passe administrateur géré par LAPS, captures Kerberos et LDAP).")
R.titre("Limites de l’étude")
R.puce("Maquette sur un réseau de laboratoire isolé : aucun accès au système d’information ni à l’annuaire national, "
       "aucune donnée réelle ; Windows Update n’est pas piloté (paquets MSI de test à la place).")
R.puce("Les mises à jour ne contournent pas les règles de l’administration : le projet choisit seulement le moment, "
       "dans les limites fixées par les administrateurs.")
R.puce("La sécurité ne dépend jamais du boîtier seul : débranché ou masqué, le blocage après inactivité reste actif.")
R.puce("Aucune caméra. La présence ne quitte jamais le poste : le serveur ne reçoit ni heures ni durées d’absence.")
R.puce("La maintenance ne ferme aucun logiciel et ne redémarre jamais une session ouverte.")
R.titre("Attentes du client")
R.puce("Un écran protégé en quelques secondes quand l’agent s’éloigne, sans le gêner quand il lit.")
R.puce("Garder la règle « 2 ou 3 refus puis installation imposée », mais l’imposer pendant une absence, plus devant l’agent.")
R.puce("Une vue claire de l’état du parc, sans surveiller les personnes.")

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
R.puce(("Besoin 1 – ", "g"), "ne plus laisser de session ouverte quand l’agent quitte son bureau (collègues, visiteurs, "
       "prestataires ; public aux postes d’accueil).")
R.puce(("Besoin 2 – ", "g"), "faire les mises à jour et maintenances sans déranger les agents, en gardant la règle des refus limités.")
R.titre("Hypothèses chiffrées (fictives, à valider par le tuteur)")
R.puce("40 portables sur station d’accueil, souvent en bureau partagé, dont quelques postes d’accueil ; 6 à 10 départs "
       "du poste par agent et par jour, dont 1 à 2 absences de plus de 20 minutes (réunion, déjeuner).")
R.puce("Blocage actuel après 10 minutes d’inactivité (à confirmer) ; 4 maintenances par poste et par mois ; "
       "2 reports permis, puis installation imposée (règle confirmée par le tuteur : 2 ou 3).")
R.puce("Agents non administrateurs de leur poste (confirmé) ; périphérique USB de type port série autorisé (à confirmer).")
R.titre("Exigences et indicateurs mesurés sur la maquette")
R.tableau(
    ["Exigence", "Indicateur mesuré", "Vérification", "Étape"],
    [
        ["E1 – Bloquer vite", "Écran bloqué quelques secondes après le départ, au lieu de 10 minutes (avec incertitude)", "R4, T01", "V1"],
        ["E2 – Ne pas gêner", "Aucun blocage pendant 30 min de travail assis, dont 10 min de lecture sans clavier ; retour pendant l’orange = annulation", "T02, T03", "V1"],
        ["E3 – Agent seul", "Le collègue du bureau voisin ou une personne qui passe n’est pas compté : agent parti, écran bloqué", "R2, R3, T04", "V1"],
        ["E4 – Vrai boîtier", "Chaque message signé ; faux boîtier démasqué ; enrôlement seulement avec appui physique", "T06, T19, T20", "V1"],
        ["E5 – Filet de sécurité", "Boîtier débranché ou radar masqué : alerte, blocage après inactivité (stratégie locale) toujours actif", "T05", "V1"],
        ["E6 – Maintenir au bon moment", "Après 2 reports, maintenance faite à la prochaine absence, jamais devant l’agent ; retour au milieu sans perte ; nombre d’installations évitées, mesuré", "T07–T11, R6", "V2"],
        ["E7 – Vie privée", "Aucune heure ni durée d’absence dans la base du serveur", "T23", "V1–V2"],
        ["E8 – Données du parc", "Tableau de bord : verrouillages et reports par poste, redémarrages en attente, version de Windows", "démonstration", "V2"],
        ["E9 – Verrou autonome", "Serveur arrêté ou câble réseau débranché : la session se verrouille quand même", "T12", "V1"],
    ],
    [3.6, 10.0, 3.1, 1.4])
R.titre("Niveaux de sécurité")
R.texte("Tout ce qui agit sur un poste suit trois paliers : ", ("simulation", "g"), " (journalise ce qui serait fait), ",
        ("confirmation", "g"), " humaine, puis ", ("automatique", "g"), " après recette. Cela vaut pour les "
        "maintenances imposées à la prochaine absence.")

# ================================================================== 2.1 SYSML
R = Redac(P[52])
R.image(IMG("1_exigences"), 17.6, "Figure 1 – Diagramme d’exigences.")
R.image(IMG("2_contexte"), 17.0, "Figure 2 – Diagramme de contexte.")
R.image(IMG("3_cas_utilisation"), 16.5, "Figure 3 – Diagramme des cas d’utilisation.")
R.image(IMG("4_sequence"), 16.5, "Figure 4 – Diagramme de séquence : départ, blocage, installation pendant l’absence, retour.")

# ================================================================== 2.2 CONTRAINTES
R = Redac(P[55])
R.puce("Matériel à acheter : ", ("environ 25 € (minimal) à 60 € (confort)", "g"), ", prix à confirmer : 2 radars "
       "LD2410 (dont un de secours), LED RVB, résistances, boîtier plastique ; wattmètre et INA219 en option.")
R.puce("PC, serveur, réseau et oscilloscope : fournis par le lycée. Logiciels libres ; Windows 11 "
       "en version d’évaluation gratuite (aucune licence à acheter).")

R = Redac(P[60])
R.puce(("Poste : ", "g"), "Windows 11 Entreprise en évaluation (90 jours), en machine virtuelle VirtualBox sur un PC "
       "Ubuntu, hors domaine (groupe de travail ; le domaine AD est une extension) ; radar transmis par USB à la machine virtuelle ; réinstallation prévue "
       "début avril (fin des 90 jours), après export des journaux et des mesures ; service PowerShell au compte "
       "SYSTÈME (présence, états du poste) ; le verrou est fait par un petit programme lancé dans la session de l’agent "
       "(tâche planifiée à l’ouverture de session), car un service ne peut pas verrouiller une session lui-même ; "
       "journal dédié, stratégie AllSigned ; déploiement avec PSAppDeployToolkit.")
R.puce(("Serveur : ", "g"), "Ubuntu Server, API Python FastAPI (états et événements des postes), base SQLite, tableau de bord web, "
       "partage Samba des paquets MSI de test.")
R.puce(("Boîtier : ", "g"), "ESP32 programmé en C++ (Arduino) ; radar LD2410 en liaison série à 256 000 bauds ; "
       "messages signés en HMAC-SHA256.")
R.puce(("Réseau : ", "g"), "réseau de laboratoire isolé (switchs HP ProCurve, routeur Cisco ISR 4331), exploité "
       "tel quel : DHCP, DNS et NTP fournis par le routeur. Aucun VLAN ni ACL à créer. En extension : un domaine AD de "
       "maquette, si le temps le permet.")
R.puce(("Interdits : ", "g"), "pas de câblage 230 V (alimentation USB 5 V), pas de caméra, aucune donnée réelle.")

R = Redac(P[64])
R.puce(("Environ 150 heures", "g"), " de janvier à mai 2027 : V1 ≈ 108 h, V2 ≈ 40 h, marge ≈ 2 h ; trois revues "
       "(fin janvier, mi-mars, mi-mai).")
R.puce("Code commenté et versionné (Git) ; recette T01 à T24 avec procès-verbal et preuves.")
R.puce("Journal de bord et journal d’usage de l’IA (charte IA du lycée).")
R.puce("Mesures de physique avec incertitudes ; chaque réglage (distance, délais) justifié par une mesure.")

R = Redac(P[68])
R.puce(("Boîtier authentique : ", "g"), "clé créée par le boîtier à l’enrôlement (appui physique), chaque "
       "message signé avec un compteur ; un faux boîtier est démasqué.")
R.puce(("Échec sûr : ", "g"), "radar masqué ou débranché = absent ou anomalie ; blocage après inactivité (stratégie "
       "locale) toujours actif.")
R.puce(("Poste : ", "g"), "journal dédié en écriture SYSTÈME seulement ; agents non administrateurs ; mot de "
       "passe administrateur local fort, jamais écrit dans un script (Windows LAPS en extension, avec le "
       "domaine) ; scripts signés.")
R.puce(("Installations : ", "g"), "empreinte SHA-256 vérifiée ; logiciel ouvert = report ; jamais de redémarrage "
       "avec une session ouverte.")
R.puce(("Serveur : ", "g"), "HTTPS, jeton par poste stocké haché, requêtes SQL paramétrées, page web authentifiée.")
R.puce(("Vie privée : ", "g"), "présence gardée sur le poste ; résultats datés au jour ; en entreprise, avis du "
       "délégué à la protection des données et information des agents avant tout pilote.")

# ================================================================== 2.3 RESSOURCES
R = Redac(P[73])
R.puce(("Matériel du lycée : ", "g"), "PC Ubuntu avec VirtualBox (machines virtuelles du serveur et du "
       "poste Windows 11, 16 Go de mémoire conseillés), switchs HP ProCurve, routeur Cisco ISR 4331, ESP32 (dont un « faux boîtier »), "
       "oscilloscope, multimètre.")
R.puce(("Matériel à commander (décembre 2026) : ", "g"), "radars LD2410, LED RVB, boîtier plastique, petite "
       "plaque métallique pour les essais.")
R.puce(("Logiciels : ", "g"), "PowerShell, Visual Studio Code, Python et FastAPI, SQLite, Samba, Arduino IDE, "
       "Wireshark, Git ; VirtualBox ; Windows 11 Entreprise en évaluation (90 jours) ; paquets MSI de logiciels libres.")
R.puce(("Documents : ", "g"), "fiche de présentation validée par le tuteur, documentation du module LD2410, "
       "Microsoft Learn (Planificateur de tâches, msiexec, audit, stratégie de sécurité locale), recommandations de la CNIL, charte IA du lycée.")

# ================================================================== 3 RÉPARTITION
t = T[4]
cocher(cases(t.cell(1, 0).paragraphs[2])[1])
r = t.cell(1, 0).paragraphs[1].add_run("Lorenzo")
r.bold = True
c1 = t.cell(1, 1)
lst = [
    "Projet individuel : toutes les fonctions.",
    "F1 Détecter la présence (radar)",
    "F2 Avertir puis verrouiller (local, sans serveur)",
    "F3 Prouver que le boîtier est le vrai",
    "F4 Garder le filet de sécurité",
    "F5 Remonter événements et états à l’API",
    "F6 Maintenance à la prochaine absence (V2)",
    "F7 Tableau de bord du parc (V2)",
    "F8 Protéger la vie privée",
]
for i, s in enumerate(lst):
    pp = c1.add_paragraph()
    rr = pp.add_run(s)
    rr.font.size = Pt(9.5)
    rr.bold = i == 0
    pp.paragraph_format.space_after = Pt(1)
textes = {
    "Installation": "serveur Ubuntu (FastAPI, SQLite, Samba), poste Windows 11 de test, paquets MSI de test, "
                    "outils de développement et de capture.",
    "Mise en œuvre": "boîtier de présence (radar LD2410, ESP32, LED RVB) posé sur le bureau, face au siège, branché sur la station d’accueil ; "
                     "réglage de la zone de détection à partir des mesures.",
    "Configuration": "journal dédié protégé, tâches « sur événement », stratégie AllSigned, jetons et TLS de "
                     "l’API ; stratégie locale du poste (blocage après inactivité, audit 4800/4801) ; exploitation "
                     "du réseau en place.",
    "Réalisation": "firmware du boîtier, service de présence (machine à états), messages signés et enrôlement, "
                   "programme de verrou dans la session, agent PowerShell (états), API et tableau de bord du parc, maintenance à la prochaine absence, essais R1 à R6, recette T01 à T24.",
    "Documentation": "dossier technique, procédure d’enrôlement, protocoles et résultats des essais, procès-verbal "
                     "de recette, journal de bord et journal IA, support d’oral.",
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
R.titre("Comment chaque compétence est évaluée pour Lorenzo")
R.puce(("C01 Communiquer : ", "g"), "revues de projet, échanges avec le tuteur (besoin chiffré), procédure "
       "d’enrôlement, dossier technique, soutenance avec démonstration.")
R.puce(("C03 Gérer un projet : ", "g"), "planning, journal de bord, passage V1 → V2 décidé en revue, suivi des "
       "risques (vie privée, USB, fausses détections) et du budget.")
R.puce(("C08 Coder : ", "g"), "C++ sur ESP32 (lecture des trames radar, HMAC), PowerShell (service, tâches, "
       "verrou dans la session, agent d’état, PSAppDeployToolkit), Python FastAPI et SQL (API, tableau de bord).")
R.puce(("C10 Exploiter un réseau : ", "g"), "bail DHCP et nom DNS du poste et du serveur, heure NTP commune et "
       "dérive d’horloge mesurée, HTTPS vers l’API (poignée de main TLS), téléchargement SMB d’un paquet : débit "
       "mesuré comparé au débit du lien ; captures Wireshark commentées. En extension : jonction au domaine "
       "(Kerberos, LDAP, échec Kerberos avec une horloge décalée).")
R.puce(("Physique : ", "g"), "radar FMCW (λ, ΔR = c/2B, micro-mouvements, Doppler) ; R1 seuils, R2–R3 zone, "
       "R4 délai de détection, R5 fausses alertes, avec incertitudes ; exposition aux ondes (calcul majorant).")

# ================================================================== 5 PLANNING
dates = {
    94: "lundi 4 janvier 2027",
    95: "vendredi 29 janvier 2027 – besoin chiffré validé, maquette prête, le radar détecte (premiers essais R1)",
    96: "vendredi 19 mars 2027 – V1 complète : verrou local avec avertissement, faux boîtier refusé, événements sur le serveur, essais R1 à R5",
    97: "vendredi 14 mai 2027 – V2 : maintenance à la prochaine absence, tableau de bord du parc, apport mesuré (R6)",
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
R.image(IMG("5_gantt"), 18.0, "Diagramme de Gantt prévisionnel (couleur = compétence principale travaillée).")
for i in range(102, 122):
    P[i]._p.getparent().remove(P[i]._p)

# ================================================================== 6 ÉVALUATION
cocher(cases(P[125])[0])
R2 = nouveau_par_apres(P[125], "No Spacing")
rr = R2.add_run("Matériel du lycée ; radars et petits composants à commander en décembre 2026 ; "
                "poste Windows 11 en évaluation (90 jours), réinstallé début avril.")
rr.italic = True
rr.font.size = Pt(9.5)

R = Redac(P[129])
R.texte("Lors d’une démonstration sur la maquette, devant le tuteur et le jury :")
R.puce("L’agent lit sans toucher au clavier : ", ("rien ne se passe", "g"), ".")
R.puce("L’agent se lève : lumière orange, puis ", ("écran bloqué en quelques secondes", "g"),
       " (délai mesuré, comparé aux 10 minutes actuelles) ; un collègue au bureau voisin ou qui passe "
       "derrière ne change rien.")
R.puce("Un faux boîtier qui dit toujours « présent » est ", ("démasqué", "g"), " ; boîtier débranché : le blocage après inactivité reste actif.")
R.puce("On arrête le serveur : ", ("la session se verrouille quand même", "g"), ".")
R.puce("Après 2 reports, la maintenance ", ("se fait à la prochaine absence", "g"), " ; si l’agent revient, son travail n’est pas touché.")
R.puce("Sur une journée jouée, ", ("aucune installation devant l’agent", "g"), ", contre N avec l’outil classique (essai R6).")
R.puce("Le technicien voit sur le tableau de bord les verrouillages, les reports et les redémarrages en attente ; "
       "la base ne contient aucune heure d’absence.")
R.puce("Le tuteur confirme que la solution répond aux deux besoins du service.")

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
