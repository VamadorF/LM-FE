"use client";

import { useRouter } from "next/navigation";
import { LogOut, Building2, UserRound } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

export function UserWidget({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const router = useRouter();
  const { user, role, logout } = useAuthStore();
  const qc = useQueryClient();

  const handleLogout = () => {
    logout();
    qc.clear();
    router.push("/auth/login");
  };

  if (!user) return null;

  const isCompany = role === "company";
  const displayName = isCompany
    ? (user.company?.tradeName ?? user.company?.legalName ?? user.email)
    : (user.leadManager?.fullName ?? user.email);
  const RoleIcon = isCompany ? Building2 : UserRound;
  const roleLabel = isCompany ? "Empresa" : "Lead Manager";
  const dark = variant === "dark";

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-lg border px-2.5 py-2",
        dark
          ? "border-sidebar-border bg-sidebar-accent/40 text-white"
          : "border-border bg-card text-foreground",
      )}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-md",
          dark ? "bg-primary/90 text-white" : "bg-primary text-primary-foreground",
        )}
      >
        <RoleIcon className="size-4" />
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        <span
          className={cn(
            "block text-[11px]",
            dark ? "text-white/60" : "text-muted-foreground",
          )}
        >
          {roleLabel}
        </span>
        <span className="block truncate text-sm font-medium">{displayName}</span>
      </span>
      <button
        onClick={handleLogout}
        title="Cerrar sesion"
        className={cn(
          "rounded-md p-1.5 transition-colors",
          dark
            ? "hover:bg-white/10 text-white/70 hover:text-white"
            : "hover:bg-secondary text-muted-foreground hover:text-foreground",
        )}
      >
        <LogOut className="size-4" />
      </button>
    </div>
  );
}
