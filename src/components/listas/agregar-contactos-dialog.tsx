"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Contact, Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import { useLeadActivo } from "@/lib/identidad";
import { useDebounced } from "@/lib/hooks";
import { contactosDelLead } from "@/lib/selectors";
import { filtrarOrdenar } from "@/lib/query";
import type { Lista } from "@/lib/types";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";

export function AgregarContactosDialog({
  open,
  onOpenChange,
  lista,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lista: Lista;
}) {
  const lead = useLeadActivo();
  const contactos = useStore((s) => s.contactos);
  const agregarContactosALista = useStore((s) => s.agregarContactosALista);

  const yaMiembros = useMemo(() => new Set(lista.contactoIds), [lista.contactoIds]);
  const candidatos = useMemo(
    () =>
      (lead ? contactosDelLead(contactos, lead.id) : []).filter((c) => !yaMiembros.has(c.id)),
    [contactos, lead, yaMiembros],
  );

  const [searchRaw, setSearchRaw] = useState("");
  const search = useDebounced(searchRaw, 200);
  const [seleccion, setSeleccion] = useState<Set<string>>(new Set());

  const resultado = useMemo(
    () =>
      filtrarOrdenar(candidatos, {
        search,
        getSearchText: (c) => `${c.nombre} ${c.email} ${c.empresa}`,
        sort: (a, b) => a.nombre.localeCompare(b.nombre),
      }),
    [candidatos, search],
  );

  const todosSeleccionados =
    resultado.length > 0 && resultado.every((c) => seleccion.has(c.id));

  const toggle = (id: string) => {
    setSeleccion((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleTodos = () => {
    setSeleccion((prev) => {
      if (resultado.every((c) => prev.has(c.id))) return new Set();
      return new Set(resultado.map((c) => c.id));
    });
  };

  const onConfirmar = () => {
    if (seleccion.size === 0) return;
    agregarContactosALista(lista.id, [...seleccion]);
    setSeleccion(new Set());
    setSearchRaw("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-xl">
      <DialogHeader>
        <DialogTitle>Agregar contactos a &quot;{lista.nombre}&quot;</DialogTitle>
        <DialogDescription>
          Selecciona contactos de tu agenda para sumarlos a esta lista.
        </DialogDescription>
      </DialogHeader>

      {candidatos.length === 0 ? (
        <EmptyState
          icon={Contact}
          title="No hay contactos para agregar"
          description="Todos tus contactos ya estan en esta lista, o aun no tienes contactos en tu agenda."
          action={
            <Link href="/lead/agenda">
              <Button variant="outline">
                <Plus /> Ir a la agenda
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchRaw}
              onChange={(e) => setSearchRaw(e.target.value)}
              placeholder="Buscar en la agenda..."
              className="pl-9"
            />
          </div>

          <div className="flex items-center justify-between border-b pb-2">
            <label className="inline-flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                className="size-4 rounded border-input"
                checked={todosSeleccionados}
                onChange={toggleTodos}
                disabled={resultado.length === 0}
              />
              Seleccionar todos
            </label>
            <span className="text-sm text-muted-foreground">{seleccion.size} seleccionados</span>
          </div>

          <div className="max-h-72 space-y-1 overflow-y-auto scrollbar-thin">
            {resultado.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Sin resultados para tu busqueda.
              </p>
            ) : (
              resultado.map((c) => {
                const checked = seleccion.has(c.id);
                return (
                  <label
                    key={c.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 transition-colors ${
                      checked ? "border-primary bg-primary/5" : "hover:bg-secondary/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="size-4 rounded border-input"
                      checked={checked}
                      onChange={() => toggle(c.id)}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{c.nombre}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.empresa ? `${c.empresa} · ` : ""}
                        {c.email}
                      </p>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        {candidatos.length > 0 ? (
          <Button type="button" onClick={onConfirmar} disabled={seleccion.size === 0}>
            Agregar {seleccion.size > 0 ? `${seleccion.size} ` : ""}
            {seleccion.size === 1 ? "contacto" : "contactos"}
          </Button>
        ) : null}
      </DialogFooter>
    </Dialog>
  );
}
