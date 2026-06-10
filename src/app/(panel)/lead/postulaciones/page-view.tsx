"use client";

import { useMemo, useState } from "react";
import { Inbox } from "lucide-react";
import { useMyBids, useWithdrawBid, type Bid } from "@/lib/api/bids";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatRelative } from "@/lib/format";

const STATUS_META: Record<string, { label: string; className: string }> = {
  pending:   { label: "Pendiente",  className: "bg-amber-100 text-amber-700" },
  accepted:  { label: "Aceptado",   className: "bg-emerald-100 text-emerald-700" },
  rejected:  { label: "Rechazado",  className: "bg-red-100 text-red-600" },
  withdrawn: { label: "Retirado",   className: "bg-slate-100 text-slate-600" },
  completed: { label: "Completado", className: "bg-sky-100 text-sky-700" },
};

const FILTER_OPTIONS = [
  { value: "", label: "Todas" },
  { value: "pending", label: "Pendientes" },
  { value: "accepted", label: "Aceptadas" },
  { value: "completed", label: "Completadas" },
  { value: "rejected", label: "Rechazadas" },
];

export default function LeadPostulacionesPage() {
  const { data: bids = [], isLoading } = useMyBids();
  const withdrawMut = useWithdrawBid();
  const [filter, setFilter] = useState("");
  const [withdrawing, setWithdrawing] = useState<Bid | null>(null);

  const filtered = useMemo(() => {
    const sorted = [...bids].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (!filter) return sorted;
    return sorted.filter((b) => b.status === filter);
  }, [bids, filter]);

  return (
    <>
      <PageHeader title="Mis postulaciones" description={`${bids.length} en total`} />

      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((opt) => (
          <button key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              filter === opt.value
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:bg-secondary text-muted-foreground"
            }`}>
            {opt.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Inbox} title="Sin postulaciones"
          description={filter ? "No hay postulaciones con este filtro." : "Aun no has postulado. Explora las ofertas disponibles."} />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Propuesta</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead className="hidden sm:table-cell">Contactos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="hidden md:table-cell">Fecha</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((bid) => {
                const meta = STATUS_META[bid.status] ?? STATUS_META.pending;
                return (
                  <TableRow key={bid.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {bid.proposal.title}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {bid.leadManager?.fullName ?? "—"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{bid.contactCount}</TableCell>
                    <TableCell>
                      <Badge className={meta.className}>{meta.label}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                      {formatRelative(bid.createdAt)}
                    </TableCell>
                    <TableCell>
                      {bid.status === "pending" && (
                        <Button size="sm" variant="outline"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setWithdrawing(bid)}>
                          Retirar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={!!withdrawing}
        onOpenChange={(v) => { if (!v) setWithdrawing(null); }}
        title="Retirar postulacion"
        description="Retirar esta postulacion? No podras revertir la accion."
        onConfirm={() => {
          if (withdrawing) withdrawMut.mutate(withdrawing.id, { onSuccess: () => setWithdrawing(null) });
        }}
      />
    </>
  );
}
