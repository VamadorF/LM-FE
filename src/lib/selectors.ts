import { ETAPAS, etapaMeta, type Agente, type Lead, type Referidor } from "./types";

export const esGanado = (l: Lead) => l.etapa === "ganado";
export const esPerdido = (l: Lead) => l.etapa === "perdido";
export const esAbierto = (l: Lead) => etapaMeta(l.etapa).abierta;

export function valorPipeline(leads: Lead[]): number {
  return leads.filter(esAbierto).reduce((acc, l) => acc + l.valorEstimado, 0);
}

export function valorGanado(leads: Lead[]): number {
  return leads.filter(esGanado).reduce((acc, l) => acc + l.valorEstimado, 0);
}

export function tasaConversion(leads: Lead[]): number {
  const cerrados = leads.filter((l) => esGanado(l) || esPerdido(l)).length;
  const ganados = leads.filter(esGanado).length;
  return cerrados === 0 ? 0 : (ganados / cerrados) * 100;
}

export function comisionLead(lead: Lead, referidores: Referidor[]): number {
  if (!esGanado(lead) || !lead.referidorId) return 0;
  const ref = referidores.find((r) => r.id === lead.referidorId);
  if (!ref) return 0;
  return Math.round((lead.valorEstimado * ref.porcentajeComision) / 100);
}

export function comisionesTotales(leads: Lead[], referidores: Referidor[]): number {
  return leads.reduce((acc, l) => acc + comisionLead(l, referidores), 0);
}

export interface ResumenReferidor {
  referidor: Referidor;
  leadsReferidos: number;
  ganados: number;
  montoGenerado: number;
  comisionAcumulada: number;
}

export function resumenReferidor(
  ref: Referidor,
  leads: Lead[],
  referidores: Referidor[],
): ResumenReferidor {
  const propios = leads.filter((l) => l.referidorId === ref.id);
  const ganados = propios.filter(esGanado);
  return {
    referidor: ref,
    leadsReferidos: propios.length,
    ganados: ganados.length,
    montoGenerado: ganados.reduce((acc, l) => acc + l.valorEstimado, 0),
    comisionAcumulada: propios.reduce((acc, l) => acc + comisionLead(l, referidores), 0),
  };
}

export interface ResumenAgente {
  agente: Agente;
  totalLeads: number;
  abiertos: number;
  ganados: number;
  perdidos: number;
  valorGanado: number;
  valorPipeline: number;
  conversion: number;
  avanceMeta: number;
}

export function resumenAgente(agente: Agente, leads: Lead[]): ResumenAgente {
  const propios = leads.filter((l) => l.agenteId === agente.id);
  const ganados = propios.filter(esGanado);
  const perdidos = propios.filter(esPerdido);
  const vg = ganados.reduce((acc, l) => acc + l.valorEstimado, 0);
  const cerrados = ganados.length + perdidos.length;
  return {
    agente,
    totalLeads: propios.length,
    abiertos: propios.filter(esAbierto).length,
    ganados: ganados.length,
    perdidos: perdidos.length,
    valorGanado: vg,
    valorPipeline: propios.filter(esAbierto).reduce((acc, l) => acc + l.valorEstimado, 0),
    conversion: cerrados === 0 ? 0 : (ganados.length / cerrados) * 100,
    avanceMeta: agente.metaMensual === 0 ? 0 : (vg / agente.metaMensual) * 100,
  };
}

export function conteoPorEtapa(leads: Lead[]) {
  return ETAPAS.map((etapa) => ({
    etapa: etapa.value,
    label: etapa.label,
    cantidad: leads.filter((l) => l.etapa === etapa.value).length,
    valor: leads
      .filter((l) => l.etapa === etapa.value)
      .reduce((acc, l) => acc + l.valorEstimado, 0),
  }));
}

export function embudo(leads: Lead[]) {
  const orden = ["nuevo", "contactado", "calificado", "propuesta", "negociacion", "ganado"] as const;
  return orden.map((etapa) => ({
    label: etapaMeta(etapa).label,
    cantidad: leads.filter((l) => l.etapa === etapa).length,
  }));
}

export function leadsPorOrigen(leads: Lead[]) {
  const map = new Map<string, number>();
  for (const l of leads) {
    map.set(l.origen, (map.get(l.origen) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([origen, cantidad]) => ({ origen, cantidad }));
}

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export function ingresosPorMes(leads: Lead[], meses = 6) {
  const ahora = new Date();
  const buckets: { mes: string; ingresos: number; leads: number }[] = [];
  for (let i = meses - 1; i >= 0; i--) {
    const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
    buckets.push({ mes: MESES[d.getMonth()], ingresos: 0, leads: 0 });
  }
  const base = new Date(ahora.getFullYear(), ahora.getMonth() - (meses - 1), 1);
  for (const l of leads) {
    const fecha = new Date(l.fechaCreacion);
    if (fecha < base) continue;
    const idx =
      (fecha.getFullYear() - base.getFullYear()) * 12 + (fecha.getMonth() - base.getMonth());
    if (idx < 0 || idx >= buckets.length) continue;
    buckets[idx].leads += 1;
    if (esGanado(l)) buckets[idx].ingresos += l.valorEstimado;
  }
  return buckets;
}
