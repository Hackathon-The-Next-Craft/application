# Arranque — LiveRoom AI

Para Anjali, Gael y Alejandro. Salim ya tiene esto corriendo.

## 1. Clonar e instalar

```bash
git clone https://github.com/Hackathon-The-Next-Craft/application.git
cd application
git checkout develop
pnpm install
```

## 2. Variables de entorno

Crea un archivo `.env.local` en la raíz del repo con estas dos líneas:

```
NEXT_PUBLIC_CONVEX_URL=https://descriptive-penguin-663.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://descriptive-penguin-663.convex.site
```

Eso es todo. **No necesitas cuenta de Convex.**

## 3. Correr

```bash
pnpm dev
```

Abre http://localhost:3000. Ya estás conectado al backend compartido: los datos
que crees los ven todos en tiempo real.

---

## La única regla que no se puede romper

> ### ⛔ No corras `npx convex dev`
>
> Ese comando **publica** el backend en el deployment compartido. Si lo corres,
> subes tu copia local de `convex/` y borras las funciones de Salim.
>
> Solo Salim lo corre. Tú solo necesitas `pnpm dev`.

Consecuencia práctica: **nadie edita `convex/` ni `convex/_generated/` a mano**,
excepto Salim (y Alejandro dentro de `convex/ai/`). Si necesitas un dato que el
backend no expone, pídeselo a Salim en vez de improvisar.

---

## Cómo funciona esto (lo mínimo que necesitas saber de Convex)

Convex es base de datos + servidor + tiempo real en una sola cosa. No hay REST,
no hay WebSockets, no hay `fetch`. Llamas funciones tipadas:

```tsx
"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const sesiones = useQuery(api.sessions.listMine);        // lee (reactivo)
const crear   = useMutation(api.sessions.create);        // escribe
```

Tres cosas que cambian cómo escribes el código:

1. **`useQuery` es reactivo.** Si alguien más modifica ese dato, tu componente
   se re-renderiza solo. No pongas `setInterval`, ni `refetch`, ni `router.refresh()`.
2. **Devuelve `undefined` mientras carga.** `if (data === undefined) return <Skeleton/>`.
   `null` significa "cargó y no hay nada" — son distintos.
3. **Los `action` no son reactivos** (llaman a la IA, tardan). Se usan con
   `useAction`, escriben en la base, y el resultado te llega por un `useQuery`.

Todo lo que existe está en [api-contract.md](api-contract.md).

## Ramas

`main` ← `develop` ← `feature/*`

```bash
git checkout develop && git pull
git checkout -b feature/lo-que-vas-a-hacer
```

Merge a `develop` **cada 2-3 horas**, no al final del día. Sin PRs formales:
avisa en Discord y mergea. Antes de mergear, `git pull origin develop` primero.

Registra lo que termines en [PROGRESS.md](PROGRESS.md).

## Quién hace qué

| Persona | Carpetas |
|---|---|
| Anjali | `app/`, `components/`, `lib/` — ver [frontend.md](frontend.md) |
| Salim | `convex/` (menos `convex/ai/`) |
| Alejandro | `convex/ai/` |
| Gael | Diseño → luego entra en `components/ui/` |

## Si algo falla

- **`api.algo` no existe / errores de TypeScript en `_generated`** → `git pull origin develop`.
  Salim regenera esos tipos cuando cambia el backend.
- **Datos que no llegan** → revisa que `.env.local` tenga las dos variables y reinicia `pnpm dev`.
- **Un error del servidor** → pídele a Salim el log; él ve todo en el dashboard de Convex.
