# Avance — LiveRoom AI

**Cómo usar este archivo:** cada quien edita **solo su sección**. Así git nunca
genera conflictos aquí. Marca la casilla cuando algo esté mergeado a `develop`,
no cuando esté "casi". Al final, la bitácora.

Última actualización: 2026-08-29

---

## 🎯 Criterio de "listo para demo"

El recorrido que tiene que funcionar de principio a fin. Si algo de esto falla,
es prioridad sobre cualquier otra cosa.

- [ ] El entrevistador se registra y crea una sesión
- [ ] Genera un reto con IA, lo edita y lo publica
- [ ] Dos o tres candidatos entran por el link y llegan al lobby
- [ ] El entrevistador inicia la sesión
- [ ] Los candidatos escriben código y ejecutan tests
- [ ] El entrevistador ve el código de los tres cambiar **en vivo**
- [ ] Un candidato se queda quieto → salta una alerta con razón legible
- [ ] Un candidato pide ayuda → aparece al instante en el panel
- [ ] Al cerrar, se genera un reporte con evidencia clickeable

---

## Salim — backend (`convex/`)

- [x] Schema completo con índices
- [x] Guards de autorización (`requireInterviewer`, `requireCandidate`)
- [x] Ciclo de vida de sesión (crear, publicar link, iniciar, pausar, cerrar)
- [x] Identidad de candidato por `joinToken`
- [x] Autosave, `recordRun`, `submit`
- [x] Eventos append-only + timeline
- [x] Clasificador de progreso + cron de alertas
- [x] Notas privadas y registro de ayudas
- [x] Wiring de reportes
- [x] Llaves de Convex Auth generadas
- [x] Generacion de retos y reportes con Gemini
- [ ] Seed de datos de prueba (3 candidatos falsos para no demostrar en vacío)
- [ ] Detección de "fallo de entorno" vs "atascado"
- [x] Disparar reportes automáticamente al cerrar la sesión
- [ ] Webhook de Vapi para el audio — **P2**

## Anjali — frontend (`app/`, `components/`, `lib/`)

Detalle en [frontend.md](frontend.md).

- [x] `feature/app-shell` — provider, proxy, login, dashboard
- [x] `feature/join-flow` — /join, consentimiento, lobby, preflight
- [x] `feature/live-mosaic` ⭐ — la pantalla del demo
- [x] `feature/candidate-room` — Monaco, autosave, runner en navegador (Python pendiente)
- [x] `feature/setup-and-report` — generar retos, ver reporte con evidencia

## Alejandro — audio (Vapi)

La IA de texto (retos y reportes) pasó a Salim; Alejandro se queda con la voz.
Es **P2**: no bloquea el demo.

- [ ] Cliente de Vapi en el navegador del candidato
- [ ] Definir qué eventos manda al webhook
- [ ] `convex/http.ts`: endpoint que recibe la transcripción — Salim
- [ ] Verificar `consent.transcript` antes de guardar nada
- [ ] (opcional) `lib/runner/` — ejecutar código en el navegador, hoy sin dueño

## Gael — diseño

- [ ] Tokens: color, tipografía, espaciado
- [ ] Estados del candidato en el mosaico (avanza / explorando / atascado / fallo)
- [ ] Tarjeta de candidato y panel de alertas
- [ ] Pantalla de reporte
- [ ] Integración en `components/ui/`

---

## Decisiones tomadas

No re-litigar sin una razón nueva.

| Decisión | Por qué |
|---|---|
| Un solo deployment de Convex, Salim lo publica | Cuatro bases separadas = nadie ve los datos de nadie |
| Candidatos sin cuenta, con `joinToken` | Registro en una entrevista es fricción absurda |
| Código se ejecuta en el navegador | Sandbox real no cabe en un hackathon; se dice en el pitch |
| Un solo reto por sesión, no dos | El PRD permite dos; uno alcanza para demostrar |
| Audio es P2, con Vapi | El diferenciador es el mosaico + la evidencia, no la llamada |
| Sin cámara, sin transcripción | Fuera de alcance y con riesgo de privacidad |

## Bitácora

Una línea por hito. Lo más reciente arriba.

- **2026-08-29** — Generación de retos y reportes con Gemini (`gemini-3.7-flash`),
  salida validada con Zod. La evidencia del reporte se cita por índice y se
  traduce a ids reales en el servidor, así el modelo no puede inventarla.
- **2026-08-29** — Anjali cierra `feature/app-shell`: login y dashboard.
- **2026-08-29** — Backend base desplegado en `descriptive-penguin-663`. Schema,
  autorización, sesiones, workspaces, eventos y alertas funcionando. Contrato de
  API documentado. Frontend aún sin conectar a Convex.
