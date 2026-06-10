"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle, XCircle, Loader2, User, Star } from "lucide-react";
import { useProposal } from "@/lib/api/proposals";
import { useProposalBids, useAcceptBid, useRejectBid, useBidContacts } from "@/lib/api/bids";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelative } from "@/lib/format";
import type { Bid } from "@/lib/api/bids";

function BidRow({ bid }: { bid: Bid }) {
  const acceptMut = useAcceptBid();
  const rejectMut = useRejectBid();
  const [expanded, setExpanded] = useState(false);
  const { data: contacts = [], isFetching } = useBidContacts(bid.id);

  const isPending = bid.status === "pending";

  return (
    <Card className="mb-3">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-base">{bid.leadManager.fullName}</CardTitle>
              {bid.leadManager.avgRating != null && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {bid.leadManager.avgRating.toFixed(1)}
                  {bid.leadManager.reviewCount != null && ` (${bid.leadManager.reviewCount})`}
                </p>
              )}
            </div>
          </div>
          <Badge className={
            bid.status === "accepted" ? "bg-emerald-100 text-emerald-700" :
            bid.status === "rejected" ? "bg-red-100 text-red-600" :
            bid.status === "pending"  ? "bg-amber-100 text-amber-700" :
            "bg-slate-100 text-slate-600"
          }>
            {bid.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{bid.pitch}</p>
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span>{bid.contactCount} contacto{bid.contactCount !== 1 ? "s" : ""}</span>
          {bid.totalPrice && <span className="font-semibold text-foreground">${bid.totalPrice.toLocaleString("es-CL")}</span>}
          <span>{formatRelative(bid.createdAt)}</span>
        </div>

        <div className="flex gap-2 flex-wrap">
          {isPending && (
            <>
              <Button
                size="sm"
                variant="default"
                disabled={acceptMut.isPending}
                onClick={() => acceptMut.mutate(bid.id)}
              >
                {acceptMut.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                Aceptar
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={rejectMut.isPending}
                onClick={() => rejectMut.mutate(bid.id)}
              >
                {rejectMut.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <XCircle className="h-4 w-4 mr-1" />}
                Rechazar
              </Button>
            </>
          )}
          <Button size="sm" variant="ghost" onClick={() => setExpanded((v) => !v)}>
            {expanded ? "Ocultar contactos" : "Ver contactos"}
          </Button>
        </div>

        {expanded && (
          <div className="mt-2 rounded-md border p-3 text-sm">
            {isFetching ? (
              <Skeleton className="h-20" />
            ) : contacts.length === 0 ? (
              <p className="text-muted-foreground text-xs">Sin contactos disponibles.</p>
            ) : (
              <ul className="space-y-1">
                {contacts.map((c) => (
                  <li key={c.id} className="flex gap-2">
                    <span className="font-medium">{c.firstName} {c.lastName}</span>
                    <span className="text-muted-foreground">{c.age} años</span>
                    {c.city && <span className="text-muted-foreground">· {c.city}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function EmpresaOfertaDetallePage() {
  const { id } = useParams<{ id: string }>();
  const { data: proposal, isLoading: loadProp } = useProposal(id);
  const { data: bids = [], isLoading: loadBids } = useProposalBids(id);

  if (loadProp || loadBids) return <Skeleton className="h-96 mt-4" />;
  if (!proposal) return <p className="text-muted-foreground mt-8">Propuesta no encontrada.</p>;

  const pending   = bids.filter((b) => b.status === "pending");
  const accepted  = bids.filter((b) => b.status === "accepted");
  const rest      = bids.filter((b) => b.status !== "pending" && b.status !== "accepted");

  return (
    <>
      <PageHeader
        title={proposal.title}
        description={`${proposal.bidCount} bid${proposal.bidCount !== 1 ? "s" : ""} · ${proposal.contactsNeeded} contactos requeridos`}
      />

      {bids.length === 0 ? (
        <EmptyState icon={User} title="Sin bids aún" description="Los lead managers aún no han postulado." />
      ) : (
        <>
          {pending.length > 0 && (
            <section className="mb-6">
              <h2 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Pendientes ({pending.length})</h2>
              {pending.map((b) => <BidRow key={b.id} bid={b} />)}
            </section>
          )}
          {accepted.length > 0 && (
            <section className="mb-6">
              <h2 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Aceptados ({accepted.length})</h2>
              {accepted.map((b) => <BidRow key={b.id} bid={b} />)}
            </section>
          )}
          {rest.length > 0 && (
            <section>
              <h2 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Historial ({rest.length})</h2>
              {rest.map((b) => <BidRow key={b.id} bid={b} />)}
            </section>
          )}
        </>
      )}
    </>
  );
}
