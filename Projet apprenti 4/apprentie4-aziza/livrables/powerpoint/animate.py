"""Add fade transitions to every slide and click-by-click fade-in for shapes named anim_<step>_*."""
import re, sys, zipfile, shutil, os

src, dst = sys.argv[1], sys.argv[2]
zin = zipfile.ZipFile(src)
zout = zipfile.ZipFile(dst + ".tmp", "w", zipfile.ZIP_DEFLATED)

def effect(ids, spid, first):
    a, b, c, d, e = ids
    node = "clickEffect" if first else "withEffect"
    return (f'<p:par><p:cTn id="{c}" presetID="10" presetClass="entr" presetSubtype="0" fill="hold" nodeType="{node}">'
            f'<p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
            f'<p:set><p:cBhvr><p:cTn id="{d}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>'
            f'<p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl><p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr>'
            f'<p:to><p:strVal val="visible"/></p:to></p:set>'
            f'<p:animEffect transition="in" filter="fade"><p:cBhvr><p:cTn id="{e}" dur="400"/><p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl></p:cBhvr></p:animEffect>'
            f'</p:childTnLst></p:cTn></p:par>')

for item in zin.infolist():
    data = zin.read(item.filename)
    if re.match(r"ppt/slides/slide\d+\.xml$", item.filename):
        xml = data.decode("utf-8")
        steps = {}
        for m in re.finditer(r'<p:cNvPr id="(\d+)" name="anim_(\d+)_[^"]*"', xml):
            steps.setdefault(int(m.group(2)), []).append(m.group(1))
        trans = '<p:transition spd="med"><p:fade/></p:transition>'
        timing = ""
        if steps:
            nid = 3
            seq = ""
            for k in sorted(steps):
                outer, inner = nid, nid + 1
                nid += 2
                effs = ""
                for j, spid in enumerate(steps[k]):
                    ids = (0, 0, nid, nid + 1, nid + 2)
                    nid += 3
                    effs += effect(ids, spid, j == 0)
                seq += (f'<p:par><p:cTn id="{outer}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst><p:childTnLst>'
                        f'<p:par><p:cTn id="{inner}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>{effs}</p:childTnLst></p:cTn></p:par>'
                        f'</p:childTnLst></p:cTn></p:par>')
            timing = ('<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>'
                      '<p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>'
                      + seq +
                      '</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>'
                      '<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>'
                      '</p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>')
        xml = xml.replace("</p:clrMapOvr>", "</p:clrMapOvr>" + trans + timing, 1)
        data = xml.encode("utf-8")
    zout.writestr(item, data)
zout.close()
shutil.move(dst + ".tmp", dst)
print("animated")
