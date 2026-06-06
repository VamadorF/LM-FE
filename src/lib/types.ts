export type Rol = "publico" | "empresa" | "lead";

export type EstadoOferta = "borrador" | "activa" | "pausada" | "cerrada";

export type TipoComision = "porcentaje" | "fijo";

export type EstadoPostulacion =
  | "postulada"
  | "en_revision"
  | "seleccionada"
  | "rechazada"
  | "en_negociacion"
  | "completada";

export type ActorTipo = "empresa" | "lead";

export interface Empresa {
  id: string;
  nombre: string;
  rubro: string;
  descripcion: string;
  sitioWeb: string;
  comuna: string;
  region: string;
  verificada: boolean;
  fechaIngreso: string;
}

export interface Lead {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  comuna: string;
  region: string;
  bio: string;
  fechaIngreso: string;
}

export interface Oferta {
  id: string;
  empresaId: string;
  slug: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  estado: EstadoOferta;
  tipoComision: TipoComision;
  valorComision: number;
  valorTicketEstimado: number;
  objetivoContactos: number;
  criterios: string;
  region: string;
  destacada: boolean;
  fechaInicio: string;
  fechaCierre: string;
}

export interface ContactoPostulado {
  nombre: string;
  email: string;
  telefono: string;
  empresa: string;
  rut: string;
  comuna: string;
  region: string;
  notas: string;
}

export interface Contacto {
  id: string;
  leadId: string;
  nombre: string;
  email: string;
  telefono: string;
  empresa: string;
  rut: string;
  comuna: string;
  region: string;
  notas: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface Lista {
  id: string;
  leadId: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  contactoIds: string[];
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface Postulacion {
  id: string;
  ofertaId: string;
  leadId: string;
  contactoId: string;
  listaId: string | null;
  /** Pitch del conector: por que este contacto encaja con la oferta */
  mensaje: string;
  contacto: ContactoPostulado;
  estado: EstadoPostulacion;
  valorTransaccion: number | null;
  comision: number | null;
  fechaPostulacion: string;
  fechaActualizacion: string;
}

export function contactoToSnapshot(contacto: Contacto): ContactoPostulado {
  return {
    nombre: contacto.nombre,
    email: contacto.email,
    telefono: contacto.telefono,
    empresa: contacto.empresa,
    rut: contacto.rut,
    comuna: contacto.comuna,
    region: contacto.region,
    notas: contacto.notas,
  };
}

export interface Rating {
  id: string;
  ofertaId: string;
  postulacionId: string;
  deTipo: ActorTipo;
  deId: string;
  paraTipo: ActorTipo;
  paraId: string;
  estrellas: number;
  comentario: string;
  fecha: string;
}

export interface EstadoOfertaMeta {
  value: EstadoOferta;
  label: string;
  tone: string;
}

export const ESTADOS_OFERTA: EstadoOfertaMeta[] = [
  { value: "borrador", label: "Borrador", tone: "bg-slate-100 text-slate-600 border-slate-200" },
  { value: "activa", label: "Activa", tone: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "pausada", label: "Pausada", tone: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "cerrada", label: "Cerrada", tone: "bg-rose-100 text-rose-700 border-rose-200" },
];

export interface EstadoPostulacionMeta {
  value: EstadoPostulacion;
  label: string;
  tone: string;
  abierta: boolean;
}

export const ESTADOS_POSTULACION: EstadoPostulacionMeta[] = [
  { value: "postulada", label: "Postulada", tone: "bg-sky-100 text-sky-700 border-sky-200", abierta: true },
  { value: "en_revision", label: "En revision", tone: "bg-indigo-100 text-indigo-700 border-indigo-200", abierta: true },
  { value: "seleccionada", label: "Seleccionada", tone: "bg-violet-100 text-violet-700 border-violet-200", abierta: true },
  { value: "en_negociacion", label: "En negociacion", tone: "bg-amber-100 text-amber-700 border-amber-200", abierta: true },
  { value: "completada", label: "Completada", tone: "bg-emerald-100 text-emerald-700 border-emerald-200", abierta: false },
  { value: "rechazada", label: "Rechazada", tone: "bg-rose-100 text-rose-700 border-rose-200", abierta: false },
];

export const CATEGORIAS = [
  "Tecnologia",
  "Construccion",
  "Salud",
  "Retail",
  "Servicios financieros",
  "Educacion",
  "Logistica",
  "Energia",
  "Agroindustria",
  "Turismo",
] as const;

export const CATEGORIAS_LISTA = [
  "Red personal",
  "Clientes actuales",
  "Prospectos frios",
  "Ex companeros",
  "Proveedores",
  "Tecnologia",
  "Construccion",
  "Salud",
  "Retail",
  "Servicios financieros",
] as const;

export function estadoOfertaMeta(value: EstadoOferta): EstadoOfertaMeta {
  return ESTADOS_OFERTA.find((e) => e.value === value) ?? ESTADOS_OFERTA[0];
}

export function estadoPostulacionMeta(value: EstadoPostulacion): EstadoPostulacionMeta {
  return ESTADOS_POSTULACION.find((e) => e.value === value) ?? ESTADOS_POSTULACION[0];
}

export function comisionLabel(oferta: Pick<Oferta, "tipoComision" | "valorComision">): string {
  return oferta.tipoComision === "porcentaje"
    ? `${oferta.valorComision}%`
    : `$${oferta.valorComision.toLocaleString("es-CL")}`;
}

export function calcularComision(
  oferta: Pick<Oferta, "tipoComision" | "valorComision">,
  valorTransaccion: number,
): number {
  if (oferta.tipoComision === "fijo") return oferta.valorComision;
  return Math.round((valorTransaccion * oferta.valorComision) / 100);
}
