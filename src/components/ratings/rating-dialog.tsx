"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import type { ActorTipo, Postulacion } from "@/lib/types";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StarsInput } from "@/components/ui/stars";

export function RatingDialog({
  open,
  onOpenChange,
  postulacion,
  deTipo,
  deId,
  paraTipo,
  paraId,
  paraNombre,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  postulacion: Postulacion;
  deTipo: ActorTipo;
  deId: string;
  paraTipo: ActorTipo;
  paraId: string;
  paraNombre: string;
}) {
  const calificar = useStore((s) => s.calificar);
  const [estrellas, setEstrellas] = useState(5);
  const [comentario, setComentario] = useState("");

  const enviar = () => {
    calificar({
      ofertaId: postulacion.ofertaId,
      postulacionId: postulacion.id,
      deTipo,
      deId,
      paraTipo,
      paraId,
      estrellas,
      comentario: comentario.trim(),
    });
    setComentario("");
    setEstrellas(5);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Calificar a {paraNombre}</DialogTitle>
        <DialogDescription>
          Tu evaluacion ayuda a construir la confianza del marketplace tras completar el negocio.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="flex flex-col items-center gap-2 py-2">
          <StarsInput value={estrellas} onChange={setEstrellas} />
          <span className="text-sm text-muted-foreground">{estrellas} de 5</span>
        </div>
        <div className="space-y-1.5">
          <Label>Comentario</Label>
          <Textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Como fue la experiencia?"
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button onClick={enviar}>Enviar calificacion</Button>
      </DialogFooter>
    </Dialog>
  );
}
