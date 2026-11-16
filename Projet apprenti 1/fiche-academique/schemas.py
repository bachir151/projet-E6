# -*- coding: utf-8 -*-
"""Génère les schémas de la fiche académique de Wassim (apprenti 1) – projet « Le service informatique augmenté », en SVG.
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
    b = [text(30, 34, "Synoptique de la maquette au lycée (réseau exploité tel quel, aucune connexion à l’hôpital, aucune donnée réelle)", 16, "bold", anchor="start")]
    b.append(box(30, 60, 270, 160, "Boîtier de l’imprimante", ["ESP32 (C++), Wi-Fi", "accéléromètre : vibration", "infrarouge : feuilles qui sortent", "bouton, écran à encre", "lecteur RFID (V2)"], hl=True))
    b.append(box(400, 60, 340, 190, "Serveur – PC Ubuntu", ["Mosquitto (MQTT sur TLS)", "CUPS : serveur d’impression", "service Python : compare les témoins", "PostgreSQL, tableau de bord", "interroge l’imprimante (SNMP),", "le PC (JEA) et l’AD (LDAP)"], hl=True))
    b.append(arrow(300, 140, 398, 140, "MQTT / TLS", ly=132, both=True))
    b.append(box(30, 260, 270, 100, "Imprimante réseau", ["du lycée ou de récupération", "SNMP (état, encre), IPP"]))
    b.append(arrow(400, 230, 302, 290, "SNMP, IPP", lx=352, ly=250, anchor="end"))
    b.append(box(30, 400, 270, 100, "Station des PC neufs (V2)", ["ESP32, lecteur RFID", "écran, LED, bouton"], dashed=True, hl=True))
    b.append(arrow(302, 440, 430, 252, "MQTT / TLS", lx=324, ly=424, dashed=True, anchor="start", size=11))
    b.append(box(400, 320, 160, 118, "PC secrétaire", ["VM Windows 11", "Entreprise", "point d’accès JEA"]))
    b.append(arrow(480, 252, 480, 318, "WinRM HTTPS", lx=486, ly=290, anchor="start", size=11))
    b.append(box(580, 320, 160, 118, "PC neuf (V2)", ["VM Windows 11", "Entreprise", "script PowerShell"], dashed=True))
    b.append(arrow(660, 252, 660, 318, "commande", lx=666, ly=290, anchor="start", dashed=True, size=11))
    b.append(box(840, 60, 290, 100, "GLPI dans Docker", ["données fictives", "compte de service limité"], hl=True))
    b.append(arrow(742, 110, 838, 110, "API REST", ly=102, both=True, size=11))
    b.append(box(840, 190, 290, 80, "PC du technicien", ["navigateur : GLPI, tableau de bord"]))
    b.append(box(840, 300, 290, 100, "Annuaire AD – Samba (Ubuntu)", ["domaine de la maquette (commun)", "partage des applications"]))
    b.append(arrow(742, 230, 838, 320, "LDAP", lx=794, ly=262, anchor="start", size=11))
    b.append(arrow(742, 400, 838, 380, "jonction, partage", lx=790, ly=416, dashed=True, size=11))
    b.append(box(840, 430, 290, 80, "Réseau de la maquette", ["Wi-Fi, DHCP, DNS, NTP, switchs, routeur"]))
    b.append(text(30, 545, "En bleu : réalisé par l’apprenti. Pointillés : V2. Windows 11 Famille ne peut rejoindre aucun domaine : les PC Windows sont des machines", 13, fill=GREY, anchor="start"))
    b.append(text(30, 563, "virtuelles Windows 11 Entreprise (version d’évaluation) ou des PC sous Windows 11 Pro. L’AD est simulé par Samba sur Ubuntu.", 13, fill=GREY, anchor="start"))
    save("0_synoptique", svg(1160, 580, "".join(b)))


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
    b.append(text(px + pw / 2, py + 37, "E0 – Le service informatique augmenté", 15, "bold"))
    b.append(text(px + pw / 2, py + 60, "Voir la panne d’imprimante, trouver la cause, ouvrir", 13))
    b.append(text(px + pw / 2, py + 78, "le ticket avec la preuve ; préparer les PC neufs (V2)", 13))
    reqs = [
        ("E1 – Bonne cause", ["10 pannes provoquées :", "cause juste dans", "au moins 9 cas"], "campagne d’essai"),
        ("E2 – Pas de fausse alerte", ["1 h d’impressions", "normales :", "aucun ticket"], "essai d’1 h"),
        ("E3 – Rapide", ["Moins d’1 minute entre", "l’impression ratée", "et le ticket"], "chronométrage"),
        ("E4 – Feuilles comptées", ["100 feuilles : au plus", "1 erreur ; 10 pages de", "test vues sur 10"], "comptage"),
        ("E5 – Diagnostic borné", ["JEA : commande hors liste", "refusée et tracée ;", "lecture seule du PC"], "démonstration"),
        ("E6 – Retour au terrain", ["Écran du boîtier à jour", "en moins d’1 minute ;", "témoins dans le ticket"], "chronométrage"),
        ("E7 – Bon réseau", ["Imprimante hors du réseau", "attendu par l’AD :", "signalée 5 fois sur 5"], "essai, capture"),
        ("E8 – PC neufs (V2)", ["5 PC préparés : bon service", "dans l’AD, applications,", "fiche GLPI à jour"], "essai de la station"),
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
    b.append(text(30, 562, "Le symbole ⊕ indique que E0 se décompose en E1 à E8. V1 : E1 à E7 (paliers 1 et 2). V2 : E8, carte de Wassim, preuve de réparation, encre, palier 3.", 12.5, fill=GREY, anchor="start"))
    save("1_exigences", svg(1125, 575, "".join(b)))


# ---------------------------------------------------------------- contexte
def contexte():
    b = [text(30, 30, "Diagramme de contexte – le système et ce qui l’entoure", 16, "bold", anchor="start")]
    sx, sy, sw, sh = 390, 220, 340, 150
    b.append(f'<rect x="{sx}" y="{sy}" width="{sw}" height="{sh}" fill="{BLUE_BG}" stroke="{BLUE}" stroke-width="2"/>')
    b.append(text(sx + sw / 2, sy + 22, "«system»", 11, fill=GREY, italic=True))
    b.append(text(sx + sw / 2, sy + 46, "Le service informatique augmenté", 14.5, "bold"))
    for i, t in enumerate(["boîtier collé sur l’imprimante", "+ serveur (règles, tickets, tableau de bord)", "+ station des PC neufs (V2)"]):
        b.append(text(sx + sw / 2, sy + 78 + i * 20, t, 13))
    b.append(actor(120, 60, "Secrétaire", "imprime, appuie sur le bouton"))
    b.append(arrow(175, 120, sx - 2, sy + 30, "bouton, écran", lx=290, ly=232, anchor="end", both=True))
    b.append(actor(120, 400, "Technicien support", "lit, décide, pose sa carte"))
    b.append(arrow(165, 450, sx - 2, sy + 120, "ticket, validation", lx=290, ly=440, both=True))
    b.append(text(290, 456, "(palier 2), 3 cartes (V2)", 12, fill=GREY))

    def ext(x, y, w, title, sub, dashed=False):
        return box(x, y, w, 64, title, [sub], dashed=dashed, stereo="«external»", tsize=14, lsize=12)
    b.append(ext(430, 60, 260, "Imprimante réseau", "vibre, sort les feuilles"))
    b.append(arrow(560, 126, 560, sy - 2, "vibration, feuilles, état", lx=570, ly=180, anchor="start", both=True))
    b.append(text(570, 196, "(SNMP)", 12, fill=GREY, anchor="start"))
    b.append(ext(880, 60, 230, "PC de la secrétaire", "Windows 11, file d’impression"))
    b.append(arrow(880, 110, sx + sw + 2, sy + 30, "file d’impression", lx=842, ly=212, both=True, anchor="start"))
    b.append(text(842, 228, "(lecture seule, JEA)", 12, fill=GREY, anchor="start"))
    b.append(ext(880, 270, 230, "GLPI", "tickets, fiches des PC"))
    b.append(arrow(878, 300, sx + sw + 2, 300, "tickets, suivis", ly=292, both=True))
    b.append(ext(880, 470, 230, "Annuaire AD (Samba)", "service de chaque PC"))
    b.append(arrow(878, 500, sx + sw + 2, 355, "service, réseau attendu", lx=822, ly=418, anchor="start"))
    b.append(ext(430, 470, 260, "Réseau de la maquette", "Wi-Fi, DHCP, DNS, NTP"))
    b.append(arrow(560, 468, 560, sy + sh + 2, "adresses, heure commune", lx=570, ly=430, both=True, anchor="start"))
    b.append(ext(60, 560, 250, "PC neuf (V2)", "Windows 11 Entreprise", dashed=True))
    b.append(arrow(312, 590, sx + 40, sy + sh + 2, "préparation (V2)", lx=330, ly=610, dashed=True, anchor="start"))
    b.append(text(30, 670, "Hors périmètre : dossier patient informatisé, réseau, imprimantes et postes réels de l’hôpital. Aucune donnée patient : le système lit le nombre de documents, jamais leur nom.", 12.5, fill=GREY, anchor="start"))
    save("2_contexte", svg(1140, 685, "".join(b)))


# ---------------------------------------------------------------- cas d'utilisation
def cas():
    b = [text(30, 30, "Diagramme des cas d’utilisation (uc)", 16, "bold", anchor="start")]
    bx, by, bw, bh = 230, 50, 640, 600
    b.append(f'<rect x="{bx}" y="{by}" width="{bw}" height="{bh}" fill="#fff" stroke="#4b5563" stroke-width="1.4"/>')
    b.append(text(bx + bw / 2, by + 22, "Système « Le service informatique augmenté »", 14, "bold"))

    def uc(cx, cy, t1, t2, rx, dashed=False):
        d = ' stroke-dasharray="6 4"' if dashed else ""
        o = f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="27" fill="#fff" stroke="{BLUE}" stroke-width="1.5"{d}/>'
        return o + text(cx, cy - 3, t1, 13) + text(cx, cy + 14, t2, 13)
    G = [
        (400, 105, "Surveiller l’impression", "(vibration, feuilles)", False),
        (400, 185, "Signaler une panne", "(bouton)", False),
        (400, 265, "Lire le ticket et", "le tableau de bord", False),
        (400, 345, "Valider une action", "proposée (palier 2)", False),
        (400, 425, "Pointer une intervention", "avec sa carte (V2)", True),
        (400, 505, "Préparer un PC neuf", "avec 3 cartes (V2)", True),
        (400, 585, "Régler les seuils", "et le palier", False),
    ]
    D = [
        (720, 145, "Comparer les témoins,", "trouver la cause", False),
        (720, 225, "Interroger", "l’imprimante (SNMP)", False),
        (720, 305, "Lire la file", "du PC (JEA)", False),
        (720, 385, "Ouvrir ou compléter", "le ticket (paliers)", False),
        (720, 465, "Afficher l’état", "sur le boîtier", False),
        (720, 545, "Ranger le PC dans le", "bon service (V2)", True),
    ]
    for x, y, a, c, dsh in G:
        b.append(uc(x, y, a, c, 140, dsh))
    for x, y, a, c, dsh in D:
        b.append(uc(x, y, a, c, 125, dsh))

    def inc(x1, y1, x2, y2, tx, ty, anchor="start"):
        return arrow(x1, y1, x2, y2, None, dashed=True, open_head=True) + text(tx, ty, "«include»", 11, fill=GREY, italic=True, anchor=anchor)
    b.append(inc(530, 115, 600, 135, 548, 112))
    b.append(inc(720, 172, 720, 196, 728, 190))
    b.append(inc(720, 252, 720, 276, 728, 270))
    b.append(inc(530, 515, 600, 535, 548, 512))
    b.append(actor(110, 90, "Secrétaire"))
    b.append(actor(110, 380, "Technicien"))
    b.append(actor(990, 160, "Imprimante"))
    b.append(actor(990, 290, "PC secrétaire"))
    b.append(actor(990, 420, "GLPI"))
    b.append(actor(990, 540, "AD (Samba)"))
    Lk = lambda x1, y1, x2, y2: line([(x1, y1), (x2, y2)], color="#4b5563", width=1.2)
    for y in (105, 185):
        b.append(Lk(130, 115, 260, y))
    for y in (265, 345, 425, 505, 585):
        b.append(Lk(130, 405, 260, y))
    b.append(Lk(970, 185, 845, 225))
    b.append(Lk(970, 315, 845, 305))
    b.append(Lk(970, 445, 845, 385))
    b.append(Lk(970, 565, 845, 545))
    b.append(text(30, 680, "Pointillés : V2. Le système ne supprime aucun ticket ; il ne le ferme qu’avec une preuve (page de test vue, ou feuilles qui ressortent).", 12.5, fill=GREY, anchor="start"))
    save("3_cas_utilisation", svg(1090, 695, "".join(b)))


# ---------------------------------------------------------------- séquence
def sequence():
    b = [text(30, 30, "Diagramme de séquence (sd) – l’imprimante est figée : elle dit « tout va bien » mais rien ne sort", 16, "bold", anchor="start")]
    L = {"sec": 70, "pcs": 215, "srv": 410, "imp": 600, "brt": 770, "glpi": 930, "tech": 1085}
    names = {"sec": "Secrétaire", "pcs": ":PC secrétaire", "srv": ":Serveur", "imp": ":Imprimante", "brt": ":Boîtier", "glpi": ":GLPI", "tech": "Technicien"}
    top, bottom = 60, 830
    for k, x in L.items():
        if k in ("sec", "tech"):
            b.append(actor(x, top - 8, ""))
            b.append(text(x, top + 82, names[k], 14, "bold"))
            y0 = top + 92
        else:
            hl = k in ("brt", "srv")
            b.append(f'<rect x="{x - 68}" y="{top}" width="136" height="40" fill="{BLUE_BG if hl else "#fff"}" stroke="{BLUE if hl else "#4b5563"}" stroke-width="1.4"/>')
            b.append(text(x, top + 26, names[k], 14, "bold"))
            y0 = top + 40
        b.append(line([(x, y0), (x, bottom)], dashed=True, color=LINE))

    def msg(a, c, y, label, ret=False, lx=None):
        x1, x2 = L[a], L[c]
        return arrow(x1, y, x2 - (6 if x2 > x1 else -6), y, label, lx=lx, ly=y - 6, dashed=ret, open_head=ret, size=12)

    def self_(a, y, label, l2=None):
        x = L[a]
        o = line([(x, y), (x + 40, y), (x + 40, y + 22), (x + 6, y + 22)])
        o += arrow(x + 20, y + 22, x + 4, y + 22)
        o += text(x + 48, y + 8, label, 12, fill=GREY, anchor="start")
        if l2:
            o += text(x + 48, y + 24, l2, 12, fill=GREY, anchor="start")
        return o

    def note(y, t):
        return text(30, y, t, 12.5, BLUE, anchor="start", italic=True)
    y = 170
    b.append(note(y, "9:10:00 – la secrétaire imprime un compte rendu"))
    b.append(msg("sec", "pcs", y + 30, "1. imprimer (5 p.)"))
    b.append(msg("pcs", "srv", y + 65, "2. travail d’impression (IPP)"))
    b.append(msg("srv", "imp", y + 100, "3. les 5 pages"))
    b.append(note(y + 140, "9:10:30 – rien ne sort"))
    b.append(msg("brt", "srv", y + 165, "4. vibration : non ; feuilles : 0 (MQTT)"))
    b.append(msg("srv", "imp", y + 200, "5. état ? (SNMP)"))
    b.append(msg("imp", "srv", y + 235, "6. « prête, aucune erreur »", ret=True))
    b.append(msg("srv", "pcs", y + 270, "7. file ? (JEA)"))
    b.append(msg("pcs", "srv", y + 305, "8. 0 document", ret=True))
    b.append(self_("srv", y + 325, "9. envoyé, rien ne bouge, elle dit « ça va »", "→ imprimante figée"))
    b.append(msg("srv", "glpi", y + 390, "10. ticket + « redémarrer ? » (palier 2)"))
    b.append(msg("srv", "brt", y + 425, "11. écran « Bloquée »", lx=690))
    b.append(note(y + 465, "9:11:10"))
    b.append(msg("tech", "srv", y + 485, "12. valide le redémarrage", lx=840))
    b.append(msg("srv", "imp", y + 520, "13. redémarrage"))
    b.append(note(y + 560, "9:14:00"))
    b.append(msg("brt", "srv", y + 580, "14. vibration ; 5 feuilles comptées"))
    b.append(msg("srv", "glpi", y + 615, "15. résolu, preuve jointe"))
    b.append(msg("srv", "brt", y + 650, "16. écran « Réparé »", lx=690))
    b.append(text(30, 860, "Palier 1 : le système conseille seulement. Palier 3 (V2) : il redémarre seul, la nuit, et le note dans le ticket.", 12.5, fill=GREY, anchor="start"))
    save("4_sequence", svg(1160, 875, "".join(b)))


# ---------------------------------------------------------------- Gantt
def gantt():
    start = dt.date(2027, 1, 1)
    end = dt.date(2027, 5, 15)
    days = (end - start).days + 1
    X0, X1 = 430, 1150
    px = (X1 - X0) / days
    xd = lambda d: X0 + (d - start).days * px
    D = dt.date
    tasks = [
        ("Cadrage", None),
        ("1. Besoin, cahier des charges, planning (12 h)", (D(2027, 1, 4), D(2027, 1, 22)), "c3"),
        ("V1 – voir la panne, trouver la cause, ouvrir le ticket", None),
        ("2. Maquette : GLPI, CUPS, VM Windows 11, imprimante (12 h)", (D(2027, 1, 11), D(2027, 1, 29)), "c10"),
        ("3. Boîtier : vibration, feuilles, bouton, écran (27 h)", (D(2027, 1, 18), D(2027, 3, 5)), "c8"),
        ("4. Physique : vibration, vitesse des feuilles (10 h)", (D(2027, 2, 1), D(2027, 3, 12)), "phy"),
        ("5. Serveur : règles, SNMP, vérifications réseau (22 h)", (D(2027, 2, 8), D(2027, 3, 19)), "c8"),
        ("7. Réseau : DHCP, DNS, NTP, SNMP, captures (8 h)", (D(2027, 2, 8), D(2027, 4, 9)), "c10"),
        ("6. PowerShell : file d’impression (JEA), AD (14 h)", (D(2027, 2, 22), D(2027, 3, 26)), "c8"),
        ("8. GLPI : tickets à paliers, écran, tableau de bord (16 h)", (D(2027, 3, 15), D(2027, 4, 16)), "c8"),
        ("V2 – RFID et PC neufs", None),
        ("9. RFID : carte, preuve, station des PC neufs (14 h)", (D(2027, 4, 6), D(2027, 4, 30)), "c8"),
        ("10. Campagne d’essai, indicateurs, bilan (7 h)", (D(2027, 4, 26), D(2027, 5, 7)), "c3"),
        ("11. Dossier et préparation de l’oral (8 h)", (D(2027, 5, 3), D(2027, 5, 14)), "c1"),
        ("Journal de bord, journal IA, réunions (tout le long)", (D(2027, 1, 4), D(2027, 5, 14)), "c3"),
    ]
    col = {"c3": "#7c3aed", "c10": "#059669", "c8": BLUE, "phy": "#d97706", "c1": "#db2777"}
    rowh = 28
    top = 95
    H = top + len(tasks) * rowh + 110
    b = [text(30, 30, "Planning prévisionnel du 1er janvier au 15 mai 2027 (150 h, 11 tâches)", 16, "bold", anchor="start")]
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
    jal = [(D(2027, 1, 4), "Début"), (D(2027, 1, 29), "R1"), (D(2027, 3, 19), "R2"), (D(2027, 5, 7), "R3"), (D(2027, 5, 14), "Remise")]
    yb = top + len(tasks) * rowh
    for d, n in jal:
        x = xd(d) + px / 2
        b.append(line([(x, 74), (x, yb + 8)], color="#dc2626", width=1.4, dashed=True))
        b.append(f'<path d="M{x},{yb + 6} l8,8 l-8,8 l-8,-8 z" fill="#dc2626"/>')
        b.append(text(x, yb + 38, n, 12.5, "bold", fill="#dc2626"))
        b.append(text(x, yb + 53, d.strftime("%d/%m"), 11, fill="#dc2626"))
    ly = H - 22
    lx = 30
    for c, n in [("c3", "Gérer un projet (C03)"), ("c8", "Coder (C08)"), ("c10", "Exploiter le réseau (C10)"),
                 ("phy", "Physique"), ("c1", "Communiquer (C01)")]:
        b.append(f'<rect x="{lx}" y="{ly - 11}" width="16" height="12" rx="2" fill="{col[c]}"/>')
        b.append(text(lx + 22, ly, n, 12.5, anchor="start"))
        lx += 220
    save("5_gantt", svg(1180, H, "".join(b)))


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    synoptique(); exigences(); contexte(); cas(); sequence(); gantt()
    print("SVG écrits dans", OUT)
