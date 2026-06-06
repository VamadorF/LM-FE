import type {
  Actividad,
  Agente,
  EtapaLead,
  Lead,
  OrigenLead,
  Prioridad,
  Referidor,
  TipoActividad,
} from "./types";

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260605);
const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const range = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;

const REF_DATE = new Date("2026-06-05T12:00:00").getTime();
const DAY = 86_400_000;
const daysAgoISO = (days: number, minutesOffset = 0) =>
  new Date(REF_DATE - days * DAY + minutesOffset * 60000).toISOString();

const NOMBRES = [
  "Camila Rojas",
  "Matias Fuentes",
  "Valentina Soto",
  "Benjamin Munoz",
  "Javiera Contreras",
  "Sebastian Vergara",
  "Antonia Morales",
  "Vicente Carrasco",
  "Fernanda Espinoza",
  "Diego Tapia",
  "Catalina Reyes",
  "Joaquin Sandoval",
  "Martina Nunez",
  "Cristobal Herrera",
  "Isidora Castillo",
  "Tomas Bravo",
  "Florencia Vega",
  "Agustin Pizarro",
  "Trinidad Lagos",
  "Maximiliano Cortes",
  "Emilia Figueroa",
  "Lucas Salazar",
  "Amanda Aguilera",
  "Felipe Cordero",
  "Constanza Miranda",
  "Ignacio Fuenzalida",
  "Josefa Riquelme",
  "Gaspar Donoso",
  "Rafaela Garrido",
  "Bruno Cifuentes",
];

const EMPRESAS = [
  "Andes Logistica",
  "Pacifico Retail",
  "Cordillera Software",
  "Austral Foods",
  "Vina del Sur",
  "MetalCobre SpA",
  "Salmones Patagonia",
  "Constructora Aconcagua",
  "TecnoSur Ltda",
  "Frutas del Maule",
  "Energia Limpia Chile",
  "Transportes Bio Bio",
  "Clinica Las Condes Norte",
  "Editorial Araucania",
  "Mineria Atacama",
  "Hotelera Lakes",
  "Importadora Maipo",
  "AgroValle Central",
  "Seguros Cono Sur",
  "Distribuidora Elqui",
  "Pesquera Coquimbo",
  "Textiles Nube",
  "Cafe Valparaiso",
  "Inmobiliaria Reloncavi",
];

const COMUNAS: [string, string][] = [
  ["Las Condes", "Metropolitana"],
  ["Providencia", "Metropolitana"],
  ["Santiago Centro", "Metropolitana"],
  ["Vitacura", "Metropolitana"],
  ["Maipu", "Metropolitana"],
  ["Vina del Mar", "Valparaiso"],
  ["Valparaiso", "Valparaiso"],
  ["Concepcion", "Biobio"],
  ["Temuco", "La Araucania"],
  ["Puerto Montt", "Los Lagos"],
  ["La Serena", "Coquimbo"],
  ["Antofagasta", "Antofagasta"],
  ["Rancagua", "O'Higgins"],
  ["Talca", "Maule"],
];

const ETIQUETAS = [
  "enterprise",
  "pyme",
  "renovacion",
  "demo-solicitada",
  "presupuesto-aprobado",
  "urgente",
  "competencia",
  "upsell",
  "primer-contacto",
  "decision-comite",
];

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.|\.$/g, "");

function rut(): string {
  const body = range(8_000_000, 24_999_999).toString();
  const dvs = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "K"];
  return `${body}${pick(dvs)}`;
}

function telefono(): string {
  return `+569${range(60000000, 99999999)}`;
}

export const agentes: Agente[] = [
  {
    id: "ag-1",
    nombre: "Paula Carvajal",
    email: "paula.carvajal@leadmanager.cl",
    telefono: telefono(),
    rol: "lider",
    metaMensual: 45_000_000,
    fechaIngreso: daysAgoISO(940),
  },
  {
    id: "ag-2",
    nombre: "Rodrigo Alvarez",
    email: "rodrigo.alvarez@leadmanager.cl",
    telefono: telefono(),
    rol: "senior",
    metaMensual: 32_000_000,
    fechaIngreso: daysAgoISO(610),
  },
  {
    id: "ag-3",
    nombre: "Daniela Pena",
    email: "daniela.pena@leadmanager.cl",
    telefono: telefono(),
    rol: "senior",
    metaMensual: 30_000_000,
    fechaIngreso: daysAgoISO(420),
  },
  {
    id: "ag-4",
    nombre: "Nicolas Ortiz",
    email: "nicolas.ortiz@leadmanager.cl",
    telefono: telefono(),
    rol: "ejecutivo",
    metaMensual: 22_000_000,
    fechaIngreso: daysAgoISO(190),
  },
  {
    id: "ag-5",
    nombre: "Macarena Silva",
    email: "macarena.silva@leadmanager.cl",
    telefono: telefono(),
    rol: "ejecutivo",
    metaMensual: 20_000_000,
    fechaIngreso: daysAgoISO(95),
  },
];

const RELACIONES = [
  "Ex cliente",
  "Socio comercial",
  "Contacto del rubro",
  "Camara de comercio",
  "Proveedor aliado",
  "Recomendacion personal",
  "Gremio empresarial",
  "Consultor externo",
];

export const referidores: Referidor[] = [
  "Hernan Lillo",
  "Marcela Tobar",
  "Andres Quezada",
  "Pilar Echeverria",
  "Gonzalo Bustos",
  "Veronica Saavedra",
  "Patricio Maldonado",
  "Carolina Venegas",
].map((nombre, i) => ({
  id: `ref-${i + 1}`,
  nombre,
  relacion: pick(RELACIONES),
  email: `${slug(nombre)}@gmail.com`,
  telefono: telefono(),
  porcentajeComision: pick([3, 4, 5, 5, 6, 7, 8, 10]),
  estado: rand() > 0.18 ? "activo" : "inactivo",
  fechaIngreso: daysAgoISO(range(60, 520)),
  notas: "",
}));

const ETAPAS_POOL: EtapaLead[] = [
  "nuevo",
  "nuevo",
  "contactado",
  "contactado",
  "calificado",
  "calificado",
  "propuesta",
  "negociacion",
  "ganado",
  "ganado",
  "perdido",
];

const ORIGENES_POOL: OrigenLead[] = [
  "web",
  "web",
  "referido",
  "referido",
  "referido",
  "llamada",
  "feria",
  "redes",
  "email",
];

const PRIORIDADES_POOL: Prioridad[] = ["baja", "media", "media", "alta", "alta"];

function buildLeads(count: number): Lead[] {
  const leads: Lead[] = [];
  for (let i = 0; i < count; i++) {
    const nombre = NOMBRES[i % NOMBRES.length];
    const empresa = pick(EMPRESAS);
    const [comuna, region] = pick(COMUNAS);
    const origen = pick(ORIGENES_POOL);
    const etapa = pick(ETAPAS_POOL);
    const referidorId =
      origen === "referido" ? pick(referidores).id : rand() > 0.8 ? pick(referidores).id : null;
    const createdDays = range(2, 160);
    const tags = Array.from(
      new Set([pick(ETIQUETAS), ...(rand() > 0.5 ? [pick(ETIQUETAS)] : [])]),
    );
    leads.push({
      id: `lead-${i + 1}`,
      nombre,
      empresa,
      rut: rut(),
      email: `${slug(nombre)}@${slug(empresa)}.cl`,
      telefono: telefono(),
      comuna,
      region,
      valorEstimado: range(8, 220) * 250_000,
      etapa,
      origen,
      referidorId,
      agenteId: pick(agentes).id,
      prioridad: pick(PRIORIDADES_POOL),
      etiquetas: tags,
      notas:
        rand() > 0.5
          ? "Interesado en plan anual. Solicita propuesta formal y referencias de clientes del mismo rubro."
          : "Primer acercamiento, evaluar necesidad real y presupuesto disponible para este trimestre.",
      fechaCreacion: daysAgoISO(createdDays),
      ultimaActividad: daysAgoISO(range(0, Math.min(createdDays, 20)), range(0, 600)),
    });
  }
  return leads;
}

export const leads: Lead[] = buildLeads(30);

const ACT_TIPOS: TipoActividad[] = ["llamada", "email", "reunion", "whatsapp", "nota"];
const ACT_TEXTOS: Record<TipoActividad, string[]> = {
  llamada: [
    "Llamada de seguimiento, confirmamos interes y proximos pasos.",
    "Contacto telefonico inicial, presentamos la propuesta de valor.",
    "Llamada para coordinar reunion con el equipo de compras.",
  ],
  email: [
    "Enviamos cotizacion formal con detalle de planes.",
    "Correo con casos de exito del mismo sector.",
    "Seguimiento por correo, sin respuesta aun.",
  ],
  reunion: [
    "Reunion de descubrimiento, levantamos requerimientos.",
    "Demo del producto con el equipo tecnico del cliente.",
    "Reunion de cierre, revisamos condiciones comerciales.",
  ],
  whatsapp: [
    "Mensaje por WhatsApp coordinando horario de llamada.",
    "Cliente responde por WhatsApp solicitando descuento.",
  ],
  nota: [
    "El comite decide la proxima semana, mantener contacto.",
    "Presupuesto aprobado por gerencia, avanzar a propuesta.",
    "Compite con otro proveedor, destacar soporte local.",
  ],
};

function buildActividades(): Actividad[] {
  const acts: Actividad[] = [];
  let counter = 1;
  for (const lead of leads) {
    const n = range(1, 5);
    for (let i = 0; i < n; i++) {
      const tipo = pick(ACT_TIPOS);
      acts.push({
        id: `act-${counter++}`,
        leadId: lead.id,
        agenteId: lead.agenteId,
        tipo,
        descripcion: pick(ACT_TEXTOS[tipo]),
        fecha: daysAgoISO(range(0, 40), range(0, 800)),
      });
    }
  }
  return acts.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
}

export const actividades: Actividad[] = buildActividades();
