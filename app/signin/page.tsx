"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">LiveRoom AI</h1>
        <p className="mt-1 mb-6 text-sm text-zinc-500">
          {flow === "signUp"
            ? "Crea tu cuenta de entrevistador."
            : "Entra a tu cuenta de entrevistador."}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Correo</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Contraseña</span>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete={flow === "signUp" ? "new-password" : "current-password"}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
            />
            {flow === "signUp" && (
              <span className="text-xs text-zinc-500">Mínimo 8 caracteres.</span>
            )}
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {pending
              ? "Un momento…"
              : flow === "signUp"
                ? "Crear cuenta"
                : "Entrar"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setFlow(flow === "signUp" ? "signIn" : "signUp");
            setError(null);
          }}
          className="mt-4 w-full text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-900"
        >
          {flow === "signUp"
            ? "¿Ya tienes cuenta? Entra"
            : "¿No tienes cuenta? Créala"}
        </button>
      </div>
    </main>
  );
}
