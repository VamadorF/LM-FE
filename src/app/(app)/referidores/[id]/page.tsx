"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Pencil, Mail, Phone, Wallet, Users, Trophy } from "lucide-react";
import { useHydrated, useStore } from "@/lib/store";
import { comisionLead, resumenReferidor, esGanado } from "@/lib/selectors";
import { formatCLP, formatDate, formatPercent } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EtapaBadge } from "@/components/ui/badges";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ReferidorForm } from "@/components/referidores/referidor-form";

export default function ReferidorDetailPage() {
  const hydrated = useHydrated();
  const params = useParams<{ id: string }>();
  const referidor = useStore((s) => s.referidores.find((r) => r.id === params.id));
  const referidores = useStore((s) => s.referidores);
  const leads = useStore((s) => s.leads);
  const [editOpen, setEditOpen] = useState(false);

  const propios = useMemo(
    () =>
      leads
        .filter((l) => l.referidorId === params.id)
        .sort((a, b) => b.valorEstimado - a.valorEstimado),
    [leads, params.id],
  );

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!referidor) {
    return (
      <Card className="p-10 text-center">
        <p className="font-medium">Referidor no encontrado</p>
        <div className="mt-4">
          <Link href="/referidores" className="text-sm font-medium text-primary hover:underline">
            Volver a referidores
          </Link>
        </div>
      </Card>
    );
  }

  const resumen = resumenReferidor(referidor, leads, referidores);

  return (
    <>
      <Link
        href="/referidores"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Volver a referidores
      </Link>

      <PageHeader title={referidor.nombre} description={referidor.relacion}>
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          <Pencil /> Editar
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Datos del referidor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={referidor.nombre} className="size-12 text-sm" />
              <div>
                <p className="font-medium text-foreground">{referidor.nombre}</p>
                {referidor.estado === "activo" ? (
                  <Badge className="border-emerald-200 bg-emerald-100 text-emerald-700">
                    Activo
                  </Badge>
                ) : (
                  <Badge className="border-slate-200 bg-slate-100 text-slate-600">Inactivo</Badge>
                )}
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-4" /> {referidor.email}
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <Phone className="size-4" /> {referidor.telefono}
              </p>
            </div>
            <div className="rounded-lg bg-accent/60 p-3">
              <p className="text-xs text-accent-foreground">Comision acordada</p>
              <p className="text-2xl font-bold text-accent-foreground">
                {formatPercent(referidor.porcentajeComision, 0)}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              En la red desde {formatDate(referidor.fechaIngreso)}
            </p>
            {referidor.notas ? (
              <p className="rounded-lg bg-secondary/60 p-3 text-sm">{referidor.notas}</p>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-3 p-5">
                <Users className="size-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Leads referidos</p>
                  <p className="text-xl font-bold">{resumen.leadsReferidos}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-5">
                <Trophy className="size-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Negocios ganados</p>
                  <p className="text-xl font-bold">{resumen.ganados}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-5">
                <Wallet className="size-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Comision generada</p>
                  <p className="text-xl font-bold text-emerald-700">
                    {formatCLP(resumen.comisionAcumulada)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Leads referidos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {propios.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="Sin leads referidos"
                  description="Cuando este contacto refiera oportunidades apareceran aqui."
                  className="m-4"
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lead</TableHead>
                      <TableHead>Etapa</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right">Comision</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {propios.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <Link
                            href={`/leads/${lead.id}`}
                            className="font-medium hover:text-primary"
                          >
                            {lead.nombre}
                          </Link>
                          <p className="text-xs text-muted-foreground">{lead.empresa}</p>
                        </TableCell>
                        <TableCell>
                          <EtapaBadge etapa={lead.etapa} />
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCLP(lead.valorEstimado)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {esGanado(lead) ? (
                            <span className="font-semibold text-emerald-700">
                              {formatCLP(comisionLead(lead, referidores))}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ReferidorForm open={editOpen} onOpenChange={setEditOpen} referidor={referidor} />
    </>
  );
}
