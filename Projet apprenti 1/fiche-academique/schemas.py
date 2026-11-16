# -*- coding: utf-8 -*-
"""Génère les schémas de la fiche académique de Wassim (apprenti 1), en SVG.
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
    b.append(box(30, 60, 300, 175, "Boîtier du chariot", ["ESP32 (C++), batterie Li-Po de secours", "MPU6050 : secousses (100 Hz)", "INA219 : 5 V de l’USB du PC", "SHT31 : température, humidité", "heure NTP, numéro de séquence", "mémoire flash si Wi-Fi coupé"], hl=True))
    b.append(box(420, 60, 330, 175, "Serveur – PC Ubuntu", ["Mosquitto (MQTT sur TLS)", "service Python : règles, corrélation", "pilote le diagnostic et GLPI", "PostgreSQL : mesures et événements", "rapport ; frise Grafana (V2)"], hl=True))
    b.append(arrow(330, 120, 418, 120, "MQTT / TLS", ly=112))
    b.append(text(374, 140, "Wi-Fi, 8883", 12, fill=GREY))
    b.append(box(840, 60, 290, 175, "PC du chariot – Windows", ["portable de récupération", "point d’accès WinRM restreint (JEA)", "script PowerShell de diagnostic :", "journal, batterie, disque", "lecture seule, aucune correction"]))
    b.append(arrow(750, 140, 838, 140, "WinRM HTTPS", ly=132))
    b.append(text(794, 160, "5986", 12, fill=GREY))
    b.append(box(420, 320, 330, 100, "GLPI dans Docker", ["données fictives", "compte de service à droits limités"], hl=True))
    b.append(arrow(585, 237, 585, 318, "API REST (HTTPS)", lx=595, ly=282, anchor="start"))
    b.append(box(880, 320, 250, 80, "PC du technicien", ["navigateur : tickets GLPI"]))
    b.append(arrow(878, 360, 752, 360, "HTTPS", lx=815, ly=352))
    b.append(box(30, 320, 300, 100, "Réseau de la maquette", ["Wi-Fi, DHCP, DNS, NTP", "routeur Cisco ISR 4331", "exploité, non reconfiguré"]))
    b.append(arrow(180, 318, 180, 237, "NTP, DHCP, DNS", lx=190, ly=285, anchor="start"))
    b.append(line([(858, 237), (858, 470), (370, 470), (370, 200)]))
    b.append(arrow(370, 200, 332, 200))
    b.append(text(614, 462, "Câble USB : le PC alimente le boîtier, qui mesure ce 5 V (aucune donnée échangée)", 12.5, fill=GREY))
    b.append(text(30, 510, "En bleu : réalisé par l’apprenti (boîtier, service et base du serveur, GLPI de test). Le script PowerShell et le point JEA sont aussi écrits par l’apprenti.", 13, fill=GREY, anchor="start"))
    save("0_synoptique", svg(1160, 530, "".join(b)))


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
    b.append(text(px + pw / 2, py + 37, "E0 – Supervision instrumentée des chariots de soins", 15, "bold"))
    b.append(text(px + pw / 2, py + 60, "Voir la panne au moment où elle arrive", 13))
    b.append(text(px + pw / 2, py + 78, "et ouvrir le ticket avec la preuve", 13))
    reqs = [
        ("E1 – Voir les pannes", ["Au moins 19 pannes", "provoquées sur 20 détectées", "et bien classées"], "campagne d’essai"),
        ("E2 – Pas de fausse alerte", ["Chariot roulé 1 h, seuils", "et chocs ordinaires compris :", "0 ticket proposé"], "essai de roulage"),
        ("E3 – Rapide", ["Moins d’1 minute entre", "la coupure du 5 V", "et le ticket"], "chronométrage"),
        ("E4 – Tenir", ["72 h sans perte ; Wi-Fi", "coupé : mesures gardées", "puis renvoyées"], "essai 72 h, capture"),
        ("E5 – Diagnostic borné", ["JEA : commande hors liste", "refusée et tracée ;", "lecture seule du PC"], "démonstration"),
        ("E6 – Ticket utile", ["Frise, cause probable et", "diagnostic dans le ticket ;", "paliers, 1 ticket par jour"], "avis du technicien"),
        ("E7 – Horloges alignées", ["Écart NTP entre boîtier,", "serveur et PC mesuré", "et affiché dans le rapport"], "mesure, capture"),
        ("E8 – Bilan chiffré", ["« Je recommande » ou non :", "coût des boîtiers contre", "déplacements évités (V2)"], "bilan écrit"),
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
    b.append(text(30, 562, "Le symbole ⊕ indique que E0 se décompose en E1 à E8. V1 : E1 à E7 (paliers 1 et 2). V2 : E8, palier 3, température et frise Grafana.", 12.5, fill=GREY, anchor="start"))
    save("1_exigences", svg(1125, 575, "".join(b)))


# ---------------------------------------------------------------- contexte
def contexte():
    b = [text(30, 30, "Diagramme de contexte – le système et ce qui l’entoure", 16, "bold", anchor="start")]
    sx, sy, sw, sh = 390, 220, 340, 150
    b.append(f'<rect x="{sx}" y="{sy}" width="{sw}" height="{sh}" fill="{BLUE_BG}" stroke="{BLUE}" stroke-width="2"/>')
    b.append(text(sx + sw / 2, sy + 22, "«system»", 11, fill=GREY, italic=True))
    b.append(text(sx + sw / 2, sy + 46, "Supervision instrumentée des chariots", 14.5, "bold"))
    for i, t in enumerate(["boîtier posé sur le chariot", "+ service de corrélation (serveur)", "+ diagnostic à distance et tickets"]):
        b.append(text(sx + sw / 2, sy + 78 + i * 20, t, 13))
    b.append(actor(120, 60, "Soignant", "pousse le chariot, saisit"))
    b.append(arrow(175, 120, sx - 2, sy + 30, "n’a plus à appeler", lx=290, ly=232, anchor="end"))
    b.append(actor(120, 400, "Technicien support", "lit, décide, ferme"))
    b.append(arrow(165, 450, sx - 2, sy + 120, "ticket, validation", lx=290, ly=440, both=True))
    b.append(text(290, 456, "(palier 2), réglages", 12, fill=GREY))

    def ext(x, y, w, title, sub, dashed=False):
        return box(x, y, w, 64, title, [sub], dashed=dashed, stereo="«external»", tsize=14, lsize=12)
    b.append(ext(430, 60, 260, "Chariot de soins", "seuils, ascenseur, chocs"))
    b.append(arrow(560, 126, 560, sy - 2, "secousses", lx=570, ly=180, anchor="start"))
    b.append(ext(880, 60, 230, "PC du chariot (Windows)", "portable avec batterie"))
    b.append(arrow(880, 110, sx + sw + 2, sy + 30, "5 V de l’USB, état du PC", lx=842, ly=212, both=True, anchor="start"))
    b.append(text(842, 228, "(lecture seule)", 12, fill=GREY, anchor="start"))
    b.append(ext(880, 270, 230, "GLPI", "outil de tickets"))
    b.append(arrow(878, 300, sx + sw + 2, 300, "tickets, suivis", ly=292, both=True))
    b.append(ext(880, 470, 230, "Environnement", "chaleur, humidité"))
    b.append(arrow(878, 500, sx + sw + 2, 355, "température", lx=830, ly=418, anchor="start"))
    b.append(ext(430, 470, 260, "Réseau de la maquette", "Wi-Fi, DHCP, DNS, NTP"))
    b.append(arrow(560, 468, 560, sy + sh + 2, "adresses, heure commune", lx=570, ly=430, both=True, anchor="start"))
    b.append(text(30, 600, "Hors périmètre : dossier patient informatisé, réseau et postes réels de l’hôpital ; le système ne répare rien et ne ferme aucun ticket.", 12.5, fill=GREY, anchor="start"))
    save("2_contexte", svg(1140, 615, "".join(b)))


# ---------------------------------------------------------------- cas d'utilisation
def cas():
    b = [text(30, 30, "Diagramme des cas d’utilisation (uc)", 16, "bold", anchor="start")]
    bx, by, bw, bh = 230, 50, 640, 590
    b.append(f'<rect x="{bx}" y="{by}" width="{bw}" height="{bh}" fill="#fff" stroke="#4b5563" stroke-width="1.4"/>')
    b.append(text(bx + bw / 2, by + 22, "Système « Supervision instrumentée des chariots de soins »", 14, "bold"))

    def uc(cx, cy, t1, t2, rx):
        o = f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="27" fill="#fff" stroke="{BLUE}" stroke-width="1.5"/>'
        return o + text(cx, cy - 3, t1, 13) + text(cx, cy + 14, t2, 13)
    U = [
        (420, 105, "Enregistrer secousses,", "tension, température"),
        (420, 185, "Détecter la coupure", "du PC (5 V → 0 V)"),
        (700, 185, "Corréler les", "événements"),
        (700, 265, "Diagnostiquer le PC", "à distance (JEA)"),
        (700, 345, "Ouvrir ou compléter", "le ticket (paliers)"),
        (420, 345, "Valider un ticket", "proposé (palier 2)"),
        (420, 425, "Lire le ticket", "et la frise"),
        (420, 505, "Régler les seuils", "et le palier"),
        (420, 585, "Établir le bilan", "« adopter ou non » (V2)"),
    ]
    for x, y, a, c in U:
        b.append(uc(x, y, a, c, 125 if x == 700 else 145))
    b.append(arrow(565, 185, 573, 185, None, dashed=True, open_head=True))
    b.append(text(570, 172, "«include»", 11, fill=GREY, italic=True))
    for y1 in (212, 292):
        b.append(arrow(700, y1, 700, y1 + 24, None, dashed=True, open_head=True))
        b.append(text(708, y1 + 16, "«include»", 11, fill=GREY, italic=True, anchor="start"))
    b.append(actor(110, 100, "Chariot", "secousse, panne"))
    b.append(actor(110, 420, "Technicien"))
    b.append(actor(980, 220, "PC du chariot"))
    b.append(actor(980, 370, "GLPI"))
    L = lambda x1, y1, x2, y2: line([(x1, y1), (x2, y2)], color="#4b5563", width=1.2)
    for y in (105, 185):
        b.append(L(130, 125, 275, y))
    for y in (345, 425, 505, 585):
        b.append(L(130, 445, 275, y))
    b.append(L(960, 245, 825, 265))
    b.append(L(960, 395, 825, 345))
    save("3_cas_utilisation", svg(1080, 660, "".join(b)))


# ---------------------------------------------------------------- séquence
def sequence():
    b = [text(30, 30, "Diagramme de séquence (sd) – le chariot passe le seuil de l’ascenseur, le PC s’éteint, le ticket s’ouvre", 16, "bold", anchor="start")]
    L = {"brt": 130, "srv": 390, "pst": 660, "glpi": 890, "tech": 1070}
    names = {"brt": ":Boîtier", "srv": ":Serveur", "pst": ":PC du chariot", "glpi": ":GLPI", "tech": "Technicien"}
    top, bottom = 60, 760
    for k, x in L.items():
        if k == "tech":
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

    def note(y, t):
        return text(30, y, t, 12.5, BLUE, anchor="start", italic=True)
    y = 170
    b.append(note(y, "10:42:07 – le chariot passe le seuil de l’ascenseur"))
    b.append(self_("brt", y + 12, "1. secousse 2,1 g (interruption)"))
    b.append(msg("brt", "srv", y + 65, "2. « secousse » (MQTT/TLS)"))
    b.append(note(y + 105, "10:42:09 – le PC s’éteint"))
    b.append(self_("brt", y + 117, "3. 5 V → 0 V ; le boîtier"))
    b.append(text(L["brt"] + 48, y + 141, "continue sur sa batterie", 12.5, fill=GREY, anchor="start"))
    b.append(msg("brt", "srv", y + 175, "4. « coupure » + n° de séquence"))
    b.append(self_("srv", y + 187, "5. règle : secousse 2 s avant la coupure,", "batterie chargée → faux contact probable"))
    b.append(note(y + 255, "10:42:40"))
    b.append(msg("srv", "glpi", y + 260, "6. proposer le ticket (palier 2) – API REST HTTPS"))
    b.append(msg("tech", "glpi", y + 300, "7. valide d’un clic"))
    b.append(note(y + 345, "10:43:20 – le PC est rallumé"))
    b.append(msg("srv", "pst", y + 365, "8. diagnostic (WinRM HTTPS, JEA)"))
    b.append(self_("pst", y + 377, "9. Get-WinEvent, batterie,", "powercfg, disque (lecture seule)"))
    b.append(msg("pst", "srv", y + 440, "10. Kernel-Power 41, batterie 65 %", ret=True))
    b.append(msg("srv", "glpi", y + 485, "11. suivi : frise + rapport joints au ticket"))
    b.append(msg("glpi", "tech", y + 530, "12. lit le ticket", ret=True))
    b.append(self_("tech", y + 545, ""))
    b.append(text(L["tech"] - 12, y + 566, "13. refixe le connecteur,", 12.5, fill=GREY, anchor="end"))
    b.append(text(L["tech"] - 12, y + 582, "ferme le ticket lui-même", 12.5, fill=GREY, anchor="end"))
    b.append(text(30, 790, "Palier 1 : le système note seulement « j’aurais ouvert un ticket ». Palier 3 (V2) : il l’ouvre seul. Les pannes suivantes du jour s’ajoutent au même ticket.", 12.5, fill=GREY, anchor="start"))
    save("4_sequence", svg(1160, 805, "".join(b)))


# ---------------------------------------------------------------- Gantt
def gantt():
    start = dt.date(2027, 1, 1)
    end = dt.date(2027, 5, 15)
    days = (end - start).days + 1
    X0, X1 = 400, 1150
    px = (X1 - X0) / days
    xd = lambda d: X0 + (d - start).days * px
    D = dt.date
    tasks = [
        ("Cadrage", None),
        ("1. Besoin, cahier des charges, planning (12 h)", (D(2027, 1, 4), D(2027, 1, 22)), "c3"),
        ("V1 – voir la panne et ouvrir le ticket", None),
        ("2. Boîtier : câblage, secousses, MQTT, mémoire (35 h)", (D(2027, 1, 18), D(2027, 3, 5)), "c8"),
        ("5. Diagnostic : PowerShell, WinRM, JEA (18 h)", (D(2027, 1, 25), D(2027, 3, 26)), "c8"),
        ("3. Physique : étalonnage, chutes, incertitudes (10 h)", (D(2027, 2, 1), D(2027, 3, 12)), "phy"),
        ("8. Réseau : DHCP, DNS, NTP, captures (8 h)", (D(2027, 2, 8), D(2027, 4, 9)), "c10"),
        ("4. Serveur : réception, base, règles (20 h)", (D(2027, 2, 15), D(2027, 3, 19)), "c8"),
        ("6. GLPI : installation, API, paliers (15 h)", (D(2027, 3, 15), D(2027, 4, 16)), "c8"),
        ("7. Corrélation SQL, rapport (12 h)", (D(2027, 3, 29), D(2027, 4, 16)), "c8"),
        ("V2 – mesurer et conclure", None),
        ("7. (suite) Frise Grafana, température, palier 3", (D(2027, 4, 12), D(2027, 4, 23)), "c8"),
        ("9. Campagne d’essai, indicateurs, bilan (10 h)", (D(2027, 4, 19), D(2027, 5, 7)), "c3"),
        ("10. Dossier et préparation de l’oral (10 h)", (D(2027, 5, 3), D(2027, 5, 14)), "c1"),
        ("Journal de bord, journal IA, réunions (tout le long)", (D(2027, 1, 4), D(2027, 5, 14)), "c3"),
    ]
    col = {"c3": "#7c3aed", "c10": "#059669", "c8": BLUE, "phy": "#d97706", "c1": "#db2777"}
    rowh = 28
    top = 95
    H = top + len(tasks) * rowh + 110
    b = [text(30, 30, "Planning prévisionnel du 1er janvier au 15 mai 2027 (150 h, 10 tâches)", 16, "bold", anchor="start")]
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
