"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, Users, CheckCircle2, Coins, Target } from "lucide-react";
import { useStore, useHydrated } from "@/lib/store";
import {
  postulacionesDeOferta,
  rankingLeads,
  resumirPostulaciones,
} from "@/lib/selectors";
import { comisionLabel } from "@/lib/types";
import { formatCLP, formatNumber } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EstadoOfertaBadge } from "@/components/ui/market-badges";
import { Skeleton } from "@/components/ui/skeleton";
import { PostulacionesTable } from "@/components/postulaciones/postulaciones-table";
import { Leaderboard } from "@/components/ranking/leaderboard";
import { OfertaForm } from "@/components/ofertas/oferta-form";

export default function EmpresaOfertaDetailPage({ ofertaId }: { ofertaId: string }) {
  const hydrated = useHydrated();
  const ofertas = useStore((s) => s.ofertas);
  const postulaciones = useStore((s) => s.postulaciones);
  const leads = useStore((s) => s.leads);
  const [editOpen, setEditOpen] = useState(false);

  const oferta = useMemo(() => ofertas.find((o) => o.id === ofertaId), [ofertas, ofertaId]);

  const ps = useMemo(
    () => (oferta ? postulacionesDeOferta(postulaciones, oferta.id) : []),
    [oferta, postulaciones],
  );
  const resumen = useMemo(() => resumirPostulaciones(ps), [ps]);
  const ranking = useMemo(
    () => (oferta ? rankingLeads(ps, leads, { ofertaId: oferta.id }) : []),
    [ps, leads, oferta],
  );

  if (!hydrated) {
    return <Skeleton className="h-96" />;
  }

  if (!oferta) {
    return (
      <div className="py-16 text-center">
        <p className="font-medium">Oferta no encontrada</p>
        <Link href="/empresa/ofertas" className="mt-3 inline-block text-sm text-primary hover:underline">
          Volver a mis ofertas
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link
        href="/empresa/ofertas"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Volver a mis ofertas
      </Link>

      <PageHeader title={oferta.titulo} description={oferta.categoria}>
        <EstadoOfertaBadge estado={oferta.estado} />
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          <Pencil /> Editar
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniKpi icon={Users} label="Postulaciones" value={formatNumber(resumen.total)} accent="text-sky-600" />
        <MiniKpi icon={Target} label="Seleccionadas" value={formatNumber(resumen.porEstado.seleccionada + resumen.porEstado.en_negociacion)} accent="text-violet-600" />
        <MiniKpi icon={CheckCircle2} label="Transacciones" value={formatNumber(resumen.completadas)} accent="text-emerald-600" />
        <MiniKpi icon={Coins} label="Comisiones" value={formatCLP(resumen.comisiones)} accent="text-amber-600" />
      </div>

      <Tabs defaultValue="bandeja">
        <TabsList>
          <TabsTrigger value="bandeja">Bandeja de postulaciones</TabsTrigger>
          <TabsTrigger value="ranking">Ranking de conectores</TabsTrigger>
          <TabsTrigger value="info">Informacion</TabsTrigger>
        </TabsList>

        <TabsContent value="bandeja">
          <PostulacionesTable postulaciones={ps} oferta={oferta} />
        </TabsContent>

        <TabsContent value="ranking">
          <Card>
            <CardContent className="p-3">
              {ranking.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Aun no hay conectores con postulaciones en esta oferta.
                </p>
              ) : (
                <Leaderboard filas={ranking.slice(0, 50)} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info">
          <Card>
            <CardContent className="space-y-4 p-6">
              <Info label="Descripcion">{oferta.descripcion}</Info>
              <Info label="Que contacto busca">{oferta.criterios}</Info>
              <div className="grid gap-4 sm:grid-cols-3">
                <Info label="Comision">{comisionLabel(oferta)}</Info>
                <Info label="Ticket estimado">{formatCLP(oferta.valorTicketEstimado)}</Info>
                <Info label="Meta de contactos">{formatNumber(oferta.objetivoContactos)}</Info>
                <Info label="Region">{oferta.region}</Info>
                <Info label="Estado">{oferta.estado}</Info>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <OfertaForm open={editOpen} onOpenChange={setEditOpen} oferta={oferta} />
    </>
  );
}

function MiniKpi({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <span className={`flex size-10 items-center justify-center rounded-lg bg-secondary ${accent}`}>
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-xl font-bold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm text-foreground">{children}</p>
    </div>
  );
}
