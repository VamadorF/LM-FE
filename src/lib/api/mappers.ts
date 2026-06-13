import type {
  Contacto,
  Empresa,
  EstadoOferta,
  Lead,
  Lista,
  Oferta,
  TipoComision,
} from "../types";
import {
  getContactoExtras,
  getListaExtras,
  getOfertaExtras,
  setContactoExtras,
  setListaExtras,
  setOfertaExtras,
  type ContactoExtras,
  type ListaExtras,
  type OfertaExtras,
} from "./extras";
import type {
  BackendCompany,
  BackendContact,
  BackendContactBook,
  BackendContactBookEntry,
  BackendLeadManager,
  BackendProposal,
  BackendProposalStatus,
} from "./types";

const DEFAULT_AGE = 35;
const DEFAULT_INTERESTS = ["General"];

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export function splitNombre(nombre: string): { firstName: string; lastName: string } {
  const parts = nombre.trim().split(/\s+/);
  if (parts.length <= 1) return { firstName: parts[0] ?? "Sin", lastName: "Nombre" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export function joinNombre(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

export function contactoToCreateDto(
  data: Omit<Contacto, "id" | "fechaCreacion" | "fechaActualizacion">,
) {
  const { firstName, lastName } = splitNombre(data.nombre);
  return {
    firstName,
    lastName,
    email: data.email || undefined,
    phone: data.telefono || undefined,
    age: DEFAULT_AGE,
    city: data.comuna || undefined,
    country: data.region || "Chile",
    interests: DEFAULT_INTERESTS,
    privateNotes: data.notas || undefined,
    isActive: true,
  };
}

export function contactoToUpdateDto(patch: Partial<Contacto>) {
  const dto: Record<string, unknown> = {};
  if (patch.nombre !== undefined) {
    const { firstName, lastName } = splitNombre(patch.nombre);
    dto.firstName = firstName;
    dto.lastName = lastName;
  }
  if (patch.email !== undefined) dto.email = patch.email || undefined;
  if (patch.telefono !== undefined) dto.phone = patch.telefono || undefined;
  if (patch.comuna !== undefined) dto.city = patch.comuna || undefined;
  if (patch.region !== undefined) dto.country = patch.region || "Chile";
  if (patch.notas !== undefined) dto.privateNotes = patch.notas || undefined;
  return dto;
}

export function mapBackendContact(
  c: BackendContact,
  leadId: string,
  extras?: ContactoExtras,
): Contacto {
  const merged = extras ?? getContactoExtras(c.id);
  return {
    id: c.id,
    leadId,
    nombre: joinNombre(c.firstName, c.lastName),
    email: c.email ?? "",
    telefono: c.phone ?? "",
    empresa: merged.empresa ?? "",
    rut: merged.rut ?? "",
    comuna: c.city ?? "",
    region: c.country ?? "Chile",
    notas: c.privateNotes ?? "",
    fechaCreacion: c.createdAt,
    fechaActualizacion: c.updatedAt,
  };
}

export function mapBackendContactBook(
  book: BackendContactBook,
  leadId: string,
  contactoIds: string[],
  extras?: ListaExtras,
): Lista {
  const merged = extras ?? getListaExtras(book.id);
  return {
    id: book.id,
    leadId,
    nombre: book.name,
    categoria: merged.categoria ?? "Red personal",
    descripcion: book.description ?? "",
    contactoIds,
    fechaCreacion: book.createdAt,
    fechaActualizacion: book.updatedAt,
  };
}

function mapProposalStatus(status: BackendProposalStatus): EstadoOferta {
  switch (status) {
    case "open":
      return "activa";
    case "paused":
      return "pausada";
    case "closed":
    case "completed":
    case "expired":
      return "cerrada";
    default:
      return "activa";
  }
}

function mapEstadoToBackend(estado: EstadoOferta): BackendProposalStatus | null {
  switch (estado) {
    case "activa":
      return "open";
    case "pausada":
      return "paused";
    case "cerrada":
      return "closed";
    case "borrador":
      return null;
    default:
      return "open";
  }
}

export function mapBackendProposal(
  p: BackendProposal,
  extras?: OfertaExtras,
): Oferta {
  const merged = extras ?? getOfertaExtras(p.id);
  const price =
    p.pricePerContact != null ? Number(p.pricePerContact) : merged.valorComision ?? 0;
  const tipoComision: TipoComision = merged.tipoComision ?? (price > 0 ? "fijo" : "porcentaje");

  return {
    id: p.id,
    empresaId: p.companyId,
    slug:
      merged.slug ??
      `${slug(p.title)}-${p.id.slice(0, 8)}`,
    titulo: p.title,
    descripcion: p.description,
    categoria: merged.categoria ?? p.requiredInterests[0] ?? "General",
    estado: merged.estado ?? mapProposalStatus(p.status),
    tipoComision,
    valorComision: merged.valorComision ?? (tipoComision === "fijo" ? price : 5),
    valorTicketEstimado: merged.valorTicketEstimado ?? 5_000_000,
    objetivoContactos: p.contactsNeeded,
    criterios: merged.criterios ?? p.description,
    region: merged.region ?? p.locationCountry ?? "Todo Chile",
    destacada: merged.destacada ?? false,
    fechaInicio: p.createdAt,
    fechaCierre: p.expiresAt ?? new Date(Date.now() + 60 * 864e5).toISOString(),
  };
}

export function ofertaToCreateDto(
  data: Omit<Oferta, "id" | "slug" | "fechaInicio">,
) {
  return {
    title: data.titulo,
    description: data.descripcion,
    contactsNeeded: data.objetivoContactos,
    requiredInterests: data.categoria ? [data.categoria] : DEFAULT_INTERESTS,
    locationCountry: data.region !== "Todo Chile" ? data.region : "Chile",
    pricePerContact:
      data.tipoComision === "fijo" ? data.valorComision : undefined,
    expiresAt: data.fechaCierre ? new Date(data.fechaCierre).toISOString() : undefined,
  };
}

export function ofertaToUpdateDto(patch: Partial<Oferta>) {
  const dto: Record<string, unknown> = {};
  if (patch.titulo !== undefined) dto.title = patch.titulo;
  if (patch.descripcion !== undefined) dto.description = patch.descripcion;
  if (patch.objetivoContactos !== undefined) dto.contactsNeeded = patch.objetivoContactos;
  if (patch.categoria !== undefined) dto.requiredInterests = [patch.categoria];
  if (patch.region !== undefined) {
    dto.locationCountry = patch.region !== "Todo Chile" ? patch.region : "Chile";
  }
  if (patch.tipoComision === "fijo" && patch.valorComision !== undefined) {
    dto.pricePerContact = patch.valorComision;
  }
  if (patch.fechaCierre !== undefined) {
    dto.expiresAt = new Date(patch.fechaCierre).toISOString();
  }
  return dto;
}

export function ofertaEstadoToBackend(estado: EstadoOferta): string | null {
  return mapEstadoToBackend(estado);
}

export function persistContactoExtras(id: string, data: ContactoExtras) {
  setContactoExtras(id, data);
}

export function persistListaExtras(
  id: string,
  data: Pick<Lista, "categoria">,
) {
  setListaExtras(id, { categoria: data.categoria });
}

export function persistOfertaExtras(
  id: string,
  data: Partial<
    Pick<
      Oferta,
      | "slug"
      | "categoria"
      | "tipoComision"
      | "valorComision"
      | "valorTicketEstimado"
      | "criterios"
      | "region"
      | "destacada"
      | "estado"
    >
  >,
) {
  setOfertaExtras(id, data);
}

export function mapBackendCompany(c: BackendCompany): Empresa {
  return {
    id: c.id,
    nombre: c.tradeName ?? c.legalName,
    rubro: c.industry,
    descripcion: c.description ?? "",
    sitioWeb: c.website ?? "",
    comuna: c.city,
    region: c.country,
    verificada: c.reviewCount > 0,
    fechaIngreso: c.createdAt,
  };
}

export function mapBackendLeadManager(lm: BackendLeadManager): Lead {
  return {
    id: lm.id,
    nombre: lm.fullName,
    email: "",
    telefono: lm.phone ?? "",
    comuna: lm.city,
    region: lm.country,
    bio: lm.bio ?? "",
    fechaIngreso: lm.createdAt,
  };
}

export function extractContactIdsFromEntries(
  entries: BackendContactBookEntry[],
): string[] {
  return entries.map((e) => e.contactId);
}
