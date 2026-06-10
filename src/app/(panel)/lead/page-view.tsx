"use client";

import Link from "next/link";
import { Inbox, CheckCircle2, Contact, ListChecks, Compass, ArrowRight, Clock } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useMyBids } from "@/lib/api/bids";
import { useContacts } from "@/lib/api/contacts";
import { useContactBooks } from "@/lib/api/contact-books";
import { useProposals } from "@/lib/api/proposals";
import { formatNumber } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Button } from "@/components/ui/button";
import { Skeleton, CardsSkeleton } from "@/components/ui/skeleton";
import { Stars } from "@/components/ui/stars";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "@/lib/format";

const BID_STATUS_LABEL: Record<string, { label: string; className: string }> = {
  pending:   { label: "Pendiente",  className: "bg-amber-100 text-amber-700" },
  accepted:  { label: "Aceptado",   className: "bg-emerald-100 text-emerald-700" },
  rejected:  { label: "Rechazado",  className: "bg-red-100 text-red-600" },
  withdrawn: { label: "Retirado",   className: "bg-slate-100 text-slate-600" },
  completed: { label: "Completado", className: "bg-emerald-100 text-emerald-700" },
};

export default function LeadDashboardPage() {
  const { user } = useAuthStore();
  const lm = user?.leadManager;

  const { data: bids = [], isLoading: loadingBids } = useMyBids();
  const { data: contacts = [], isLoading: loadingContacts } = useContacts();
  const { data: books = [], isLoading: loadingBooks } = useContactBooks();
  const { data: marketRes, isLoading: loadingMarket } = useProposals({ pageSize: 3 });

  const pending   = bids.filter((b) => b.status === "pending").length;
  const accepted  = bids.filter((b) => b.status === "accepted").length;
  const completed = bids.filter((b) => b.status === "completed").length;

  const recientes = [...bids]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const recomendadas = marketRes?.data ?? [];
  const firstName = lm?.fullName?.split(" ")[0] ?? user?.email ?? "";

  const isLoading = loadingBids || loadingContacts || loadingBooks;

  if (isLoading) {
    return (
      <>
        <PageHeader title="Mi panel" description="Resumen de tu actividad como conector" />
        <CardsSkeleton />
        <Skeleton className="h-64" />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`Hola, ${firstName}`}
        description="Resumen de tu actividad como conector"
      >
        <Link href="/lead/agenda">
          <Button className="border text-muted-foreground">
            <Contact /> Agenda
          </Button>
        </Link>
        <Link href="/lead/ofertas">
          <Button>
            <Compass /> Explorar ofertas
          </Button>
        </Link>
      </PageHeader>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Inbox}        label="Postulaciones totales" value={formatNumber(bids.length)}   hint={`${pending} pendientes`}  accent="text-sky-600" />
        <KpiCard icon={Clock}        label="Aceptadas"             value={formatNumber(accepted)}       hint="en proceso"               accent="text-violet-600" />
        <KpiCard icon={CheckCircle2} label="Completadas"           value={formatNumber(completed)}      accent="text-emerald-600" />
        <KpiCard icon={Contact}      label="Contactos en agenda"   value={formatNumber(contacts.length)} hint={`${books.length} listas`} accent="text-amber-600" />
      </div>

      {/* Perfil + Agenda */}
      <div className="grid gap-6 lg:grid-cols-2">
        {lm && (
          <Card>
            <CardHeader>
              <CardTitle>Mi reputacion</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-2 py-6 text-center">
              <p className="text-4xl font-bold text-foreground">
                {lm.avgRating ? lm.avgRating.toFixed(1) : "—"}
              </p>
              <Stars value={lm.avgRating ?? 0} size="md" />
              <p className="text-sm text-muted-foreground">
                {lm.reviewCount ?? 0} evaluaciones recibidas
              </p>
              <Link href="/lead/perfil" className="mt-2 text-sm font-medium text-primary hover:underline">
                Ver mi perfil
              </Link>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Agenda y listas</CardTitle>
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
                <p className="text-2xl font-bold text-foreground">{formatNumber(contacts.length)}</p>
                <p className="text-xs text-muted-foreground">Contactos en agenda</p>
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
                <p className="text-2xl font-bold text-foreground">{formatNumber(books.length)}</p>
                <p className="text-xs text-muted-foreground">Listas creadas</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Postulaciones recientes */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Mis postulaciones recientes</CardTitle>
          <Link href="/lead/postulaciones" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            Ver todas <ArrowRight className="size-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="divide-y">
          {recientes.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Aun no has postulado. Explora ofertas para empezar.
            </p>
          ) : (
            recientes.map((bid) => {
              const meta = BID_STATUS_LABEL[bid.status] ?? BID_STATUS_LABEL.pending;
              return (
                <div key={bid.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{bid.proposal.title}</p>
                    <p className="text-xs text-muted-foreground">{bid.contactCount} contacto(s)</p>
                  </div>
                  <Badge className={meta.className}>{meta.label}</Badge>
                  <span className="hidden w-20 text-right text-xs text-muted-foreground sm:block">
                    {formatRelative(bid.createdAt)}
                  </span>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Ofertas recomendadas */}
      {!loadingMarket && recomendadas.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Ofertas disponibles</h2>
            <Link href="/lead/ofertas" className="text-sm font-medium text-primary hover:underline">
              Ver todas
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {recomendadas.map((p) => (
              <Card key={p.id} className="flex flex-col gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-medium text-foreground line-clamp-2">{p.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{p.company.legalName}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{p.bidCount} postulaciones</span>
                  {p.pricePerContact && (
                    <span className="font-semibold text-emerald-600">
                      ${p.pricePerContact.toLocaleString("es-CL")} / contacto
                    </span>
                  )}
                </div>
                <Link href="/lead/ofertas">
                  <Button size="sm" className="border text-muted-foreground w-full">Ver oferta</Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
