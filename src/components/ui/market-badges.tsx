import { Badge } from "./badge";
import {
  estadoOfertaMeta,
  estadoPostulacionMeta,
  type EstadoOferta,
  type EstadoPostulacion,
} from "@/lib/types";

export function EstadoOfertaBadge({ estado }: { estado: EstadoOferta }) {
  const meta = estadoOfertaMeta(estado);
  return <Badge className={meta.tone}>{meta.label}</Badge>;
}

export function EstadoPostulacionBadge({ estado }: { estado: EstadoPostulacion }) {
  const meta = estadoPostulacionMeta(estado);
  return <Badge className={meta.tone}>{meta.label}</Badge>;
}
