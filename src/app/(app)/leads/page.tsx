"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, Pencil, Trash2, Eye, Users, SlidersHorizontal } from "lucide-react";
import { useHydrated, useStore } from "@/lib/store";
import { ETAPAS, ORIGENES, PRIORIDADES, type Lead } from "@/lib/types";
import { formatCLP, formatRelative } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar } from "@/components/ui/avatar";
import { EtapaBadge, OrigenBadge, PrioridadBadge } from "@/components/ui/badges";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/skeleton";
import { LeadForm } from "@/components/leads/lead-form";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PAGE_SIZE = 8;

export default function LeadsPage() {
  const hydrated = useHydrated();
  const leads = useStore((s) => s.leads);
  const agentes = useStore((s) => s.agentes);
  const deleteLead = useStore((s) => s.deleteLead);

  const [query, setQuery] = useState("");
  const [etapa, setEtapa] = useState("");
  const [agente, setAgente] = useState("");
  const [origen, setOrigen] = useState("");
  const [prioridad, setPrioridad] = useState("");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | undefined>(undefined);
  const [toDelete, setToDelete] = useState<Lead | null>(null);

  const agenteNombre = (id: string) => agentes.find((a) => a.id === id)?.nombre ?? "Sin asignar";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads
      .filter((l) => {
        if (q && !`${l.nombre} ${l.empresa} ${l.email}`.toLowerCase().includes(q)) return false;
        if (etapa && l.etapa !== etapa) return false;
        if (agente && l.agenteId !== agente) return false;
        if (origen && l.origen !== origen) return false;
        if (prioridad && l.prioridad !== prioridad) return false;
        return true;
      })
      .sort((a, b) => new Date(b.ultimaActividad).getTime() - new Date(a.ultimaActividad).getTime());
  }, [leads, query, etapa, agente, origen, prioridad]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const resetFiltros = () => {
    setQuery("");
    setEtapa("");
    setAgente("");
    setOrigen("");
    setPrioridad("");
    setPage(1);
  };

  const openNew = () => {
    setEditing(undefined);
    setFormOpen(true);
  };
  const openEdit = (lead: Lead) => {
    setEditing(lead);
    setFormOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Leads"
        description={`${filtered.length} de ${leads.length} leads en la cartera`}
      >
        <Button onClick={openNew}>
          <Plus /> Nuevo lead
        </Button>
      </PageHeader>

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por nombre, empresa o email..."
              className="pl-9"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Select
              value={etapa}
              onChange={(e) => {
                setEtapa(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Etapa</option>
              {ETAPAS.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </Select>
            <Select
              value={origen}
              onChange={(e) => {
                setOrigen(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Origen</option>
              {ORIGENES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
            <Select
              value={prioridad}
              onChange={(e) => {
                setPrioridad(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Prioridad</option>
              {PRIORIDADES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>
            <Select
              value={agente}
              onChange={(e) => {
                setAgente(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Agente</option>
              {agentes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      <Card>
        {!hydrated ? (
          <div className="p-4">
            <TableSkeleton />
          </div>
        ) : paginated.length === 0 ? (
          <EmptyState
            icon={filtered.length === 0 && leads.length > 0 ? SlidersHorizontal : Users}
            title={
              leads.length === 0
                ? "Aun no hay leads"
                : "Ningun lead coincide con los filtros"
            }
            description={
              leads.length === 0
                ? "Crea tu primer lead para comenzar a gestionar la cartera."
                : "Ajusta o limpia los filtros para ver mas resultados."
            }
            action={
              leads.length === 0 ? (
                <Button onClick={openNew}>
                  <Plus /> Nuevo lead
                </Button>
              ) : (
                <Button variant="outline" onClick={resetFiltros}>
                  Limpiar filtros
                </Button>
              )
            }
            className="m-4"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contacto</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Origen</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Agente</TableHead>
                <TableHead>Actividad</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <Link href={`/leads/${lead.id}`} className="flex items-center gap-3 group">
                      <Avatar name={lead.nombre} />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground group-hover:text-primary">
                          {lead.nombre}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{lead.empresa}</p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <EtapaBadge etapa={lead.etapa} />
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatCLP(lead.valorEstimado)}
                  </TableCell>
                  <TableCell>
                    <OrigenBadge origen={lead.origen} />
                  </TableCell>
                  <TableCell>
                    <PrioridadBadge prioridad={lead.prioridad} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {agenteNombre(lead.agenteId)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatRelative(lead.ultimaActividad)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/leads/${lead.id}`}
                        title="Ver"
                        className={buttonVariants({ variant: "ghost", size: "icon" })}
                      >
                        <Eye />
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Editar"
                        onClick={() => openEdit(lead)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Eliminar"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setToDelete(lead)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {hydrated && filtered.length > PAGE_SIZE ? (
          <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
            <p className="text-muted-foreground">
              Pagina {currentPage} de {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        ) : null}
      </Card>

      <LeadForm open={formOpen} onOpenChange={setFormOpen} lead={editing} />

      <Dialog open={Boolean(toDelete)} onOpenChange={(v) => !v && setToDelete(null)}>
        <DialogHeader>
          <DialogTitle>Eliminar lead</DialogTitle>
          <DialogDescription>
            Esta accion eliminara a {toDelete?.nombre} y su historial. No se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setToDelete(null)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (toDelete) deleteLead(toDelete.id);
              setToDelete(null);
            }}
          >
            Eliminar
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
