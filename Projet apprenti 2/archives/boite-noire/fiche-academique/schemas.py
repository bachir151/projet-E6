# -*- coding: utf-8 -*-
"""Génère les schémas de la fiche académique de Yaksan (apprenti 2), en SVG.
Usage : python3 schemas.py  puis  node rendu.js  (SVG -> PNG)."""
import datetime as dt
import os
from html import escape

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "schemas")
FONT = "Liberation Sans, Arial, Helvetica, sans-serif"
INK = "#1f2937"
GREY = "#6b7280"
BLUE = "#1d4ed8"
BLUE_BG = "#e8f0fe"
LINE = "#9ca3af"


def svg(w, h, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" '
            f'viewBox="0 0 {w} {h}" font-family="{FONT}">'
            f'<defs>'
            f'<marker id="fl" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">'
            f'<path d="M0,0 L10,5 L0,10 z" fill="{GREY}"/></marker>'
            f'<marker id="flo" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto">'
            f'<path d="M0,0 L10,5 L0,10" fill="none" stroke="{GREY}" stroke-width="1.5"/></marker>'
            f'</defs><rect width="100%" height="100%" fill="#fff"/>{body}</svg>')


def text(x, y, s, size=14, weight="normal", fill=INK, anchor="middle", italic=False):
    st = ' font-style="italic"' if italic else ""
    return (f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" fill="{fill}" '
            f'text-anchor="{anchor}"{st}>{escape(s)}</text>')


def box(x, y, w, h, title, lines=(), dashed=False, hl=False, stereo=None, tsize=15, lsize=13):
    stroke = BLUE if hl else ("#9ca3af" if dashed else "#4b5563")
    fill = BLUE_BG if hl else "#fff"
    dash = ' stroke-dasharray="6 4"' if dashed else ""
    out = [f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="{fill}" stroke="{stroke}" stroke-width="{2 if hl else 1.4}"{dash}/>']
    cy = y + 22
    if stereo:
        out.append(text(x + w / 2, cy - 2, stereo, 11, fill=GREY, italic=True))
        cy += 15
    out.append(text(x + w / 2, cy, title, tsize, "bold"))
    cy += 6
    for ln in lines:
        cy += lsize + 4
        out.append(text(x + w / 2, cy, ln, lsize, fill="#374151"))
    return "".join(out)


def arrow(x1, y1, x2, y2, label=None, lx=None, ly=None, both=False, dashed=False, anchor="middle", size=12, open_head=False):
    dash = ' stroke-dasharray="6 4"' if dashed else ""
    m = "flo" if open_head else "fl"
    ms = f' marker-start="url(#{m})"' if both else ""
    out = f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{GREY}" stroke-width="1.5"{dash}{ms} marker-end="url(#{m})"/>'
    if label:
        out += text(lx if lx is not None else (x1 + x2) / 2, ly if ly is not None else (y1 + y2) / 2 - 6,
                    label, size, fill=GREY, anchor=anchor)
    return out


def line(pts, dashed=False, color=GREY, width=1.5):
    dash = ' stroke-dasharray="6 4"' if dashed else ""
    p = " ".join(f"{a},{b}" for a, b in pts)
    return f'<polyline points="{p}" fill="none" stroke="{color}" stroke-width="{width}"{dash}/>'


def actor(x, y, name, sub=None):
    o = [f'<circle cx="{x}" cy="{y}" r="10" fill="#fff" stroke="{INK}" stroke-width="1.6"/>',
         line([(x, y + 10), (x, y + 38)], color=INK, width=1.6),
         line([(x - 16, y + 20), (x + 16, y + 20)], color=INK, width=1.6),
         line([(x - 13, y + 60), (x, y + 38), (x + 13, y + 60)], color=INK, width=1.6),
         text(x, y + 80, name, 14, "bold")]
    if sub:
        o.append(text(x, y + 96, sub, 12, fill=GREY))
    return "".join(o)


def save(name, content):
    with open(os.path.join(OUT, name + ".svg"), "w", encoding="utf-8") as f:
        f.write(content)


# ---------------------------------------------------------------- synoptique
def synoptique():
    b = [text(30, 34, "Synoptique de la maquette au lycée (réseau isolé d’Internet, aucune donnée réelle)", 16, "bold", anchor="start")]
    b.append(box(30, 60, 300, 175, "Boîte noire (ESP32)", ["voyants du PC (phototransistors)", "5 V de l’USB, courant du lecteur", "horloge DS3231, carte microSD", "supercondensateur (réserve)", "LED de prévention ; sans radio"], hl=True))
    b.append(box(30, 300, 300, 100, "Lecteur de carte", ["carte PIV de laboratoire", "relié par un USB instrumenté"]))
    b.append(arrow(180, 298, 180, 237, "courant mesuré", lx=190, ly=272, anchor="start"))
    b.append(box(420, 60, 330, 200, "Poste Windows 11", ["agent « battement » (chaque seconde)", "collecteur au démarrage", "récit + journaux Windows", "diagnostic de la chaîne carte", "(5 maillons, remèdes à paliers)", "corrélateur → cause probable"]))
    b.append(arrow(330, 150, 418, 150, "USB", ly=142, both=True))
    b.append(arrow(330, 350, 418, 230, "USB", lx=390, ly=305))
    b.append(box(840, 60, 290, 140, "Serveur Ubuntu", ["API Python (FastAPI)", "base SQLite", "page web du support", "tableaux de bord"], hl=True))
    b.append(arrow(750, 130, 838, 130, "HTTPS + jeton", ly=122))
    b.append(box(840, 260, 290, 90, "Portail sécurisé de labo", ["exige un certificat client", "(TLS mutuel)"]))
    b.append(arrow(750, 230, 838, 300, "mTLS (certificat de la carte)", lx=845, ly=252, anchor="start"))
    b.append(box(420, 330, 330, 110, "Contrôleur de domaine commun", ["AD DS, DNS, NTP, AD CS (PKI de labo)", "préparé une fois pour la maquette,", "utilisé sans être administré"], dashed=False))
    b.append(arrow(585, 328, 585, 262, "DNS, Kerberos, LDAP, SMB, NTP", lx=595, ly=300, both=True, anchor="start"))
    b.append(box(840, 400, 290, 80, "Routeur Cisco ISR 4331", ["passerelle, source NTP"]))
    b.append(arrow(838, 430, 752, 400, "NTP", ly=405))
    b.append(box(420, 480, 330, 80, "Navigateur du technicien", ["incidents, statistiques"]))
    b.append(line([(750, 520), (1145, 520), (1145, 130), (1140, 130)]))
    b.append(arrow(1145, 130, 1132, 130))
    b.append(text(950, 512, "HTTPS (vers le serveur)", 12, fill=GREY))
    b.append(text(30, 600, "En bleu : réalisé par l’apprenti (boîtier, serveur). Le boîtier ne parle qu’au poste, par USB ; seul le poste parle au serveur.", 13, fill=GREY, anchor="start"))
    save("0_synoptique", svg(1170, 620, "".join(b)))


# ---------------------------------------------------------------- exigences
def req(x, y, w, h, rid, txt_lines, verif):
    o = [f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="#fff" stroke="#4b5563" stroke-width="1.4"/>',
         text(x + w / 2, y + 16, "«requirement»", 11, fill=GREY, italic=True),
         text(x + w / 2, y + 33, rid, 14, "bold"),
         line([(x, y + 42), (x + w, y + 42)], color="#4b5563", width=1)]
    cy = y + 60
    for t in txt_lines:
        o.append(text(x + 8, cy, t, 12.5, anchor="start"))
        cy += 17
    o.append(text(x + 8, y + h - 10, "Vérifié par : " + verif, 11.5, fill=BLUE, anchor="start"))
    return "".join(o)


def exigences():
    b = [text(30, 30, "Diagramme d’exigences (req) – chaque exigence a un indicateur mesuré sur la maquette", 16, "bold", anchor="start")]
    W, H = 255, 140
    px, py, pw, ph = 330, 48, 460, 92
    b.append(f'<rect x="{px}" y="{py}" width="{pw}" height="{ph}" fill="{BLUE_BG}" stroke="{BLUE}" stroke-width="2"/>')
    b.append(text(px + pw / 2, py + 17, "«requirement»", 11, fill=GREY, italic=True))
    b.append(text(px + pw / 2, py + 37, "E0 – Boîte noire du poste", 15, "bold"))
    b.append(text(px + pw / 2, py + 60, "Comprendre et prévenir les pannes, les mises à jour", 13))
    b.append(text(px + pw / 2, py + 78, "ratées et les échecs de connexion par carte", 13))
    reqs = [
        ("E1 – Témoigner", ["Classer arrêt normal, coupure,", "arrêt forcé, système figé :", "au moins 19 pannes sur 20"], "20 pannes provoquées"),
        ("E2 – Mémoire", ["Récit horodaté gardé après", "une coupure secteur", "(réserve d’énergie)"], "coupures + P3"),
        ("E3 – Expliquer", ["Croiser récit et journaux", "Windows : cause probable", "ou « non concluant »"], "mises à jour ratées"),
        ("E4 – Chaîne carte", ["Désigner le premier maillon", "en panne : 100 % des cas", "sur la maquette (V2)"], "pannes de maillons"),
        ("E5 – Prévenir", ["LED orange pendant une", "mise à jour : arrêts forcés", "en baisse (V2)"], "mesure avant / après"),
        ("E6 – Accompagner", ["Test de la carte le 1er jour ;", "libre-service avec un", "message simple (V2)"], "scénarios d’accueil"),
        ("E7 – Sécurité", ["Faux boîtier démasqué, ligne", "effacée détectée, API avec", "jeton et TLS"], "démonstration d’attaque"),
        ("E8 – Physique", ["Seuils, échantillonnage,", "énergie, carte vivante,", "dérive d’horloge (P1–P6)"], "mesures + incertitudes"),
    ]
    xs = [30, 300, 570, 840]
    ys = [205, 395]
    cx, cy = px + pw / 2, py + ph + 14
    b.append(f'<circle cx="{cx}" cy="{cy}" r="8" fill="#fff" stroke="{GREY}" stroke-width="1.5"/>')
    b.append(line([(cx - 8, cy), (cx + 8, cy)]))
    b.append(line([(cx, cy - 8), (cx, cy + 8)]))
    b.append(line([(cx, cy + 8), (cx, 180)]))
    b.append(line([(xs[0] + W / 2, 180), (xs[3] + W / 2, 180)]))
    for i, (rid, t, v) in enumerate(reqs):
        x = xs[i % 4]
        y = ys[i // 4]
        b.append(req(x, y, W, H, rid, t, v))
        b.append(line([(x + W / 2, 180 if i < 4 else 370), (x + W / 2, y)]))
    b.append(line([(xs[0] + W / 2, 370), (xs[3] + W / 2, 370)]))
    b.append(line([(xs[3] + W / 2, 180), (xs[3] + W + 12, 180), (xs[3] + W + 12, 370), (xs[3] + W / 2, 370)]))
    b.append(text(30, 562, "Le symbole ⊕ indique que E0 se décompose en E1 à E8. V1 : E1, E2, E3. V2 : E4 à E7. E8 : tout le long.", 12.5, fill=GREY, anchor="start"))
    save("1_exigences", svg(1125, 575, "".join(b)))


# ---------------------------------------------------------------- contexte
def contexte():
    b = [text(30, 30, "Diagramme de contexte – le système et ce qui l’entoure", 16, "bold", anchor="start")]
    sx, sy, sw, sh = 390, 220, 340, 150
    b.append(f'<rect x="{sx}" y="{sy}" width="{sw}" height="{sh}" fill="{BLUE_BG}" stroke="{BLUE}" stroke-width="2"/>')
    b.append(text(sx + sw / 2, sy + 22, "«system»", 11, fill=GREY, italic=True))
    b.append(text(sx + sw / 2, sy + 46, "Boîte noire du poste", 16, "bold"))
    for i, t in enumerate(["boîtier ESP32 + outils PowerShell", "(battement, collecteur, corrélateur,", "diagnostic carte) + serveur"]):
        b.append(text(sx + sw / 2, sy + 78 + i * 20, t, 13))
    b.append(actor(120, 60, "Technicien support", "lit la cause, applique le remède"))
    b.append(arrow(175, 120, sx - 2, sy + 30, "conclusions, remèdes", lx=300, ly=232))
    b.append(actor(120, 400, "Agent usager", "ou nouvel arrivant"))
    b.append(arrow(165, 450, sx - 2, sy + 120, "LED, message simple", lx=290, ly=440, both=True))
    b.append(text(290, 456, "libre-service, accueil", 12, fill=GREY))

    def ext(x, y, w, title, sub, dashed=False):
        return box(x, y, w, 64, title, [sub], dashed=dashed, stereo="«external»", tsize=14, lsize=12)
    b.append(ext(430, 60, 260, "Poste Windows 11", "support du projet (voyants, journaux)"))
    b.append(arrow(560, 126, 560, sy - 2, "voyants, journaux", lx=570, ly=180, both=True, anchor="start"))
    b.append(ext(430, 460, 260, "Lecteur + carte PIV", "carte de laboratoire"))
    b.append(arrow(560, sy + sh + 2, 560, 458, "courant, ATR", lx=570, ly=420, both=True, anchor="start"))
    b.append(ext(880, 60, 230, "Contrôleur de domaine", "commun, non administré"))
    b.append(arrow(880, 110, sx + sw + 2, sy + 30, "DNS, Kerberos, NTP", lx=835, ly=205, both=True))
    b.append(ext(880, 300, 230, "Portail sécurisé", "TLS mutuel (labo)"))
    b.append(arrow(sx + sw + 2, 330, 878, 330, "mTLS", ly=322, both=True))
    b.append(ext(880, 420, 230, "Outil de tickets", "extension", dashed=True))
    b.append(arrow(sx + sw + 2, 350, 878, 450, None, dashed=True))
    b.append(ext(110, 560, 290, "Alimentation et bouton", "coupure secteur, arrêt forcé"))
    b.append(arrow(400, 590, sx + 40, sy + sh + 2, "événements électriques", lx=420, ly=548, anchor="start"))
    b.append(text(30, 655, "Hors périmètre : réseau, AD et applications du service ; données de carrière ou de paye ; cartes d’agents.", 12.5, fill=GREY, anchor="start"))
    save("2_contexte", svg(1140, 670, "".join(b)))


# ---------------------------------------------------------------- cas d'utilisation
def cas():
    b = [text(30, 30, "Diagramme des cas d’utilisation (uc)", 16, "bold", anchor="start")]
    bx, by, bw, bh = 230, 50, 640, 590
    b.append(f'<rect x="{bx}" y="{by}" width="{bw}" height="{bh}" fill="#fff" stroke="#4b5563" stroke-width="1.4"/>')
    b.append(text(bx + bw / 2, by + 22, "Système « Boîte noire du poste »", 14, "bold"))

    def uc(cx, cy, t1, t2=None, rx=150):
        o = f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="27" fill="#fff" stroke="{BLUE}" stroke-width="1.5"/>'
        return o + text(cx, cy - 3, t1, 13) + text(cx, cy + 14, t2, 13)
    U = [
        (420, 105, "Enregistrer les événements", "du poste (récit horodaté)"),
        (420, 185, "Obtenir la cause probable", "d’une panne"),
        (700, 185, "Lire les journaux", "Windows"),
        (420, 265, "Diagnostiquer la chaîne", "carte → navigateur (V2)"),
        (700, 265, "Proposer un remède", "à paliers"),
        (420, 345, "Consulter les tableaux", "de bord"),
        (420, 425, "Être prévenu pendant une", "mise à jour (LED, V2)"),
        (420, 505, "Lancer le diagnostic en", "libre-service (V2)"),
        (420, 585, "Tester sa carte le", "premier jour (V2)"),
    ]
    for x, y, a, c in U:
        b.append(uc(x, y, a, c, rx=125 if x == 700 else 145))
    for y in (185, 265):
        b.append(arrow(565, y, 573, y, None, dashed=True, open_head=True))
        b.append(text(570, y - 13, "«include»", 11, fill=GREY, italic=True))
    b.append(actor(110, 60, "Démarrage", "du poste"))
    b.append(actor(110, 230, "Technicien"))
    b.append(actor(980, 420, "Agent usager"))
    b.append(actor(980, 560, "Nouvel arrivant"))
    L = lambda x1, y1, x2, y2: line([(x1, y1), (x2, y2)], color="#4b5563", width=1.2)
    b.append(L(130, 85, 275, 105))
    b.append(L(130, 95, 278, 180))
    b.append(L(130, 255, 278, 190))
    b.append(L(130, 255, 275, 265))
    b.append(L(130, 260, 278, 345))
    b.append(L(130, 265, 280, 580))
    b.append(L(960, 445, 565, 425))
    b.append(L(960, 450, 565, 505))
    b.append(L(960, 585, 565, 585))
    save("3_cas_utilisation", svg(1080, 660, "".join(b)))


# ---------------------------------------------------------------- séquence
def sequence():
    b = [text(30, 30, "Diagramme de séquence (sd) – une mise à jour interrompue par un arrêt forcé", 16, "bold", anchor="start")]
    L = {"brt": 150, "pst": 430, "srv": 720, "tec": 960}
    names = {"brt": ":Boîte noire", "pst": ":Poste (agent)", "srv": ":Serveur", "tec": "Technicien"}
    top, bottom = 60, 700
    for k, x in L.items():
        if k == "tec":
            b.append(actor(x, top - 8, ""))
            b.append(text(x, top + 82, names[k], 14, "bold"))
            y0 = top + 92
        else:
            hl = k in ("brt", "srv")
            b.append(f'<rect x="{x - 75}" y="{top}" width="150" height="40" fill="{BLUE_BG if hl else "#fff"}" stroke="{BLUE if hl else "#4b5563"}" stroke-width="1.4"/>')
            b.append(text(x, top + 26, names[k], 14, "bold"))
            y0 = top + 40
        b.append(line([(x, y0), (x, bottom)], dashed=True, color=LINE))

    def msg(a, c, y, label, ret=False):
        x1, x2 = L[a], L[c]
        return arrow(x1, y, x2 - (6 if x2 > x1 else -6), y, label, ly=y - 6, dashed=ret, open_head=ret, size=12.5)

    def self_(a, y, label, l2=None):
        x = L[a]
        o = line([(x, y), (x + 40, y), (x + 40, y + 22), (x + 6, y + 22)])
        o += arrow(x + 20, y + 22, x + 4, y + 22)
        o += text(x + 48, y + 8, label, 12.5, fill=GREY, anchor="start")
        if l2:
            o += text(x + 48, y + 24, l2, 12.5, fill=GREY, anchor="start")
        return o
    y = 170
    b.append(text(160, y - 4, "Pendant l’installation d’une mise à jour :", 12.5, BLUE, anchor="start", italic=True))
    b.append(msg("pst", "brt", y + 25, "1. battement + « mise à jour en cours » (USB)"))
    b.append(self_("brt", y + 40, "2. LED orange « ne pas éteindre »,", "horodate et écrit le récit chaîné"))
    b.append(text(160, y + 110, "L’agent appuie longtemps sur le bouton :", 12.5, BLUE, anchor="start", italic=True))
    b.append(self_("brt", y + 120, "3. battement perdu, voyant éteint ≈ 4 s", "après → « arrêt forcé » (réserve d’énergie)"))
    b.append(text(160, y + 190, "Au redémarrage :", 12.5, BLUE, anchor="start", italic=True))
    b.append(msg("pst", "brt", y + 210, "4. défi (HMAC)"))
    b.append(msg("brt", "pst", y + 245, "5. réponse + récit depuis la dernière lecture", ret=True))
    b.append(self_("pst", y + 265, "6. lit Kernel-Power 41 et Windows Update,", "corrélateur : « mise à jour interrompue »"))
    b.append(msg("pst", "srv", y + 330, "7. POST conclusion (HTTPS + jeton)"))
    b.append(msg("tec", "srv", y + 385, "8. ouvre la page web du support"))
    b.append(msg("srv", "tec", y + 420, "9. cause probable + remède proposé", ret=True))
    b.append(text(30, 730, "Serveur arrêté : le poste garde la conclusion en file d’attente. Sources en désaccord : « non concluant ».", 12.5, fill=GREY, anchor="start"))
    save("4_sequence", svg(1080, 745, "".join(b)))


# ---------------------------------------------------------------- Gantt
def gantt():
    start = dt.date(2027, 1, 1)
    end = dt.date(2027, 5, 15)
    days = (end - start).days + 1
    X0, X1 = 330, 1110
    px = (X1 - X0) / days
    xd = lambda d: X0 + (d - start).days * px
    D = dt.date
    tasks = [
        ("Lancement", None),
        ("Besoin, cahier des charges, risques (12 h)", (D(2027, 1, 4), D(2027, 1, 15)), "c3"),
        ("Laboratoire : domaine, PKI, portail, cartes (16 h)", (D(2027, 1, 11), D(2027, 1, 29)), "c10"),
        ("V1 – témoin des pannes", None),
        ("Boîtier : montage, firmware (22 h)", (D(2027, 1, 18), D(2027, 2, 19)), "c8"),
        ("Physique P1–P3 : voyants, échantillonnage, énergie", (D(2027, 2, 1), D(2027, 3, 5)), "phy"),
        ("Agent de battement et collecteur (12 h)", (D(2027, 2, 8), D(2027, 3, 5)), "c8"),
        ("Corrélateur (10 h)", (D(2027, 3, 1), D(2027, 3, 19)), "c8"),
        ("Serveur, page web, tableaux de bord (14 h)", (D(2027, 3, 8), D(2027, 4, 2)), "c8"),
        ("Captures réseau : DNS, Kerberos, LDAP, NTP, TLS", (D(2027, 2, 22), D(2027, 4, 9)), "c10"),
        ("Recette V1 : 20 pannes provoquées", (D(2027, 3, 22), D(2027, 4, 2)), "c10"),
        ("V2 – chaîne carte et usagers", None),
        ("Chaîne carte, LED, accueil, libre-service (24 h)", (D(2027, 3, 29), D(2027, 4, 30)), "c8"),
        ("Physique P4–P6 : carte vivante, ATR, horloges", (D(2027, 3, 22), D(2027, 4, 23)), "phy"),
        ("Sécurité et démonstration d’attaque (8 h)", (D(2027, 4, 19), D(2027, 4, 30)), "c10"),
        ("Tests V2 (10 h)", (D(2027, 4, 26), D(2027, 5, 7)), "c10"),
        ("Dossier et préparation de l’oral (6 h)", (D(2027, 5, 3), D(2027, 5, 14)), "c1"),
        ("Journal de bord, suivi IA, réunions (tout le long)", (D(2027, 1, 4), D(2027, 5, 14)), "c3"),
    ]
    col = {"c3": "#7c3aed", "c10": "#059669", "c8": BLUE, "phy": "#d97706", "c1": "#db2777"}
    rowh = 28
    top = 95
    H = top + len(tasks) * rowh + 110
    b = [text(30, 30, "Planning prévisionnel du 1er janvier au 15 mai 2027 (150 h)", 16, "bold", anchor="start")]
    months = [(D(2027, m, 1), n) for m, n in [(1, "Janvier"), (2, "Février"), (3, "Mars"), (4, "Avril"), (5, "Mai")]]
    for i, (d, n) in enumerate(months):
        d2 = months[i + 1][0] if i + 1 < len(months) else end + dt.timedelta(days=1)
        x1, x2 = xd(d), xd(d2)
        b.append(f'<rect x="{x1}" y="50" width="{x2 - x1}" height="22" fill="{"#f3f4f6" if i % 2 == 0 else "#e5e7eb"}" stroke="#d1d5db"/>')
        b.append(text((x1 + x2) / 2, 66, n, 13, "bold"))
    d = D(2027, 1, 4)
    while d <= end:
        x = xd(d)
        b.append(line([(x, 74), (x, top + len(tasks) * rowh)], color="#eef0f3", width=1))
        b.append(text(x + 2, 88, str(d.day), 10, fill=GREY, anchor="start"))
        d += dt.timedelta(days=7)
    for i, t in enumerate(tasks):
        y = top + i * rowh
        if t[1] is None:
            b.append(f'<rect x="20" y="{y + 2}" width="{X1 - 20}" height="{rowh - 4}" fill="#f9fafb"/>')
            b.append(text(28, y + 19, t[0], 13, "bold", anchor="start"))
            continue
        name, (d1, d2), c = t
        b.append(text(38, y + 19, name, 12.5, anchor="start"))
        x1, x2 = xd(d1), xd(d2 + dt.timedelta(days=1))
        b.append(f'<rect x="{x1}" y="{y + 6}" width="{x2 - x1}" height="{rowh - 12}" rx="3" fill="{col[c]}" opacity="0.85"/>')
    jal = [(D(2027, 1, 4), "Début"), (D(2027, 1, 29), "R1"), (D(2027, 3, 19), "R2"), (D(2027, 5, 14), "R3 + remise")]
    yb = top + len(tasks) * rowh
    for d, n in jal:
        x = xd(d) + px / 2
        b.append(line([(x, 74), (x, yb + 8)], color="#dc2626", width=1.4, dashed=True))
        b.append(f'<path d="M{x},{yb + 6} l8,8 l-8,8 l-8,-8 z" fill="#dc2626"/>')
        b.append(text(x, yb + 38, n, 12.5, "bold", fill="#dc2626"))
        b.append(text(x, yb + 53, d.strftime("%d/%m"), 11, fill="#dc2626"))
    ly = H - 22
    lx = 30
    for c, n in [("c3", "Gérer un projet (C03)"), ("c8", "Coder (C08)"), ("c10", "Exploiter le réseau, sécurité (C10)"),
                 ("phy", "Physique"), ("c1", "Communiquer (C01)")]:
        b.append(f'<rect x="{lx}" y="{ly - 11}" width="16" height="12" rx="2" fill="{col[c]}"/>')
        b.append(text(lx + 22, ly, n, 12.5, anchor="start"))
        lx += 215 if c != "c10" else 260
    save("5_gantt", svg(1170, H, "".join(b)))


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    synoptique(); exigences(); contexte(); cas(); sequence(); gantt()
    print("SVG écrits dans", OUT)
