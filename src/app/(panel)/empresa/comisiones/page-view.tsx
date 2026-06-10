"use client";

import { useMemo, useState } from "react";
import { DollarSign, TrendingUp, Users } from "lucide-react";
import { useMyProposals } from "@/lib/api/proposals";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { formatRelative } from "@/lib/format";

export default function EmpresaComisionesPage() {
  const { data: proposals = [], isLoading: loadProps } = useMyProposals();
  const [filterProposal, setFilterProposal] = useState("all");

  const stats = useMemo(() => {
    const filtered = filterProposal === "all"
      ? proposals
      : proposals.filter((p) => p.id === filterProposal);
    const active    = filtered.filter((p) => p.status === "open").length;
    const completed = filtered.filter((p) => p.status === "completed").length;
    const totalBids = filtered.reduce((acc, p) => acc + p.bidCount, 0);
    return { active, completed, totalBids };
  }, [proposals, filterProposal]);

  const filtered = filterProposal === "all"
    ? proposals
    : proposals.filter((p) => p.id === filterProposal);

  return (
    <>
      <PageHeader title="Comisiones" description="Resumen de inversión por propuesta" />

      <div className="flex gap-3 mb-4">
        <Select
          value={filterProposal}
          onChange={(e) => setFilterProposal(e.target.value)}
          className="w-64"
        >
          <option value="all">Todas</option>
          {proposals.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-4">
        <KpiCard icon={TrendingUp} label="Propuestas activas"     value={String(stats.active)}    accent="text-emerald-600" />
        <KpiCard icon={Users}      label="Total de bids"          value={String(stats.totalBids)} accent="text-sky-600" />
        <KpiCard icon={DollarSign} label="Propuestas completadas" value={String(stats.completed)} accent="text-violet-600" />
      </div>

      {loadProps ? (
        <Skeleton className="h-64" />
      ) : filtered.length === 0 ? (
        <EmptyState icon={DollarSign} title="Sin datos" description="No hay propuestas que mostrar." />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Propuesta</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="hidden sm:table-cell">Contactos requeridos</TableHead>
                <TableHead className="hidden sm:table-cell">Precio/c.</TableHead>
                <TableHead>Bids</TableHead>
                <TableHead className="hidden md:table-cell">Creada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell>
                    <Badge className={
                      p.status === "open"      ? "bg-emerald-100 text-emerald-700" :
                      p.status === "completed" ? "bg-sky-100 text-sky-700" :
                      p.status === "expired"   ? "bg-red-100 text-red-600" :
                      "bg-slate-100 text-slate-600"
                    }>
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{p.contactsNeeded}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {p.pricePerContact ? `$${p.pricePerContact.toLocaleString("es-CL")}` : "—"}
                  </TableCell>
                  <TableCell>{p.bidCount}</TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                    {formatRelative(p.createdAt)}
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
