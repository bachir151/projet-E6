# -*- coding: utf-8 -*-
"""Génère les schémas de la fiche académique de Lorenzo (apprenti 3), en SVG.
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
    b = [text(30, 34, "Synoptique de la maquette au lycée (réseau de laboratoire isolé, aucune donnée réelle)", 16, "bold", anchor="start")]
    b.append(box(30, 60, 300, 160, "Boîtier de présence", ["radar 24 GHz (LD2410)", "ESP32 + lumière tricolore", "chaque message signé (HMAC)", "sous le bureau, face au siège"], hl=True))
    b.append(box(420, 60, 330, 200, "Poste Windows 11 (VM)", ["service de présence (SYSTÈME)", "journal « PostePresence »", "tâche « Verrou » (session agent)", "tâche « Maintenance » (V2)", "script d’installation à paliers"]))
    b.append(arrow(330, 140, 418, 140, "USB série", ly=132, both=True))
    b.append(box(840, 60, 290, 150, "Serveur Ubuntu", ["API Python (FastAPI), SQLite", "liste des installations", "tableau de bord du parc", "partage des paquets (SMB)"], hl=True))
    b.append(arrow(750, 130, 838, 130, "HTTPS + jeton", ly=122))
    b.append(arrow(750, 190, 838, 190, "SMB (paquets)", ly=182))
    b.append(box(420, 330, 330, 110, "Contrôleur de domaine commun", ["AD DS, DNS, DHCP, NTP", "GPO : blocage après 10 min (filet)", "préparé par l’enseignant"]))
    b.append(arrow(585, 328, 585, 262, "Kerberos, LDAP, DNS, SMB", lx=595, ly=300, both=True, anchor="start"))
    b.append(box(840, 360, 290, 80, "Routeur Cisco ISR 4331", ["passerelle, source NTP"]))
    b.append(arrow(838, 400, 752, 400, "NTP", ly=392))
    b.append(box(840, 250, 290, 80, "PC du technicien", ["navigateur, Wireshark"]))
    b.append(arrow(985, 248, 985, 212, "HTTPS", lx=995, ly=235, anchor="start"))
    b.append(box(30, 300, 300, 100, "Outil de déploiement réel", ["en entreprise : il garde la liste", "des logiciels (extension)"], dashed=True))
    b.append(arrow(330, 340, 418, 245, "« quand » l’agent est absent", lx=250, ly=285, dashed=True, anchor="start"))
    b.append(text(30, 480, "En bleu : réalisé par l’apprenti (boîtier, serveur). La présence ne quitte jamais le poste : le serveur ne reçoit ni heures ni durées d’absence.", 13, fill=GREY, anchor="start"))
    save("0_synoptique", svg(1160, 500, "".join(b)))


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
    b.append(text(px + pw / 2, py + 37, "E0 – Poste attentif", 15, "bold"))
    b.append(text(px + pw / 2, py + 60, "Protéger l’écran quand l’agent part et installer", 13))
    b.append(text(px + pw / 2, py + 78, "les logiciels quand il n’est pas là", 13))
    reqs = [
        ("E1 – Bloquer vite", ["Écran bloqué quelques", "secondes après le départ", "(au lieu de 10 min)"], "R4, T01"),
        ("E2 – Ne pas gêner", ["Aucun blocage pendant", "30 min de travail assis,", "dont 10 min de lecture"], "T02, T03"),
        ("E3 – Agent seul", ["Le collègue voisin ou le", "passant n’est pas compté :", "agent parti, écran bloqué"], "R2, R3, T04"),
        ("E4 – Vrai boîtier", ["Chaque message signé ;", "un faux boîtier est", "démasqué"], "T06, T19, T20"),
        ("E5 – Filet", ["Boîtier débranché ou", "masqué : le blocage", "après 10 min reste actif"], "T05"),
        ("E6 – Bon moment", ["Aucune installation devant", "l’agent ; retour au milieu", "sans perte (V2)"], "T07–T11, R6"),
        ("E7 – Vie privée", ["Aucune heure ni durée", "d’absence envoyée", "au serveur"], "T23"),
        ("E8 – Données du parc", ["Tableau de bord : réussites,", "reports et raisons, postes", "en retard (V2)"], "démonstration"),
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
    b.append(text(30, 562, "Le symbole ⊕ indique que E0 se décompose en E1 à E8. V1 : E1 à E5 et E7. V2 : E6 et E8.", 12.5, fill=GREY, anchor="start"))
    save("1_exigences", svg(1125, 575, "".join(b)))


# ---------------------------------------------------------------- contexte
def contexte():
    b = [text(30, 30, "Diagramme de contexte – le système et ce qui l’entoure", 16, "bold", anchor="start")]
    sx, sy, sw, sh = 390, 220, 340, 150
    b.append(f'<rect x="{sx}" y="{sy}" width="{sw}" height="{sh}" fill="{BLUE_BG}" stroke="{BLUE}" stroke-width="2"/>')
    b.append(text(sx + sw / 2, sy + 22, "«system»", 11, fill=GREY, italic=True))
    b.append(text(sx + sw / 2, sy + 46, "Poste attentif", 16, "bold"))
    for i, t in enumerate(["boîtier radar + service de présence", "+ installations au bon moment", "+ serveur et tableau de bord"]):
        b.append(text(sx + sw / 2, sy + 78 + i * 20, t, 13))
    b.append(actor(120, 60, "Agent (bureau, accueil)", "travaille, s’absente"))
    b.append(arrow(175, 120, sx - 2, sy + 30, "présence (respiration)", lx=300, ly=232))
    b.append(actor(120, 400, "Technicien", "programme, installe"))
    b.append(arrow(165, 450, sx - 2, sy + 120, "paquets, enrôlement", lx=290, ly=440, both=True))
    b.append(text(290, 456, "tableau de bord", 12, fill=GREY))

    def ext(x, y, w, title, sub, dashed=False):
        return box(x, y, w, 64, title, [sub], dashed=dashed, stereo="«external»", tsize=14, lsize=12)
    b.append(ext(430, 60, 260, "Poste Windows 11", "support du projet (session, logiciels)"))
    b.append(arrow(560, 126, 560, sy - 2, "verrouillage, installations", lx=570, ly=180, both=True, anchor="start"))
    b.append(ext(880, 60, 230, "Contrôleur de domaine", "commun : GPO, heure"))
    b.append(arrow(880, 110, sx + sw + 2, sy + 30, "filet GPO, Kerberos", lx=835, ly=205, both=True))
    b.append(actor(1000, 300, "Collègue, visiteur", "de passage : à ne pas détecter"))
    b.append(arrow(950, 345, sx + sw + 2, 320, "ne doit pas compter", lx=840, ly=322))
    b.append(ext(880, 470, 230, "Outil de déploiement", "de l’entreprise (extension)", dashed=True))
    b.append(arrow(878, 500, sx + sw + 2, 355, None, dashed=True))
    b.append(ext(430, 470, 260, "Environnement", "ventilateur, rideau, métal, collègue"))
    b.append(arrow(560, 468, 560, sy + sh + 2, "fausses détections", lx=570, ly=430, anchor="start"))
    b.append(text(30, 600, "Hors périmètre : système d’information et outils réels de l’entreprise ; aucune caméra ; aucune donnée réelle.", 12.5, fill=GREY, anchor="start"))
    save("2_contexte", svg(1140, 615, "".join(b)))


# ---------------------------------------------------------------- cas d'utilisation
def cas():
    b = [text(30, 30, "Diagramme des cas d’utilisation (uc)", 16, "bold", anchor="start")]
    bx, by, bw, bh = 230, 50, 640, 590
    b.append(f'<rect x="{bx}" y="{by}" width="{bw}" height="{bh}" fill="#fff" stroke="#4b5563" stroke-width="1.4"/>')
    b.append(text(bx + bw / 2, by + 22, "Système « Poste attentif »", 14, "bold"))

    def uc(cx, cy, t1, t2, rx):
        o = f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="27" fill="#fff" stroke="{BLUE}" stroke-width="1.5"/>'
        return o + text(cx, cy - 3, t1, 13) + text(cx, cy + 14, t2, 13)
    U = [
        (420, 105, "Travailler sans être", "bloqué (lecture)"),
        (420, 185, "Être averti puis bloqué", "au départ"),
        (700, 185, "Vérifier le boîtier", "(message signé)"),
        (420, 265, "Retrouver son poste", "au retour"),
        (700, 345, "Installer pendant", "une absence (V2)"),
        (420, 345, "Programmer une", "installation (V2)"),
        (420, 425, "Installer un poste neuf", "(simulation puis réel)"),
        (420, 505, "Enrôler le boîtier", "(appui physique)"),
        (420, 585, "Consulter le tableau", "de bord du parc (V2)"),
    ]
    for x, y, a, c in U:
        b.append(uc(x, y, a, c, 125 if x == 700 else 145))
    b.append(arrow(565, 185, 573, 185, None, dashed=True, open_head=True))
    b.append(text(570, 172, "«include»", 11, fill=GREY, italic=True))
    b.append(actor(110, 110, "Agent"))
    b.append(actor(110, 420, "Technicien"))
    b.append(actor(980, 320, "Absence", "de 20 min"))
    L = lambda x1, y1, x2, y2: line([(x1, y1), (x2, y2)], color="#4b5563", width=1.2)
    for y in (105, 185, 265):
        b.append(L(130, 135, 275, y))
    for y in (345, 425, 505, 585):
        b.append(L(130, 445, 275, y))
    b.append(L(960, 345, 825, 345))
    save("3_cas_utilisation", svg(1080, 660, "".join(b)))


# ---------------------------------------------------------------- séquence
def sequence():
    b = [text(30, 30, "Diagramme de séquence (sd) – l’agent part, l’écran se bloque, une installation profite de l’absence", 16, "bold", anchor="start")]
    L = {"agt": 110, "brt": 360, "pst": 640, "srv": 930}
    names = {"agt": "Agent", "brt": ":Boîtier", "pst": ":Poste (service)", "srv": ":Serveur"}
    top, bottom = 60, 700
    for k, x in L.items():
        if k == "agt":
            b.append(actor(x, top - 8, ""))
            b.append(text(x, top + 82, names[k], 14, "bold"))
            y0 = top + 92
        else:
            hl = k in ("brt", "srv")
            b.append(f'<rect x="{x - 80}" y="{top}" width="160" height="40" fill="{BLUE_BG if hl else "#fff"}" stroke="{BLUE if hl else "#4b5563"}" stroke-width="1.4"/>')
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
    y = 175
    b.append(msg("brt", "pst", y, "1. « présent » + preuve (chaque seconde)"))
    b.append(self_("pst", y + 12, "2. vérifie la preuve et le compteur"))
    b.append(text(125, y + 72, "L’agent se lève et part", 12.5, BLUE, anchor="start", italic=True))
    b.append(msg("brt", "pst", y + 95, "3. « personne » + preuve"))
    b.append(self_("pst", y + 107, "4. 5 s confirmées → événement 110"))
    b.append(msg("pst", "brt", y + 160, "5. lumière orange (3 s)", ret=True))
    b.append(self_("pst", y + 172, "6. événement 120 → tâche « Verrou » :", "session bloquée (événement 4800)"))
    b.append(msg("pst", "brt", y + 235, "7. lumière rouge", ret=True))
    b.append(text(125, y + 275, "20 minutes d’absence (V2)", 12.5, BLUE, anchor="start", italic=True))
    b.append(msg("pst", "srv", y + 298, "8. GET liste des installations (HTTPS)"))
    b.append(self_("pst", y + 310, "9. empreinte vérifiée, logiciel fermé ?", "→ msiexec /qn /norestart"))
    b.append(msg("pst", "srv", y + 372, "10. POST résultat : jour, sans heure (jeton)"))
    b.append(text(125, y + 412, "L’agent revient", 12.5, BLUE, anchor="start", italic=True))
    b.append(msg("brt", "pst", y + 435, "11. « présent » → événement 100, lumière verte"))
    b.append(text(30, 730, "Une installation déjà commencée se termine ; les tâches interruptibles s’arrêtent ; aucun redémarrage avec une session ouverte.", 12.5, fill=GREY, anchor="start"))
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
        ("Besoin chiffré, cahier des charges, vie privée", (D(2027, 1, 4), D(2027, 1, 15)), "c3"),
        ("Maquette : domaine commun, GPO filet, journal", (D(2027, 1, 11), D(2027, 1, 22)), "c10"),
        ("V1 – blocage de l’écran", None),
        ("Boîtier : montage, firmware, lumière", (D(2027, 1, 18), D(2027, 2, 12)), "c8"),
        ("Physique R1–R3 : seuils et zone", (D(2027, 2, 1), D(2027, 2, 26)), "phy"),
        ("Message signé + enrôlement du boîtier", (D(2027, 2, 8), D(2027, 2, 26)), "c8"),
        ("Service de présence + blocage", (D(2027, 2, 15), D(2027, 3, 12)), "c8"),
        ("Physique R4–R5 : délai, fausses alertes", (D(2027, 3, 1), D(2027, 3, 19)), "phy"),
        ("Captures réseau : DHCP, DNS, Kerberos, SMB, HTTPS", (D(2027, 2, 22), D(2027, 4, 2)), "c10"),
        ("Recette V1", (D(2027, 3, 8), D(2027, 3, 19)), "c10"),
        ("Poste Windows 11 réinstallé (fin des 90 jours)", (D(2027, 4, 5), D(2027, 4, 9)), "c10"),
        ("V2 – installer au bon moment", None),
        ("Installation pendant les absences", (D(2027, 3, 22), D(2027, 4, 23)), "c8"),
        ("Serveur + tableau de bord du parc", (D(2027, 3, 29), D(2027, 4, 30)), "c8"),
        ("Poste neuf : script à paliers", (D(2027, 4, 19), D(2027, 4, 30)), "c8"),
        ("Essai R6 : apport mesuré", (D(2027, 4, 26), D(2027, 5, 7)), "c10"),
        ("Dossier et préparation de l’oral", (D(2027, 5, 3), D(2027, 5, 14)), "c1"),
        ("Journal de bord, suivi IA, réunions (tout le long)", (D(2027, 1, 4), D(2027, 5, 14)), "c3"),
    ]
    col = {"c3": "#7c3aed", "c10": "#059669", "c8": BLUE, "phy": "#d97706", "c1": "#db2777"}
    rowh = 28
    top = 95
    H = top + len(tasks) * rowh + 110
    b = [text(30, 30, "Planning prévisionnel du 1er janvier au 15 mai 2027 (≈ 150 h : V1 ≈ 108 h, V2 ≈ 40 h)", 16, "bold", anchor="start")]
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
    for c, n in [("c3", "Gérer un projet (C03)"), ("c8", "Coder (C08)"), ("c10", "Exploiter le réseau, tests (C10)"),
                 ("phy", "Physique"), ("c1", "Communiquer (C01)")]:
        b.append(f'<rect x="{lx}" y="{ly - 11}" width="16" height="12" rx="2" fill="{col[c]}"/>')
        b.append(text(lx + 22, ly, n, 12.5, anchor="start"))
        lx += 215 if c != "c10" else 260
    save("5_gantt", svg(1170, H, "".join(b)))


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    synoptique(); exigences(); contexte(); cas(); sequence(); gantt()
    print("SVG écrits dans", OUT)
