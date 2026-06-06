"use client";

import { useMemo, useState } from "react";
import { Search, Coins, MapPin, Users } from "lucide-react";
import { useStore, useHydrated } from "@/lib/store";
import { useDebounced } from "@/lib/hooks";
import { conteoPorOferta } from "@/lib/selectors";
import { filtrarOrdenar } from "@/lib/query";
import { CATEGORIAS, comisionLabel, type Oferta } from "@/lib/types";
import { formatCompactCLP } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { PostularDialog } from "@/components/ofertas/postular-dialog";

export default function LeadOfertasPage() {
  const hydrated = useHydrated();
  const ofertas = useStore((s) => s.ofertas);
  const empresas = useStore((s) => s.empresas);
  const postulaciones = useStore((s) => s.postulaciones);

  const empresaById = useMemo(() => new Map(empresas.map((e) => [e.id, e])), [empresas]);
  const conteo = useMemo(() => conteoPorOferta(postulaciones), [postulaciones]);

  const [searchRaw, setSearchRaw] = useState("");
  const search = useDebounced(searchRaw, 200);
  const [categoria, setCategoria] = useState("");
  const [seleccionada, setSeleccionada] = useState<Oferta | null>(null);

  const activas = useMemo(() => ofertas.filter((o) => o.estado === "activa"), [ofertas]);

  const resultado = useMemo(
    () =>
      filtrarOrdenar(activas, {
        search,
        getSearchText: (o) =>
          `${o.titulo} ${o.categoria} ${empresaById.get(o.empresaId)?.nombre ?? ""}`,
        filters: categoria ? [(o) => o.categoria === categoria] : [],
        sort: (a, b) => (conteo.get(b.id) ?? 0) - (conteo.get(a.id) ?? 0),
      }),
    [activas, search, categoria, conteo, empresaById],
  );

  return (
    <>
      <PageHeader title="Explorar ofertas" description="Postula contactos de tu red y gana comisiones" />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchRaw}
            onChange={(e) => setSearchRaw(e.target.value)}
            placeholder="Buscar oferta o empresa..."
            className="pl-9"
          />
        </div>
        <Select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="lg:w-56">
          <option value="">Todas las categorias</option>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>

      {!hydrated ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      ) : resultado.length === 0 ? (
        <EmptyState icon={Search} title="No hay ofertas" description="Ajusta los filtros para ver mas oportunidades." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {resultado.map((oferta) => {
            const empresa = empresaById.get(oferta.empresaId);
            return (
              <Card key={oferta.id} className="flex h-full flex-col">
                <CardContent className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-center justify-between">
                    <Badge className="border-accent bg-accent/60 text-accent-foreground">
                      {oferta.categoria}
                    </Badge>
                    {oferta.destacada ? (
                      <Badge className="border-amber-200 bg-amber-100 text-amber-700">Destacada</Badge>
                    ) : null}
                  </div>
                  <h3 className="font-semibold leading-snug text-foreground">{oferta.titulo}</h3>
                  {empresa ? (
                    <div className="flex items-center gap-2">
                      <Avatar name={empresa.nombre} className="size-6 text-[10px]" />
                      <span className="text-sm text-muted-foreground">{empresa.nombre}</span>
                    </div>
                  ) : null}
                  <div className="mt-auto space-y-2 border-t pt-3">
                    <p className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                      <Coins className="size-4" /> Comision {comisionLabel(oferta)}
                      {oferta.tipoComision === "porcentaje" ? (
                        <span className="font-normal text-muted-foreground">
                          ~{formatCompactCLP(oferta.valorTicketEstimado)}
                        </span>
                      ) : null}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3.5" /> {oferta.region}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-3.5" /> {(conteo.get(oferta.id) ?? 0).toLocaleString("es-CL")}
                      </span>
                    </div>
                    <Button className="w-full" size="sm" onClick={() => setSeleccionada(oferta)}>
                      Postular contactos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {seleccionada ? (
        <PostularDialog
          open={Boolean(seleccionada)}
          onOpenChange={(v) => !v && setSeleccionada(null)}
          oferta={seleccionada}
        />
      ) : null}
    </>
  );
}
