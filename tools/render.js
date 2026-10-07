const { chromium } = require('./node_modules/playwright-core');
const sharp = require('./node_modules/sharp');
const fs = require('fs'), path = require('path');
const jobs = JSON.parse(fs.readFileSync(process.argv[2]));
const only = process.argv[3] ? process.argv[3].split(',') : null;
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
  for (const j of jobs) {
    const name = path.basename(j.svg, '.svg');
    if (only && !only.includes(name)) continue;
    const p = await b.newPage({ viewport: { width: j.w, height: j.h }, deviceScaleFactor: 1 });
    await p.goto('file://' + j.svg);
    await p.waitForTimeout(250);
    await p.screenshot({ path: j.png, omitBackground: true });
    await p.close();
    await (j.ow ? sharp(j.png).resize(j.ow) : sharp(j.png)).webp({ quality: j.q, alphaQuality: 92, effort: 5 }).toFile(j.webp);
    console.log(name, (fs.statSync(j.webp).size / 1024) | 0, 'KB');
  }
  await b.close();
})();
