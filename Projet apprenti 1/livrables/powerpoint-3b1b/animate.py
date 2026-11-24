"""Ajoute les transitions et les animations au clic d'un deck pptxgenjs.

Nom d'une forme animée : anim_<clic>_<effets>_<id>
  <clic>   : numéro du clic (1, 2, 3...) sur la diapositive
  <effets> : un ou plusieurs effets séparés par '+', chacun = lettre + options '~'
             f            apparition en fondu (400 ms)
             w            balayage depuis la gauche (barre de progression)
             x            disparition en fondu
             m~dx:dy      déplacement relatif, en pouces (dx vers la droite, dy vers le bas)
             options : ~t<ms> durée, ~d<ms> délai après le clic
  Exemples : anim_2_f_doc  ·  anim_3_w~t1500~d300_barre  ·  anim_1_f~t200+m~3:0~t1200~d200_paquet
Usage : python animate.py entree.pptx sortie.pptx
"""
import re, sys, zipfile, shutil

SW, SH = 10.0, 5.625  # taille de la diapositive en pouces (LAYOUT_16x9)
src, dst = sys.argv[1], sys.argv[2]


class Ids:
    def __init__(self):
        self.n = 2

    def __call__(self):
        self.n += 1
        return self.n


def parse(spec):
    out = []
    for tok in spec.split('+'):
        parts = tok.split('~')
        kind = parts[0][0]
        e = {'k': kind, 't': None, 'd': 0, 'dx': 0.0, 'dy': 0.0}
        for p in parts[1:]:
            if p.startswith('t'):
                e['t'] = int(p[1:])
            elif p.startswith('d'):
                e['d'] = int(p[1:])
            elif ':' in p:
                dx, dy = p.split(':')
                e['dx'], e['dy'] = float(dx), float(dy)
        out.append(e)
    return out


def tgt(spid):
    return f'<p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl>'


def effect(e, spid, node, nid):
    d = e['d']
    if e['k'] in 'fw':
        dur = e['t'] or (400 if e['k'] == 'f' else 1200)
        preset, sub, filt = ('10', '0', 'fade') if e['k'] == 'f' else ('22', '8', 'wipe(left)')
        return (f'<p:par><p:cTn id="{nid()}" presetID="{preset}" presetClass="entr" presetSubtype="{sub}" fill="hold" nodeType="{node}">'
                f'<p:stCondLst><p:cond delay="{d}"/></p:stCondLst><p:childTnLst>'
                f'<p:set><p:cBhvr><p:cTn id="{nid()}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>'
                f'{tgt(spid)}<p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr>'
                f'<p:to><p:strVal val="visible"/></p:to></p:set>'
                f'<p:animEffect transition="in" filter="{filt}"><p:cBhvr><p:cTn id="{nid()}" dur="{dur}"/>{tgt(spid)}</p:cBhvr></p:animEffect>'
                f'</p:childTnLst></p:cTn></p:par>')
    if e['k'] == 'x':
        dur = e['t'] or 400
        return (f'<p:par><p:cTn id="{nid()}" presetID="10" presetClass="exit" presetSubtype="0" fill="hold" nodeType="{node}">'
                f'<p:stCondLst><p:cond delay="{d}"/></p:stCondLst><p:childTnLst>'
                f'<p:animEffect transition="out" filter="fade"><p:cBhvr><p:cTn id="{nid()}" dur="{dur}"/>{tgt(spid)}</p:cBhvr></p:animEffect>'
                f'<p:set><p:cBhvr><p:cTn id="{nid()}" dur="1" fill="hold"><p:stCondLst><p:cond delay="{dur - 1}"/></p:stCondLst></p:cTn>'
                f'{tgt(spid)}<p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr>'
                f'<p:to><p:strVal val="hidden"/></p:to></p:set>'
                f'</p:childTnLst></p:cTn></p:par>')
    if e['k'] == 'm':
        dur = e['t'] or 1200
        fx, fy = e['dx'] / SW, e['dy'] / SH
        return (f'<p:par><p:cTn id="{nid()}" presetID="0" presetClass="path" presetSubtype="0" accel="30000" decel="30000" fill="hold" nodeType="{node}">'
                f'<p:stCondLst><p:cond delay="{d}"/></p:stCondLst><p:childTnLst>'
                f'<p:animMotion origin="layout" path="M 0 0 L {fx:.5f} {fy:.5f} E" pathEditMode="relative" ptsTypes="AA">'
                f'<p:cBhvr><p:cTn id="{nid()}" dur="{dur}" fill="hold"/>{tgt(spid)}'
                f'<p:attrNameLst><p:attrName>ppt_x</p:attrName><p:attrName>ppt_y</p:attrName></p:attrNameLst></p:cBhvr></p:animMotion>'
                f'</p:childTnLst></p:cTn></p:par>')
    raise ValueError(e)


zin = zipfile.ZipFile(src)
zout = zipfile.ZipFile(dst + '.tmp', 'w', zipfile.ZIP_DEFLATED)
total = 0
for item in zin.infolist():
    data = zin.read(item.filename)
    if re.match(r'ppt/slides/slide\d+\.xml$', item.filename):
        xml = data.decode('utf-8')
        steps = {}
        for m in re.finditer(r'<p:cNvPr id="(\d+)" name="anim_(\d+)_([^_"]+)_[^"]*"', xml):
            for e in parse(m.group(3)):
                steps.setdefault(int(m.group(2)), []).append((e, m.group(1)))
        trans = '<p:transition spd="med"><p:fade/></p:transition>'
        timing = ''
        if steps:
            nid = Ids()
            seq = ''
            for k in sorted(steps):
                outer, inner = nid(), nid()
                effs = ''
                items = sorted(steps[k], key=lambda it: it[0]['d'])
                for j, (e, spid) in enumerate(items):
                    effs += effect(e, spid, 'clickEffect' if j == 0 else 'withEffect', nid)
                    total += 1
                seq += (f'<p:par><p:cTn id="{outer}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst><p:childTnLst>'
                        f'<p:par><p:cTn id="{inner}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>{effs}</p:childTnLst></p:cTn></p:par>'
                        f'</p:childTnLst></p:cTn></p:par>')
            timing = ('<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>'
                      '<p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>'
                      + seq +
                      '</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>'
                      '<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>'
                      '</p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>')
        xml = xml.replace('</p:clrMapOvr>', '</p:clrMapOvr>' + trans + timing, 1)
        data = xml.encode('utf-8')
    zout.writestr(item, data)
zout.close()
shutil.move(dst + '.tmp', dst)
print(f'animations ajoutées : {total}')
