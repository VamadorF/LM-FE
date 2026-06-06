import { Badge } from "./badge";
import {
  etapaMeta,
  origenLabel,
  prioridadMeta,
  type EtapaLead,
  type OrigenLead,
  type Prioridad,
} from "@/lib/types";

export function EtapaBadge({ etapa }: { etapa: EtapaLead }) {
  const meta = etapaMeta(etapa);
  return <Badge className={meta.tone}>{meta.label}</Badge>;
}

export function PrioridadBadge({ prioridad }: { prioridad: Prioridad }) {
  const meta = prioridadMeta(prioridad);
  return <Badge className={meta.tone}>{meta.label}</Badge>;
}

export function OrigenBadge({ origen }: { origen: OrigenLead }) {
  return (
    <Badge className="border-slate-200 bg-slate-50 text-slate-600">{origenLabel(origen)}</Badge>
  );
}
