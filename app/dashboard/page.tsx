"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { useMemo, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { NewSessionForm } from "@/components/interviewer/NewSessionForm";
import { SESSION_ROW_GRID, SessionCard } from "@/components/interviewer/SessionCard";
import { AppHeader } from "@/components/ui/AppHeader";
import { Button } from "@/components/ui/Button";

type Status = Doc<"sessions">["status"];
type Filter = "all" | "draft" | "ready" | "live" | "closed";

// Los seis estados del ciclo de vida se agrupan en las cuatro pestañas que
// el entrevistador distingue de un vistazo.
const TABS: { id: Filter; label: string; match: (s: Status) => boolean }[] = [
  { id: "all", label: "Todas", match: () => true },
  { id: "draft", label: "Borrador", match: (s) => s === "draft" },
  { id: "ready", label: "Listas", match: (s) => s === "ready" },
  { id: "live", label: "En vivo", match: (s) => s === "live" || s === "paused" },
  { id: "closed", label: "Cerradas", match: (s) => s === "closed" || s === "closing" },
];

export default function DashboardPage() {
  const { isLoading: authLoading } = useConvexAuth();
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  // Reactivo: cuando `create` inserta, esta lista se actualiza sola.
  const sessions = useQuery(api.sessions.listMine);

  // `listMine` devuelve [] si el usuario aún no está autenticado en Convex.
  // Sin esta guarda se vería un "no tienes sesiones" falso durante el arranque.
  const loading = authLoading || sessions === undefined;

  const counts = useMemo(() => {
    const base = Object.fromEntries(TABS.map((tab) => [tab.id, 0])) as Record<Filter, number>;
    for (const session of sessions ?? []) {
      for (const tab of TABS) if (tab.match(session.status)) base[tab.id] += 1;
    }
    return base;
  }, [sessions]);

  const visible = useMemo(() => {
    const tab = TABS.find((t) => t.id === filter)!;
    const needle = search.trim().toLowerCase();
    return (sessions ?? [])
      .filter((session) => tab.match(session.status))
      .filter((session) =>
        needle === ""
          ? true
          : `${session.title} ${session.role} ${session.seniority} ${session.technologies.join(" ")}`
              .toLowerCase()
              .includes(needle),
      );
  }, [sessions, filter, search]);

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />

      <main className="mx-auto w-full max-w-[1080px] flex-1 px-8 py-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-title text-ink-900">Sesiones</h1>
            <p className="mt-1 text-body-sm text-ink-500">
              Una sesión reúne hasta tres candidatos, sus retos y sus informes.
            </p>
          </div>
          {!creating && (
            <Button type="button" size="lg" onClick={() => setCreating(true)}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
                <path d="M8 3v10M3 8h10" />
              </svg>
              Nueva sesión
            </Button>
          )}
        </div>

        {creating && (
          <div className="mt-6">
            <NewSessionForm onCancel={() => setCreating(false)} />
          </div>
        )}

        <div className="mt-8 flex items-center gap-1 border-b border-ink-200">
          {TABS.map((tab) => {
            const active = tab.id === filter;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                aria-current={active ? "page" : undefined}
                className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-body-sm transition-colors duration-[120ms] ${
                  active
                    ? "border-iris-600 font-semibold text-ink-900"
                    : "border-transparent text-ink-500 hover:text-ink-900"
                }`}
              >
                {tab.label}
                {!loading && (
                  <span className="tabular font-mono text-meta text-ink-400">
                    {counts[tab.id]}
                  </span>
                )}
              </button>
            );
          })}

          <div className="flex-1" />

          <label className="mb-2 flex h-9 w-[260px] items-center gap-2 rounded-md border border-ink-200 bg-white px-3">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="shrink-0 text-ink-400" aria-hidden>
              <circle cx="7" cy="7" r="4.5" />
              <path d="M10.5 10.5L14 14" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por rol o tecnología"
              aria-label="Buscar sesiones"
              className="w-full bg-transparent text-body-sm text-ink-900 outline-none placeholder:text-ink-400"
            />
          </label>
        </div>

        <div className="mt-6">
          {loading ? (
            <ul className="overflow-hidden rounded-2xl border border-ink-200 bg-white" aria-busy="true">
              {[0, 1, 2].map((i) => (
                <li key={i} className="h-[72px] animate-pulse border-b border-ink-200 bg-ink-25 last:border-b-0" />
              ))}
            </ul>
          ) : sessions.length === 0 ? (
            <EmptyState
              title="Todavía no tienes sesiones"
              body="Crea la primera y Multix te propondrá los retos, la rúbrica y los casos de prueba."
              action={
                <Button type="button" size="lg" onClick={() => setCreating(true)}>
                  Nueva sesión
                </Button>
              }
            />
          ) : visible.length === 0 ? (
            <EmptyState
              title="Nada que mostrar aquí"
              body="Ninguna sesión coincide con este filtro. Prueba con otra pestaña o limpia la búsqueda."
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
              <div
                className={`grid ${SESSION_ROW_GRID} items-center gap-x-4 border-b border-ink-200 bg-ink-25 px-5 py-2.5`}
                aria-hidden
              >
                <span className="font-mono text-label uppercase tracking-wide text-ink-400">
                  Sesión
                </span>
                <span className="justify-self-start font-mono text-label uppercase tracking-wide text-ink-400">
                  Estado
                </span>
                <span className="font-mono text-label uppercase tracking-wide text-ink-400">
                  Código
                </span>
                <span className="font-mono text-label uppercase tracking-wide text-ink-400">
                  Fecha
                </span>
                <span />
                <span />
                <span />
              </div>
              <ul>
                {visible.map((session) => (
                  <SessionCard key={session._id} session={session} />
                ))}
              </ul>
            </div>
          )}
        </div>

        <p className="mt-6 text-caption text-ink-400">
          Los informes de sesiones cerradas se conservan según la política de
          retención de tu organización.
        </p>
      </main>
    </div>
  );
}

function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink-300 bg-white px-8 py-16 text-center">
      <h2 className="font-display text-subtitle text-ink-900">{title}</h2>
      <p className="max-w-[46ch] text-body-sm text-ink-500">{body}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
