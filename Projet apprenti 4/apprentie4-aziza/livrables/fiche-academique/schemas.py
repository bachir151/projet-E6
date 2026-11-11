# -*- coding: utf-8 -*-
"""Génère les schémas de la fiche académique d'Aziza (SVG).
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
    b = []
    b.append(text(30, 34, "Synoptique de la maquette au lycée (données fictives, aucun lien avec les systèmes de l’entreprise)", 16, "bold", anchor="start"))
    b.append(box(30, 60, 290, 120, "Poste du référent", ["Windows 11, PowerShell", "prépare le kit, le signe", "et lui donne un numéro de version"]))
    b.append(box(400, 60, 320, 140, "Serveur Ubuntu 24.04", ["joue le rôle du SharePoint", "nginx (HTTPS), API Flask, SQLite", "chrony (heure NTP)", "toutes les versions = l’archive"], hl=True))
    b.append(box(800, 60, 290, 120, "Tableau de bord", ["navigateur web", "état du parc, sorties", "export CSV vers Excel", "recherche dans l’archive (V2)"]))
    b.append(arrow(320, 120, 398, 120, "publie (SFTP)", ly=110))
    b.append(arrow(720, 120, 798, 120, "HTTPS", ly=110))
    # lien 4G
    b.append(box(400, 270, 320, 100, "Lien « 4G » simulé", ["tc netem sur le serveur : débit,", "retard, pertes, coupures", "réglé sur une mesure réelle"]))
    b.append(arrow(560, 202, 560, 268, "HTTPS 443 : catalogue, fichiers, rapports", lx=572, ly=240, both=True, anchor="start"))
    b.append(box(400, 450, 320, 140, "PC de maintenance (×3)", ["Windows 11, agent PowerShell signé", "tâche planifiée, BITS", "vérifie, bascule, garde la version N-1", "alerte « kit périmé »"]))
    b.append(arrow(560, 372, 560, 448, "seuls les fichiers modifiés descendent", lx=572, ly=414, both=True, anchor="start"))
    # borne
    b.append(box(30, 270, 290, 120, "Borne de sortie", ["ESP32 + lecteur RFID RC522", "badge de l’agent + étiquette du PC", "voyant vert / rouge, buzzer"]))
    b.append(line([(320, 330), (360, 330), (360, 170), (398, 170)]))
    b.append(arrow(360, 171, 398, 171))
    b.append(text(340, 250, "Wi-Fi du bureau, HTTPS", 12, fill=GREY, anchor="end"))
    # banc physique
    b.append(box(30, 450, 290, 120, "Banc de physique", ["ESP32 + SHT40 + DS18B20", "temps d’attente avant d’allumer", "un PC qui sort du froid"]))
    b.append(text(175, 590, "résultat → mode opératoire et étiquette du PC", 12, fill=GREY))
    # extension
    b.append(box(800, 270, 290, 100, "SharePoint Online", ["extension (Microsoft Graph)", "source réelle du kit"], dashed=True))
    b.append(arrow(798, 320, 722, 320, "en réel", ly=310, dashed=True))
    b.append(box(800, 450, 290, 120, "Boîtier de sacoche", ["extension : ESP32-S3, écran e-ink", "chocs, température, humidité"], dashed=True))
    b.append(text(30, 625, "Trait plein : version V1 (obligatoire). Tirets : extension. En bleu : le serveur, par où passe tout le kit.", 13, fill=GREY, anchor="start"))
    save("0_synoptique", svg(1120, 645, "".join(b)))


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
    b = [text(30, 30, "Diagramme d’exigences (req) – chaque exigence est vérifiée par un test de recette", 16, "bold", anchor="start")]
    W, H = 255, 140
    px, py, pw, ph = 330, 48, 460, 92
    b.append(f'<rect x="{px}" y="{py}" width="{pw}" height="{ph}" fill="{BLUE_BG}" stroke="{BLUE}" stroke-width="2"/>')
    b.append(text(px + pw / 2, py + 17, "«requirement»", 11, fill=GREY, italic=True))
    b.append(text(px + pw / 2, py + 37, "E0 – Kit de maintenance et archive", 15, "bold"))
    b.append(text(px + pw / 2, py + 60, "Tenir à jour les PC de maintenance nomades et garder", 13))
    b.append(text(px + pw / 2, py + 78, "l’historique des documents de modification", 13))
    reqs = [
        ("E1 – Mise à jour", ["Au moins 3 PC Windows 11", "mis à jour sans action", "manuelle"], "T01, T09"),
        ("E2 – Authenticité", ["100 % des fichiers modifiés,", "non signés ou anciens", "sont refusés"], "T02, T03, T14"),
        ("E3 – Réseau mobile", ["Seuls les fichiers modifiés", "descendent ; reprise", "après une coupure"], "T01, T04"),
        ("E4 – Retour arrière", ["Revenir à la version", "précédente en moins", "de 2 minutes"], "T05"),
        ("E5 – Borne de sortie", ["Réponse en moins de 5 s ;", "100 % des sorties", "enregistrées"], "T06, T07, T08"),
        ("E6 – Échanges sûrs", ["HTTPS ; un jeton par", "appareil ; rapport sans", "jeton refusé"], "T10, T15"),
        ("E7 – Archive (V2)", ["Retrouver une version par", "équipement, date ou", "auteur en moins d’1 min"], "T11"),
        ("E8 – Physique", ["Donner le temps d’attente", "avant d’allumer un PC", "froid (modèle + mesures)"], "mesures"),
    ]
    xs = [30, 300, 570, 840]
    ys = [205, 395]
    cx, cy = px + pw / 2, py + ph + 14
    b.append(f'<circle cx="{cx}" cy="{cy}" r="8" fill="#fff" stroke="{GREY}" stroke-width="1.5"/>')
    b.append(line([(cx - 8, cy), (cx + 8, cy)]))
    b.append(line([(cx, cy - 8), (cx, cy + 8)]))
    b.append(line([(cx, cy + 8), (cx, 180)]))
    b.append(line([(xs[0] + W / 2, 180), (xs[3] + W / 2, 180)]))
    b.append(line([(25 , 180), (25, 370), (1100, 370), (1100, 180)], color="#fff"))
    for i, (rid, t, v) in enumerate(reqs):
        x = xs[i % 4]
        y = ys[i // 4]
        b.append(req(x, y, W, H, rid, t, v))
        if i < 4:
            b.append(line([(x + W / 2, 180), (x + W / 2, y)]))
        else:
            b.append(line([(x + W / 2, 370), (x + W / 2, y)]))
    b.append(line([(xs[0] + W / 2, 370), (xs[3] + W / 2, 370)]))
    b.append(line([(cx, 180), (cx, 205)], color="#fff", width=0))
    b.append(line([(15, 180), (15, 370)], color="#fff", width=0))
    b.append(line([(1112, 275), (1112, 370)], color="#fff", width=0))
    b.append(line([(xs[3] + W + 12, 180), (xs[3] + W + 12, 370), (xs[3] + W / 2, 370)]))
    b.append(line([(xs[3] + W / 2, 180), (xs[3] + W + 12, 180)]))
    b.append(text(30, 562, "Le symbole ⊕ indique que E0 se décompose en E1 à E8. Tests T01 à T15 : voir le cahier de recette.", 12.5, fill=GREY, anchor="start"))
    save("1_exigences", svg(1125, 575, "".join(b)))


# ---------------------------------------------------------------- contexte
def contexte():
    b = [text(30, 30, "Diagramme de contexte – le système et ce qui l’entoure", 16, "bold", anchor="start")]
    sx, sy, sw, sh = 390, 220, 340, 150
    b.append(f'<rect x="{sx}" y="{sy}" width="{sw}" height="{sh}" fill="{BLUE_BG}" stroke="{BLUE}" stroke-width="2"/>')
    b.append(text(sx + sw / 2, sy + 22, "«system»", 11, fill=GREY, italic=True))
    b.append(text(sx + sw / 2, sy + 46, "Gestion du kit de maintenance", 16, "bold"))
    for i, t in enumerate(["serveur + agent PowerShell sur chaque PC", "+ borne de sortie + tableau de bord", "+ archive (V2)"]):
        b.append(text(sx + sw / 2, sy + 78 + i * 20, t, 13))
    # acteurs humains
    b.append(actor(120, 60, "Référent", "valide et publie le kit"))
    b.append(arrow(165, 120, sx - 2, sy + 30, "kit signé, documents", lx=300, ly=232))
    b.append(actor(120, 400, "Technicien", "emporte un PC"))
    b.append(arrow(165, 450, sx - 2, sy + 120, "badge, confirmation", lx=255, ly=440, both=True))
    b.append(text(255, 456, "alertes, voyant", 12, fill=GREY))
    b.append(actor(1000, 60, "Chef de service", "suit le parc"))
    b.append(arrow(950, 120, sx + sw + 2, sy + 30, "état du parc, recherche", lx=890, ly=262, both=True))
    # blocs externes
    def ext(x, y, w, title, sub, dashed=False):
        return box(x, y, w, 64, title, [sub], dashed=dashed, stereo="«external»", tsize=14, lsize=12)
    b.append(ext(430, 60, 260, "PC de maintenance", "Windows 11 – support du projet"))
    b.append(arrow(560, 126, 560, sy - 2, "fichiers, rapports", lx=570, ly=180, both=True, anchor="start"))
    b.append(ext(430, 460, 260, "Réseau mobile 4G", "partage de connexion du téléphone"))
    b.append(arrow(560, sy + sh + 2, 560, 458, "débit faible, coupures", lx=570, ly=420, both=True, anchor="start"))
    b.append(ext(880, 300, 230, "Tableaux Excel", "du service (export CSV)"))
    b.append(arrow(sx + sw + 2, 330, 878, 330, "CSV", ly=322))
    b.append(ext(880, 420, 230, "SharePoint", "extension", dashed=True))
    b.append(arrow(878, 450, sx + sw + 2, 350, None, dashed=True))
    b.append(ext(110, 560, 290, "Environnement", "froid, chaleur, humidité, chocs"))
    b.append(arrow(400, 590, sx + 40, sy + sh + 2, "contraintes physiques", lx=420, ly=548, anchor="start"))
    b.append(text(30, 655, "Hors périmètre : réseau, PC et SharePoint réels de l’entreprise ; systèmes de télécommande du réseau électrique.", 12.5, fill=GREY, anchor="start"))
    save("2_contexte", svg(1140, 670, "".join(b)))


# ---------------------------------------------------------------- cas d'utilisation
def cas():
    b = [text(30, 30, "Diagramme des cas d’utilisation (uc)", 16, "bold", anchor="start")]
    bx, by, bw, bh = 230, 50, 640, 590
    b.append(f'<rect x="{bx}" y="{by}" width="{bw}" height="{bh}" fill="#fff" stroke="#4b5563" stroke-width="1.4"/>')
    b.append(text(bx + bw / 2, by + 22, "Système « Gestion du kit de maintenance »", 14, "bold"))

    def uc(cx, cy, t1, t2=None, dashed=False, rx=150):
        dash = ' stroke-dasharray="6 4"' if dashed else ""
        o = f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="27" fill="#fff" stroke="{BLUE}" stroke-width="1.5"{dash}/>'
        if t2:
            o += text(cx, cy - 3, t1, 13) + text(cx, cy + 14, t2, 13)
        else:
            o += text(cx, cy + 5, t1, 13)
        return o
    U = {
        "pub": (420, 105, "Publier un kit signé", "et numéroté"),
        "maj": (420, 185, "Mettre à jour le PC", "(automatique ou confirmé)"),
        "ver": (700, 185, "Vérifier signature,", "version et empreintes"),
        "ret": (420, 265, "Revenir à la version", "précédente"),
        "per": (420, 340, "Être alerté d’un", "kit périmé"),
        "bad": (420, 415, "Badger la sortie", "d’un PC"),
        "att": (420, 495, "Connaître le temps d’attente", "avant d’allumer un PC froid"),
        "eta": (700, 340, "Consulter l’état du parc", "et exporter vers Excel"),
        "arc": (700, 440, "Rechercher une ancienne", "version (V2)"),
        "pro": (420, 575, "Proposer une modification", "(extension)"),
    }
    for k, (x, y, a, c) in U.items():
        b.append(uc(x, y, a, c, dashed=(k == "pro"), rx=125 if x == 700 else 145))
    b.append(arrow(560, 185, 573, 185, None, dashed=True, open_head=True))
    b.append(text(567, 172, "«include»", 11, fill=GREY, italic=True))
    b.append(actor(110, 80, "Référent"))
    b.append(actor(110, 330, "Technicien"))
    b.append(actor(110, 520, "Horloge", "tâche planifiée"))
    b.append(actor(980, 330, "Chef de service"))
    L = lambda x1, y1, x2, y2: line([(x1, y1), (x2, y2)], color="#4b5563", width=1.2)
    b.append(L(130, 105, 280, 105))
    b.append(L(130, 355, 280, 185))
    b.append(L(130, 355, 280, 265))
    b.append(L(130, 355, 280, 340))
    b.append(L(130, 355, 280, 415))
    b.append(L(130, 360, 280, 495))
    b.append(L(130, 362, 275, 575))
    b.append(L(130, 545, 282, 195))
    b.append(L(960, 355, 825, 340))
    b.append(L(960, 360, 825, 440))
    save("3_cas_utilisation", svg(1080, 660, "".join(b)))


# ---------------------------------------------------------------- séquence
def sequence():
    b = [text(30, 30, "Diagramme de séquence (sd) – mise à jour d’un PC puis sortie à la borne", 16, "bold", anchor="start")]
    L = {"tec": 110, "agt": 370, "srv": 650, "brn": 930}
    names = {"tec": "Technicien", "agt": ":Agent PC", "srv": ":Serveur", "brn": ":Borne"}
    top, bottom = 60, 700
    for k, x in L.items():
        if k == "tec":
            b.append(actor(x, top - 8, ""))
            b.append(text(x, top + 82, names[k], 14, "bold"))
            y0 = top + 92
        else:
            b.append(f'<rect x="{x - 75}" y="{top}" width="150" height="40" fill="{BLUE_BG if k == "srv" else "#fff"}" stroke="{BLUE if k == "srv" else "#4b5563"}" stroke-width="1.4"/>')
            b.append(text(x, top + 26, names[k], 14, "bold"))
            y0 = top + 40
        b.append(line([(x, y0), (x, bottom)], dashed=True, color=LINE))

    def msg(a, c, y, label, ret=False):
        x1, x2 = L[a], L[c]
        return arrow(x1, y, x2 - (6 if x2 > x1 else -6), y, label, ly=y - 6, dashed=ret, open_head=ret, size=12.5)

    def self_(a, y, label, lines2=None):
        x = L[a]
        o = line([(x, y), (x + 40, y), (x + 40, y + 22), (x + 6, y + 22)])
        o += arrow(x + 20, y + 22, x + 4, y + 22)
        o += text(x + 48, y + 8, label, 12.5, fill=GREY, anchor="start")
        if lines2:
            o += text(x + 48, y + 24, lines2, 12.5, fill=GREY, anchor="start")
        return o
    y = 170
    b.append(text(125, y - 4, "Toutes les 30 min, au démarrage ou à l’ouverture de session :", 12.5, BLUE, anchor="start", italic=True))
    b.append(msg("agt", "srv", y + 20, "1. GET /kit/catalogue (HTTPS)"))
    b.append(msg("srv", "agt", y + 55, "2. catalogue.json + catalogue.cat signé", ret=True))
    b.append(self_("agt", y + 75, "3. vérifie la signature, une version plus", "grande, compare les empreintes"))
    b.append(msg("agt", "srv", y + 140, "4. GET fichiers modifiés seulement (BITS)"))
    b.append(msg("srv", "agt", y + 175, "5. fichiers (reprise si coupure)", ret=True))
    b.append(self_("agt", y + 195, "6. Test-FileCatalog, puis bascule", "actif → précédent, préparation → actif"))
    b.append(msg("agt", "srv", y + 260, "7. POST rapport + jeton du PC"))
    y2 = y + 310
    b.append(text(125, y2 - 8, "Avant une intervention, au bureau :", 12.5, BLUE, anchor="start", italic=True))
    b.append(arrow(L["tec"], y2 + 15, L["brn"] - 6, y2 + 15, "8. présente son badge puis l’étiquette du PC", lx=(L["agt"] + L["srv"]) / 2, ly=y2 + 9, size=12.5))
    b.append(msg("brn", "srv", y2 + 55, "9. GET /pc/{id}/etat"))
    b.append(msg("srv", "brn", y2 + 90, "10. à jour ?, version, date du rapport", ret=True))
    b.append(arrow(L["brn"], y2 + 130, L["tec"] + 6, y2 + 130, "11. voyant vert + bip (rouge si rapport ancien)", lx=(L["agt"] + L["srv"]) / 2, ly=y2 + 124, dashed=True, open_head=True, size=12.5))
    b.append(msg("brn", "srv", y2 + 170, "12. POST /sorties + jeton de la borne"))
    b.append(text(30, 730, "Serveur muet : la borne clignote « vérification impossible » et garde la sortie en mémoire ; jamais « à jour ».", 12.5, fill=GREY, anchor="start"))
    save("4_sequence", svg(1080, 745, "".join(b)))


# ---------------------------------------------------------------- Gantt
def gantt():
    start = dt.date(2027, 1, 1)
    end = dt.date(2027, 5, 15)
    days = (end - start).days + 1
    X0, X1 = 330, 1110
    px = (X1 - X0) / days
    xd = lambda d: X0 + (d - start).days * px
    tasks = [
        ("Lancement", None),
        ("Prise en main, cahier des charges, maquette (VM)", (dt.date(2027, 1, 4), dt.date(2027, 1, 15)), "c3"),
        ("Serveur : nginx HTTPS, Flask, SQLite, NTP", (dt.date(2027, 1, 11), dt.date(2027, 1, 29)), "c10"),
        ("Kit signé : catalogue, signature, version", (dt.date(2027, 1, 18), dt.date(2027, 2, 5)), "c8"),
        ("V1 – agent, réseau, physique", None),
        ("Agent PowerShell : BITS, vérification, bascule", (dt.date(2027, 2, 1), dt.date(2027, 3, 12)), "c8"),
        ("Mesure 4G réelle, netem, captures Wireshark", (dt.date(2027, 2, 15), dt.date(2027, 3, 12)), "c10"),
        ("Physique : étalonnage des capteurs", (dt.date(2027, 2, 15), dt.date(2027, 3, 5)), "phy"),
        ("V1 – borne, tableau de bord, recette", None),
        ("Borne RFID ESP32 + test des étiquettes", (dt.date(2027, 3, 15), dt.date(2027, 4, 9)), "c8"),
        ("Physique : mesures froid → chaud, modèle", (dt.date(2027, 3, 8), dt.date(2027, 4, 9)), "phy"),
        ("Tableau de bord, export CSV, jetons", (dt.date(2027, 3, 22), dt.date(2027, 4, 16)), "c8"),
        ("Recette V1 (T01 à T10, T14, T15)", (dt.date(2027, 4, 12), dt.date(2027, 4, 23)), "c10"),
        ("V2 et fin de projet", None),
        ("V2 : archive et recherche (T11)", (dt.date(2027, 4, 19), dt.date(2027, 5, 7)), "c8"),
        ("Dossier technique, préparation de l’oral", (dt.date(2027, 4, 19), dt.date(2027, 5, 14)), "c1"),
        ("Journal de bord, suivi IA, réunions (tout le long)", (dt.date(2027, 1, 4), dt.date(2027, 5, 14)), "c3"),
    ]
    col = {"c3": "#7c3aed", "c10": "#059669", "c8": BLUE, "phy": "#d97706", "c1": "#db2777"}
    rowh = 28
    top = 95
    H = top + len(tasks) * rowh + 110
    b = [text(30, 30, "Planning prévisionnel du 1er janvier au 15 mai 2027 (≈ 150 h)", 16, "bold", anchor="start")]
    # mois
    months = [(dt.date(2027, m, 1), n) for m, n in [(1, "Janvier"), (2, "Février"), (3, "Mars"), (4, "Avril"), (5, "Mai")]]
    for i, (d, n) in enumerate(months):
        d2 = months[i + 1][0] if i + 1 < len(months) else end + dt.timedelta(days=1)
        x1, x2 = xd(d), xd(d2)
        b.append(f'<rect x="{x1}" y="50" width="{x2 - x1}" height="22" fill="{"#f3f4f6" if i % 2 == 0 else "#e5e7eb"}" stroke="#d1d5db"/>')
        b.append(text((x1 + x2) / 2, 66, n, 13, "bold"))
    # semaines (lundis)
    d = dt.date(2027, 1, 4)
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
    # jalons
    jal = [(dt.date(2027, 1, 4), "Début"), (dt.date(2027, 1, 29), "R1"), (dt.date(2027, 3, 19), "R2"),
           (dt.date(2027, 5, 14), "R3 + remise")]
    yb = top + len(tasks) * rowh
    for d, n in jal:
        x = xd(d) + px / 2
        b.append(line([(x, 74), (x, yb + 8)], color="#dc2626", width=1.4, dashed=True))
        b.append(f'<path d="M{x},{yb + 6} l8,8 l-8,8 l-8,-8 z" fill="#dc2626"/>')
        b.append(text(x, yb + 38, n, 12.5, "bold", fill="#dc2626"))
        b.append(text(x, yb + 53, d.strftime("%d/%m"), 11, fill="#dc2626"))
    # légende
    ly = H - 22
    lx = 30
    for c, n in [("c3", "Gérer un projet (C03)"), ("c8", "Coder (C08)"), ("c10", "Exploiter le réseau (C10)"),
                 ("phy", "Physique"), ("c1", "Communiquer (C01)")]:
        b.append(f'<rect x="{lx}" y="{ly - 11}" width="16" height="12" rx="2" fill="{col[c]}"/>')
        b.append(text(lx + 22, ly, n, 12.5, anchor="start"))
        lx += 205
    save("5_gantt", svg(1170, H, "".join(b)))


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    synoptique(); exigences(); contexte(); cas(); sequence(); gantt()
    print("SVG écrits dans", OUT)
