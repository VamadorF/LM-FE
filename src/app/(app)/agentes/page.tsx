"use client";

import { useMemo } from "react";
import { Target, TrendingUp, Briefcase } from "lucide-react";
import { useHydrated, useStore } from "@/lib/store";
import { resumenAgente } from "@/lib/selectors";
import { rolLabel } from "@/lib/types";
import { formatCLP, formatPercent } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CardsSkeleton } from "@/components/ui/skeleton";

export default function AgentesPage() {
  const hydrated = useHydrated();
  const agentes = useStore((s) => s.agentes);
  const leads = useStore((s) => s.leads);

  const resumenes = useMemo(
    () =>
      agentes
        .map((a) => resumenAgente(a, leads))
        .sort((a, b) => b.valorGanado - a.valorGanado),
    [agentes, leads],
  );

  return (
    <>
      <PageHeader
        title="Agentes"
        description="Equipo comercial, metas mensuales y rendimiento"
      />

      {!hydrated ? (
        <CardsSkeleton count={3} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {resumenes.map((r) => {
            const meta = Math.min(100, r.avanceMeta);
            return (
              <Card key={r.agente.id} className="flex flex-col">
                <CardHeader className="flex-row items-center gap-3 space-y-0">
                  <Avatar name={r.agente.nombre} className="size-12 text-sm" />
                  <div className="min-w-0">
                    <CardTitle className="truncate">{r.agente.nombre}</CardTitle>
                    <Badge className="mt-1 border-accent bg-accent/60 text-accent-foreground">
                      {rolLabel(r.agente.rol)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Target className="size-4" /> Meta mensual
                      </span>
                      <span className="font-medium">{formatPercent(r.avanceMeta, 0)}</span>
                    </div>
                    <Progress
                      value={meta}
                      indicatorClassName={meta >= 100 ? "bg-success" : undefined}
                    />
                    <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                      <span>{formatCLP(r.valorGanado)}</span>
                      <span>{formatCLP(r.agente.metaMensual)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-t pt-3 text-center">
                    <div>
                      <p className="text-lg font-bold text-foreground">{r.totalLeads}</p>
                      <p className="text-xs text-muted-foreground">Leads</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-emerald-700">{r.ganados}</p>
                      <p className="text-xs text-muted-foreground">Ganados</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground">
                        {formatPercent(r.conversion, 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">Conversion</p>
                    </div>
                  </div>

                  <div className="mt-auto grid grid-cols-2 gap-3 border-t pt-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Briefcase className="size-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{formatCLP(r.valorPipeline)}</p>
                        <p className="text-xs text-muted-foreground">En pipeline</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="size-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{r.abiertos}</p>
                        <p className="text-xs text-muted-foreground">Abiertos</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
