"use client";

import { useMemo } from "react";
import { Trophy, Star, TrendingUp } from "lucide-react";
import { useMyBids } from "@/lib/api/bids";
import { useAuthStore } from "@/lib/auth-store";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function LeadRankingPage() {
  const { user } = useAuthStore();
  const { data: bids = [], isLoading } = useMyBids();

  const stats = useMemo(() => {
    const completed = bids.filter((b) => b.status === "completed");
    const accepted  = bids.filter((b) => b.status === "accepted");
    const total     = bids.length;
    const tasa      = total > 0 ? Math.round((completed.length / total) * 100) : 0;
    return { completed: completed.length, accepted: accepted.length, total, tasa };
  }, [bids]);

  const lm = user?.leadManager;
  const rating = lm?.avgRating ?? 0;

  const ratingStars = (n: number) =>
    Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${i < Math.round(n) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
      />
    ));

  const nivel = rating >= 4.5 ? "Élite" : rating >= 3.5 ? "Avanzado" : rating >= 2.5 ? "Intermedio" : "Principiante";
  const nivelColor = rating >= 4.5 ? "bg-amber-100 text-amber-700" : rating >= 3.5 ? "bg-sky-100 text-sky-700" : rating >= 2.5 ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600";

  return (
    <>
      <PageHeader title="Mi Ranking" description="Estadísticas de desempeño y reputación" />

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <>
          <div className="rounded-xl border p-6 mb-4 flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm text-muted-foreground mb-1">Rating promedio</p>
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                {ratingStars(rating)}
                <span className="font-bold text-2xl">{rating.toFixed(1)}</span>
              </div>
              <Badge className={nivelColor}>{nivel}</Badge>
            </div>
            <div className="text-center">
              <Trophy className="h-14 w-14 text-amber-400 mx-auto" />
              <p className="text-xs text-muted-foreground mt-1">Nivel actual</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <KpiCard icon={TrendingUp} label="Bids completados" value={String(stats.completed)} accent="text-emerald-600" />
            <KpiCard icon={TrendingUp} label="Bids en proceso"  value={String(stats.accepted)}  accent="text-sky-600" />
            <KpiCard icon={TrendingUp} label="Tasa de éxito"    value={`${stats.tasa}%`}         accent="text-violet-600" />
          </div>

          <div className="rounded-xl border p-5 mt-2 space-y-3">
            <h3 className="font-semibold">¿Cómo subir de nivel?</h3>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li>• Completa más bids para aumentar tu tasa de éxito.</li>
              <li>• Ofrece contactos de alta calidad — las empresas valoran la relevancia.</li>
              <li>• Responde rápido a las propuestas para que te elijan primero.</li>
              <li>• Pide a las empresas que dejen reseñas tras completar.</li>
            </ul>
          </div>
        </>
      )}
    </>
  );
}
