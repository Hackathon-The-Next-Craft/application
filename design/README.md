# Pantallas de Multix

Las 20 pantallas del MVP, en alta fidelidad, según `../multix-design-system.md` v1.0.
Se publican como un canvas de diseño con tres páginas: entrevistador (12),
candidato (6) y estados del sistema (2).

## Estructura

| Ruta | Qué es |
|---|---|
| `_src/helmet.mjs` | El sistema de diseño: tokens `--mx-*`, tipografía y clases (`mx-chip`, `mx-label`, `mx-evidence`). Se inyecta idéntico en las 20 pantallas |
| `_src/*.body.html` | El contenido de cada pantalla. **Aquí se edita** |
| `_src/build.mjs` | Compone `_src/*.body.html` + el sistema en los `.dc.html` de este directorio |
| `_src/fix-pre.mjs` | Envuelve cada línea de los bloques de código en su propio elemento (ver más abajo) |
| `*.dc.html` | Artboards generados. **No editar a mano**: se sobrescriben |
| `canvas.json` | Posición de cada artboard, páginas y notas del canvas |

## Flujo de trabajo

```bash
node _src/build.mjs      # regenera los 20 .dc.html
node _src/fix-pre.mjs    # solo si has escrito un bloque de código nuevo
```

Después se ensambla el canvas con el helper del skill `design` y se publica
sobre el mismo artefacto para conservar el enlace del equipo.

## Dos cosas que conviene saber

**Los bloques de código necesitan `fix-pre.mjs`.** El editor del canvas descarta
los nodos de texto en blanco entre dos elementos hermanos, así que dentro de un
`<pre>` dos `<span>` en líneas seguidas se renderizan pegados. El script envuelve
cada línea en su propio bloque; `white-space: pre` mantiene la sangría.

**Los cuerpos usan alias además de los tokens `--mx-*`** (`--surface`, `--text-2`,
`--accent`…). Están definidos al final de `:root` en `helmet.mjs` y resuelven al
sistema. Para código nuevo, usa los `--mx-*` directamente.

## Decisiones que se apartan de la guía

Las pidió el equipo y están tomadas a conciencia:

- **Sin superficies oscuras.** La guía sitúa el panel del entrevistador y la
  superficie del editor en Tinta 900 (§4, §6). El equipo las descartó: todo va
  sobre papel y blanco. El estado de cada candidato se comunica con el filete de
  3 px a la izquierda de su tarjeta más el chip.
- **Sin degradados**, según §4 regla 4.

## Pendiente

- Versiones a 320 px y comprobación al 200 % de zoom (checklist §9).
- Confirmar si el acceso, la lista de sesiones y la comparativa entran en el MVP:
  se dedujeron del PRD, que no los especifica. Están marcados con notas en el canvas.
