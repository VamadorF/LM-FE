"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  bootstrapAuth,
  checkApiHealth,
  contactBooksApi,
  contactsApi,
  proposalsApi,
} from "./api";
import { generarBase } from "./seed";
import {
  calcularComision,
  contactoToSnapshot,
  type Contacto,
  type Empresa,
  type EstadoPostulacion,
  type Lead,
  type Lista,
  type Oferta,
  type Postulacion,
  type Rating,
  type Rol,
} from "./types";

export interface Identidad {
  rol: Rol;
  empresaId: string;
  leadId: string;
}

interface Deltas {
  identidad: Identidad;
  ofertaPatches: Record<string, Partial<Oferta>>;
  ofertasNuevas: Oferta[];
  postPatches: Record<string, Partial<Postulacion>>;
  postNuevas: Postulacion[];
  ratingsUsuario: Rating[];
  contactosNuevos: Contacto[];
  contactoPatches: Record<string, Partial<Contacto>>;
  contactosEliminados: string[];
  listasNuevas: Lista[];
  listaPatches: Record<string, Partial<Lista>>;
  listasEliminadas: string[];
}

export interface MarketState extends Deltas {
  empresas: Empresa[];
  leads: Lead[];
  contactos: Contacto[];
  listas: Lista[];
  ofertas: Oferta[];
  postulaciones: Postulacion[];
  ratings: Rating[];

  apiConectado: boolean;
  apiCargando: boolean;
  apiError: string | null;
  apiCompanyId: string | null;
  apiLeadId: string | null;

  setRol: (rol: Rol) => void;
  setEmpresaActiva: (id: string) => void;
  setLeadActivo: (id: string) => void;
  inicializarApi: () => Promise<void>;

  crearOferta: (
    data: Omit<Oferta, "id" | "slug" | "fechaInicio">,
  ) => Promise<Oferta>;
  actualizarOferta: (id: string, patch: Partial<Oferta>) => Promise<void>;

  crearContacto: (
    data: Omit<Contacto, "id" | "fechaCreacion" | "fechaActualizacion">,
  ) => Promise<Contacto>;
  actualizarContacto: (id: string, patch: Partial<Contacto>) => Promise<void>;
  eliminarContacto: (id: string) => Promise<void>;

  crearLista: (
    data: Pick<Lista, "leadId" | "nombre" | "categoria" | "descripcion"> & {
      contactoIds?: string[];
    },
  ) => Promise<Lista>;
  actualizarLista: (id: string, patch: Partial<Lista>) => Promise<void>;
  eliminarLista: (id: string) => Promise<void>;
  agregarContactosALista: (listaId: string, contactoIds: string[]) => Promise<void>;
  quitarContactoDeLista: (listaId: string, contactoId: string) => Promise<void>;

  postularContactos: (
    ofertaId: string,
    leadId: string,
    listaId: string | null,
    contactoIds: string[],
    mensaje: string,
  ) => Postulacion[];
  cambiarEstado: (id: string, estado: EstadoPostulacion) => void;
  cambiarEstadoBulk: (ids: string[], estado: EstadoPostulacion) => void;
  completarTransaccion: (id: string, valorTransaccion: number) => void;

  calificar: (data: Omit<Rating, "id" | "fecha">) => void;

  reset: () => void;
}

const nowISO = () => new Date().toISOString();
const genId = (p: string) =>
  `${p}-${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;

const slug = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const defaultIdentidad: Identidad = { rol: "lead", empresaId: "emp-1", leadId: "lead-1" };

function deltasVacios() {
  return {
    ofertaPatches: {} as Record<string, Partial<Oferta>>,
    ofertasNuevas: [] as Oferta[],
    postPatches: {} as Record<string, Partial<Postulacion>>,
    postNuevas: [] as Postulacion[],
    ratingsUsuario: [] as Rating[],
    contactosNuevos: [] as Contacto[],
    contactoPatches: {} as Record<string, Partial<Contacto>>,
    contactosEliminados: [] as string[],
    listasNuevas: [] as Lista[],
    listaPatches: {} as Record<string, Partial<Lista>>,
    listasEliminadas: [] as string[],
  };
}

function estadoInicial() {
  const base = generarBase();
  return {
    ...base,
    identidad: defaultIdentidad,
    ...deltasVacios(),
  };
}

type ContactoLegacy = Contacto & { libretaId?: string };
type PostulacionLegacy = Postulacion & { libretaId?: string };

function normalizarContacto(c: ContactoLegacy): Contacto {
  const { libretaId, ...rest } = c;
  void libretaId;
  return rest;
}

function normalizarPostulacion(p: PostulacionLegacy): Postulacion {
  const { libretaId, listaId, mensaje, ...rest } = p;
  return {
    ...rest,
    listaId: listaId ?? libretaId ?? null,
    mensaje: mensaje ?? "",
  };
}

function normalizarPostPatch(patch: Partial<PostulacionLegacy>): Partial<Postulacion> {
  const { libretaId, listaId, ...rest } = patch;
  const out: Partial<Postulacion> = { ...rest };
  if (listaId !== undefined || libretaId !== undefined) {
    out.listaId = listaId ?? libretaId ?? null;
  }
  return out;
}

function deltasDesdeLegacy(raw: Record<string, unknown>): Partial<Deltas> {
  const postNuevas = ((raw.postNuevas ?? []) as PostulacionLegacy[]).map(normalizarPostulacion);
  const postPatches: Record<string, Partial<Postulacion>> = {};
  for (const [id, patch] of Object.entries(
    (raw.postPatches ?? {}) as Record<string, Partial<PostulacionLegacy>>,
  )) {
    postPatches[id] = normalizarPostPatch(patch);
  }
  const contactosNuevos = ((raw.contactosNuevos ?? []) as ContactoLegacy[]).map(normalizarContacto);
  const contactoPatches: Record<string, Partial<Contacto>> = {};
  for (const [id, patch] of Object.entries(
    (raw.contactoPatches ?? {}) as Record<string, Partial<ContactoLegacy>>,
  )) {
    const { libretaId, ...rest } = patch;
    void libretaId;
    contactoPatches[id] = rest;
  }

  return {
    identidad: raw.identidad as Identidad | undefined,
    ofertaPatches: (raw.ofertaPatches ?? {}) as Record<string, Partial<Oferta>>,
    ofertasNuevas: (raw.ofertasNuevas ?? []) as Oferta[],
    postPatches,
    postNuevas,
    ratingsUsuario: (raw.ratingsUsuario ?? []) as Rating[],
    contactosNuevos,
    contactoPatches,
    contactosEliminados: (raw.contactosEliminados ?? []) as string[],
    listasNuevas: (raw.listasNuevas ?? []) as Lista[],
    listaPatches: (raw.listaPatches ?? {}) as Record<string, Partial<Lista>>,
    listasEliminadas: (raw.listasEliminadas ?? []) as string[],
  };
}

/** Aplica un cambio a una lista, persistiendo en listasNuevas o listaPatches segun corresponda. */
function isApiLead(s: MarketState, leadId: string) {
  return Boolean(s.apiConectado && s.apiLeadId && s.apiLeadId === leadId);
}

function isApiCompany(s: MarketState, empresaId: string) {
  return Boolean(s.apiConectado && s.apiCompanyId && s.apiCompanyId === empresaId);
}

function isApiLista(s: MarketState, listaId: string) {
  return Boolean(s.apiConectado && s.listas.some((l) => l.id === listaId && l.leadId === s.apiLeadId));
}

function isApiOferta(s: MarketState, ofertaId: string) {
  const oferta = s.ofertas.find((o) => o.id === ofertaId);
  return Boolean(oferta && isApiCompany(s, oferta.empresaId) && oferta.estado !== "borrador");
}

function aplicarCambioLista(s: MarketState, id: string, patch: Partial<Lista>) {
  const full = { ...patch, fechaActualizacion: nowISO() };
  const esNueva = s.listasNuevas.some((l) => l.id === id);
  return {
    listas: s.listas.map((l) => (l.id === id ? { ...l, ...full } : l)),
    listasNuevas: esNueva
      ? s.listasNuevas.map((l) => (l.id === id ? { ...l, ...full } : l))
      : s.listasNuevas,
    listaPatches: esNueva
      ? s.listaPatches
      : { ...s.listaPatches, [id]: { ...s.listaPatches[id], ...full } },
  };
}

export const useStore = create<MarketState>()(
  persist(
    (set, get) => ({
      ...estadoInicial(),
      apiConectado: false,
      apiCargando: false,
      apiError: null,
      apiCompanyId: null,
      apiLeadId: null,

      setRol: (rol) => set((s) => ({ identidad: { ...s.identidad, rol } })),
      setEmpresaActiva: (id) => set((s) => ({ identidad: { ...s.identidad, empresaId: id } })),
      setLeadActivo: (id) => set((s) => ({ identidad: { ...s.identidad, leadId: id } })),

      inicializarApi: async () => {
        const s = get();
        if (s.apiCargando || s.apiConectado) return;
        set({ apiCargando: true, apiError: null });
        try {
          const healthy = await checkApiHealth();
          if (!healthy) {
            set({ apiCargando: false, apiError: "Backend no disponible. Modo mock activo." });
            return;
          }

          const boot = await bootstrapAuth();
          const [apiContactos, apiListas, apiOfertasEmpresa, apiOfertasPublicas] =
            await Promise.all([
              contactsApi.fetchContacts(boot.leadId),
              contactBooksApi.fetchContactBooks(boot.leadId),
              proposalsApi.fetchMyProposals(boot.companyId),
              proposalsApi.fetchPublicProposals(),
            ]);

          set((st) => {
            const otrasEmpresas = st.empresas.filter((e) => e.id !== boot.companyId);
            const otrosLeads = st.leads.filter((l) => l.id !== boot.leadId);
            const otrosContactos = st.contactos.filter((c) => c.leadId !== boot.leadId);
            const otrasListas = st.listas.filter((l) => l.leadId !== boot.leadId);
            const borradoresLocales = [
              ...st.ofertasNuevas,
              ...st.ofertas,
            ].filter(
              (o) =>
                o.empresaId === boot.companyId &&
                o.estado === "borrador" &&
                !apiOfertasEmpresa.some((ao) => ao.id === o.id),
            );
            const idsApiEmpresa = new Set(apiOfertasEmpresa.map((o) => o.id));
            const idsApiPublicas = new Set(apiOfertasPublicas.map((o) => o.id));
            const ofertasSeed = st.ofertas.filter(
              (o) =>
                o.empresaId !== boot.companyId &&
                !idsApiEmpresa.has(o.id) &&
                !idsApiPublicas.has(o.id),
            );
            const ofertasPublicasNuevas = apiOfertasPublicas.filter(
              (o) => o.empresaId !== boot.companyId && !ofertasSeed.some((s) => s.id === o.id),
            );

            return {
              apiConectado: true,
              apiCargando: false,
              apiError: null,
              apiCompanyId: boot.companyId,
              apiLeadId: boot.leadId,
              empresas: [boot.empresa, ...otrasEmpresas],
              leads: [boot.lead, ...otrosLeads],
              contactos: [...apiContactos, ...otrosContactos],
              listas: [...apiListas, ...otrasListas],
              ofertas: [
                ...apiOfertasEmpresa,
                ...borradoresLocales,
                ...ofertasPublicasNuevas,
                ...ofertasSeed,
              ],
              identidad: {
                ...st.identidad,
                empresaId: boot.companyId,
                leadId: boot.leadId,
              },
            };
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Error al conectar con la API";
          set({ apiCargando: false, apiError: msg });
        }
      },

      crearOferta: async (data) => {
        const s = get();
        if (
          isApiCompany(s, data.empresaId) &&
          data.estado !== "borrador"
        ) {
          const oferta = await proposalsApi.createProposal(data);
          set((st) => ({
            ofertas: [oferta, ...st.ofertas.filter((o) => o.id !== oferta.id)],
          }));
          return oferta;
        }

        const oferta: Oferta = {
          ...data,
          id: genId("of"),
          slug: `${slug(data.titulo)}-${Math.floor(Math.random() * 9999)}`,
          fechaInicio: nowISO(),
        };
        set((st) => ({
          ofertas: [oferta, ...st.ofertas],
          ofertasNuevas: [oferta, ...st.ofertasNuevas],
        }));
        return oferta;
      },

      actualizarOferta: async (id, patch) => {
        const s = get();
        const oferta = s.ofertas.find((o) => o.id === id);
        if (oferta && isApiOferta(s, id) && s.apiCompanyId) {
          const actualizada = await proposalsApi.updateProposal(
            id,
            s.apiCompanyId,
            patch,
          );
          set((st) => ({
            ofertas: st.ofertas.map((o) => (o.id === id ? actualizada : o)),
          }));
          return;
        }

        set((st) => {
          const esNueva = st.ofertasNuevas.some((o) => o.id === id);
          return {
            ofertas: st.ofertas.map((o) => (o.id === id ? { ...o, ...patch } : o)),
            ofertasNuevas: esNueva
              ? st.ofertasNuevas.map((o) => (o.id === id ? { ...o, ...patch } : o))
              : st.ofertasNuevas,
            ofertaPatches: esNueva
              ? st.ofertaPatches
              : { ...st.ofertaPatches, [id]: { ...st.ofertaPatches[id], ...patch } },
          };
        });
      },

      crearContacto: async (data) => {
        const s = get();
        if (isApiLead(s, data.leadId)) {
          const contacto = await contactsApi.createContact(data);
          set((st) => ({
            contactos: [contacto, ...st.contactos.filter((c) => c.id !== contacto.id)],
          }));
          return contacto;
        }

        const fecha = nowISO();
        const contacto: Contacto = {
          ...data,
          id: genId("con"),
          fechaCreacion: fecha,
          fechaActualizacion: fecha,
        };
        set((st) => ({
          contactos: [contacto, ...st.contactos],
          contactosNuevos: [contacto, ...st.contactosNuevos],
        }));
        return contacto;
      },

      actualizarContacto: async (id, patch) => {
        const s = get();
        const contacto = s.contactos.find((c) => c.id === id);
        if (contacto && isApiLead(s, contacto.leadId)) {
          const actualizado = await contactsApi.updateContact(
            id,
            contacto.leadId,
            patch,
          );
          set((st) => ({
            contactos: st.contactos.map((c) => (c.id === id ? actualizado : c)),
          }));
          return;
        }

        set((st) => {
          const full = { ...patch, fechaActualizacion: nowISO() };
          const esNuevo = st.contactosNuevos.some((c) => c.id === id);
          return {
            contactos: st.contactos.map((c) => (c.id === id ? { ...c, ...full } : c)),
            contactosNuevos: esNuevo
              ? st.contactosNuevos.map((c) => (c.id === id ? { ...c, ...full } : c))
              : st.contactosNuevos,
            contactoPatches: esNuevo
              ? st.contactoPatches
              : { ...st.contactoPatches, [id]: { ...st.contactoPatches[id], ...full } },
          };
        });
      },

      eliminarContacto: async (id) => {
        const s = get();
        const contacto = s.contactos.find((c) => c.id === id);
        if (contacto && isApiLead(s, contacto.leadId)) {
          await contactsApi.deleteContact(id);
        }

        set((st) => {
          const esNuevo = st.contactosNuevos.some((c) => c.id === id);
          const contactoPatches = { ...st.contactoPatches };
          delete contactoPatches[id];

          const fecha = nowISO();
          const listaPatches = { ...st.listaPatches };
          const listas = st.listas.map((l) => {
            if (!l.contactoIds.includes(id)) return l;
            const contactoIds = l.contactoIds.filter((cid) => cid !== id);
            if (!st.listasNuevas.some((ln) => ln.id === l.id)) {
              listaPatches[l.id] = {
                ...listaPatches[l.id],
                contactoIds,
                fechaActualizacion: fecha,
              };
            }
            return { ...l, contactoIds, fechaActualizacion: fecha };
          });
          const listasNuevas = st.listasNuevas.map((l) =>
            l.contactoIds.includes(id)
              ? { ...l, contactoIds: l.contactoIds.filter((cid) => cid !== id), fechaActualizacion: fecha }
              : l,
          );

          return {
            contactos: st.contactos.filter((c) => c.id !== id),
            contactosNuevos: st.contactosNuevos.filter((c) => c.id !== id),
            contactoPatches,
            contactosEliminados: esNuevo
              ? st.contactosEliminados
              : [...st.contactosEliminados, id],
            listas,
            listasNuevas,
            listaPatches,
          };
        });
      },

      crearLista: async (data) => {
        const s = get();
        if (isApiLead(s, data.leadId)) {
          const lista = await contactBooksApi.createContactBook(data);
          set((st) => ({
            listas: [lista, ...st.listas.filter((l) => l.id !== lista.id)],
          }));
          return lista;
        }

        const fecha = nowISO();
        const lista: Lista = {
          leadId: data.leadId,
          nombre: data.nombre,
          categoria: data.categoria,
          descripcion: data.descripcion,
          contactoIds: data.contactoIds ?? [],
          id: genId("lst"),
          fechaCreacion: fecha,
          fechaActualizacion: fecha,
        };
        set((st) => ({
          listas: [lista, ...st.listas],
          listasNuevas: [lista, ...st.listasNuevas],
        }));
        return lista;
      },

      actualizarLista: async (id, patch) => {
        const s = get();
        if (isApiLista(s, id) && s.apiLeadId) {
          const actualizada = await contactBooksApi.updateContactBook(
            id,
            s.apiLeadId,
            patch,
          );
          set((st) => ({
            listas: st.listas.map((l) => (l.id === id ? actualizada : l)),
          }));
          return;
        }
        set((st) => aplicarCambioLista(st, id, patch));
      },

      eliminarLista: async (id) => {
        const s = get();
        if (isApiLista(s, id)) {
          await contactBooksApi.deleteContactBook(id);
        }
        set((st) => {
          const esNueva = st.listasNuevas.some((l) => l.id === id);
          const listaPatches = { ...st.listaPatches };
          delete listaPatches[id];
          return {
            listas: st.listas.filter((l) => l.id !== id),
            listasNuevas: st.listasNuevas.filter((l) => l.id !== id),
            listaPatches,
            listasEliminadas: esNueva ? st.listasEliminadas : [...st.listasEliminadas, id],
          };
        });
      },

      agregarContactosALista: async (listaId, contactoIds) => {
        const s = get();
        const lista = s.listas.find((l) => l.id === listaId);
        if (!lista) return;
        if (isApiLista(s, listaId) && s.apiLeadId) {
          const actualizada = await contactBooksApi.addContactsToBook(
            listaId,
            s.apiLeadId,
            contactoIds,
          );
          set((st) => ({
            listas: st.listas.map((l) => (l.id === listaId ? actualizada : l)),
          }));
          return;
        }
        const merged = Array.from(new Set([...lista.contactoIds, ...contactoIds]));
        set((st) => aplicarCambioLista(st, listaId, { contactoIds: merged }));
      },

      quitarContactoDeLista: async (listaId, contactoId) => {
        const s = get();
        const lista = s.listas.find((l) => l.id === listaId);
        if (!lista) return;
        if (isApiLista(s, listaId) && s.apiLeadId) {
          const actualizada = await contactBooksApi.removeContactFromBook(
            listaId,
            s.apiLeadId,
            contactoId,
          );
          set((st) => ({
            listas: st.listas.map((l) => (l.id === listaId ? actualizada : l)),
          }));
          return;
        }
        const contactoIds = lista.contactoIds.filter((cid) => cid !== contactoId);
        set((st) => aplicarCambioLista(st, listaId, { contactoIds }));
      },

      postularContactos: (ofertaId, leadId, listaId, contactoIds, mensaje) => {
        const s = get();
        const yaPostulados = new Set(
          s.postulaciones
            .filter((p) => p.ofertaId === ofertaId && p.leadId === leadId)
            .map((p) => p.contactoId),
        );
        const lista = listaId ? s.listas.find((l) => l.id === listaId) : null;
        const mensajeBase = mensaje.trim();
        const mensajeFinal =
          mensajeBase ||
          (lista
            ? `Contactos de mi lista "${lista.nombre}" (${lista.categoria}): ${lista.descripcion}`
            : "");
        const fecha = nowISO();
        const nuevas: Postulacion[] = [];
        for (const contactoId of contactoIds) {
          if (yaPostulados.has(contactoId)) continue;
          const contacto = s.contactos.find((c) => c.id === contactoId && c.leadId === leadId);
          if (!contacto) continue;
          nuevas.push({
            id: genId("post"),
            ofertaId,
            leadId,
            contactoId: contacto.id,
            listaId,
            mensaje: mensajeFinal,
            contacto: contactoToSnapshot(contacto),
            estado: "postulada",
            valorTransaccion: null,
            comision: null,
            fechaPostulacion: fecha,
            fechaActualizacion: fecha,
          });
        }
        if (nuevas.length === 0) return [];
        set((st) => ({
          postulaciones: [...nuevas, ...st.postulaciones],
          postNuevas: [...nuevas, ...st.postNuevas],
        }));
        return nuevas;
      },

      cambiarEstado: (id, estado) => get().cambiarEstadoBulk([id], estado),

      cambiarEstadoBulk: (ids, estado) =>
        set((s) => {
          const idSet = new Set(ids);
          const fecha = nowISO();
          const patch: Partial<Postulacion> = { estado, fechaActualizacion: fecha };
          const nuevasIds = new Set(s.postNuevas.map((p) => p.id));
          const postPatches = { ...s.postPatches };
          for (const id of ids) {
            if (!nuevasIds.has(id)) postPatches[id] = { ...postPatches[id], ...patch };
          }
          return {
            postulaciones: s.postulaciones.map((p) =>
              idSet.has(p.id) ? { ...p, ...patch } : p,
            ),
            postNuevas: s.postNuevas.map((p) => (idSet.has(p.id) ? { ...p, ...patch } : p)),
            postPatches,
          };
        }),

      completarTransaccion: (id, valorTransaccion) =>
        set((s) => {
          const post = s.postulaciones.find((p) => p.id === id);
          if (!post) return {};
          const oferta = s.ofertas.find((o) => o.id === post.ofertaId);
          const comision = oferta ? calcularComision(oferta, valorTransaccion) : 0;
          const fecha = nowISO();
          const patch: Partial<Postulacion> = {
            estado: "completada",
            valorTransaccion,
            comision,
            fechaActualizacion: fecha,
          };
          const esNueva = s.postNuevas.some((p) => p.id === id);
          return {
            postulaciones: s.postulaciones.map((p) => (p.id === id ? { ...p, ...patch } : p)),
            postNuevas: esNueva
              ? s.postNuevas.map((p) => (p.id === id ? { ...p, ...patch } : p))
              : s.postNuevas,
            postPatches: esNueva
              ? s.postPatches
              : { ...s.postPatches, [id]: { ...s.postPatches[id], ...patch } },
          };
        }),

      calificar: (data) => {
        const rating: Rating = { ...data, id: genId("rat"), fecha: nowISO() };
        set((s) => ({
          ratings: [rating, ...s.ratings],
          ratingsUsuario: [rating, ...s.ratingsUsuario],
        }));
      },

      reset: () => {
        const base = generarBase();
        set({
          ...base,
          ...deltasVacios(),
        });
      },
    }),
    {
      name: "leadmanager-market",
      version: 4,
      migrate: (persisted, fromVersion) => {
        const raw = (persisted ?? {}) as Record<string, unknown>;
        if (fromVersion >= 4) return deltasDesdeLegacy(raw) as unknown as MarketState;
        // v1/v2: descartar deltas de libretas; conservar postulaciones y contactos del usuario
        return deltasDesdeLegacy(raw) as unknown as MarketState;
      },
      partialize: (s) => ({
        identidad: s.identidad,
        ofertaPatches: s.ofertaPatches,
        ofertasNuevas: s.ofertasNuevas,
        postPatches: s.postPatches,
        postNuevas: s.postNuevas,
        ratingsUsuario: s.ratingsUsuario,
        contactosNuevos: s.contactosNuevos,
        contactoPatches: s.contactoPatches,
        contactosEliminados: s.contactosEliminados,
        listasNuevas: s.listasNuevas,
        listaPatches: s.listaPatches,
        listasEliminadas: s.listasEliminadas,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<Deltas>;
        const base = generarBase();
        const ofertaPatches = p.ofertaPatches ?? {};
        const postPatches = p.postPatches ?? {};
        const contactoPatches = p.contactoPatches ?? {};
        const listaPatches = p.listaPatches ?? {};
        const contactosEliminados = new Set(p.contactosEliminados ?? []);
        const listasEliminadas = new Set(p.listasEliminadas ?? []);

        const ofertas = [
          ...base.ofertas.map((o) => (ofertaPatches[o.id] ? { ...o, ...ofertaPatches[o.id] } : o)),
          ...(p.ofertasNuevas ?? []),
        ];
        const postulaciones = [
          ...base.postulaciones.map((x) => {
            const merged = postPatches[x.id] ? { ...x, ...postPatches[x.id] } : x;
            return { ...merged, mensaje: merged.mensaje ?? "" };
          }),
          ...(p.postNuevas ?? []).map((x) => ({ ...x, mensaje: x.mensaje ?? "" })),
        ];
        const contactos = [
          ...base.contactos
            .filter((c) => !contactosEliminados.has(c.id))
            .map((c) => (contactoPatches[c.id] ? { ...c, ...contactoPatches[c.id] } : c)),
          ...(p.contactosNuevos ?? []),
        ];
        const idsContactos = new Set(contactos.map((c) => c.id));
        const listas = [
          ...base.listas
            .filter((l) => !listasEliminadas.has(l.id))
            .map((l) => (listaPatches[l.id] ? { ...l, ...listaPatches[l.id] } : l)),
          ...(p.listasNuevas ?? []),
        ].map((l) => ({
          ...l,
          contactoIds: l.contactoIds.filter((cid) => idsContactos.has(cid)),
        }));
        const ratings = [...base.ratings, ...(p.ratingsUsuario ?? [])];
        const identidadGuardada = p.identidad ?? current.identidad;
        const rolNormalizado: Identidad["rol"] =
          identidadGuardada.rol === "empresa" ? "empresa" : "lead";
        return {
          ...current,
          identidad: { ...identidadGuardada, rol: rolNormalizado },
          ofertaPatches,
          ofertasNuevas: p.ofertasNuevas ?? [],
          postPatches,
          postNuevas: p.postNuevas ?? [],
          ratingsUsuario: p.ratingsUsuario ?? [],
          contactosNuevos: p.contactosNuevos ?? [],
          contactoPatches,
          contactosEliminados: p.contactosEliminados ?? [],
          listasNuevas: p.listasNuevas ?? [],
          listaPatches,
          listasEliminadas: p.listasEliminadas ?? [],
          empresas: base.empresas,
          leads: base.leads,
          contactos,
          listas,
          ofertas,
          postulaciones,
          ratings,
        };
      },
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
