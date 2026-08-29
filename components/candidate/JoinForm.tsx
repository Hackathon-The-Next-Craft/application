"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { saveToken } from "@/lib/candidateToken";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { CandidateHeader } from "./CandidateHeader";

function Aviso({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex flex-1 flex-col">
      <CandidateHeader />
      <main className="mx-auto flex w-full max-w-[560px] flex-1 items-center px-6">
        <div className="w-full rounded-2xl border border-ink-200 bg-white p-8">
          <h2 className="font-display text-subtitle text-ink-900">{title}</h2>
          <p className="mt-2 text-body-sm text-ink-500">{detail}</p>
        </div>
      </main>
    </div>
  );
}

export function JoinForm({
  code,
  onJoined,
}: {
  code: string;
  onJoined: (joinToken: string) => void;
}) {
  const info = useQuery(api.sessions.publicInfo, { joinCode: code });
  const join = useMutation(api.participants.join);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  // Los tres son condición de entrada. El servidor los exige; el candidato
  // tiene que saberlo antes de intentarlo, no después de que lo rechacen.
  const [acepta, setAcepta] = useState({
    audio: false,
    camera: false,
    transcript: false,
  });
  const aceptaTodo = acepta.audio && acepta.camera && acepta.transcript;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setError(null);
    setPending(true);
    try {
      const { joinToken } = await join({
        joinCode: code,
        displayName: String(formData.get("displayName")).trim(),
        consentAudio: acepta.audio,
        consentCamera: acepta.camera,
        consentTranscript: acepta.transcript,
      });
      // Si el guardado falla, el candidato pierde el acceso al recargar.
      if (!saveToken(code, joinToken)) {
        setError(
          "Entraste, pero el navegador no dejó guardar tu acceso. No cierres ni recargues esta pestaña.",
        );
      }
      onJoined(joinToken);
    } catch (caught) {
      // El servidor distingue "Enlace no válido" de "Sesión llena".
      setError(
        caught instanceof Error ? caught.message : "No se pudo entrar a la sesión.",
      );
      setPending(false);
    }
  }

  if (info === undefined) {
    return (
      <div className="flex flex-1 flex-col">
        <CandidateHeader />
        <main className="mx-auto w-full max-w-[840px] flex-1 px-6 py-12">
          <div className="h-72 animate-pulse rounded-2xl border border-ink-200 bg-white" />
        </main>
      </div>
    );
  }

  if (info === null) {
    return (
      <Aviso
        title="Este enlace no es válido"
        detail="Puede que el entrevistador lo haya revocado, o que la dirección esté mal escrita. Pídele un enlace nuevo."
      />
    );
  }

  // Antes se colaba a una sesión en borrador: el reto ni siquiera estaba
  // aprobado. Ahora el servidor lo impide y aquí se explica por qué.
  if (!info.abierta) {
    return info.terminada ? (
      <Aviso
        title="Esta sesión ya terminó"
        detail={`"${info.title}" está cerrada. Si crees que es un error, avísale a quien te entrevista.`}
      />
    ) : (
      <Aviso
        title="La sesión todavía no está abierta"
        detail={`Quien te entrevista aún está preparando "${info.title}". Deja esta página abierta: se actualiza sola en cuanto abran la sala de espera.`}
      />
    );
  }

  if (info.full) {
    return (
      <Aviso
        title="La sala está llena"
        detail={`"${info.title}" ya tiene todos los lugares ocupados. Avísale al entrevistador.`}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <CandidateHeader contexto={`Entrevista técnica · ${info.title}`} />

      <main className="mx-auto w-full max-w-[840px] flex-1 px-6 py-12">
        <h1 className="font-display text-display-sm text-ink-900">Antes de entrar</h1>
        <p className="mt-3 max-w-[62ch] text-body text-ink-500 text-pretty">
          Esta entrevista se realiza en vivo con una persona. Necesitamos tu
          nombre y tu permiso para capturar ciertas cosas durante la sesión.
        </p>
        <p className="tabular mt-4 font-mono text-meta text-ink-500">
          {info.role} · {info.durationMinutes} minutos
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          <section className="rounded-2xl border border-ink-200 bg-white p-6">
            <div className="max-w-[420px]">
              <Field
                label="¿Cómo te llamas?"
                name="displayName"
                required
                autoComplete="name"
                hint="Es el nombre que verá quien te entrevista. Los demás candidatos no te ven."
              />
            </div>
          </section>

          <fieldset className="rounded-2xl border border-ink-200 bg-white">
            <legend className="sr-only">Permisos</legend>

            <div className="border-b border-ink-200 px-6 py-5">
              <h2 className="font-display text-subtitle text-ink-900">
                Qué se captura durante la sesión
              </h2>
              <p className="mt-1 max-w-[62ch] text-body-sm text-ink-500">
                Estas son las condiciones de esta entrevista. Las tres son
                necesarias para que la prueba funcione, y hay que aceptarlas
                por separado.
              </p>
            </div>

            {/* Obligatorio: el servidor rechaza el ingreso sin esto. */}
            <label className="flex cursor-pointer items-start gap-3.5 border-b border-ink-200 bg-ink-25 px-6 py-5">
              <input
                type="checkbox"
                name="consentAudio"
                checked={acepta.audio}
                onChange={(e) =>
                  setAcepta((a) => ({ ...a, audio: e.target.checked }))
                }
                className="mt-0.5 h-5 w-5 shrink-0 accent-iris-600"
              />
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <span className="text-body font-semibold text-ink-900">
                    Audio en vivo
                  </span>
                  <span className="inline-flex h-[22px] items-center rounded-full bg-stuck-bg px-2 font-mono text-chip uppercase text-stuck-text">
                    Obligatorio
                  </span>
                </span>
                <span className="mt-1.5 block max-w-[62ch] text-body-sm text-ink-500">
                  Para poder hablar con quien te entrevista durante la prueba. Sin
                  esto no es posible entrar a la sesión.
                </span>
              </span>
            </label>


            <label className="flex cursor-pointer items-start gap-3.5 border-b border-ink-200 bg-ink-25 px-6 py-5">
              <input
                type="checkbox"
                name="consentCamera"
                checked={acepta.camera}
                onChange={(e) =>
                  setAcepta((a) => ({ ...a, camera: e.target.checked }))
                }
                className="mt-0.5 h-5 w-5 shrink-0 accent-iris-600"
              />
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <span className="text-body font-semibold text-ink-900">
                    Cámara
                  </span>
                  <span className="inline-flex h-[22px] items-center rounded-full bg-stuck-bg px-2 font-mono text-chip uppercase text-stuck-text">
                    Obligatorio
                  </span>
                </span>
                <span className="mt-1.5 block max-w-[62ch] text-body-sm text-ink-500">
                  Para que quien te entrevista te vea, como en cualquier
                  entrevista. <strong className="font-semibold text-ink-900">
                  Tu imagen no se analiza ni se graba</strong>: no se evalúa tu
                  rostro, tu expresión ni tu atención. Solo se transmite en vivo
                  mientras dura la sesión.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3.5 bg-ink-25 px-6 py-5">
              <input
                type="checkbox"
                name="consentTranscript"
                checked={acepta.transcript}
                onChange={(e) =>
                  setAcepta((a) => ({ ...a, transcript: e.target.checked }))
                }
                className="mt-0.5 h-5 w-5 shrink-0 accent-iris-600"
              />
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <span className="text-body font-semibold text-ink-900">
                    Transcripción de tu voz
                  </span>
                  <span className="inline-flex h-[22px] items-center rounded-full bg-stuck-bg px-2 font-mono text-chip uppercase text-stuck-text">
                    Obligatorio
                  </span>
                </span>
                <span className="mt-1.5 block max-w-[62ch] text-body-sm text-ink-500">
                  Convierte en texto lo que expliques, para que tu razonamiento
                  cuente como evidencia y no solo el código que alcanzaste a
                  escribir. Se procesa como contenido de lo que dices, nunca
                  como rasgo de tu voz.
                </span>
              </span>
            </label>
          </fieldset>

          <section className="grid gap-6 rounded-2xl border border-ink-200 bg-ink-25 p-6 sm:grid-cols-2">
            <div>
              <h3 className="font-mono text-label uppercase text-ink-500">
                Quién lo ve
              </h3>
              <p className="mt-2 text-body-sm text-ink-500">
                Quien te entrevista y las personas autorizadas del proceso de
                selección. Los demás candidatos no ven nada tuyo.
              </p>
            </div>
            <div>
              <h3 className="font-mono text-label uppercase text-ink-500">
                Para qué
              </h3>
              <p className="mt-2 text-body-sm text-ink-500">
                Evaluar esta prueba técnica. No hay decisiones automáticas:
                siempre decide una persona.
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-body-sm text-ink-500">
                Tu código y tus ejecuciones se registran de todas formas: son el
                objeto de la evaluación.
              </p>
            </div>
          </section>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-fail-bg bg-fail-bg px-4 py-3 text-body-sm text-fail-text"
            >
              {error}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 border-t border-ink-200 pt-6">
            <p className="flex-1 text-body-sm text-ink-500">
              {aceptaTodo
                ? "Todo listo. Entrarás a la sala de espera hasta que empiece la prueba."
                : "Hay que aceptar las tres condiciones para entrar a la sesión."}
            </p>
            <Button type="submit" size="lg" disabled={pending || !aceptaTodo}>
              {pending ? "Entrando…" : "Entrar a la sala de espera"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
