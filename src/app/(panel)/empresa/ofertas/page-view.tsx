"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Users, ArrowRight } from "lucide-react";
import { useStore, useHydrated } from "@/lib/store";
import { useEmpresaActiva } from "@/lib/identidad";
import { conteoPorOferta, ofertasDeEmpresa } from "@/lib/selectors";
import { comisionLabel, type Oferta } from "@/lib/types";
import { formatCompactCLP, formatNumber } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EstadoOfertaBadge } from "@/components/ui/market-badges";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { OfertaForm } from "@/components/ofertas/oferta-form";

export default function EmpresaOfertasPage() {
  const hydrated = useHydrated();
  const empresa = useEmpresaActiva();
  const ofertas = useStore((s) => s.ofertas);
  const postulaciones = useStore((s) => s.postulaciones);

  const conteo = useMemo(() => conteoPorOferta(postulaciones), [postulaciones]);
  const propias = useMemo(
    () => (empresa ? ofertasDeEmpresa(ofertas, empresa.id) : []),
    [ofertas, empresa],
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editando, setEditando] = useState<Oferta | undefined>(undefined);

  const abrirNueva = () => {
    setEditando(undefined);
    setFormOpen(true);
  };
  const abrirEditar = (o: Oferta) => {
    setEditando(o);
    setFormOpen(true);
  };

  return (
    <>
      <PageHeader title="Mis ofertas" description="Publica y administra tus campanas de referidos">
        <Button onClick={abrirNueva}>
          <Plus /> Nueva oferta
        </Button>
      </PageHeader>

      {!hydrated ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52" />
          ))}
        </div>
      ) : propias.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="Aun no tienes ofertas"
          description="Publica tu primera campana para empezar a recibir postulaciones de conectores."
          action={<Button onClick={abrirNueva}>Crear oferta</Button>}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {propias.map((o) => (
            <Card key={o.id} className="flex h-full flex-col">
              <CardContent className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-center justify-between">
                  <Badge className="border-accent bg-accent/60 text-accent-foreground">{o.categoria}</Badge>
                  <EstadoOfertaBadge estado={o.estado} />
                </div>
                <Link href={`/empresa/ofertas/${o.id}`}>
                  <h3 className="font-semibold leading-snug text-foreground hover:text-primary">{o.titulo}</h3>
                </Link>
                <p className="line-clamp-2 text-sm text-muted-foreground">{o.descripcion}</p>
                <div className="mt-auto space-y-3 border-t pt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-emerald-700">{comisionLabel(o)}</span>
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Users className="size-3.5" /> {formatNumber(conteo.get(o.id) ?? 0)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Meta {formatNumber(o.objetivoContactos)} - Ticket {formatCompactCLP(o.valorTicketEstimado)}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => abrirEditar(o)}>
                      <Pencil /> Editar
                    </Button>
                    <Link href={`/empresa/ofertas/${o.id}`} className="flex-1">
                      <Button size="sm" className="w-full">
                        Bandeja <ArrowRight />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <OfertaForm open={formOpen} onOpenChange={setFormOpen} oferta={editando} />
    </>
  );
}
