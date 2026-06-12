import { API_BASE_URL, API_TIMEOUT_MS } from "./config";
import type { ApiErrorBody } from "./types";

export type ApiRole = "company" | "lead";

export class ApiError extends Error {
  status: number;
  body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody) {
    const msg = Array.isArray(body.message)
      ? body.message.join(", ")
      : (body.message ?? body.error ?? `HTTP ${status}`);
    super(msg);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

interface StoredSession {
  company?: { token: string; profileId: string; email: string };
  lead?: { token: string; profileId: string; email: string };
  activeRole: ApiRole;
}

const SESSION_KEY = "leadmanager-api-session";

let memorySession: StoredSession | null = null;
let activeRole: ApiRole = "lead";

function readSession(): StoredSession | null {
  if (memorySession) return memorySession;
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    memorySession = JSON.parse(raw) as StoredSession;
    activeRole = memorySession?.activeRole ?? "lead";
    return memorySession;
  } catch {
    return null;
  }
}

function writeSession(session: StoredSession) {
  memorySession = session;
  activeRole = session.activeRole;
  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

export function getActiveApiRole(): ApiRole {
  readSession();
  return activeRole;
}

export function setActiveApiRole(role: ApiRole) {
  const session = readSession();
  if (!session) return;
  writeSession({ ...session, activeRole: role });
}

export function getApiToken(role?: ApiRole): string | null {
  const session = readSession();
  if (!session) return null;
  const r = role ?? session.activeRole;
  return r === "company" ? (session.company?.token ?? null) : (session.lead?.token ?? null);
}

export function getApiProfileId(role: ApiRole): string | null {
  const session = readSession();
  if (!session) return null;
  return role === "company"
    ? (session.company?.profileId ?? null)
    : (session.lead?.profileId ?? null);
}

export function saveApiSession(
  role: ApiRole,
  data: { token: string; profileId: string; email: string },
) {
  const current = readSession() ?? { activeRole: role };
  const next: StoredSession = {
    ...current,
    activeRole: current.activeRole ?? role,
    [role === "company" ? "company" : "lead"]: data,
  };
  writeSession(next);
}

export function clearApiSession() {
  memorySession = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function hasApiSession(): boolean {
  const session = readSession();
  return Boolean(session?.company?.token || session?.lead?.token);
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { role?: ApiRole; auth?: boolean } = {},
): Promise<T> {
  const { role, auth = true, ...init } = options;
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = getApiToken(role);
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
      signal: controller.signal,
    });

    if (res.status === 204) return undefined as T;

    const text = await res.text();
    const body = text ? (JSON.parse(text) as ApiErrorBody | T) : ({} as T);

    if (!res.ok) {
      throw new ApiError(res.status, body as ApiErrorBody);
    }

    return body as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("La API no respondio a tiempo (timeout).");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    await apiFetch<string>("/", { auth: false, method: "GET" });
    return true;
  } catch {
    return false;
  }
}
