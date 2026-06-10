"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface AuthCompany {
  id: string;
  legalName: string;
  tradeName?: string | null;
  taxId: string;
  industry: string;
  companySize: string;
  country: string;
  city: string;
  address?: string | null;
  contactName: string;
  contactPhone?: string | null;
  website?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  avgRating?: number;
  reviewCount?: number;
  subscription?: { status: string; trialEndsAt?: string | null; currentPeriodEnd?: string | null };
}

export interface AuthLeadManager {
  id: string;
  fullName: string;
  phone?: string | null;
  city: string;
  country: string;
  bio?: string | null;
  avatarUrl?: string | null;
  avgRating?: number;
  reviewCount?: number;
  contactCount?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  role: "company" | "lead_manager";
  company: AuthCompany | null;
  leadManager: AuthLeadManager | null;
}

/** Devuelve el profileId derivado del usuario */
export function getProfileId(user: AuthUser): string | null {
  return user.company?.id ?? user.leadManager?.id ?? null;
}

// ─── Store ───────────────────────────────────────────────────────────────────

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  role: "company" | "lead_manager" | null;

  setAuth: (token: string, user: AuthUser) => void;
  logout: () => void;
  updateUser: (partial: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      role: null,

      setAuth: (token, user) =>
        set({ token, user, isAuthenticated: true, role: user.role }),

      logout: () =>
        set({ token: null, user: null, isAuthenticated: false, role: null }),

      updateUser: (partial) =>
        set((s) =>
          s.user ? { user: { ...s.user, ...partial } } : {},
        ),
    }),
    {
      name: "lm-auth", // ⚠️ debe coincidir con PERSIST_KEY en axios.ts
      partialize: (s) => ({
        token: s.token,
        user: s.user,
        isAuthenticated: s.isAuthenticated,
        role: s.role,
      }),
    },
  ),
);
