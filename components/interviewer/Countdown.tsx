"use client";

import { useEffect, useState } from "react";

/** Cuenta regresiva del panel en vivo, a partir de session.endsAt. */
export function Countdown({ endsAt }: { endsAt: number | undefined }) {
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (endsAt === undefined) return null;

  const restanteMs = Math.max(0, endsAt - ahora);
  const totalSeg = Math.floor(restanteMs / 1000);
  const minutos = Math.floor(totalSeg / 60);
  const segundos = totalSeg % 60;
  const agotado = restanteMs === 0;

  return (
    <div className="text-right leading-none">
      <p className={`tabular font-mono text-title ${agotado ? "text-fail-text" : "text-ink-900"}`}>
        {minutos}:{String(segundos).padStart(2, "0")}
      </p>
      <p className="mt-0.5 font-mono text-label uppercase text-ink-400">
        {agotado ? "Tiempo agotado" : "Restantes"}
      </p>
    </div>
  );
}
