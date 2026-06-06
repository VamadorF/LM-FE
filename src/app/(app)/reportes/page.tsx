"use client";

import { useMemo } from "react";
import { useHydrated, useStore } from "@/lib/store";
import {
  conteoPorEtapa,
  ingresosPorMes,
  leadsPorOrigen,
  resumenAgente,
  resumenReferidor,
} from "@/lib/selectors";
import { formatCLP, formatPercent } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ComparativaAgentesChart,
  IngresosChart,
  OrigenChart,
  ValorEtapaChart,
} from "@/components/dashboard/charts";

export default function ReportesPage() {
  const hydrated = useHydrated();
  const leads = useStore((s) => s.leads);
  const agentes = useStore((s) => s.agentes);
  const referidores = useStore((s) => s.referidores);

  const valorEtapa = useMemo(
    () =>
      conteoPorEtapa(leads)
        .filter((e) => e.etapa !== "perdido")
        .map((e) => ({ label: e.label, valor: e.valor })),
    [leads],
  );
  const ingresos = useMemo(() => ingresosPorMes(leads, 6), [leads]);
  const origenes = useMemo(() => leadsPorOrigen(leads), [leads]);
  const comparativa = useMemo(
    () =>
      agentes
        .map((a) => {
          const r = resumenAgente(a, leads);
          return {
            nombre: a.nombre.split(" ")[0],
            ganado: r.valorGanado,
            pipeline: r.valorPipeline,
          };
        })
        .sort((a, b) => b.ganado + b.pipeline - (a.ganado + a.pipeline)),
    [agentes, leads],
  );
  const topReferidores = useMemo(() => {
    const max = Math.max(
      1,
      ...referidores.map((r) => resumenReferidor(r, leads, referidores).comisionAcumulada),
    );
    return referidores
      .map((r) => resumenReferidor(r, leads, referidores))
      .sort((a, b) => b.comisionAcumulada - a.comisionAcumulada)
      .slice(0, 6)
      .map((r) => ({ ...r, pct: (r.comisionAcumulada / max) * 100 }));
  }, [referidores, leads]);

  if (!hydrated) {
    return (
      <>
        <PageHeader title="Reportes" description="Analisis de desempeno comercial" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Reportes" description="Analisis de desempeno comercial" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Valor por etapa del pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ValorEtapaChart data={valorEtapa} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolucion de ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <IngresosChart data={ingresos} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribucion por origen</CardTitle>
          </CardHeader>
          <CardContent>
            <OrigenChart data={origenes} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rendimiento por agente</CardTitle>
          </CardHeader>
          <CardContent>
            <ComparativaAgentesChart data={comparativa} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comisiones por referidor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topReferidores.map((r) => (
            <div key={r.referidor.id} className="flex items-center gap-4">
              <Avatar name={r.referidor.nombre} className="size-9" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-medium text-foreground">
                    {r.referidor.nombre}
                  </p>
                  <span className="text-sm font-semibold tabular-nums text-emerald-700">
                    {formatCLP(r.comisionAcumulada)}
                  </span>
                </div>
                <Progress value={r.pct} className="mt-1.5 h-2" indicatorClassName="bg-emerald-500" />
                <p className="mt-1 text-xs text-muted-foreground">
                  {r.leadsReferidos} leads - {r.ganados} ganados -{" "}
                  {formatPercent(r.referidor.porcentajeComision, 0)} comision
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
