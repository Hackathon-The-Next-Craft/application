// Genera los .dc.html del canvas a partir de los cuerpos en _src/*.body.html.
// Cada pantalla es autónoma: el bloque de tokens se inyecta idéntico en todas.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const src = dirname(fileURLToPath(import.meta.url));
const out = join(src, '..');

import { HELMET } from './helmet.mjs';

const files = readdirSync(src).filter((f) => f.endsWith('.body.html'));
for (const f of files) {
  const name = f.replace('.body.html', '');
  const body = readFileSync(join(src, f), 'utf8').trim();
  const page = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
${HELMET}

${body}
</x-dc>
</body>
</html>
`;
  writeFileSync(join(out, `${name}.dc.html`), page, 'utf8');
}
console.log(`generadas ${files.length} pantallas`);
