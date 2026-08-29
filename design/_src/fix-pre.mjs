// El editor descarta los nodos de texto en blanco entre dos elementos hermanos,
// así que dentro de un <pre> dos <span> en líneas seguidas se renderizan pegados.
// Cada línea pasa a ser su propio bloque; white-space:pre mantiene la sangría.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const src = dirname(fileURLToPath(import.meta.url));
const PRE = /(<pre class="code[^"]*"[^>]*>)([\s\S]*?)(<\/pre>)/g;

let totalPre = 0;
let totalFixed = 0;
const warnings = [];

for (const f of readdirSync(src).filter((n) => n.endsWith('.body.html'))) {
  const path = join(src, f);
  const before = readFileSync(path, 'utf8');

  const after = before.replace(PRE, (whole, open, inner, close) => {
    totalPre += 1;
    if (inner.includes('<div>')) return whole; // ya procesado
    const lines = inner.split('\n');
    if (lines.length < 2) return whole;

    for (const line of lines) {
      const opens = (line.match(/<span\b/g) || []).length;
      const closes = (line.match(/<\/span>/g) || []).length;
      if (opens !== closes) warnings.push(`${f}: span a caballo entre líneas -> ${line.slice(0, 60)}`);
    }

    totalFixed += 1;
    const wrapped = lines.map((l) => `<div>${l === '' ? ' ' : l}</div>`).join('');
    return `${open}${wrapped}${close}`;
  });

  if (after !== before) writeFileSync(path, after, 'utf8');
}

console.log(`bloques de código: ${totalPre} · reescritos: ${totalFixed}`);
for (const w of warnings) console.warn('AVISO ' + w);
