# -*- coding: utf-8 -*-
"""Schéma d'articulation des composants du projet de Wassim. python3 schema.py puis rendu (Chromium)."""
from html import escape
F = "Liberation Sans, Arial, sans-serif"
INK, GREY, BLUE, BBG, ORA, OBG, GRN, GBG, PUR = "#1f2937", "#6b7280", "#1d4ed8", "#e8f0fe", "#c2410c", "#fff1e6", "#047857", "#e6f6ef", "#7c3aed"
o = []
def t(x, y, s, sz=13, w="normal", c=INK, a="middle", it=False):
    o.append(f'<text x="{x}" y="{y}" font-size="{sz}" font-weight="{w}" fill="{c}" text-anchor="{a}"{" font-style=\"italic\"" if it else ""}>{escape(s)}</text>')
def r(x, y, w, h, fill="#fff", st="#4b5563", sw=1.4, dash=False, rx=8):
    o.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{st}" stroke-width="{sw}"{" stroke-dasharray=\"6 4\"" if dash else ""}/>')
def box(x, y, w, h, title, lines=(), fill="#fff", st="#4b5563", dash=False, ts=14, ls=12):
    r(x, y, w, h, fill, st, 1.6 if fill != "#fff" else 1.3, dash)
    t(x + w/2, y + 20, title, ts, "bold")
    for i, l in enumerate(lines):
        t(x + w/2, y + 38 + i*16, l, ls, c="#374151")
def ln(pts, c=GREY, w=1.6, dash=False, end=True, start=False):
    p = " ".join(f"{a},{b}" for a, b in pts)
    o.append(f'<polyline points="{p}" fill="none" stroke="{c}" stroke-width="{w}"{" stroke-dasharray=\"6 4\"" if dash else ""}'
             f'{" marker-end=\"url(#m)\"" if end else ""}{" marker-start=\"url(#m)\"" if start else ""}/>')
def lab(x, y, s, c=GREY, a="middle", sz=11.5):
    w = len(s) * sz * 0.52 + 8
    xx = x - w/2 if a == "middle" else (x if a == "start" else x - w)
    o.append(f'<rect x="{xx}" y="{y-12}" width="{w}" height="16" rx="3" fill="#fff" opacity="0.92"/>')
    t(x if a != "start" else x + 4, y, s, sz, c=c, a=a)

W, H = 1500, 960
t(30, 34, "Comment les composants s’articulent – maquette au lycée", 19, "bold", a="start")
t(30, 56, "Bleu : réalisé par Wassim · Orange : V2 · Pointillés : alimentation ou liaison locale · Sur chaque flèche : protocole et port", 12.5, GREY, a="start")

# ---------------- zone imprimante
r(20, 75, 470, 700, "#fafafa", "#d1d5db", 1, rx=12); t(36, 97, "DANS LE SERVICE DE SOINS", 12, "bold", GREY, "start")
box(40, 112, 200, 120, "Imprimante réseau", ["moteurs, four", "sortie du papier", "agent SNMP (port 161)", "IPP 631 · RAW 9100"])
# boîtier
r(40, 270, 430, 380, BBG, BLUE, 2); t(255, 292, "Boîtier de l’imprimante – ESP32 (C++)", 14, "bold")
t(255, 309, "fixé de façon rigide sur le châssis", 11.5, GREY, it=True)
r(185, 400, 140, 120, "#fff", BLUE, 2); t(255, 425, "ESP32", 16, "bold"); t(255, 445, "Wi-Fi, MQTT/TLS", 11.5, c="#374151")
t(255, 461, "heure NTP", 11.5, c="#374151"); t(255, 477, "seuils, comptage", 11.5, c="#374151"); t(255, 493, "énergie vibration / s", 11.5, c="#374151")
sens = [  # x,y,w,titre,ligne,bus,couleur,ancrage
    (55, 325, "MPU6050", "vibration 3 axes, 1 kHz", "I²C", INK),
    (55, 395, "Capteur infrarouge", "compte les feuilles", "GPIO interruption", INK),
    (55, 465, "Gros bouton", "« ça ne marche pas »", "GPIO", INK),
    (55, 535, "SHT31 (V2)", "température, humidité", "I²C", ORA),
    (340, 325, "Écran à encre 2,9″", "« BAC VIDE », « RÉPARÉ »", "SPI", INK),
    (340, 420, "LED", "état du boîtier", "GPIO", INK),
    (340, 515, "Lecteur RFID (V2)", "carte du technicien", "SPI", ORA),
]
for x, y, n, l, bus, c in sens:
    fill = OBG if c == ORA else "#fff"; st = ORA if c == ORA else "#4b5563"
    w = 120
    r(x, y, w, 52, fill, st, 1.3); t(x + w/2, y + 20, n, 12, "bold"); t(x + w/2, y + 38, l, 10, c="#374151")
    if x < 185:
        ln([(x + w, y + 26), (183, min(max(y + 26, 410), 510))], c, 1.3)
    else:
        ln([(327, min(max(y + 26, 410), 510)), (x, y + 26)], c, 1.3)
    lab(x + w/2, y + 65, bus, c, "middle", 10.5)
r(55, 608, 400, 34, "#fff", "#9ca3af", 1, True); t(255, 630, "Alimentation : bloc USB 5 V du commerce (aucun câblage 230 V)", 11.5, c="#374151")
ln([(255, 606), (255, 522)], GREY, 1.2, True)
# physique : capteurs vers imprimante
ln([(110, 268), (110, 234)], GREY, 1.2, True); lab(104, 256, "vibrations", GREY, "end", 10.5)
ln([(200, 268), (200, 234)], GREY, 1.2, True); lab(206, 256, "feuilles qui sortent", GREY, "start", 10.5)
t(380, 145, "papier humide ?", 11, ORA, it=True); ln([(330, 150), (245, 165)], ORA, 1, True)
t(380, 160, "→ mesuré par le SHT31 (V2)", 10.5, ORA, it=True)

# PC secrétaire
box(40, 690, 430, 70, "PC de la secrétaire (VM Windows 11, domaine)", ["imprime via CUPS · point d’accès JEA (file d’impression)"])

# ---------------- réseau
r(540, 75, 230, 700, "#f8fafc", "#d1d5db", 1, rx=12); t(655, 97, "RÉSEAU DE LA MAQUETTE", 12, "bold", GREY)
t(655, 113, "exploité, non reconfiguré (C10)", 11, GREY, it=True)
box(560, 135, 190, 70, "Point d’accès Wi-Fi", ["boîtiers ESP32"])
box(560, 330, 190, 70, "Switch HP ProCurve", ["Ethernet du lycée"])
box(560, 560, 190, 90, "Routeur Cisco ISR 4331", ["passerelle", "DHCP · DNS · NTP"])
ln([(655, 207), (655, 328)], GREY, 1.4, False, False); ln([(655, 402), (655, 558)], GREY, 1.4, False, False)

# ---------------- serveurs
r(820, 75, 660, 700, "#fafafa", "#d1d5db", 1, rx=12); t(836, 97, "SERVEURS (PC UBUNTU)", 12, "bold", GREY, "start")
r(840, 112, 400, 330, BBG, BLUE, 2); t(1040, 134, "Serveur Ubuntu – le « cerveau »", 14, "bold")
mods = [("Mosquitto", "broker MQTT/TLS 8883"), ("Service Python", "compare les 4 témoins, décide"),
        ("CUPS", "serveur d’impression : pages envoyées"), ("PostgreSQL", "mesures, événements"), ("Grafana", "tableau de bord")]
for i, (n, l) in enumerate(mods):
    y = 148 + i*56
    r(860, y, 360, 46, "#fff", BLUE, 1.2); t(870, y + 19, n, 13, "bold", a="start"); t(870, y + 36, l, 11.5, "#374151", a="start")
box(1270, 112, 190, 90, "GLPI (Docker)", ["tickets à paliers", "données fictives"], BBG, BLUE)
box(1270, 230, 190, 90, "Annuaire AD", ["Samba sur Ubuntu", "service de chaque PC"])
box(1270, 345, 190, 70, "Partage réseau", ["applications par profil"], OBG, ORA)
box(840, 470, 300, 80, "Station des PC neufs (V2)", ["ESP32, lecteur RFID, écran, LED", "3 cartes : technicien, profil, PC"], OBG, ORA)
box(1170, 470, 290, 80, "PC neuf (VM Windows, V2)", ["script PowerShell : domaine,", "service AD, applications"], OBG, ORA)
box(840, 600, 300, 70, "PC du technicien", ["navigateur : GLPI, Grafana"])
box(1170, 600, 290, 70, "Fausse imprimante (extension)", ["ESP32 piège : alerte si scannée"], "#fff", "#9ca3af", True)

# ---------------- liaisons (protocoles)
ln([(472, 455), (520, 455), (520, 170), (558, 170)], BLUE, 2)
lab(505, 445, "Wi-Fi", BLUE, "end")
ln([(752, 170), (800, 170), (800, 172), (858, 172)], BLUE, 2); lab(805, 162, "MQTT/TLS 8883", BLUE)
ln([(858, 290), (790, 290), (790, 250), (242, 250), (242, 200)], GRN, 1.8); lab(520, 244, "SNMP 161 (état, papier, encre, compteur) · IPP 631 (CUPS)", GRN)
ln([(472, 725), (800, 725), (800, 260), (858, 260)], PUR, 1.8, start=True)
lab(640, 719, "WinRM HTTPS 5986 (JEA) · IPP 631 vers CUPS", PUR)
ln([(1222, 171), (1268, 157)], BLUE, 1.6); lab(1245, 186, "API REST HTTPS", BLUE, sz=10.5)
ln([(1222, 230), (1268, 275)], GRN, 1.6); lab(1252, 222, "LDAP", GRN, sz=10.5)
ln([(1200, 468), (1200, 444)], ORA, 1.4); lab(1206, 460, "HTTPS (commande)", ORA, "start", 10.5)
ln([(990, 468), (990, 444)], ORA, 1.4); lab(1020, 460, "MQTT", ORA, "start", 10.5)
ln([(1365, 468), (1365, 417)], ORA, 1.4); lab(1372, 448, "SMB", ORA, "start", 10.5)
ln([(1440, 468), (1440, 440), (1470, 440), (1470, 300), (1462, 300)], ORA, 1.4); lab(1466, 337, "Kerberos, LDAP", ORA, "end", 10.5)
ln([(838, 635), (810, 635), (810, 82), (1365, 82), (1365, 110)], INK, 1.3, dash=True); lab(1100, 86, "HTTPS (GLPI, Grafana)", INK, sz=10.5)
ln([(752, 605), (838, 635)], GREY, 1.2, dash=True); lab(793, 640, "NTP, DNS", GREY, sz=10.5)

# ---------------- légende étapes
r(20, 795, 1460, 150, "#fff", "#d1d5db", 1, rx=10)
t(36, 820, "Ce qui se passe quand une impression rate", 14, "bold", a="start")
steps = ["1. La secrétaire imprime : CUPS sur le serveur sait combien de pages sont demandées.",
         "2. Le boîtier envoie en MQTT ce qu’il sent : vibration (MPU6050), feuilles comptées (infrarouge), humidité (SHT31, V2).",
         "3. Le serveur interroge l’imprimante en SNMP (« prête », « plus de papier », encre) et le PC par JEA (documents bloqués ?).",
         "4. Il lit l’AD (LDAP) pour connaître le réseau attendu du service, compare les 4 témoins et trouve la cause.",
         "5. Il ouvre le ticket GLPI (API REST), met à jour Grafana et renvoie un message à l’écran du boîtier (« BLOQUÉE », « RÉPARÉ »)."]
for i, s in enumerate(steps):
    t(36, 845 + i*19, s, 12.5, c="#374151", a="start")

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" font-family="{F}">'
       f'<defs><marker id="m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
       f'<path d="M0,0 L10,5 L0,10 z" fill="context-stroke"/></marker></defs>'
       f'<rect width="100%" height="100%" fill="#fff"/>{"".join(o)}</svg>')
open("schema_composants.svg", "w", encoding="utf-8").write(svg)
