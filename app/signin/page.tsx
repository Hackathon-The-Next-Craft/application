"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Logo } from "@/components/ui/Logo";

type Flow = "signUp" | "signIn";

export default function SignInPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [flow, setFlow] = useState<Flow>("signUp");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Hay que capturar el FormData antes del await: después currentTarget es null.
    const formData = new FormData(event.currentTarget);
    formData.set("flow", flow);

    setError(null);
    setPending(true);
    try {
      await signIn("password", formData);
      router.push("/dashboard");
    } catch {
      // El backend no distingue causas por diseño (no filtra si el correo existe).
      setError(
        flow === "signUp"
          ? "No se pudo crear la cuenta. Puede que ese correo ya esté registrado, o que la contraseña tenga menos de 8 caracteres."
          : "Correo o contraseña incorrectos.",
      );
      setPending(false);
    }
  }

  return (
    <main className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_620px]">
      {/* Formulario */}
      <section className="flex flex-col justify-center border-ink-200 bg-white px-6 py-16 sm:px-16 lg:border-r lg:px-24">
        <div className="w-full max-w-[420px]">
          <Logo size={34} className="mb-12 text-ink-900" />

          <h1 className="font-display text-display-sm text-ink-900">
            Entra a tus entrevistas
          </h1>
          <p className="mt-2.5 max-w-[62ch] text-body text-ink-500 text-pretty">
            El acceso es solo para entrevistadores. Los candidatos entran con el
            enlace de la sesión, sin crear cuenta.
          </p>

          <form onSubmit={handleSubmit} className="mt-9 flex flex-col gap-4">
            <Field
              label="Correo de trabajo"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="tu@empresa.com"
            />

            <Field
              label="Contraseña"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete={flow === "signUp" ? "new-password" : "current-password"}
              hint={flow === "signUp" ? "Mínimo 8 caracteres." : undefined}
            />

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-fail-bg bg-fail-bg px-3 py-2.5 text-body-sm text-fail-text"
              >
                {error}
              </p>
            )}

            <Button type="submit" size="lg" disabled={pending} className="mt-1 w-full">
              {pending
                ? "Un momento…"
                : flow === "signUp"
                  ? "Crear cuenta"
                  : "Entrar"}
            </Button>
          </form>

          {/* Cambiar entre crear cuenta y entrar: es la única forma de llegar
              al flujo de inicio de sesión, así que no puede desaparecer. */}
          <p className="mt-6 text-body-sm text-ink-500">
            {flow === "signUp" ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
            <button
              type="button"
              onClick={() => {
                setFlow(flow === "signUp" ? "signIn" : "signUp");
                setError(null);
              }}
              className="font-semibold text-iris-600 underline underline-offset-4 hover:text-iris-700"
            >
              {flow === "signUp" ? "Entra" : "Créala"}
            </button>
          </p>
        </div>
      </section>

      {/* Panel lateral: qué es esto. Se retira cuando no hay ancho para él. */}
      <aside className="hidden flex-col justify-center bg-ink-25 px-16 lg:flex">
        <h2 className="max-w-[400px] font-display text-subtitle text-ink-900 text-pretty">
          Tres candidatos a la vez, cada uno en su propio entorno.
        </h2>
        <p className="mt-3 max-w-[400px] text-body-sm text-ink-500">
          Tú te concentras en el razonamiento. Multix registra el proceso, te
          avisa cuando alguien se atasca y reúne la evidencia del informe.
        </p>

        <div className="mt-9 grid max-w-[440px] grid-cols-3 gap-2.5" aria-hidden>
          <StateCard state="advance" label="Avanza" tests="3/5" lines={[90, 70, 80, 50]} />
          <StateCard state="stuck" label="Atascado" tests="1/5" lines={[75, 85, 60, 45]} highlight={2} />
          <StateCard state="explore" label="Explorando" tests="0/5" lines={[65, 55, 40, 30]} />
        </div>

        <p className="mt-8 max-w-[400px] text-caption text-ink-400">
          La IA reúne evidencia y sugiere; la decisión de contratación siempre es
          humana.
        </p>
      </aside>
    </main>
  );
}

/* Miniatura decorativa de un candidato en el mosaico. Las líneas de código
   simuladas siguen §6: alto 4 px, radio 2, gap 4. */
function StateCard({
  state,
  label,
  tests,
  lines,
  highlight,
}: {
  state: "advance" | "stuck" | "explore";
  label: string;
  tests: string;
  lines: number[];
  highlight?: number;
}) {
  const dot = {
    advance: "bg-advance",
    stuck: "bg-stuck",
    explore: "bg-explore",
  }[state];
  const text = {
    advance: "text-advance-text",
    stuck: "text-stuck-text",
    explore: "text-explore-text",
  }[state];

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-ink-200 bg-white p-3">
      <div className="flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        <span className={`font-mono text-chip uppercase ${text}`}>{label}</span>
      </div>
      <div className="flex flex-col gap-1">
        {lines.map((width, i) => (
          <span
            key={i}
            className={`h-1 rounded-xs ${i === highlight ? "bg-stuck-bg" : "bg-ink-50"}`}
            style={{ width: `${width}%` }}
          />
        ))}
      </div>
      <span className="tabular font-mono text-meta text-ink-500">{tests} tests</span>
    </div>
  );
}
