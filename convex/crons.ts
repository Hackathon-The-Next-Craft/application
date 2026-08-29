import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Detección de inactividad: nadie escribe, así que ningún evento la dispara.
// El cron es el único que puede notarla. PRD FR-13.
crons.interval("detectar bloqueos", { seconds: 20 }, internal.alerts.sweepStuck, {});

export default crons;
