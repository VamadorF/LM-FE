"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Users, Wallet, Percent, Trophy, ArrowRight } from "lucide-react";
import { useHydrated, useStore } from "@/lib/store";
import {
  comisionesTotales,
  embudo,
  ingresosPorMes,
  leadsPorOrigen,
  resumenAgente,
  tasaConversion,
  valorGanado,
  valorPipeline,
} from "@/lib/selectors";
import { formatCLP, formatNumber, formatPercent, formatRelative } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { EtapaBadge } from "@/components/ui/badges";
import { CardsSkeleton, Skeleton } from "@/components/ui/skeleton";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { EmbudoChart, IngresosChart, OrigenChart } from "@/components/dashboard/charts";

export default function DashboardPage() {
  const hydrated = useHydrated();
  const leads = useStore((s) => s.leads);
  const referidores = useStore((s) => s.referidores);
  const agentes = useStore((s) => s.agentes);

  const stats = useMemo(
    () => ({
      total: leads.length,
      pipeline: valorPipeline(leads),
      ganado: valorGanado(leads),
      conversion: tasaConversion(leads),
      comisiones: comisionesTotales(leads, referidores),
      embudo: embudo(leads),
      ingresos: ingresosPorMes(leads, 6),
      origenes: leadsPorOrigen(leads),
    }),
    [leads, referidores],
  );

  const ranking = useMemo(
    () =>
      agentes
        .map((a) => resumenAgente(a, leads))
        .sort((a, b) => b.valorGanado - a.valorGanado)
        .slice(0, 5),
    [agentes, leads],
  );

  const recientes = useMemo(
    () =>
      [...leads]
        .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
        .slice(0, 6),
    [leads],
  );

  if (!hydrated) {
    return (
      <>
        <PageHeader title="Dashboard" description="Vision general de la operacion comercial" />
        <CardsSkeleton />
        <Skeleton className="h-72" />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Dashboard" description="Vision general de la operacion comercial" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={Users}
          label="Leads totales"
          value={formatNumber(stats.total)}
          hint="En la cartera comercial"
          accent="text-sky-600"
        />
        <KpiCard
          icon={Wallet}
          label="Valor en pipeline"
          value={formatCLP(stats.pipeline)}
          hint="Oportunidades abiertas"
          accent="text-indigo-600"
        />
        <KpiCard
          icon={Percent}
          label="Tasa de conversion"
          value={formatPercent(stats.conversion)}
          hint="Sobre negocios cerrados"
          accent="text-emerald-600"
        />
        <KpiCard
          icon={Trophy}
          label="Comisiones generadas"
          value={formatCLP(stats.comisiones)}
          hint={`${formatCLP(stats.ganado)} en negocios ganados`}
          accent="text-amber-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ingresos ganados por mes</CardTitle>
          </CardHeader>
          <CardContent>
            <IngresosChart data={stats.ingresos} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Leads por origen</CardTitle>
          </CardHeader>
          <CardContent>
            <OrigenChart data={stats.origenes} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Embudo de conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <EmbudoChart data={stats.embudo} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Ranking de agentes</CardTitle>
            <Link
              href="/agentes"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Ver todos <ArrowRight className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {ranking.map((r, i) => (
              <div key={r.agente.id} className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="w-4 text-sm font-semibold text-muted-foreground">{i + 1}</span>
                  <Avatar name={r.agente.nombre} className="size-8 text-[10px]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {r.agente.nombre}
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">
                    {formatCLP(r.valorGanado)}
                  </span>
                </div>
                <Progress
                  value={Math.min(100, r.avanceMeta)}
                  className="h-1.5"
                  indicatorClassName={r.avanceMeta >= 100 ? "bg-success" : undefined}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Leads recientes</CardTitle>
          <Link
            href="/leads"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Ver todos <ArrowRight className="size-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="divide-y">
          {recientes.map((lead) => (
            <Link
              key={lead.id}
              href={`/leads/${lead.id}`}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <Avatar name={lead.nombre} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{lead.nombre}</p>
                <p className="truncate text-xs text-muted-foreground">{lead.empresa}</p>
              </div>
              <EtapaBadge etapa={lead.etapa} />
              <span className="hidden w-28 text-right text-sm font-medium tabular-nums sm:block">
                {formatCLP(lead.valorEstimado)}
              </span>
              <span className="hidden w-20 text-right text-xs text-muted-foreground md:block">
                {formatRelative(lead.fechaCreacion)}
              </span>
            </Link>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
