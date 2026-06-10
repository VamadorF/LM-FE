"use client";

import { useMemo } from "react";
import { Wallet } from "lucide-react";
import { useMyBids } from "@/lib/api/bids";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "@/lib/format";

export default function LeadComisionesPage() {
  const { data: bids = [], isLoading } = useMyBids();

  const completados = useMemo(() =>
    bids
      .filter((b) => b.status === "completed")
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [bids]
  );

  const totalGanado = useMemo(() =>
    completados.reduce((acc, b) => acc + (b.totalPrice ?? 0), 0),
    [completados]
  );

  const pendientesCobro = useMemo(() =>
    bids.filter((b) => b.status === "accepted").length,
    [bids]
  );

  return (
    <>
      <PageHeader title="Comisiones" description="Historial de bids completados" />

      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard icon={Wallet} label="Total ganado"      value={`$${totalGanado.toLocaleString("es-CL")}`} accent="text-emerald-600" />
        <KpiCard icon={Wallet} label="Bids completados"  value={String(completados.length)}                accent="text-sky-600" />
        <KpiCard icon={Wallet} label="Bids aceptados"    value={String(pendientesCobro)} hint="en proceso" accent="text-amber-600" />
      </div>

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : completados.length === 0 ? (
        <EmptyState icon={Wallet} title="Sin comisiones aun"
          description="Las comisiones aparecen cuando una empresa marca un bid como completado." />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Propuesta</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead className="hidden sm:table-cell">Contactos</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="hidden md:table-cell">Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completados.map((bid) => (
                <TableRow key={bid.id}>
                  <TableCell className="font-medium">{bid.proposal.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {bid.leadManager?.fullName ?? "—"}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{bid.contactCount}</TableCell>
                  <TableCell className="font-semibold text-emerald-600">
                    {bid.totalPrice ? `$${bid.totalPrice.toLocaleString("es-CL")}` : "—"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                    {formatRelative(bid.updatedAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
