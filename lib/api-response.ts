import { NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { ZodError } from "zod";

/**
 * Standard API response format (SPECIFICATION.md §7.2)
 *   Success: { data: ... }                                  200 / 201
 *   Error:   { error: { code, message, fields? } }          400 / 401 / 403 / 404 / 409 / 500
 */

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_ERROR"
  | "DATABASE_UNAVAILABLE";

/** Field name → first error message, ready to show next to a form input. */
export type FieldErrors = Record<string, string>;

export type ApiSuccess<T> = { data: T };
export type ApiErrorBody = { error: { code: ErrorCode; message: string; fields?: FieldErrors } };
export type ApiResponse<T> = ApiSuccess<T> | ApiErrorBody;

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
  DATABASE_UNAVAILABLE: 503,
};

/** Throw this anywhere in a Route Handler; handleApiError() turns it into the right response. */
export class ApiError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly fields?: FieldErrors;

  constructor(code: ErrorCode, message: string, fields?: FieldErrors) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = STATUS_BY_CODE[code];
    this.fields = fields;
  }
}

// ---------- Success ----------

export function ok<T>(data: T, status = 200) {
  return NextResponse.json<ApiSuccess<T>>({ data }, { status });
}

export function created<T>(data: T) {
  return ok(data, 201);
}

// ---------- Errors ----------

export function apiError(code: ErrorCode, message: string, fields?: FieldErrors) {
  const body: ApiErrorBody = { error: fields ? { code, message, fields } : { code, message } };
  return NextResponse.json(body, { status: STATUS_BY_CODE[code] });
}

export const badRequest = (message = "Invalid request", fields?: FieldErrors) =>
  apiError("VALIDATION_ERROR", message, fields);
export const unauthorized = (message = "You must be signed in") => apiError("UNAUTHORIZED", message);
export const forbidden = (message = "You are not allowed to do this") => apiError("FORBIDDEN", message);
export const notFound = (message = "Not found") => apiError("NOT_FOUND", message);
export const conflict = (message = "Conflict", fields?: FieldErrors) =>
  apiError("CONFLICT", message, fields);
export const serverError = (message = "Something went wrong") => apiError("INTERNAL_ERROR", message);

/** Converts Zod issues to { "field.path": "first message" }. */
export function zodFieldErrors(error: ZodError): FieldErrors {
  const fields: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.length ? issue.path.join(".") : "_form";
    fields[key] ??= issue.message;
  }
  return fields;
}

/**
 * Use in every Route Handler's catch block:
 *   try { ... } catch (e) { return handleApiError(e); }
 */
export function handleApiError(error: unknown) {
  // Let Next.js internal control-flow errors through (prerender bail-out,
  // redirect(), notFound(), ...). Swallowing them breaks dynamic rendering.
  unstable_rethrow(error);

  if (error instanceof ApiError) return apiError(error.code, error.message, error.fields);
  if (error instanceof ZodError) return badRequest("Validation failed", zodFieldErrors(error));
  if (error instanceof SyntaxError) return badRequest("Request body must be valid JSON");

  console.error("[API] Unhandled error:", error);
  return serverError();
}
