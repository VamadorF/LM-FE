"use client";

import { useMemo } from "react";
import { BarChart3, CheckCircle, Clock, XCircle } from "lucide-react";
import { useMyProposals } from "@/lib/api/proposals";
import { useAuthStore } from "@/lib/auth-store";
import { useLeadManagerReviews } from "@/lib/api/reviews";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmpresaReportesPage() {
  const { user } = useAuthStore();
  const companyId = user?.company?.id ?? "";
  const { data: proposals = [], isLoading } = useMyProposals();

  const stats = useMemo(() => {
    const open      = proposals.filter((p) => p.status === "open");
    const paused    = proposals.filter((p) => p.status === "paused");
    const completed = proposals.filter((p) => p.status === "completed");
    const expired   = proposals.filter((p) => p.status === "expired");
    const totalBids = proposals.reduce((acc, p) => acc + p.bidCount, 0);

    // Proposal with most bids
    const topProposal = [...proposals].sort((a, b) => b.bidCount - a.bidCount)[0];

    return { open, paused, completed, expired, totalBids, topProposal };
  }, [proposals]);

  return (
    <>
      <PageHeader title="Reportes" description="Métricas de actividad de tu empresa" />

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard icon={CheckCircle} label="Propuestas activas"    value={String(stats.open.length)}      accent="text-emerald-600" />
            <KpiCard icon={Clock}       label="Pausadas"               value={String(stats.paused.length)}    accent="text-amber-600" />
            <KpiCard icon={CheckCircle} label="Completadas"            value={String(stats.completed.length)} accent="text-sky-600" />
            <KpiCard icon={XCircle}     label="Expiradas"              value={String(stats.expired.length)}   accent="text-red-500" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 mt-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Bids recibidos</CardTitle></CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{stats.totalBids}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  en {proposals.length} propuesta{proposals.length !== 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>

            {stats.topProposal && (
              <Card>
                <CardHeader><CardTitle className="text-base">Propuesta más popular</CardTitle></CardHeader>
                <CardContent>
                  <p className="font-semibold">{stats.topProposal.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stats.topProposal.bidCount} bid{stats.topProposal.bidCount !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats.topProposal.contactsNeeded} contactos requeridos ·{" "}
                    {stats.topProposal.pricePerContact
                      ? `$${stats.topProposal.pricePerContact.toLocaleString("es-CL")}/c.`
                      : "precio no definido"}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {proposals.length === 0 && (
            <div className="rounded-xl border p-8 text-center text-muted-foreground mt-4">
              <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>Aún no hay datos para mostrar. Crea tu primera propuesta.</p>
            </div>
          )}
        </>
      )}
    </>
  );
}
