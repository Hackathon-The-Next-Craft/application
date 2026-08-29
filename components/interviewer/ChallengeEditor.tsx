"use client";

import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";

type Test = Doc<"challenges">["tests"][number];
type Rubrica = Doc<"challenges">["rubric"][number];

// w-full y min-w-0 son necesarios: un <input> trae ancho intrínseco y
// min-width:auto, así que dentro de un grid no se encoge y empuja al resto
// fuera del contenedor.
const CAMPO =
  "w-full min-w-0 rounded-md border border-ink-200 px-3 py-2 text-body-sm text-ink-900 outline-none focus:border-iris-600";

const TEST_GRID = "sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto]";
const RUBRICA_GRID = "sm:grid-cols-[minmax(0,1fr)_88px_auto]";

function EncabezadoSeccion({
  title,
  note,
}: {
  title: string;
  note?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h4 className="font-display text-body font-semibold text-ink-900">{title}</h4>
      {note && <span className="tabular shrink-0 text-meta text-ink-500">{note}</span>}
    </div>
  );
}

function ItemChecklist({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        className={`mt-0.5 shrink-0 ${ok ? "text-advance-text" : "text-ink-300"}`}
        aria-hidden
      >
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
        {ok && (
          <path
            d="M5 8.2l2 2 4-4.4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
      <span className={`text-body-sm ${ok ? "text-ink-700" : "text-ink-500"}`}>{children}</span>
    </li>
  );
}

export function ChallengeEditor({ challenge }: { challenge: Doc<"challenges"> }) {
  const update = useMutation(api.challenges.update);
  const publish = useMutation(api.challenges.publish);

  const [abierto, setAbierto] = useState(!challenge.published);
  const [titulo, setTitulo] = useState(challenge.title);
  const [enunciado, setEnunciado] = useState(challenge.statement);
  const [language, setLanguage] = useState(challenge.language);
  const [starterCode, setStarterCode] = useState(challenge.starterCode);
  const [entryPoint, setEntryPoint] = useState(challenge.entryPoint);
  const [minutos, setMinutos] = useState(challenge.timeLimitMinutes);
  const [tests, setTests] = useState<Test[]>(challenge.tests);
  const [rubric, setRubric] = useState<Rubrica[]>(challenge.rubric);
  const [aspectos, setAspectos] = useState<string[]>(challenge.criticalAspects);
  const [guia, setGuia] = useState(challenge.interviewerGuide ?? "");
  const [solucion, setSolucion] = useState(challenge.referenceSolution ?? "");
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  function marcarSucio() {
    setGuardado(false);
  }

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
          entryPoint: entryPoint.trim(),
          timeLimitMinutes: minutos,
          tests,
          rubric,
          criticalAspects: aspectos,
          interviewerGuide: guia.trim() === "" ? undefined : guia,
          referenceSolution: solucion.trim() === "" ? undefined : solucion,
        },
      });
      setGuardado(true);
    } finally {
      setGuardando(false);
    }
  }

  function cambiarTest(indice: number, parcial: Partial<Test>) {
    setTests(tests.map((t, i) => (i === indice ? { ...t, ...parcial } : t)));
    marcarSucio();
  }

  function cambiarRubrica(indice: number, parcial: Partial<Rubrica>) {
    setRubric(rubric.map((r, i) => (i === indice ? { ...r, ...parcial } : r)));
    marcarSucio();
  }

  const publicos = tests.filter((t) => !t.hidden).length;
  const ocultos = tests.length - publicos;
  const pesoTotal = rubric.reduce((sum, r) => sum + r.weight, 0);
  const codigoMencionaFuncion =
    entryPoint.trim() !== "" && starterCode.includes(entryPoint.trim());

  return (
    <section className="rounded-2xl border border-ink-200 bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-200 p-4">
        <div className="min-w-0">
          <h3 className="truncate font-display text-subtitle text-ink-900">
            {challenge.title}
          </h3>
          <p className="tabular mt-0.5 text-meta text-ink-500">
            {challenge.language} · {challenge.tests.length} tests
            {challenge.generatedBy ? ` · ${challenge.generatedBy}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Chip tone={challenge.published ? "advance" : "neutral"}>
            {challenge.published ? "Publicado" : "Borrador"}
          </Chip>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              publish({ challengeId: challenge._id, published: !challenge.published })
            }
          >
            {challenge.published ? "Despublicar" : "Publicar"}
          </Button>
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
        <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          {/* Columna principal: todo lo que el candidato termina viendo. */}
          <div className="flex flex-col gap-6">
            <Field
              label="Título"
              value={titulo}
              onChange={(e) => {
                setTitulo(e.target.value);
                marcarSucio();
              }}
            />

            <div className="flex flex-col gap-2">
              <EncabezadoSeccion title="Enunciado" note="Lo que verá el candidato" />
              <textarea
                value={enunciado}
                onChange={(e) => {
                  setEnunciado(e.target.value);
                  marcarSucio();
                }}
                rows={5}
                className={CAMPO}
              />
            </div>

            <div className="flex flex-col gap-3">
              <EncabezadoSeccion
                title="Código inicial"
                note={`solution.${language === "python" ? "py" : "js"}`}
              />
              <div className="grid gap-3 sm:grid-cols-3">
                <Select
                  label="Lenguaje"
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value as Doc<"challenges">["language"]);
                    marcarSucio();
                  }}
                >
                  <option value="javascript">javascript</option>
                  {challenge.language === "python" && (
                    <option value="python">python (obsoleto)</option>
                  )}
                </Select>
                <Field
                  label="Minutos"
                  type="number"
                  min={5}
                  value={minutos}
                  onChange={(e) => {
                    setMinutos(Number(e.target.value));
                    marcarSucio();
                  }}
                />
                <Field
                  label="Función a evaluar"
                  value={entryPoint}
                  onChange={(e) => {
                    setEntryPoint(e.target.value);
                    marcarSucio();
                  }}
                  placeholder="productExceptSelf"
                  className="font-mono"
                />
              </div>
              <textarea
                value={starterCode}
                onChange={(e) => {
                  setStarterCode(e.target.value);
                  marcarSucio();
                }}
                rows={8}
                className={`${CAMPO} font-mono`}
              />
              {!codigoMencionaFuncion && entryPoint.trim() !== "" && (
                <p className="rounded-md border border-ink-200 border-l-[3px] border-l-stuck bg-white px-3 py-2 text-body-sm text-ink-900">
                  El código inicial no menciona <code>{entryPoint.trim()}</code>. Si
                  el nombre no coincide, ninguna ejecución del candidato encontrará
                  la función.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <EncabezadoSeccion
                title="Casos de prueba"
                note={`${publicos} públicos · ${ocultos} ocultos`}
              />
              <div
                className={`hidden gap-2 px-3 font-mono text-label uppercase text-ink-400 sm:grid ${TEST_GRID}`}
              >
                <span>Nombre</span>
                <span>Entrada</span>
                <span>Salida</span>
                <span>Visible</span>
              </div>
              <div className="flex flex-col gap-2">
                {tests.map((test, i) => (
                  <div key={i} className={`grid gap-2 rounded-lg border border-ink-200 p-3 ${TEST_GRID}`}>
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
                    <div className="flex shrink-0 items-center justify-end gap-3 sm:pl-1">
                      <button
                        type="button"
                        onClick={() => cambiarTest(i, { hidden: !test.hidden })}
                      >
                        <Chip tone={test.hidden ? "stuck" : "advance"}>
                          {test.hidden ? "Oculto" : "Público"}
                        </Chip>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTests(tests.filter((_, j) => j !== i));
                          marcarSucio();
                        }}
                        className="text-meta text-ink-500 underline underline-offset-4 hover:text-fail-text"
                      >
                        quitar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="self-start"
                onClick={() => {
                  setTests([...tests, { name: "", input: "", expected: "", hidden: false }]);
                  marcarSucio();
                }}
              >
                Añadir test
              </Button>
            </div>

            <div className="flex flex-col gap-3">
              <EncabezadoSeccion
                title="Rúbrica"
                note={
                  <span className={pesoTotal === 100 ? "text-advance-text" : "text-stuck-text"}>
                    {pesoTotal}%
                  </span>
                }
              />
              {rubric.length > 0 && (
                <div className={`hidden gap-2 px-3 font-mono text-label uppercase text-ink-400 sm:grid ${RUBRICA_GRID}`}>
                  <span>Criterio</span>
                  <span>Peso</span>
                  <span />
                </div>
              )}
              <div className="flex flex-col gap-2">
                {rubric.map((r, i) => (
                  <div key={i} className={`grid gap-2 rounded-lg border border-ink-200 p-3 ${RUBRICA_GRID}`}>
                    <input
                      value={r.criterion}
                      onChange={(e) => cambiarRubrica(i, { criterion: e.target.value })}
                      placeholder="Corrección de la solución"
                      className={CAMPO}
                    />
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={r.weight}
                        onChange={(e) => cambiarRubrica(i, { weight: Number(e.target.value) })}
                        className={CAMPO}
                      />
                      <span className="text-body-sm text-ink-500">%</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setRubric(rubric.filter((_, j) => j !== i));
                        marcarSucio();
                      }}
                      className="justify-self-end text-meta text-ink-500 underline underline-offset-4 hover:text-fail-text"
                    >
                      quitar
                    </button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="self-start"
                onClick={() => {
                  setRubric([...rubric, { criterion: "", weight: 0, observableSignals: [] }]);
                  marcarSucio();
                }}
              >
                Añadir criterio
              </Button>
            </div>

            <div className="flex flex-col gap-3">
              <EncabezadoSeccion title="Aspectos críticos" note={`${aspectos.length}`} />
              <div className="flex flex-col gap-2">
                {aspectos.map((aspecto, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="tabular w-5 shrink-0 text-body-sm text-ink-400">
                      {i + 1}
                    </span>
                    <input
                      value={aspecto}
                      onChange={(e) => {
                        setAspectos(aspectos.map((a, j) => (j === i ? e.target.value : a)));
                        marcarSucio();
                      }}
                      placeholder="Recorre el stream una sola vez."
                      className={CAMPO}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setAspectos(aspectos.filter((_, j) => j !== i));
                        marcarSucio();
                      }}
                      className="shrink-0 text-meta text-ink-500 underline underline-offset-4 hover:text-fail-text"
                    >
                      quitar
                    </button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="self-start"
                onClick={() => {
                  setAspectos([...aspectos, ""]);
                  marcarSucio();
                }}
              >
                Añadir aspecto
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              <EncabezadoSeccion
                title="Guía de ayuda"
                note={<Chip tone="neutral">No se publica</Chip>}
              />
              <p className="text-body-sm text-ink-500">
                Solo tú la ves. Nunca llega al candidato.
              </p>
              <textarea
                value={guia}
                onChange={(e) => {
                  setGuia(e.target.value);
                  marcarSucio();
                }}
                rows={4}
                placeholder="Qué preguntar si se atasca, y dónde termina la ayuda aceptable."
                className={CAMPO}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-ink-200 pt-4">
              <Button type="button" onClick={guardar} disabled={guardando}>
                {guardando ? "Guardando…" : "Guardar cambios"}
              </Button>
              {guardado && <span className="text-body-sm text-advance-text">Guardado.</span>}
              {challenge.published && (
                <span className="text-body-sm text-stuck-text">
                  Está publicado: lo que guardes lo ven los candidatos al instante.
                </span>
              )}
            </div>
          </div>

          {/* Columna lateral: lo que decide si esto ya se puede publicar, y lo
              que jamás llega al candidato. */}
          <aside className="flex flex-col gap-4">
            <div className="rounded-2xl border border-ink-200 bg-ink-25 p-4">
              <h4 className="font-display text-body font-semibold text-ink-900">
                Antes de publicar
              </h4>
              <ul className="mt-3 flex flex-col gap-2.5">
                <ItemChecklist ok={enunciado.trim() !== ""}>
                  El enunciado tiene contenido.
                </ItemChecklist>
                <ItemChecklist ok={codigoMencionaFuncion}>
                  El código inicial menciona la función a evaluar.
                </ItemChecklist>
                <ItemChecklist ok={rubric.length > 0 && pesoTotal === 100}>
                  Los pesos de la rúbrica suman 100%.
                </ItemChecklist>
                <ItemChecklist ok={aspectos.some((a) => a.trim() !== "")}>
                  Hay al menos un aspecto crítico.
                </ItemChecklist>
              </ul>

              <Button
                type="button"
                size="lg"
                variant={challenge.published ? "ghost" : "primary"}
                className="mt-4 w-full"
                onClick={() =>
                  publish({ challengeId: challenge._id, published: !challenge.published })
                }
              >
                {challenge.published ? "Despublicar" : "Publicar"}
              </Button>
              <p className="mt-2 text-caption text-ink-500">
                {challenge.published
                  ? "Publicado: los candidatos ya pueden verlo."
                  : "Aún no publicado: los candidatos no lo ven."}
              </p>
            </div>

            <div className="rounded-2xl border border-ink-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-display text-body font-semibold text-ink-900">
                  Solución de referencia
                </h4>
                <Chip tone="neutral">Privada</Chip>
              </div>
              <p className="mt-1.5 text-caption text-ink-500">
                Nunca se envía al candidato. Sirve para calibrar los tests.
              </p>
              <textarea
                value={solucion}
                onChange={(e) => {
                  setSolucion(e.target.value);
                  marcarSucio();
                }}
                rows={7}
                placeholder="def solution(...): ..."
                className={`${CAMPO} mt-3 font-mono`}
              />
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
