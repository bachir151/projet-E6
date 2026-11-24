# -*- coding: utf-8 -*-
"""Remplit le formulaire académique « Dossier de présentation et de validation du projet »
pour l’apprenti 1 (Wassim), en gardant la mise en page officielle.

Usage :
  python3 schemas.py && node rendu.js      # schémas SVG -> PNG
  python3 remplir_fiche.py                 # DOCX rempli
  soffice --headless --convert-to pdf Fiche_presentation_E6_Wassim.docx
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
SORTIE = os.path.join(ICI, "Fiche_presentation_E6_Wassim.docx")
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
remplacer_marque(T[0].cell(3, 1).paragraphs[0], "Diagnostic à distance des imprimantes : valorisation des données et ticket enrichi", gras=True)

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
r = t.cell(0, 1).paragraphs[-1].add_run(" : Wassim (apprenti)")
r.bold = True
for c in (2, 3, 4):
    t.cell(0, c).paragraphs[-1].add_run("—")
cocher(cases(t.cell(1, 3).paragraphs[0])[0])          # projet développé : entreprise (cf. point réglementaire)
c = t.cell(2, 1).paragraphs
cocher(cases(c[0])[0])
ajouter_dans_run(c[1], "Nom", "centre hospitalier (nom à compléter)")
ajouter_dans_run(c[3], "Contact", "M. Goussard, tuteur de l’apprenti (fonction à compléter)")
cocher(cases(c[5])[1])
for k in (6, 7):
    for case in cases(c[k]):
        cocher(case)
ajouter_dans_run(t.cell(3, 1).paragraphs[0], "Nom de l", "centre hospitalier (à compléter)")

# ================================================================== 1.2 PRÉSENTATION

# ================================================================== 1.2 PRÉSENTATION
R = Redac(P[38])
R.titre("Contexte")
R.texte("Wassim est technicien support au service informatique d’un centre hospitalier. Il traite les tickets "
        "de premier et de deuxième niveau. Il l’a dit lui-même en entretien : ", ("« le plus gros problème, c’est "
        "les imprimantes »", "g"), ". Elles sont allumées mais n’impriment pas ; il vérifie si elles sont dans le "
        "bon VLAN, s’il manque de l’encre. Il recueille les problèmes des agents ", ("par plusieurs canaux", "g"), " : les tickets sont gérés dans GLPI, mais les "
        "agents appellent aussi, écrivent un mail ou passent par le chat de GLPI. Le service n’a pas de supervision "
        "centralisée des imprimantes. Selon les bureaux, l’imprimante est reliée au PC par un câble USB, en réseau "
        "ou en sans-fil. (Faits rapportés par l’apprenti, à confirmer par le tuteur.)")
R.titre("Le problème")
R.texte("Un ticket « l’imprimante ne marche pas » ne dit rien de la cause. L’imprimante elle-même peut répondre "
        "« tout va bien » alors qu’elle est figée. Le technicien refait à la main les mêmes vérifications, se "
        "déplace parfois pour rien (par exemple : l’imprimante marche, mais son câble n’est pas branché au PC), et personne ne prouve que la réparation a marché.")
R.texte(("Question posée par le projet : ", "g"), "si un petit boîtier collé sur l’imprimante voyait ce qui se "
        "passe vraiment, et si le ticket arrivait avec sa cause et sa preuve, combien de déplacements et de temps "
        "gagnerait-on, sans prendre de risque sur les postes ? L’apprenti construit le système, le teste sur "
        "maquette et répond avec des chiffres.")
R.titre("Solutions existantes et leurs limites")
R.tableau(
    ["Solution", "Ce qu’elle apporte", "Pourquoi elle ne suffit pas"],
    [
        ["Page web de l’imprimante", "État, niveau d’encre", "Une imprimante à la fois ; peut dire « tout va bien » alors qu’elle est figée"],
        ["Supervision (Centreon, Zabbix…) : absente du service pour les imprimantes (à confirmer)", "Toutes les imprimantes du réseau", "Ne voit pas les imprimantes en USB ; lit l’état et le compteur de pages sans les comparer à ce qui a été envoyé ; ne sent pas si la machine travaille ; ne regarde pas le PC qui imprime"],
        ["Prise en main à distance", "Le technicien voit le PC", "Vérifications manuelles, ticket après ticket"],
        ["Outil de tickets (GLPI)", "Suivi, historique, liste du matériel", "Le ticket ne contient que la phrase de l’utilisateur (GLPI, téléphone, mail ou chat) ; aucune preuve de réparation"],
        ["Script d’installation actuel", "Installe vite les applications", "Service et profil choisis à la main ; GLPI non mis à jour"],
    ],
    [4.2, 5.0, 8.8])
R.texte(("Constat : ", "g"), "aucun outil ne compare ce que dit l’imprimante avec ce qui se passe physiquement "
        "(vibration, pages vraiment imprimées), ni avec ce que le PC a envoyé. Aucun ne dit « l’imprimante marche, "
        "vérifiez le câble » avant un déplacement. C’est pourtant cette comparaison qui donne la cause.")
R.titre("Principe de la solution")
R.puce(("Le boîtier", "g"), " (ESP32), collé sur l’imprimante : un accéléromètre sent si elle vibre, un gros bouton « ça ne marche pas » ouvre un ticket, un écran à "
       "encre électronique donne des nouvelles (« Bac 2 vide », « Wassim arrive », « Réparé »).")
R.puce(("Le serveur", "g"), " (Ubuntu) compare quatre témoins : la vibration, le compteur de pages et l’état "
       "de l’imprimante (SNMP), et ce que dit le PC (script PowerShell en lecture seule). Le réseau attendu pour chaque service "
       "vient d’un tableau de l’inventaire GLPI. Il écrit la cause probable dans GLPI et met à jour un tableau de bord.")
R.puce(("L’annuaire et la station des PC neufs", "g"), " (V2) : une seconde machine virtuelle héberge un annuaire Active Directory simulé (Samba). Le technicien pose trois cartes RFID (la sienne, celle du profil, "
       "celle du PC) ; un script PowerShell met le PC dans le domaine, directement dans le bon service, installe "
       "les applications du profil et met à jour GLPI.")
R.image(IMG("0_synoptique"), 17.6, "Synoptique de l’architecture (maquette de démonstration).")
R.titre("Progression du projet")
R.puce(("V1 (obligatoire) : ", "g"), "boîtier (vibration, bouton, écran), lecture SNMP (état, compteur de pages), serveur, comparaison des "
       "quatre témoins, vérifications réseau, ticket GLPI au palier 1 (le système conseille, il ne modifie jamais l’imprimante), retour sur l’écran, tableau de bord.")
R.puce(("V2 (visée) : ", "g"), "carte RFID du technicien (arrivée, départ, durée) et preuve de réparation par page "
       "de test ; encre surveillée avant la panne ; humidité du local croisée avec les bourrages ; annuaire AD "
       "(Samba) et station des PC neufs ; capteur de feuilles pour contrôler le compteur de l’imprimante.")
R.puce(("Extensions : ", "g"), "redémarrage de l’imprimante figée à distance ; fausse imprimante servant de piège ; "
       "cartes RFID sécurisées ; SNMP version 3 ; étagère des cartouches.")
R.titre("Limites de l’étude")
R.puce(("Point réglementaire : ", "g"), "l’arrêté du 25 janvier 2023 indique que les projets des apprentis "
       "doivent être développés dans l’entreprise. Ici, le besoin vient de l’hôpital, mais la réalisation se fait "
       "au lycée, sur maquette, sans accès à la production ni donnée réelle. Cette organisation doit être "
       "validée par l’académie.")
R.puce(("Maquette : ", "g"), "en V1, un serveur Ubuntu et un PC Windows en machine virtuelle (Windows 11 Entreprise en "
       "évaluation, ou Windows 11 Pro), avec un compte local, sans domaine. En V2, les PC du lycée sous Windows 11 Famille ne pouvant rejoindre aucun domaine, "
       "l’annuaire AD sera simulé par Samba sur une seconde machine virtuelle.")
R.puce("Aucune donnée patient : le script lit le nombre de documents en attente, jamais leur nom. Pas de micro, pas "
       "de caméra. Le système ne supprime aucun ticket et ne ferme un ticket qu’avec une preuve.")
R.titre("Attentes du client")
R.puce("Savoir pourquoi une imprimante n’imprime pas, sans attendre l’appel ni se déplacer pour rien.")
R.puce("Un ticket qui arrive avec la cause et la preuve, et un utilisateur informé sur place.")
R.puce("(V2) Des PC neufs prêts plus vite, rangés dans le bon service, avec une fiche GLPI à jour.")
R.puce("Une réponse chiffrée : recommander ou non l’adoption.")
# ================================================================== 1.3 DOMAINE
cell = T[3].cell(0, 1)
RETENUS = ("Internet des objets", "cybersécurité", "embarquée", "centres de services", "santé")
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
R.titre("Besoin exprimé")
R.texte("Savoir tout de suite pourquoi une imprimante n’imprime pas, ouvrir le ticket avec la cause et la preuve, "
        "informer l’utilisateur sur place ; en V2, ranger les PC neufs dans le bon service sans erreur.")
R.titre("Les quatre témoins")
R.tableau(
    ["Témoin", "Matériel ou outil", "Ce qu’il dit"],
    [
        ["Vibration", "Accéléromètre (MPU6050) dans le boîtier", "« Les moteurs tournent » : l’imprimante travaille"],
        ["Compteur de pages", "SNMP (Printer MIB), lu avant et après", "« J’ai imprimé 3 pages » (comparé aux pages envoyées)"],
        ["État de l’imprimante", "SNMP (lecture seule)", "« Prête », « plus de papier », « bourrage », niveau d’encre"],
        ["PC", "Script PowerShell par un point d’accès JEA", "« 5 documents attendent chez moi » (le nombre, jamais le nom)"],
    ],
    [3.0, 6.2, 8.8])
R.titre("Règles : le serveur compare les témoins")
R.tableau(
    ["Ce qui est vu (5 pages envoyées)", "Cause probable", "Écran du boîtier"],
    [
        ["Vibration, compteur +5, « prête »", "Tout va bien", "PRÊTE"],
        ["Rien ne bouge, « plus de papier »", "Elle le dit elle-même", "BAC 2 VIDE"],
        ["Vibration puis arrêt, compteur +2, « bourrage »", "Feuille coincée", "FEUILLE COINCÉE"],
        ["Rien ne bouge, compteur +0, « prête »", "Imprimante figée", "BLOQUÉE"],
        ["Rien ne bouge, documents bloqués dans le PC", "Problème dans le PC", "PRÊTE"],
        ["Pas de réponse, ou hors du réseau attendu (inventaire GLPI)", "Câble, adresse ou VLAN", "HORS RÉSEAU"],
    ],
    [7.4, 4.6, 6.0])
R.titre("Exigences et indicateurs mesurés sur la maquette (objectifs à valider par le tuteur)")
R.tableau(
    ["Exigence", "Mesure sur la maquette", "Objectif", "Étape"],
    [
        ["E1 – Bonne cause", "10 pannes provoquées (papier retiré, feuille bloquée, câble USB débranché, mauvais réseau, imprimante figée, file bloquée)", "Cause juste dans au moins 9 cas", "V1"],
        ["E2 – Pas de fausse alerte", "1 h d’impressions normales", "Aucun ticket", "V1"],
        ["E3 – Rapide", "Temps entre l’impression ratée et le ticket", "Moins d’1 minute", "V1"],
        ["E4 – Pages comptées", "Compteur SNMP sur 100 pages ; 10 pages de test", "Au plus 1 écart ; 10 sur 10", "V1"],
        ["E5 – Diagnostic borné", "Commande hors de la liste JEA", "Refusée et tracée", "V1"],
        ["E6 – Retour au terrain", "Mise à jour de l’écran du boîtier ; contenu du ticket", "Moins d’1 minute ; les 4 témoins dans le ticket", "V1"],
        ["E7 – Bon réseau", "Imprimante placée hors du réseau attendu (inventaire GLPI)", "Signalée 5 fois sur 5", "V1"],
        ["E8 – PC neufs", "5 PC préparés avec la station", "Bon service, applications, fiche GLPI : 5 sur 5", "V2"],
    ],
    [3.6, 7.0, 5.8, 1.6])
R.titre("Trois paliers avant d’agir : la V1 reste au palier 1")
R.tableau(
    ["Palier", "Ce que fait le système", "Quand on passe au suivant"],
    [
        ["1. Conseil (V1)", "Il écrit la cause et l’action conseillée dans le ticket, sans rien faire ; la secrétaire ou le technicien agit à la main", "Conseils justes pendant toute la campagne d’essai"],
        ["2. Confirmation (extension)", "Il prépare l’action (relancer le service d’impression du PC, redémarrer l’imprimante) ; le technicien la lance d’un clic", "Le technicien n’a jamais eu à refuser"],
        ["3. Automatique (extension)", "Il agit seul, la nuit uniquement, et le note dans le ticket", "Seulement si les indicateurs sont atteints"],
    ],
    [3.6, 7.6, 6.8])
R.titre("Questions au tuteur (hypothèses à confirmer)")
R.puce("Quelle part des tickets concerne les imprimantes ? (ordre de grandeur sur un mois)")
R.puce("Les imprimantes sont-elles en réseau (filaire ou Wi-Fi), en USB, ou en Bluetooth / Wi-Fi Direct ? Dans un VLAN à part ?")
R.puce("Quelle part des déplacements est inutile (câble non branché, par exemple) ? Combien de temps prend un déplacement, aller-retour compris ?")
R.puce("Par quels canaux arrivent les tickets (GLPI, téléphone, mail, chat) ? Le mail crée-t-il déjà un ticket tout seul ?")
R.puce("Le technicien a-t-il le droit de lire l’état des imprimantes (SNMP) ?")

# ================================================================== 2.1 SYSML
R = Redac(P[52])
R.image(IMG("1_exigences"), 17.6, "Figure 1 – Diagramme d’exigences.")
R.image(IMG("2_contexte"), 17.0, "Figure 2 – Diagramme de contexte.")
R.image(IMG("3_cas_utilisation"), 16.5, "Figure 3 – Diagramme des cas d’utilisation.")
R.image(IMG("4_sequence"), 17.6, "Figure 4 – Diagramme de séquence : l’imprimante figée, du ticket à la preuve de réparation.")

# ================================================================== 2.2 CONTRAINTES
R = Redac(P[55])
R.puce("Matériel à acheter : ", ("75 à 125 € environ", "g"), " (à confirmer sur devis) : 2 ESP32, accéléromètre, "
       "capteur de température et d’humidité SHT31 (V2), capteur infrarouge (V2), 2 écrans à encre électronique, bouton, LED, 2 lecteurs RFID, cartes RFID, boîtiers.")
R.puce("PC Ubuntu, réseau, imprimante réseau (du lycée ou de récupération) : fournis par le lycée. Les PC Windows sont "
       "des machines virtuelles Windows 11 Entreprise (évaluation gratuite de 90 jours) ou des PC sous Windows 11 Pro.")
R.puce("Tous les logiciels sont libres ou gratuits (GLPI, CUPS, Mosquitto, PostgreSQL, Grafana).")

R = Redac(P[60])
R.puce(("Boîtier : ", "g"), "ESP32 programmé en C++ ; accéléromètre lu en continu, énergie de vibration calculée "
       "chaque seconde ; bouton ; écran à encre ; "
       "alimentation par bloc USB 5 V ; MQTT sur TLS ; capteur SHT31 (température, humidité, I²C), lecteur RFID et capteur infrarouge de feuilles en V2.")
R.puce(("Serveur : ", "g"), "PC Ubuntu ; CUPS (serveur d’impression : il connaît les travaux envoyés) ; Mosquitto ; "
       "service Python (règles, SNMP avec pysnmp : état et compteur de pages, pilotage du PC avec pywinrm, API REST de GLPI ; V2 : LDAP avec ldap3) ; "
       "PostgreSQL ; tableau de bord Grafana.")
R.puce(("PC Windows : ", "g"), "machine virtuelle Windows 11 Entreprise avec un compte local (V2 : dans le domaine de la maquette) ; WinRM en "
       "HTTPS (port 5986) ; point d’accès JEA en lecture seule (Get-PrintJob, Get-Printer).")
R.puce(("Annuaire (V2) : ", "g"), "Samba en contrôleur de domaine Active Directory sur une seconde machine virtuelle Ubuntu ; "
       "unités d’organisation par service ; compte de lecture LDAP ; compte de jonction limité. En V1, le DNS et l’heure de la maquette sont fournis par le serveur.")
R.puce(("GLPI : ", "g"), "installé avec Docker, données fictives ; version fixée au départ (les API des versions 10 "
       "et 11 diffèrent).")
R.puce(("Réseau : ", "g"), "réseau de la maquette du lycée (Wi-Fi, DHCP, DNS, NTP, switchs HP ProCurve, routeur Cisco "
       "ISR 4331), exploité tel quel : sa conception relève d’une autre épreuve. Aucune connexion à l’hôpital.")
R.puce(("Interdits : ", "g"), "pas de câblage 230 V, pas de caméra ni de micro, aucune donnée réelle ni nominative.")

R = Redac(P[64])
R.puce(("150 heures", "g"), " de janvier à mai 2027, en 11 tâches ; trois revues (après le cahier des charges, "
       "après le serveur, après la campagne d’essai).")
R.puce("Code commenté et versionné (Git) ; campagne d’essai avec indicateurs mesurés et procès-verbal.")
R.puce("Journal de bord et journal d’usage de l’IA (charte IA du lycée).")
R.puce("Mesures de physique avec étalonnage et incertitudes ; seuils de détection justifiés par les mesures.")
R.puce("Conclusion argumentée : « je recommande » ou « je ne recommande pas » l’adoption, chiffres à l’appui.")

R = Redac(P[68])
R.texte(("Question de sécurité : « le diagnostic à distance peut-il faire plus que ce qu’on lui permet ? »", "g"))
R.puce(("Point d’accès JEA : ", "g"), "liste fermée de commandes, compte sans droit d’administrateur. "
       "Démonstration : une commande hors liste est refusée et tracée.")
R.puce(("Flux chiffrés : ", "g"), "MQTT en TLS avec un identifiant par boîtier ; WinRM en HTTPS ; API de GLPI en HTTPS.")
R.puce(("Comptes limités : ", "g"), "lecture seule pour SNMP (et pour LDAP en V2) ; le compte GLPI ajoute des tickets et des suivis, "
       "ne supprime rien et ne ferme un ticket qu’avec une preuve (page de test comptée, ou compteur qui repart).")
R.puce(("Cartes RFID (V2) : ", "g"), "les cartes bon marché se copient ; le numéro de carte ne suffit donc pas, l’écran "
       "demande une confirmation. Cartes sécurisées en extension.")
R.puce(("Secrets et données : ", "g"), "mots de passe et clés hors du code ; compte de jonction demandé à l’exécution ; "
       "aucune donnée patient (nombre de documents, jamais leur nom).")
R.titre("Risques et parades")
R.tableau(
    ["Risque", "Parade"],
    [
        ["La vibration ne distingue pas assez « imprime » et « attend »", "Essai dès la tâche 3 ; le compteur de pages et l’état SNMP restent des témoins suffisants"],
        ["Compteur de pages absent ou faux sur l’imprimante du lycée", "Lecture SNMP testée dès la tâche 2 ; sinon, le capteur de feuilles (V2) passe en V1"],
        ["WinRM / JEA sans domaine (compte local) à valider", "Test dès les premières semaines ; repli : domaine Samba avancé de la V2"],
        ["WinRM avec JEA difficile à piloter depuis Linux", "Test dès les premières semaines ; repli : script local planifié qui envoie en HTTPS"],
        ["Nombre de pages d’un travail mal connu de CUPS", "Comparer au nombre annoncé par la file du PC ; sinon, comparer seulement « a imprimé / n’a rien imprimé »"],
        ["Pas de bourrage observé avec le papier humide", "Le volet physique repose d’abord sur la prise d’eau du papier, mesurable à coup sûr ; le lien avec les bourrages est un résultat, pas une condition"],
        ["Retard sur la V2", "La V1 forme un projet complet ; l’annuaire AD et la station des PC neufs peuvent être réduits"],
    ],
    [7.6, 10.4])

# ================================================================== 2.3 RESSOURCES
R = Redac(P[73])
R.puce(("Matériel du lycée : ", "g"), "ESP32, PC Ubuntu (serveur, GLPI dans Docker, machines virtuelles ; V2 : Samba), "
       "imprimante réseau, réseau de la maquette (Wi-Fi, switchs HP ProCurve, routeur Cisco ISR 4331), multimètre ; "
       "laboratoire de physique (hygromètre de référence, balance au centigramme).")
R.puce(("Matériel à commander (décembre 2026) : ", "g"), "accéléromètre, capteur SHT31, capteur infrarouge (V2), "
       "écrans à encre, bouton, LED, lecteurs et cartes RFID, boîtiers, connectique.")
R.puce(("Logiciels : ", "g"), "PlatformIO ou Arduino IDE, CUPS, Mosquitto, Python (paho-mqtt, pysnmp, pywinrm ; "
       "V2 : Samba, ldap3), PostgreSQL, Docker, GLPI, Grafana, PowerShell, Wireshark, Git, Visual Studio Code.")
R.puce(("Documents : ", "g"), "fiche de présentation validée par le tuteur, fiches techniques des capteurs, RFC 3805 "
       "(Printer MIB), documentation de l’API de GLPI, Microsoft Learn (JEA, Get-PrintJob ; V2 : Add-Computer, Samba), "
       "charte IA du lycée.")

# ================================================================== 3 RÉPARTITION
t = T[4]
cocher(cases(t.cell(1, 0).paragraphs[2])[1])
r = t.cell(1, 0).paragraphs[1].add_run("Wassim")
r.bold = True
c1 = t.cell(1, 1)
lst = [
    "Projet individuel : toutes les fonctions.",
    "F1 Sentir la vibration de l’imprimante",
    "F2 Signaler une panne (bouton)",
    "F3 Interroger l’imprimante (SNMP : état, compteur)",
    "F4 Lire la file d’impression du PC (JEA)",
    "F5 Comparer les témoins, trouver la cause",
    "F6 Ouvrir et compléter le ticket GLPI (paliers)",
    "F7 Afficher l’état sur le boîtier ; tableau de bord",
    "F8 Carte du technicien, preuve de réparation (V2)",
    "F9 Annuaire AD et PC neuf avec 3 cartes (V2)",
]
for i, s in enumerate(lst):
    pp = c1.add_paragraph()
    rr = pp.add_run(s)
    rr.font.size = Pt(9.5)
    rr.bold = i == 0
    pp.paragraph_format.space_after = Pt(1)
textes = {
    "Installation": "serveur Ubuntu (CUPS, Mosquitto, PostgreSQL, service Python, Grafana), GLPI dans Docker avec "
                    "données fictives, machine virtuelle Windows 11 (compte local), outils de capture ; V2 : domaine Samba.",
    "Mise en œuvre": "boîtier (ESP32, accéléromètre, bouton, écran) fixé sur l’imprimante ; "
                     "seuils réglés à partir des mesures de physique ; annuaire AD et station des PC neufs (V2).",
    "Configuration": "TLS de Mosquitto et identifiant par boîtier, WinRM HTTPS et point d’accès JEA, comptes de "
                     "lecture SNMP (LDAP en V2), compte GLPI limité ; exploitation du réseau en place (DHCP, DNS, NTP).",
    "Réalisation": "programme du boîtier, service Python (sonde, règles, SNMP, JEA, API GLPI), scripts PowerShell, "
                   "tableau de bord, station et script de préparation des PC (V2), campagne d’essai.",
    "Documentation": "dossier technique, protocoles et résultats des essais (physique et indicateurs), bilan "
                     "« adopter ou non », journal de bord et journal IA, support d’oral.",
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
R.titre("Comment chaque compétence est évaluée pour Wassim")
R.puce(("C01 Communiquer : ", "g"), "revues de projet, échanges avec le tuteur, messages clairs dans les tickets et "
       "sur l’écran du boîtier, bilan « adopter ou non », dossier technique, soutenance avec démonstration.")
R.puce(("C03 Gérer un projet : ", "g"), "analyse du besoin, planning en 11 tâches, journal de bord, passage V1 → V2 "
       "et d’un palier à l’autre décidé sur indicateurs, suivi des risques et du budget.")
R.puce(("C08 Coder : ", "g"), "C++ sur ESP32 (capteurs, interruptions, MQTT, écran, RFID), Python (sonde de l’imprimante avec profils par marque et mode simulé, règles, SNMP, "
       "pilotage WinRM, API REST de GLPI), SQL, PowerShell (JEA ; V2 : préparation des PC).")
R.puce(("C10 Exploiter un réseau : ", "g"), "réservation DHCP et nom DNS pour le serveur et les boîtiers ; heure NTP "
       "commune ; vérifications réseau d’une imprimante (ping, DNS, DHCP, ports 9100 et 631) ; tableau du réseau attendu dans GLPI ; "
       "captures Wireshark (SNMP, où la communauté circule en clair, IPP, MQTT).")
R.titre("Volet physique : « quand peut-on dire que l’imprimante imprime ? »")
R.tableau(
    ["Étape", "Mesure", "Modèle, exploitation"],
    [
        ["Étalonnage", "Accéléromètre posé dans 6 positions", "Doit lire ± 1 g ; on en tire décalage et gain de chaque axe"],
        ["Vibration", "Enregistrement à 1 kHz, imprimante en veille puis en impression, 20 essais", "Énergie de vibration et fréquences des moteurs (transformée de Fourier) ; seuil = moyenne en veille + k écarts-types ; taux de fausses détections mesuré ; délai entre l’envoi et le début de la vibration mesuré : il justifie le délai d’alerte « rien ne bouge »"],
        ["Échantillonnage", "Même vibration vue à plusieurs fréquences d’échantillonnage", "Condition de Shannon : choix de la fréquence la plus basse qui garde l’information"],
        ["Vitesse des feuilles (V2)", "Durée de passage d’une feuille A4 devant le capteur infrarouge, 30 feuilles", "v = L / Δt (L = 297 mm) ; moyenne, écart-type, incertitude s/√N ; cadence mesurée comparée à celle du fabricant"],
        ["Humidité et papier (V2)", "SHT31 comparé à un hygromètre de référence ; feuilles pesées après 48 h en boîte fermée à humidité basse, puis au-dessus d’une solution saturée de sel (≈ 75 %), 10 feuilles par condition", "Prise d’eau du papier (variation de masse en %) en fonction de l’humidité, avec incertitudes ; impression des deux lots et bourrages relevés ; seuil d’alerte « local trop humide » justifié par la mesure"],
    ],
    [3.2, 6.6, 8.2])

# ================================================================== 5 PLANNING
dates = {
    94: "lundi 4 janvier 2027",
    95: "vendredi 29 janvier 2027 – besoin analysé, cahier des charges et planning validés, maquette prête",
    96: "vendredi 19 mars 2027 – boîtier, serveur (règles, SNMP) et premiers essais de physique",
    97: "vendredi 7 mai 2027 – campagne d’essai terminée, indicateurs mesurés, bilan « adopter ou non »",
    98: "vendredi 14 mai 2027",
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
R.tableau(
    ["N°", "Tâche", "Heures", "Compétence · jalon"],
    [
        ["1", "Analyse du besoin, cahier des charges, planification", "12", "C03, C01 · revue 1"],
        ["2", "Maquette : GLPI, CUPS, machine virtuelle Windows 11 (compte local), imprimante ; V2 : domaine Samba", "12", "C10"],
        ["3", "Boîtier : vibration, bouton, écran, MQTT", "27", "C08"],
        ["4", "Physique : étalonnage, vibration, délai de démarrage, humidité (V2), incertitudes", "12", "physique"],
        ["5", "Serveur : sonde de l’imprimante (SNMP, PC pour l’USB, profils par marque, simulateur), règles de comparaison, vérifications réseau", "22", "C08 · revue 2"],
        ["6", "PowerShell : file d’impression par JEA ; tableau du réseau attendu (V2 : lecture de l’AD)", "14", "C08, C10"],
        ["7", "Exploitation du réseau : DHCP, DNS, NTP, SNMP, captures", "8", "C10"],
        ["8", "GLPI : tickets à paliers, retour sur l’écran, tableau de bord", "16", "C08"],
        ["9", "RFID : carte du technicien, preuve de réparation, annuaire AD et station des PC neufs (V2)", "12", "C08"],
        ["10", "Campagne d’essai, indicateurs, bilan « adopter ou non »", "7", "C03 · revue 3"],
        ["11", "Dossier technique et préparation de la soutenance", "8", "C01"],
        ["", "Total", "150", ""],
    ],
    [1.0, 11.0, 1.6, 4.4])
for i in range(102, 122):
    P[i]._p.getparent().remove(P[i]._p)

# ================================================================== 6 ÉVALUATION
cocher(cases(P[125])[0])
R2 = nouveau_par_apres(P[125], "No Spacing")
rr = R2.add_run("Matériel du lycée (ESP32, PC Ubuntu, imprimante réseau) ; capteurs, écrans, lecteurs et cartes RFID "
                "à commander en décembre 2026 (75 à 125 €, à confirmer sur devis).")
rr.italic = True
rr.font.size = Pt(9.5)

R = Redac(P[129])
R.texte("Lors d’une démonstration sur la maquette, devant le tuteur et le jury :")
R.puce("On fige l’imprimante, puis on imprime : rien ne vibre, le compteur n’avance pas, l’imprimante répond « prête ». "
       "En moins d’une minute, ", ("le ticket GLPI indique « imprimante figée »", "g"), " et l’écran du boîtier "
       "affiche « Bloquée ».")
R.puce("Le ticket conseille de redémarrer l’imprimante (palier 1) ; le technicien ou la secrétaire le fait à la main. L’imprimante vibre et son compteur avance, le ticket est "
       "résolu avec la preuve et l’écran affiche « Réparé ».")
R.puce("Autres pannes provoquées : papier retiré, feuille bloquée, câble USB débranché (le PC ne voit plus l’imprimante : le ticket dit de vérifier le câble avant tout "
       "déplacement), imprimante dans le mauvais réseau, documents bloqués dans le PC. À chaque fois, la bonne cause est écrite dans le ticket.")
R.puce("Une commande hors de la liste JEA est ", ("refusée et tracée", "g"), " ; le compte GLPI ne peut rien "
       "supprimer.")
R.puce("(V2) Avec l’annuaire AD simulé, trois cartes posées sur la station : le PC neuf entre dans le domaine, directement dans le bon service, "
       "reçoit ses applications, et sa fiche GLPI se met à jour.")
R.puce("Les indicateurs sont présentés : causes justes sur 10 pannes, fausses alertes en 1 h, délai jusqu’au ticket, "
       "pages comptées sur 100, PC préparés sur 5.")
R.puce("L’apprenti conclut « je recommande » ou « je ne recommande pas » l’adoption, chiffres à l’appui.")
R.puce("Le tuteur confirme que la solution répond au besoin du service.")

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
