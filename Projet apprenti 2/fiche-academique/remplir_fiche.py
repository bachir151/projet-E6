# -*- coding: utf-8 -*-
"""Remplit le formulaire académique « Dossier de présentation et de validation du projet »
pour l’apprenti 2 (Yaksan) – « Station de contrôle des postes, de la remise à la restitution »,
en gardant la mise en page officielle.

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
        p = self.texte((t, "gb"), taille=11, avant=8, apres=2)
        p.paragraph_format.keep_with_next = True          # un titre ne reste pas seul en bas de page
        return p

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
remplacer_marque(T[0].cell(3, 1).paragraphs[0], "Station de contrôle des postes, de la remise à la restitution", gras=True)

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
cocher(cases(t.cell(1, 3).paragraphs[0])[0])          # projet développé : entreprise (même choix que les autres apprentis, cf. point réglementaire)
c = t.cell(2, 1).paragraphs
cocher(cases(c[0])[0])                                 # commanditaire : oui
ajouter_dans_run(c[1], "Nom", "Ministère de l’Intérieur – service carrière et paye (ressources humaines)")
ajouter_dans_run(c[3], "Contact", "tuteur de l’apprenti (nom et fonction à compléter)")
cocher(cases(c[5])[0])                                 # idée : lycée (proposée par l’équipe pédagogique, validée par le tuteur)
for k in (6, 7):                                       # cahier des charges et suivi : lycée + entreprise
    for case in cases(c[k]):
        cocher(case)
ajouter_dans_run(t.cell(3, 1).paragraphs[0], "Nom de l", "Ministère de l’Intérieur")

# ================================================================== 1.2 PRÉSENTATION
R = Redac(P[38])
R.titre("Contexte")
R.texte("Yaksan est apprenti au support informatique du service carrière et paye d’une administration de l’État. "
        "Il aide les agents au quotidien et ", ("accueille les nouveaux arrivants", "g"), " : il leur remet leur "
        "ordinateur portable. Quand un agent quitte le service, il rend son portable, qui est ensuite remis à un "
        "autre agent. Le réseau du service est isolé d’Internet.")
R.titre("Le problème")
R.texte("Aujourd’hui, un portable rendu est contrôlé rapidement, à l’œil et à l’oreille, sans trace écrite "
        "(à confirmer par le tuteur). Les défauts francs se voient tout de suite. Les ", ("défauts partiels", "g"),
        " passent : un écran qui a perdu de sa luminosité, un haut-parleur faible ou d’un seul côté, un micro "
        "étouffé, un port USB qui charge mais ne transmet plus. C’est le nouvel agent qui les découvre, souvent le "
        "jour de son arrivée : un ticket, du temps perdu, une mauvaise première impression. Et personne ne peut "
        "dire si le défaut existait déjà à la remise.")
R.texte(("Pourquoi un capteur : ", "g"), "Windows sait qu’un haut-parleur est branché, pas qu’il produit vraiment "
        "du son. Il sait qu’un écran est relié, pas qu’il éclaire bien. Il faut donc un témoin extérieur : le "
        "logiciel déclenche le test, un capteur posé contre le PC vérifie le résultat.")
R.texte(("Question posée par le projet : ", "g"), "une station qui mesure le portable à la remise, le remesure à "
        "la restitution et compare, trouve-t-elle les défauts partiels mieux et plus vite qu’un contrôle à l’œil, "
        "sans rien installer sur le PC ? L’apprenti construit la station, la teste sur maquette avec des défauts "
        "provoqués, et répond avec des chiffres.")
R.titre("Solutions existantes et leurs limites")
R.tableau(
    ["Solution", "Ce qu’elle apporte", "Pourquoi elle ne suffit pas"],
    [
        ["Contrôle à l’œil et à l’oreille", "Rapide, gratuit", "Subjectif ; rate les défauts partiels ; aucune trace pour comparer"],
        ["Diagnostics des fabricants lancés avant Windows (HP, Dell, Lenovo)", "Mémoire, disque, batterie ; indépendants de Windows",
         "Pour le son et l’écran, ils demandent en général au technicien s’il entend ou s’il voit ; un outil par marque ; pas de comparaison remise / restitution (à vérifier selon les modèles)"],
        ["Logiciels des reconditionneurs (PC-Doctor, Eurosoft Pc-Check, PassMark BurnInTest)", "Tests complets, rapports",
         "Payants, à installer ; le son reste jugé par une personne ou demande un câble de bouclage (à vérifier)"],
        ["Sites de test en ligne (clavier, pixels morts)", "Gratuits, rien à installer", "Aucun capteur, aucune trace ; impossibles sur un réseau isolé d’Internet"],
        ["Inventaire du parc (GLPI)", "Qui a quel PC, depuis quand", "Ne mesure rien"],
    ],
    [4.6, 4.4, 9.0])
R.texte(("Constat : ", "g"), "aucun de ces outils ne mesure le son ou la lumière qui sortent vraiment du PC, ni "
        "ne compare l’état d’un même PC entre sa remise et sa restitution.")
R.titre("Principe de la solution")
R.puce(("La page de test", "g"), " (HTML, JavaScript), servie par la station en HTTPS : le portable l’ouvre dans "
       "son navigateur ; rien n’est installé, aucun droit d’administrateur n’est demandé. Elle affiche des couleurs, "
       "joue des sons, écoute le micro, enregistre les touches et le tracé du pavé tactile.")
R.puce(("La tête de mesure", "g"), " (ESP32), posée contre le PC dans un support fixe : un capteur de couleur "
       "dans un tube noir mesure l’écran ; un micro mesure le son des haut-parleurs ; un petit haut-parleur envoie "
       "un son au micro du PC.")
R.puce(("La station", "g"), " (PC Ubuntu) enchaîne les étapes, reçoit les mesures et compare chaque résultat "
       "au rapport précédent du même PC et aux PC sains du même modèle. Elle propose un verdict ; ",
       ("le technicien valide la décision", "g"), ". Les rapports sont chaînés : une modification se voit.")
R.image(IMG("0_synoptique"), 17.6, "Synoptique de l’architecture (maquette de démonstration).")
R.titre("Progression du projet")
R.puce(("V1 (obligatoire) : ", "g"), "écran (luminance, gamma, couleurs), haut-parleurs (gauche, droite, trois "
       "fréquences), micro, clavier et pavé tactile, liste de contrôle physique, comparaison avec seuils, rapports "
       "chaînés et copie hors ligne, exploitation du réseau en place.")
R.puce(("V2 (visée) : ", "g"), "webcam (mire, netteté, sans image gardée), ports USB (données et tension), port "
       "Ethernet (vitesse lue sur le switch par SNMP), statistiques du parc.")
R.puce(("Extensions : ", "g"), "batterie, sortie HDMI, uniformité de l’écran, couleur du blanc.")
R.titre("Limites de l’étude")
R.puce(("Point réglementaire : ", "g"), "l’arrêté du 25 janvier 2023 indique que les projets des apprentis "
       "doivent être développés dans l’entreprise. Ici, le besoin vient du service, mais la réalisation se fait "
       "au lycée, sur maquette, sans accès aux postes ni aux données du ministère. Cette organisation doit être "
       "validée par l’académie.")
R.puce(("Maquette : ", "g"), "deux ou trois portables Windows 11 du lycée ou de récupération (Windows 11 Famille "
       "suffit : aucun domaine n’est nécessaire). Les défauts sont provoqués sans rien abîmer : film gris sur "
       "l’écran, adhésif sur un haut-parleur, mousse sur le micro, câble USB « charge seule ».")
R.puce(("Ce n’est pas un diagnostic complet : ", "g"), "on contrôle les fonctions utilisées tous les jours, pas "
       "les composants internes. Le rapport dit quelles lignes sont ", ("mesurées", "g"), " et lesquelles sont ",
       ("constatées par le technicien", "g"), ". Certaines touches (Fn, Ctrl+Alt+Suppr) ne peuvent pas être "
       "testées depuis un navigateur.")
R.puce(("Vie privée : ", "g"), "le rapport décrit l’état du PC, pas la faute d’un agent ; aucun son n’est "
       "enregistré, aucune image n’est gardée ; personnes fictives sur la maquette.")
R.puce(("Navigateur : ", "g"), "le micro et la caméra exigent HTTPS et l’accord de l’utilisateur. Sur la maquette, "
       "le technicien donne cet accord ; sur les postes du service, les règles du navigateur sont à vérifier.")
R.titre("Attentes du client")
R.puce("Remettre à chaque arrivant un portable dont l’écran, le son et le micro ont été mesurés.")
R.puce("À la restitution, savoir en quelques minutes si le PC peut être remis tel quel ou doit être réparé.")
R.puce("Garder une trace fiable, qu’on ne peut pas modifier sans que cela se voie.")
R.puce("Une réponse chiffrée : recommander ou non l’adoption de la station.")

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
R.titre("Besoin exprimé")
R.texte("Mesurer l’état d’un portable quand on le remet à un agent et quand il est rendu, comparer, proposer une "
        "décision au technicien et garder une trace fiable.")
R.titre("Hypothèses chiffrées (à confirmer par le tuteur)")
R.tableau(
    ["Hypothèse", "Valeur retenue", "À quoi elle sert"],
    [
        ["PC remis et PC rendus par an", "20 à 40", "Justifier la station"],
        ["Durée d’un contrôle à la main aujourd’hui", "5 à 10 min, sans rapport", "Comparer avec la station"],
        ["PC remis avec un défaut découvert par l’agent", "environ 1 sur 10", "Gain attendu"],
        ["Parc", "portables Windows, 2 ou 3 modèles", "Seuils par modèle"],
    ],
    [7.0, 5.0, 6.0])
R.titre("Ce que la station contrôle")
R.tableau(
    ["Fonction", "Outil", "Ce qui est vérifié", "Mode", "Étape"],
    [
        ["Écran", "Capteur de couleur TCS34725 dans un tube noir", "Luminance maximale, courbe de gamma, rouge, vert, bleu", "mesuré", "V1"],
        ["Haut-parleurs", "Micro INMP441 à distance fixe", "Niveau à 3 fréquences, équilibre gauche / droite, rapport signal / bruit", "mesuré", "V1"],
        ["Micro du PC", "Petit haut-parleur piloté par l’ESP32", "Fréquence reçue par la page, niveau minimal", "mesuré", "V1"],
        ["Clavier, pavé tactile", "Page de test", "Chaque touche, déplacement, clics, défilement", "constaté", "V1"],
        ["État physique", "Liste de contrôle", "Coque, charnière, touches, écran (rayures, pixels)", "constaté", "V1"],
        ["Webcam", "Mire dans un capot fermé", "Netteté, couleurs (aucune image gardée)", "mesuré", "V2"],
        ["Ports USB", "ESP32-S3 vu comme un clavier ; INA219", "Données transmises ; tension sous charge (≤ 500 mA)", "mesuré", "V2"],
        ["Port Ethernet", "SNMP en lecture sur le switch", "Vitesse négociée, erreurs", "mesuré", "V2"],
    ],
    [2.8, 4.6, 6.6, 2.0, 2.0])
R.titre("Règles de décision")
R.tableau(
    ["Ce qui est vu", "Verdict proposé"],
    [
        ["Mesure dans la plage des PC sains du modèle, proche de la remise", "OK"],
        ["Mesure dans la plage, mais en baisse nette depuis la remise (plus que l’usure normale)", "À surveiller"],
        ["Mesure hors de la plage (canal muet, écran trop sombre, fréquence non reçue)", "Défaut : à réparer avant de remettre le PC"],
        ["Mesure impossible (capteur mal placé, bruit trop fort)", "Non concluant : refaire le test"],
        ["Rapport de remise modifié (chaîne rompue)", "Comparaison refusée, alerte au technicien"],
    ],
    [11.0, 7.0])
R.titre("Exigences et indicateurs mesurés sur la maquette (objectifs à valider par le tuteur)")
R.tableau(
    ["Exigence", "Mesure sur la maquette", "Objectif", "Étape"],
    [
        ["E1 – Défauts trouvés", "20 défauts provoqués (écran assombri, haut-parleur couvert, balance décalée, micro étouffé…)", "Au moins 18 trouvés, au bon composant", "V1"],
        ["E2 – Pas de fausse alarme", "20 passages de PC sains", "Au plus 1 alarme", "V1"],
        ["E3 – Répétable", "Même PC, 10 passages, repositionné à chaque fois", "10 verdicts identiques", "V1"],
        ["E4 – Rapide", "Durée d’un contrôle complet, comparée au contrôle à la main chronométré", "Moins de 5 minutes", "V1"],
        ["E5 – Seuils justifiés", "Dispersion des mesures sur PC sains", "Seuils = moyenne − 3 écarts-types, incertitudes données", "V1"],
        ["E6 – Rapport intègre", "Rapport de remise modifié dans la base", "Détecté à chaque essai", "V1"],
        ["E7 – Rien sur le PC", "Revue du code et des échanges", "Aucun logiciel installé, aucun droit admin, aucun son ni image gardé", "V1"],
        ["E8 – Connectique", "5 PC, dont 2 avec un défaut provoqué (webcam floutée, câble « charge seule »)", "Défauts trouvés 2 sur 2, aucune fausse alarme", "V2"],
    ],
    [3.6, 7.0, 5.8, 1.6])
R.titre("Paliers avant d’agir")
R.tableau(
    ["Palier", "Ce que fait la station", "Quand"],
    [
        ["1. Essai", "Elle mesure et propose un verdict, sans enregistrer de décision", "Pendant le réglage des seuils (janvier à mars)"],
        ["2. Confirmation", "Elle propose « à remettre » ou « à réparer » ; le technicien valide ou corrige", "V1, fonctionnement normal"],
        ["3. Automatique", "Non prévu pour la décision ; seule la copie du dernier haché est automatique", "—"],
    ],
    [3.4, 9.4, 5.2])
R.texte("La station n’agit jamais sur le portable : elle n’installe rien, ne change aucun réglage, n’efface rien.",
        taille=10)
R.titre("Questions au tuteur (hypothèses à confirmer)")
R.puce("Combien de PC sont remis et rendus par an ? Combien de temps prend le contrôle aujourd’hui ?")
R.puce("Que devient un PC rendu, et qui le contrôle ?")
R.puce("Quel navigateur est utilisé ? Le micro et la caméra y sont-ils autorisés ?")
R.puce("Le rapport peut-il citer l’agent, ou seulement le PC ? Quels modèles de portables sont en service ?")

# ================================================================== 2.1 SYSML
R = Redac(P[52])
R.image(IMG("1_exigences"), 17.6, "Figure 1 – Diagramme d’exigences.")
R.image(IMG("2_contexte"), 17.0, "Figure 2 – Diagramme de contexte.")
R.image(IMG("3_cas_utilisation"), 16.5, "Figure 3 – Diagramme des cas d’utilisation.")
R.image(IMG("4_sequence"), 16.5, "Figure 4 – Diagramme de séquence : restitution du PC-042, haut-parleur droit trop faible.")

# ================================================================== 2.2 CONTRAINTES
R = Redac(P[55])
R.puce("Matériel à acheter : ", ("45 à 75 € environ", "g"), " (à confirmer sur devis) : capteur de couleur "
       "TCS34725, micro INMP441, amplificateur MAX98357A et petit haut-parleur, ESP32-S3 et INA219 (V2), câble USB "
       "« charge seule », mousse, tube et support.")
R.puce("PC Ubuntu, ESP32, réseau de la maquette et portables Windows 11 (du lycée ou de récupération, à confirmer) : "
       "fournis par le lycée. Luxmètre et sonomètre : laboratoire de physique.")
R.puce("Tous les logiciels sont libres ou gratuits.")

R = Redac(P[60])
R.puce(("Tête de mesure : ", "g"), "ESP32 programmé en C++ (PlatformIO ou Arduino) ; TCS34725 en I²C ; INMP441 et "
       "MAX98357A en I²S ; niveaux calculés sur l’ESP32 (algorithme de Goertzel) ; liaison USB série avec la "
       "station, sans radio.")
R.puce(("Page de test : ", "g"), "HTML et JavaScript, sans installation ; Web Audio API (sons, analyse du micro), "
       "getUserMedia (micro, caméra en V2), plein écran, événements du clavier et du pointeur ; HTTPS obligatoire.")
R.puce(("Station : ", "g"), "PC Ubuntu ; Python, Flask (WebSocket), pyserial, SQLite ; rapports chaînés (SHA-256) ; "
       "rapport imprimable ; pysnmp (V2).")
R.puce(("Portables testés : ", "g"), "Windows 11 (Famille suffit), navigateur Edge ou Chrome ; aucun logiciel "
       "installé, aucun droit d’administrateur.")
R.puce(("Réseau : ", "g"), "réseau de la maquette du lycée (DHCP, DNS, NTP, switchs HP ProCurve, routeur Cisco ISR "
       "4331), exploité tel quel : sa conception relève d’une autre épreuve. Certificat de la station signé par "
       "l’autorité de certification de labo (préparée par l’enseignant). Aucune connexion au ministère.")
R.puce(("Interdits : ", "g"), "pas de câblage 230 V ; aucune personne filmée (la webcam ne voit qu’une mire, dans "
       "un capot) ; aucun son enregistré ; aucune donnée réelle.")

R = Redac(P[64])
R.puce(("150 heures", "g"), " de janvier à mai 2027, en 11 tâches ; trois revues (après le cahier des charges, "
       "après la V1, après la campagne d’essai).")
R.puce("Code commenté et versionné (Git) ; campagne d’essai avec défauts provoqués, indicateurs mesurés et "
       "procès-verbal.")
R.puce("Journal de bord et journal d’usage de l’IA (charte IA du lycée).")
R.puce("Mesures de physique avec étalonnage et incertitudes ; seuils justifiés par les mesures.")
R.puce("Conclusion argumentée : « je recommande » ou « je ne recommande pas » l’adoption, chiffres à l’appui.")

R = Redac(P[68])
R.texte(("Question de sécurité : « le rapport de remise a-t-il été modifié avant la comparaison ? »", "g"))
R.puce(("Rapports chaînés : ", "g"), "chaque rapport contient l’empreinte SHA-256 du précédent et l’heure NTP. "
       "Démonstration : on change « Défaut » en « OK » dans la base ; le vérificateur signale la rupture et la "
       "comparaison est refusée.")
R.puce(("Copie hors ligne : ", "g"), "chaque soir, le dernier haché est copié sur une clé USB rangée hors réseau. "
       "Quelqu’un qui recalcule toute la chaîne est trahi par cette copie. Limite : la chaîne détecte une "
       "modification, elle ne l’empêche pas.")
R.puce(("Accès : ", "g"), "HTTPS avec le certificat de l’autorité de labo ; comptes des techniciens (mot de passe "
       "haché, jamais écrit dans le code) ; liste rouge de la charte IA (pas de vérification de certificat "
       "désactivée, pas de mode débogage).")
R.puce(("Fiabilité : ", "g"), "la station répond « non concluant » plutôt qu’un verdict faux ; seuils tirés des "
       "mesures ; essai de répétabilité.")
R.puce(("Vie privée : ", "g"), "le rapport décrit « l’état du matériel », jamais « la faute de l’agent » ; le "
       "lien avec l’agent est facultatif ; aucun son enregistré, aucune image gardée ; durée de conservation à "
       "fixer avec le service.")
R.titre("Risques et parades")
R.tableau(
    ["Risque", "Parade"],
    [
        ["Pas de portables Windows au lycée", "PC fixes du lycée avec écran et haut-parleurs USB : moins réaliste, mais la chaîne de mesure est la même"],
        ["Mesures peu répétables (position, lumière, bruit)", "Support fixe, tube noir, mousse ; essai de répétabilité dès janvier"],
        ["Réglages du PC qui faussent la mesure (luminosité, éclairage nocturne, « améliorations audio »)", "Protocole écrit : luminosité 100 %, secteur branché ; comparer des rapports de niveaux plutôt que des niveaux absolus"],
        ["Le navigateur bloque le micro ou la caméra", "HTTPS par l’autorité de labo ; règles des postes du service à vérifier avec le tuteur"],
        ["Trop de tests, retard", "V1 limitée à quatre mesures ; webcam, USB et Ethernet en V2"],
        ["Confusion avec d’autres projets du lycée", "Ce projet mesure l’état physique d’un PC qui change de main ; il ne configure pas le PC et ne trace pas ses déplacements"],
    ],
    [7.0, 11.0])

# ================================================================== 2.3 RESSOURCES
R = Redac(P[73])
R.puce(("Matériel du lycée : ", "g"), "ESP32, PC Ubuntu (station), portables Windows 11 (à confirmer), réseau de la "
       "maquette (switchs HP ProCurve, routeur Cisco ISR 4331) ; laboratoire de physique (luxmètre, sonomètre).")
R.puce(("Matériel à commander (décembre 2026) : ", "g"), "TCS34725, INMP441, MAX98357A et haut-parleur, ESP32-S3, "
       "INA219, câble USB « charge seule », mousse, tube, support.")
R.puce(("Logiciels : ", "g"), "PlatformIO ou Arduino IDE, Python (Flask, pyserial, pysnmp), SQLite, OpenSSL, "
       "navigateur Edge ou Chrome, Wireshark, Git, Visual Studio Code, tableur ou Python pour les mesures.")
R.puce(("Documents : ", "g"), "fiche de présentation validée par le tuteur ; fiches techniques du TCS34725 (ams) et "
       "de l’INMP441 ; documentation Web Audio API et getUserMedia (MDN, W3C) ; norme sRGB (IEC 61966-2-1) ; guide "
       "pour l’expression de l’incertitude de mesure (JCGM 100:2008) ; charte IA du lycée.")

# ================================================================== 3 RÉPARTITION
t = T[4]
cocher(cases(t.cell(1, 0).paragraphs[2])[1])
r = t.cell(1, 0).paragraphs[1].add_run("Yaksan")
r.bold = True
c1 = t.cell(1, 1)
lst = [
    "Projet individuel : toutes les fonctions.",
    "F1 Identifier le PC et le mode (remise, restitution)",
    "F2 Mesurer l’écran (luminance, gamma, couleurs)",
    "F3 Mesurer les haut-parleurs (gauche, droite)",
    "F4 Tester le micro du PC",
    "F5 Tester clavier et pavé ; liste de contrôle",
    "F6 Comparer aux références, proposer une décision",
    "F7 Chaîner, archiver et vérifier les rapports",
    "F8 Tester webcam, USB, Ethernet (V2)",
    "F9 Statistiques du parc (V2)",
]
for i, s in enumerate(lst):
    pp = c1.add_paragraph()
    rr = pp.add_run(s)
    rr.font.size = Pt(9.5)
    rr.bold = i == 0
    pp.paragraph_format.space_after = Pt(1)
textes = {
    "Installation": "station Ubuntu (Python, Flask, SQLite), certificat signé par l’autorité de labo, portables "
                    "Windows 11 de test, outils de capture.",
    "Mise en œuvre": "tête de mesure (ESP32, capteur de couleur, micro, émetteur) dans un support fixe ; seuils "
                     "réglés à partir des mesures de physique ; défauts provoqués pour les essais.",
    "Configuration": "HTTPS de la station, comptes des techniciens, copie hors ligne ; exploitation du réseau en "
                     "place (DHCP, DNS, NTP) ; lecture SNMP du switch (V2).",
    "Réalisation": "programme de l’ESP32, page de test, service de la station (étapes, comparaison, rapports "
                   "chaînés, vérificateur), statistiques (V2), campagne d’essai.",
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
R.titre("Comment chaque compétence est évaluée pour Yaksan")
R.puce(("C01 Communiquer : ", "g"), "revues de projet, échanges avec le tuteur, messages clairs de la page de test, "
       "rapport de contrôle lisible par un technicien, bilan « adopter ou non », dossier technique, soutenance avec "
       "démonstration.")
R.puce(("C03 Gérer un projet : ", "g"), "analyse du besoin chiffré, planning en 11 tâches, journal de bord, "
       "passage V1 → V2 décidé sur indicateurs, suivi des risques et du budget.")
R.puce(("C08 Coder : ", "g"), "C++ sur ESP32 (I²C, I²S, algorithme de Goertzel, liaison série), JavaScript (Web "
       "Audio, getUserMedia, événements du clavier et du pointeur), Python (Flask, WebSocket, comparaison, "
       "chaînage SHA-256, SNMP en V2), SQL.")
R.puce(("C10 Exploiter un réseau : ", "g"), "nom DNS et réservation DHCP pour la station ; heure NTP commune "
       "(horodatage des rapports) ; HTTPS avec le certificat de l’autorité de labo et poignée de main TLS observée "
       "à Wireshark ; échanges entre la page et la station (WebSocket) capturés et expliqués ; (V2) lecture SNMP de "
       "la vitesse et des erreurs du port du switch. Aucun VLAN ni ACL à configurer.")
R.titre("Volet physique : « à partir de quelle baisse de luminance un écran est-il usé ? »")
R.tableau(
    ["Étape", "Mesure", "Modèle, exploitation"],
    [
        ["Étalonnage", "Capteur TCS34725 et luxmètre posés au même endroit de l’écran, 10 niveaux de blanc",
         "Linéarité du capteur et facteur de conversion ; le luxmètre mesure un éclairement : pour un écran large, E ≈ π·L (approximation discutée)"],
        ["Courbe de gamma", "Rampe de 17 niveaux de gris, 10 répétitions",
         "Modèle L = Lmax·(v/255)^γ ; droite ln L en fonction de ln v : la pente donne γ, comparé à 2,2 (norme sRGB) ; incertitude sur la pente"],
        ["Répétabilité et seuils", "3 PC sains, 10 passages chacun avec repositionnement ; luminosité baissée à 90, 80 et 70 %",
         "Moyenne, écart-type, incertitude ; seuil = moyenne − 3 écarts-types ; plus petite baisse détectable ; taux de fausses alarmes mesuré"],
        ["Acoustique", "Micro INMP441 comparé au sonomètre à 1 kHz ; niveaux gauche et droite à 3 fréquences ; bruit de la salle",
         "Niveau relatif en dB (20·log du rapport des amplitudes) ; rapport signal / bruit ; échantillonnage et condition de Shannon"],
    ],
    [3.2, 6.6, 8.2])

# ================================================================== 5 PLANNING
dates = {
    94: "lundi 4 janvier 2027",
    95: "vendredi 29 janvier 2027 – besoin chiffré validé par le tuteur, maquette prête, premières mesures de l’écran",
    96: "vendredi 19 mars 2027 – V1 démontrée : écran, son, micro, rapports chaînés ; seuils tirés des mesures",
    97: "vendredi 7 mai 2027 – campagne d’essai terminée (défauts provoqués), indicateurs mesurés, V2",
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
        ["1", "Besoin chiffré, cahier des charges, planification", "10", "C03, C01 · revue 1"],
        ["2", "Maquette : station Ubuntu, HTTPS, portables de test", "10", "C10"],
        ["3", "Tête de mesure : capteur de couleur, micro, émetteur, support", "20", "C08"],
        ["4", "Physique : étalonnage, gamma, acoustique, seuils, incertitudes", "18", "physique"],
        ["5", "Page de test : couleurs, sons, micro, clavier, pavé tactile", "18", "C08"],
        ["6", "Station : étapes, base, comparaison, rapport", "16", "C08 · revue 2"],
        ["7", "Rapports chaînés, vérificateur, comptes, copie hors ligne", "8", "C08"],
        ["8", "Exploitation du réseau : DHCP, DNS, NTP, TLS, captures", "8", "C10"],
        ["9", "V2 : webcam, USB, Ethernet (SNMP), statistiques du parc", "18", "C08, C10"],
        ["10", "Campagne d’essai : défauts provoqués, indicateurs, bilan « adopter ou non »", "12", "C03 · revue 3"],
        ["11", "Dossier technique et préparation de la soutenance", "12", "C01"],
        ["", "Total", "150", ""],
    ],
    [1.0, 11.0, 1.6, 4.4])
for i in range(102, 122):
    P[i]._p.getparent().remove(P[i]._p)

# ================================================================== 6 ÉVALUATION
cocher(cases(P[125])[0])
R2 = nouveau_par_apres(P[125], "No Spacing")
rr = R2.add_run("Matériel du lycée (ESP32, PC Ubuntu, réseau, portables Windows 11 à confirmer) ; capteurs à "
                "commander en décembre 2026 (45 à 75 €, à confirmer sur devis) ; luxmètre et sonomètre du "
                "laboratoire de physique.")
rr.italic = True
rr.font.size = Pt(9.5)

R = Redac(P[129])
R.texte("Lors d’une démonstration sur la maquette, devant le tuteur et le jury :")
R.puce("Un portable sain est contrôlé « à la remise » : en moins de 5 minutes, le rapport est enregistré et "
       "chaîné.")
R.puce("On provoque deux défauts (adhésif sur le haut-parleur droit, luminosité baissée à 70 %) et on contrôle le "
       "même PC « à la restitution » : ", ("la station signale le haut-parleur droit et l’écran", "g"),
       ", propose « à réparer », et le technicien valide.")
R.puce("On modifie le rapport de remise dans la base : ", ("le vérificateur signale la rupture", "g"),
       " et la comparaison est refusée.")
R.puce("Les indicateurs sont présentés : défauts trouvés sur 20, fausses alarmes sur 20, répétabilité sur 10 "
       "passages, durée d’un contrôle.")
R.puce("La physique justifie les seuils : courbe de gamma mesurée face au modèle, incertitudes, plus petite baisse "
       "de luminance détectable.")
R.puce("(V2) Une webcam floutée par un film et un câble USB « charge seule » sont détectés ; la vitesse du port "
       "Ethernet est lue sur le switch.")
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
for i in (53, 54):                                    # titre 2.2 et « Contraintes financières » : pas seuls en bas de page
    P[i].paragraph_format.keep_with_next = True
# tableaux ajoutés : ligne d’en-tête répétée ; petits tableaux (≤ 7 lignes) : ne pas les couper (Word)
ORIGINAUX = {id(t._tbl) for t in T}                  # tableaux du modèle officiel : on n’y touche pas
for t in [t for t in d.tables if id(t._tbl) not in ORIGINAUX]:
    if len(t.rows) <= 7:
        for row in t.rows[:-1]:
            row._tr.get_or_add_trPr().append(OxmlElement("w:cantSplit"))
            for c in row.cells:
                for pp in c.paragraphs:
                    pp.paragraph_format.keep_with_next = True
    t.rows[0]._tr.get_or_add_trPr().append(OxmlElement("w:tblHeader"))   # après cantSplit (ordre du schéma)

# page 7 (commission) : resserrer les paragraphes vides entre ses tableaux, sinon LibreOffice
# fait déborder la fin du cadre « Nota » sur une page presque vide (le contenu officiel n’est pas modifié)
from docx.table import Table as _Tab
corps = list(d.element.body.iterchildren())
debut7 = next(i for i, el in enumerate(corps)
              if el.tag == qn("w:p") and "".join(x.text or "" for x in el.iter(qn("w:t"))).startswith("Observation de la commission"))
for el in corps[debut7:]:
    if el.tag == qn("w:p") and not "".join(x.text or "" for x in el.iter(qn("w:t"))).strip():
        par = _Par(el, d._body)
        par.paragraph_format.space_before = Pt(0)
        par.paragraph_format.space_after = Pt(0)
        par.paragraph_format.line_spacing = Pt(6)

d.save(SORTIE)
print("Écrit :", SORTIE)
