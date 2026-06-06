"use client";

import { useMemo } from "react";
import { useStore, useHydrated } from "@/lib/store";
import { useEmpresaActiva } from "@/lib/identidad";
import {
  comisionesPorMes,
  embudoPostulaciones,
  ofertasDeEmpresa,
  resumirPostulaciones,
} from "@/lib/selectors";
import { ESTADOS_POSTULACION } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IngresosChart,
  EmbudoChart,
  DonaChart,
  BarrasMontoChart,
} from "@/components/dashboard/charts";
import { Skeleton } from "@/components/ui/skeleton";

export default function EmpresaReportesPage() {
  const hydrated = useHydrated();
  const empresa = useEmpresaActiva();
  const ofertas = useStore((s) => s.ofertas);
  const postulaciones = useStore((s) => s.postulaciones);

  const data = useMemo(() => {
    if (!empresa) return null;
    const propias = ofertasDeEmpresa(ofertas, empresa.id);
    const ids = new Set(propias.map((o) => o.id));
    const ps = postulaciones.filter((p) => ids.has(p.ofertaId));
    const resumen = resumirPostulaciones(ps);

    const porEstado = ESTADOS_POSTULACION.map((e) => ({
      label: e.label,
      cantidad: resumen.porEstado[e.value],
    })).filter((x) => x.cantidad > 0);

    const comisionPorOf = new Map<string, number>();
    for (const p of ps) {
      if (p.comision) comisionPorOf.set(p.ofertaId, (comisionPorOf.get(p.ofertaId) ?? 0) + p.comision);
    }
    const porOferta = propias
      .map((o) => ({ label: o.titulo, valor: comisionPorOf.get(o.id) ?? 0 }))
      .filter((x) => x.valor > 0)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 8);

    return {
      embudo: embudoPostulaciones(resumen),
      porEstado,
      porOferta,
      serie: comisionesPorMes(ps, 6).map((m) => ({ mes: m.mes, ingresos: m.comisiones })),
    };
  }, [empresa, ofertas, postulaciones]);

  if (!hydrated || !data) {
    return (
      <>
        <PageHeader title="Reportes" description="Analiza el desempeno de tus campanas" />
        <Skeleton className="h-96" />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Reportes" description="Analiza el desempeno de tus campanas" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Comisiones pagadas por mes</CardTitle>
          </CardHeader>
          <CardContent>
            <IngresosChart data={data.serie} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribucion por estado</CardTitle>
          </CardHeader>
          <CardContent>
            <DonaChart data={data.porEstado} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Embudo de postulaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <EmbudoChart data={data.embudo} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comisiones por oferta</CardTitle>
          </CardHeader>
          <CardContent>
            {data.porOferta.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Aun no hay comisiones pagadas para graficar.
              </p>
            ) : (
              <BarrasMontoChart data={data.porOferta} />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
