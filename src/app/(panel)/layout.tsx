"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore, type AuthUser } from "@/lib/auth-store";
import { apiClient } from "@/lib/axios";
import { AppShell } from "@/components/layout/app-shell";

type Status = "checking" | "ok" | "redirecting";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { setAuth, logout } = useAuthStore();
  const [status, setStatus] = useState<Status>("checking");
  const didCheck = useRef(false);

  useEffect(() => {
    // Prevent double-run in React Strict Mode
    if (didCheck.current) return;
    didCheck.current = true;

    // Read token directly from Zustand store state (already hydrated at this point)
    const { token } = useAuthStore.getState();

    if (!token) {
      setStatus("redirecting");
      router.replace("/auth/login");
      return;
    }

    // Validate token against backend and refresh user data
    apiClient
      .get<AuthUser>("/auth/me")
      .then(({ data: user }) => {
        setAuth(token, user);
        setStatus("ok");
      })
      .catch(() => {
        logout();
        setStatus("redirecting");
        router.replace("/auth/login?session=expired");
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (status !== "ok") {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
