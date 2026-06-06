export type EtapaLead =
  | "nuevo"
  | "contactado"
  | "calificado"
  | "propuesta"
  | "negociacion"
  | "ganado"
  | "perdido";

export type OrigenLead = "web" | "llamada" | "feria" | "referido" | "redes" | "email";

export type Prioridad = "baja" | "media" | "alta";

export type EstadoReferidor = "activo" | "inactivo";

export type TipoActividad = "llamada" | "email" | "reunion" | "nota" | "whatsapp";

export type RolAgente = "ejecutivo" | "senior" | "lider";

export interface Lead {
  id: string;
  nombre: string;
  empresa: string;
  rut: string;
  email: string;
  telefono: string;
  comuna: string;
  region: string;
  valorEstimado: number;
  etapa: EtapaLead;
  origen: OrigenLead;
  referidorId: string | null;
  agenteId: string;
  prioridad: Prioridad;
  etiquetas: string[];
  notas: string;
  fechaCreacion: string;
  ultimaActividad: string;
}

export interface Referidor {
  id: string;
  nombre: string;
  relacion: string;
  email: string;
  telefono: string;
  porcentajeComision: number;
  estado: EstadoReferidor;
  fechaIngreso: string;
  notas: string;
}

export interface Agente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  rol: RolAgente;
  metaMensual: number;
  fechaIngreso: string;
}

export interface Actividad {
  id: string;
  leadId: string;
  agenteId: string;
  tipo: TipoActividad;
  descripcion: string;
  fecha: string;
}

export interface EtapaMeta {
  value: EtapaLead;
  label: string;
  tone: string;
  abierta: boolean;
}

export const ETAPAS: EtapaMeta[] = [
  { value: "nuevo", label: "Nuevo", tone: "bg-sky-100 text-sky-700 border-sky-200", abierta: true },
  { value: "contactado", label: "Contactado", tone: "bg-indigo-100 text-indigo-700 border-indigo-200", abierta: true },
  { value: "calificado", label: "Calificado", tone: "bg-violet-100 text-violet-700 border-violet-200", abierta: true },
  { value: "propuesta", label: "Propuesta", tone: "bg-amber-100 text-amber-700 border-amber-200", abierta: true },
  { value: "negociacion", label: "Negociacion", tone: "bg-orange-100 text-orange-700 border-orange-200", abierta: true },
  { value: "ganado", label: "Ganado", tone: "bg-emerald-100 text-emerald-700 border-emerald-200", abierta: false },
  { value: "perdido", label: "Perdido", tone: "bg-rose-100 text-rose-700 border-rose-200", abierta: false },
];

export const ETAPAS_PIPELINE: EtapaLead[] = [
  "nuevo",
  "contactado",
  "calificado",
  "propuesta",
  "negociacion",
  "ganado",
];

export const ORIGENES: { value: OrigenLead; label: string }[] = [
  { value: "web", label: "Sitio web" },
  { value: "llamada", label: "Llamada" },
  { value: "feria", label: "Feria / Evento" },
  { value: "referido", label: "Referido" },
  { value: "redes", label: "Redes sociales" },
  { value: "email", label: "Campana email" },
];

export const PRIORIDADES: { value: Prioridad; label: string; tone: string }[] = [
  { value: "baja", label: "Baja", tone: "bg-slate-100 text-slate-600 border-slate-200" },
  { value: "media", label: "Media", tone: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "alta", label: "Alta", tone: "bg-rose-100 text-rose-700 border-rose-200" },
];

export const TIPOS_ACTIVIDAD: { value: TipoActividad; label: string }[] = [
  { value: "llamada", label: "Llamada" },
  { value: "email", label: "Email" },
  { value: "reunion", label: "Reunion" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "nota", label: "Nota" },
];

export const ROLES_AGENTE: { value: RolAgente; label: string }[] = [
  { value: "ejecutivo", label: "Ejecutivo" },
  { value: "senior", label: "Senior" },
  { value: "lider", label: "Lider de equipo" },
];

export function etapaMeta(value: EtapaLead): EtapaMeta {
  return ETAPAS.find((e) => e.value === value) ?? ETAPAS[0];
}

export function origenLabel(value: OrigenLead): string {
  return ORIGENES.find((o) => o.value === value)?.label ?? value;
}

export function prioridadMeta(value: Prioridad) {
  return PRIORIDADES.find((p) => p.value === value) ?? PRIORIDADES[0];
}

export function rolLabel(value: RolAgente): string {
  return ROLES_AGENTE.find((r) => r.value === value)?.label ?? value;
}

export function tipoActividadLabel(value: TipoActividad): string {
  return TIPOS_ACTIVIDAD.find((t) => t.value === value)?.label ?? value;
}
