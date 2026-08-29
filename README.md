# LiveRoom AI

Entrevistas técnicas en vivo con evaluación asistida por IA.
Un entrevistador, hasta 3 candidatos, cada uno en un workspace aislado.

Stack: **Next.js 16 (App Router) + Convex + Tailwind + Monaco**.
Convex cubre base de datos, tiempo real y funciones de servidor — no hay WebSockets propios.

## Documentación

| Documento | Para qué |
|---|---|
| [docs/SETUP.md](docs/SETUP.md) | **Empieza aquí.** Clonar, variables de entorno, correr, reglas del equipo |
| [docs/PROGRESS.md](docs/PROGRESS.md) | Avance de cada quien, decisiones tomadas y bitácora |
| [docs/api-contract.md](docs/api-contract.md) | Qué función de Convex alimenta cada pantalla |
| [docs/frontend.md](docs/frontend.md) | Plan de trabajo del frontend, rama por rama |

## Arrancar

```bash
pnpm install   # y crea .env.local — ver docs/SETUP.md
pnpm dev
```

> **Solo Salim corre `npx convex dev`.** Ese comando publica el backend en el
> deployment compartido; si lo corre alguien más, sobrescribe las funciones con
> su copia local. Los demás solo necesitan las variables y `pnpm dev`.

## Estructura

| Ruta | Contenido | Dueño |
|---|---|---|
| `app/` | Rutas y pantallas | Anjali |
| `components/` | UI, editor, mosaico | Anjali + Gael |
| `lib/runner/` | Ejecución de código en el navegador (Pyodide / Web Worker) | Anjali |
| `convex/` | Schema, queries, mutations, actions, cron | Salim |
| `convex/ai/` | Generación de retos y evaluación | Alejandro |
| `docs/api-contract.md` | Qué función alimenta qué pantalla | Salim |

## Ramas

`main` (estable) ← `develop` (integración) ← `feature/*`, `fix/*`.
Nadie commitea directo a `main`. Ramas cortas, merge frecuente a `develop`.

## Decisiones que conviene no re-litigar

- Los candidatos **no tienen cuenta**: entran con un `joinToken` que viaja en cada
  llamada. El aislamiento se valida en el servidor, nunca escondiendo cosas en la UI.
- El autosave del editor va con **debounce de 400ms**, jamás una mutation por tecla.
- El código de los candidatos se ejecuta **en su navegador**, no en el servidor.
  En producción esto se movería a un sandbox tipo E2B/Judge0.
- Todo hallazgo de la IA enlaza evidencia real o se marca como baja confianza.
