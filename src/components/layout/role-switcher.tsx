"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Building2, UserRound, ChevronsUpDown, Check } from "lucide-react";
import { useStore, useHydrated } from "@/lib/store";
import type { Rol } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";

const ROLES: { value: Rol; label: string; icon: typeof Building2; destino: string }[] = [
  { value: "empresa", label: "Empresa", icon: Building2, destino: "/empresa" },
  { value: "lead", label: "Lead (conector)", icon: UserRound, destino: "/lead" },
];

export function RoleSwitcher({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const hydrated = useHydrated();
  const router = useRouter();
  const pathname = usePathname();
  const identidad = useStore((s) => s.identidad);
  const empresas = useStore((s) => s.empresas);
  const leads = useStore((s) => s.leads);
  const setRol = useStore((s) => s.setRol);
  const setEmpresaActiva = useStore((s) => s.setEmpresaActiva);
  const setLeadActivo = useStore((s) => s.setLeadActivo);

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const empresa = empresas.find((e) => e.id === identidad.empresaId) ?? empresas[0];
  const lead = leads.find((l) => l.id === identidad.leadId) ?? leads[0];

  const vistaEmpresa = hydrated
    ? pathname.startsWith("/empresa") || identidad.rol === "empresa"
    : pathname.startsWith("/empresa");
  const rolActual = vistaEmpresa ? ROLES[0] : ROLES[1];
  const nombreActual = vistaEmpresa ? empresa?.nombre : lead?.nombre;

  const cambiarRol = (rol: Rol) => {
    setRol(rol);
    const destino = ROLES.find((r) => r.value === rol)?.destino ?? "/lead";
    router.push(destino);
    setOpen(false);
  };

  const dark = variant === "dark";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors",
          dark
            ? "border-sidebar-border bg-sidebar-accent/40 text-white hover:bg-sidebar-accent/60"
            : "border-border bg-card text-foreground hover:bg-secondary",
        )}
      >
        <span
          className={cn(
            "flex size-8 items-center justify-center rounded-md",
            dark ? "bg-primary/90 text-white" : "bg-primary text-primary-foreground",
          )}
        >
          <rolActual.icon className="size-4" />
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className={cn("block text-[11px]", dark ? "text-white/60" : "text-muted-foreground")}>
            {rolActual.label}
          </span>
          <span className="block truncate text-sm font-medium">
            {hydrated ? nombreActual : "..."}
          </span>
        </span>
        <ChevronsUpDown className={cn("size-4", dark ? "text-white/60" : "text-muted-foreground")} />
      </button>

      {open ? (
        <div
          className={cn(
            "absolute left-0 right-0 z-50 mt-2 rounded-xl border bg-card p-2 text-foreground shadow-xl",
            dark ? "max-w-[calc(100vw-2rem)] min-w-0" : "min-w-[260px]",
          )}
        >
          <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Ver como
          </p>
          <div className="grid grid-cols-2 gap-1">
            {ROLES.map((r) => (
              <button
                key={r.value}
                onClick={() => cambiarRol(r.value)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
                  (vistaEmpresa ? "empresa" : "lead") === r.value
                    ? "border-primary bg-accent text-accent-foreground"
                    : "border-transparent hover:bg-secondary",
                )}
              >
                <r.icon className="size-4" />
                {r.label.split(" ")[0]}
              </button>
            ))}
          </div>

          {vistaEmpresa ? (
            <div className="mt-2 max-h-64 overflow-y-auto scrollbar-thin border-t pt-2">
              {empresas.map((e) => (
                <button
                  key={e.id}
                  onClick={() => {
                    setEmpresaActiva(e.id);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-secondary"
                >
                  <Avatar name={e.nombre} className="size-7 text-[10px]" />
                  <span className="flex-1 truncate text-left">{e.nombre}</span>
                  {e.id === identidad.empresaId ? <Check className="size-4 text-primary" /> : null}
                </button>
              ))}
            </div>
          ) : null}

          {!vistaEmpresa ? (
            <div className="mt-2 max-h-64 overflow-y-auto scrollbar-thin border-t pt-2">
              {leads.slice(0, 12).map((l) => (
                <button
                  key={l.id}
                  onClick={() => {
                    setLeadActivo(l.id);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-secondary"
                >
                  <Avatar name={l.nombre} className="size-7 text-[10px]" />
                  <span className="flex-1 truncate text-left">{l.nombre}</span>
                  {l.id === identidad.leadId ? <Check className="size-4 text-primary" /> : null}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
