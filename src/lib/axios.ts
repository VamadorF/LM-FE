import axios from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ─── Pending token cache ────────────────────────────────────────────────────
// El token existe inmediatamente tras login/registro, pero Zustand persist
// aún no ha escrito en localStorage. Guardamos aquí temporalmente.
const PERSIST_KEY = "lm-auth"; // debe coincidir con auth-store.ts

let _pendingToken: string | null = null;

export function setPendingToken(token: string | null): void {
  _pendingToken = token;
}

function getToken(): string | null {
  if (_pendingToken) return _pendingToken;
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { token?: string | null } };
    return parsed.state?.token ?? null;
  } catch {
    return null;
  }
}

// ─── Request interceptor — adjunta JWT ──────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response interceptor — maneja 401 ──────────────────────────────────────
apiClient.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      _pendingToken = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem(PERSIST_KEY);
        if (!window.location.pathname.startsWith("/auth")) {
          window.location.href = "/auth/login?session=expired";
        }
      }
    }
    return Promise.reject(error);
  },
);
