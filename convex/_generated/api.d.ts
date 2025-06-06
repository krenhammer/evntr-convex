/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as auth_guards from "../auth_guards.js";
import type * as featureFlags from "../featureFlags.js";
import type * as http from "../http.js";
import type * as rbac from "../rbac.js";
import type * as router from "../router.js";
import type * as stt from "../stt.js";
import type * as users from "../users.js";
import type * as waitlist from "../waitlist.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  auth_guards: typeof auth_guards;
  featureFlags: typeof featureFlags;
  http: typeof http;
  rbac: typeof rbac;
  router: typeof router;
  stt: typeof stt;
  users: typeof users;
  waitlist: typeof waitlist;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
