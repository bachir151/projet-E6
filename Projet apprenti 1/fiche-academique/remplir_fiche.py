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
remplacer_marque(T[0].cell(3, 1).paragraphs[0], "Supervision instrumentée des chariots de soins : de la coupure au ticket", gras=True)

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
R = Redac(P[38])
R.titre("Contexte")
R.texte("Wassim est technicien support au service informatique d’un centre hospitalier. Il traite les incidents "
        "de premier et de deuxième niveau dans un outil de tickets, sur un parc de plusieurs milliers de postes : "
        "postes de bureau, postes de soins, ", ("chariots de soins mobiles équipés d’un PC portable", "g"), ". "
        "À l’hôpital, un poste arrêté n’est pas un simple désagrément : la prescription, la traçabilité des soins "
        "et la consultation des résultats passent par le dossier patient informatisé. Quand le PC du chariot "
        "s’éteint, le soignant revient au papier ou attend.")
R.titre("Le problème")
R.texte("Une panne a toujours une cause, physique ou logicielle, et cette cause laisse une trace à l’instant où "
        "elle agit. Mais ", ("la panne intermittente ne se produit jamais devant le technicien", "g"), " : il "
        "procède par élimination, change une pièce, attend le prochain appel. Fait rapporté par le service (à "
        "confirmer par le tuteur) : en cardiologie, le PC d’un chariot s’éteignait seul deux à trois fois par jour ; "
        "deux déplacements n’ont rien révélé ; le journal Windows signalait des arrêts brutaux sans en donner la "
        "cause. Coût : déplacements répétés, pièces changées sans certitude, saisies perdues, ticket ouvert pendant "
        "des semaines.")
R.texte(("Question posée par le projet : ", "g"), "un petit boîtier posé en permanence sur chaque chariot, qui voit "
        "la panne au moment où elle arrive et ouvre lui-même le ticket, vaut-il le coup d’être adopté ? L’apprenti "
        "construit le système, le teste sur maquette et répond avec des chiffres.")
R.titre("Solutions existantes et leurs limites")
R.tableau(
    ["Solution", "Ce qu’elle apporte", "Pourquoi elle ne suffit pas"],
    [
        ["Journal d’événements Windows", "Date des arrêts brutaux, erreurs disque et matériel", "Écrit seulement au redémarrage : décrit l’effet, jamais ce qui s’est passé autour du PC"],
        ["Diagnostic à distance (PowerShell)", "État du PC : batterie, disque, erreurs", "Ne voit le PC qu’une fois rallumé ; rien sur l’instant de la panne"],
        ["Outil de tickets (GLPI)", "Suivi et historique des interventions", "Le ticket dépend de l’appel du soignant ; il ne contient aucune mesure"],
        ["Supervision, sondes internes", "Température du processeur, santé du disque", "L’agent s’arrête avec la machine ; aucune mesure de choc"],
        ["Enregistreurs du commerce", "Mesures physiques horodatées (chocs, température)", "Données isolées, dépouillées à la main, sans lien avec Windows ni les tickets"],
        ["Remplacement par élimination", "Finit parfois par aboutir", "Lent, coûteux, sans preuve de la cause"],
    ],
    [4.2, 5.4, 8.4])
R.texte(("Constat : ", "g"), "aucun outil ne place sur une même ligne de temps ce que le chariot a subi, ce que "
        "Windows a noté et le ticket du support. C’est pourtant l’ordre des événements qui désigne la cause.")
R.titre("Principe de la solution")
R.puce(("Le boîtier", "g"), " (ESP32), posé en permanence sur le chariot, comme la boîte d’un enregistreur de vol : "
       "secousses (MPU6050), tension 5 V de l’USB du PC (INA219), température et humidité (SHT31). Il continue "
       "d’enregistrer sur sa petite batterie quand le PC s’éteint.")
R.puce(("Le diagnostic à distance", "g"), " : dès que le PC redémarre, le serveur lance un script PowerShell qui "
       "relève l’état du PC (journal, batterie, disque), en lecture seule.")
R.puce(("GLPI", "g"), " : le serveur ouvre le ticket et y écrit tout ce qui a été vu. Le technicien lit, décide "
       "et ferme le ticket lui-même.")
R.image(IMG("0_synoptique"), 17.6, "Synoptique de l’architecture (maquette de démonstration).")
R.titre("Progression du projet")
R.puce(("V1 (obligatoire) : ", "g"), "boîtier (secousses, coupure), diagnostic à distance, corrélation, ticket "
       "GLPI au palier 1 puis 2, rapport simple joint au ticket.")
R.puce(("V2 (visée) : ", "g"), "frise Grafana, température et humidité, batterie dans les règles, palier 3, "
       "bilan chiffré « adopter ou non ».")
R.puce(("Extensions : ", "g"), "plusieurs boîtiers en parallèle ; tableau de bord du parc de chariots ; "
       "corrections à distance avec confirmation humaine.")
R.titre("Limites de l’étude")
R.puce(("Point réglementaire : ", "g"), "l’arrêté du 25 janvier 2023 indique que les projets des apprentis "
       "doivent être développés dans l’entreprise. Ici, le besoin vient de l’hôpital, mais la réalisation se fait "
       "au lycée, sur maquette, sans accès à la production ni donnée réelle. Cette organisation doit être "
       "validée par l’académie.")
R.puce("Le système ne lit aucune donnée patient, ne répare rien et ne ferme jamais un ticket. Le diagnostic à "
       "distance lit l’état du PC mais ne le modifie pas. Il fournit une preuve ; la décision reste au technicien.")
R.puce("Les règles supposent des PC portables avec batterie ; si les chariots portent de petits PC sans "
       "batterie, deux règles seront adaptées (question au tuteur).")
R.puce("Le scénario de panne est rejoué sur la maquette (chariot ou desserte du lycée), pas réalisé à l’hôpital.")
R.titre("Attentes du client")
R.puce("Savoir pourquoi un PC de chariot s’éteint, sans attendre que la panne se produise devant le technicien.")
R.puce("Un ticket ouvert avec les mesures et la cause probable, sans dépendre de l’appel du soignant.")
R.puce("Une réponse chiffrée : recommander ou non l’adoption, et proposer si besoin un essai réel sur 2 ou 3 "
       "chariots, que l’hôpital décidera.")

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
R.texte("Trouver la cause des arrêts intermittents des PC de chariot de soins, et que le ticket arrive avec la "
        "preuve, sans attendre l’appel du soignant ni un déplacement de plus.")
R.titre("Sources de mesure")
R.tableau(
    ["Source", "Matériel", "Question à laquelle elle répond"],
    [
        ["Secousses (3 axes)", "MPU6050", "Le chariot a-t-il pris un choc juste avant la panne ? (cœur du projet)"],
        ["Tension 5 V de l’USB", "INA219", "À quelle seconde exacte le PC s’est-il éteint ? (le 5 V tombe avec lui)"],
        ["Température, humidité", "SHT31", "Le PC a-t-il chauffé avant de s’arrêter ?"],
        ["État de Windows", "Script PowerShell", "Batterie vide ou usée ? Écran bleu ? Disque malade ?"],
    ],
    [4.0, 3.2, 10.8])
R.titre("Règles de diagnostic : le système regarde l’ordre des événements")
R.tableau(
    ["Ce qui est vu, dans l’ordre", "Cause probable", "Message écrit dans le ticket"],
    [
        ["Secousse, puis coupure 2 s après, batterie encore chargée", "Faux contact", "« Coupure après une secousse : vérifier les connecteurs »"],
        ["Pas de secousse, coupure, batterie qui descendait vers 0 %", "Batterie vide ou usée", "« Coupure à 2 % : batterie à contrôler »"],
        ["Température en hausse, puis coupure", "Surchauffe", "« Coupure à 41 °C : vérifier la ventilation »"],
        ["Rien d’anormal autour, erreur grave notée par Windows", "Panne logicielle", "« Aucune cause physique : erreur Windows »"],
        ["Rien de clair", "Non conclu", "« Cause non trouvée : poursuivre l’observation »"],
    ],
    [7.0, 3.4, 7.6])
R.titre("Exigences et indicateurs mesurés sur la maquette (objectifs à valider par le tuteur)")
R.tableau(
    ["Exigence", "Mesure sur la maquette", "Objectif", "Étape"],
    [
        ["E1 – Voir les pannes", "20 pannes provoquées : secousse avec coupure, coupure seule, chauffage de l’air", "Au moins 19 sur 20 détectées et bien classées", "V1"],
        ["E2 – Pas de fausse alerte", "Chariot roulé 1 h sans panne, seuils et chocs ordinaires compris", "0 ticket proposé", "V1"],
        ["E3 – Rapide", "Temps entre la coupure et le ticket", "Moins d’1 minute", "V1"],
        ["E4 – Tenir", "Enregistrement continu ; autonomie sans le PC ; Wi-Fi coupé", "72 h sans perte ; autonomie mesurée", "V1"],
        ["E5 – Diagnostic borné", "Commande hors de la liste JEA", "Refusée et tracée", "V1"],
        ["E6 – Ticket utile", "Contenu du ticket GLPI, paliers", "Frise, cause et diagnostic ; 1 ticket par chariot et par jour", "V1"],
        ["E7 – Horloges alignées", "Écart NTP entre boîtier, serveur et PC", "Mesuré et affiché dans le rapport", "V1"],
        ["E8 – Bilan chiffré", "Prix d’un boîtier × nombre de chariots, comparé au coût des déplacements évités", "Bilan écrit, chiffres du tuteur", "V2"],
    ],
    [3.6, 7.0, 5.8, 1.6])
R.titre("Trois paliers avant d’ouvrir des tickets tout seul")
R.tableau(
    ["Palier", "Ce que fait le système", "Quand on passe au suivant"],
    [
        ["1. Simulation", "Il note « j’aurais ouvert un ticket », sans rien ouvrir", "Aucune fausse alerte pendant la campagne d’essai"],
        ["2. Confirmation", "Il propose le ticket ; le technicien valide d’un clic", "Propositions jugées justes par le technicien"],
        ["3. Automatique (V2)", "Il ouvre le ticket seul ; un seul ticket par chariot et par jour", "Seulement si les indicateurs sont atteints"],
    ],
    [3.6, 7.6, 6.8])
R.titre("Questions au tuteur (hypothèses à confirmer)")
R.puce("Les PC des chariots sont-ils des portables avec batterie ou de petits PC sans batterie ?")
R.puce("Combien de chariots, et combien de déplacements pour panne intermittente par mois ?")
R.puce("Quels objectifs chiffrés retenir pour les indicateurs ?")
R.puce("Un boîtier avec batterie Li-Po serait-il accepté sur un chariot de soins ?")

# ================================================================== 2.1 SYSML
R = Redac(P[52])
R.image(IMG("1_exigences"), 17.6, "Figure 1 – Diagramme d’exigences.")
R.image(IMG("2_contexte"), 17.0, "Figure 2 – Diagramme de contexte.")
R.image(IMG("3_cas_utilisation"), 16.5, "Figure 3 – Diagramme des cas d’utilisation.")
R.image(IMG("4_sequence"), 17.6, "Figure 4 – Diagramme de séquence : secousse, coupure, ticket, diagnostic au redémarrage.")

# ================================================================== 2.2 CONTRAINTES
R = Redac(P[55])
R.puce("Matériel à acheter : ", ("30 à 40 € environ", "g"), " (à confirmer sur devis) : MPU6050, INA219, SHT31, "
       "batterie Li-Po avec module de charge, boîtier et connectique.")
R.puce("ESP32, PC Ubuntu (serveur et GLPI), PC portable Windows de récupération (avec sa batterie, sans données) : "
       "fournis par le lycée. Un chariot ou une desserte du lycée sert de chariot de soins.")
R.puce("Tous les logiciels sont libres ou déjà présents sous Windows.")

R = Redac(P[60])
R.puce(("Boîtier : ", "g"), "ESP32 programmé en C++ ; accéléromètre lu à 100 Hz, chocs signalés par la broche "
       "d’interruption du MPU6050 ; autres grandeurs résumées chaque seconde (min, max, moyenne) ; heure NTP et "
       "numéro de séquence ; mémoire flash si le Wi-Fi manque ; batterie Li-Po de secours.")
R.puce(("Serveur : ", "g"), "PC Ubuntu ; Mosquitto (MQTT sur TLS, port 8883) ; service Python (réception, règles, "
       "pilotage du diagnostic et de GLPI) ; PostgreSQL (tables chariot, mesure, evenement_physique, "
       "evenement_windows, ticket) ; rapport en Python ; frise Grafana en V2.")
R.puce(("PC du chariot : ", "g"), "Windows ; WinRM en HTTPS (port 5986) piloté depuis Linux (bibliothèque "
       "pywinrm) ; point d’accès JEA ; script PowerShell (Get-WinEvent, BatteryStatus, powercfg, Get-PhysicalDisk).")
R.puce(("GLPI : ", "g"), "installé avec Docker, données fictives ; API REST en HTTPS ; version fixée au départ "
       "(les API des versions 10 et 11 diffèrent).")
R.puce(("Réseau : ", "g"), "réseau de la maquette du lycée (Wi-Fi, DHCP, DNS, NTP, switchs HP ProCurve, routeur "
       "Cisco ISR 4331), exploité tel quel : sa conception relève d’une autre épreuve. Aucune connexion à l’hôpital.")
R.puce(("Interdits : ", "g"), "pas de câblage 230 V (le boîtier est alimenté par l’USB du PC), pas de caméra, "
       "aucune donnée réelle ni nominative.")

R = Redac(P[64])
R.puce(("150 heures", "g"), " de janvier à mai 2027, en 10 tâches ; trois revues (après le cahier des charges, "
       "après le serveur, après la campagne d’essai).")
R.puce("Code commenté et versionné (Git) ; campagne d’essai avec indicateurs mesurés et procès-verbal.")
R.puce("Journal de bord et journal d’usage de l’IA (charte IA du lycée).")
R.puce("Mesures de physique avec étalonnage et incertitudes ; seuil de détection justifié par les mesures.")
R.puce("Conclusion argumentée : « je recommande » ou « je ne recommande pas » l’adoption, chiffres à l’appui.")

R = Redac(P[68])
R.texte(("Question de sécurité : « le diagnostic à distance peut-il faire plus que ce qu’on lui permet ? »", "g"))
R.puce(("Point d’accès JEA : ", "g"), "liste fermée de commandes, compte sans droit d’administrateur. "
       "Démonstration : une commande hors liste est refusée et tracée.")
R.puce(("Flux chiffrés : ", "g"), "MQTT et WinRM en TLS, un identifiant par boîtier.")
R.puce(("Compte GLPI de service : ", "g"), "il ajoute des tickets et des suivis, mais ne supprime et ne ferme rien.")
R.puce(("Secrets et données : ", "g"), "clés d’accès hors du code ; aucune donnée nominative ni patient.")
R.puce(("Fiabilité : ", "g"), "batterie de secours (le boîtier ne s’éteint pas avec le PC), mémoire tampon si le "
       "Wi-Fi coupe, même serveur NTP pour tous, paliers et seuil réglable contre les fausses alertes.")
R.titre("Risques et parades")
R.tableau(
    ["Risque", "Parade"],
    [
        ["Horloges du boîtier et du PC décalées : corrélation faussée", "Même serveur NTP pour tous ; écart mesuré et affiché dans le rapport"],
        ["Le boîtier s’éteint avec le PC", "Batterie de secours ; test de coupure dès la tâche 2"],
        ["Fausses alertes et tickets en trop", "Étalonnage, seuil réglable, paliers, un ticket par chariot et par jour"],
        ["WinRM avec JEA difficile à piloter depuis Linux", "Test dès les premières semaines ; repli : script local planifié qui envoie en HTTPS"],
        ["Retard sur l’affichage", "Grafana en V2 ; la V1 se contente du rapport joint au ticket"],
    ],
    [7.6, 10.4])

# ================================================================== 2.3 RESSOURCES
R = Redac(P[73])
R.puce(("Matériel du lycée : ", "g"), "ESP32, PC Ubuntu (serveur, GLPI dans Docker), PC portable Windows de "
       "récupération avec sa batterie et sans données, réseau de la maquette (Wi-Fi, switchs HP ProCurve, routeur "
       "Cisco ISR 4331), chariot ou desserte, multimètre ; laboratoire de physique (règle, support de chute).")
R.puce(("Matériel à commander (décembre 2026) : ", "g"), "MPU6050, INA219, SHT31, batterie Li-Po et module de "
       "charge, boîtier, connectique.")
R.puce(("Logiciels : ", "g"), "Arduino IDE ou PlatformIO, Mosquitto, Python (paho-mqtt, pywinrm, psycopg), "
       "PostgreSQL, Docker, GLPI, Grafana, PowerShell, Wireshark, Git, Visual Studio Code.")
R.puce(("Documents : ", "g"), "fiche de présentation validée par le tuteur, fiches techniques des capteurs, "
       "documentation de l’API REST de GLPI, Microsoft Learn (WinRM, JEA, Get-WinEvent, powercfg), charte IA du lycée.")

# ================================================================== 3 RÉPARTITION
t = T[4]
cocher(cases(t.cell(1, 0).paragraphs[2])[1])
r = t.cell(1, 0).paragraphs[1].add_run("Wassim")
r.bold = True
c1 = t.cell(1, 1)
lst = [
    "Projet individuel : toutes les fonctions.",
    "F1 Enregistrer secousses, tension, température",
    "F2 Dater la coupure du PC (5 V)",
    "F3 Garder les mesures si le Wi-Fi coupe",
    "F4 Corréler les événements, trouver la cause",
    "F5 Diagnostiquer le PC à distance (JEA)",
    "F6 Ouvrir et compléter le ticket GLPI (paliers)",
    "F7 Rapport et frise (Grafana en V2)",
    "F8 Bilan chiffré « adopter ou non » (V2)",
]
for i, s in enumerate(lst):
    pp = c1.add_paragraph()
    rr = pp.add_run(s)
    rr.font.size = Pt(9.5)
    rr.bold = i == 0
    pp.paragraph_format.space_after = Pt(1)
textes = {
    "Installation": "serveur Ubuntu (Mosquitto, PostgreSQL, service Python), GLPI dans Docker avec données "
                    "fictives, PC Windows de récupération, outils de développement et de capture.",
    "Mise en œuvre": "boîtier (ESP32, MPU6050, INA219, SHT31, batterie Li-Po) fixé sur le chariot et alimenté par "
                     "l’USB du PC ; seuil de secousse réglé à partir des mesures de physique.",
    "Configuration": "TLS de Mosquitto et identifiant par boîtier, WinRM HTTPS et point d’accès JEA, compte GLPI "
                     "de service à droits limités ; exploitation du réseau en place (réservation DHCP, nom DNS, NTP).",
    "Réalisation": "programme du boîtier, service Python (réception, règles, corrélation SQL), script PowerShell de "
                   "diagnostic, ouverture des tickets GLPI à paliers, rapport, frise Grafana (V2), campagne d’essai.",
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
R.puce(("C01 Communiquer : ", "g"), "revues de projet, échanges avec le tuteur (questions et objectifs chiffrés), "
       "messages clairs dans les tickets, bilan « adopter ou non », dossier technique, soutenance avec démonstration.")
R.puce(("C03 Gérer un projet : ", "g"), "analyse du besoin, planning en 10 tâches, journal de bord, passage V1 → V2 "
       "et d’un palier à l’autre décidé sur indicateurs, suivi des risques et du budget.")
R.puce(("C08 Coder : ", "g"), "C++ sur ESP32 (capteurs, interruption, MQTT, mémoire tampon), Python (service, "
       "règles, pilotage WinRM et API REST de GLPI), SQL (corrélation), PowerShell (script de diagnostic, JEA).")
R.puce(("C10 Exploiter un réseau : ", "g"), "réservation DHCP et nom DNS pour le serveur et le boîtier ; écart "
       "d’horloge NTP mesuré entre boîtier, serveur et PC ; captures Wireshark des trois flux (MQTT 8883, WinRM "
       "5986, HTTPS vers GLPI) ; comportement observé quand le Wi-Fi coupe (mise en mémoire puis renvoi).")
R.titre("Volet physique : « à quelle condition le boîtier voit-il une secousse ? »")
R.tableau(
    ["Étape", "Mesure", "Modèle, exploitation"],
    [
        ["Étalonnage", "Capteur posé dans 6 positions (chaque axe vers le haut puis vers le bas)", "Doit lire ± 1 g ; on en tire décalage et gain de chaque axe"],
        ["Chutes contrôlées", "Boîtier lâché de hauteurs connues sur un support, 10 essais par hauteur", "v = √(2gh) ; choc modélisé en demi-sinus de durée τ ; moyenne, écart-type, incertitude s/√N"],
        ["Échantillonnage", "Même choc vu à 100 Hz et à 1 kHz", "Un choc de quelques ms peut tomber entre deux mesures : choix de la fréquence et du seuil"],
        ["Autonomie (court)", "Durée de fonctionnement du boîtier sur sa batterie", "t ≈ Q/I, confronté à la mesure"],
    ],
    [3.2, 7.0, 7.8])

# ================================================================== 5 PLANNING
dates = {
    94: "lundi 4 janvier 2027",
    95: "vendredi 29 janvier 2027 – besoin analysé, cahier des charges et planning validés (tâche 1)",
    96: "vendredi 19 mars 2027 – boîtier, serveur (réception, base, règles) et premiers essais de physique",
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
        ["2", "Boîtier : câblage, programme, détection de secousse, MQTT, mémoire tampon", "35", "C08, C10"],
        ["3", "Physique : étalonnage, chutes, échantillonnage, incertitudes", "10", "physique"],
        ["4", "Serveur : réception des mesures, base de données, règles", "20", "C08 · revue 2"],
        ["5", "Diagnostic à distance : script PowerShell, WinRM, JEA", "18", "C08, C10"],
        ["6", "GLPI : installation, API, ouverture de tickets, paliers", "15", "C08"],
        ["7", "Corrélation SQL, rapport, frise Grafana", "12", "C08"],
        ["8", "Exploitation du réseau : DHCP, DNS, NTP, captures", "8", "C10"],
        ["9", "Campagne d’essai, indicateurs, bilan « adopter ou non »", "10", "C03 · revue 3"],
        ["10", "Dossier technique et préparation de la soutenance", "10", "C01"],
        ["", "Total", "150", ""],
    ],
    [1.0, 11.0, 1.6, 4.4])
for i in range(102, 122):
    P[i]._p.getparent().remove(P[i]._p)

# ================================================================== 6 ÉVALUATION
cocher(cases(P[125])[0])
R2 = nouveau_par_apres(P[125], "No Spacing")
rr = R2.add_run("Matériel du lycée (ESP32, PC Ubuntu, portable Windows de récupération) ; capteurs, batterie et "
                "boîtier à commander en décembre 2026 (30 à 40 €, à confirmer sur devis).")
rr.italic = True
rr.font.size = Pt(9.5)

R = Redac(P[129])
R.texte("Lors d’une démonstration sur la maquette, devant le tuteur et le jury :")
R.puce("Le chariot passe un seuil, le PC s’éteint : le boîtier voit ", ("la secousse puis la coupure du 5 V", "g"),
       ", et continue d’enregistrer sur sa batterie.")
R.puce("En moins d’une minute, ", ("un ticket GLPI est proposé", "g"), " avec la cause probable « faux contact » ; "
       "le technicien le valide d’un clic (palier 2).")
R.puce("Au redémarrage, le diagnostic à distance ajoute au ticket l’état du PC (Kernel-Power 41, batterie, "
       "disque) et la frise des événements.")
R.puce("Une commande hors de la liste JEA est ", ("refusée et tracée", "g"), " ; le compte GLPI ne peut ni "
       "supprimer ni fermer un ticket.")
R.puce("Les indicateurs sont présentés : pannes détectées et bien classées sur 20, fausses alertes en 1 h de "
       "roulage, délai coupure → ticket, 72 h sans perte, écart d’horloge NTP.")
R.puce("L’apprenti conclut « je recommande » ou « je ne recommande pas » l’adoption, chiffres à l’appui, et "
       "propose si besoin un essai réel sur 2 ou 3 chariots.")
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
