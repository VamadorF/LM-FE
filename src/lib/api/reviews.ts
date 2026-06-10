import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  bidId: string;
  reviewerId: string;
  reviewerRole: "company" | "lead_manager";
  createdAt: string;
}

export interface CreateReviewDto {
  rating: number;
  comment?: string;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useCreateReview(bidId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateReviewDto) =>
      apiClient.post<Review>(`/bids/${bidId}/reviews`, dto).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bids"] });
      qc.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}

export function useCompanyReviews(companyId: string) {
  return useQuery<Review[]>({
    queryKey: ["reviews", "company", companyId],
    queryFn: async () => {
      const { data } = await apiClient.get<Review[]>(`/companies/${companyId}/reviews`);
      return data;
    },
    enabled: !!companyId,
  });
}

export function useLeadManagerReviews(leadManagerId: string) {
  return useQuery<Review[]>({
    queryKey: ["reviews", "lead-manager", leadManagerId],
    queryFn: async () => {
      const { data } = await apiClient.get<Review[]>(`/lead-managers/${leadManagerId}/reviews`);
      return data;
    },
    enabled: !!leadManagerId,
  });
}
