import { apiFetch } from "./client";
import {
  contactoToCreateDto,
  contactoToUpdateDto,
  mapBackendContact,
  persistContactoExtras,
} from "./mappers";
import type { BackendContact } from "./types";
import type { Contacto } from "../types";

export async function fetchContacts(leadId: string): Promise<Contacto[]> {
  const rows = await apiFetch<BackendContact[]>("/contacts", {
    role: "lead",
    method: "GET",
  });
  return rows.filter((c) => c.isActive).map((c) => mapBackendContact(c, leadId));
}

export async function createContact(
  data: Omit<Contacto, "id" | "fechaCreacion" | "fechaActualizacion">,
): Promise<Contacto> {
  const created = await apiFetch<BackendContact>("/contacts", {
    role: "lead",
    method: "POST",
    body: JSON.stringify(contactoToCreateDto(data)),
  });
  persistContactoExtras(created.id, { empresa: data.empresa, rut: data.rut });
  return mapBackendContact(created, data.leadId, {
    empresa: data.empresa,
    rut: data.rut,
  });
}

export async function updateContact(
  id: string,
  leadId: string,
  patch: Partial<Contacto>,
): Promise<Contacto> {
  const updated = await apiFetch<BackendContact>(`/contacts/${id}`, {
    role: "lead",
    method: "PATCH",
    body: JSON.stringify(contactoToUpdateDto(patch)),
  });
  if (patch.empresa !== undefined || patch.rut !== undefined) {
    const extras: { empresa?: string; rut?: string } = {};
    if (patch.empresa !== undefined) extras.empresa = patch.empresa;
    if (patch.rut !== undefined) extras.rut = patch.rut;
    persistContactoExtras(id, extras);
  }
  return mapBackendContact(updated, leadId);
}

export async function deleteContact(id: string): Promise<void> {
  await apiFetch(`/contacts/${id}`, {
    role: "lead",
    method: "DELETE",
  });
}
