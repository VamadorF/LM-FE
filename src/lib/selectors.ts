import {
  estadoPostulacionMeta,
  type Contacto,
  type Empresa,
  type EstadoPostulacion,
  type Lead,
  type Lista,
  type Oferta,
  type Postulacion,
  type Rating,
  type ActorTipo,
} from "./types";

export const esCompletada = (p: Postulacion) => p.estado === "completada";
export const esAbierta = (p: Postulacion) => estadoPostulacionMeta(p.estado).abierta;

export function ofertasDeEmpresa(ofertas: Oferta[], empresaId: string): Oferta[] {
  return ofertas.filter((o) => o.empresaId === empresaId);
}

export function postulacionesDeOferta(posts: Postulacion[], ofertaId: string): Postulacion[] {
  return posts.filter((p) => p.ofertaId === ofertaId);
}

export function postulacionesDeLead(posts: Postulacion[], leadId: string): Postulacion[] {
  return posts.filter((p) => p.leadId === leadId);
}

export function conteoPorOferta(posts: Postulacion[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const p of posts) m.set(p.ofertaId, (m.get(p.ofertaId) ?? 0) + 1);
  return m;
}

export function listasDelLead(listas: Lista[], leadId: string): Lista[] {
  return listas.filter((l) => l.leadId === leadId);
}

export function contactosDelLead(contactos: Contacto[], leadId: string): Contacto[] {
  return contactos.filter((c) => c.leadId === leadId);
}

export function contactosDeLista(
  listas: Lista[],
  contactos: Contacto[],
  listaId: string,
): Contacto[] {
  const lista = listas.find((l) => l.id === listaId);
  if (!lista) return [];
  const ids = new Set(lista.contactoIds);
  return contactos.filter((c) => ids.has(c.id));
}

export function conteoContactosPorLista(listas: Lista[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const l of listas) m.set(l.id, l.contactoIds.length);
  return m;
}

export function contactosYaPostuladosEnOferta(
  posts: Postulacion[],
  ofertaId: string,
  leadId: string,
): Set<string> {
  const s = new Set<string>();
  for (const p of posts) {
    if (p.ofertaId === ofertaId && p.leadId === leadId) s.add(p.contactoId);
  }
  return s;
}

export interface ConteoEstados {
  total: number;
  porEstado: Record<EstadoPostulacion, number>;
  comisiones: number;
  valorTransacciones: number;
  completadas: number;
  abiertas: number;
}

export function resumirPostulaciones(posts: Postulacion[]): ConteoEstados {
  const porEstado = {
    postulada: 0,
    en_revision: 0,
    seleccionada: 0,
    rechazada: 0,
    en_negociacion: 0,
    completada: 0,
  } as Record<EstadoPostulacion, number>;
  let comisiones = 0;
  let valorTransacciones = 0;
  let abiertas = 0;
  for (const p of posts) {
    porEstado[p.estado] += 1;
    if (p.comision) comisiones += p.comision;
    if (p.valorTransaccion) valorTransacciones += p.valorTransaccion;
    if (esAbierta(p)) abiertas += 1;
  }
  return {
    total: posts.length,
    porEstado,
    comisiones,
    valorTransacciones,
    completadas: porEstado.completada,
    abiertas,
  };
}

export interface ResumenEmpresa {
  ofertas: number;
  ofertasActivas: number;
  postulaciones: number;
  seleccionadas: number;
  completadas: number;
  comisiones: number;
  rating: number;
  ratingTotal: number;
}

export function resumenEmpresa(
  empresaId: string,
  ofertas: Oferta[],
  posts: Postulacion[],
  ratings: Rating[],
): ResumenEmpresa {
  const propias = ofertasDeEmpresa(ofertas, empresaId);
  const ids = new Set(propias.map((o) => o.id));
  const ps = posts.filter((p) => ids.has(p.ofertaId));
  const r = resumirPostulaciones(ps);
  const rt = promedioRating(ratings, "empresa", empresaId);
  return {
    ofertas: propias.length,
    ofertasActivas: propias.filter((o) => o.estado === "activa").length,
    postulaciones: r.total,
    seleccionadas: r.porEstado.seleccionada + r.porEstado.en_negociacion,
    completadas: r.completadas,
    comisiones: r.comisiones,
    rating: rt.promedio,
    ratingTotal: rt.total,
  };
}

export interface ResumenLead {
  postulaciones: number;
  abiertas: number;
  seleccionadas: number;
  completadas: number;
  comisiones: number;
  rating: number;
  ratingTotal: number;
}

export function resumenLead(
  leadId: string,
  posts: Postulacion[],
  ratings: Rating[],
): ResumenLead {
  const ps = postulacionesDeLead(posts, leadId);
  const r = resumirPostulaciones(ps);
  const rt = promedioRating(ratings, "lead", leadId);
  return {
    postulaciones: r.total,
    abiertas: r.abiertas,
    seleccionadas: r.porEstado.seleccionada + r.porEstado.en_negociacion,
    completadas: r.completadas,
    comisiones: r.comisiones,
    rating: rt.promedio,
    ratingTotal: rt.total,
  };
}

export function promedioRating(
  ratings: Rating[],
  paraTipo: ActorTipo,
  paraId: string,
): { promedio: number; total: number } {
  let suma = 0;
  let total = 0;
  for (const r of ratings) {
    if (r.paraTipo === paraTipo && r.paraId === paraId) {
      suma += r.estrellas;
      total += 1;
    }
  }
  return { promedio: total === 0 ? 0 : suma / total, total };
}

export interface FilaRankingLead {
  lead: Lead;
  completadas: number;
  comisiones: number;
  postulaciones: number;
}

export function rankingLeads(
  posts: Postulacion[],
  leads: Lead[],
  opts?: { ofertaId?: string },
): FilaRankingLead[] {
  const acc = new Map<string, { completadas: number; comisiones: number; postulaciones: number }>();
  for (const p of posts) {
    if (opts?.ofertaId && p.ofertaId !== opts.ofertaId) continue;
    const cur = acc.get(p.leadId) ?? { completadas: 0, comisiones: 0, postulaciones: 0 };
    cur.postulaciones += 1;
    if (esCompletada(p)) cur.completadas += 1;
    if (p.comision) cur.comisiones += p.comision;
    acc.set(p.leadId, cur);
  }
  const leadById = new Map(leads.map((l) => [l.id, l]));
  return Array.from(acc.entries())
    .map(([leadId, v]) => ({ lead: leadById.get(leadId)!, ...v }))
    .filter((f) => f.lead)
    .sort((a, b) => b.comisiones - a.comisiones || b.completadas - a.completadas);
}

export interface FilaRankingEmpresa {
  empresa: Empresa;
  rating: number;
  ratingTotal: number;
  ofertas: number;
}

export function rankingEmpresas(
  empresas: Empresa[],
  ofertas: Oferta[],
  ratings: Rating[],
): FilaRankingEmpresa[] {
  return empresas
    .map((empresa) => {
      const rt = promedioRating(ratings, "empresa", empresa.id);
      return {
        empresa,
        rating: rt.promedio,
        ratingTotal: rt.total,
        ofertas: ofertas.filter((o) => o.empresaId === empresa.id).length,
      };
    })
    .sort((a, b) => b.rating - a.rating || b.ratingTotal - a.ratingTotal);
}

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export function comisionesPorMes(
  posts: Postulacion[],
  meses = 6,
): { mes: string; comisiones: number; cierres: number }[] {
  const ahora = new Date();
  const buckets = Array.from({ length: meses }, (_, i) => {
    const d = new Date(ahora.getFullYear(), ahora.getMonth() - (meses - 1 - i), 1);
    return { mes: MESES[d.getMonth()], comisiones: 0, cierres: 0 };
  });
  const base = new Date(ahora.getFullYear(), ahora.getMonth() - (meses - 1), 1);
  for (const p of posts) {
    if (!esCompletada(p) || !p.comision) continue;
    const fecha = new Date(p.fechaActualizacion);
    if (fecha < base) continue;
    const idx = (fecha.getFullYear() - base.getFullYear()) * 12 + (fecha.getMonth() - base.getMonth());
    if (idx < 0 || idx >= buckets.length) continue;
    buckets[idx].comisiones += p.comision;
    buckets[idx].cierres += 1;
  }
  return buckets;
}

export function embudoPostulaciones(conteo: ConteoEstados) {
  const orden: EstadoPostulacion[] = [
    "postulada",
    "en_revision",
    "seleccionada",
    "en_negociacion",
    "completada",
  ];
  return orden.map((estado) => ({
    label: estadoPostulacionMeta(estado).label,
    cantidad: conteo.porEstado[estado],
  }));
}
