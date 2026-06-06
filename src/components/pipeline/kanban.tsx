"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
import { useStore } from "@/lib/store";
import { ETAPAS, ETAPAS_PIPELINE, etapaMeta, type EtapaLead, type Lead } from "@/lib/types";
import { formatCompactCLP } from "@/lib/format";
import { Avatar } from "@/components/ui/avatar";
import { PrioridadBadge } from "@/components/ui/badges";
import { cn } from "@/lib/utils";

function CardInner({ lead, dragging }: { lead: Lead; dragging?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-3 shadow-sm",
        dragging && "rotate-2 shadow-lg ring-2 ring-primary/40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/leads/${lead.id}`}
          onClick={(e) => e.stopPropagation()}
          className="min-w-0 hover:text-primary"
        >
          <p className="truncate text-sm font-medium text-foreground">{lead.nombre}</p>
          <p className="truncate text-xs text-muted-foreground">{lead.empresa}</p>
        </Link>
        <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground" />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {formatCompactCLP(lead.valorEstimado)}
        </span>
        <PrioridadBadge prioridad={lead.prioridad} />
      </div>
      <div className="mt-2 flex items-center gap-2 border-t pt-2">
        <Avatar name={lead.nombre} className="size-6 text-[10px]" />
        <span className="truncate text-xs text-muted-foreground">{lead.comuna}</span>
      </div>
    </div>
  );
}

function DraggableCard({ lead }: { lead: Lead }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: lead.id,
    data: { etapa: lead.etapa },
  });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn("touch-none", isDragging && "opacity-40")}
    >
      <CardInner lead={lead} />
    </div>
  );
}

function Column({ etapa, leads }: { etapa: EtapaLead; leads: Lead[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: etapa });
  const meta = etapaMeta(etapa);
  const total = leads.reduce((acc, l) => acc + l.valorEstimado, 0);

  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="flex items-center justify-between px-1 pb-2">
        <div className="flex items-center gap-2">
          <span className={cn("rounded-full border px-2 py-0.5 text-xs font-semibold", meta.tone)}>
            {meta.label}
          </span>
          <span className="text-xs font-medium text-muted-foreground">{leads.length}</span>
        </div>
        <span className="text-xs text-muted-foreground">{formatCompactCLP(total)}</span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[120px] flex-1 flex-col gap-2 rounded-xl border border-dashed p-2 transition-colors",
          isOver ? "border-primary bg-accent/40" : "bg-secondary/40",
        )}
      >
        {leads.map((lead) => (
          <DraggableCard key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  );
}

export function KanbanBoard() {
  const leads = useStore((s) => s.leads);
  const moverEtapa = useStore((s) => s.moverEtapa);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const porEtapa = useMemo(() => {
    const map = new Map<EtapaLead, Lead[]>();
    for (const etapa of ETAPAS_PIPELINE) map.set(etapa, []);
    for (const lead of leads) {
      if (map.has(lead.etapa)) map.get(lead.etapa)!.push(lead);
    }
    return map;
  }, [leads]);

  const activeLead = leads.find((l) => l.id === activeId) ?? null;

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const overId = String(over.id);
    const lead = leads.find((l) => l.id === active.id);
    if (!lead) return;

    let destino: EtapaLead | null = null;
    if (ETAPAS.some((et) => et.value === overId)) {
      destino = overId as EtapaLead;
    } else {
      const overLead = leads.find((l) => l.id === overId);
      if (overLead) destino = overLead.etapa;
    }
    if (destino && destino !== lead.etapa) {
      moverEtapa(lead.id, destino);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {ETAPAS_PIPELINE.map((etapa) => (
          <Column key={etapa} etapa={etapa} leads={porEtapa.get(etapa) ?? []} />
        ))}
      </div>
      <DragOverlay>
        {activeLead ? (
          <div className="w-64">
            <CardInner lead={activeLead} dragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
