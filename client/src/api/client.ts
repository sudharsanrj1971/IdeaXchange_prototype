import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// The backend's CSRF cookie is only issued/read for the current request, so
// we don't need to persist this across reloads — just avoid refetching it
// on every single mutating call in the same page session.
let csrfTokenPromise: Promise<string> | null = null;

async function getCsrfToken(): Promise<string> {
  if (!csrfTokenPromise) {
    csrfTokenPromise = fetch(`${BASE_URL}/api/csrf-token`, {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch CSRF token');
        return res.json();
      })
      .then((body) => body.csrfToken as string)
      .catch((err) => {
        // Let the next call retry instead of caching a failure.
        csrfTokenPromise = null;
        throw err;
      });
  }
  return csrfTokenPromise;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  jwt: string | null,
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };

  // Every state-changing route is behind csrf-csrf's double-submit check:
  // it needs both the __Host- cookie (sent automatically via
  // credentials:'include') and this header carrying the matching token.
  if (!SAFE_METHODS.has(method)) {
    headers['x-csrf-token'] = await getCsrfToken();
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      message = body.error || message;
    } catch {
      // response wasn't JSON
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

/** Hook-based API client — automatically injects the current JWT. */
export function useApiClient() {
  const { jwt } = useAuth();

  const get = useCallback(
    <T>(path: string) => request<T>(path, { method: 'GET' }, jwt),
    [jwt],
  );

  const post = useCallback(
    <T>(path: string, body: unknown) =>
      request<T>(path, { method: 'POST', body: JSON.stringify(body) }, jwt),
    [jwt],
  );

  const put = useCallback(
    <T>(path: string, body: unknown) =>
      request<T>(path, { method: 'PUT', body: JSON.stringify(body) }, jwt),
    [jwt],
  );

  const patch = useCallback(
    <T>(path: string, body: unknown) =>
      request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }, jwt),
    [jwt],
  );

  const del = useCallback(
    <T>(path: string) => request<T>(path, { method: 'DELETE' }, jwt),
    [jwt],
  );

  return { get, post, put, patch, del };
}
