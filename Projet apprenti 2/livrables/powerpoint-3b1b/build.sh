#!/bin/bash
# Reconstruit le PowerPoint de Yaksan : script, thème, animations.
# Prérequis : pptxgenjs installé (npm install pptxgenjs@3.12.0), NODE_PATH pointant vers son node_modules.
set -e
cd "$(dirname "$0")"
node build.js
node -e "const {applyTheme}=require('./apply_theme.js');const src=require('fs').readFileSync('build.js','utf8');const THEME=eval('('+src.match(/const THEME = (\{[\s\S]*?\n\});/)[1]+')');applyTheme('deck_brut.pptx',THEME).then(()=>console.log('thème appliqué'))"
python3 animate.py deck_brut.pptx Projet_E6_Yaksan_3b1b.pptx
rm -f deck_brut.pptx
