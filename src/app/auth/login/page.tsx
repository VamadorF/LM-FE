"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useLogin } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Requerido"),
});

type FormValues = z.infer<typeof schema>;

function getErrorMessage(error: unknown): string {
  if (!error) return "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const err = error as any;
  const status = err?.response?.status;
  if (status === 401 || status === 403) return "Email o contraseña incorrectos.";
  if (status === 404) return "Usuario no encontrado.";
  if (!status) return "No se pudo conectar con el servidor. Verifica que el backend esté activo.";
  return `Error ${status}. Intenta nuevamente.`;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionExpired = searchParams.get("session") === "expired";

  const { isAuthenticated, role } = useAuthStore();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // Si ya está autenticado (token válido en store), redirigir
  useEffect(() => {
    if (isAuthenticated && role) {
      router.replace(role === "company" ? "/empresa" : "/lead");
    }
  }, [isAuthenticated, role, router]);

  const onSubmit = (values: FormValues) => {
    login.mutate(values, {
      onSuccess: ({ user }) => {
        router.replace(user.role === "company" ? "/empresa" : "/lead");
      },
      onError: (err) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = (err as any)?.response?.status;
        if (status === 401 || status === 403 || status === 404) {
          setError("password", { message: "Email o contraseña incorrectos." });
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <Link href="/auth/register/company" className="text-primary underline-offset-4 hover:underline">
            Registrarse como empresa
          </Link>
          {" · "}
          <Link href="/auth/register/lead-manager" className="text-primary underline-offset-4 hover:underline">
            Registrarse como Lead Manager
          </Link>
        </p>
      </div>

      {sessionExpired && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
          Tu sesión expiró. Por favor ingresa nuevamente.
        </div>
      )}

      {login.isError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {getErrorMessage(login.error)}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={login.isPending}>
          {login.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Ingresar
        </Button>
      </form>
    </div>
  );
}
