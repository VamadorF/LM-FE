"use client";

import { Check, User } from "lucide-react";
import type { Contacto } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { ExplorerViewMode } from "./explorer-view-switcher";

function rowClass(postulado: boolean, checked: boolean) {
  if (postulado) return "cursor-not-allowed opacity-60";
  if (checked) return "border-primary bg-primary/5";
  return "hover:border-border hover:bg-secondary/50";
}

export function ContactosPicker({
  contactos,
  seleccion,
  yaPostulados,
  onToggle,
  viewMode,
  emptyMessage = "Sin resultados para tu busqueda.",
}: {
  contactos: Contacto[];
  seleccion: Set<string>;
  yaPostulados: Set<string>;
  onToggle: (id: string) => void;
  viewMode: ExplorerViewMode;
  emptyMessage?: string;
}) {
  if (contactos.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">{emptyMessage}</p>
    );
  }

  if (viewMode === "detalles") {
    return (
      <div className="max-h-64 overflow-y-auto rounded-lg border scrollbar-thin">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Nombre</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefono</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contactos.map((c) => {
              const postulado = yaPostulados.has(c.id);
              const checked = seleccion.has(c.id);
              return (
                <TableRow
                  key={c.id}
                  className={cn(
                    "cursor-pointer",
                    checked && "bg-primary/5",
                    postulado && "opacity-60",
                  )}
                  onClick={() => !postulado && onToggle(c.id)}
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      className="size-4 rounded border-input"
                      checked={checked}
                      disabled={postulado}
                      onChange={() => onToggle(c.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-foreground">{c.nombre}</span>
                    {postulado ? (
                      <Badge className="ml-2 border-emerald-200 bg-emerald-100 text-[10px] text-emerald-700">
                        Postulado
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.empresa || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{c.email}</TableCell>
                  <TableCell className="text-muted-foreground">{c.telefono || "—"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (viewMode === "iconos") {
    return (
      <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto scrollbar-thin sm:grid-cols-3 md:grid-cols-4">
        {contactos.map((c) => {
          const postulado = yaPostulados.has(c.id);
          const checked = seleccion.has(c.id);
          return (
            <label
              key={c.id}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-3 text-center transition-colors",
                rowClass(postulado, checked),
              )}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                disabled={postulado}
                onChange={() => onToggle(c.id)}
              />
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-full",
                  checked ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground",
                )}
              >
                <User className="size-5" />
              </span>
              <div className="min-w-0 w-full">
                <p className="truncate text-xs font-medium text-foreground">{c.nombre}</p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {c.empresa || c.email}
                </p>
              </div>
              {postulado ? (
                <Badge className="border-emerald-200 bg-emerald-100 text-[10px] text-emerald-700">
                  <Check className="size-3" /> Postulado
                </Badge>
              ) : null}
            </label>
          );
        })}
      </div>
    );
  }

  // lista (default)
  return (
    <div className="max-h-64 space-y-1 overflow-y-auto scrollbar-thin">
      {contactos.map((c) => {
        const postulado = yaPostulados.has(c.id);
        const checked = seleccion.has(c.id);
        return (
          <label
            key={c.id}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 transition-colors",
              rowClass(postulado, checked),
            )}
          >
            <input
              type="checkbox"
              className="size-4 shrink-0 rounded border-input"
              checked={checked}
              disabled={postulado}
              onChange={() => onToggle(c.id)}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{c.nombre}</p>
              <p className="truncate text-xs text-muted-foreground">
                {c.empresa ? `${c.empresa} · ` : ""}
                {c.email}
              </p>
            </div>
            {postulado ? (
              <Badge className="shrink-0 border-emerald-200 bg-emerald-100 text-emerald-700">
                <Check className="size-3" /> Postulado
              </Badge>
            ) : null}
          </label>
        );
      })}
    </div>
  );
}
