/* Velora · prepare-www — cross-platform build of the www/ directory for Capacitor.
   Replaces the Unix-only shell commands (mkdir -p, cp -r) that fail on Windows. */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const www = path.join(root, 'www');

const copy = (src, dest) => {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copy(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
};

const files = [
  'index.html',
  'manifest.webmanifest',
  'sw.js',
  'icon-192.png',
  'icon-512.png',
  'js',
  'css',
];

if (fs.existsSync(www)) fs.rmSync(www, { recursive: true, force: true });
fs.mkdirSync(www, { recursive: true });

for (const f of files) {
  copy(path.join(root, f), path.join(www, f));
}

console.log(`www/ built (${files.length} entries)`);