"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Search, CheckCircle2, XCircle, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { useDebounced } from "@/lib/hooks";
import { filtrarOrdenar } from "@/lib/query";
import type { EstadoPostulacion, Oferta, Postulacion } from "@/lib/types";
import { ESTADOS_POSTULACION } from "@/lib/types";
import { formatCLP, formatPostulaciones, formatRelative, formatSeleccionadas } from "@/lib/format";
import {
  puntosEncaje,
  scoreEncaje,
  scoreEncajeLabel,
  scoreEncajeTone,
} from "@/lib/postulacion-encaje";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EstadoPostulacionBadge } from "@/components/ui/market-badges";
import { EmptyState } from "@/components/ui/empty-state";
import { PostulacionDetailDialog } from "./postulacion-detail-dialog";
import { cn } from "@/lib/utils";

const GRID =
  "grid grid-cols-[36px_minmax(240px,1.6fr)_minmax(120px,0.9fr)_140px_130px_110px] items-center gap-3";

interface FiltrosBandeja {
  search: string;
  estado: string;
  orden: string;
}

function filtrosKey(ofertaId: string) {
  return `bandeja-filtros:${ofertaId}`;
}

function leerFiltros(ofertaId: string): FiltrosBandeja | null {
  try {
    const raw = sessionStorage.getItem(filtrosKey(ofertaId));
    if (!raw) return null;
    return JSON.parse(raw) as FiltrosBandeja;
  } catch {
    return null;
  }
}

function guardarFiltros(ofertaId: string, filtros: FiltrosBandeja) {
  try {
    sessionStorage.setItem(filtrosKey(ofertaId), JSON.stringify(filtros));
  } catch {
    /* ignore */
  }
}

function EncajeBadge({ oferta, postulacion }: { oferta: Oferta; postulacion: Postulacion }) {
  const score = scoreEncaje(puntosEncaje(oferta, postulacion.contacto));
  return (
    <Badge className={cn("shrink-0 text-[10px]", scoreEncajeTone(score))}>
      {score}% {scoreEncajeLabel(score)}
    </Badge>
  );
}

function ComisionCelda({ postulacion }: { postulacion: Postulacion }) {
  if (postulacion.estado !== "completada") {
    return <span className="text-muted-foreground">—</span>;
  }
  return (
    <div className="text-right tabular-nums">
      <p className="text-xs text-muted-foreground">{formatCLP(postulacion.valorTransaccion ?? 0)}</p>
      <p className="font-semibold text-emerald-700">{formatCLP(postulacion.comision ?? 0)}</p>
    </div>
  );
}

export function PostulacionesTable({
  postulaciones,
  oferta,
}: {
  postulaciones: Postulacion[];
  oferta: Oferta;
}) {
  const leads = useStore((s) => s.leads);
  const cambiarEstadoBulk = useStore((s) => s.cambiarEstadoBulk);

  const leadNombre = useMemo(() => {
    const m = new Map(leads.map((l) => [l.id, l.nombre]));
    return (id: string) => m.get(id) ?? "—";
  }, [leads]);

  const filtrosIniciales = useMemo(() => leerFiltros(oferta.id), [oferta.id]);

  const [searchRaw, setSearchRaw] = useState(filtrosIniciales?.search ?? "");
  const search = useDebounced(searchRaw, 200);
  const [estado, setEstado] = useState(filtrosIniciales?.estado ?? "");
  const [orden, setOrden] = useState(filtrosIniciales?.orden ?? "recientes");

  const [seleccion, setSeleccion] = useState<Set<string>>(new Set());
  const [todoFiltrado, setTodoFiltrado] = useState(false);
  const [detalle, setDetalle] = useState<Postulacion | null>(null);
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  useEffect(() => {
    guardarFiltros(oferta.id, { search: searchRaw, estado, orden });
  }, [oferta.id, searchRaw, estado, orden]);

  useEffect(() => {
    if (!highlightId) return;
    const t = window.setTimeout(() => setHighlightId(null), 3000);
    return () => window.clearTimeout(t);
  }, [highlightId]);

  const filtradas = useMemo(
    () =>
      filtrarOrdenar(postulaciones, {
        search,
        getSearchText: (p) =>
          `${p.contacto.nombre} ${p.contacto.email} ${p.contacto.empresa} ${p.mensaje}`,
        filters: estado ? [(p) => p.estado === estado] : [],
        sort:
          orden === "valor"
            ? (a, b) => (b.valorTransaccion ?? 0) - (a.valorTransaccion ?? 0)
            : (a, b) =>
                new Date(b.fechaActualizacion).getTime() - new Date(a.fechaActualizacion).getTime(),
      }),
    [postulaciones, search, estado, orden],
  );

  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: filtradas.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 12,
  });

  const seleccionados = todoFiltrado ? filtradas.length : seleccion.size;
  const hayFiltrosActivos = Boolean(searchRaw || estado || orden !== "recientes");

  const toggle = (id: string) => {
    setTodoFiltrado(false);
    setSeleccion((prev) => {
      const next = new Set(todoFiltrado ? filtradas.map((p) => p.id) : prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const limpiarSeleccion = () => {
    setSeleccion(new Set());
    setTodoFiltrado(false);
  };

  const limpiarFiltros = () => {
    setSearchRaw("");
    setEstado("");
    setOrden("recientes");
  };

  const aplicarBulk = (nuevoEstado: EstadoPostulacion) => {
    const ids = todoFiltrado ? filtradas.map((p) => p.id) : Array.from(seleccion);
    if (ids.length === 0) return;
    cambiarEstadoBulk(ids, nuevoEstado);
    limpiarSeleccion();
  };

  const estaSeleccionado = (id: string) => todoFiltrado || seleccion.has(id);
  const abrirDetalle = (p: Postulacion) => {
    setDetalle(p);
    setDetalleOpen(true);
  };

  const rowHighlight = (id: string) =>
    highlightId === id ? "ring-2 ring-inset ring-emerald-400 bg-emerald-50/50" : "";

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchRaw}
            onChange={(e) => setSearchRaw(e.target.value)}
            placeholder="Buscar contacto por nombre, email o empresa..."
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:w-auto sm:grid-cols-2">
          <Select value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            {ESTADOS_POSTULACION.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </Select>
          <Select value={orden} onChange={(e) => setOrden(e.target.value)}>
            <option value="recientes">Mas recientes</option>
            <option value="valor">Mayor valor</option>
          </Select>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={limpiarFiltros}
          disabled={!hayFiltrosActivos}
          className="shrink-0"
        >
          Limpiar filtros
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        {formatPostulaciones(filtradas.length)}
        {search || estado ? ` (filtradas de ${postulaciones.length.toLocaleString("es-CL")})` : ""}
      </p>

      {seleccionados > 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-primary/30 bg-accent/50 px-4 py-2.5 text-sm">
          <span className="font-medium text-accent-foreground">{formatSeleccionadas(seleccionados)}</span>
          {!todoFiltrado && seleccion.size > 0 && filtradas.length > seleccion.size ? (
            <button
              onClick={() => setTodoFiltrado(true)}
              className="text-primary underline-offset-2 hover:underline"
            >
              Seleccionar las {filtradas.length.toLocaleString("es-CL")} filtradas
            </button>
          ) : null}
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => aplicarBulk("seleccionada")}>
              <CheckCircle2 /> Seleccionar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => aplicarBulk("rechazada")}
            >
              <XCircle /> Rechazar
            </Button>
            <Button size="sm" variant="ghost" onClick={limpiarSeleccion}>
              <X />
            </Button>
          </div>
        </div>
      ) : null}

      {/* Mobile cards */}
      <div className="space-y-2 lg:hidden">
        {filtradas.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Sin postulaciones"
            description="No hay contactos que coincidan con la busqueda o filtros."
            className="rounded-xl border bg-card m-0"
          />
        ) : (
          filtradas.map((p) => {
            const sel = estaSeleccionado(p.id);
            return (
              <div
                key={p.id}
                className={cn(
                  "cursor-pointer rounded-xl border bg-card p-4 transition-colors hover:bg-secondary/30",
                  sel && "border-primary/40 bg-accent/30",
                  rowHighlight(p.id),
                )}
                onClick={() => abrirDetalle(p)}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={sel}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggle(p.id)}
                    className="mt-1 size-4 cursor-pointer accent-[var(--primary)]"
                  />
                  <Avatar name={p.contacto.nombre} className="size-9 text-[10px]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{p.contacto.nombre}</p>
                      <EncajeBadge oferta={oferta} postulacion={p} />
                    </div>
                    <p className="text-xs text-muted-foreground">{p.contacto.empresa}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{leadNombre(p.leadId)}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                  <EstadoPostulacionBadge estado={p.estado} />
                  <div className="text-right text-sm">
                    {p.estado === "completada" ? (
                      <>
                        <p className="text-xs text-muted-foreground">
                          {formatCLP(p.valorTransaccion ?? 0)}
                        </p>
                        <p className="font-semibold text-emerald-700">{formatCLP(p.comision ?? 0)}</p>
                      </>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                  <span className="w-full text-xs text-muted-foreground sm:w-auto sm:text-right">
                    {formatRelative(p.fechaActualizacion)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden rounded-xl border bg-card lg:block">
        <div className="overflow-x-auto scrollbar-thin">
          <div className="min-w-[840px]">
            <div
              className={`${GRID} border-b px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground`}
            >
              <span />
              <span>Contacto / propuesta</span>
              <span>Conector</span>
              <span>Estado</span>
              <span className="text-right">Valor / Comision</span>
              <span className="text-right">Actividad</span>
            </div>

            {filtradas.length === 0 ? (
              <EmptyState
                icon={Search}
                title="Sin postulaciones"
                description="No hay contactos que coincidan con la busqueda o filtros."
                className="m-4"
              />
            ) : (
              <div ref={parentRef} className="h-[560px] overflow-y-auto scrollbar-thin">
                <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
                  {virtualizer.getVirtualItems().map((vi) => {
                    const p = filtradas[vi.index];
                    const sel = estaSeleccionado(p.id);
                    return (
                      <div
                        key={p.id}
                        className={cn(
                          GRID,
                          "absolute left-0 right-0 cursor-pointer border-b px-4 text-sm transition-colors hover:bg-secondary/50",
                          sel && "bg-accent/40",
                          rowHighlight(p.id),
                        )}
                        style={{ height: vi.size, transform: `translateY(${vi.start}px)` }}
                        onClick={() => abrirDetalle(p)}
                      >
                        <input
                          type="checkbox"
                          checked={sel}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => toggle(p.id)}
                          className="size-4 cursor-pointer accent-[var(--primary)]"
                        />
                        <div className="flex min-w-0 items-center gap-2.5">
                          <Avatar name={p.contacto.nombre} className="size-8 text-[10px]" />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <p className="truncate font-medium text-foreground">{p.contacto.nombre}</p>
                              <EncajeBadge oferta={oferta} postulacion={p} />
                            </div>
                            <p className="truncate text-xs text-muted-foreground">{p.contacto.empresa}</p>
                            {p.mensaje ? (
                              <p className="line-clamp-1 text-xs text-primary/80">{p.mensaje}</p>
                            ) : null}
                          </div>
                        </div>
                        <span className="truncate text-muted-foreground">{leadNombre(p.leadId)}</span>
                        <span>
                          <EstadoPostulacionBadge estado={p.estado} />
                        </span>
                        <ComisionCelda postulacion={p} />
                        <span className="text-right text-xs text-muted-foreground">
                          {formatRelative(p.fechaActualizacion)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <PostulacionDetailDialog
        open={detalleOpen}
        onOpenChange={setDetalleOpen}
        postulacion={detalle}
        oferta={oferta}
        onTransaccionCompletada={(id) => setHighlightId(id)}
      />
    </div>
  );
}
