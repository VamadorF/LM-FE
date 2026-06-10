import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type Gender = "male" | "female" | "non_binary" | "prefer_not_to_say";

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  email?: string | null;
  phone?: string | null;
  gender?: Gender | null;
  city?: string | null;
  country?: string | null;
  monthlyIncome?: number | null;
  interests?: string[];
  privateNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactDto {
  firstName: string;
  lastName: string;
  age: number;
  email?: string;
  phone?: string;
  gender?: Gender;
  city?: string;
  country?: string;
  monthlyIncome?: number;
  interests?: string[];
  privateNotes?: string;
}

export type UpdateContactDto = Partial<CreateContactDto>;

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useContacts() {
  return useQuery<Contact[]>({
    queryKey: ["contacts"],
    queryFn: async () => {
      const { data } = await apiClient.get<Contact[]>("/contacts");
      return data;
    },
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateContactDto) =>
      apiClient.post<Contact>("/contacts", dto).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contacts"] });
      qc.invalidateQueries({ queryKey: ["contact-books"] });
    },
  });
}

export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateContactDto }) =>
      apiClient.patch<Contact>(`/contacts/${id}`, dto).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/contacts/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contacts"] });
      qc.invalidateQueries({ queryKey: ["contact-books"] });
    },
  });
}
