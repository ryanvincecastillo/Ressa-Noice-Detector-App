const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const pngToIco = require('png-to-ico').default;

const root = process.cwd();
const srcSvg = path.join(root, 'src/assets/ressa/calm.svg');
const outDir = path.join(root, 'build/icons');
const iconsetDir = path.join(outDir, 'icon.iconset');
const basePng = path.join(outDir, 'icon-1024.png');
const pngOut = path.join(outDir, 'icon.png');
const icoOut = path.join(outDir, 'icon.ico');
const icnsOut = path.join(outDir, 'icon.icns');

const ensureDir = (p) => fs.mkdirSync(p, { recursive: true });

const run = (cmd, args) => execFileSync(cmd, args, { stdio: 'ignore' });

const ensureBasePng = () => {
  ensureDir(outDir);
  if (!fs.existsSync(srcSvg)) {
    throw new Error(`Missing source SVG: ${srcSvg}`);
  }

  // Convert SVG to PNG using macOS sips, then upscale to 1024 for packaging assets.
  run('sips', ['-s', 'format', 'png', srcSvg, '--out', basePng]);
  run('sips', ['-z', '1024', '1024', basePng, '--out', basePng]);
  fs.copyFileSync(basePng, pngOut);
};

const buildIcns = () => {
  ensureDir(iconsetDir);
  const sizes = [
    ['16', '16', 'icon_16x16.png'],
    ['32', '32', 'icon_16x16@2x.png'],
    ['32', '32', 'icon_32x32.png'],
    ['64', '64', 'icon_32x32@2x.png'],
    ['128', '128', 'icon_128x128.png'],
    ['256', '256', 'icon_128x128@2x.png'],
    ['256', '256', 'icon_256x256.png'],
    ['512', '512', 'icon_256x256@2x.png'],
    ['512', '512', 'icon_512x512.png']
  ];

  for (const [w, h, name] of sizes) {
    run('sips', ['-z', h, w, basePng, '--out', path.join(iconsetDir, name)]);
  }

  fs.copyFileSync(basePng, path.join(iconsetDir, 'icon_512x512@2x.png'));
  run('iconutil', ['-c', 'icns', iconsetDir, '-o', icnsOut]);
};

const buildIco = async () => {
  const icoSizes = [16, 24, 32, 48, 64, 128, 256];
  const icoPngs = [];
  for (const size of icoSizes) {
    const p = path.join(outDir, `icon-${size}.png`);
    run('sips', ['-z', String(size), String(size), basePng, '--out', p]);
    icoPngs.push(p);
  }

  const icoBuffer = await pngToIco(icoPngs);
  fs.writeFileSync(icoOut, icoBuffer);
};

const main = async () => {
  ensureBasePng();
  if (process.platform === 'darwin') {
    buildIcns();
  }
  await buildIco();
  console.log('Generated icons in build/icons');
};

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
