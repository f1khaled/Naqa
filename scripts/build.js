// Builds index.html from src/index.template.html by inlining the Lucide icon set (ISC).
// Usage: node scripts/build.js   (requires `npm i lucide-static@0.460.0` once, or an existing icons.json)
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const tpl = fs.readFileSync(path.join(root, 'src/index.template.html'), 'utf8');
const srcDir = process.env.LUCIDE_DIR || path.join(root, 'node_modules/lucide-static/icons');
// Required: direct ic('x') / data-i="x" usages. Optional: any quoted token that names a Lucide icon (data tables, ternaries).
const required = new Set([...tpl.matchAll(/(?:ic\(\s*'|data-i=")([a-z0-9-]+)/g)].map(m => m[1]));
const quoted = [...tpl.matchAll(/'([a-z][a-z0-9-]+)'/g)].map(m => m[1]).filter(n => fs.existsSync(path.join(srcDir, n + '.svg')));
const used = [...new Set([...required, ...quoted])];
const icons = {}; const missing = [];
for (const n of used) {
  const f = path.join(srcDir, n + '.svg');
  if (!fs.existsSync(f)) { missing.push(n); continue; }
  icons[n] = fs.readFileSync(f, 'utf8').replace(/[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>[\s\S]*/, '').replace(/\s*\n\s*/g, '').replace(/ \/>/g, '/>');
}
if (missing.length) { console.error('Missing icons:', missing.join(', ')); process.exit(1); }
fs.writeFileSync(path.join(root, 'index.html'), tpl.replace('__ICONS__', JSON.stringify(icons)));
console.log('index.html built with', Object.keys(icons).length, 'icons');
