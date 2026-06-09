"use client";

import { useMemo, useState } from "react";
import { Contact, Plus, Pencil, Trash2, Search } from "lucide-react";
import { useStore, useHydrated } from "@/lib/store";
import { useLeadActivo } from "@/lib/identidad";
import { useDebounced } from "@/lib/hooks";
import { contactosDelLead } from "@/lib/selectors";
import { filtrarOrdenar } from "@/lib/query";
import { formatRut } from "@/lib/format";
import type { Contacto } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ContactoForm } from "@/components/contactos/contacto-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AgendaListasTip } from "@/components/onboarding/agenda-listas-tip";

export default function LeadAgendaPage() {
  const hydrated = useHydrated();
  const lead = useLeadActivo();
  const contactos = useStore((s) => s.contactos);
  const eliminarContacto = useStore((s) => s.eliminarContacto);

  const misContactos = useMemo(
    () => (lead ? contactosDelLead(contactos, lead.id) : []),
    [contactos, lead],
  );

  const [searchRaw, setSearchRaw] = useState("");
  const search = useDebounced(searchRaw, 200);
  const [crear, setCrear] = useState(false);
  const [editando, setEditando] = useState<Contacto | null>(null);
  const [eliminando, setEliminando] = useState<Contacto | null>(null);

  const resultado = useMemo(
    () =>
      filtrarOrdenar(misContactos, {
        search,
        getSearchText: (c) => `${c.nombre} ${c.email} ${c.empresa} ${c.comuna}`,
        sort: (a, b) => a.nombre.localeCompare(b.nombre),
      }),
    [misContactos, search],
  );

  return (
    <>
      <PageHeader
        title="Agenda"
        description="Tu base maestra de contactos: crea cada persona una vez y reutilizala en tus listas"
      >
        <Button onClick={() => setCrear(true)}>
          <Plus /> Nuevo contacto
        </Button>
      </PageHeader>

      <AgendaListasTip />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchRaw}
          onChange={(e) => setSearchRaw(e.target.value)}
          placeholder="Buscar contacto..."
          className="pl-9"
        />
      </div>

      {!hydrated ? (
        <Skeleton className="h-72" />
      ) : misContactos.length === 0 ? (
        <EmptyState
          icon={Contact}
          title="Tu agenda esta vacia"
          description="Agrega contactos para poder organizarlos en listas y postularlos a las ofertas."
          action={
            <Button onClick={() => setCrear(true)}>
              <Plus /> Agregar contacto
            </Button>
          }
        />
      ) : resultado.length === 0 ? (
        <EmptyState icon={Search} title="Sin resultados" description="Ajusta tu busqueda." />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefono</TableHead>
                <TableHead>Comuna</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resultado.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <p className="font-medium text-foreground">{c.nombre}</p>
                    <p className="text-xs text-muted-foreground">{formatRut(c.rut)}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.empresa || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{c.email}</TableCell>
                  <TableCell className="text-muted-foreground">{c.telefono || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{c.comuna || "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8"
                        onClick={() => setEditando(c)}
                        aria-label="Editar contacto"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => setEliminando(c)}
                        aria-label="Eliminar contacto"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {crear ? <ContactoForm open={crear} onOpenChange={setCrear} /> : null}
      {editando ? (
        <ContactoForm
          open={Boolean(editando)}
          onOpenChange={(v) => !v && setEditando(null)}
          contacto={editando}
        />
      ) : null}
      {eliminando ? (
        <ConfirmDialog
          open={Boolean(eliminando)}
          onOpenChange={(v) => !v && setEliminando(null)}
          title="Eliminar contacto"
          description={`Se eliminara a "${eliminando.nombre}" de tu agenda y de todas tus listas. Esta accion no se puede deshacer.`}
          onConfirm={() => eliminarContacto(eliminando.id)}
        />
      ) : null}
    </>
  );
}
