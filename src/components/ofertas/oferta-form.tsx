"use client";

import { useForm } from "react-hook-form";
import { useStore } from "@/lib/store";
import { useEmpresaActiva } from "@/lib/identidad";
import { CATEGORIAS, type Oferta } from "@/lib/types";
import { fechaFuturaISO } from "@/lib/format";
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
import { Select } from "@/components/ui/select";

interface FormValues {
  titulo: string;
  categoria: string;
  descripcion: string;
  criterios: string;
  region: string;
  estado: Oferta["estado"];
  tipoComision: Oferta["tipoComision"];
  valorComision: number;
  valorTicketEstimado: number;
  objetivoContactos: number;
  fechaCierre: string;
}

const REGIONES = ["Todo Chile", "Metropolitana", "Valparaiso", "Biobio", "La Araucania", "Los Lagos", "Coquimbo", "Antofagasta", "Maule"];

export function OfertaForm({
  open,
  onOpenChange,
  oferta,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  oferta?: Oferta;
}) {
  const empresa = useEmpresaActiva();
  const crearOferta = useStore((s) => s.crearOferta);
  const actualizarOferta = useStore((s) => s.actualizarOferta);
  const editando = Boolean(oferta);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      titulo: oferta?.titulo ?? "",
      categoria: oferta?.categoria ?? empresa?.rubro ?? CATEGORIAS[0],
      descripcion: oferta?.descripcion ?? "",
      criterios: oferta?.criterios ?? "",
      region: oferta?.region ?? "Todo Chile",
      estado: oferta?.estado ?? "activa",
      tipoComision: oferta?.tipoComision ?? "porcentaje",
      valorComision: oferta?.valorComision ?? 5,
      valorTicketEstimado: oferta?.valorTicketEstimado ?? 5_000_000,
      objetivoContactos: oferta?.objetivoContactos ?? 200,
      fechaCierre: (oferta?.fechaCierre ?? fechaFuturaISO(60)).slice(0, 10),
    },
  });

  const onSubmit = async (data: FormValues) => {
    const payload = {
      ...data,
      valorComision: Number(data.valorComision),
      valorTicketEstimado: Number(data.valorTicketEstimado),
      objetivoContactos: Number(data.objetivoContactos),
      fechaCierre: new Date(data.fechaCierre).toISOString(),
    };
    if (oferta) {
      await actualizarOferta(oferta.id, payload);
    } else {
      await crearOferta({
        ...payload,
        empresaId: empresa.id,
        destacada: false,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{editando ? "Editar oferta" : "Nueva oferta"}</DialogTitle>
        <DialogDescription>
          Define que contacto buscas y la comision que pagas por cada negocio cerrado.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label>Titulo</Label>
          <Input {...register("titulo", { required: "Requerido" })} placeholder="Ej. Implementacion de ERP para pymes" />
          {errors.titulo ? <p className="text-xs text-destructive">{errors.titulo.message}</p> : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <Select {...register("categoria")}>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Region objetivo</Label>
            <Select {...register("region")}>
              {REGIONES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Descripcion</Label>
          <Textarea {...register("descripcion", { required: "Requerido" })} placeholder="Describe la oferta..." />
        </div>

        <div className="space-y-1.5">
          <Label>Que contacto buscas</Label>
          <Textarea {...register("criterios")} placeholder="Perfil ideal del prospecto..." />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Tipo de comision</Label>
            <Select {...register("tipoComision")}>
              <option value="porcentaje">Porcentaje</option>
              <option value="fijo">Monto fijo</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Valor comision</Label>
            <Input type="number" min={0} {...register("valorComision")} />
          </div>
          <div className="space-y-1.5">
            <Label>Ticket estimado (CLP)</Label>
            <Input type="number" min={0} step={100000} {...register("valorTicketEstimado")} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Meta de contactos</Label>
            <Input type="number" min={1} {...register("objetivoContactos")} />
          </div>
          <div className="space-y-1.5">
            <Label>Fecha de cierre</Label>
            <Input type="date" {...register("fechaCierre")} />
          </div>
          <div className="space-y-1.5">
            <Label>Estado</Label>
            <Select {...register("estado")}>
              <option value="activa">Activa</option>
              <option value="pausada">Pausada</option>
              <option value="borrador">Borrador</option>
              <option value="cerrada">Cerrada</option>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit">{editando ? "Guardar cambios" : "Publicar oferta"}</Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
