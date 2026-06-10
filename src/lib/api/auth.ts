import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, setPendingToken } from "@/lib/axios";
import { useAuthStore, type AuthUser } from "@/lib/auth-store";

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterCompanyDto {
  email: string;
  password: string;
  legalName: string;
  tradeName?: string;
  taxId: string;
  industry: string;
  companySize: string;
  country: string;
  city: string;
  address?: string;
  contactName: string;
  contactPhone?: string;
  website?: string;
  description?: string;
  logoUrl?: string;
}

export interface RegisterLeadManagerDto {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  city: string;
  country: string;
  bio?: string;
}

export interface UpdateCompanyDto {
  legalName?: string;
  tradeName?: string;
  industry?: string;
  companySize?: string;
  country?: string;
  city?: string;
  address?: string;
  contactName?: string;
  contactPhone?: string;
  website?: string;
  description?: string;
  logoUrl?: string;
}

export interface UpdateLeadManagerDto {
  fullName?: string;
  phone?: string;
  city?: string;
  country?: string;
  bio?: string;
}

// ─── Helper ──────────────────────────────────────────────────────────────────

/**
 * POST /auth/login → GET /auth/me usando pendingToken pattern.
 * El token se cachea antes de que Zustand escriba en localStorage,
 * para que el interceptor de axios lo adjunte al GET /auth/me.
 */
async function loginAndFetchMe(
  email: string,
  password: string,
): Promise<{ token: string; user: AuthUser }> {
  const { data: loginData } = await apiClient.post<{
    accessToken: string;
    expiresIn: string;
  }>("/auth/login", { email, password });

  const { accessToken } = loginData;
  setPendingToken(accessToken);

  try {
    const { data: user } = await apiClient.get<AuthUser>("/auth/me");
    return { token: accessToken, user };
  } finally {
    setPendingToken(null);
  }
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useLogin() {
  const { setAuth } = useAuthStore();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (dto: LoginDto) => loginAndFetchMe(dto.email, dto.password),
    onSuccess: ({ token, user }) => {
      setAuth(token, user);
      qc.clear(); // limpiar cache de queries anteriores (importante en logout + re-login)
    },
  });
}

export function useRegisterCompany() {
  const { setAuth } = useAuthStore();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (dto: RegisterCompanyDto) => {
      await apiClient.post("/auth/register/company", dto);
      return loginAndFetchMe(dto.email, dto.password);
    },
    onSuccess: ({ token, user }) => {
      setAuth(token, user);
      qc.clear();
    },
  });
}

export function useRegisterLeadManager() {
  const { setAuth } = useAuthStore();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (dto: RegisterLeadManagerDto) => {
      await apiClient.post("/auth/register/lead-manager", dto);
      return loginAndFetchMe(dto.email, dto.password);
    },
    onSuccess: ({ token, user }) => {
      setAuth(token, user);
      qc.clear();
    },
  });
}

export function useMe(options?: { enabled?: boolean }) {
  const { isAuthenticated } = useAuthStore();
  return useQuery<AuthUser>({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await apiClient.get<AuthUser>("/auth/me");
      return data;
    },
    enabled: options?.enabled ?? isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateCompany() {
  const { setAuth } = useAuthStore();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateCompanyDto) =>
      apiClient.patch("/companies/me", dto).then((r) => r.data),
    onSuccess: async () => {
      // Refetch /auth/me para actualizar el store con datos frescos
      const { data: user } = await apiClient.get<AuthUser>("/auth/me");
      const { token } = useAuthStore.getState();
      if (token) setAuth(token, user);
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useUpdateLeadManager() {
  const { setAuth } = useAuthStore();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateLeadManagerDto) =>
      apiClient.patch("/lead-managers/me", dto).then((r) => r.data),
    onSuccess: async () => {
      const { data: user } = await apiClient.get<AuthUser>("/auth/me");
      const { token } = useAuthStore.getState();
      if (token) setAuth(token, user);
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
