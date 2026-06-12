import { apiFetch } from "./client";
import {
  extractContactIdsFromEntries,
  mapBackendContactBook,
  persistListaExtras,
} from "./mappers";
import type { BackendContactBook, BackendContactBookEntry } from "./types";
import type { Lista } from "../types";

export async function fetchContactBooks(leadId: string): Promise<Lista[]> {
  const books = await apiFetch<BackendContactBook[]>("/contact-books", {
    role: "lead",
    method: "GET",
  });

  const listas = await Promise.all(
    books.map(async (book) => {
      const entries = await apiFetch<BackendContactBookEntry[]>(
        `/contact-books/${book.id}/contacts`,
        { role: "lead", method: "GET" },
      );
      return mapBackendContactBook(
        book,
        leadId,
        extractContactIdsFromEntries(entries),
      );
    }),
  );

  return listas;
}

export async function createContactBook(
  data: Pick<Lista, "leadId" | "nombre" | "categoria" | "descripcion"> & {
    contactoIds?: string[];
  },
): Promise<Lista> {
  const created = await apiFetch<BackendContactBook>("/contact-books", {
    role: "lead",
    method: "POST",
    body: JSON.stringify({
      name: data.nombre,
      description: data.descripcion || undefined,
    }),
  });

  persistListaExtras(created.id, { categoria: data.categoria });

  let contactoIds: string[] = [];
  if (data.contactoIds?.length) {
    await apiFetch(`/contact-books/${created.id}/contacts`, {
      role: "lead",
      method: "POST",
      body: JSON.stringify({ contactIds: data.contactoIds }),
    });
    contactoIds = data.contactoIds;
  }

  return mapBackendContactBook(created, data.leadId, contactoIds, {
    categoria: data.categoria,
  });
}

export async function updateContactBook(
  id: string,
  leadId: string,
  patch: Partial<Lista>,
): Promise<Lista> {
  if (patch.categoria !== undefined) {
    persistListaExtras(id, { categoria: patch.categoria });
  }

  const body: Record<string, string> = {};
  if (patch.nombre !== undefined) body.name = patch.nombre;
  if (patch.descripcion !== undefined) body.description = patch.descripcion;

  let book: BackendContactBook;
  if (Object.keys(body).length > 0) {
    book = await apiFetch<BackendContactBook>(`/contact-books/${id}`, {
      role: "lead",
      method: "PATCH",
      body: JSON.stringify(body),
    });
  } else {
    const books = await apiFetch<BackendContactBook[]>("/contact-books", {
      role: "lead",
      method: "GET",
    });
    const found = books.find((b) => b.id === id);
    if (!found) throw new Error("Lista no encontrada.");
    book = found;
  }

  const entries = await apiFetch<BackendContactBookEntry[]>(
    `/contact-books/${id}/contacts`,
    { role: "lead", method: "GET" },
  );

  return mapBackendContactBook(
    book,
    leadId,
    extractContactIdsFromEntries(entries),
  );
}

export async function deleteContactBook(id: string): Promise<void> {
  await apiFetch(`/contact-books/${id}`, {
    role: "lead",
    method: "DELETE",
  });
}

export async function addContactsToBook(
  bookId: string,
  leadId: string,
  contactIds: string[],
): Promise<Lista> {
  await apiFetch(`/contact-books/${bookId}/contacts`, {
    role: "lead",
    method: "POST",
    body: JSON.stringify({ contactIds }),
  });

  const books = await apiFetch<BackendContactBook[]>("/contact-books", {
    role: "lead",
    method: "GET",
  });
  const book = books.find((b) => b.id === bookId);
  const entries = await apiFetch<BackendContactBookEntry[]>(
    `/contact-books/${bookId}/contacts`,
    { role: "lead", method: "GET" },
  );

  if (!book) throw new Error("Lista no encontrada tras agregar contactos.");

  return mapBackendContactBook(
    book,
    leadId,
    extractContactIdsFromEntries(entries),
  );
}

export async function removeContactFromBook(
  bookId: string,
  leadId: string,
  contactId: string,
): Promise<Lista> {
  await apiFetch(`/contact-books/${bookId}/contacts/${contactId}`, {
    role: "lead",
    method: "DELETE",
  });

  const books = await apiFetch<BackendContactBook[]>("/contact-books", {
    role: "lead",
    method: "GET",
  });
  const book = books.find((b) => b.id === bookId);
  if (!book) throw new Error("Lista no encontrada.");

  const entries = await apiFetch<BackendContactBookEntry[]>(
    `/contact-books/${bookId}/contacts`,
    { role: "lead", method: "GET" },
  );

  return mapBackendContactBook(
    book,
    leadId,
    extractContactIdsFromEntries(entries),
  );
}
