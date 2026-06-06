"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Building2,
  IdCard,
  Tag,
  Handshake,
  Plus,
} from "lucide-react";
import { useHydrated, useStore } from "@/lib/store";
import { TIPOS_ACTIVIDAD, type TipoActividad } from "@/lib/types";
import { comisionLead } from "@/lib/selectors";
import { formatCLP, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EtapaBadge, OrigenBadge, PrioridadBadge } from "@/components/ui/badges";
import { LeadForm } from "@/components/leads/lead-form";
import { LeadTimeline } from "@/components/leads/lead-timeline";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

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
    <div className="flex items-start gap-3 py-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm font-medium text-foreground">{children}</div>
      </div>
    </div>
  );
}

export default function LeadDetailPage() {
  const hydrated = useHydrated();
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const lead = useStore((s) => s.leads.find((l) => l.id === params.id));
  const agentes = useStore((s) => s.agentes);
  const referidores = useStore((s) => s.referidores);
  const actividades = useStore((s) => s.actividades);
  const addActividad = useStore((s) => s.addActividad);
  const deleteLead = useStore((s) => s.deleteLead);

  const [editOpen, setEditOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [tipo, setTipo] = useState<TipoActividad>("llamada");
  const [descripcion, setDescripcion] = useState("");

  const agenteNombre = (id: string) => agentes.find((a) => a.id === id)?.nombre ?? "Sin asignar";

  const leadActividades = useMemo(
    () =>
      actividades
        .filter((a) => a.leadId === params.id)
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()),
    [actividades, params.id],
  );

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!lead) {
    return (
      <Card className="p-10 text-center">
        <p className="font-medium">Lead no encontrado</p>
        <p className="mt-1 text-sm text-muted-foreground">
          El lead que buscas no existe o fue eliminado.
        </p>
        <div className="mt-4">
          <Link href="/leads" className="text-sm font-medium text-primary hover:underline">
            Volver a leads
          </Link>
        </div>
      </Card>
    );
  }

  const referidor = referidores.find((r) => r.id === lead.referidorId);
  const agente = agentes.find((a) => a.id === lead.agenteId);
  const comision = comisionLead(lead, referidores);

  const registrar = () => {
    if (!descripcion.trim()) return;
    addActividad({ leadId: lead.id, agenteId: lead.agenteId, tipo, descripcion: descripcion.trim() });
    setDescripcion("");
    setTipo("llamada");
  };

  return (
    <>
      <Link
        href="/leads"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Volver a leads
      </Link>

      <PageHeader title={lead.nombre} description={lead.empresa}>
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          <Pencil /> Editar
        </Button>
        <Button
          variant="outline"
          className="text-destructive hover:text-destructive"
          onClick={() => setDelOpen(true)}
        >
          <Trash2 /> Eliminar
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
              <CardTitle>Resumen comercial</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <EtapaBadge etapa={lead.etapa} />
                <PrioridadBadge prioridad={lead.prioridad} />
                <OrigenBadge origen={lead.origen} />
              </div>
            </CardHeader>
            <CardContent className="grid gap-x-6 sm:grid-cols-2">
              <InfoRow icon={Building2} label="Empresa">
                {lead.empresa}
              </InfoRow>
              <InfoRow icon={IdCard} label="RUT">
                {lead.rut}
              </InfoRow>
              <InfoRow icon={Mail} label="Email">
                <a href={`mailto:${lead.email}`} className="hover:text-primary">
                  {lead.email}
                </a>
              </InfoRow>
              <InfoRow icon={Phone} label="Telefono">
                {lead.telefono}
              </InfoRow>
              <InfoRow icon={MapPin} label="Ubicacion">
                {lead.comuna}, {lead.region}
              </InfoRow>
              <InfoRow icon={Tag} label="Etiquetas">
                {lead.etiquetas.length ? (
                  <div className="flex flex-wrap gap-1">
                    {lead.etiquetas.map((t) => (
                      <Badge key={t} className="border-slate-200 bg-slate-50 text-slate-600">
                        {t}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground">Sin etiquetas</span>
                )}
              </InfoRow>
              {lead.notas ? (
                <div className="sm:col-span-2">
                  <p className="mt-2 text-xs text-muted-foreground">Notas</p>
                  <p className="mt-1 rounded-lg bg-secondary/60 p-3 text-sm text-foreground">
                    {lead.notas}
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registrar actividad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
                <div className="space-y-1.5">
                  <Label>Tipo</Label>
                  <Select value={tipo} onChange={(e) => setTipo(e.target.value as TipoActividad)}>
                    {TIPOS_ACTIVIDAD.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Descripcion</Label>
                  <div className="flex gap-2">
                    <Input
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && registrar()}
                      placeholder="Que ocurrio en este contacto?"
                    />
                    <Button onClick={registrar}>
                      <Plus /> Agregar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial de actividades</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadTimeline actividades={leadActividades} agenteNombre={agenteNombre} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Valor del negocio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Valor estimado</p>
                <p className="text-3xl font-bold text-foreground">
                  {formatCLP(lead.valorEstimado)}
                </p>
              </div>
              {comision > 0 ? (
                <div className="rounded-lg bg-accent/60 p-3">
                  <p className="text-xs text-accent-foreground">Comision al referidor</p>
                  <p className="text-lg font-semibold text-accent-foreground">
                    {formatCLP(comision)}
                  </p>
                </div>
              ) : null}
              <div className="flex justify-between border-t pt-3 text-sm">
                <span className="text-muted-foreground">Creado</span>
                <span className="font-medium">{formatDate(lead.fechaCreacion)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agente asignado</CardTitle>
            </CardHeader>
            <CardContent>
              {agente ? (
                <div className="flex items-center gap-3">
                  <Avatar name={agente.nombre} />
                  <div>
                    <p className="font-medium text-foreground">{agente.nombre}</p>
                    <p className="text-xs text-muted-foreground">{agente.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Sin agente asignado</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Referidor</CardTitle>
            </CardHeader>
            <CardContent>
              {referidor ? (
                <Link
                  href={`/referidores/${referidor.id}`}
                  className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-secondary"
                >
                  <span className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <Handshake className="size-4" />
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{referidor.nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      {referidor.relacion} - {referidor.porcentajeComision}% comision
                    </p>
                  </div>
                </Link>
              ) : (
                <p className="text-sm text-muted-foreground">Este lead llego sin referidor.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <LeadForm open={editOpen} onOpenChange={setEditOpen} lead={lead} />

      <Dialog open={delOpen} onOpenChange={setDelOpen}>
        <DialogHeader>
          <DialogTitle>Eliminar lead</DialogTitle>
          <DialogDescription>
            Esta accion eliminara a {lead.nombre} y su historial. No se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDelOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              deleteLead(lead.id);
              router.push("/leads");
            }}
          >
            Eliminar
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
