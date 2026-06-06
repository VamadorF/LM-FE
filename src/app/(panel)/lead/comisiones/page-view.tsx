"use client";

import { useMemo } from "react";
import { Wallet, TrendingUp, CheckCircle2 } from "lucide-react";
import { useStore, useHydrated } from "@/lib/store";
import { useLeadActivo } from "@/lib/identidad";
import { comisionesPorMes, postulacionesDeLead } from "@/lib/selectors";
import { formatCLP, formatNumber, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { IngresosChart } from "@/components/dashboard/charts";
import { EmptyState } from "@/components/ui/empty-state";
import { CardsSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function LeadComisionesPage() {
  const hydrated = useHydrated();
  const lead = useLeadActivo();
  const postulaciones = useStore((s) => s.postulaciones);
  const ofertas = useStore((s) => s.ofertas);

  const ofertaById = useMemo(() => new Map(ofertas.map((o) => [o.id, o])), [ofertas]);

  const data = useMemo(() => {
    if (!lead) return null;
    const mias = postulacionesDeLead(postulaciones, lead.id);
    const completadas = mias
      .filter((p) => p.estado === "completada")
      .sort((a, b) => new Date(b.fechaActualizacion).getTime() - new Date(a.fechaActualizacion).getTime());
    const total = completadas.reduce((s, p) => s + (p.comision ?? 0), 0);
    const enProceso = mias.filter((p) => p.estado === "seleccionada" || p.estado === "en_negociacion").length;
    return {
      completadas,
      total,
      enProceso,
      serie: comisionesPorMes(mias, 6).map((m) => ({ mes: m.mes, ingresos: m.comisiones })),
    };
  }, [lead, postulaciones]);

  if (!hydrated || !data) {
    return (
      <>
        <PageHeader title="Comisiones" description="Tus ingresos por negocios cerrados" />
        <CardsSkeleton count={3} />
        <Skeleton className="h-72" />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Comisiones" description="Tus ingresos por negocios cerrados" />

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard icon={Wallet} label="Total ganado" value={formatCLP(data.total)} accent="text-emerald-600" />
        <KpiCard icon={CheckCircle2} label="Negocios cerrados" value={formatNumber(data.completadas.length)} accent="text-sky-600" />
        <KpiCard icon={TrendingUp} label="En proceso" value={formatNumber(data.enProceso)} hint="Seleccionadas o en negociacion" accent="text-amber-600" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comisiones por mes</CardTitle>
        </CardHeader>
        <CardContent>
          <IngresosChart data={data.serie} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalle de comisiones</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data.completadas.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="Aun no tienes comisiones"
              description="Cuando un contacto que postulaste cierre negocio, veras aqui tu comision."
              className="m-4"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Oferta</TableHead>
                  <TableHead className="text-right">Transaccion</TableHead>
                  <TableHead className="text-right">Comision</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.completadas.map((p) => {
                  const oferta = ofertaById.get(p.ofertaId);
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.contacto.nombre}</TableCell>
                      <TableCell className="max-w-[220px] text-sm text-muted-foreground">
                        {oferta?.titulo ?? "—"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {formatCLP(p.valorTransaccion ?? 0)}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums text-emerald-700">
                        {formatCLP(p.comision ?? 0)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(p.fechaActualizacion)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
