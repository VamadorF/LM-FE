"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { useStore } from "@/lib/store";
import {
  ETAPAS,
  ORIGENES,
  PRIORIDADES,
  type EtapaLead,
  type Lead,
  type OrigenLead,
  type Prioridad,
} from "@/lib/types";
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface FormValues {
  nombre: string;
  empresa: string;
  rut: string;
  email: string;
  telefono: string;
  comuna: string;
  region: string;
  valorEstimado: number;
  etapa: EtapaLead;
  origen: OrigenLead;
  prioridad: Prioridad;
  agenteId: string;
  referidorId: string;
  etiquetas: string;
  notas: string;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export function LeadForm({
  open,
  onOpenChange,
  lead,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lead?: Lead;
}) {
  const agentes = useStore((s) => s.agentes);
  const referidores = useStore((s) => s.referidores);
  const addLead = useStore((s) => s.addLead);
  const updateLead = useStore((s) => s.updateLead);

  const editing = Boolean(lead);

  const defaults: FormValues = React.useMemo(
    () => ({
      nombre: lead?.nombre ?? "",
      empresa: lead?.empresa ?? "",
      rut: lead?.rut ?? "",
      email: lead?.email ?? "",
      telefono: lead?.telefono ?? "",
      comuna: lead?.comuna ?? "",
      region: lead?.region ?? "Metropolitana",
      valorEstimado: lead?.valorEstimado ?? 0,
      etapa: lead?.etapa ?? "nuevo",
      origen: lead?.origen ?? "web",
      prioridad: lead?.prioridad ?? "media",
      agenteId: lead?.agenteId ?? agentes[0]?.id ?? "",
      referidorId: lead?.referidorId ?? "",
      etiquetas: lead?.etiquetas.join(", ") ?? "",
      notas: lead?.notas ?? "",
    }),
    [lead, agentes],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: defaults });

  React.useEffect(() => {
    if (open) reset(defaults);
  }, [open, defaults, reset]);

  const onSubmit = (values: FormValues) => {
    const payload = {
      ...values,
      valorEstimado: Number(values.valorEstimado) || 0,
      referidorId: values.referidorId || null,
      etiquetas: values.etiquetas
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    if (lead) {
      updateLead(lead.id, payload);
    } else {
      addLead(payload);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{editing ? "Editar lead" : "Nuevo lead"}</DialogTitle>
        <DialogDescription>
          {editing
            ? "Actualiza la informacion comercial del lead."
            : "Registra un nuevo prospecto en la cartera comercial."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre de contacto" error={errors.nombre?.message}>
            <Input {...register("nombre", { required: "Requerido" })} placeholder="Camila Rojas" />
          </Field>
          <Field label="Empresa" error={errors.empresa?.message}>
            <Input
              {...register("empresa", { required: "Requerido" })}
              placeholder="Andes Logistica"
            />
          </Field>
          <Field label="RUT" error={errors.rut?.message}>
            <Input {...register("rut")} placeholder="12345678-9" />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <Input
              type="email"
              {...register("email", { required: "Requerido" })}
              placeholder="contacto@empresa.cl"
            />
          </Field>
          <Field label="Telefono">
            <Input {...register("telefono")} placeholder="+56912345678" />
          </Field>
          <Field label="Valor estimado (CLP)" error={errors.valorEstimado?.message}>
            <Input
              type="number"
              min={0}
              step={50000}
              {...register("valorEstimado", { valueAsNumber: true, min: 0 })}
            />
          </Field>
          <Field label="Comuna">
            <Input {...register("comuna")} placeholder="Las Condes" />
          </Field>
          <Field label="Region">
            <Input {...register("region")} placeholder="Metropolitana" />
          </Field>
          <Field label="Etapa">
            <Select {...register("etapa")}>
              {ETAPAS.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Origen">
            <Select {...register("origen")}>
              {ORIGENES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Prioridad">
            <Select {...register("prioridad")}>
              {PRIORIDADES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Agente asignado">
            <Select {...register("agenteId")}>
              {agentes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Referidor">
            <Select {...register("referidorId")}>
              <option value="">Sin referidor</option>
              {referidores.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Etiquetas">
            <Input {...register("etiquetas")} placeholder="enterprise, demo-solicitada" />
          </Field>
        </div>

        <Field label="Notas">
          <Textarea {...register("notas")} placeholder="Contexto, necesidades, proximos pasos..." />
        </Field>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit">{editing ? "Guardar cambios" : "Crear lead"}</Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
