import { Id } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";

/**
 * Clasificador operativo de progreso — PRD §7.3.
 * Reglas explícitas sobre eventos observables. NADA de inferencia psicológica.
 * Siempre devuelve una razón legible: es lo que el entrevistador ve en el panel
 * y lo que hace que las alertas se sientan justificadas en lugar de mágicas.
 */
export async function classify(ctx: MutationCtx, participantId: Id<"participants">) {
  const participant = await ctx.db.get(participantId);
  if (!participant) return;
  const session = await ctx.db.get(participant.sessionId);
  if (!session) return;

  const recent = await ctx.db
    .query("events")
    .withIndex("by_participant", (q) => q.eq("participantId", participantId))
    .order("desc")
    .take(25);

  const now = Date.now();
  const idleSec = (now - participant.lastActivityAt) / 1000;

  let state: typeof participant.progress = "exploring";
  let reason = "Editando sin ejecutar todavía";

  const runs = recent.filter((e) => e.type === "code.run");
  const tests = recent.filter((e) => e.type === "test.result");
  const lastTest = tests[0];
  const prevTest = tests[1];
  const submitted = recent.some((e) => e.type === "challenge.submitted");

  const passed = lastTest?.payload?.passed ?? 0;
  const total = lastTest?.payload?.total ?? 0;

  // Mismo stderr en tres ejecuciones seguidas: está peleando con lo mismo.
  const errs = runs.slice(0, 3).map((e) => String(e.payload?.stderr ?? "").slice(0, 120));
  const repeatedError = errs.length === 3 && errs[0] !== "" && errs.every((e) => e === errs[0]);

  if (submitted) {
    state = "finished";
    reason = "Envió su solución";
  } else if (total > 0 && passed === total) {
    state = "finished";
    reason = `Pasó los ${total} tests`;
  } else if (idleSec > session.stuckThresholdSec) {
    state = "stuck";
    reason = `Sin actividad hace ${Math.round(idleSec)}s`;
  } else if (repeatedError) {
    state = "stuck";
    reason = `Mismo error en 3 ejecuciones seguidas: ${errs[0]}`;
  } else if (lastTest && passed > (prevTest?.payload?.passed ?? -1)) {
    // Un test nuevo aprobado es la señal más clara de avance (PRD §7.3).
    state = "advancing";
    reason = prevTest
      ? `Pasó de ${prevTest.payload.passed}/${total} a ${passed}/${total} tests`
      : `Pasó ${passed}/${total} tests`;
  } else if (lastTest) {
    state = "exploring";
    reason = `Sigue en ${passed}/${total} tests desde el último intento`;
  } else if (runs.length > 0) {
    state = "exploring";
    reason = "Ejecutando sin pasar tests todavía";
  }

  // TODO(salim): distinguir env_failure — stderr de red o de runtime que no
  // depende de la solución del candidato. Es alerta de prioridad alta.

  if (state === participant.progress && reason === participant.progressReason) return;
  await ctx.db.patch(participantId, { progress: state, progressReason: reason });
  await ctx.db.insert("events", {
    sessionId: participant.sessionId, participantId,
    type: "state.changed", at: now, payload: { state, reason },
  });
}
