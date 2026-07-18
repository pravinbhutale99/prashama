// Production build script for Prashama.
//
// Bundles src/entry.js (which pulls in React/ReactDOM from npm and then
// app.js) into a single minified JS file with esbuild, and copies all
// static assets (index.html, manifest.json, sw.js, icons, favicon) into
// the dist/ folder. Run with: npm run build
// Watch mode (rebuilds on file change): npm run build -- --watch  (or npm run dev)

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const isWatch = process.argv.includes('--watch');
const DIST = path.join(__dirname, 'dist');

function copyStatic() {
  fs.mkdirSync(DIST, { recursive: true });
  fs.mkdirSync(path.join(DIST, 'icons'), { recursive: true });

  // Static files served as-is at the site root
  const rootFiles = ['index.html', 'manifest.json', 'sw.js', 'favicon.ico', 'landing.html', 'sitemap.xml', 'robots.txt'];
  for (const f of rootFiles) {
    const src = path.join(__dirname, f);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(DIST, f));
    }
  }

  // Icons directory
  const iconsDir = path.join(__dirname, 'icons');
  if (fs.existsSync(iconsDir)) {
    for (const f of fs.readdirSync(iconsDir)) {
      fs.copyFileSync(path.join(iconsDir, f), path.join(DIST, 'icons', f));
    }
  }

  console.log('✓ static assets copied to dist/');
}

const buildOptions = {
  entryPoints: [path.join(__dirname, 'src', 'entry.js')],
  bundle: true,
  outfile: path.join(DIST, 'app.bundle.js'),
  minify: !isWatch,
  sourcemap: isWatch ? 'inline' : false,
  target: ['es2019'],
  format: 'iife', // self-contained — no <script type="module"> needed, works in any WebView
  loader: { '.js': 'jsx' }, // app.js has zero JSX, but this keeps the door open safely
  logLevel: 'info',
};

async function build() {
  copyStatic();
  if (isWatch) {
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
    console.log('Watching for changes... (Ctrl+C to stop)');
  } else {
    await esbuild.build(buildOptions);
    const stat = fs.statSync(path.join(DIST, 'app.bundle.js'));
    console.log(`✓ build complete: dist/app.bundle.js (${(stat.size / 1024).toFixed(1)} KB)`);
  }
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
