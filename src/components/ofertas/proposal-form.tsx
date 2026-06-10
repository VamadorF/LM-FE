"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useCreateProposal, useUpdateProposal, type Proposal, type CreateProposalDto } from "@/lib/api/proposals";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  title:               z.string().min(5, "Mínimo 5 caracteres").max(120),
  description:         z.string().min(20, "Mínimo 20 caracteres").max(2000),
  contactsNeeded:      z.string().min(1, "Requerido"),
  pricePerContact:     z.string().optional(),
  locationCity:        z.string().optional(),
  locationCountry:     z.string().optional(),
  expiresAt:           z.string().optional(),
  requiredInterests:   z.string().min(1, "Ingresa al menos un interés (ej: marketing, ventas)"),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  proposal?: Proposal;
}

/**
 * Parsea el campo requiredInterests desde string CSV a array limpio.
 * Ej: "marketing, ventas, tecnología" → ["marketing","ventas","tecnología"]
 */
function parseInterests(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/** Construye el DTO respetando class-validators del backend */
function buildDto(values: FormValues, expiresAt?: string): CreateProposalDto {
  const dto: CreateProposalDto = {
    title:             values.title.trim(),
    description:       values.description.trim(),
    contactsNeeded:    parseInt(values.contactsNeeded, 10),
    requiredInterests: parseInterests(values.requiredInterests),
  };

  const price = parseFloat(values.pricePerContact ?? "");
  if (!isNaN(price) && values.pricePerContact?.trim()) dto.pricePerContact = price;

  if (values.locationCity?.trim())    dto.locationCity    = values.locationCity.trim();
  if (values.locationCountry?.trim()) dto.locationCountry = values.locationCountry.trim();
  if (expiresAt)                      dto.expiresAt       = expiresAt;

  return dto;
}

export function ProposalForm({ open, onOpenChange, proposal }: Props) {
  const create = useCreateProposal();
  const update = useUpdateProposal(proposal?.id ?? "");
  const isEdit = !!proposal;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: proposal
      ? {
          title:             proposal.title,
          description:       proposal.description,
          contactsNeeded:    String(proposal.contactsNeeded),
          pricePerContact:   proposal.pricePerContact != null ? String(proposal.pricePerContact) : "",
          locationCity:      proposal.locationCity    ?? "",
          locationCountry:   proposal.locationCountry ?? "",
          expiresAt:         proposal.expiresAt ? proposal.expiresAt.slice(0, 10) : "",
          requiredInterests: (proposal.requiredInterests ?? []).join(", "),
        }
      : {
          title: "", description: "", contactsNeeded: "", pricePerContact: "",
          locationCity: "", locationCountry: "", expiresAt: "", requiredInterests: "",
        },
  });

  const isPending = create.isPending || update.isPending;

  const onSubmit = (values: FormValues) => {
    const expiresAt = values.expiresAt ? new Date(values.expiresAt).toISOString() : undefined;
    const dto = buildDto(values, expiresAt);

    const onSuccess = () => { reset(); onOpenChange(false); };
    if (isEdit) {
      update.mutate(dto, { onSuccess });
    } else {
      create.mutate(dto, { onSuccess });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Editar propuesta" : "Nueva propuesta"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="pf-title">Título *</Label>
          <Input id="pf-title" placeholder="Ej: Clientes interesados en seguros de vida" {...register("title")} />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pf-description">Descripción *</Label>
          <Textarea id="pf-description" rows={3} placeholder="Describe qué tipo de contactos necesitas y para qué..." {...register("description")} />
          {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pf-interests">Intereses requeridos * <span className="font-normal text-muted-foreground">(separados por coma)</span></Label>
          <Input
            id="pf-interests"
            placeholder="Ej: seguros, finanzas, inversión"
            {...register("requiredInterests")}
          />
          {errors.requiredInterests && <p className="text-xs text-destructive">{errors.requiredInterests.message}</p>}
          <p className="text-xs text-muted-foreground">Categorías de contactos que buscas. Al menos una.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="pf-contacts">Contactos buscados *</Label>
            <Input id="pf-contacts" type="number" min={1} max={500} placeholder="20" {...register("contactsNeeded")} />
            {errors.contactsNeeded && <p className="text-xs text-destructive">{errors.contactsNeeded.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-price">Precio por contacto ($)</Label>
            <Input id="pf-price" type="number" min={0} step="0.01" placeholder="0" {...register("pricePerContact")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-city">Ciudad</Label>
            <Input id="pf-city" placeholder="Santiago" {...register("locationCity")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-country">País</Label>
            <Input id="pf-country" placeholder="Chile" {...register("locationCountry")} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="pf-expires">Fecha de cierre (opcional)</Label>
            <Input id="pf-expires" type="date" {...register("expiresAt")} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Guardar cambios" : "Crear propuesta"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
