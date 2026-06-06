"use client";

import { Phone, Mail, Users, StickyNote, MessageCircle, type LucideIcon } from "lucide-react";
import type { Actividad, TipoActividad } from "@/lib/types";
import { tipoActividadLabel } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { EmptyState } from "@/components/ui/empty-state";

const ICONS: Record<TipoActividad, LucideIcon> = {
  llamada: Phone,
  email: Mail,
  reunion: Users,
  whatsapp: MessageCircle,
  nota: StickyNote,
};

const TONES: Record<TipoActividad, string> = {
  llamada: "bg-sky-100 text-sky-700",
  email: "bg-violet-100 text-violet-700",
  reunion: "bg-emerald-100 text-emerald-700",
  whatsapp: "bg-teal-100 text-teal-700",
  nota: "bg-amber-100 text-amber-700",
};

export function LeadTimeline({
  actividades,
  agenteNombre,
}: {
  actividades: Actividad[];
  agenteNombre: (id: string) => string;
}) {
  if (actividades.length === 0) {
    return (
      <EmptyState
        icon={StickyNote}
        title="Sin actividades registradas"
        description="Registra llamadas, correos o reuniones para construir el historial."
      />
    );
  }

  return (
    <ol className="relative space-y-5 pl-2">
      {actividades.map((act, i) => {
        const Icon = ICONS[act.tipo];
        return (
          <li key={act.id} className="relative flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={`flex size-9 items-center justify-center rounded-full ${TONES[act.tipo]}`}
              >
                <Icon className="size-4" />
              </span>
              {i < actividades.length - 1 ? (
                <span className="mt-1 w-px flex-1 bg-border" />
              ) : null}
            </div>
            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center justify-between gap-x-3">
                <p className="text-sm font-medium text-foreground">
                  {tipoActividadLabel(act.tipo)}
                </p>
                <time className="text-xs text-muted-foreground">{formatDateTime(act.fecha)}</time>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">{act.descripcion}</p>
              <p className="mt-1 text-xs text-muted-foreground/80">
                Registrado por {agenteNombre(act.agenteId)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
