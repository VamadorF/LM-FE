"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Pencil, Trash2, UserMinus, Search, Users, ListChecks } from "lucide-react";
import { useStore, useHydrated } from "@/lib/store";
import { useDebounced } from "@/lib/hooks";
import { contactosDeLista } from "@/lib/selectors";
import { filtrarOrdenar } from "@/lib/query";
import { formatRut } from "@/lib/format";
import type { Contacto } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ListaForm } from "@/components/listas/lista-form";
import { AgregarContactosDialog } from "@/components/listas/agregar-contactos-dialog";
import { ExplorerBreadcrumb } from "@/components/contactos/explorer-breadcrumb";
import { useRouter } from "next/navigation";

export default function ListaDetallePage({ listaId }: { listaId: string }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const lista = useStore((s) => s.listas.find((l) => l.id === listaId));
  const contactos = useStore((s) => s.contactos);
  const listas = useStore((s) => s.listas);
  const quitarContactoDeLista = useStore((s) => s.quitarContactoDeLista);
  const eliminarLista = useStore((s) => s.eliminarLista);

  const miembros = useMemo(
    () => contactosDeLista(listas, contactos, listaId),
    [listas, contactos, listaId],
  );

  const [searchRaw, setSearchRaw] = useState("");
  const search = useDebounced(searchRaw, 200);
  const [agregar, setAgregar] = useState(false);
  const [editandoLista, setEditandoLista] = useState(false);
  const [quitando, setQuitando] = useState<Contacto | null>(null);
  const [eliminandoLista, setEliminandoLista] = useState(false);

  const resultado = useMemo(
    () =>
      filtrarOrdenar(miembros, {
        search,
        getSearchText: (c) => `${c.nombre} ${c.email} ${c.empresa} ${c.comuna}`,
        sort: (a, b) => a.nombre.localeCompare(b.nombre),
      }),
    [miembros, search],
  );

  if (hydrated && !lista) {
    return (
      <>
        <PageHeader title="Lista no encontrada" description="La lista que buscas no existe" />
        <EmptyState
          icon={ListChecks}
          title="No encontramos esta lista"
          description="Puede que haya sido eliminada."
          action={
            <Link href="/lead/listas">
              <Button variant="outline">
                <ArrowLeft /> Volver a mis listas
              </Button>
            </Link>
          }
        />
      </>
    );
  }

  return (
    <>
      <div>
        <ExplorerBreadcrumb
          className="mb-3"
          segments={[
            { id: "listas", label: "Listas" },
            { id: listaId, label: lista?.nombre ?? "Carpeta" },
          ]}
          onNavigate={(id) => {
            if (id === "listas") router.push("/lead/listas");
          }}
        />
        <PageHeader
          title={lista?.nombre ?? "Lista"}
          description={lista?.descripcion || "Administra los contactos de esta lista"}
        >
          {lista ? (
            <>
              <Button variant="outline" onClick={() => setEditandoLista(true)}>
                <Pencil /> Editar lista
              </Button>
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => setEliminandoLista(true)}
              >
                <Trash2 /> Eliminar carpeta
              </Button>
              <Button onClick={() => setAgregar(true)}>
                <Plus /> Agregar contactos
              </Button>
            </>
          ) : null}
        </PageHeader>
      </div>

      {lista ? (
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="border-accent bg-accent/60 text-accent-foreground">
            {lista.categoria}
          </Badge>
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="size-4" /> {miembros.length} contactos
          </span>
        </div>
      ) : null}

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
      ) : miembros.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Esta lista esta vacia"
          description="Agrega contactos desde tu agenda para postularlos juntos."
          action={
            <Button onClick={() => setAgregar(true)}>
              <Plus /> Agregar contactos
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
                    <div className="flex items-center justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setQuitando(c)}
                      >
                        <UserMinus className="size-4" /> Quitar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {lista ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Eliminar carpeta</p>
              <p className="text-sm text-muted-foreground">
                Borra esta lista. Los contactos permanecen en tu agenda.
              </p>
            </div>
            <Button
              variant="outline"
              className="shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setEliminandoLista(true)}
            >
              <Trash2 /> Eliminar carpeta
            </Button>
          </div>
        </Card>
      ) : null}

      {agregar && lista ? (
        <AgregarContactosDialog open={agregar} onOpenChange={setAgregar} lista={lista} />
      ) : null}
      {editandoLista && lista ? (
        <ListaForm open={editandoLista} onOpenChange={setEditandoLista} lista={lista} />
      ) : null}
      {quitando ? (
        <ConfirmDialog
          open={Boolean(quitando)}
          onOpenChange={(v) => !v && setQuitando(null)}
          title="Quitar de la lista"
          description={`Se quitara a "${quitando.nombre}" de esta lista. El contacto seguira en tu agenda.`}
          confirmLabel="Quitar"
          onConfirm={() => quitarContactoDeLista(listaId, quitando.id)}
        />
      ) : null}
      {eliminandoLista && lista ? (
        <ConfirmDialog
          open={eliminandoLista}
          onOpenChange={setEliminandoLista}
          title="Eliminar carpeta"
          description={`Se eliminara la carpeta "${lista.nombre}". Tus contactos seguiran en la agenda. Esta accion no se puede deshacer.`}
          onConfirm={() => {
            eliminarLista(listaId);
            router.push("/lead/listas");
          }}
        />
      ) : null}
    </>
  );
}
