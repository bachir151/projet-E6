// Convertit chaque schemas/*.svg en PNG (x2) avec Chromium.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
(async () => {
  const dir = path.join(__dirname, 'schemas');
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 2 });
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.svg'))) {
    const svg = fs.readFileSync(path.join(dir, f), 'utf8');
    await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
    const el = await page.$('svg');
    await el.screenshot({ path: path.join(dir, f.replace('.svg', '.png')) });
    console.log('PNG', f);
  }
  await browser.close();
})();
