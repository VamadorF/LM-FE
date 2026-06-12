export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://leadmanager-x2i9.onrender.com";

export const API_TIMEOUT_MS = 45_000;

export const DEMO_COMPANY = {
  email: "demo.empresa@leadmanager.dev",
  password: "demo1234",
  legalName: "Demo Empresa SpA",
  tradeName: "Demo Empresa",
  taxId: "DEMO-TAX-LEADMANAGER-001",
  industry: "Tecnologia",
  companySize: "11-50" as const,
  country: "Chile",
  city: "Santiago",
  contactName: "Admin Demo",
  website: "https://demo-empresa.cl",
  description: "Cuenta demo para integracion frontend LeadManager",
};

export const DEMO_LEAD = {
  email: "demo.lead@leadmanager.dev",
  password: "demo12345678",
  fullName: "Conector Demo",
  phone: "+56912345678",
  city: "Santiago",
  country: "Chile",
  bio: "Cuenta demo de conector para integracion frontend LeadManager",
};
