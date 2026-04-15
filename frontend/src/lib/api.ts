const BASE_URL = "/api";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const csrfToken = getCookie("csrftoken");

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (csrfToken) {
    headers["X-CSRFToken"] = csrfToken;
  }

  if (options.body && typeof options.body === "string") {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    cache: "no-store",
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 204) {
    return undefined as T;
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, error);
  }

  return res.json();
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public data: Record<string, unknown>
  ) {
    super(
      typeof data?.detail === "string"
        ? data.detail
        : JSON.stringify(data)
    );
    this.name = "ApiError";
  }
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path);
}

export function apiPost<T>(
  path: string,
  body?: Record<string, unknown>
): Promise<T> {
  return request<T>(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function apiPatch<T>(
  path: string,
  body: Record<string, unknown>
): Promise<T> {
  return request<T>(path, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function apiDelete(path: string): Promise<void> {
  return request<void>(path, { method: "DELETE" });
}
