"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Inbox, CheckCircle2, Wallet, Trophy, ArrowRight, Compass, Contact, ListChecks } from "lucide-react";
import { useStore, useHydrated } from "@/lib/store";
import { useLeadActivo } from "@/lib/identidad";
import {
  comisionesPorMes,
  conteoPorOferta,
  contactosDelLead,
  listasDelLead,
  postulacionesDeLead,
  rankingLeads,
  resumenLead,
} from "@/lib/selectors";
import { formatCLP, formatNumber, formatRelative } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stars } from "@/components/ui/stars";
import { EstadoPostulacionBadge } from "@/components/ui/market-badges";
import { CardsSkeleton, Skeleton } from "@/components/ui/skeleton";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { IngresosChart } from "@/components/dashboard/charts";
import { OfertaCard } from "@/components/ofertas/oferta-card";
import { Button } from "@/components/ui/button";

export default function LeadDashboardPage() {
  const hydrated = useHydrated();
  const lead = useLeadActivo();
  const postulaciones = useStore((s) => s.postulaciones);
  const ofertas = useStore((s) => s.ofertas);
  const empresas = useStore((s) => s.empresas);
  const leads = useStore((s) => s.leads);
  const ratings = useStore((s) => s.ratings);
  const listas = useStore((s) => s.listas);
  const contactos = useStore((s) => s.contactos);

  const empresaById = useMemo(() => new Map(empresas.map((e) => [e.id, e])), [empresas]);
  const conteo = useMemo(() => conteoPorOferta(postulaciones), [postulaciones]);
  const misListas = useMemo(
    () => (lead ? listasDelLead(listas, lead.id) : []),
    [listas, lead],
  );
  const misContactos = useMemo(
    () => (lead ? contactosDelLead(contactos, lead.id) : []),
    [contactos, lead],
  );

  const data = useMemo(() => {
    if (!lead) return null;
    const mias = postulacionesDeLead(postulaciones, lead.id);
    const resumen = resumenLead(lead.id, postulaciones, ratings);
    const posicion = rankingLeads(postulaciones, leads).findIndex((f) => f.lead.id === lead.id) + 1;
    const recientes = [...mias]
      .sort((a, b) => new Date(b.fechaPostulacion).getTime() - new Date(a.fechaPostulacion).getTime())
      .slice(0, 6);
    return {
      resumen,
      posicion,
      recientes,
      comisiones: comisionesPorMes(mias, 6).map((m) => ({ mes: m.mes, ingresos: m.comisiones })),
    };
  }, [lead, postulaciones, leads, ratings]);

  const recomendadas = useMemo(
    () => ofertas.filter((o) => o.estado === "activa").slice(0, 3),
    [ofertas],
  );

  if (!hydrated || !data) {
    return (
      <>
        <PageHeader title="Mi panel" description="Resumen de tu actividad como conector" />
        <CardsSkeleton />
        <Skeleton className="h-72" />
      </>
    );
  }

  return (
    <>
      <PageHeader title={`Hola, ${lead.nombre.split(" ")[0]}`} description="Resumen de tu actividad como conector">
        <Link href="/lead/agenda">
          <Button variant="outline">
            <Contact /> Agenda
          </Button>
        </Link>
        <Link href="/lead/ofertas">
          <Button>
            <Compass /> Explorar ofertas
          </Button>
        </Link>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Inbox} label="Postulaciones" value={formatNumber(data.resumen.postulaciones)} hint={`${data.resumen.abiertas} en proceso`} accent="text-sky-600" />
        <KpiCard icon={CheckCircle2} label="Cerradas" value={formatNumber(data.resumen.completadas)} hint={`${data.resumen.seleccionadas} seleccionadas`} accent="text-emerald-600" />
        <KpiCard icon={Wallet} label="Comisiones ganadas" value={formatCLP(data.resumen.comisiones)} accent="text-amber-600" />
        <KpiCard icon={Trophy} label="Mi ranking" value={data.posicion > 0 ? `#${data.posicion}` : "-"} hint={`Rating ${data.resumen.rating.toFixed(1)}`} accent="text-violet-600" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Mis comisiones por mes</CardTitle>
          </CardHeader>
          <CardContent>
            <IngresosChart data={data.comisiones} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mi reputacion</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-6 text-center">
            <p className="text-4xl font-bold text-foreground">{data.resumen.rating.toFixed(1)}</p>
            <Stars value={data.resumen.rating} size="md" />
            <p className="text-sm text-muted-foreground">{data.resumen.ratingTotal} evaluaciones recibidas</p>
            <Link href="/lead/perfil" className="mt-2 text-sm font-medium text-primary hover:underline">
              Ver mi perfil
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Mi agenda y listas</CardTitle>
          <Link href="/lead/agenda" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            Administrar <ArrowRight className="size-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/lead/agenda"
            className="flex items-center gap-3 rounded-lg border bg-card/50 p-4 transition-colors hover:bg-secondary/50"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-primary">
              <Contact className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatNumber(misContactos.length)}</p>
              <p className="text-xs text-muted-foreground">Contactos en tu agenda</p>
            </div>
          </Link>
          <Link
            href="/lead/listas"
            className="flex items-center gap-3 rounded-lg border bg-card/50 p-4 transition-colors hover:bg-secondary/50"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-primary">
              <ListChecks className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatNumber(misListas.length)}</p>
              <p className="text-xs text-muted-foreground">Listas creadas</p>
            </div>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Mis postulaciones recientes</CardTitle>
          <Link href="/lead/postulaciones" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            Ver todas <ArrowRight className="size-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="divide-y">
          {data.recientes.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Aun no has postulado contactos. Explora ofertas para empezar a ganar comisiones.
            </p>
          ) : (
            data.recientes.map((p) => {
              const oferta = ofertas.find((o) => o.id === p.ofertaId);
              return (
                <div key={p.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{p.contacto.nombre}</p>
                    <p className="truncate text-xs text-muted-foreground">{oferta?.titulo ?? "—"}</p>
                  </div>
                  <EstadoPostulacionBadge estado={p.estado} />
                  <span className="hidden w-24 text-right text-xs text-muted-foreground sm:block">
                    {formatRelative(p.fechaPostulacion)}
                  </span>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Ofertas recomendadas</h2>
          <Link href="/lead/ofertas" className="text-sm font-medium text-primary hover:underline">
            Ver todas
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {recomendadas.map((oferta) => (
            <OfertaCard
              key={oferta.id}
              oferta={oferta}
              empresa={empresaById.get(oferta.empresaId)}
              postulaciones={conteo.get(oferta.id) ?? 0}
              href="/lead/ofertas"
            />
          ))}
        </div>
      </div>
    </>
  );
}
