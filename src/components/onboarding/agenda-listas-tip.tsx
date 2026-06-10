"use client";

import { useEffect, useState } from "react";
import { BookUser, ListChecks, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "leadmanager.tip.agenda-listas.v2";

export function AgendaListasTip() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(localStorage.getItem(STORAGE_KEY) !== "1");
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  return (
    <div className="flex gap-3 rounded-xl border border-primary/20 bg-accent/40 p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <BookUser className="size-5" />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <ListChecks className="size-4 text-primary" />
          Agenda y Listas
        </p>
        <p className="text-sm text-muted-foreground">
          La Agenda es tu maestro de contactos. Las Listas son carpetas para agruparlos y postular
          en bloque a ofertas.
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="size-8 shrink-0 text-muted-foreground"
        onClick={dismiss}
        aria-label="Cerrar consejo"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
