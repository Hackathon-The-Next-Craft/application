# Contrato de API — LiveRoom AI

Dueño: **Salim**. Si Anjali necesita un dato que no está aquí, se agrega una fila
antes de escribir el componente. Nadie inventa firmas por su cuenta.

Convex tipa todo automáticamente: `useQuery(api.participants.listForSession, { sessionId })`
ya viene con el tipo correcto. Esta tabla es para saber **qué existe** y **qué pantalla lo usa**.

## Entrevistador (requiere sesión iniciada)

| Función | Tipo | Pantalla |
|---|---|---|
| `sessions.create` | mutation | dashboard → "Nueva sesión" |
| `sessions.listMine` | query | dashboard |
| `sessions.get` | query | todas las de `/s/[id]` |
| `sessions.setStatus` | mutation | live → iniciar / pausar / cerrar |
| `sessions.setLinkRevoked` | mutation | setup |
| `challenges.listForSession` | query | setup |
| `challenges.generate` | **action** | setup → botón "Generar con IA" |
| `challenges.update` | mutation | setup → editor del reto |
| `challenges.publish` | mutation | setup → "Publicar" |
| `participants.listForSession` | query | **live → el mosaico completo** (excluye retirados) |
| `participants.remove` | mutation | live → retirar a un participante |
| `workspaces.focus` | query | live → panel de foco |
| `alerts.listForSession` | query | live → feed de alertas |
| `alerts.acknowledge` | mutation | live |
| `notes.add` | mutation | live → notas privadas |
| `notes.logHelpGiven` | mutation | live → "registré una ayuda" |
| `notes.listForParticipant` | query | live / report |
| `events.timeline` | query | live / report |
| `reports.forParticipant` | query | report |
| `reports.evidence` | query | report → click en un hallazgo |
| `reports.generate` | **action** | report (o automático al cerrar) |
| `reports.setDecision` | mutation | report |

## Candidato (sin cuenta — `joinToken` en **todos** los argumentos)

| Función | Tipo | Pantalla |
|---|---|---|
| `sessions.publicInfo` | query | `/join/[code]` antes de entrar |
| `participants.join` | mutation | `/join/[code]` → devuelve el `joinToken`. Acepta `consentCamera` (opcional) |
| `participants.me` | query | lobby + room |
| `participants.setReady` | mutation | preflight de micrófono |
| `participants.requestHelp` | mutation | room → botón "pedir ayuda" |
| `workspaces.mine` | query | **room → retos + código propio** |
| `workspaces.ensure` | mutation | room → al abrir un reto |
| `workspaces.save` | mutation | room → autosave, **debounce 400ms** |
| `workspaces.recordRun` | mutation | room → después de ejecutar en el navegador |
| `workspaces.submit` | mutation | room → "Enviar" |

## Video (LiveKit) — convive con Vapi

LiveKit lleva **únicamente la cámara**. El micrófono es de Vapi. Esa frontera se
impone en el servidor: el token solo concede `canPublishSources: ["camera"]`, así
que aunque el cliente pidiera publicar audio, LiveKit lo rechaza. Sin eso los dos
SDKs capturarían el micro a la vez y habría eco.

| Función | Tipo | Quién |
|---|---|---|
| `media.candidateToken` | **action** | Candidato (`joinToken`). Publica cámara, **no se suscribe a nadie** |
| `media.interviewerToken` | **action** | Entrevistador. Se suscribe a todos, **no publica** |

El aislamiento de FR-03 vive en el token, no en la UI: el `canSubscribe: false`
del candidato hace imposible que vea a sus pares aunque manipule el cliente. La
identidad (`participant_<id>`) la firma el servidor.

Componentes de partida, pensados para rediseñarse:
`components/candidate/CameraPublisher.tsx` y
`components/interviewer/CameraStage.tsx` (exporta `CameraStage` y `CandidateVideo`).

La cámara **nunca bloquea la entrevista**: sin consentimiento o sin LiveKit
configurado, los componentes se apagan solos y todo lo demás sigue igual.

Configuración, una sola vez por deployment:

```
npx convex env set LIVEKIT_API_KEY <key>
npx convex env set LIVEKIT_API_SECRET <secret>
npx convex env set LIVEKIT_URL wss://<proyecto>.livekit.cloud
```

## Contrato de un reto con el ejecutor de código

`lib/runner` y `challenges` tienen que estar de acuerdo en esto. No es
deducible del código: si cambia, se rompe en silencio.

| Campo | Significado |
|---|---|
| `entryPoint` | Nombre exacto de la función que el runner invoca. **No se deduce del `starterCode` con una regex** — ese campo existe justamente para no tener que adivinarlo. |
| `language` | Hoy siempre `"javascript"`. `lib/runner` no ejecuta Python todavía; la generación tiene el idioma fijado para no producir retos que el candidato no pueda correr. |
| `tests[].input` | JSON del **único** argumento de la función. Ej. `"[3,1,2]"` |
| `tests[].expected` | JSON del valor de retorno esperado. Ej. `"[1,2,3]"` |
| `tests[].hidden` | Si es `true`, `workspaces.mine` no se lo envía al candidato |

La solución es siempre **una función con exactamente un argumento** que
devuelve un valor: nada de leer stdin ni imprimir. `starterCode` la exporta
con `module.exports`.

Para volver a habilitar Python: quitar el `z.literal("javascript")` de
`convex/ai/generateChallenge.ts` y ajustar el prompt. No hacerlo antes de que
el runner de Pyodide exista.

## Transiciones de sesión

`sessions.setStatus` valida el ciclo de vida del PRD §5.3 y rechaza saltos
ilegales. Una UI con el estado desactualizado recibe un error en vez de
cerrar una sesión sin querer.

```
draft  -> ready, closed
ready  -> live, closed
live   -> paused, closing
paused -> live, closing
closing-> closed
closed -> (nada)
```

## Reglas que no se negocian

1. El `joinToken` se guarda en `localStorage` bajo `liveroom:token:<joinCode>` y se
   manda en cada llamada de candidato. El servidor lo resuelve; **nunca** se confía
   en un `participantId` que venga del cliente.
2. Autosave con **debounce de 400ms**, jamás una mutation por tecla.
3. El código se ejecuta en el navegador (Pyodide / Web Worker) y el resultado se
   reporta con `workspaces.recordRun`. Convex nunca ejecuta código de candidato.
4. Todo estado de progreso viene con `progressReason` legible. La UI muestra la razón,
   no solo el color.
5. Los `actions` (`challenges.generate`, `reports.generate`) no son reactivos:
   se llaman con `useAction`, escriben en la DB, y la UI ve el resultado por `useQuery`.
