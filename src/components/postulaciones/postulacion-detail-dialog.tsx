"use client";

import { useEffect, useRef, useState } from "react";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  IdCard,
  Star,
  MessageSquare,
  FolderOpen,
  Target,
  UserRound,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { useStore } from "@/lib/store";
import type { Oferta, Postulacion } from "@/lib/types";
import { ESTADOS_POSTULACION, calcularComision, comisionLabel } from "@/lib/types";
import { formatCLP, formatDate, formatPostulaciones } from "@/lib/format";
import {
  puntosEncaje,
  scoreEncaje,
  scoreEncajeLabel,
  scoreEncajeTone,
  type EncajeEstado,
} from "@/lib/postulacion-encaje";
import { resumenLead } from "@/lib/selectors";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EstadoPostulacionBadge } from "@/components/ui/market-badges";
import { RatingDialog } from "@/components/ratings/rating-dialog";
import { Stars } from "@/components/ui/stars";
import { cn } from "@/lib/utils";

export function PostulacionDetailDialog({
  open,
  onOpenChange,
  postulacion: postulacionProp,
  oferta,
  onTransaccionCompletada,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  postulacion: Postulacion | null;
  oferta: Oferta;
  onTransaccionCompletada?: (postulacionId: string) => void;
}) {
  const cambiarEstado = useStore((s) => s.cambiarEstado);
  const completarTransaccion = useStore((s) => s.completarTransaccion);
  const postulacion = useStore((s) =>
    postulacionProp ? s.postulaciones.find((p) => p.id === postulacionProp.id) ?? postulacionProp : null,
  );
  const lead = useStore((s) => s.leads.find((l) => l.id === postulacion?.leadId));
  const empresa = useStore((s) => s.empresas.find((e) => e.id === oferta.empresaId));
  const lista = useStore((s) =>
    postulacion?.listaId ? s.listas.find((l) => l.id === postulacion.listaId) : null,
  );
  const ratings = useStore((s) => s.ratings);
  const postulaciones = useStore((s) => s.postulaciones);

  const [valor, setValor] = useState("");
  const [ratingOpen, setRatingOpen] = useState(false);
  const [bannerExito, setBannerExito] = useState<string | null>(null);
  const transaccionRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setBannerExito(null);
      setValor("");
    }
  }, [open]);

  useEffect(() => {
    if (!bannerExito) return;
    const target = bannerRef.current ?? transaccionRef.current;
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [bannerExito, postulacion?.estado]);

  if (!postulacion) return null;

  const yaCalificado = ratings.some(
    (r) => r.postulacionId === postulacion.id && r.deTipo === "empresa",
  );

  const c = postulacion.contacto;
  const encaje = puntosEncaje(oferta, c);
  const encajeScore = scoreEncaje(encaje);
  const statsLead = lead ? resumenLead(lead.id, postulaciones, ratings) : null;

  const valorNegocio = Number(valor) || oferta.valorTicketEstimado;
  const comisionPreview = calcularComision(oferta, valorNegocio);

  const onCompletar = () => {
    const v = Number(valor) || oferta.valorTicketEstimado;
    completarTransaccion(postulacion.id, v);
    const comision = calcularComision(oferta, v);
    setBannerExito(`Transaccion completada — Comision: ${formatCLP(comision)}`);
    setValor("");
    onTransaccionCompletada?.(postulacion.id);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{c.nombre}</DialogTitle>
          <DialogDescription>
            Propuesta de {lead?.nombre ?? "—"} para tu oferta &quot;{oferta.titulo}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1 scrollbar-thin">
          {bannerExito ? (
            <div
              ref={bannerRef}
              className="sticky top-0 z-10 flex items-center gap-2 rounded-lg border-2 border-emerald-300 bg-emerald-100 px-3 py-3 text-sm font-semibold text-emerald-900 shadow-sm"
              role="status"
              aria-live="polite"
            >
              <CheckCircle2 className="size-5 shrink-0" />
              {bannerExito}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <EstadoPostulacionBadge estado={postulacion.estado} />
            <span className="text-xs text-muted-foreground">
              Postulada el {formatDate(postulacion.fechaPostulacion)}
            </span>
          </div>

          <Section title="Propuesta del conector" icon={MessageSquare}>
            {postulacion.mensaje ? (
              <p className="text-sm leading-relaxed text-foreground">{postulacion.mensaje}</p>
            ) : (
              <p className="text-sm italic text-muted-foreground">
                El conector no dejo un mensaje explicando por que recomienda este contacto.
              </p>
            )}
          </Section>

          {lista ? (
            <Section title="Carpeta de origen" icon={FolderOpen}>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-foreground">{lista.nombre}</p>
                <Badge className="border-border bg-secondary/60">{lista.categoria}</Badge>
              </div>
              {lista.descripcion ? (
                <p className="mt-1.5 text-sm text-muted-foreground">{lista.descripcion}</p>
              ) : null}
            </Section>
          ) : null}

          <Section title="Encaje con tu oferta" icon={Target}>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge className={cn("text-xs", scoreEncajeTone(encajeScore))}>
                Encaje {encajeScore}% — {scoreEncajeLabel(encajeScore)}
              </Badge>
              <p className="text-xs text-muted-foreground">Buscas: {oferta.criterios}</p>
            </div>
            <ul className="space-y-1.5">
              {encaje.map((punto) => (
                <li key={punto.criterio} className="flex items-start gap-2 text-sm">
                  <EncajeIcon estado={punto.estado} />
                  <span>
                    <span className="font-medium text-foreground">{punto.criterio}: </span>
                    <span className="text-muted-foreground">{punto.detalle}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Datos de contacto" icon={Building2}>
            <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
              <InfoRow icon={Building2} label="Empresa">{c.empresa || "—"}</InfoRow>
              <InfoRow icon={IdCard} label="RUT">{c.rut || "—"}</InfoRow>
              <InfoRow icon={Mail} label="Email">{c.email}</InfoRow>
              <InfoRow icon={Phone} label="Telefono">{c.telefono}</InfoRow>
              <InfoRow icon={MapPin} label="Ubicacion">{c.comuna}, {c.region}</InfoRow>
            </div>
            {c.notas ? (
              <p className="mt-2 rounded-md bg-secondary/40 px-2.5 py-2 text-xs text-muted-foreground">
                Notas del conector: {c.notas}
              </p>
            ) : null}
          </Section>

          {lead ? (
            <Section title="Sobre el conector" icon={UserRound}>
              <div className="flex items-start gap-3">
                <Avatar name={lead.nombre} className="size-10 text-xs" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{lead.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {lead.comuna}, {lead.region}
                  </p>
                  {lead.bio ? (
                    <p className="mt-1 text-sm text-muted-foreground">{lead.bio}</p>
                  ) : null}
                  {statsLead && statsLead.ratingTotal > 0 ? (
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <Stars value={statsLead.rating} size="sm" />
                      <span>
                        {statsLead.rating.toFixed(1)} · {statsLead.completadas} cierres ·{" "}
                        {formatPostulaciones(statsLead.postulaciones)}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            </Section>
          ) : null}

          {postulacion.estado === "completada" ? (
            <div ref={transaccionRef} className="rounded-lg bg-emerald-50 p-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Valor transaccion</span>
                <span className="font-medium">{formatCLP(postulacion.valorTransaccion ?? 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Comision del lead</span>
                <span className="font-semibold text-emerald-700">
                  {formatCLP(postulacion.comision ?? 0)}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3 border-t pt-3">
              <div className="space-y-1.5">
                <Label>Cambiar estado</Label>
                <Select
                  value={postulacion.estado}
                  onChange={(e) => cambiarEstado(postulacion.id, e.target.value as Postulacion["estado"])}
                >
                  {ESTADOS_POSTULACION.filter((e) => e.value !== "completada").map((e) => (
                    <option key={e.value} value={e.value}>
                      {e.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Completar transaccion</Label>
                <p className="text-xs text-muted-foreground">
                  Tasa de comision: {comisionLabel(oferta)}
                </p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={0}
                    step={100000}
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    placeholder={`Valor del negocio (ej. ${oferta.valorTicketEstimado})`}
                  />
                  <Button onClick={onCompletar}>Completar</Button>
                </div>
                <p className="text-sm text-emerald-700">
                  Comision estimada: <span className="font-semibold">{formatCLP(comisionPreview)}</span>
                </p>
              </div>
            </div>
          )}

          {postulacion.estado === "completada" && lead ? (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Avatar name={lead.nombre} className="size-8 text-[10px]" />
                <div className="text-sm">
                  <p className="font-medium">{lead.nombre}</p>
                  <p className="text-xs text-muted-foreground">Conector</p>
                </div>
              </div>
              <Button
                variant={yaCalificado ? "outline" : "default"}
                size="sm"
                disabled={yaCalificado}
                onClick={() => setRatingOpen(true)}
              >
                <Star className="size-4" /> {yaCalificado ? "Calificado" : "Calificar lead"}
              </Button>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </Dialog>

      {lead && empresa ? (
        <RatingDialog
          open={ratingOpen}
          onOpenChange={setRatingOpen}
          postulacion={postulacion}
          deTipo="empresa"
          deId={empresa.id}
          paraTipo="lead"
          paraId={lead.id}
          paraNombre={lead.nombre}
        />
      ) : null}
    </>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card/50 p-3">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="size-4 text-primary" />
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function EncajeIcon({ estado }: { estado: EncajeEstado }) {
  if (estado === "ok") return <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />;
  if (estado === "parcial") return <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" />;
  return <XCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />;
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("text-sm font-medium text-foreground", label === "Email" && "truncate")}>
          {children}
        </p>
      </div>
    </div>
  );
}
