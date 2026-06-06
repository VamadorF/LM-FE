"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useStore, useHydrated } from "@/lib/store";
import { useEmpresaActiva } from "@/lib/identidad";
import { ofertasDeEmpresa, promedioRating, rankingLeads } from "@/lib/selectors";
import { filtrarOrdenar } from "@/lib/query";
import { formatCLP, formatNumber } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Stars } from "@/components/ui/stars";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

export default function ConectoresPage() {
  const hydrated = useHydrated();
  const empresa = useEmpresaActiva();
  const ofertas = useStore((s) => s.ofertas);
  const postulaciones = useStore((s) => s.postulaciones);
  const leads = useStore((s) => s.leads);
  const ratings = useStore((s) => s.ratings);

  const [search, setSearch] = useState("");

  const filas = useMemo(() => {
    if (!empresa) return [];
    const ids = new Set(ofertasDeEmpresa(ofertas, empresa.id).map((o) => o.id));
    const ps = postulaciones.filter((p) => ids.has(p.ofertaId));
    return rankingLeads(ps, leads).map((f) => ({
      ...f,
      rating: promedioRating(ratings, "lead", f.lead.id),
    }));
  }, [empresa, ofertas, postulaciones, leads, ratings]);

  const filtradas = useMemo(
    () => filtrarOrdenar(filas, { search, getSearchText: (f) => f.lead.nombre }),
    [filas, search],
  );

  return (
    <>
      <PageHeader title="Conectores" description="Leads que han postulado contactos a tus ofertas" />

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar conector..."
            className="pl-9"
          />
        </div>
      </Card>

      <Card>
        {!hydrated ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : filtradas.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Sin conectores"
            description="Aun no hay leads que hayan postulado contactos a tus ofertas."
            className="m-4"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Conector</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Postulaciones</TableHead>
                <TableHead className="text-right">Cierres</TableHead>
                <TableHead className="text-right">Comisiones generadas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtradas.slice(0, 100).map((f) => (
                <TableRow key={f.lead.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={f.lead.nombre} className="size-8 text-[10px]" />
                      <div>
                        <p className="font-medium text-foreground">{f.lead.nombre}</p>
                        <p className="text-xs text-muted-foreground">{f.lead.comuna}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Stars value={f.rating.promedio} showValue count={f.rating.total} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(f.postulaciones)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatNumber(f.completadas)}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums text-emerald-700">
                    {formatCLP(f.comisiones)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </>
  );
}
