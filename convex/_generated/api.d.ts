/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai_evaluate from "../ai/evaluate.js";
import type * as ai_gemini from "../ai/gemini.js";
import type * as ai_generateChallenge from "../ai/generateChallenge.js";
import type * as alerts from "../alerts.js";
import type * as auth from "../auth.js";
import type * as challenges from "../challenges.js";
import type * as crons from "../crons.js";
import type * as events from "../events.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_progress from "../lib/progress.js";
import type * as notes from "../notes.js";
import type * as participants from "../participants.js";
import type * as reports from "../reports.js";
import type * as seed from "../seed.js";
import type * as sessions from "../sessions.js";
import type * as workspaces from "../workspaces.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "ai/evaluate": typeof ai_evaluate;
  "ai/gemini": typeof ai_gemini;
  "ai/generateChallenge": typeof ai_generateChallenge;
  alerts: typeof alerts;
  auth: typeof auth;
  challenges: typeof challenges;
  crons: typeof crons;
  events: typeof events;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/progress": typeof lib_progress;
  notes: typeof notes;
  participants: typeof participants;
  reports: typeof reports;
  seed: typeof seed;
  sessions: typeof sessions;
  workspaces: typeof workspaces;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
