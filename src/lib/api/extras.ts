/**
 * Campos del frontend que el backend aun no persiste.
 * Se guardan en localStorage indexados por ID de entidad API.
 */

export interface ContactoExtras {
  empresa?: string;
  rut?: string;
}

export interface ListaExtras {
  categoria?: string;
}

export interface OfertaExtras {
  slug?: string;
  categoria?: string;
  tipoComision?: "porcentaje" | "fijo";
  valorComision?: number;
  valorTicketEstimado?: number;
  criterios?: string;
  region?: string;
  destacada?: boolean;
  estado?: "borrador" | "activa" | "pausada" | "cerrada";
}

interface ApiExtrasStore {
  contactos: Record<string, ContactoExtras>;
  listas: Record<string, ListaExtras>;
  ofertas: Record<string, OfertaExtras>;
}

const EXTRAS_KEY = "leadmanager-api-extras";

function readExtras(): ApiExtrasStore {
  if (typeof window === "undefined") {
    return { contactos: {}, listas: {}, ofertas: {} };
  }
  try {
    const raw = localStorage.getItem(EXTRAS_KEY);
    if (!raw) return { contactos: {}, listas: {}, ofertas: {} };
    return JSON.parse(raw) as ApiExtrasStore;
  } catch {
    return { contactos: {}, listas: {}, ofertas: {} };
  }
}

function writeExtras(store: ApiExtrasStore) {
  if (typeof window !== "undefined") {
    localStorage.setItem(EXTRAS_KEY, JSON.stringify(store));
  }
}

export function getContactoExtras(id: string): ContactoExtras {
  return readExtras().contactos[id] ?? {};
}

export function setContactoExtras(id: string, extras: ContactoExtras) {
  const all = readExtras();
  all.contactos[id] = { ...all.contactos[id], ...extras };
  writeExtras(all);
}

export function removeContactoExtras(id: string) {
  const all = readExtras();
  delete all.contactos[id];
  writeExtras(all);
}

export function getListaExtras(id: string): ListaExtras {
  return readExtras().listas[id] ?? {};
}

export function setListaExtras(id: string, extras: ListaExtras) {
  const all = readExtras();
  all.listas[id] = { ...all.listas[id], ...extras };
  writeExtras(all);
}

export function removeListaExtras(id: string) {
  const all = readExtras();
  delete all.listas[id];
  writeExtras(all);
}

export function getOfertaExtras(id: string): OfertaExtras {
  return readExtras().ofertas[id] ?? {};
}

export function setOfertaExtras(id: string, extras: OfertaExtras) {
  const all = readExtras();
  all.ofertas[id] = { ...all.ofertas[id], ...extras };
  writeExtras(all);
}

export function removeOfertaExtras(id: string) {
  const all = readExtras();
  delete all.ofertas[id];
  writeExtras(all);
}

export function getAllOfertaExtras(): Record<string, OfertaExtras> {
  return readExtras().ofertas;
}
