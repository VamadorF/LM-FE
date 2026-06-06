"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useHydrated, useStore } from "@/lib/store";
import { valorPipeline } from "@/lib/selectors";
import { formatCLP } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { KanbanBoard } from "@/components/pipeline/kanban";
import { LeadForm } from "@/components/leads/lead-form";

export default function PipelinePage() {
  const hydrated = useHydrated();
  const leads = useStore((s) => s.leads);
  const [formOpen, setFormOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Pipeline"
        description={
          hydrated
            ? `${formatCLP(valorPipeline(leads))} en oportunidades abiertas`
            : "Tablero de oportunidades por etapa"
        }
      >
        <Button onClick={() => setFormOpen(true)}>
          <Plus /> Nuevo lead
        </Button>
      </PageHeader>

      {!hydrated ? (
        <div className="flex gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-96 w-72 shrink-0" />
          ))}
        </div>
      ) : (
        <KanbanBoard />
      )}

      <LeadForm open={formOpen} onOpenChange={setFormOpen} />
    </>
  );
}
