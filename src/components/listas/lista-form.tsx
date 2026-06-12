"use client";

import { useForm } from "react-hook-form";
import { useStore } from "@/lib/store";
import { useLeadActivo } from "@/lib/identidad";
import { CATEGORIAS_LISTA, type Lista } from "@/lib/types";
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
  nombre: string;
  categoria: string;
  descripcion: string;
}

export function ListaForm({
  open,
  onOpenChange,
  lista,
  onCreada,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  lista?: Lista;
  onCreada?: (lista: Lista) => void;
}) {
  const lead = useLeadActivo();
  const crearLista = useStore((s) => s.crearLista);
  const actualizarLista = useStore((s) => s.actualizarLista);
  const editando = Boolean(lista);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      nombre: lista?.nombre ?? "",
      categoria: lista?.categoria ?? CATEGORIAS_LISTA[0],
      descripcion: lista?.descripcion ?? "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (lista) {
      await actualizarLista(lista.id, data);
    } else {
      const creada = await crearLista({ ...data, leadId: lead.id });
      onCreada?.(creada);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-lg">
      <DialogHeader>
        <DialogTitle>{editando ? "Editar lista" : "Nueva lista"}</DialogTitle>
        <DialogDescription>
          Agrupa contactos de tu agenda en una lista categorizada para postularlos juntos.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label>Nombre de la lista</Label>
          <Input
            {...register("nombre", { required: "Requerido" })}
            placeholder="Ej. Clientes del rubro tecnologico"
          />
          {errors.nombre ? (
            <p className="text-xs text-destructive">{errors.nombre.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label>Categoria</Label>
          <Select {...register("categoria")}>
            {CATEGORIAS_LISTA.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Descripcion</Label>
          <Textarea
            {...register("descripcion")}
            placeholder="Para que sirve esta lista, que tipo de contactos agrupa..."
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit">{editando ? "Guardar cambios" : "Crear lista"}</Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
