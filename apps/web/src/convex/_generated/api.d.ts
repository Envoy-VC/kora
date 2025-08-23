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
import type * as functions_actions from "../functions/actions.js";
import type * as functions_helpers from "../functions/helpers.js";
import type * as functions_koraExecutor from "../functions/abi.js";
import type * as functions_strategy from "../functions/strategy.js";
import type * as functions_user from "../functions/user.js";
import type * as models_index from "../models/index.js";
import type * as types_index from "../types/index.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "functions/actions": typeof functions_actions;
  "functions/helpers": typeof functions_helpers;
  "functions/koraExecutor": typeof functions_koraExecutor;
  "functions/strategy": typeof functions_strategy;
  "functions/user": typeof functions_user;
  "models/index": typeof models_index;
  "types/index": typeof types_index;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
