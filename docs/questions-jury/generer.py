#!/usr/bin/env python3
"""Génère les PDF « Questions difficiles du jury » des 4 apprentis.

Usage : python3 docs/questions-jury/generer.py
Chaque contenu est dans un fichier contenu.py rangé à côté du PDF produit
(dossier questions-jury de chaque apprenti). Le contenu définit :
  META        : titre, apprenti, projet, sources, nom du PDF
  TOP         : identifiants des questions les plus probables
  SECTIONS    : liste de dicts {titre, qui, intro, questions:[{id,q,piege,rep,relance,preuve,niv}]}
  A_CORRIGER  : points faibles trouvés dans les documents, à corriger avant l'oral
  LECTURES    : références pour aller plus loin
Dépendance : weasyprint (pip install weasyprint).
"""
import html
import importlib.util
import pathlib
import sys

from weasyprint import HTML

RACINE = pathlib.Path(__file__).resolve().parents[2]
CONTENUS = [
    RACINE / "Projet apprenti 1" / "questions-jury" / "contenu.py",
    RACINE / "Projet apprenti 2" / "questions-jury" / "contenu.py",
    RACINE / "Projet apprenti 3" / "livrables" / "questions-jury" / "contenu.py",
    RACINE / "Projet apprenti 4" / "apprentie4-aziza" / "livrables" / "questions-jury" / "contenu.py",
]

CSS = """
@page { size: A4; margin: 13mm 13mm 14mm 13mm;
  @bottom-left { content: "%(pied)s"; font: 6.8pt Inter, sans-serif; color: #8a93a0; }
  @bottom-right { content: "page " counter(page) " / " counter(pages); font: 6.8pt Inter, sans-serif; color: #8a93a0; } }
* { box-sizing: border-box; }
body { font-family: Inter, "DejaVu Sans", sans-serif; font-size: 8.6pt; line-height: 1.36; color: #1d2733; margin: 0; }
.top { display: flex; justify-content: space-between; border-bottom: 2pt solid #1f3a5f; padding-bottom: 3pt; font-size: 7.4pt; color: #4a5868; }
.top b { color: #1f3a5f; text-transform: uppercase; letter-spacing: .06em; }
h1 { font-size: 16pt; color: #1f3a5f; margin: 8pt 0 2pt; line-height: 1.15; }
.sous { font-size: 9.6pt; color: #4a5868; margin-bottom: 6pt; }
.meta { border: .6pt solid #c7cfd8; background: #f8fafc; padding: 5pt 8pt; font-size: 7.9pt; margin-bottom: 6pt; }
.meta p { margin: 0 0 2pt; }
.legende { display: flex; gap: 5pt; flex-wrap: wrap; font-size: 7.6pt; margin: 4pt 0 6pt; }
.legende span { padding: 1.5pt 5pt; border-radius: 2pt; }
.top5 { border: 1pt solid #b4572e; border-left: 4pt solid #b4572e; padding: 5pt 8pt; background: #fdf6f2; margin: 6pt 0 4pt; page-break-inside: avoid; }
.top5 b.t { color: #b4572e; display: block; margin-bottom: 2pt; }
.top5 ol { margin: 0; padding-left: 14pt; }
.top5 li { margin-bottom: 1.5pt; }
h2 { font-size: 11pt; color: #fff; background: #1f3a5f; padding: 3pt 7pt; margin: 12pt 0 4pt; border-radius: 2pt; page-break-after: avoid; }
h2 .qui { float: right; font-size: 7.6pt; font-weight: 600; background: #fff; color: #1f3a5f; padding: 1pt 5pt; border-radius: 2pt; margin-top: 1pt; }
.intro { font-size: 8pt; color: #4a5868; margin: 0 0 5pt; font-style: italic; }
.q { border: .6pt solid #d5dbe2; border-radius: 2pt; margin: 0 0 6pt; page-break-inside: avoid; }
.qh { background: #eef2f6; padding: 3.5pt 7pt; font-weight: 700; color: #1f3a5f; font-size: 9pt; }
.qh .id { display: inline-block; min-width: 20pt; color: #fff; background: #1f3a5f; text-align: center; border-radius: 2pt; padding: 0 3pt; margin-right: 5pt; font-size: 7.8pt; }
.qh .niv { float: right; color: #b4572e; font-size: 8pt; letter-spacing: 1pt; }
.qb { padding: 4pt 7pt 3pt; }
.qb p { margin: 0 0 3pt; }
.lab { font-weight: 700; font-size: 7.6pt; text-transform: uppercase; letter-spacing: .04em; margin-right: 3pt; }
.piege .lab { color: #b4572e; }
.rep .lab { color: #1d6b3a; }
.relance .lab { color: #8a5a00; }
.preuve .lab { color: #3a4a8c; }
.piege { color: #4a3a33; }
.relance, .preuve { font-size: 8.1pt; }
ul.c { margin: 2pt 0 4pt; padding-left: 12pt; }
ul.c li { margin-bottom: 2.5pt; }
.corr li b { color: #b4572e; }
.lect li { margin-bottom: 3pt; }
.fin { font-size: 7.4pt; color: #6a7684; border-top: .6pt solid #c7cfd8; margin-top: 10pt; padding-top: 3pt; }
code { font-family: "DejaVu Sans Mono", monospace; font-size: 7.6pt; background: #f1f3f6; padding: 0 2pt; }
"""


def charger(chemin):
    spec = importlib.util.spec_from_file_location("contenu", chemin)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def bloc(classe, label, texte):
    if not texte:
        return ""
    return f'<p class="{classe}"><span class="lab">{label}</span>{texte}</p>'


def rendre(mod):
    m = mod.META
    toutes = {q["id"]: q for s in mod.SECTIONS for q in s["questions"]}
    nb = len(toutes)
    out = [f"<!DOCTYPE html><html lang='fr'><head><meta charset='utf-8'><title>{html.escape(m['titre'])}</title>",
           "<style>" + CSS % {"pied": m["pied"]} + "</style></head><body>"]
    out.append(f"<div class='top'><span>BTS CIEL option A · Épreuve E6 « Valorisation de la donnée et cybersécurité » · Session 2027</span>"
               f"<b>Préparation de l'oral</b></div>")
    out.append(f"<h1>{m['titre']}</h1><div class='sous'>{m['sous_titre']}</div>")
    out.append("<div class='meta'>" + "".join(f"<p>{p}</p>" for p in m["cadre"]) + "</div>")
    out.append("<div class='legende'>"
               "<span style='background:#fdf6f2;color:#b4572e'><b>Le piège</b> : pourquoi la question est difficile</span>"
               "<span style='background:#eef7f1;color:#1d6b3a'><b>Réponse</b> : à dire en mots simples</span>"
               "<span style='background:#fbf5e8;color:#8a5a00'><b>S'il insiste</b> : la relance probable</span>"
               "<span style='background:#eef0f8;color:#3a4a8c'><b>À montrer</b> : la preuve</span>"
               "<span style='color:#b4572e'>●●● = très difficile</span></div>")
    out.append("<div class='top5'><b class='t'>Les questions les plus probables (à préparer en premier)</b><ol>")
    for i in mod.TOP:
        out.append(f"<li><b>{i}</b> — {toutes[i]['q']}</li>")
    out.append("</ol></div>")
    out.append(f"<p class='intro'>{nb} questions en {len(mod.SECTIONS)} thèmes, puis les points à corriger avant l'oral et des lectures pour aller plus loin.</p>")
    for s in mod.SECTIONS:
        out.append(f"<h2>{s['titre']}<span class='qui'>{s['qui']}</span></h2>")
        if s.get("intro"):
            out.append(f"<p class='intro'>{s['intro']}</p>")
        for q in s["questions"]:
            niv = "●" * q.get("niv", 2) + "○" * (3 - q.get("niv", 2))
            out.append(f"<div class='q'><div class='qh'><span class='id'>{q['id']}</span>{q['q']}<span class='niv'>{niv}</span></div><div class='qb'>")
            out.append(bloc("piege", "Le piège", q.get("piege")))
            out.append(bloc("rep", "Réponse", q.get("rep")))
            out.append(bloc("relance", "S'il insiste", q.get("relance")))
            out.append(bloc("preuve", "À montrer", q.get("preuve")))
            out.append("</div></div>")
    out.append("<h2>Points à corriger avant la soutenance<span class='qui'>Enseignant</span></h2>")
    out.append("<p class='intro'>Faiblesses repérées en relisant les documents : un jury attentif les trouvera aussi.</p><ul class='c corr'>")
    out += [f"<li>{x}</li>" for x in mod.A_CORRIGER]
    out.append("</ul>")
    out.append("<h2>Pour aller plus loin<span class='qui'>Lectures</span></h2><ul class='c lect'>")
    out += [f"<li>{x}</li>" for x in mod.LECTURES]
    out.append("</ul>")
    out.append(f"<div class='fin'>{m['fin']}</div></body></html>")
    return "".join(out)


def main():
    cibles = sys.argv[1:] or [str(c) for c in CONTENUS]
    for c in cibles:
        c = pathlib.Path(c).resolve()
        mod = charger(c)
        page = rendre(mod)
        pdf = c.parent / mod.META["pdf"]
        HTML(string=page, base_url=str(c.parent)).write_pdf(pdf)
        print(pdf.relative_to(RACINE))


if __name__ == "__main__":
    main()
