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

async function request<T>(
  path: string,
  options: RequestInit = {},
  jwt: string | null,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      ...(options.headers as Record<string, string> | undefined),
    },
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

  const del = useCallback(
    <T>(path: string) => request<T>(path, { method: 'DELETE' }, jwt),
    [jwt],
  );

  return { get, post, put, del };
}
