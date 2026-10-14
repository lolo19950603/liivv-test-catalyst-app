import 'server-only';

import { randomUUID } from 'node:crypto';

import { getGraphToken, GraphAuthError } from './graph-auth';
import { logPharmacyMail } from './log';

/*
 * =============================================================================
 * MICROSOFT GRAPH REQUESTS (fetch only, no SDK)
 * =============================================================================
 *   - Authorization: Bearer, and Prefer: IdType="ImmutableId" on EVERY call
 *     (ids then survive moves between folders, so a draft can be found again in
 *     Sent Items); extra Prefer values are added comma-separated.
 *   - a client-request-id per call, logged with Graph's request-id for support.
 *   - a 10-second timeout per attempt.
 *   - 429, 503 and 504 are retried, honouring Retry-After: in a staff action at
 *     most 2 retries and 10 s of waiting in all; in the sync, 4 and 30 s.
 *   - 400, 403, 404 and 409 are never retried. A 401 gets a fresh token, once.
 *   - errors are a GraphError with the HTTP status and Graph's error.code only:
 *     Microsoft says to code against error.code, and the message text is never
 *     shown or logged.
 *   - Prefer: outlook.allow-unsafe-html is never sent.
 *   - an absolute URL (a stored nextLink or deltaLink) must be on
 *     graph.microsoft.com, so a stored link can't send the token elsewhere.
 * =============================================================================
 */

const GRAPH_ROOT = 'https://graph.microsoft.com/v1.0';
const RETRYABLE = new Set([429, 503, 504]);
const BUDGETS = {
  action: { retries: 2, waitMs: 10_000 },
  sync: { retries: 4, waitMs: 30_000 },
} as const;

export class GraphError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId: string | null;

  constructor(status: number, code: string, requestId: string | null = null) {
    super(`Microsoft Graph request failed (${status} ${code}).`);
    this.name = 'GraphError';
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

export interface GraphRequest {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  /** '/users/{id}/messages' or an absolute https://graph.microsoft.com/… link. */
  path: string;
  json?: unknown;
  /** Extra Prefer values, e.g. 'outlook.body-content-type="text"'. */
  prefer?: readonly string[];
  /** Staff actions wait less than the sync. */
  budget?: keyof typeof BUDGETS;
  /** Extra headers (ConsistencyLevel and the like). */
  headers?: Readonly<Record<string, string>>;
}

export interface GraphResponse<T> {
  status: number;
  data: T | null;
  requestId: string | null;
}

export function graphUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    const url = new URL(path);

    if (url.protocol !== 'https:' || url.hostname !== 'graph.microsoft.com') {
      throw new GraphError(0, 'untrusted_link');
    }

    return url.toString();
  }

  return `${GRAPH_ROOT}${path.startsWith('/') ? '' : '/'}${path}`;
}

function preferHeader(extra: readonly string[] | undefined): string {
  return ['IdType="ImmutableId"', ...(extra ?? [])]
    .filter((value) => !/allow-unsafe-html/i.test(value))
    .join(', ');
}

/* How long to wait before retrying this response, in ms. */
function retryDelayMs(response: Response, attempt: number): number {
  const header = Number(response.headers.get('retry-after'));

  if (Number.isFinite(header) && header >= 0) {
    return Math.min(header, 60) * 1000;
  }

  return Math.min(2 ** attempt * 1000, 8000);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function graphErrorOf(response: Response, requestId: string | null): Promise<GraphError> {
  const body: unknown = await response.json().catch(() => null);
  const error =
    typeof body === 'object' && body !== null && 'error' in body ? body.error : null;
  const code =
    typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string'
      ? error.code
      : `http_${response.status}`;

  return new GraphError(response.status, code, requestId);
}

async function readBody<T>(response: Response): Promise<T | null> {
  if (response.status === 202 || response.status === 204) {
    return null;
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(text);

    return isGraphObject<T>(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/*
 * Graph answers with JSON objects. The callers type every field they read as
 * unknown (or check it) before use, so an object is all this promises.
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- the caller names the shape it reads
function isGraphObject<T>(value: unknown): value is T {
  return typeof value === 'object' && value !== null;
}

async function send(
  request: GraphRequest,
  token: string,
  clientRequestId: string,
): Promise<Response> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Prefer: preferHeader(request.prefer),
    'client-request-id': clientRequestId,
    Accept: 'application/json',
    ...request.headers,
  };

  if (request.json !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    return await fetch(graphUrl(request.path), {
      method: request.method ?? 'GET',
      headers,
      body: request.json === undefined ? undefined : JSON.stringify(request.json),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    if (error instanceof GraphError) {
      throw error;
    }

    throw new GraphError(
      0,
      error instanceof Error && error.name === 'TimeoutError' ? 'timeout' : 'network',
    );
  }
}

interface AttemptState {
  attempt: number;
  waitedMs: number;
  /** A fresh token was already fetched after a 401. */
  refreshed: boolean;
  /** Fetch a fresh token for this attempt. */
  forceRefresh: boolean;
}

/* Whether to try again after this response, and how long to wait first (null: don't). */
function nextAttemptDelay(
  response: Response,
  state: AttemptState,
  budget: (typeof BUDGETS)[keyof typeof BUDGETS],
): number | null {
  if (response.status === 401 && !state.refreshed) {
    return 0;
  }

  if (!RETRYABLE.has(response.status) || state.attempt >= budget.retries) {
    return null;
  }

  const delay = retryDelayMs(response, state.attempt);

  return state.waitedMs + delay <= budget.waitMs ? delay : null;
}

/*
 * One Graph call with the retry policy above. Throws GraphError (or
 * GraphAuthError for a sign-in failure); never throws a message from Graph.
 */
export async function graphRequest<T>(request: GraphRequest): Promise<GraphResponse<T>> {
  return attemptRequest<T>(request, randomUUID(), {
    attempt: 0,
    waitedMs: 0,
    refreshed: false,
    forceRefresh: false,
  });
}

/* One attempt; on a retryable answer it waits and calls itself with the next state. */
async function attemptRequest<T>(
  request: GraphRequest,
  clientRequestId: string,
  state: AttemptState,
): Promise<GraphResponse<T>> {
  const budget = BUDGETS[request.budget ?? 'action'];
  const token = await getGraphToken({ forceRefresh: state.forceRefresh });
  const response = await send(request, token, clientRequestId);
  const requestId = response.headers.get('request-id');

  if (response.ok) {
    return { status: response.status, data: await readBody<T>(response), requestId };
  }

  const delay = nextAttemptDelay(response, state, budget);

  if (delay === null) {
    const error = await graphErrorOf(response, requestId);

    logPharmacyMail(
      'graph_error',
      { status: error.status, code: error.code, requestId: error.requestId },
      'warn',
    );

    throw error;
  }

  await response.body?.cancel();

  if (response.status === 401) {
    return attemptRequest<T>(request, clientRequestId, {
      ...state,
      refreshed: true,
      forceRefresh: true,
    });
  }

  await sleep(delay);

  return attemptRequest<T>(request, clientRequestId, {
    attempt: state.attempt + 1,
    waitedMs: state.waitedMs + delay,
    refreshed: state.refreshed,
    forceRefresh: false,
  });
}

/*
 * "/users/{mailbox}": the Entra object id when IT gave it (Microsoft advises ids
 * over addresses: "Mailbox info is stale"), otherwise the SMTP address.
 */
export function mailboxPath(mailbox: { address: string; objectId: string | null }): string {
  return `/users/${encodeURIComponent(mailbox.objectId ?? mailbox.address)}`;
}

/* A code for any error from Graph, its sign-in, or our own checks: never a message. */
export function graphErrorCode(error: unknown): string {
  if (error instanceof GraphError || error instanceof GraphAuthError) {
    return error.code;
  }

  return 'unexpected';
}

export function graphErrorStatus(error: unknown): number | null {
  return error instanceof GraphError ? error.status : null;
}
