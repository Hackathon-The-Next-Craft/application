"use client";

import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";

type Test = Doc<"challenges">["tests"][number];

const CAMPO =
  "rounded-md border border-ink-200 px-3 py-2 text-body-sm outline-none focus:border-iris-600";

export function ChallengeEditor({ challenge }: { challenge: Doc<"challenges"> }) {
  const update = useMutation(api.challenges.update);
  const publish = useMutation(api.challenges.publish);

  const [abierto, setAbierto] = useState(!challenge.published);
  const [titulo, setTitulo] = useState(challenge.title);
  const [enunciado, setEnunciado] = useState(challenge.statement);
  const [language, setLanguage] = useState(challenge.language);
  const [starterCode, setStarterCode] = useState(challenge.starterCode);
  const [minutos, setMinutos] = useState(challenge.timeLimitMinutes);
  const [tests, setTests] = useState<Test[]>(challenge.tests);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  async function guardar() {
    setGuardando(true);
    setGuardado(false);
    try {
      await update({
        challengeId: challenge._id,
        patch: {
          title: titulo,
          statement: enunciado,
          language,
          starterCode,
          timeLimitMinutes: minutos,
          tests,
        },
      });
      setGuardado(true);
    } finally {
      setGuardando(false);
    }
  }

  function cambiarTest(indice: number, parcial: Partial<Test>) {
    setTests(tests.map((t, i) => (i === indice ? { ...t, ...parcial } : t)));
    setGuardado(false);
  }

  return (
    <section className="rounded-2xl border border-ink-200 bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-200 p-4">
        <div className="min-w-0">
          <h3 className="truncate font-medium">{challenge.title}</h3>
          <p className="mt-0.5 text-meta text-ink-500">
            {challenge.language} · {challenge.tests.length} tests
            {challenge.generatedBy ? ` · ${challenge.generatedBy}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-meta font-medium ${
              challenge.published
                ? "bg-advance-bg text-advance-text"
                : "bg-ink-100 text-ink-700"
            }`}
          >
            {challenge.published ? "Publicado" : "Borrador"}
          </span>
          <button
            type="button"
            onClick={() =>
              publish({ challengeId: challenge._id, published: !challenge.published })
            }
            className="rounded-md border border-ink-200 px-3 py-1.5 text-body-sm font-medium hover:bg-iris-50"
          >
            {challenge.published ? "Despublicar" : "Publicar"}
          </button>
          <button
            type="button"
            onClick={() => setAbierto(!abierto)}
            className="text-body-sm text-ink-500 underline underline-offset-4 hover:text-iris-600"
          >
            {abierto ? "Cerrar" : "Editar"}
          </button>
        </div>
      </header>

      {abierto && (
        <div className="flex flex-col gap-4 p-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-body-sm font-medium">Título</span>
            <input
              value={titulo}
              onChange={(e) => {
                setTitulo(e.target.value);
                setGuardado(false);
              }}
              className={CAMPO}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-body-sm font-medium">Enunciado (markdown)</span>
            <textarea
              value={enunciado}
              onChange={(e) => {
                setEnunciado(e.target.value);
                setGuardado(false);
              }}
              rows={6}
              className={`${CAMPO} font-mono`}
            />
          </label>

          <div className="flex flex-wrap gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-body-sm font-medium">Lenguaje</span>
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value as Doc<"challenges">["language"]);
                  setGuardado(false);
                }}
                className={CAMPO}
              >
                <option value="javascript">javascript</option>
                <option value="python">python</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-body-sm font-medium">Minutos</span>
              <input
                type="number"
                min={5}
                value={minutos}
                onChange={(e) => {
                  setMinutos(Number(e.target.value));
                  setGuardado(false);
                }}
                className={`${CAMPO} w-24`}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-body-sm font-medium">Código inicial</span>
            <textarea
              value={starterCode}
              onChange={(e) => {
                setStarterCode(e.target.value);
                setGuardado(false);
              }}
              rows={8}
              className={`${CAMPO} font-mono`}
            />
            <span className="text-meta text-ink-500">
              De aquí sale el nombre de la función que ejecutan los tests.
            </span>
          </label>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-body-sm font-medium">Tests</span>
              <button
                type="button"
                onClick={() => {
                  setTests([
                    ...tests,
                    { name: "", input: "", expected: "", hidden: false },
                  ]);
                  setGuardado(false);
                }}
                className="rounded-md border border-ink-200 px-2.5 py-1 text-meta font-medium hover:bg-iris-50"
              >
                Añadir test
              </button>
            </div>
            <p className="text-meta text-ink-500">
              El input es el JSON del único argumento; expected, el JSON del
              retorno esperado, o el literal throws.
            </p>

            {tests.map((test, i) => (
              <div
                key={i}
                className="grid gap-2 rounded-md border border-ink-200 p-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
              >
                <input
                  value={test.name}
                  onChange={(e) => cambiarTest(i, { name: e.target.value })}
                  placeholder="nombre"
                  className={CAMPO}
                />
                <input
                  value={test.input}
                  onChange={(e) => cambiarTest(i, { input: e.target.value })}
                  placeholder="input (JSON)"
                  className={`${CAMPO} font-mono`}
                />
                <input
                  value={test.expected}
                  onChange={(e) => cambiarTest(i, { expected: e.target.value })}
                  placeholder="expected (JSON)"
                  className={`${CAMPO} font-mono`}
                />
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 text-meta">
                    <input
                      type="checkbox"
                      checked={test.hidden}
                      onChange={(e) => cambiarTest(i, { hidden: e.target.checked })}
                    />
                    oculto
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setTests(tests.filter((_, j) => j !== i));
                      setGuardado(false);
                    }}
                    className="text-meta text-ink-500 underline underline-offset-4 hover:text-fail-text"
                  >
                    quitar
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={guardar}
              disabled={guardando}
              className="rounded-md bg-iris-600 px-4 py-2 text-body-sm font-medium text-white hover:bg-iris-700 disabled:opacity-50"
            >
              {guardando ? "Guardando…" : "Guardar cambios"}
            </button>
            {guardado && <span className="text-body-sm text-advance-text">Guardado.</span>}
            {challenge.published && (
              <span className="text-body-sm text-stuck-text">
                Está publicado: lo que guardes lo ven los candidatos al instante.
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
