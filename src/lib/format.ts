const CLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export function formatCLP(value: number): string {
  return CLP.format(value || 0);
}

export function formatCompactCLP(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toLocaleString("es-CL", { maximumFractionDigits: 1 })}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toLocaleString("es-CL", { maximumFractionDigits: 0 })}K`;
  }
  return formatCLP(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-CL").format(value || 0);
}

export function formatPercent(value: number, fractionDigits = 1): string {
  return `${(value || 0).toLocaleString("es-CL", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}%`;
}

const cleanRut = (rut: string) => rut.replace(/[^0-9kK]/g, "").toUpperCase();

export function formatRut(rut: string): string {
  const clean = cleanRut(rut);
  if (clean.length < 2) return rut;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  const withDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${withDots}-${dv}`;
}

const DATE = new Intl.DateTimeFormat("es-CL", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const DATETIME = new Intl.DateTimeFormat("es-CL", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(iso: string): string {
  return DATE.format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return DATETIME.format(new Date(iso));
}

export function formatRelative(iso: string): string {
  const date = new Date(iso);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMin = Math.round(diffMs / 60000);
  const diffH = Math.round(diffMs / 3_600_000);
  const diffD = Math.round(diffMs / 86_400_000);

  if (diffMin < 1) return "recien";
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffH < 24) return `hace ${diffH} h`;
  if (diffD < 30) return `hace ${diffD} d`;
  return formatDate(iso);
}

export function fechaFuturaISO(dias: number): string {
  return new Date(Date.now() + dias * 86_400_000).toISOString();
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function pluralize(n: number, singular: string, plural: string): string {
  return n === 1 ? singular : plural;
}

export function formatPostulaciones(n: number): string {
  return `${formatNumber(n)} ${pluralize(n, "postulación", "postulaciones")}`;
}

export function formatSeleccionadas(n: number): string {
  return `${formatNumber(n)} ${pluralize(n, "seleccionada", "seleccionadas")}`;
}
