"use client";

import { useState } from "react";
import Link from "next/link";
import { Megaphone, Inbox, CheckCircle2, Plus, ArrowRight, Users } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useMyProposals } from "@/lib/api/proposals";
import { formatNumber } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Skeleton, CardsSkeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ProposalForm } from "@/components/ofertas/proposal-form";
import { formatRelative } from "@/lib/format";

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  open:      { label: "Abierta",    className: "bg-emerald-100 text-emerald-700" },
  paused:    { label: "Pausada",    className: "bg-amber-100 text-amber-700" },
  closed:    { label: "Cerrada",    className: "bg-slate-100 text-slate-600" },
  completed: { label: "Completada", className: "bg-emerald-100 text-emerald-700" },
  expired:   { label: "Expirada",   className: "bg-red-100 text-red-600" },
};

export default function EmpresaDashboardPage() {
  const { user } = useAuthStore();
  const company = user?.company;
  const [formOpen, setFormOpen] = useState(false);

  const { data: proposals = [], isLoading } = useMyProposals();

  const active    = proposals.filter((p) => p.status === "open").length;
  const totalBids = proposals.reduce((acc, p) => acc + p.bidCount, 0);
  const completed = proposals.filter((p) => p.status === "completed").length;

  const recientes = [...proposals]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  if (isLoading) {
    return (
      <>
        <PageHeader title="Panel de empresa" description="Resumen de tus propuestas y conexiones" />
        <CardsSkeleton />
        <Skeleton className="h-64" />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={company?.tradeName ?? company?.legalName ?? "Mi empresa"}
        description="Resumen de tus propuestas y conexiones"
      >
        <Button onClick={() => setFormOpen(true)}>
          <Plus /> Nueva propuesta
        </Button>
      </PageHeader>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Megaphone}    label="Propuestas activas"  value={formatNumber(active)}       hint={`${proposals.length} en total`}    accent="text-indigo-600" />
        <KpiCard icon={Inbox}        label="Postulaciones"       value={formatNumber(totalBids)}     hint="bids recibidos"                     accent="text-sky-600" />
        <KpiCard icon={CheckCircle2} label="Completadas"         value={formatNumber(completed)}     accent="text-emerald-600" />
        <KpiCard icon={Users}        label="Suscripcion"
          value={company?.subscription?.status === "trialing" ? "Trial" : (company?.subscription?.status ?? "—")}
          accent="text-amber-600"
        />
      </div>

      {/* Propuestas recientes */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Mis propuestas</CardTitle>
          <Link href="/empresa/ofertas" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            Ver todas <ArrowRight className="size-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="divide-y">
          {recientes.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Aun no tienes propuestas. Crea la primera para empezar a recibir postulaciones.
              </p>
              <Button onClick={() => setFormOpen(true)}>
                <Plus /> Crear propuesta
              </Button>
            </div>
          ) : (
            recientes.map((p) => {
              const meta = STATUS_LABEL[p.status] ?? STATUS_LABEL.open;
              return (
                <Link
                  key={p.id}
                  href={`/empresa/ofertas/${p.id}`}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 hover:opacity-80"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{p.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.bidCount} postulacion(es) · {p.contactsNeeded} contactos buscados
                    </p>
                  </div>
                  <Badge className={meta.className}>{meta.label}</Badge>
                  <span className="hidden w-20 text-right text-xs text-muted-foreground sm:block">
                    {formatRelative(p.createdAt)}
                  </span>
                </Link>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Reputacion */}
      {company && (
        <Card>
          <CardHeader>
            <CardTitle>Reputacion de la empresa</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6 py-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">
                {company.avgRating ? company.avgRating.toFixed(1) : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Rating promedio</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">{company.reviewCount ?? 0}</p>
              <p className="text-xs text-muted-foreground">Evaluaciones</p>
            </div>
          </CardContent>
        </Card>
      )}

      <ProposalForm open={formOpen} onOpenChange={setFormOpen} />
    </>
  );
}
