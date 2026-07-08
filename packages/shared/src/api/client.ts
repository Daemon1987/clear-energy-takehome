import type { Order, PendingAction, TripStop } from '../types/api';

/**
 * One typed API client for all three apps.
 *
 * Handles the four failure modes the brief calls out:
 *  - success        -> parsed, typed JSON
 *  - network error  -> ApiError('network')
 *  - non-2xx        -> ApiError('http', status)
 *  - abort/unmount  -> ApiError('abort') — pass an AbortSignal (React Query
 *                      injects one per query, so in-flight requests are
 *                      cancelled when a screen unmounts)
 *
 * Idempotency: every non-GET request gets an `Idempotency-Key` header.
 * There are no writes in this slice, but the pattern is wired so Phase 2/3
 * writes (order placement, cash approvals) are safe to retry by default.
 */

export type ApiErrorKind = 'network' | 'http' | 'abort' | 'parse';

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }

  /** Human copy for error states — one place, consistent across apps. */
  get userMessage(): string {
    switch (this.kind) {
      case 'network':
        return 'Could not reach the server. Check your connection and retry.';
      case 'http':
        return `The server responded with an error (${this.status}). Please retry.`;
      case 'parse':
        return 'Received an unexpected response. Please retry.';
      case 'abort':
        return 'Request was cancelled.';
    }
  }
}

export interface ApiClientConfig {
  baseUrl?: string;
  /** Auth is out of scope — hardcoded user id sent as a header per the brief. */
  userId?: string;
  timeoutMs?: number;
}

interface RequestOptions {
  params?: Record<string, string | number | undefined>;
  body?: unknown;
  signal?: AbortSignal;
}

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } })
  .process?.env;

const DEFAULT_BASE_URL = env?.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

function newIdempotencyKey(): string {
  const g = globalThis as { crypto?: { randomUUID?: () => string } };
  if (g.crypto?.randomUUID) return g.crypto.randomUUID();
  return `idem-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createApiClient(config: ApiClientConfig = {}) {
  const baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, '');
  const timeoutMs = config.timeoutMs ?? 10_000;

  async function request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    { params, body, signal }: RequestOptions = {},
  ): Promise<T> {
    const query = params
      ? '?' +
        Object.entries(params)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
          .join('&')
      : '';

    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (config.userId) headers['X-User-Id'] = config.userId;
    if (method !== 'GET') {
      headers['Content-Type'] = 'application/json';
      headers['Idempotency-Key'] = newIdempotencyKey();
    }

    // Combine the caller's signal (unmount) with a timeout signal.
    const timeoutController = new AbortController();
    const timer = setTimeout(() => timeoutController.abort(), timeoutMs);
    const onCallerAbort = () => timeoutController.abort();
    signal?.addEventListener('abort', onCallerAbort);

    let res: Response;
    try {
      res = await fetch(`${baseUrl}${path}${query}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: timeoutController.signal,
      });
    } catch (err) {
      if (signal?.aborted) throw new ApiError('abort', 'Request aborted');
      if (timeoutController.signal.aborted)
        throw new ApiError('network', `Request timed out after ${timeoutMs}ms`);
      throw new ApiError('network', (err as Error).message);
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onCallerAbort);
    }

    if (!res.ok) {
      throw new ApiError('http', `HTTP ${res.status} on ${path}`, res.status);
    }

    try {
      return (await res.json()) as T;
    } catch {
      throw new ApiError('parse', `Invalid JSON from ${path}`);
    }
  }

  return {
    /** Customer App · "Today's Orders" */
    getOrders(customerId: string, opts?: { limit?: number; signal?: AbortSignal }) {
      return request<Order[]>('GET', '/orders', {
        params: { customerId, limit: opts?.limit },
        signal: opts?.signal,
      });
    },

    /** Driver App · "Today's Trip" */
    getTripStops(driverId: string, opts?: { signal?: AbortSignal }) {
      return request<TripStop[]>('GET', '/trips', {
        params: { driverId },
        signal: opts?.signal,
      });
    },

    /** Admin Mobile · "Pending Actions" */
    getPendingActions(adminId: string, opts?: { signal?: AbortSignal }) {
      return request<PendingAction[]>('GET', '/pending-actions', {
        params: { adminId },
        signal: opts?.signal,
      });
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
