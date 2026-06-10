"use client";

import { useState } from "react";
import { User, Star, Search } from "lucide-react";
import { useProposalBids } from "@/lib/api/bids";
import { useMyProposals } from "@/lib/api/proposals";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function EmpresaConectoresPage() {
  const { data: proposals = [], isLoading: loadProps } = useMyProposals();
  const [selectedProposalId, setSelectedProposalId] = useState<string>("");
  const [search, setSearch] = useState("");

  const { data: bids = [], isLoading: loadBids } = useProposalBids(selectedProposalId);

  const connectors = bids.filter(
    (b) =>
      b.status !== "withdrawn" &&
      b.leadManager.fullName.toLowerCase().includes(search.toLowerCase()),
  );

  const isLoading = loadProps || (!!selectedProposalId && loadBids);

  return (
    <>
      <PageHeader
        title="Conectores"
        description="Lead managers que han postulado a tus propuestas"
      />

      <div className="flex gap-3 flex-col sm:flex-row mb-4">
        <Select
          value={selectedProposalId}
          onChange={(e) => setSelectedProposalId(e.target.value)}
          className="sm:w-72"
        >
          <option value="">Selecciona una propuesta</option>
          {proposals.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </Select>
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {!selectedProposalId ? (
        <EmptyState icon={User} title="Selecciona una propuesta"
          description="Elige una propuesta para ver los lead managers que postularon." />
      ) : isLoading ? (
        <Skeleton className="h-64" />
      ) : connectors.length === 0 ? (
        <EmptyState icon={User} title="Sin conectores"
          description="Nadie ha postulado a esta propuesta aún." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {connectors.map((bid) => {
            const lm = bid.leadManager;
            return (
              <Card key={bid.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{lm.fullName}</p>
                        {lm.avgRating != null && (
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {lm.avgRating.toFixed(1)}
                            {lm.reviewCount != null && ` (${lm.reviewCount})`}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge className={
                      bid.status === "accepted"  ? "bg-emerald-100 text-emerald-700" :
                      bid.status === "pending"   ? "bg-amber-100 text-amber-700" :
                      bid.status === "completed" ? "bg-sky-100 text-sky-700" :
                      "bg-slate-100 text-slate-600"
                    }>
                      {bid.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{bid.pitch}</p>
                  <div className="mt-3 flex gap-3 text-xs text-muted-foreground">
                    <span>{bid.contactCount} contacto{bid.contactCount !== 1 ? "s" : ""}</span>
                    {bid.totalPrice && (
                      <span className="font-semibold text-foreground">
                        ${bid.totalPrice.toLocaleString("es-CL")}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
