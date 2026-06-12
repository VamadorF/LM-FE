import { apiFetch } from "./client";
import {
  mapBackendProposal,
  ofertaEstadoToBackend,
  ofertaToCreateDto,
  ofertaToUpdateDto,
  persistOfertaExtras,
} from "./mappers";
import type { BackendProposal } from "./types";
import type { Oferta } from "../types";

export async function fetchMyProposals(companyId: string): Promise<Oferta[]> {
  const rows = await apiFetch<BackendProposal[]>("/proposals/mine", {
    role: "company",
    method: "GET",
  });
  return rows.map((p) => mapBackendProposal({ ...p, companyId }));
}

export async function fetchPublicProposals(): Promise<Oferta[]> {
  const rows = await apiFetch<BackendProposal[]>("/proposals", {
    auth: false,
    method: "GET",
  });
  return rows.map((p) => mapBackendProposal(p));
}

export async function createProposal(
  data: Omit<Oferta, "id" | "slug" | "fechaInicio">,
): Promise<Oferta> {
  const created = await apiFetch<BackendProposal>("/proposals", {
    role: "company",
    method: "POST",
    body: JSON.stringify(ofertaToCreateDto(data)),
  });

  const estadoBackend = ofertaEstadoToBackend(data.estado);
  let final = created;
  if (estadoBackend && estadoBackend !== "open") {
    final = await apiFetch<BackendProposal>(`/proposals/${created.id}/status`, {
      role: "company",
      method: "PATCH",
      body: JSON.stringify({ status: estadoBackend }),
    });
  }

  persistOfertaExtras(final.id, {
    slug: `${data.titulo.toLowerCase().replace(/\s+/g, "-")}-${final.id.slice(0, 8)}`,
    categoria: data.categoria,
    tipoComision: data.tipoComision,
    valorComision: data.valorComision,
    valorTicketEstimado: data.valorTicketEstimado,
    criterios: data.criterios,
    region: data.region,
    destacada: data.destacada,
    estado: data.estado,
  });

  return mapBackendProposal({ ...final, companyId: data.empresaId });
}

export async function updateProposal(
  id: string,
  empresaId: string,
  patch: Partial<Oferta>,
): Promise<Oferta> {
  const dto = ofertaToUpdateDto(patch);
  let updated: BackendProposal | null = null;

  if (Object.keys(dto).length > 0) {
    updated = await apiFetch<BackendProposal>(`/proposals/${id}`, {
      role: "company",
      method: "PATCH",
      body: JSON.stringify(dto),
    });
  }

  if (patch.estado !== undefined) {
    const backendStatus = ofertaEstadoToBackend(patch.estado);
    if (backendStatus) {
      updated = await apiFetch<BackendProposal>(`/proposals/${id}/status`, {
        role: "company",
        method: "PATCH",
        body: JSON.stringify({ status: backendStatus }),
      });
    }
  }

  if (!updated) {
    const mine = await fetchMyProposals(empresaId);
    const found = mine.find((o) => o.id === id);
    if (!found) throw new Error("Oferta no encontrada.");
    updated = {
      id: found.id,
      companyId: empresaId,
      title: found.titulo,
      description: found.descripcion,
      contactsNeeded: found.objetivoContactos,
      requiredInterests: [found.categoria],
      status: "open",
      createdAt: found.fechaInicio,
      updatedAt: found.fechaInicio,
    } as BackendProposal;
  }

  persistOfertaExtras(id, {
    categoria: patch.categoria,
    tipoComision: patch.tipoComision,
    valorComision: patch.valorComision,
    valorTicketEstimado: patch.valorTicketEstimado,
    criterios: patch.criterios,
    region: patch.region,
    destacada: patch.destacada,
    estado: patch.estado,
  });

  return mapBackendProposal({ ...updated, companyId: empresaId });
}
