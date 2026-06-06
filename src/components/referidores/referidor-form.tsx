"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { useStore } from "@/lib/store";
import type { EstadoReferidor, Referidor } from "@/lib/types";
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
import { Textarea } from "@/components/ui/textarea";

interface FormValues {
  nombre: string;
  relacion: string;
  email: string;
  telefono: string;
  porcentajeComision: number;
  estado: EstadoReferidor;
  notas: string;
}

export function ReferidorForm({
  open,
  onOpenChange,
  referidor,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  referidor?: Referidor;
}) {
  const addReferidor = useStore((s) => s.addReferidor);
  const updateReferidor = useStore((s) => s.updateReferidor);
  const editing = Boolean(referidor);

  const defaults: FormValues = React.useMemo(
    () => ({
      nombre: referidor?.nombre ?? "",
      relacion: referidor?.relacion ?? "Contacto del rubro",
      email: referidor?.email ?? "",
      telefono: referidor?.telefono ?? "",
      porcentajeComision: referidor?.porcentajeComision ?? 5,
      estado: referidor?.estado ?? "activo",
      notas: referidor?.notas ?? "",
    }),
    [referidor],
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
    const payload = { ...values, porcentajeComision: Number(values.porcentajeComision) || 0 };
    if (referidor) {
      updateReferidor(referidor.id, payload);
    } else {
      addReferidor(payload);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{editing ? "Editar referidor" : "Nuevo referidor"}</DialogTitle>
        <DialogDescription>
          Gestiona los contactos que generan oportunidades y su comision asociada.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label>Nombre</Label>
          <Input {...register("nombre", { required: "Requerido" })} placeholder="Hernan Lillo" />
          {errors.nombre ? (
            <p className="text-xs text-destructive">{errors.nombre.message}</p>
          ) : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Relacion</Label>
            <Input {...register("relacion")} placeholder="Socio comercial" />
          </div>
          <div className="space-y-1.5">
            <Label>Comision (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              step={0.5}
              {...register("porcentajeComision", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" {...register("email")} placeholder="contacto@correo.cl" />
          </div>
          <div className="space-y-1.5">
            <Label>Telefono</Label>
            <Input {...register("telefono")} placeholder="+56912345678" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Estado</Label>
            <Select {...register("estado")}>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Notas</Label>
          <Textarea {...register("notas")} placeholder="Contexto de la relacion, acuerdos..." />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit">{editing ? "Guardar cambios" : "Crear referidor"}</Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
