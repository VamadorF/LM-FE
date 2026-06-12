/** Tipos de respuesta del backend NestJS (LeadManager API). */

export type BackendRole = "company" | "lead_manager";

export interface BackendCompany {
  id: string;
  userId: string;
  legalName: string;
  tradeName?: string | null;
  taxId: string;
  industry: string;
  companySize: string;
  country: string;
  city: string;
  address?: string | null;
  contactName: string;
  contactPhone?: string | null;
  website?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  avgRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BackendLeadManager {
  id: string;
  userId: string;
  fullName: string;
  phone?: string | null;
  city: string;
  country: string;
  bio?: string | null;
  avgRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BackendUser {
  id: string;
  email: string;
  role: BackendRole;
  status: string;
  emailVerified: boolean;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
  company?: BackendCompany;
  leadManager?: BackendLeadManager;
}

export interface BackendLoginResponse {
  accessToken: string;
  expiresIn: string;
}

export interface BackendContact {
  id: string;
  leadManagerId: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  age: number;
  gender?: string | null;
  city?: string | null;
  country: string;
  monthlyIncome?: number | null;
  interests: string[];
  privateNotes?: string | null;
  isActive: boolean;
  timesOffered: number;
  createdAt: string;
  updatedAt: string;
}

export interface BackendContactBook {
  id: string;
  leadManagerId: string;
  name: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { entries: number };
}

export interface BackendContactBookEntry {
  id: string;
  contactBookId: string;
  contactId: string;
  note?: string | null;
  addedAt: string;
  contact?: BackendContact;
}

export type BackendProposalStatus =
  | "open"
  | "paused"
  | "closed"
  | "completed"
  | "expired";

export interface BackendProposal {
  id: string;
  companyId: string;
  title: string;
  description: string;
  contactsNeeded: number;
  ageMin?: number | null;
  ageMax?: number | null;
  genderPreference?: string | null;
  incomeMin?: number | null;
  incomeMax?: number | null;
  locationCity?: string | null;
  locationCountry?: string | null;
  requiredInterests: string[];
  pricePerContact?: string | number | null;
  status: BackendProposalStatus;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
  company?: Pick<
    BackendCompany,
    "id" | "legalName" | "tradeName" | "industry" | "avgRating" | "reviewCount"
  >;
  _count?: { bids: number };
}

export interface ApiErrorBody {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}
