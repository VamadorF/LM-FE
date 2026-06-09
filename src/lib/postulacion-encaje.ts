import type { ContactoPostulado, Oferta } from "./types";

export type EncajeEstado = "ok" | "parcial" | "no";

export interface PuntoEncaje {
  criterio: string;
  estado: EncajeEstado;
  detalle: string;
}

function normalizar(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function regionCoincide(ofertaRegion: string, contactoRegion: string): EncajeEstado {
  const o = normalizar(ofertaRegion);
  const c = normalizar(contactoRegion);
  if (!c) return "no";
  if (o === c || o.includes(c) || c.includes(o)) return "ok";
  if (o === "nacional" || o === "todo chile") return "ok";
  return "parcial";
}

export function puntosEncaje(oferta: Oferta, contacto: ContactoPostulado): PuntoEncaje[] {
  const puntos: PuntoEncaje[] = [];

  const regionEstado = regionCoincide(oferta.region, contacto.region);
  puntos.push({
    criterio: "Region",
    estado: regionEstado,
    detalle:
      regionEstado === "ok"
        ? `${contacto.comuna}, ${contacto.region}`
        : regionEstado === "parcial"
          ? `${contacto.region} (tu oferta apunta a ${oferta.region})`
          : "Sin region registrada",
  });

  puntos.push({
    criterio: "Empresa identificada",
    estado: contacto.empresa?.trim() ? "ok" : "no",
    detalle: contacto.empresa?.trim() || "Sin nombre de empresa",
  });

  puntos.push({
    criterio: "Contacto directo",
    estado: contacto.email && contacto.telefono ? "ok" : contacto.email || contacto.telefono ? "parcial" : "no",
    detalle:
      contacto.email && contacto.telefono
        ? "Email y telefono disponibles"
        : contacto.email
          ? "Solo email"
          : contacto.telefono
            ? "Solo telefono"
            : "Sin datos de contacto",
  });

  const criterios = normalizar(oferta.criterios);
  const perfil = normalizar(`${contacto.empresa} ${contacto.notas}`);
  const palabras = criterios
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 4)
    .slice(0, 6);
  const coincidencias = palabras.filter((w) => perfil.includes(w));
  const ratio = palabras.length === 0 ? 0 : coincidencias.length / palabras.length;

  puntos.push({
    criterio: "Perfil vs criterios",
    estado: ratio >= 0.35 ? "ok" : ratio > 0 ? "parcial" : "no",
    detalle:
      coincidencias.length > 0
        ? `Coincide con: ${coincidencias.slice(0, 3).join(", ")}`
        : "Revisa si el perfil calza con lo que buscas",
  });

  return puntos;
}

const PESO_ENCAJE: Record<EncajeEstado, number> = { ok: 1, parcial: 0.5, no: 0 };

export function scoreEncaje(puntos: PuntoEncaje[]): number {
  if (puntos.length === 0) return 0;
  const sum = puntos.reduce((acc, p) => acc + PESO_ENCAJE[p.estado], 0);
  return Math.round((sum / puntos.length) * 100);
}

export function scoreEncajeLabel(score: number): "Alto" | "Medio" | "Bajo" {
  if (score >= 75) return "Alto";
  if (score >= 40) return "Medio";
  return "Bajo";
}

export function scoreEncajeTone(score: number): string {
  if (score >= 75) return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (score >= 40) return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
}
