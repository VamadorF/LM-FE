"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useRegisterCompany } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "200+"] as const;

const schema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(6, "Minimo 6 caracteres"),
  legalName: z.string().min(2, "Requerido"),
  tradeName: z.string().optional(),
  taxId: z.string().min(1, "Requerido"),
  industry: z.string().min(1, "Requerido"),
  companySize: z.enum(COMPANY_SIZES),
  country: z.string().min(1, "Requerido"),
  city: z.string().min(1, "Requerido"),
  contactName: z.string().min(2, "Requerido"),
  contactPhone: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterCompanyPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const register_ = useRegisterCompany();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { companySize: "1-10" },
  });

  useEffect(() => {
    if (isAuthenticated) router.replace("/empresa");
  }, [isAuthenticated, router]);

  const onSubmit = (values: FormValues) => {
    register_.mutate(values, {
      onSuccess: () => router.replace("/empresa"),
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Registro de Empresa</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ya tienes cuenta?{" "}
          <Link href="/auth/login" className="text-primary underline-offset-4 hover:underline">
            Ingresar
          </Link>
          {" - "}
          <Link href="/auth/register/lead-manager" className="text-primary underline-offset-4 hover:underline">
            Registrarse como Lead Manager
          </Link>
        </p>
      </div>

      {register_.isError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Error al registrar. Verifica que el RUT y email no esten en uso.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-muted-foreground">Credenciales</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" autoComplete="email" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password *</Label>
              <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-muted-foreground">Datos de la empresa</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="legalName">Razon social *</Label>
              <Input id="legalName" {...register("legalName")} />
              {errors.legalName && <p className="text-xs text-destructive">{errors.legalName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tradeName">Nombre comercial</Label>
              <Input id="tradeName" {...register("tradeName")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="taxId">RUT *</Label>
              <Input id="taxId" placeholder="12345678-9" {...register("taxId")} />
              {errors.taxId && <p className="text-xs text-destructive">{errors.taxId.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="industry">Rubro *</Label>
              <Input id="industry" {...register("industry")} />
              {errors.industry && <p className="text-xs text-destructive">{errors.industry.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="companySize">Tamano *</Label>
              <select
                id="companySize"
                {...register("companySize")}
                className="flex h-9 w-full rounded-md border bg-card px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {COMPANY_SIZES.map((s) => (
                  <option key={s} value={s}>{s} empleados</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="country">Pais *</Label>
              <Input id="country" {...register("country")} />
              {errors.country && <p className="text-xs text-destructive">{errors.country.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">Ciudad *</Label>
              <Input id="city" {...register("city")} />
              {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-muted-foreground">Contacto</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="contactName">Nombre de contacto *</Label>
              <Input id="contactName" {...register("contactName")} />
              {errors.contactName && <p className="text-xs text-destructive">{errors.contactName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contactPhone">Telefono</Label>
              <Input id="contactPhone" type="tel" {...register("contactPhone")} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="website">Sitio web</Label>
              <Input id="website" type="url" placeholder="https://" {...register("website")} />
            </div>
          </div>
        </fieldset>

        <Button type="submit" className="w-full" disabled={register_.isPending}>
          {register_.isPending && <Loader2 className="animate-spin" />}
          Crear cuenta de empresa
        </Button>
      </form>
    </div>
  );
}
