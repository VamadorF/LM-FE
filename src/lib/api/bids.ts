import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type BidStatus = "pending" | "accepted" | "rejected" | "withdrawn" | "completed";

export interface BidProposal {
  id: string;
  title: string;
  pricePerContact: number | null;
  expiresAt?: string | null;
}

export interface BidLeadManager {
  id: string;
  fullName: string;
  avgRating?: number;
  reviewCount?: number;
}

export interface Bid {
  id: string;
  status: BidStatus;
  pitch: string;
  totalPrice: number | null;
  companyNote: string | null;
  contactCount: number;
  proposal: BidProposal;
  leadManager: BidLeadManager;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBidDto {
  pitch: string;
  contactBookId?: string;
  contactIds?: string[];
}

export interface BidContact {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  email?: string | null;
  phone?: string | null;
  gender?: string | null;
  city?: string | null;
  country?: string | null;
  monthlyIncome?: number | null;
  interests?: string[];
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useMyBids() {
  return useQuery<Bid[]>({
    queryKey: ["bids", "mine"],
    queryFn: async () => {
      const { data } = await apiClient.get<Bid[]>("/bids/mine");
      return data;
    },
  });
}

export function useProposalBids(proposalId: string) {
  return useQuery<Bid[]>({
    queryKey: ["bids", "proposal", proposalId],
    queryFn: async () => {
      const { data } = await apiClient.get<Bid[]>(`/proposals/${proposalId}/bids`);
      return data;
    },
    enabled: !!proposalId,
  });
}

export function useCreateBid(proposalId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateBidDto) =>
      apiClient.post<Bid>(`/proposals/${proposalId}/bids`, dto).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bids"] });
      qc.invalidateQueries({ queryKey: ["proposals", proposalId] });
    },
  });
}

export function useWithdrawBid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bidId: string) =>
      apiClient.delete(`/bids/${bidId}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bids"] });
    },
  });
}

export function useAcceptBid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bidId: string) =>
      apiClient.post<Bid>(`/bids/${bidId}/accept`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bids"] });
    },
  });
}

export function useRejectBid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bidId: string) =>
      apiClient.post<Bid>(`/bids/${bidId}/reject`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bids"] });
    },
  });
}

export function useBidContacts(bidId: string) {
  return useQuery<BidContact[]>({
    queryKey: ["bids", bidId, "contacts"],
    queryFn: async () => {
      const { data } = await apiClient.get<BidContact[]>(`/bids/${bidId}/contacts`);
      return data;
    },
    enabled: !!bidId,
  });
}

export function useCompleteBid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bidId: string) =>
      apiClient.post<Bid>(`/bids/${bidId}/complete`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bids"] });
      qc.invalidateQueries({ queryKey: ["proposals"] });
    },
  });
}
