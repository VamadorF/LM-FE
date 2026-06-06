"use client";

import { Contact, Folder } from "lucide-react";
import type { Lista } from "@/lib/types";
import { formatNumber } from "@/lib/format";
import { FolderItem } from "./folder-item";

export function FolderGrid({
  totalAgenda,
  listas,
  conteoPorLista,
  onOpenAgenda,
  onOpenLista,
  selectedListaId,
  compact = false,
}: {
  totalAgenda: number;
  listas: Lista[];
  conteoPorLista: Map<string, number>;
  onOpenAgenda: () => void;
  onOpenLista: (listaId: string) => void;
  selectedListaId?: string | null;
  compact?: boolean;
}) {
  const grid = (
    <div
      className={
        compact
          ? "flex gap-1"
          : "grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5"
      }
    >
        <FolderItem
          icon={Contact}
          label="Agenda"
          subtitle={compact ? undefined : `${formatNumber(totalAgenda)} contactos`}
          selected={selectedListaId === null}
          onOpen={onOpenAgenda}
          className={compact ? "min-w-[5.5rem] p-2" : undefined}
        />
        {listas.map((lista) => (
          <FolderItem
            key={lista.id}
            icon={Folder}
            label={lista.nombre}
            subtitle={
              compact ? undefined : `${formatNumber(conteoPorLista.get(lista.id) ?? 0)} contactos`
            }
            selected={selectedListaId === lista.id}
            onOpen={() => onOpenLista(lista.id)}
            className={compact ? "min-w-[5.5rem] p-2" : undefined}
          />
        ))}
    </div>
  );

  if (compact) return grid;

  return (
    <div className="rounded-lg border bg-card/50 p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Carpetas
      </p>
      {grid}
    </div>
  );
}
