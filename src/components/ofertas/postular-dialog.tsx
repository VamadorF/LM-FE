"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Contact, Search, Plus, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { useStore } from "@/lib/store";
import { useLeadActivo } from "@/lib/identidad";
import { useDebounced } from "@/lib/hooks";
import {
  listasDelLead,
  contactosDelLead,
  contactosDeLista,
  conteoContactosPorLista,
  contactosYaPostuladosEnOferta,
} from "@/lib/selectors";
import { filtrarOrdenar } from "@/lib/query";
import { comisionLabel, type Oferta } from "@/lib/types";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import { ExplorerBreadcrumb } from "@/components/contactos/explorer-breadcrumb";
import { FolderGrid } from "@/components/contactos/folder-grid";
import { ContactosPicker } from "@/components/contactos/contactos-picker";
import {
  ExplorerViewSwitcher,
  type ExplorerViewMode,
} from "@/components/contactos/explorer-view-switcher";

type ExplorerPath = "root" | "agenda" | string;

const ROOT_ID = "root";
const AGENDA_ID = "agenda";

export function PostularDialog({
  open,
  onOpenChange,
  oferta,
  onPostulado,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  oferta: Oferta;
  onPostulado?: () => void;
}) {
  const lead = useLeadActivo();
  const listas = useStore((s) => s.listas);
  const contactos = useStore((s) => s.contactos);
  const postulaciones = useStore((s) => s.postulaciones);
  const postularContactos = useStore((s) => s.postularContactos);

  const misListas = useMemo(
    () => (lead ? listasDelLead(listas, lead.id) : []),
    [listas, lead],
  );
  const misContactos = useMemo(
    () => (lead ? contactosDelLead(contactos, lead.id) : []),
    [contactos, lead],
  );
  const conteo = useMemo(() => conteoContactosPorLista(listas), [listas]);

  const yaPostulados = useMemo(
    () =>
      lead ? contactosYaPostuladosEnOferta(postulaciones, oferta.id, lead.id) : new Set<string>(),
    [postulaciones, oferta.id, lead],
  );

  const [path, setPath] = useState<ExplorerPath>("root");
  const [vista, setVista] = useState<ExplorerViewMode>("lista");
  const [seleccion, setSeleccion] = useState<Set<string>>(new Set());
  const [searchRaw, setSearchRaw] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const search = useDebounced(searchRaw, 200);

  const listaActiva = path !== "root" && path !== "agenda" ? misListas.find((l) => l.id === path) : null;

  const cerrar = (next: boolean) => {
    if (!next) {
      setPath("root");
      setVista("lista");
      setSeleccion(new Set());
      setSearchRaw("");
      setMensaje("");
      setPreviewOpen(false);
    }
    onOpenChange(next);
  };

  const contactosBase = useMemo(() => {
    if (path === "root") return [];
    if (path === "agenda") return misContactos;
    return contactosDeLista(listas, contactos, path);
  }, [path, misContactos, listas, contactos]);

  const resultado = useMemo(
    () =>
      filtrarOrdenar(contactosBase, {
        search,
        getSearchText: (c) => `${c.nombre} ${c.email} ${c.empresa}`,
        sort: (a, b) => a.nombre.localeCompare(b.nombre),
      }),
    [contactosBase, search],
  );

  const disponibles = resultado.filter((c) => !yaPostulados.has(c.id));
  const todosSeleccionados =
    disponibles.length > 0 && disponibles.every((c) => seleccion.has(c.id));

  const abrirAgenda = () => {
    setPath("agenda");
    setSearchRaw("");
    setSeleccion(new Set());
  };

  const abrirLista = (listaId: string) => {
    setPath(listaId);
    setSearchRaw("");
    const miembros = contactosDeLista(listas, contactos, listaId);
    setSeleccion(new Set(miembros.filter((c) => !yaPostulados.has(c.id)).map((c) => c.id)));
  };

  const navegar = (id: string) => {
    if (id === ROOT_ID) {
      setPath("root");
      setSearchRaw("");
      return;
    }
    if (id === AGENDA_ID) {
      abrirAgenda();
      return;
    }
    abrirLista(id);
  };

  const breadcrumb = useMemo(() => {
    const segments = [{ id: ROOT_ID, label: "Mis contactos" }];
    if (path === "agenda") {
      segments.push({ id: AGENDA_ID, label: "Agenda" });
    } else if (listaActiva) {
      segments.push({ id: listaActiva.id, label: listaActiva.nombre });
    }
    return segments;
  }, [path, listaActiva]);

  const toggle = (id: string) => {
    setSeleccion((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleTodos = () => {
    setSeleccion((prev) => {
      if (disponibles.every((c) => prev.has(c.id))) return new Set();
      return new Set(disponibles.map((c) => c.id));
    });
  };

  const onConfirmar = () => {
    if (!lead || seleccion.size === 0 || path === "root") return;
    const listaId = path === "agenda" ? null : path;
    postularContactos(oferta.id, lead.id, listaId, [...seleccion], mensaje);
    setSeleccion(new Set());
    setSearchRaw("");
    setMensaje("");
    setPath("root");
    cerrar(false);
    onPostulado?.();
  };

  const sinContactos = misContactos.length === 0;
  const selectedListaId = path === "agenda" ? null : path === "root" ? undefined : path;

  const contactosSeleccionados = useMemo(
    () => contactosBase.filter((c) => seleccion.has(c.id)),
    [contactosBase, seleccion],
  );

  const mensajePreview = useMemo(() => {
    if (mensaje.trim()) return mensaje.trim();
    if (listaActiva?.descripcion) {
      return `Contactos de mi lista '${listaActiva.nombre}' (${listaActiva.categoria}): ${listaActiva.descripcion}`;
    }
    return "(Sin mensaje personalizado)";
  }, [mensaje, listaActiva]);

  return (
    <Dialog open={open} onOpenChange={cerrar} className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Postular contactos</DialogTitle>
        <DialogDescription>
          Abre una carpeta de tu agenda o listas para elegir contactos y postular a &quot;
          {oferta.titulo}&quot;. Ganas {comisionLabel(oferta)} de comision por cada negocio cerrado.
          Postulas como {lead?.nombre}.
        </DialogDescription>
      </DialogHeader>

      {sinContactos ? (
        <EmptyState
          icon={Contact}
          title="Tu agenda esta vacia"
          description="Agrega contactos a tu agenda para poder postularlos a esta oferta."
          action={
            <Link href="/lead/agenda">
              <Button>
                <Plus /> Ir a la agenda
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {path !== "root" ? (
            <ExplorerBreadcrumb segments={breadcrumb} onNavigate={navegar} />
          ) : null}

          {path === "root" ? (
            <FolderGrid
              totalAgenda={misContactos.length}
              listas={misListas}
              conteoPorLista={conteo}
              onOpenAgenda={abrirAgenda}
              onOpenLista={abrirLista}
            />
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border bg-card/30 p-2 scrollbar-thin">
                <FolderGrid
                  compact
                  totalAgenda={misContactos.length}
                  listas={misListas}
                  conteoPorLista={conteo}
                  onOpenAgenda={abrirAgenda}
                  onOpenLista={abrirLista}
                  selectedListaId={selectedListaId}
                />
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchRaw}
                  onChange={(e) => setSearchRaw(e.target.value)}
                  placeholder="Buscar en esta carpeta..."
                  className="pl-9"
                />
              </div>

              {contactosBase.length === 0 ? (
                <EmptyState
                  icon={Contact}
                  title="Carpeta vacia"
                  description="Esta lista no tiene contactos. Agrega contactos desde la agenda."
                />
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                    <label className="inline-flex items-center gap-2 text-sm font-medium">
                      <input
                        type="checkbox"
                        className="size-4 rounded border-input"
                        checked={todosSeleccionados}
                        onChange={toggleTodos}
                        disabled={disponibles.length === 0}
                      />
                      Seleccionar todos
                    </label>
                    <div className="flex items-center gap-3">
                      <ExplorerViewSwitcher value={vista} onChange={setVista} />
                      <span className="text-sm text-muted-foreground">
                        {seleccion.size} seleccionados
                      </span>
                    </div>
                  </div>

                  <ContactosPicker
                    contactos={resultado}
                    seleccion={seleccion}
                    yaPostulados={yaPostulados}
                    onToggle={toggle}
                    viewMode={vista}
                  />
                </>
              )}
            </>
          )}
        </div>
      )}

      {!sinContactos && path !== "root" ? (
        <div className="space-y-2 border-t pt-4">
          <Label htmlFor="mensaje-postulacion">
            ¿Por que recomiendas estos contactos para esta oferta?
          </Label>
          <Textarea
            id="mensaje-postulacion"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            rows={3}
            placeholder="Ej: Conozco estas empresas, estan evaluando proveedores y puedo facilitar una intro directa..."
          />
          <p className="text-xs text-muted-foreground">
            La empresa vera este mensaje junto con los datos de cada contacto. Si postulas desde una
            lista y dejas esto vacio, usaremos la descripcion de la carpeta.
          </p>

          {seleccion.size > 0 ? (
            <div className="rounded-lg border bg-secondary/30">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-medium text-foreground"
                onClick={() => setPreviewOpen((o) => !o)}
              >
                <span className="inline-flex items-center gap-2">
                  <Eye className="size-4 text-primary" />
                  Vista previa de la propuesta
                </span>
                {previewOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </button>
              {previewOpen ? (
                <div className="space-y-3 border-t px-3 py-3 text-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Mensaje
                    </p>
                    <p className="mt-1 text-foreground">{mensajePreview}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Contactos ({contactosSeleccionados.length})
                    </p>
                    <ul className="mt-1 space-y-1">
                      {contactosSeleccionados.map((c) => (
                        <li key={c.id} className="text-muted-foreground">
                          {c.nombre}
                          {c.empresa ? ` — ${c.empresa}` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Comision estimada por cierre: <span className="font-medium">{comisionLabel(oferta)}</span>
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => cerrar(false)}>
          Cancelar
        </Button>
        {!sinContactos && path !== "root" ? (
          <Button type="button" onClick={onConfirmar} disabled={seleccion.size === 0}>
            Postular {seleccion.size > 0 ? `${seleccion.size} ` : ""}
            {seleccion.size === 1 ? "contacto" : "contactos"}
          </Button>
        ) : null}
      </DialogFooter>
    </Dialog>
  );
}
