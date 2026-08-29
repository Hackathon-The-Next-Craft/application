# Python en el navegador — pendiente

`frontend.md` (rama 4) pide Pyodide para los retos en Python. No está hecho, a
propósito, y estas son las razones:

1. **No hay ningún reto en Python contra el que probarlo.** El único reto que
   existe en el deployment es el del seed, en JavaScript. El generador de
   Alejandro todavía es un stub (`def solve(x): pass`). Publicar un runner que
   no se ha ejecutado ni una vez es peor que no publicarlo.

2. **Falta el mismo contrato que le falta a JavaScript** (ver `types.ts`): qué
   función llamar y cómo se codifican `input` / `expected`. En Python no hay
   `module.exports`, así que la deducción por `starterCode` es aún más frágil.

3. **Pyodide se descarga de un CDN (~10 MB) la primera vez.** En el demo, con
   wifi de evento, eso es un riesgo real. El `.gitignore` ya reserva
   `/public/pyodide/`, lo que sugiere que el plan era auto-hospedarlo — decisión
   que conviene tomar antes de escribir el código, no después.

Mientras tanto, un reto en Python muestra un mensaje explícito en el panel de
ejecución en vez de fallar en silencio.

Para conectarlo: implementar `python.worker.ts` con la misma forma que
`javascript.worker.ts` (recibe `PeticionDeEjecucion`, responde
`ResultadoDeEjecucion`) y enrutarlo en `index.ts`. El presupuesto de tiempo
tiene que ser mayor que el de JS: la carga del runtime se cuenta dentro.
