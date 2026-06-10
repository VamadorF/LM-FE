"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useCreateContact, useUpdateContact, type Contact, type Gender, type CreateContactDto } from "@/lib/api/contacts";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const GENDERS: { value: Gender; label: string }[] = [
  { value: "male",              label: "Masculino" },
  { value: "female",            label: "Femenino" },
  { value: "non_binary",        label: "No binario" },
  { value: "prefer_not_to_say", label: "Prefiero no decir" },
];

const GENDER_VALUES = ["male", "female", "non_binary", "prefer_not_to_say"] as const;

const schema = z.object({
  firstName:     z.string().min(1, "Requerido"),
  lastName:      z.string().min(1, "Requerido"),
  age:           z.string().min(1, "Requerido"),
  email:         z.string().email("Email inválido").optional().or(z.literal("")),
  phone:         z.string().optional(),
  gender:        z.string().optional(),
  city:          z.string().optional(),
  country:       z.string().optional(),
  monthlyIncome: z.string().optional(),
  privateNotes:  z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  contact?: Contact;
}

/** Construye DTO limpio — nunca envía campos vacíos ni tipos incorrectos */
function buildDto(values: FormValues): CreateContactDto {
  const dto: CreateContactDto = {
    firstName: values.firstName.trim(),
    lastName:  values.lastName.trim(),
    age:       parseInt(values.age, 10),
  };

  if (values.email?.trim())        dto.email        = values.email.trim();
  if (values.phone?.trim())        dto.phone        = values.phone.trim();
  if (values.city?.trim())         dto.city         = values.city.trim();
  if (values.country?.trim())      dto.country      = values.country.trim();
  if (values.privateNotes?.trim()) dto.privateNotes = values.privateNotes.trim();

  if (values.gender && (GENDER_VALUES as readonly string[]).includes(values.gender)) {
    dto.gender = values.gender as Gender;
  }

  const income = parseFloat(values.monthlyIncome ?? "");
  if (!isNaN(income) && values.monthlyIncome) dto.monthlyIncome = income;

  // interests: no está en el formulario — no enviar para evitar @IsArray errors

  return dto;
}

export function ContactoForm({ open, onOpenChange, contact }: Props) {
  const create = useCreateContact();
  const update = useUpdateContact();
  const isEdit = !!contact;
  const isPending = create.isPending || update.isPending;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: contact
      ? {
          firstName:     contact.firstName,
          lastName:      contact.lastName,
          age:           String(contact.age),
          email:         contact.email      ?? "",
          phone:         contact.phone      ?? "",
          gender:        contact.gender     ?? "",
          city:          contact.city       ?? "",
          country:       contact.country    ?? "",
          monthlyIncome: contact.monthlyIncome != null ? String(contact.monthlyIncome) : "",
          privateNotes:  contact.privateNotes ?? "",
        }
      : {
          firstName: "", lastName: "", age: "", email: "", phone: "",
          gender: "", city: "", country: "", monthlyIncome: "", privateNotes: "",
        },
  });

  const onSubmit = (values: FormValues) => {
    const dto = buildDto(values);
    const onSuccess = () => { reset(); onOpenChange(false); };

    if (isEdit && contact) {
      update.mutate({ id: contact.id, dto }, { onSuccess });
    } else {
      create.mutate(dto, { onSuccess });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={isEdit ? "Editar contacto" : "Nuevo contacto"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="cf-fn">Nombre *</Label>
            <Input id="cf-fn" {...register("firstName")} />
            {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cf-ln">Apellido *</Label>
            <Input id="cf-ln" {...register("lastName")} />
            {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cf-age">Edad * (mín. 18)</Label>
            <Input id="cf-age" type="number" min={18} {...register("age")} />
            {errors.age && <p className="text-xs text-destructive">{errors.age.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cf-gender">Género</Label>
            <select
              id="cf-gender"
              {...register("gender")}
              className="flex h-9 w-full rounded-md border bg-card px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Sin especificar</option>
              {GENDERS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cf-email">Email</Label>
            <Input id="cf-email" type="email" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cf-phone">Teléfono</Label>
            <Input id="cf-phone" type="tel" {...register("phone")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cf-city">Ciudad</Label>
            <Input id="cf-city" {...register("city")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cf-country">País</Label>
            <Input id="cf-country" {...register("country")} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="cf-income">Ingreso mensual ($)</Label>
            <Input id="cf-income" type="number" min={0} {...register("monthlyIncome")} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cf-notes">Notas privadas</Label>
          <Textarea id="cf-notes" rows={3} {...register("privateNotes")} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Guardar" : "Crear contacto"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
