"use client";

import { useEffect, useState } from "react";

const PASOS = [
  "Leyendo qué quieres evaluar",
  "Diseñando el enunciado y los casos borde",
  "Escribiendo los tests",
  "Redactando la rúbrica y la guía de entrevista",
];

const MS_POR_PASO = 2600;

/**
 * generateChallenge.run es una sola llamada a Gemini sin progreso real que
 * reportar (10-20 s). Sin esto el botón deshabilitado parece congelado; esta
 * lista avanza sola y se queda pulsando en el último paso si la IA tarda más
 * de lo previsto, para que se note que sigue trabajando.
 */
export function GeneratingProgress() {
  const [paso, setPaso] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setPaso((p) => Math.min(p + 1, PASOS.length - 1));
    }, MS_POR_PASO);
    return () => clearInterval(id);
  }, []);

  return (
    <ul className="flex flex-col gap-2">
      {PASOS.map((texto, i) => {
        const hecho = i < paso;
        const activo = i === paso;
        return (
          <li key={texto} className="flex items-center gap-2.5">
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
                hecho
                  ? "border-advance bg-advance"
                  : activo
                    ? "border-iris-600"
                    : "border-ink-300"
              }`}
            >
              {hecho ? (
                <svg
                  width="9"
                  height="9"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 8l3.5 3.5L13 5" />
                </svg>
              ) : activo ? (
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-iris-600" />
              ) : null}
            </span>
            <span
              className={`text-body-sm transition-colors duration-300 ${
                hecho ? "text-ink-500" : activo ? "font-medium text-ink-900" : "text-ink-400"
              }`}
            >
              {texto}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
