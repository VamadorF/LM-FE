"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { actividades as seedActividades, agentes as seedAgentes, leads as seedLeads, referidores as seedReferidores } from "./seed";
import type { Actividad, Agente, Lead, Referidor } from "./types";

export interface LeadManagerState {
  leads: Lead[];
  referidores: Referidor[];
  agentes: Agente[];
  actividades: Actividad[];

  addLead: (lead: Omit<Lead, "id" | "fechaCreacion" | "ultimaActividad">) => Lead;
  updateLead: (id: string, patch: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  moverEtapa: (id: string, etapa: Lead["etapa"]) => void;

  addReferidor: (ref: Omit<Referidor, "id" | "fechaIngreso">) => Referidor;
  updateReferidor: (id: string, patch: Partial<Referidor>) => void;
  deleteReferidor: (id: string) => void;

  addActividad: (act: Omit<Actividad, "id" | "fecha">) => Actividad;

  resetDatos: () => void;
}

const nowISO = () => new Date().toISOString();
const genId = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.floor(Math.random() * 1000).toString(36)}`;

export const useStore = create<LeadManagerState>()(
  persist(
    (set) => ({
      leads: seedLeads,
      referidores: seedReferidores,
      agentes: seedAgentes,
      actividades: seedActividades,

      addLead: (lead) => {
        const nuevo: Lead = {
          ...lead,
          id: genId("lead"),
          fechaCreacion: nowISO(),
          ultimaActividad: nowISO(),
        };
        set((s) => ({ leads: [nuevo, ...s.leads] }));
        return nuevo;
      },

      updateLead: (id, patch) =>
        set((s) => ({
          leads: s.leads.map((l) =>
            l.id === id ? { ...l, ...patch, ultimaActividad: nowISO() } : l,
          ),
        })),

      deleteLead: (id) =>
        set((s) => ({
          leads: s.leads.filter((l) => l.id !== id),
          actividades: s.actividades.filter((a) => a.leadId !== id),
        })),

      moverEtapa: (id, etapa) =>
        set((s) => ({
          leads: s.leads.map((l) =>
            l.id === id ? { ...l, etapa, ultimaActividad: nowISO() } : l,
          ),
        })),

      addReferidor: (ref) => {
        const nuevo: Referidor = { ...ref, id: genId("ref"), fechaIngreso: nowISO() };
        set((s) => ({ referidores: [nuevo, ...s.referidores] }));
        return nuevo;
      },

      updateReferidor: (id, patch) =>
        set((s) => ({
          referidores: s.referidores.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),

      deleteReferidor: (id) =>
        set((s) => ({
          referidores: s.referidores.filter((r) => r.id !== id),
          leads: s.leads.map((l) => (l.referidorId === id ? { ...l, referidorId: null } : l)),
        })),

      addActividad: (act) => {
        const nueva: Actividad = { ...act, id: genId("act"), fecha: nowISO() };
        set((s) => ({
          actividades: [nueva, ...s.actividades],
          leads: s.leads.map((l) =>
            l.id === act.leadId ? { ...l, ultimaActividad: nueva.fecha } : l,
          ),
        }));
        return nueva;
      },

      resetDatos: () =>
        set({
          leads: seedLeads,
          referidores: seedReferidores,
          agentes: seedAgentes,
          actividades: seedActividades,
        }),
    }),
    {
      name: "leadmanager-data",
      version: 1,
    },
  ),
);

export function useHydrated(): boolean {
  return useSyncExternalStore(
    (callback) => useStore.persist.onFinishHydration(callback),
    () => useStore.persist.hasHydrated(),
    () => false,
  );
}
