# Frontend — plan de trabajo

Dueña: **Anjali**. Lee [SETUP.md](SETUP.md) primero, y ten
[api-contract.md](api-contract.md) abierto en otra pestaña.

## Estado actual del repo

Lo que ya existe:

- Next.js 16 (App Router) + Tailwind 4 + Monaco instalados
- `app/ConvexClientProvider.tsx` — escrito pero **sin usar**
- Backend completo y desplegado: sesiones, candidatos, workspaces, eventos, alertas

Lo que **no** existe todavía: absolutamente ninguna pantalla. `app/page.tsx` es
la landing de `create-next-app` y `app/layout.tsx` no está conectado a Convex.
Por eso la rama 1 es la rama 1.

> **No esperes a Gael.** Construye con Tailwind plano y jerarquía visual simple.
> Su diseño entra después reemplazando `components/ui/`. Si te bloqueas
> esperando mockups, perdemos el día.

---

## Rama 1 — `feature/app-shell`

Desbloquea todo lo demás. Hazla primero y mergéala rápido.

**1. Conectar Convex.** `app/layout.tsx` debe envolverse en
`<ConvexAuthNextjsServerProvider>` (de `@convex-dev/auth/nextjs/server`), y
dentro va el `<ConvexClientProvider>` que ya existe. También hay que crear
`middleware.ts` en la raíz con `convexAuthNextjsMiddleware`.

**2. Login del entrevistador.** Provider `Password` (email + contraseña), ya
configurado en el backend. Se usa con `useAuthActions()` de
`@convex-dev/auth/react` → `signIn("password", formData)`. No es OAuth, no hay
que configurar nada externo. Registro y login pueden ser el mismo formulario
con un toggle (`flow: "signUp"` / `"signIn"`).

**3. Dashboard.** `/dashboard`: lista con `api.sessions.listMine` y un botón que
llame `api.sessions.create` ({ title, role, seniority, technologies, durationMinutes }).
Al crear, navega a `/s/[id]/setup`.

**Listo cuando:** te registras, creas una sesión y la ves aparecer en la lista.

---

## Rama 2 — `feature/join-flow`

La entrada del candidato. No requiere login.

- `/join/[code]` → `api.sessions.publicInfo({ joinCode })`. Si devuelve `null`,
  el link es inválido o revocado. Si `full` es `true`, la sala está llena.
- Formulario: nombre + checkboxes de consentimiento (audio, transcripción) →
  `api.participants.join`.
- **Te devuelve un `joinToken`.** Guárdalo en
  `localStorage` bajo `liveroom:token:<code>`. Va como argumento en **todas** las
  llamadas de candidato — es su única identidad. Si se pierde, el candidato queda fuera.
- Lobby: `api.participants.me({ joinToken })` en polling reactivo. Prueba de
  micrófono (`navigator.mediaDevices.getUserMedia`) → `api.participants.setReady`.
- Cuando `session.status === "live"`, redirige a la sala.

---

## Rama 3 — `feature/live-mosaic` ⭐

**La pantalla del demo.** Dale el mayor tiempo de las tres.

`/s/[sessionId]/live`, alimentada por un solo
`useQuery(api.participants.listForSession, { sessionId })`.

Por cada candidato, una tarjeta con:

- Nombre y estado de conexión
- **`progressReason` como texto visible**, no solo un color. Es literalmente el
  punto del producto: el entrevistador debe leer *"Sin actividad hace 94s"* o
  *"Pasó 4/6 tests"*, no adivinar qué significa un semáforo amarillo. Usa color
  **además** del texto, nunca en lugar del texto.
- Tests pasados/totales del último run
- Preview del código en vivo (`currentCode`, Monaco en modo readonly o un `<pre>`)

Al lado, panel de alertas con `api.alerts.listForSession` — cada una trae `reason`
legible y un botón para enfocar a ese candidato.

Controles de sesión: `api.sessions.setStatus` para iniciar / pausar / cerrar.

**No pongas polling.** Convex ya empuja los cambios. Si escribes un `setInterval`,
algo entendiste mal.

---

## Rama 4 — `feature/candidate-room`

La sala del candidato. `/join/[code]/room`.

- `api.workspaces.mine({ joinToken })` → retos publicados + su código.
- Monaco con el código del workspace. **Autosave con debounce de 400ms** llamando
  `api.workspaces.save`. Jamás una mutation por tecla — tumbas el backend.
- Botón "Ejecutar": el código corre **en el navegador**, no en el servidor.
  Pyodide para Python, un Web Worker aislado para JS. Va en `lib/runner/`.
  El resultado se reporta con `api.workspaces.recordRun`.
- Botón "Pedir ayuda" → `api.participants.requestHelp` (aparece al instante en
  el panel del entrevistador — buen momento para lucirse en el demo).

---

## Rama 5 — `feature/setup-and-report`

- `/s/[id]/setup`: `api.challenges.generate` (es un `useAction`, tarda unos
  segundos), editar el reto con `api.challenges.update`, publicar con
  `api.challenges.publish`. Nada es visible para el candidato hasta publicar.
- `/s/[id]/report`: `api.reports.forParticipant`. El campo `status` va de
  `"generating"` a `"done"` — muéstralo, se ve como si "streameara".
  Cada hallazgo trae `evidenceEventIds`: al hacer click, resuélvelos con
  `api.reports.evidence` y muestra el evento real. Ese es el diferenciador del
  producto: la IA no afirma nada sin poder probarlo.

---

## Cosas que te van a morder

| Síntoma | Causa |
|---|---|
| `useQuery` devuelve `undefined` para siempre | Falta el provider en `layout.tsx`, o `.env.local` incompleto |
| "no autorizado" en pantallas de entrevistador | No estás logueada, o la sesión es de otro usuario |
| "Token de acceso inválido" | Perdiste el `joinToken` del localStorage |
| El candidato no ve los retos | No están publicados (`published: false`), o la sesión no está en `live` |
| Errores de TS en `convex/_generated` | `git pull origin develop` |
