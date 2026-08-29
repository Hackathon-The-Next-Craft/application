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
  const lastTest = recent.find((e) => e.type === "test.result");
  const submitted = recent.some((e) => e.type === "challenge.submitted");

  if (submitted) {
    state = "finished";
    reason = "Envió su solución";
  } else if (lastTest && lastTest.payload?.passed === lastTest.payload?.total && lastTest.payload?.total > 0) {
    state = "advancing";
    reason = `Pasó ${lastTest.payload.passed}/${lastTest.payload.total} tests`;
  } else if (idleSec > session.stuckThresholdSec) {
    state = "stuck";
    reason = `Sin actividad hace ${Math.round(idleSec)}s`;
  } else {
    // TODO(salim): mismo stderr 3 veces seguidas -> "stuck" / "env_failure"
    const errs = runs.slice(0, 3).map((e) => String(e.payload?.stderr ?? "").slice(0, 120));
    if (errs.length === 3 && errs[0] && errs.every((e) => e === errs[0])) {
      state = "stuck";
      reason = "Mismo error en 3 ejecuciones seguidas";
    }
  }

  if (state === participant.progress && reason === participant.progressReason) return;
  await ctx.db.patch(participantId, { progress: state, progressReason: reason });
  await ctx.db.insert("events", {
    sessionId: participant.sessionId, participantId,
    type: "state.changed", at: now, payload: { state, reason },
  });
}
