"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Handshake, Users, Wallet } from "lucide-react";
import { useHydrated, useStore } from "@/lib/store";
import { resumenReferidor } from "@/lib/selectors";
import type { Referidor } from "@/lib/types";
import { formatCLP, formatPercent } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/skeleton";
import { ReferidorForm } from "@/components/referidores/referidor-form";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-5">
        <span className="flex size-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ReferidoresPage() {
  const hydrated = useHydrated();
  const referidores = useStore((s) => s.referidores);
  const leads = useStore((s) => s.leads);
  const deleteReferidor = useStore((s) => s.deleteReferidor);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Referidor | undefined>(undefined);
  const [toDelete, setToDelete] = useState<Referidor | null>(null);

  const resumenes = useMemo(
    () =>
      referidores
        .map((r) => resumenReferidor(r, leads, referidores))
        .sort((a, b) => b.comisionAcumulada - a.comisionAcumulada),
    [referidores, leads],
  );

  const totales = useMemo(
    () => ({
      activos: referidores.filter((r) => r.estado === "activo").length,
      leadsReferidos: resumenes.reduce((acc, r) => acc + r.leadsReferidos, 0),
      comisiones: resumenes.reduce((acc, r) => acc + r.comisionAcumulada, 0),
    }),
    [referidores, resumenes],
  );

  return (
    <>
      <PageHeader
        title="Referidores"
        description="Red de contactos que generan oportunidades y sus comisiones"
      >
        <Button
          onClick={() => {
            setEditing(undefined);
            setFormOpen(true);
          }}
        >
          <Plus /> Nuevo referidor
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <MiniStat icon={Handshake} label="Referidores activos" value={String(totales.activos)} />
        <MiniStat icon={Users} label="Leads referidos" value={String(totales.leadsReferidos)} />
        <MiniStat icon={Wallet} label="Comisiones generadas" value={formatCLP(totales.comisiones)} />
      </div>

      <Card>
        {!hydrated ? (
          <div className="p-4">
            <TableSkeleton />
          </div>
        ) : resumenes.length === 0 ? (
          <EmptyState
            icon={Handshake}
            title="Aun no hay referidores"
            description="Registra a las personas que te abren puertas y lleva el control de sus comisiones."
            action={
              <Button
                onClick={() => {
                  setEditing(undefined);
                  setFormOpen(true);
                }}
              >
                <Plus /> Nuevo referidor
              </Button>
            }
            className="m-4"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Referidor</TableHead>
                <TableHead>Comision</TableHead>
                <TableHead className="text-center">Leads</TableHead>
                <TableHead className="text-center">Ganados</TableHead>
                <TableHead className="text-right">Monto generado</TableHead>
                <TableHead className="text-right">Comision</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resumenes.map(({ referidor, leadsReferidos, ganados, montoGenerado, comisionAcumulada }) => (
                <TableRow key={referidor.id}>
                  <TableCell>
                    <Link
                      href={`/referidores/${referidor.id}`}
                      className="flex items-center gap-3 group"
                    >
                      <Avatar name={referidor.nombre} />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground group-hover:text-primary">
                          {referidor.nombre}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {referidor.relacion}
                        </p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatPercent(referidor.porcentajeComision, 0)}
                  </TableCell>
                  <TableCell className="text-center tabular-nums">{leadsReferidos}</TableCell>
                  <TableCell className="text-center tabular-nums">{ganados}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCLP(montoGenerado)}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums text-emerald-700">
                    {formatCLP(comisionAcumulada)}
                  </TableCell>
                  <TableCell>
                    {referidor.estado === "activo" ? (
                      <Badge className="border-emerald-200 bg-emerald-100 text-emerald-700">
                        Activo
                      </Badge>
                    ) : (
                      <Badge className="border-slate-200 bg-slate-100 text-slate-600">
                        Inactivo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/referidores/${referidor.id}`}
                        className={buttonVariants({ variant: "ghost", size: "icon" })}
                        title="Ver"
                      >
                        <Handshake />
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Editar"
                        onClick={() => {
                          setEditing(referidor);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Eliminar"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setToDelete(referidor)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <ReferidorForm open={formOpen} onOpenChange={setFormOpen} referidor={editing} />

      <Dialog open={Boolean(toDelete)} onOpenChange={(v) => !v && setToDelete(null)}>
        <DialogHeader>
          <DialogTitle>Eliminar referidor</DialogTitle>
          <DialogDescription>
            Se eliminara a {toDelete?.nombre}. Los leads asociados quedaran sin referidor.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setToDelete(null)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (toDelete) deleteReferidor(toDelete.id);
              setToDelete(null);
            }}
          >
            Eliminar
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
