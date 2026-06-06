"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Star } from "lucide-react";
import { useStore, useHydrated } from "@/lib/store";
import { useLeadActivo } from "@/lib/identidad";
import { useDebounced } from "@/lib/hooks";
import { filtrarOrdenar, paginar } from "@/lib/query";
import { ESTADOS_POSTULACION, type Postulacion } from "@/lib/types";
import { formatCLP, formatRelative } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EstadoPostulacionBadge } from "@/components/ui/market-badges";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/skeleton";
import { RatingDialog } from "@/components/ratings/rating-dialog";

const PAGE_SIZE = 12;

export default function MisPostulacionesPage() {
  const hydrated = useHydrated();
  const lead = useLeadActivo();
  const postulaciones = useStore((s) => s.postulaciones);
  const ofertas = useStore((s) => s.ofertas);
  const empresas = useStore((s) => s.empresas);
  const ratings = useStore((s) => s.ratings);

  const ofertaById = useMemo(() => new Map(ofertas.map((o) => [o.id, o])), [ofertas]);
  const empresaById = useMemo(() => new Map(empresas.map((e) => [e.id, e])), [empresas]);

  const [searchRaw, setSearchRaw] = useState("");
  const search = useDebounced(searchRaw, 200);
  const [estado, setEstado] = useState("");
  const [page, setPage] = useState(1);
  const [calificar, setCalificar] = useState<Postulacion | null>(null);

  const mias = useMemo(
    () => postulaciones.filter((p) => p.leadId === lead?.id),
    [postulaciones, lead],
  );

  const filtradas = useMemo(
    () =>
      filtrarOrdenar(mias, {
        search,
        getSearchText: (p) => `${p.contacto.nombre} ${ofertaById.get(p.ofertaId)?.titulo ?? ""}`,
        filters: estado ? [(p) => p.estado === estado] : [],
        sort: (a, b) =>
          new Date(b.fechaActualizacion).getTime() - new Date(a.fechaActualizacion).getTime(),
      }),
    [mias, search, estado, ofertaById],
  );

  const result = paginar(filtradas, page, PAGE_SIZE);

  const yaCalifico = (p: Postulacion) =>
    ratings.some((r) => r.postulacionId === p.id && r.deTipo === "lead");

  return (
    <>
      <PageHeader title="Mis postulaciones" description={`${mias.length} contactos postulados`} />

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchRaw}
              onChange={(e) => {
                setSearchRaw(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por contacto u oferta..."
              className="pl-9"
            />
          </div>
          <Select
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value);
              setPage(1);
            }}
            className="sm:w-52"
          >
            <option value="">Todos los estados</option>
            {ESTADOS_POSTULACION.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card>
        {!hydrated ? (
          <div className="p-4">
            <TableSkeleton />
          </div>
        ) : result.items.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Sin postulaciones"
            description="Explora ofertas y postula contactos de tu red para ganar comisiones."
            action={
              <Link href="/lead/ofertas">
                <Button>Explorar ofertas</Button>
              </Link>
            }
            className="m-4"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contacto</TableHead>
                <TableHead>Oferta</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Comision</TableHead>
                <TableHead>Actualizado</TableHead>
                <TableHead className="text-right">Accion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((p) => {
                const oferta = ofertaById.get(p.ofertaId);
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <p className="font-medium text-foreground">{p.contacto.nombre}</p>
                      <p className="text-xs text-muted-foreground">{p.contacto.empresa}</p>
                    </TableCell>
                    <TableCell className="max-w-[220px]">
                      {oferta?.titulo ?? "—"}
                    </TableCell>
                    <TableCell>
                      <EstadoPostulacionBadge estado={p.estado} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {p.estado === "completada" ? (
                        <span className="font-semibold text-emerald-700">{formatCLP(p.comision ?? 0)}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatRelative(p.fechaActualizacion)}
                    </TableCell>
                    <TableCell className="text-right">
                      {p.estado === "completada" ? (
                        <Button
                          size="sm"
                          variant={yaCalifico(p) ? "outline" : "default"}
                          disabled={yaCalifico(p)}
                          onClick={() => setCalificar(p)}
                        >
                          <Star /> {yaCalifico(p) ? "Calificada" : "Calificar"}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">En proceso</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {hydrated && filtradas.length > PAGE_SIZE ? (
          <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
            <p className="text-muted-foreground">
              Pagina {result.page} de {result.pageCount}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={result.page <= 1} onClick={() => setPage((p) => p - 1)}>
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={result.page >= result.pageCount}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        ) : null}
      </Card>

      {calificar && lead ? (
        <RatingDialog
          open={Boolean(calificar)}
          onOpenChange={(v) => !v && setCalificar(null)}
          postulacion={calificar}
          deTipo="lead"
          deId={lead.id}
          paraTipo="empresa"
          paraId={ofertaById.get(calificar.ofertaId)?.empresaId ?? ""}
          paraNombre={empresaById.get(ofertaById.get(calificar.ofertaId)?.empresaId ?? "")?.nombre ?? "la empresa"}
        />
      ) : null}
    </>
  );
}
