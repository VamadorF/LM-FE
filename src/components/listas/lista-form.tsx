"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useCreateContactBook, useUpdateContactBook, type ContactBook } from "@/lib/api/contact-books";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  name: z.string().min(1, "Requerido").max(100),
  description: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  book?: ContactBook;
}

export function ListaForm({ open, onOpenChange, book }: Props) {
  const create = useCreateContactBook();
  const update = useUpdateContactBook();
  const isEdit = !!book;
  const isPending = create.isPending || update.isPending;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: book ? { name: book.name, description: book.description ?? "" } : {},
  });

  const onSubmit = (values: FormValues) => {
    const onSuccess = () => { reset(); onOpenChange(false); };
    if (isEdit && book) {
      update.mutate({ id: book.id, dto: values }, { onSuccess });
    } else {
      create.mutate(values, { onSuccess });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={isEdit ? "Editar lista" : "Nueva lista"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="lf-name">Nombre *</Label>
          <Input id="lf-name" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lf-desc">Descripcion</Label>
          <Textarea id="lf-desc" rows={3} {...register("description")} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            {isEdit ? "Guardar" : "Crear lista"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
