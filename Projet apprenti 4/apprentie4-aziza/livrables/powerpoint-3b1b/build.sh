#!/bin/bash
# Reconstruit le PowerPoint : script, thème, animations, validation.
set -e
cd "$(dirname "$0")"
node build.js
node -e "const {applyTheme}=require(process.env.APPLY_THEME);const src=require('fs').readFileSync('build.js','utf8');const THEME=eval('('+src.match(/const THEME = (\{[\s\S]*?\n\});/)[1]+')');applyTheme('deck_brut.pptx',THEME).then(()=>console.log('thème appliqué'))"
python3 animate.py deck_brut.pptx Projet_E6_Aziza_3b1b.pptx
rm -f deck_brut.pptx
