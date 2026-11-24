# -*- coding: utf-8 -*-
"""Génère les schémas de la fiche académique de Yaksan (apprenti 2) – projet
« Station de contrôle des postes, de la remise à la restitution », en SVG.
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
    b = [text(30, 34, "Synoptique de la maquette au lycée (réseau exploité tel quel, aucune connexion au ministère, aucune donnée réelle)", 16, "bold", anchor="start")]
    # portable testé et tête de mesure
    b.append(box(30, 60, 300, 140, "Portable testé (Windows 11)", ["navigateur : page de test (HTTPS)", "écran, haut-parleurs, micro", "clavier, pavé tactile", "webcam, ports USB, Ethernet (V2)", "rien n’y est installé"]))
    b.append(box(30, 320, 300, 140, "Tête de mesure (ESP32, C++)", ["TCS34725 dans un tube noir : écran", "INMP441 : son des haut-parleurs", "MAX98357A + haut-parleur : son", "envoyé au micro du PC", "ESP32-S3 clavier USB, INA219 (V2)"], hl=True))
    b.append(arrow(120, 202, 120, 318, "lumière, son", lx=112, ly=264, anchor="end"))
    b.append(arrow(240, 318, 240, 202, "son émis", lx=248, ly=256, anchor="start"))
    b.append(text(248, 272, "(test du micro)", 12, fill=GREY, anchor="start"))
    # station
    b.append(box(440, 60, 340, 170, "Station – PC Ubuntu", ["Flask en HTTPS, WebSocket", "enchaîne les étapes du test", "SQLite : PC, mesures, rapports", "comparaison au rapport précédent", "et aux PC sains du même modèle", "rapports chaînés (SHA-256)", "vérificateur de la chaîne"], hl=True))
    b.append(arrow(332, 130, 438, 130, "HTTPS, WebSocket", ly=122, both=True, size=11.5))
    b.append(arrow(332, 400, 480, 232, "USB série", lx=394, ly=326, anchor="end", both=True, size=11.5))
    # réseau, physique
    b.append(box(440, 290, 340, 80, "Réseau de la maquette", ["DHCP, DNS, NTP, switchs, routeur", "autorité de certification de labo"]))
    b.append(arrow(610, 232, 610, 288, "nom, adresse, heure", lx=618, ly=266, anchor="start", both=True, size=11.5))
    b.append(box(440, 395, 340, 62, "Laboratoire de physique", ["luxmètre, sonomètre : étalonnage"]))
    b.append(arrow(438, 426, 332, 440, "étalonnage", lx=385, ly=458, dashed=True, size=11.5))
    # côté droit
    b.append(box(880, 60, 260, 76, "Interface du technicien", ["navigateur : rapports, décision"]))
    b.append(arrow(782, 98, 878, 98, "HTTPS", ly=90, both=True, size=11.5))
    b.append(box(880, 160, 260, 76, "Clé USB hors ligne", ["dernier haché, sauvegarde"]))
    b.append(arrow(782, 198, 878, 198, "copie du soir", ly=190, size=11.5))
    b.append(box(880, 262, 260, 90, "Switch HP ProCurve (V2)", ["port du portable testé :", "vitesse, erreurs (SNMP)"], dashed=True))
    b.append(arrow(782, 225, 878, 290, "SNMP lecture", lx=884, ly=254, anchor="start", dashed=True, size=11.5))
    b.append(text(30, 500, "En bleu : réalisé par l’apprenti. Pointillés : V2 ou ponctuel. La station n’agit jamais sur le portable : elle n’installe rien, ne change aucun", 13, fill=GREY, anchor="start"))
    b.append(text(30, 518, "réglage et n’efface rien. Aucun son n’est enregistré, aucune image n’est gardée : seulement des mesures. Les défauts sont provoqués sans rien abîmer.", 13, fill=GREY, anchor="start"))
    save("0_synoptique", svg(1170, 535, "".join(b)))


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
    px, py, pw, ph = 320, 48, 480, 92
    b.append(f'<rect x="{px}" y="{py}" width="{pw}" height="{ph}" fill="{BLUE_BG}" stroke="{BLUE}" stroke-width="2"/>')
    b.append(text(px + pw / 2, py + 17, "«requirement»", 11, fill=GREY, italic=True))
    b.append(text(px + pw / 2, py + 37, "E0 – Station de contrôle des postes", 15, "bold"))
    b.append(text(px + pw / 2, py + 60, "Mesurer un portable à la remise et à la restitution,", 13))
    b.append(text(px + pw / 2, py + 78, "comparer et proposer une décision au technicien", 13))
    reqs = [
        ("E1 – Défauts trouvés", ["20 défauts provoqués :", "au moins 18 trouvés,", "au bon composant"], "campagne d’essai"),
        ("E2 – Pas de fausse alarme", ["20 passages de PC", "sains : au plus", "1 alarme"], "campagne d’essai"),
        ("E3 – Répétable", ["Même PC, 10 passages,", "repositionné à chaque", "fois : 10 verdicts égaux"], "essai de répétabilité"),
        ("E4 – Rapide", ["Contrôle complet (V1)", "en moins de 5 min,", "comparé au contrôle à la main"], "chronométrage"),
        ("E5 – Seuils justifiés", ["Seuils tirés des mesures", "sur PC sains (moyenne", "− 3 écarts-types)"], "volet physique"),
        ("E6 – Rapport intègre", ["Rapport de remise", "modifié : détecté", "à chaque essai"], "démonstration"),
        ("E7 – Rien sur le PC", ["Aucun logiciel installé,", "aucun droit admin ; aucun", "son ni image gardé"], "revue du code"),
        ("E8 – Connectique (V2)", ["Webcam, USB, Ethernet", "testés sur 5 PC, dont", "2 avec défaut provoqué"], "essai V2"),
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
    b.append(text(30, 562, "Le symbole ⊕ indique que E0 se décompose en E1 à E8. V1 : E1 à E7 (écran, haut-parleurs, micro, clavier, rapports chaînés). V2 : E8.", 12.5, fill=GREY, anchor="start"))
    save("1_exigences", svg(1125, 575, "".join(b)))


# ---------------------------------------------------------------- contexte
def contexte():
    b = [text(30, 30, "Diagramme de contexte – le système et ce qui l’entoure", 16, "bold", anchor="start")]
    sx, sy, sw, sh = 390, 220, 340, 150
    b.append(f'<rect x="{sx}" y="{sy}" width="{sw}" height="{sh}" fill="{BLUE_BG}" stroke="{BLUE}" stroke-width="2"/>')
    b.append(text(sx + sw / 2, sy + 22, "«system»", 11, fill=GREY, italic=True))
    b.append(text(sx + sw / 2, sy + 46, "Station de contrôle des postes", 14.5, "bold"))
    for i, t in enumerate(["tête de mesure (ESP32)", "+ station Ubuntu (comparaison, rapports)", "+ page de test web"]):
        b.append(text(sx + sw / 2, sy + 78 + i * 20, t, 13))
    b.append(actor(120, 60, "Technicien support", "pose le PC, valide la décision"))
    b.append(arrow(175, 120, sx - 2, sy + 30, "lancement, décision", lx=290, ly=232, anchor="end", both=True))
    b.append(actor(120, 400, "Responsable du parc", "lit les statistiques (V2)"))
    b.append(arrow(165, 450, sx - 2, sy + 120, "statistiques (V2)", lx=290, ly=440, dashed=True))

    def ext(x, y, w, title, sub, dashed=False):
        return box(x, y, w, 64, title, [sub], dashed=dashed, stereo="«external»", tsize=14, lsize=12)
    b.append(ext(430, 60, 260, "Portable testé", "Windows 11, navigateur"))
    b.append(arrow(560, 126, 560, sy - 2, "couleurs, sons, saisies", lx=570, ly=180, anchor="start", both=True))
    b.append(text(570, 196, "↔ lumière et son mesurés", 12, fill=GREY, anchor="start"))
    b.append(ext(880, 60, 230, "Réseau de la maquette", "DHCP, DNS, NTP"))
    b.append(arrow(880, 110, sx + sw + 2, sy + 30, "nom, adresse, heure", lx=842, ly=212, both=True, anchor="start"))
    b.append(ext(880, 270, 230, "Autorité de labo", "certificat de la station"))
    b.append(arrow(878, 300, sx + sw + 2, 300, "certificat HTTPS", ly=292))
    b.append(ext(880, 470, 230, "Clé USB hors ligne", "dernier haché, sauvegarde"))
    b.append(arrow(sx + sw + 2, 355, 878, 500, "copie du soir", lx=822, ly=418, anchor="start"))
    b.append(ext(430, 470, 260, "Switch HP ProCurve (V2)", "port du portable testé", dashed=True))
    b.append(arrow(560, 468, 560, sy + sh + 2, "vitesse, erreurs (SNMP)", lx=570, ly=430, anchor="start", dashed=True))
    b.append(ext(60, 560, 250, "Luxmètre, sonomètre", "laboratoire de physique"))
    b.append(arrow(312, 590, sx + 40, sy + sh + 2, "étalonnage", lx=330, ly=610, dashed=True, anchor="start"))
    b.append(text(30, 670, "Hors périmètre : postes, réseau et données du ministère ; réparation du PC ; effacement des données de l’agent. Aucun son enregistré, aucune image gardée.", 12.5, fill=GREY, anchor="start"))
    save("2_contexte", svg(1140, 685, "".join(b)))


# ---------------------------------------------------------------- cas d'utilisation
def cas():
    b = [text(30, 30, "Diagramme des cas d’utilisation (uc)", 16, "bold", anchor="start")]
    bx, by, bw, bh = 230, 50, 640, 600
    b.append(f'<rect x="{bx}" y="{by}" width="{bw}" height="{bh}" fill="#fff" stroke="#4b5563" stroke-width="1.4"/>')
    b.append(text(bx + bw / 2, by + 22, "Système « Station de contrôle des postes »", 14, "bold"))

    def uc(cx, cy, t1, t2, rx, dashed=False):
        d = ' stroke-dasharray="6 4"' if dashed else ""
        o = f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="27" fill="#fff" stroke="{BLUE}" stroke-width="1.5"{d}/>'
        return o + text(cx, cy - 3, t1, 13) + text(cx, cy + 14, t2, 13)
    G = [
        (395, 105, "Contrôler un PC", "(remise ou restitution)", False),
        (395, 185, "Tester le clavier", "et le pavé tactile", False),
        (395, 265, "Remplir la liste", "de contrôle physique", False),
        (395, 345, "Valider la décision", "proposée", False),
        (395, 425, "Vérifier l’intégrité", "des rapports", False),
        (395, 505, "Régler les seuils", "par modèle", False),
        (395, 585, "Consulter les", "statistiques (V2)", True),
    ]
    D = [
        (730, 120, "Mesurer l’écran", "(luminance, gamma)", False),
        (730, 200, "Mesurer les", "haut-parleurs", False),
        (730, 280, "Tester le micro", "du PC", False),
        (730, 360, "Comparer aux", "références", False),
        (730, 440, "Chaîner et archiver", "le rapport", False),
        (730, 520, "Tester webcam, USB,", "Ethernet (V2)", True),
    ]
    for x, y, a, c, dsh in G:
        b.append(uc(x, y, a, c, 135, dsh))
    for x, y, a, c, dsh in D:
        b.append(uc(x, y, a, c, 120, dsh))
    # «include» : « Contrôler un PC » inclut les six cas de droite
    for i, (x, y, *_r) in enumerate(D):
        b.append(arrow(530, 105, 608, y, None, dashed=True, open_head=True))
    b.append(text(560, 92, "«include»", 11, fill=GREY, italic=True))
    b.append(actor(110, 160, "Technicien"))
    b.append(actor(110, 520, "Responsable", "du parc"))
    b.append(actor(990, 140, "Portable testé"))
    b.append(actor(990, 330, "Clé USB"))
    b.append(actor(990, 470, "Switch (V2)"))
    Lk = lambda x1, y1, x2, y2: line([(x1, y1), (x2, y2)], color="#4b5563", width=1.2)
    for y in (105, 185, 265, 345, 425, 505):
        b.append(Lk(130, 185, 260, y))
    b.append(Lk(130, 545, 260, 585))
    for y in (120, 200, 280):
        b.append(Lk(970, 165, 850, y))
    b.append(Lk(970, 355, 850, 440))
    b.append(Lk(970, 495, 850, 520))
    b.append(text(30, 680, "Pointillés : V2. La station propose un verdict ; le technicien décide. Elle n’agit jamais sur le portable testé.", 12.5, fill=GREY, anchor="start"))
    save("3_cas_utilisation", svg(1090, 695, "".join(b)))


# ---------------------------------------------------------------- séquence
def sequence():
    b = [text(30, 30, "Diagramme de séquence (sd) – restitution du PC-042 : le haut-parleur droit est devenu trop faible", 16, "bold", anchor="start")]
    L = {"tech": 70, "pc": 250, "srv": 470, "tete": 680, "base": 870, "cle": 1060}
    names = {"tech": "Technicien", "pc": ":Page de test", "srv": ":Station", "tete": ":Tête de mesure", "base": ":Base SQLite", "cle": ":Clé USB"}
    top, bottom = 60, 905
    for k, x in L.items():
        if k == "tech":
            b.append(actor(x, top - 8, ""))
            b.append(text(x, top + 82, names[k], 14, "bold"))
            y0 = top + 92
        else:
            hl = k in ("srv", "tete")
            b.append(f'<rect x="{x - 72}" y="{top}" width="144" height="40" fill="{BLUE_BG if hl else "#fff"}" stroke="{BLUE if hl else "#4b5563"}" stroke-width="1.4"/>')
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
    y = 168
    b.append(note(y, "14:02 – Karim rend le PC-042 ; Yaksan le pose sur la station et ouvre la page de test"))
    b.append(msg("tech", "pc", y + 28, "1. PC-042, « restitution »"))
    b.append(msg("pc", "srv", y + 60, "2. test demandé (HTTPS)"))
    b.append(msg("srv", "base", y + 92, "3. rapport de remise du PC-042 ?"))
    b.append(msg("base", "srv", y + 124, "4. rapport + empreintes", ret=True))
    b.append(self_("srv", y + 140, "5. chaîne vérifiée : intacte"))
    b.append(note(y + 192, "écran : 17 niveaux de gris, puis rouge, vert, bleu"))
    b.append(msg("srv", "pc", y + 218, "6. afficher le gris n"))
    b.append(msg("srv", "tete", y + 250, "7. mesurer la lumière (USB)"))
    b.append(msg("tete", "srv", y + 282, "8. luminance, couleurs", ret=True))
    b.append(note(y + 322, "son : 3 fréquences, à gauche puis à droite ; puis le micro du PC"))
    b.append(msg("srv", "pc", y + 348, "9. jouer 1 kHz à droite"))
    b.append(msg("srv", "tete", y + 380, "10. écouter"))
    b.append(msg("tete", "srv", y + 412, "11. −18 dB / remise", ret=True))
    b.append(msg("srv", "tete", y + 444, "12. émettre 2 kHz"))
    b.append(msg("pc", "srv", y + 476, "13. 2 kHz reçu (Web Audio)", ret=True))
    b.append(self_("srv", y + 494, "14. comparer aux références :", "écran OK, haut-parleur droit hors seuil"))
    b.append(msg("srv", "pc", y + 560, "15. proposé : « à réparer »"))
    b.append(msg("tech", "pc", y + 592, "16. valide la décision"))
    b.append(msg("srv", "base", y + 624, "17. rapport chaîné (empreinte du précédent, heure NTP)"))
    b.append(note(y + 664, "20:00"))
    b.append(msg("srv", "cle", y + 690, "18. dernier haché copié (hors ligne)"))
    b.append(text(30, 935, "La station mesure et propose ; le technicien décide. Si la chaîne était rompue à l’étape 5, la comparaison serait refusée et le technicien alerté.", 12.5, fill=GREY, anchor="start"))
    save("4_sequence", svg(1160, 950, "".join(b)))


# ---------------------------------------------------------------- Gantt
def gantt():
    start = dt.date(2027, 1, 1)
    end = dt.date(2027, 5, 15)
    days = (end - start).days + 1
    X0, X1 = 450, 1150
    px = (X1 - X0) / days
    xd = lambda d: X0 + (d - start).days * px
    D = dt.date
    tasks = [
        ("Cadrage", None),
        ("1. Besoin chiffré, cahier des charges, planning (10 h)", (D(2027, 1, 4), D(2027, 1, 22)), "c3"),
        ("2. Maquette : station Ubuntu, HTTPS, portables (10 h)", (D(2027, 1, 11), D(2027, 1, 29)), "c10"),
        ("V1 – mesurer, comparer, garder une trace fiable", None),
        ("3. Tête de mesure : couleur, micro, émetteur, support (20 h)", (D(2027, 1, 18), D(2027, 3, 5)), "c8"),
        ("4. Physique : étalonnage, gamma, son, seuils (18 h)", (D(2027, 2, 1), D(2027, 3, 26)), "phy"),
        ("5. Page de test : couleurs, sons, micro, clavier (18 h)", (D(2027, 2, 1), D(2027, 3, 12)), "c8"),
        ("6. Station : étapes, base, comparaison, rapport (16 h)", (D(2027, 2, 15), D(2027, 3, 19)), "c8"),
        ("7. Rapports chaînés, vérificateur, comptes (8 h)", (D(2027, 3, 8), D(2027, 3, 26)), "c8"),
        ("8. Réseau : DHCP, DNS, NTP, TLS, captures (8 h)", (D(2027, 2, 8), D(2027, 4, 9)), "c10"),
        ("V2 – connectique et statistiques", None),
        ("9. Webcam, USB, Ethernet (SNMP), statistiques (18 h)", (D(2027, 3, 29), D(2027, 4, 30)), "c8"),
        ("10. Campagne d’essai, défauts provoqués, bilan (12 h)", (D(2027, 4, 19), D(2027, 5, 7)), "c3"),
        ("11. Dossier et préparation de l’oral (12 h)", (D(2027, 5, 3), D(2027, 5, 14)), "c1"),
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
