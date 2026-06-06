"use client";

import { useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Search, CheckCircle2, XCircle, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { useDebounced } from "@/lib/hooks";
import { filtrarOrdenar } from "@/lib/query";
import type { EstadoPostulacion, Oferta, Postulacion } from "@/lib/types";
import { ESTADOS_POSTULACION } from "@/lib/types";
import { formatCLP, formatRelative } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { EstadoPostulacionBadge } from "@/components/ui/market-badges";
import { EmptyState } from "@/components/ui/empty-state";
import { PostulacionDetailDialog } from "./postulacion-detail-dialog";

const GRID =
  "grid grid-cols-[36px_minmax(240px,1.6fr)_minmax(120px,0.9fr)_140px_130px_110px] items-center gap-3";

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

  const [searchRaw, setSearchRaw] = useState("");
  const search = useDebounced(searchRaw, 200);
  const [estado, setEstado] = useState("");
  const [orden, setOrden] = useState("recientes");

  const [seleccion, setSeleccion] = useState<Set<string>>(new Set());
  const [todoFiltrado, setTodoFiltrado] = useState(false);
  const [detalle, setDetalle] = useState<Postulacion | null>(null);
  const [detalleOpen, setDetalleOpen] = useState(false);

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
      </div>

      <p className="text-sm text-muted-foreground">
        {filtradas.length.toLocaleString("es-CL")} postulaciones
        {search || estado ? ` (filtradas de ${postulaciones.length.toLocaleString("es-CL")})` : ""}
      </p>

      {seleccionados > 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-primary/30 bg-accent/50 px-4 py-2.5 text-sm">
          <span className="font-medium text-accent-foreground">
            {seleccionados.toLocaleString("es-CL")} seleccionadas
          </span>
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

      <div className="rounded-xl border bg-card">
        <div className="overflow-x-auto scrollbar-thin">
          <div className="min-w-[840px]">
            <div className={`${GRID} border-b px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground`}>
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
                        className={`${GRID} absolute left-0 right-0 cursor-pointer border-b px-4 text-sm transition-colors hover:bg-secondary/50 ${
                          sel ? "bg-accent/40" : ""
                        }`}
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
                            <p className="truncate font-medium text-foreground">{p.contacto.nombre}</p>
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
                        <span className="text-right tabular-nums">
                          {p.estado === "completada" ? (
                            <span className="font-semibold text-emerald-700">
                              {formatCLP(p.comision ?? 0)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </span>
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
      />
    </div>
  );
}
