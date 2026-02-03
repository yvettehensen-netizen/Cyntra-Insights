// src/aurelius/types/aureliusResponse.ts

/* ============================================================================
   ERROR CODES — CANONICAL & GOVERNED
============================================================================ */

/**
 * Canonical Aurelius error codes.
 * ⚠️ These codes are part of the public engine contract.
 * NEVER reuse codes with different semantics.
 */
export enum AureliusErrorCode {
  ValidationFailed = "VALIDATION_FAILED",
  InputInvalid = "INPUT_INVALID",

  RoutingFailed = "ROUTING_FAILED",
  ConsultantFailed = "CONSULTANT_FAILED",
  NormalizationFailed = "NORMALIZATION_FAILED",

  EngineTimeout = "ENGINE_TIMEOUT",
  EngineUnavailable = "ENGINE_UNAVAILABLE",

  InternalError = "INTERNAL_ERROR",
  UnknownError = "UNKNOWN_ERROR",
}

/* ============================================================================
   META & OBSERVABILITY
============================================================================ */

/**
 * Shared observability metadata.
 * Designed for:
 * - tracing
 * - audit logs
 * - QA review
 * - enterprise customers
 */
export interface AureliusMeta {
  /** Unique request identifier (stable across retries). */
  readonly request_id?: string;

  /** Engine version / build hash. */
  readonly engine_version?: string;

  /** Total processing duration (ms). */
  readonly duration_ms?: number;

  /** ISO 8601 timestamp when response was produced. */
  readonly timestamp?: string;

  /** Distributed trace identifier (OpenTelemetry / Jaeger). */
  readonly trace_id?: string;

  /** Non-fatal warnings or system notices. */
  readonly warnings?: readonly string[];

  /** Debug or diagnostic logs (redacted in production). */
  readonly logs?: readonly string[];

  /**
   * Extension point for future metadata.
   * ⚠️ Never rely on untyped fields without guards.
   */
  readonly [key: string]: unknown;
}

/* ============================================================================
   SUCCESS RESPONSE
============================================================================ */

/**
 * Successful Aurelius engine response.
 *
 * ⚠️ IMPORTANT:
 * - `data` is ALWAYS unknown at this layer
 * - Rendering, exporting, or persisting requires normalization
 */
export interface AureliusSuccessResponse {
  readonly success: true;

  /**
   * Raw engine output.
   * May contain:
   * - partial data
   * - hallucinated structures
   * - consultant-specific artifacts
   *
   * MUST be normalized before use.
   */
  readonly data: unknown;

  /** Observability metadata (recommended in production). */
  readonly meta?: AureliusMeta;
}

/* ============================================================================
   ERROR RESPONSE
============================================================================ */

/**
 * Error response from Aurelius engine.
 * Structured to allow diagnostics WITHOUT leaking internals.
 */
export interface AureliusErrorResponse {
  readonly success: false;

  readonly error: {
    /** Human-readable message (safe for UI). */
    readonly message: string;

    /** Canonical error code (machine-readable). */
    readonly code: AureliusErrorCode | string;

    /**
     * Optional structured details.
     * Example:
     * - validation error map
     * - failed consultant IDs
     */
    readonly details?: unknown;

    /**
     * Optional context object.
     * Example:
     * { step: "routing", consultant: "finance" }
     */
    readonly context?: Record<string, unknown>;

    /**
     * Optional stack trace.
     * ⚠️ Should be stripped in production environments.
     */
    readonly stack?: string;

    /** Extension point for future error fields. */
    readonly [key: string]: unknown;
  };

  /**
   * Limited metadata for error tracing.
   * Full logs belong in observability infrastructure.
   */
  readonly meta?: Pick<
    AureliusMeta,
    "request_id" | "timestamp" | "trace_id"
  >;
}

/* ============================================================================
   UNIFIED RESPONSE TYPE
============================================================================ */

/**
 * Canonical Aurelius engine response.
 *
 * 🔐 GOVERNANCE GUARANTEES:
 * - Engine NEVER returns typed business data
 * - Consumers MUST normalize explicitly
 * - Errors are structured, sanitized, and traceable
 */
export type AureliusResponse =
  | AureliusSuccessResponse
  | AureliusErrorResponse;

/* ============================================================================
   TYPED VARIANT (POST-NORMALIZATION ONLY)
============================================================================ */

/**
 * Typed Aurelius response.
 * Use ONLY after successful normalization.
 *
 * @example
 * const response = await runEngine();
 *
 * if (response.success) {
 *   const normalized = normalize(response.data);
 *   const typed: TypedAureliusResponse<MyResult> = {
 *     ...response,
 *     data: normalized,
 *   };
 * }
 */
export type TypedAureliusResponse<T> =
  | (Omit<AureliusSuccessResponse, "data"> & {
      readonly data: T;
    })
  | AureliusErrorResponse;
