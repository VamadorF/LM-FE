import type { FilaRankingLead } from "@/lib/selectors";
import { formatCLP, formatNumber } from "@/lib/format";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const MEDALLAS = ["bg-amber-100 text-amber-700", "bg-slate-100 text-slate-600", "bg-orange-100 text-orange-700"];

export function Leaderboard({
  filas,
  destacarId,
}: {
  filas: FilaRankingLead[];
  destacarId?: string;
}) {
  return (
    <div className="divide-y">
      {filas.map((f, i) => {
        const destacado = f.lead.id === destacarId;
        return (
          <div
            key={f.lead.id}
            className={cn(
              "flex items-center gap-3 px-3 py-3",
              destacado ? "rounded-lg bg-accent/50" : "",
            )}
          >
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                i < 3 ? MEDALLAS[i] : "text-muted-foreground",
              )}
            >
              {i + 1}
            </span>
            <Avatar name={f.lead.nombre} className="size-9 text-xs" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {f.lead.nombre}
                {destacado ? <span className="ml-2 text-xs text-primary">(tu)</span> : null}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatNumber(f.completadas)} cierres - {formatNumber(f.postulaciones)} postulaciones
              </p>
            </div>
            <span className="text-sm font-semibold text-emerald-700">{formatCLP(f.comisiones)}</span>
          </div>
        );
      })}
    </div>
  );
}
