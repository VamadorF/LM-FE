"use client";

import { useMemo } from "react";
import { Mail, Phone, MapPin, Calendar } from "lucide-react";
import { useStore, useHydrated } from "@/lib/store";
import { useLeadActivo } from "@/lib/identidad";
import { promedioRating, resumenLead } from "@/lib/selectors";
import { formatCLP, formatDate, formatNumber } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Stars } from "@/components/ui/stars";
import { Skeleton } from "@/components/ui/skeleton";

export default function LeadPerfilPage() {
  const hydrated = useHydrated();
  const lead = useLeadActivo();
  const postulaciones = useStore((s) => s.postulaciones);
  const ratings = useStore((s) => s.ratings);
  const empresas = useStore((s) => s.empresas);

  const empresaById = useMemo(() => new Map(empresas.map((e) => [e.id, e])), [empresas]);

  const data = useMemo(() => {
    if (!lead) return null;
    const resumen = resumenLead(lead.id, postulaciones, ratings);
    const recibidas = ratings
      .filter((r) => r.paraTipo === "lead" && r.paraId === lead.id)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    return { resumen, recibidas, rating: promedioRating(ratings, "lead", lead.id) };
  }, [lead, postulaciones, ratings]);

  if (!hydrated || !data || !lead) {
    return (
      <>
        <PageHeader title="Mi perfil" description="Tu reputacion como conector" />
        <Skeleton className="h-80" />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Mi perfil" description="Tu reputacion como conector" />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <Avatar name={lead.nombre} className="size-20 text-2xl" />
            <div>
              <h2 className="text-lg font-semibold">{lead.nombre}</h2>
              <p className="text-sm text-muted-foreground">{lead.comuna}, {lead.region}</p>
            </div>
            <Stars value={data.rating.promedio} size="md" showValue count={data.rating.total} />
            <p className="text-sm text-muted-foreground">{lead.bio}</p>
            <div className="mt-2 w-full space-y-2 border-t pt-4 text-left text-sm">
              <p className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-4" /> {lead.email}
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <Phone className="size-4" /> {lead.telefono}
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-4" /> {lead.comuna}
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="size-4" /> Miembro desde {formatDate(lead.fechaIngreso)}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <p className="text-2xl font-bold">{formatNumber(data.resumen.completadas)}</p>
                <p className="text-sm text-muted-foreground">Negocios cerrados</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-2xl font-bold text-emerald-700">{formatCLP(data.resumen.comisiones)}</p>
                <p className="text-sm text-muted-foreground">Comisiones</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-2xl font-bold">{formatNumber(data.resumen.postulaciones)}</p>
                <p className="text-sm text-muted-foreground">Postulaciones</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Evaluaciones recibidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.recibidas.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Aun no tienes evaluaciones. Se generan cuando una empresa cierra negocio contigo.
                </p>
              ) : (
                data.recibidas.slice(0, 20).map((r) => (
                  <div key={r.id} className="flex gap-3 border-b pb-4 last:border-0 last:pb-0">
                    <Avatar name={empresaById.get(r.deId)?.nombre ?? "?"} className="size-9 text-[10px]" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">{empresaById.get(r.deId)?.nombre ?? "Empresa"}</p>
                        <Stars value={r.estrellas} />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{r.comentario}</p>
                      <p className="mt-1 text-xs text-muted-foreground/70">{formatDate(r.fecha)}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
