"use client";

import { LayoutGrid, List, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ExplorerViewMode = "lista" | "iconos" | "detalles";

const VISTAS: { id: ExplorerViewMode; label: string; icon: typeof List }[] = [
  { id: "lista", label: "Lista", icon: List },
  { id: "iconos", label: "Elementos", icon: LayoutGrid },
  { id: "detalles", label: "Detalles", icon: Table2 },
];

export function ExplorerViewSwitcher({
  value,
  onChange,
  className,
}: {
  value: ExplorerViewMode;
  onChange: (mode: ExplorerViewMode) => void;
  className?: string;
}) {
  return (
    <div
      className={cn("inline-flex items-center rounded-md border bg-secondary/40 p-0.5", className)}
      role="group"
      aria-label="Tipo de vista"
    >
      {VISTAS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          title={label}
          onClick={() => onChange(id)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors",
            value === id
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-card/60 hover:text-foreground",
          )}
        >
          <Icon className="size-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
