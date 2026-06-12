import { ApiError, apiFetch, saveApiSession, setActiveApiRole } from "./client";
import { DEMO_COMPANY, DEMO_LEAD } from "./config";
import { mapBackendCompany, mapBackendLeadManager } from "./mappers";
import type { BackendLoginResponse, BackendUser } from "./types";
import type { Empresa, Lead } from "../types";

async function registerOrLoginCompany(): Promise<{
  token: string;
  profileId: string;
  email: string;
  empresa: Empresa;
}> {
  try {
    await apiFetch<BackendUser>("/auth/register/company", {
      method: "POST",
      auth: false,
      body: JSON.stringify(DEMO_COMPANY),
    });
  } catch (err) {
    if (!(err instanceof ApiError) || err.status !== 409) throw err;
  }

  const login = await apiFetch<BackendLoginResponse>("/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify({
      email: DEMO_COMPANY.email,
      password: DEMO_COMPANY.password,
    }),
  });

  const me = await apiFetch<BackendUser>("/auth/me", {
    auth: false,
    headers: { Authorization: `Bearer ${login.accessToken}` },
  });

  if (!me.company) throw new Error("Perfil de empresa no encontrado tras login.");

  saveApiSession("company", {
    token: login.accessToken,
    profileId: me.company.id,
    email: me.email,
  });

  return {
    token: login.accessToken,
    profileId: me.company.id,
    email: me.email,
    empresa: mapBackendCompany(me.company),
  };
}

async function registerOrLoginLead(): Promise<{
  token: string;
  profileId: string;
  email: string;
  lead: Lead;
}> {
  try {
    await apiFetch<BackendUser>("/auth/register/lead-manager", {
      method: "POST",
      auth: false,
      body: JSON.stringify(DEMO_LEAD),
    });
  } catch (err) {
    if (!(err instanceof ApiError) || err.status !== 409) throw err;
  }

  const login = await apiFetch<BackendLoginResponse>("/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify({
      email: DEMO_LEAD.email,
      password: DEMO_LEAD.password,
    }),
  });

  const me = await apiFetch<BackendUser>("/auth/me", {
    auth: false,
    headers: { Authorization: `Bearer ${login.accessToken}` },
  });

  if (!me.leadManager) throw new Error("Perfil de conector no encontrado tras login.");

  saveApiSession("lead", {
    token: login.accessToken,
    profileId: me.leadManager.id,
    email: me.email,
  });

  return {
    token: login.accessToken,
    profileId: me.leadManager.id,
    email: me.email,
    lead: {
      ...mapBackendLeadManager(me.leadManager),
      email: me.email,
    },
  };
}

export interface BootstrapResult {
  empresa: Empresa;
  lead: Lead;
  companyId: string;
  leadId: string;
}

export async function bootstrapAuth(): Promise<BootstrapResult> {
  const [company, lead] = await Promise.all([
    registerOrLoginCompany(),
    registerOrLoginLead(),
  ]);

  setActiveApiRole("lead");

  return {
    empresa: company.empresa,
    lead: lead.lead,
    companyId: company.profileId,
    leadId: lead.profileId,
  };
}
