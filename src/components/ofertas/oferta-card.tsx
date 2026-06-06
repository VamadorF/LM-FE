import Link from "next/link";
import { MapPin, Users, Coins } from "lucide-react";
import type { Empresa, Oferta } from "@/lib/types";
import { comisionLabel } from "@/lib/types";
import { formatCompactCLP } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EstadoOfertaBadge } from "@/components/ui/market-badges";

export function OfertaCard({
  oferta,
  empresa,
  postulaciones,
  href,
  mostrarEstado = false,
}: {
  oferta: Oferta;
  empresa?: Empresa;
  postulaciones?: number;
  href: string;
  mostrarEstado?: boolean;
}) {
  return (
    <Link href={href} className="group block h-full">
      <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
        <CardContent className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-2">
            <Badge className="border-accent bg-accent/60 text-accent-foreground">
              {oferta.categoria}
            </Badge>
            {mostrarEstado ? (
              <EstadoOfertaBadge estado={oferta.estado} />
            ) : oferta.destacada ? (
              <Badge className="border-amber-200 bg-amber-100 text-amber-700">Destacada</Badge>
            ) : null}
          </div>

          <h3 className="font-semibold leading-snug text-foreground group-hover:text-primary">
            {oferta.titulo}
          </h3>

          {empresa ? (
            <div className="flex items-center gap-2">
              <Avatar name={empresa.nombre} className="size-6 text-[10px]" />
              <span className="text-sm text-muted-foreground">{empresa.nombre}</span>
            </div>
          ) : null}

          <p className="line-clamp-2 text-sm text-muted-foreground">{oferta.descripcion}</p>

          <div className="mt-auto space-y-2 border-t pt-3">
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
              <Coins className="size-4" />
              Comision {comisionLabel(oferta)}
              {oferta.tipoComision === "porcentaje" ? (
                <span className="font-normal text-muted-foreground">
                  - ticket ~{formatCompactCLP(oferta.valorTicketEstimado)}
                </span>
              ) : null}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" /> {oferta.region}
              </span>
              {postulaciones !== undefined ? (
                <span className="inline-flex items-center gap-1">
                  <Users className="size-3.5" /> {postulaciones.toLocaleString("es-CL")} postulaciones
                </span>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
