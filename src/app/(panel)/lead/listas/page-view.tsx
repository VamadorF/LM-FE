"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ListChecks, Plus, Pencil, Trash2, Folder } from "lucide-react";
import { useStore, useHydrated } from "@/lib/store";
import { useLeadActivo } from "@/lib/identidad";
import { listasDelLead, conteoContactosPorLista } from "@/lib/selectors";
import { formatNumber } from "@/lib/format";
import type { Lista } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CardsSkeleton } from "@/components/ui/skeleton";
import { ListaForm } from "@/components/listas/lista-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FolderItem } from "@/components/contactos/folder-item";
import { AgendaListasTip } from "@/components/onboarding/agenda-listas-tip";

export default function LeadListasPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const lead = useLeadActivo();
  const listas = useStore((s) => s.listas);
  const eliminarLista = useStore((s) => s.eliminarLista);

  const misListas = useMemo(
    () => (lead ? listasDelLead(listas, lead.id) : []),
    [listas, lead],
  );
  const conteo = useMemo(() => conteoContactosPorLista(listas), [listas]);

  const [crear, setCrear] = useState(false);
  const [editando, setEditando] = useState<Lista | null>(null);
  const [eliminando, setEliminando] = useState<Lista | null>(null);

  return (
    <>
      <PageHeader
        title="Listas"
        description="Tus carpetas de contactos: agrupa personas de la agenda para postularlas juntas"
      >
        <Button onClick={() => setCrear(true)}>
          <Plus /> Nueva carpeta
        </Button>
      </PageHeader>

      <AgendaListasTip />

      {!hydrated ? (
        <CardsSkeleton />
      ) : misListas.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="Aun no tienes carpetas"
          description="Crea una lista (carpeta) y agrega contactos desde tu agenda para postularlos en bloque."
          action={
            <Button onClick={() => setCrear(true)}>
              <Plus /> Crear carpeta
            </Button>
          }
        />
      ) : (
        <div className="rounded-xl border bg-card/50 p-6">
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {misListas.length} carpetas
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {misListas.map((lista) => (
              <div
                key={lista.id}
                className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm"
              >
                <FolderItem
                  icon={Folder}
                  label={lista.nombre}
                  subtitle={`${formatNumber(conteo.get(lista.id) ?? 0)} contactos`}
                  onOpen={() => router.push(`/lead/listas/${lista.id}`)}
                  className="border-0"
                />
                <div className="flex border-t">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-9 flex-1 rounded-none"
                    onClick={() => setEditando(lista)}
                  >
                    <Pencil className="size-3.5" /> Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-9 flex-1 rounded-none text-destructive hover:text-destructive"
                    onClick={() => setEliminando(lista)}
                  >
                    <Trash2 className="size-3.5" /> Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {crear ? <ListaForm open={crear} onOpenChange={setCrear} /> : null}
      {editando ? (
        <ListaForm
          open={Boolean(editando)}
          onOpenChange={(v) => !v && setEditando(null)}
          lista={editando}
        />
      ) : null}
      {eliminando ? (
        <ConfirmDialog
          open={Boolean(eliminando)}
          onOpenChange={(v) => !v && setEliminando(null)}
          title="Eliminar carpeta"
          description={`Se eliminara la carpeta "${eliminando.nombre}". Tus contactos seguiran en la agenda. Esta accion no se puede deshacer.`}
          onConfirm={() => eliminarLista(eliminando.id)}
        />
      ) : null}
    </>
  );
}
