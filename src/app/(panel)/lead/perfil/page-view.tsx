"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useUpdateLeadManager } from "@/lib/api/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Stars } from "@/components/ui/stars";

const schema = z.object({
  fullName: z.string().min(2, "Requerido"),
  phone: z.string().optional(),
  city: z.string().min(1, "Requerido"),
  country: z.string().min(1, "Requerido"),
  bio: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function LeadPerfilPage() {
  const { user } = useAuthStore();
  const lm = user?.leadManager;
  const updateMut = useUpdateLeadManager();

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<FormValues>({
    values: lm
      ? { fullName: lm.fullName, phone: lm.phone ?? "", city: lm.city, country: lm.country, bio: lm.bio ?? "" }
      : undefined,
  });

  const onSubmit = (values: FormValues) => {
    updateMut.mutate(values);
  };

  if (!lm) return null;

  return (
    <>
      <PageHeader title="Mi perfil" description="Informacion visible para las empresas" />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Reputacion */}
        <Card>
          <CardHeader><CardTitle>Reputacion</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="text-4xl font-bold">{lm.avgRating ? lm.avgRating.toFixed(1) : "—"}</p>
            <Stars value={lm.avgRating ?? 0} size="md" />
            <p className="text-sm text-muted-foreground">{lm.reviewCount ?? 0} evaluaciones</p>
            <div className="mt-2 border-t pt-3 w-full text-sm">
              <p className="text-muted-foreground">Contactos en agenda</p>
              <p className="text-2xl font-bold text-foreground">{lm.contactCount ?? "—"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Formulario */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Editar informacion</CardTitle></CardHeader>
          <CardContent>
            {updateMut.isSuccess && (
              <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Perfil actualizado correctamente.
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="pf-name">Nombre completo *</Label>
                <Input id="pf-name" {...register("fullName")} />
                {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="pf-phone">Telefono</Label>
                  <Input id="pf-phone" type="tel" {...register("phone")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pf-city">Ciudad *</Label>
                  <Input id="pf-city" {...register("city")} />
                  {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="pf-country">Pais *</Label>
                  <Input id="pf-country" {...register("country")} />
                  {errors.country && <p className="text-xs text-destructive">{errors.country.message}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pf-bio">Bio</Label>
                <Textarea id="pf-bio" rows={4} placeholder="Cuéntanos sobre ti y tu red de contactos..."
                  {...register("bio")} />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={updateMut.isPending || !isDirty}>
                  {updateMut.isPending && <Loader2 className="animate-spin" />}
                  Guardar cambios
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
