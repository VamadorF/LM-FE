"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, UserRound } from "lucide-react";
import { useHydrated } from "@/lib/store";
import { cn } from "@/lib/utils";

type VistaRol = "lead" | "empresa";

const OPCIONES: { value: VistaRol; label: string; icon: typeof UserRound; destino: string }[] = [
  { value: "lead", label: "Lead", icon: UserRound, destino: "/lead" },
  { value: "empresa", label: "Empresa", icon: Building2, destino: "/empresa" },
];

function rolDesdeRuta(pathname: string): VistaRol {
  return pathname.startsWith("/empresa") ? "empresa" : "lead";
}

export function DevRoleSwitch() {
  const hydrated = useHydrated();
  const pathname = usePathname();
  const rolActivo = rolDesdeRuta(pathname);

  return (
    <div className="flex items-center gap-2">
      <span className="hidden rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 sm:inline">
        Mock
      </span>
      <div
        className="inline-flex rounded-lg border bg-secondary/80 p-0.5"
        role="group"
        aria-label="Cambiar entre vista Lead y Empresa"
      >
        {OPCIONES.map((op) => {
          const activo = hydrated && rolActivo === op.value;
          const Icon = op.icon;
          return (
            <Link
              key={op.value}
              href={op.destino}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm",
                activo
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-current={activo ? "page" : undefined}
            >
              <Icon className="size-3.5 sm:size-4" />
              {op.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
