"use client";

import { useState } from "react";
import { Plus, Eye, Pencil } from "lucide-react";
import { useMyProposals, useUpdateProposalStatus } from "@/lib/api/proposals";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ProposalForm } from "@/components/ofertas/proposal-form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Proposal, ProposalStatus } from "@/lib/api/proposals";
import { useRouter } from "next/navigation";

const STATUS_LABEL: Record<ProposalStatus, string> = {
  open: "Activa",
  paused: "Pausada",
  closed: "Cerrada",
  completed: "Completada",
  expired: "Expirada",
};

const STATUS_COLOR: Record<ProposalStatus, string> = {
  open: "bg-emerald-100 text-emerald-700",
  paused: "bg-amber-100 text-amber-700",
  closed: "bg-slate-100 text-slate-600",
  completed: "bg-sky-100 text-sky-700",
  expired: "bg-red-100 text-red-600",
};

export default function EmpresaOfertasPage() {
  const router = useRouter();
  const { data: proposals = [], isLoading } = useMyProposals();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Proposal | null>(null);
  const statusMut = useUpdateProposalStatus("");

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (p: Proposal) => { setEditing(p); setFormOpen(true); };

  return (
    <>
      <PageHeader title="Mis Propuestas" description="Gestiona las ofertas que has publicado">
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Nueva propuesta</Button>
      </PageHeader>

      <ProposalForm
        open={formOpen}
        onOpenChange={(v) => { setFormOpen(v); if (!v) setEditing(null); }}
        proposal={editing ?? undefined}
      />

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : proposals.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="Sin propuestas"
          description="Crea tu primera propuesta para comenzar a recibir bids."
          action={<Button onClick={openCreate}>Crear propuesta</Button>}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead className="hidden sm:table-cell">Estado</TableHead>
                <TableHead className="hidden md:table-cell">Contactos</TableHead>
                <TableHead className="hidden md:table-cell">Precio/c.</TableHead>
                <TableHead>Bids</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposals.map((p) => (
                <TableRow key={p.id}>
                  <TableCell
                    className="font-medium cursor-pointer hover:text-primary"
                    onClick={() => router.push(`/empresa/ofertas/${p.id}`)}
                  >
                    {p.title}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge className={STATUS_COLOR[p.status]}>{STATUS_LABEL[p.status]}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{p.contactsNeeded}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {p.pricePerContact ? `$${p.pricePerContact.toLocaleString("es-CL")}` : "—"}
                  </TableCell>
                  <TableCell>{p.bidCount}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon"
                        onClick={() => router.push(`/empresa/ofertas/${p.id}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {p.status === "open" && (
                        <Button variant="ghost" size="sm"
                          onClick={() => useUpdateProposalStatus(p.id)}>
                          Pausar
                        </Button>
                      )}
                    </div>
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
