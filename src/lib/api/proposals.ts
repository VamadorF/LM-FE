import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface ProposalCompany {
  id: string;
  legalName: string;
  logoUrl?: string | null;
  avgRating?: number;
}

export type ProposalStatus = "open" | "paused" | "closed" | "completed" | "expired";

export interface Proposal {
  id: string;
  title: string;
  description: string;
  contactsNeeded: number;
  pricePerContact: number | null;
  status: ProposalStatus;
  ageMin?: number | null;
  ageMax?: number | null;
  genderPreference?: string | null;
  incomeMin?: number | null;
  incomeMax?: number | null;
  locationCity?: string | null;
  locationCountry?: string | null;
  requiredInterests?: string[];
  expiresAt?: string | null;
  bidCount: number;
  company: ProposalCompany;
  createdAt: string;
}

export interface CreateProposalDto {
  title: string;
  description: string;
  contactsNeeded: number;
  pricePerContact?: number;
  ageMin?: number;
  ageMax?: number;
  genderPreference?: string;
  incomeMin?: number;
  incomeMax?: number;
  locationCity?: string;
  locationCountry?: string;
  requiredInterests?: string[];
  expiresAt?: string;
}

export type UpdateProposalDto = Partial<CreateProposalDto>;

export interface ProposalStatusDto {
  status: ProposalStatus;
}

export interface ProposalListResponse {
  data: Proposal[];
  total: number;
  page: number;
  pageSize: number;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useProposals(params?: { page?: number; pageSize?: number; status?: string }) {
  return useQuery<ProposalListResponse>({
    queryKey: ["proposals", params],
    queryFn: async () => {
      const { data } = await apiClient.get<ProposalListResponse>("/proposals", { params });
      return data;
    },
    staleTime: 60_000,
  });
}

export function useMyProposals() {
  return useQuery<Proposal[]>({
    queryKey: ["proposals", "mine"],
    queryFn: async () => {
      const { data } = await apiClient.get<Proposal[]>("/proposals/mine");
      return data;
    },
  });
}

export function useProposal(id: string) {
  return useQuery<Proposal>({
    queryKey: ["proposals", id],
    queryFn: async () => {
      const { data } = await apiClient.get<Proposal>(`/proposals/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateProposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateProposalDto) =>
      apiClient.post<Proposal>("/proposals", dto).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["proposals"] });
    },
  });
}

export function useUpdateProposal(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateProposalDto) =>
      apiClient.patch<Proposal>(`/proposals/${id}`, dto).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["proposals"] });
    },
  });
}

export function useUpdateProposalStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: ProposalStatusDto) =>
      apiClient.patch<Proposal>(`/proposals/${id}/status`, dto).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["proposals"] });
    },
  });
}
