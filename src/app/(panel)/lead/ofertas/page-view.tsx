"use client";

import { useState } from "react";
import { Compass } from "lucide-react";
import { useProposals } from "@/lib/api/proposals";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BidDialog } from "@/components/ofertas/bid-dialog";
import type { Proposal } from "@/lib/api/proposals";

export default function LeadOfertasPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Proposal | null>(null);
  const PAGE_SIZE = 12;

  const { data, isLoading } = useProposals({ page, pageSize: PAGE_SIZE });
  const proposals = data?.data ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.ceil(total / PAGE_SIZE);

  const filtered = search.trim()
    ? proposals.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.company.legalName.toLowerCase().includes(search.toLowerCase())
      )
    : proposals;

  return (
    <>
      <PageHeader title="Explorar ofertas" description={`${total} propuesta(s) disponibles`} />

      <Input
        className="max-w-sm"
        placeholder="Buscar por titulo o empresa..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Compass} title="Sin propuestas" description="No hay propuestas disponibles en este momento." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Card key={p.id} className="flex flex-col gap-3 p-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-foreground line-clamp-2">{p.title}</p>
                  <Badge className="bg-secondary text-secondary-foreground shrink-0">Abierta</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{p.company.legalName}</p>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">{p.description}</p>
              <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                <span>{p.contactsNeeded} contactos buscados</span>
                <span>{p.bidCount} postulaciones</span>
                {p.pricePerContact && (
                  <span className="col-span-2 font-semibold text-emerald-600">
                    ${p.pricePerContact.toLocaleString("es-CL")} / contacto
                  </span>
                )}
                {p.locationCity && <span>{p.locationCity}{p.locationCountry ? `, ${p.locationCountry}` : ""}</span>}
              </div>
              <Button size="sm" className="mt-auto w-full" onClick={() => setSelected(p)}>
                Postular
              </Button>
            </Card>
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button className="border text-muted-foreground" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">Pagina {page} de {pageCount}</span>
          <Button className="border text-muted-foreground" size="sm" disabled={page === pageCount} onClick={() => setPage((p) => p + 1)}>
            Siguiente
          </Button>
        </div>
      )}

      {selected && (
        <BidDialog
          proposal={selected}
          open={!!selected}
          onOpenChange={(v) => { if (!v) setSelected(null); }}
        />
      )}
    </>
  );
}
