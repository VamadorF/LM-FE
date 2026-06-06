"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Megaphone, Inbox, CheckCircle2, Wallet, Plus, Star } from "lucide-react";
import { useStore, useHydrated } from "@/lib/store";
import { useEmpresaActiva } from "@/lib/identidad";
import {
  comisionesPorMes,
  embudoPostulaciones,
  ofertasDeEmpresa,
  resumenEmpresa,
  resumirPostulaciones,
} from "@/lib/selectors";
import { formatCLP, formatNumber, formatRelative } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { IngresosChart, EmbudoChart } from "@/components/dashboard/charts";
import { EstadoOfertaBadge, EstadoPostulacionBadge } from "@/components/ui/market-badges";
import { CardsSkeleton, Skeleton } from "@/components/ui/skeleton";
import { OfertaForm } from "@/components/ofertas/oferta-form";

export default function EmpresaDashboardPage() {
  const hydrated = useHydrated();
  const empresa = useEmpresaActiva();
  const ofertas = useStore((s) => s.ofertas);
  const postulaciones = useStore((s) => s.postulaciones);
  const ratings = useStore((s) => s.ratings);
  const leads = useStore((s) => s.leads);
  const [formOpen, setFormOpen] = useState(false);

  const leadById = useMemo(() => new Map(leads.map((l) => [l.id, l.nombre])), [leads]);

  const data = useMemo(() => {
    if (!empresa) return null;
    const propias = ofertasDeEmpresa(ofertas, empresa.id);
    const ids = new Set(propias.map((o) => o.id));
    const ps = postulaciones.filter((p) => ids.has(p.ofertaId));
    const resumen = resumenEmpresa(empresa.id, ofertas, postulaciones, ratings);
    const conteoPorOf = new Map<string, number>();
    for (const p of ps) conteoPorOf.set(p.ofertaId, (conteoPorOf.get(p.ofertaId) ?? 0) + 1);
    return {
      resumen,
      ofertas: propias,
      recientes: [...ps]
        .sort((a, b) => new Date(b.fechaPostulacion).getTime() - new Date(a.fechaPostulacion).getTime())
        .slice(0, 6),
      serie: comisionesPorMes(ps, 6).map((m) => ({ mes: m.mes, ingresos: m.comisiones })),
      embudo: embudoPostulaciones(resumirPostulaciones(ps)),
      conteoPorOf,
    };
  }, [empresa, ofertas, postulaciones, ratings]);

  if (!hydrated || !data) {
    return (
      <>
        <PageHeader title="Panel de empresa" description="Resumen de tus campanas y conexiones" />
        <CardsSkeleton />
        <Skeleton className="h-72" />
      </>
    );
  }

  return (
    <>
      <PageHeader title={empresa.nombre} description="Resumen de tus campanas y conexiones">
        <Button onClick={() => setFormOpen(true)}>
          <Plus /> Nueva oferta
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Megaphone} label="Ofertas activas" value={formatNumber(data.resumen.ofertasActivas)} hint={`${data.resumen.ofertas} en total`} accent="text-indigo-600" />
        <KpiCard icon={Inbox} label="Postulaciones" value={formatNumber(data.resumen.postulaciones)} hint={`${data.resumen.seleccionadas} seleccionadas`} accent="text-sky-600" />
        <KpiCard icon={CheckCircle2} label="Transacciones" value={formatNumber(data.resumen.completadas)} accent="text-emerald-600" />
        <KpiCard icon={Wallet} label="Comisiones pagadas" value={formatCLP(data.resumen.comisiones)} accent="text-amber-600" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Comisiones pagadas por mes</CardTitle>
          </CardHeader>
          <CardContent>
            <IngresosChart data={data.serie} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Embudo de postulaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <EmbudoChart data={data.embudo} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Mis ofertas</CardTitle>
            <Link href="/empresa/ofertas" className="text-xs font-medium text-primary hover:underline">
              Ver todas
            </Link>
          </CardHeader>
          <CardContent className="divide-y">
            {data.ofertas.slice(0, 5).map((o) => (
              <Link
                key={o.id}
                href={`/empresa/ofertas/${o.id}`}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 hover:opacity-80"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{o.titulo}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(data.conteoPorOf.get(o.id) ?? 0)} postulaciones
                  </p>
                </div>
                <EstadoOfertaBadge estado={o.estado} />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Postulaciones recientes</CardTitle>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="size-3.5 text-amber-400" /> {data.resumen.rating.toFixed(1)}
            </span>
          </CardHeader>
          <CardContent className="divide-y">
            {data.recientes.map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{p.contacto.nombre}</p>
                  <p className="truncate text-xs text-muted-foreground">por {leadById.get(p.leadId) ?? "—"}</p>
                </div>
                <EstadoPostulacionBadge estado={p.estado} />
                <span className="hidden w-16 text-right text-xs text-muted-foreground sm:block">
                  {formatRelative(p.fechaPostulacion)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <OfertaForm open={formOpen} onOpenChange={setFormOpen} />
    </>
  );
}
