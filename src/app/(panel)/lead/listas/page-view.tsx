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
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {misListas.map((lista) => (
              <div key={lista.id} className="group relative">
                <FolderItem
                  icon={Folder}
                  label={lista.nombre}
                  subtitle={`${formatNumber(conteo.get(lista.id) ?? 0)} contactos`}
                  onOpen={() => router.push(`/lead/listas/${lista.id}`)}
                />
                <div className="absolute right-0 top-0 z-10 flex gap-0.5 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="size-7 shadow-sm"
                    onClick={() => setEditando(lista)}
                    aria-label="Editar lista"
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="size-7 text-destructive shadow-sm hover:text-destructive"
                    onClick={() => setEliminando(lista)}
                    aria-label="Eliminar lista"
                  >
                    <Trash2 className="size-3.5" />
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
