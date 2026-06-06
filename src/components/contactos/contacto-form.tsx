"use client";

import { useForm } from "react-hook-form";
import { useStore } from "@/lib/store";
import { useLeadActivo } from "@/lib/identidad";
import type { Contacto } from "@/lib/types";
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
import { Textarea } from "@/components/ui/textarea";

interface FormValues {
  nombre: string;
  email: string;
  telefono: string;
  empresa: string;
  rut: string;
  comuna: string;
  region: string;
  notas: string;
}

export function ContactoForm({
  open,
  onOpenChange,
  contacto,
  onCreado,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  contacto?: Contacto;
  onCreado?: (contacto: Contacto) => void;
}) {
  const lead = useLeadActivo();
  const crearContacto = useStore((s) => s.crearContacto);
  const actualizarContacto = useStore((s) => s.actualizarContacto);
  const editando = Boolean(contacto);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      nombre: contacto?.nombre ?? "",
      email: contacto?.email ?? "",
      telefono: contacto?.telefono ?? "",
      empresa: contacto?.empresa ?? "",
      rut: contacto?.rut ?? "",
      comuna: contacto?.comuna ?? "",
      region: contacto?.region ?? "Metropolitana",
      notas: contacto?.notas ?? "",
    },
  });

  const onSubmit = (data: FormValues) => {
    if (contacto) {
      actualizarContacto(contacto.id, data);
    } else {
      const creado = crearContacto({ ...data, leadId: lead.id });
      onCreado?.(creado);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-xl">
      <DialogHeader>
        <DialogTitle>{editando ? "Editar contacto" : "Nuevo contacto"}</DialogTitle>
        <DialogDescription>
          Guarda los datos de la persona en tu agenda. Luego podras agregarla a tus listas y
          postularla a las ofertas.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Nombre</Label>
            <Input {...register("nombre", { required: "Requerido" })} placeholder="Braulio Fernandez" />
            {errors.nombre ? (
              <p className="text-xs text-destructive">{errors.nombre.message}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label>Empresa</Label>
            <Input {...register("empresa")} placeholder="Empresa del contacto" />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              {...register("email", { required: "Requerido" })}
              placeholder="correo@empresa.cl"
            />
            {errors.email ? (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label>Telefono</Label>
            <Input {...register("telefono")} placeholder="+56912345678" />
          </div>
          <div className="space-y-1.5">
            <Label>RUT</Label>
            <Input {...register("rut")} placeholder="12345678-9" />
          </div>
          <div className="space-y-1.5">
            <Label>Comuna</Label>
            <Input {...register("comuna")} placeholder="Las Condes" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Notas</Label>
          <Textarea
            {...register("notas")}
            placeholder="Contexto del contacto, intereses, historial..."
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit">{editando ? "Guardar cambios" : "Guardar contacto"}</Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
