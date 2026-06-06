"use client";

import { useMemo } from "react";
import { Wallet, Clock, CheckCircle2 } from "lucide-react";
import { useStore, useHydrated } from "@/lib/store";
import { useEmpresaActiva } from "@/lib/identidad";
import { comisionesPorMes, ofertasDeEmpresa } from "@/lib/selectors";
import { calcularComision } from "@/lib/types";
import { formatCLP, formatDate, formatNumber } from "@/lib/format";
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

export default function EmpresaComisionesPage() {
  const hydrated = useHydrated();
  const empresa = useEmpresaActiva();
  const ofertas = useStore((s) => s.ofertas);
  const postulaciones = useStore((s) => s.postulaciones);
  const leads = useStore((s) => s.leads);

  const ofertaById = useMemo(() => new Map(ofertas.map((o) => [o.id, o])), [ofertas]);
  const leadById = useMemo(() => new Map(leads.map((l) => [l.id, l.nombre])), [leads]);

  const data = useMemo(() => {
    if (!empresa) return null;
    const ids = new Set(ofertasDeEmpresa(ofertas, empresa.id).map((o) => o.id));
    const ps = postulaciones.filter((p) => ids.has(p.ofertaId));
    const pagadas = ps
      .filter((p) => p.estado === "completada")
      .sort((a, b) => new Date(b.fechaActualizacion).getTime() - new Date(a.fechaActualizacion).getTime());
    const totalPagado = pagadas.reduce((s, p) => s + (p.comision ?? 0), 0);
    let porPagar = 0;
    for (const p of ps) {
      if (p.estado === "seleccionada" || p.estado === "en_negociacion") {
        const o = ofertaById.get(p.ofertaId);
        if (o) porPagar += calcularComision(o, o.valorTicketEstimado);
      }
    }
    return {
      pagadas,
      totalPagado,
      porPagar,
      serie: comisionesPorMes(ps, 6).map((m) => ({ mes: m.mes, ingresos: m.comisiones })),
    };
  }, [empresa, ofertas, postulaciones, ofertaById]);

  if (!hydrated || !data) {
    return (
      <>
        <PageHeader title="Comisiones" description="Comisiones pagadas y proyectadas a tus conectores" />
        <CardsSkeleton count={3} />
        <Skeleton className="h-72" />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Comisiones" description="Comisiones pagadas y proyectadas a tus conectores" />

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard icon={Wallet} label="Total pagado" value={formatCLP(data.totalPagado)} accent="text-emerald-600" />
        <KpiCard icon={Clock} label="Proyeccion por pagar" value={formatCLP(data.porPagar)} hint="Seleccionadas y en negociacion" accent="text-amber-600" />
        <KpiCard icon={CheckCircle2} label="Transacciones" value={formatNumber(data.pagadas.length)} accent="text-sky-600" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comisiones pagadas por mes</CardTitle>
        </CardHeader>
        <CardContent>
          <IngresosChart data={data.serie} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalle de comisiones pagadas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data.pagadas.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="Sin comisiones pagadas"
              description="Cuando completes transacciones, veras aqui las comisiones pagadas."
              className="m-4"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Conector</TableHead>
                  <TableHead className="text-right">Transaccion</TableHead>
                  <TableHead className="text-right">Comision</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.pagadas.slice(0, 100).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.contacto.nombre}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{leadById.get(p.leadId) ?? "—"}</TableCell>
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
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
