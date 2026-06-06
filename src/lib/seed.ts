import {
  calcularComision,
  CATEGORIAS_LISTA,
  contactoToSnapshot,
  type Contacto,
  type Empresa,
  type EstadoPostulacion,
  type Lead,
  type Lista,
  type Oferta,
  type Postulacion,
  type Rating,
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

const REF_DATE = new Date("2026-06-05T12:00:00").getTime();
const DAY = 86_400_000;
const daysAgoISO = (rng: () => number, maxDays: number) =>
  new Date(REF_DATE - Math.floor(rng() * maxDays * DAY) - Math.floor(rng() * DAY)).toISOString();

const NOMBRES = [
  "Camila Rojas", "Matias Fuentes", "Valentina Soto", "Benjamin Munoz", "Javiera Contreras",
  "Sebastian Vergara", "Antonia Morales", "Vicente Carrasco", "Fernanda Espinoza", "Diego Tapia",
  "Catalina Reyes", "Joaquin Sandoval", "Martina Nunez", "Cristobal Herrera", "Isidora Castillo",
  "Tomas Bravo", "Florencia Vega", "Agustin Pizarro", "Trinidad Lagos", "Maximiliano Cortes",
  "Emilia Figueroa", "Lucas Salazar", "Amanda Aguilera", "Felipe Cordero", "Constanza Miranda",
  "Ignacio Fuenzalida", "Josefa Riquelme", "Gaspar Donoso", "Rafaela Garrido", "Bruno Cifuentes",
  "Antonella Vera", "Mateo Cabrera", "Renata Ponce", "Vicente Alarcon", "Magdalena Rios",
  "Damian Soto", "Pascuala Leiva", "Borja Navarro", "Anais Carmona", "Teo Valenzuela",
  "Maite Olivares", "Simon Bustamante", "Colomba Saez", "Alonso Parra", "Ema Cerda",
  "Facundo Rivas", "Julieta Mella", "Santino Godoy", "Catalina Pavez", "Emiliano Ruiz",
];

const APELLIDOS = ["Rojas", "Soto", "Munoz", "Diaz", "Perez", "Gonzalez", "Lopez", "Fuentes", "Torres", "Silva", "Castro", "Vargas", "Reyes", "Flores", "Espinoza", "Morales", "Sepulveda", "Gutierrez", "Araya", "Cortes"];

const EMPRESAS_CONTACTO = [
  "Andes Logistica", "Pacifico Retail", "Cordillera Software", "Austral Foods", "Vina del Sur",
  "MetalCobre SpA", "Salmones Patagonia", "Constructora Aconcagua", "TecnoSur Ltda", "Frutas del Maule",
  "Energia Limpia Chile", "Transportes Bio Bio", "Clinica Andes", "Editorial Araucania", "Mineria Atacama",
  "Hotelera Lakes", "Importadora Maipo", "AgroValle Central", "Seguros Cono Sur", "Distribuidora Elqui",
];

const COMUNAS: [string, string][] = [
  ["Las Condes", "Metropolitana"], ["Providencia", "Metropolitana"], ["Santiago", "Metropolitana"],
  ["Vitacura", "Metropolitana"], ["Maipu", "Metropolitana"], ["Nunoa", "Metropolitana"],
  ["Vina del Mar", "Valparaiso"], ["Valparaiso", "Valparaiso"], ["Concepcion", "Biobio"],
  ["Temuco", "La Araucania"], ["Puerto Montt", "Los Lagos"], ["La Serena", "Coquimbo"],
  ["Antofagasta", "Antofagasta"], ["Rancagua", "OHiggins"], ["Talca", "Maule"], ["Iquique", "Tarapaca"],
];

const slug = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function rut(rng: () => number): string {
  const body = (Math.floor(rng() * 16_000_000) + 8_000_000).toString();
  const dvs = "0123456789K";
  return `${body}-${dvs[Math.floor(rng() * dvs.length)]}`;
}

function telefono(rng: () => number): string {
  return `+569${Math.floor(rng() * 90000000) + 10000000}`;
}

const RUBROS = [
  "Tecnologia", "Construccion", "Salud", "Retail", "Servicios financieros",
  "Logistica", "Energia", "Agroindustria",
];

export interface BaseData {
  empresas: Empresa[];
  leads: Lead[];
  contactos: Contacto[];
  listas: Lista[];
  ofertas: Oferta[];
  postulaciones: Postulacion[];
  ratings: Rating[];
}

const EMPRESAS_NOMBRE = [
  "Nodo Capital", "Vertex Salud", "Constructora Macul", "RetailMax Chile", "Quanta Energia",
  "LogiPro Sur", "AgroConecta", "FinTrust Chile",
];

const OFERTA_TITULOS: Record<string, string[]> = {
  Tecnologia: ["Implementacion de ERP para pymes", "Migracion a la nube empresarial", "Suscripciones SaaS de ciberseguridad"],
  Construccion: ["Proyectos de remodelacion comercial", "Suministro de hormigon premium", "Obras de eficiencia energetica"],
  Salud: ["Convenios de salud para empresas", "Equipamiento medico clinicas", "Telemedicina corporativa"],
  Retail: ["Apertura de tiendas franquiciadas", "Proveedores para marketplace", "Programa de fidelizacion B2B"],
  "Servicios financieros": ["Creditos para capital de trabajo", "Factoring para pymes", "Seguros corporativos"],
  Logistica: ["Contratos de ultima milla", "Almacenaje y fulfillment", "Flota de transporte refrigerado"],
  Energia: ["Paneles solares para industrias", "Eficiencia energetica empresarial", "Suministro electrico libre"],
  Agroindustria: ["Exportacion de fruta fresca", "Insumos agricolas al por mayor", "Riego tecnificado"],
};

function generarEmpresas(rng: () => number): Empresa[] {
  return EMPRESAS_NOMBRE.map((nombre, i) => {
    const [comuna, region] = COMUNAS[i % COMUNAS.length];
    return {
      id: `emp-${i + 1}`,
      nombre,
      rubro: RUBROS[i % RUBROS.length],
      descripcion: `${nombre} conecta su oferta con una red de referidores para escalar sus ventas en el mercado chileno.`,
      sitioWeb: `www.${slug(nombre)}.cl`,
      comuna,
      region,
      verificada: rng() > 0.3,
      fechaIngreso: daysAgoISO(rng, 720),
    };
  });
}

function generarLeads(rng: () => number, n: number): Lead[] {
  return Array.from({ length: n }, (_, i) => {
    const nombre = NOMBRES[i % NOMBRES.length];
    const [comuna, region] = COMUNAS[Math.floor(rng() * COMUNAS.length)];
    return {
      id: `lead-${i + 1}`,
      nombre,
      email: `${slug(nombre)}${i}@correo.cl`,
      telefono: telefono(rng),
      comuna,
      region,
      bio: "Conector con amplia red de contactos comerciales. Postula prospectos calificados y acompana el cierre.",
      fechaIngreso: daysAgoISO(rng, 600),
    };
  });
}

function generarContactos(rng: () => number, leads: Lead[]): Contacto[] {
  const contactos: Contacto[] = [];
  let idx = 0;
  for (const lead of leads) {
    const cantidad = 40 + Math.floor(rng() * 80);
    for (let i = 0; i < cantidad; i++) {
      idx += 1;
      const [comuna, region] = COMUNAS[Math.floor(rng() * COMUNAS.length)];
      const nombre = `${NOMBRES[Math.floor(rng() * NOMBRES.length)].split(" ")[0]} ${APELLIDOS[Math.floor(rng() * APELLIDOS.length)]}`;
      const empresaContacto = EMPRESAS_CONTACTO[Math.floor(rng() * EMPRESAS_CONTACTO.length)];
      const fecha = daysAgoISO(rng, 380);
      contactos.push({
        id: `con-${idx}`,
        leadId: lead.id,
        nombre,
        email: `${slug(nombre)}.${idx}@${slug(empresaContacto)}.cl`,
        telefono: telefono(rng),
        empresa: empresaContacto,
        rut: rut(rng),
        comuna,
        region,
        notas: NOTAS_CONTACTO[Math.floor(rng() * NOTAS_CONTACTO.length)],
        fechaCreacion: fecha,
        fechaActualizacion: fecha,
      });
    }
  }
  return contactos;
}

const LISTA_DESCRIPCIONES = [
  "Contactos comerciales acumulados a lo largo de los anos.",
  "Personas con interes declarado y presupuesto disponible.",
  "Red cercana de confianza para oportunidades selectas.",
  "Base de prospectos a calificar antes de postular.",
  "Cartera activa con historial de cierres positivos.",
];

function generarListas(rng: () => number, leads: Lead[], contactos: Contacto[]): Lista[] {
  const contactosPorLead = new Map<string, Contacto[]>();
  for (const c of contactos) {
    const arr = contactosPorLead.get(c.leadId);
    if (arr) arr.push(c);
    else contactosPorLead.set(c.leadId, [c]);
  }
  const listas: Lista[] = [];
  let idx = 0;
  for (const lead of leads) {
    const propios = contactosPorLead.get(lead.id) ?? [];
    if (propios.length === 0) continue;
    const cantidad = 3 + Math.floor(rng() * 3);
    const categorias = [...CATEGORIAS_LISTA].sort(() => rng() - 0.5).slice(0, cantidad);
    for (const categoria of categorias) {
      idx += 1;
      const fecha = daysAgoISO(rng, 400);
      const miembros = propios
        .filter(() => rng() < 0.35)
        .map((c) => c.id);
      const contactoIds =
        miembros.length > 0 ? miembros : [propios[Math.floor(rng() * propios.length)].id];
      listas.push({
        id: `lst-${idx}`,
        leadId: lead.id,
        nombre: categoria,
        categoria,
        descripcion: LISTA_DESCRIPCIONES[Math.floor(rng() * LISTA_DESCRIPCIONES.length)],
        contactoIds,
        fechaCreacion: fecha,
        fechaActualizacion: fecha,
      });
    }
  }
  return listas;
}

function generarOfertas(rng: () => number, empresas: Empresa[]): Oferta[] {
  const ofertas: Oferta[] = [];
  let idx = 0;
  for (const empresa of empresas) {
    const cantidad = 2 + Math.floor(rng() * 2);
    const titulos = OFERTA_TITULOS[empresa.rubro] ?? OFERTA_TITULOS.Tecnologia;
    for (let k = 0; k < cantidad; k++) {
      idx += 1;
      const titulo = titulos[k % titulos.length];
      const tipoComision = rng() > 0.45 ? "porcentaje" : "fijo";
      const [, region] = COMUNAS[Math.floor(rng() * COMUNAS.length)];
      const destacada = idx === 1 || idx === 5;
      ofertas.push({
        id: `of-${idx}`,
        empresaId: empresa.id,
        slug: `${slug(titulo)}-${idx}`,
        titulo,
        descripcion: `${empresa.nombre} busca contactos calificados para ${titulo.toLowerCase()}. Postula prospectos de tu red y gana comision cuando se concrete el negocio.`,
        categoria: empresa.rubro,
        estado: rng() > 0.2 ? "activa" : rng() > 0.5 ? "pausada" : "cerrada",
        tipoComision,
        valorComision: tipoComision === "porcentaje" ? [3, 4, 5, 6, 8, 10][Math.floor(rng() * 6)] : [50000, 80000, 120000, 200000, 300000][Math.floor(rng() * 5)],
        valorTicketEstimado: ([2, 4, 6, 10, 15, 25][Math.floor(rng() * 6)]) * 1_000_000,
        objetivoContactos: destacada ? 5000 : [100, 250, 500, 800][Math.floor(rng() * 4)],
        criterios: "Empresas o personas con interes real, presupuesto disponible y decision de compra en el corto plazo.",
        region: rng() > 0.5 ? "Todo Chile" : region,
        destacada,
        fechaInicio: daysAgoISO(rng, 120),
        fechaCierre: new Date(REF_DATE + (20 + Math.floor(rng() * 120)) * DAY).toISOString(),
      });
    }
  }
  return ofertas;
}

const NOTAS_CONTACTO = [
  "Gerente de operaciones. Empresa en proceso de digitalizacion.",
  "Decisor de compras TI. Presupuesto aprobado para Q3.",
  "Ex colega mio. Confianza alta y acceso directo al dueño.",
  "Participo en su mesa de proveedores. Conozco su stack actual.",
  "Referido por cliente en comun. Ya pidio cotizacion informal.",
  "Empresa mediana (30-80 empleados) con dolor operativo claro.",
  "Busca reemplazar planillas y procesos manuales este semestre.",
  "Contacto calido: reunion exploratoria posible en 2 semanas.",
];

function generarMensajePostulacion(
  rng: () => number,
  oferta: Oferta,
  contacto: Contacto,
  lead: Lead,
  lista: Lista | null,
): string {
  const plantillas = [
    `Conozco a ${contacto.nombre} de ${contacto.empresa} hace tiempo. Creo que encaja con "${oferta.titulo}" porque ${contacto.notas.toLowerCase()}`,
    `Recomiendo a ${contacto.nombre} (${contacto.empresa}): tiene necesidad real alineada con tu oferta de ${oferta.categoria.toLowerCase()}. Puedo facilitar una intro directa.`,
    `${contacto.empresa} esta evaluando proveedores. ${contacto.nombre} es quien lidera la decision. Te propongo este contacto porque cumple tus criterios de ${oferta.criterios.slice(0, 60).toLowerCase()}...`,
    `Postulo a ${contacto.nombre} porque confio en su seriedad y en el timing: estan abiertos a conversar sobre ${oferta.titulo.toLowerCase()}.`,
  ];
  let mensaje = plantillas[Math.floor(rng() * plantillas.length)];
  if (lista) {
    mensaje += ` Viene de mi lista "${lista.nombre}" (${lista.categoria}).`;
  }
  mensaje += ` — ${lead.nombre}`;
  return mensaje;
}

const ESTADO_POOL: EstadoPostulacion[] = [
  "postulada", "postulada", "postulada", "en_revision", "en_revision",
  "seleccionada", "en_negociacion", "completada", "completada", "rechazada",
];

function generarPostulaciones(
  rng: () => number,
  ofertas: Oferta[],
  leads: Lead[],
  contactos: Contacto[],
  listas: Lista[],
): Postulacion[] {
  const postulaciones: Postulacion[] = [];
  const contactosPorLead = new Map<string, Contacto[]>();
  for (const c of contactos) {
    const arr = contactosPorLead.get(c.leadId);
    if (arr) arr.push(c);
    else contactosPorLead.set(c.leadId, [c]);
  }
  const listasPorContacto = new Map<string, string[]>();
  for (const lista of listas) {
    for (const cid of lista.contactoIds) {
      const arr = listasPorContacto.get(cid);
      if (arr) arr.push(lista.id);
      else listasPorContacto.set(cid, [lista.id]);
    }
  }
  const leadsConContactos = leads.filter((l) => (contactosPorLead.get(l.id)?.length ?? 0) > 0);
  let id = 0;
  for (const oferta of ofertas) {
    let cantidad: number;
    if (oferta.destacada) {
      cantidad = oferta.id === "of-1" ? 4200 : 2600;
    } else if (oferta.estado === "cerrada") {
      cantidad = 30 + Math.floor(rng() * 120);
    } else {
      cantidad = 40 + Math.floor(rng() * 560);
    }
    for (let i = 0; i < cantidad; i++) {
      id += 1;
      const lead = leadsConContactos[Math.floor(rng() * leadsConContactos.length)];
      const propios = contactosPorLead.get(lead.id)!;
      const contacto = propios[Math.floor(rng() * propios.length)];
      const listasDelContacto = listasPorContacto.get(contacto.id) ?? [];
      const listaId =
        listasDelContacto.length > 0 && rng() < 0.7
          ? listasDelContacto[Math.floor(rng() * listasDelContacto.length)]
          : null;
      const estado = ESTADO_POOL[Math.floor(rng() * ESTADO_POOL.length)];
      let valorTransaccion: number | null = null;
      let comision: number | null = null;
      if (estado === "completada") {
        valorTransaccion = Math.round(oferta.valorTicketEstimado * (0.6 + rng() * 0.9));
        comision = calcularComision(oferta, valorTransaccion);
      }
      const fechaPostulacion = daysAgoISO(rng, 110);
      const lista = listaId ? listas.find((l) => l.id === listaId) ?? null : null;
      postulaciones.push({
        id: `post-${id}`,
        ofertaId: oferta.id,
        leadId: lead.id,
        contactoId: contacto.id,
        listaId,
        mensaje: generarMensajePostulacion(rng, oferta, contacto, lead, lista),
        contacto: contactoToSnapshot(contacto),
        estado,
        valorTransaccion,
        comision,
        fechaPostulacion,
        fechaActualizacion: fechaPostulacion,
      });
    }
  }
  return postulaciones;
}

const COMENT_EMP = [
  "Excelente conector, el contacto estaba muy bien calificado.",
  "Buen prospecto, aunque tardo en responder.",
  "Contacto serio y con presupuesto real. Recomendado.",
  "El lead acompano todo el proceso, gran trabajo.",
];
const COMENT_LEAD = [
  "Empresa clara con el proceso y pago puntual de la comision.",
  "Buena comunicacion, retroalimentacion rapida.",
  "Proceso de seleccion transparente, volveria a postular.",
  "Pago de comision a tiempo, muy recomendable.",
];

function generarRatings(
  rng: () => number,
  ofertas: Oferta[],
  postulaciones: Postulacion[],
): Rating[] {
  const ofertaPorId = new Map(ofertas.map((o) => [o.id, o]));
  const completadas = postulaciones.filter((p) => p.estado === "completada");
  const ratings: Rating[] = [];
  let id = 0;
  for (let i = 0; i < completadas.length; i += 3) {
    const p = completadas[i];
    const oferta = ofertaPorId.get(p.ofertaId);
    if (!oferta) continue;
    if (ratings.length > 800) break;
    const estrellasEmp = 3 + Math.floor(rng() * 3);
    const estrellasLead = 3 + Math.floor(rng() * 3);
    id += 1;
    ratings.push({
      id: `rat-${id}`,
      ofertaId: oferta.id,
      postulacionId: p.id,
      deTipo: "empresa",
      deId: oferta.empresaId,
      paraTipo: "lead",
      paraId: p.leadId,
      estrellas: estrellasEmp,
      comentario: COMENT_EMP[Math.floor(rng() * COMENT_EMP.length)],
      fecha: p.fechaActualizacion,
    });
    id += 1;
    ratings.push({
      id: `rat-${id}`,
      ofertaId: oferta.id,
      postulacionId: p.id,
      deTipo: "lead",
      deId: p.leadId,
      paraTipo: "empresa",
      paraId: oferta.empresaId,
      estrellas: estrellasLead,
      comentario: COMENT_LEAD[Math.floor(rng() * COMENT_LEAD.length)],
      fecha: p.fechaActualizacion,
    });
  }
  return ratings;
}

export function generarBase(): BaseData {
  const rng = mulberry32(20260605);
  const empresas = generarEmpresas(rng);
  const leads = generarLeads(rng, 50);
  const contactos = generarContactos(rng, leads);
  const listas = generarListas(rng, leads, contactos);
  const ofertas = generarOfertas(rng, empresas);
  const postulaciones = generarPostulaciones(rng, ofertas, leads, contactos, listas);
  const ratings = generarRatings(rng, ofertas, postulaciones);
  return { empresas, leads, contactos, listas, ofertas, postulaciones, ratings };
}
