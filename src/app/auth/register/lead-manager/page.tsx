"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useRegisterLeadManager } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  firstName: z.string().min(1, "Requerido"),
  lastName: z.string().min(1, "Requerido"),
  phone: z.string().optional(),
  city: z.string().min(1, "Requerido"),
  country: z.string().min(1, "Requerido"),
  bio: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterLeadManagerPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const register_ = useRegisterLeadManager();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (isAuthenticated) router.replace("/lead");
  }, [isAuthenticated, router]);

  const onSubmit = ({ firstName, lastName, ...rest }: FormValues) => {
    // El backend espera un único campo fullName
    register_.mutate(
      { ...rest, fullName: `${firstName} ${lastName}`.trim() },
      { onSuccess: () => router.replace("/lead") },
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Registro de Lead Manager</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link href="/auth/login" className="text-primary underline-offset-4 hover:underline">
            Ingresar
          </Link>
          {" · "}
          <Link href="/auth/register/company" className="text-primary underline-offset-4 hover:underline">
            Registrarse como Empresa
          </Link>
        </p>
      </div>

      {register_.isError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Error al registrar. Es posible que el email ya esté en uso.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña *</Label>
            <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="firstName">Nombre *</Label>
            <Input id="firstName" autoComplete="given-name" {...register("firstName")} />
            {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName">Apellido *</Label>
            <Input id="lastName" autoComplete="family-name" {...register("lastName")} />
            {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" type="tel" autoComplete="tel" {...register("phone")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="country">País *</Label>
            <Input id="country" autoComplete="country-name" {...register("country")} />
            {errors.country && <p className="text-xs text-destructive">{errors.country.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">Ciudad *</Label>
            <Input id="city" autoComplete="address-level2" {...register("city")} />
            {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            rows={3}
            placeholder="Cuéntanos sobre ti y tu red de contactos..."
            {...register("bio")}
          />
        </div>

        <Button type="submit" className="w-full" disabled={register_.isPending}>
          {register_.isPending && <Loader2 className="animate-spin" />}
          Crear cuenta de Lead Manager
        </Button>
      </form>
    </div>
  );
}
