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
| `participants.listForSession` | query | **live → el mosaico completo** |
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
| `participants.join` | mutation | `/join/[code]` → devuelve el `joinToken` |
| `participants.me` | query | lobby + room |
| `participants.setReady` | mutation | preflight de micrófono |
| `participants.requestHelp` | mutation | room → botón "pedir ayuda" |
| `workspaces.mine` | query | **room → retos + código propio** |
| `workspaces.ensure` | mutation | room → al abrir un reto |
| `workspaces.save` | mutation | room → autosave, **debounce 400ms** |
| `workspaces.recordRun` | mutation | room → después de ejecutar en el navegador |
| `workspaces.submit` | mutation | room → "Enviar" |

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
