const fs = require('fs');
const path = require('path');
const { Scanner } = require('@tailwindcss/oxide');
const { compile } = require('@tailwindcss/node');

async function buildCss() {
  const root = path.resolve(__dirname, '..');
  const sourcePath = path.join(root, 'src', 'app', 'globals.source.css');
  const targetPath = path.join(root, 'src', 'app', 'globals.css');

  if (!fs.existsSync(sourcePath)) {
    console.error('Source CSS not found:', sourcePath);
    process.exit(1);
  }

  const css = fs.readFileSync(sourcePath, 'utf8');

  console.log('Scanning project files for Tailwind classes...');
  const scanner = new Scanner({
    sources: [
      {
        base: root,
        pattern: 'src/**/*.{ts,tsx,html,js,jsx}',
        negated: false,
      },
    ],
  });

  const candidates = scanner.scan();
  console.log(`Found ${candidates.length} class candidates.`);

  console.log('Compiling Tailwind CSS...');
  const compiler = await compile(css, {
    base: root,
    onDependency: () => {},
  });

  const compiledCss = compiler.build(candidates);

  fs.writeFileSync(targetPath, compiledCss, 'utf8');
  console.log(`✅ Successfully compiled Tailwind CSS (${Math.round(compiledCss.length / 1024)} KB) -> ${targetPath}`);
}

buildCss().catch((err) => {
  console.error('CSS Compilation Error:', err);
  process.exit(1);
});
