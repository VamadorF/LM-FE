"use client";

import { useMemo, useState } from "react";
import { Trophy } from "lucide-react";
import { useStore, useHydrated } from "@/lib/store";
import { useLeadActivo } from "@/lib/identidad";
import { rankingLeads } from "@/lib/selectors";
import { formatCLP, formatNumber } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Leaderboard } from "@/components/ranking/leaderboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function LeadRankingPage() {
  const hydrated = useHydrated();
  const lead = useLeadActivo();
  const postulaciones = useStore((s) => s.postulaciones);
  const ofertas = useStore((s) => s.ofertas);
  const leads = useStore((s) => s.leads);

  const [ofertaId, setOfertaId] = useState("");

  const filas = useMemo(
    () => rankingLeads(postulaciones, leads, ofertaId ? { ofertaId } : undefined),
    [postulaciones, leads, ofertaId],
  );

  const miPosicion = useMemo(
    () => (lead ? filas.findIndex((f) => f.lead.id === lead.id) + 1 : 0),
    [filas, lead],
  );
  const miFila = lead ? filas.find((f) => f.lead.id === lead.id) : undefined;

  if (!hydrated) {
    return (
      <>
        <PageHeader title="Ranking de conectores" description="Compite y sube posiciones cerrando negocios" />
        <Skeleton className="h-96" />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Ranking de conectores" description="Compite y sube posiciones cerrando negocios">
        <Select value={ofertaId} onChange={(e) => setOfertaId(e.target.value)} className="w-64">
          <option value="">Ranking global</option>
          {ofertas.map((o) => (
            <option key={o.id} value={o.id}>
              {o.titulo}
            </option>
          ))}
        </Select>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <span className="flex size-12 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
              <Trophy className="size-6" />
            </span>
            <div>
              <p className="text-2xl font-bold">{miPosicion > 0 ? `#${miPosicion}` : "-"}</p>
              <p className="text-sm text-muted-foreground">Tu posicion</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-2xl font-bold text-emerald-700">{formatCLP(miFila?.comisiones ?? 0)}</p>
            <p className="text-sm text-muted-foreground">Tus comisiones</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-2xl font-bold">{formatNumber(miFila?.completadas ?? 0)}</p>
            <p className="text-sm text-muted-foreground">Negocios cerrados</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{ofertaId ? "Ranking de la oferta" : "Ranking global"}</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <Leaderboard filas={filas.slice(0, 50)} destacarId={lead?.id} />
        </CardContent>
      </Card>
    </>
  );
}
