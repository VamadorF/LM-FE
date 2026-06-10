import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import type { Contact } from "./contacts";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface ContactBook {
  id: string;
  name: string;
  description?: string | null;
  contactCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactBookDto {
  name: string;
  description?: string;
}

export interface UpdateContactBookDto {
  name?: string;
  description?: string;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useContactBooks() {
  return useQuery<ContactBook[]>({
    queryKey: ["contact-books"],
    queryFn: async () => {
      const { data } = await apiClient.get<ContactBook[]>("/contact-books");
      return data;
    },
  });
}

export function useContactBookContacts(bookId: string) {
  return useQuery<Contact[]>({
    queryKey: ["contact-books", bookId, "contacts"],
    queryFn: async () => {
      const { data } = await apiClient.get<Contact[]>(`/contact-books/${bookId}/contacts`);
      return data;
    },
    enabled: !!bookId,
  });
}

export function useCreateContactBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateContactBookDto) =>
      apiClient.post<ContactBook>("/contact-books", dto).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contact-books"] });
    },
  });
}

export function useUpdateContactBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateContactBookDto }) =>
      apiClient.patch<ContactBook>(`/contact-books/${id}`, dto).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contact-books"] });
    },
  });
}

export function useDeleteContactBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/contact-books/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contact-books"] });
    },
  });
}

export function useAddContactToBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bookId, contactId }: { bookId: string; contactId: string }) =>
      apiClient.post(`/contact-books/${bookId}/contacts`, { contactId }).then((r) => r.data),
    onSuccess: (_, { bookId }) => {
      qc.invalidateQueries({ queryKey: ["contact-books", bookId, "contacts"] });
      qc.invalidateQueries({ queryKey: ["contact-books"] });
    },
  });
}

export function useRemoveContactFromBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bookId, contactId }: { bookId: string; contactId: string }) =>
      apiClient
        .delete(`/contact-books/${bookId}/contacts/${contactId}`)
        .then((r) => r.data),
    onSuccess: (_, { bookId }) => {
      qc.invalidateQueries({ queryKey: ["contact-books", bookId, "contacts"] });
    },
  });
}
