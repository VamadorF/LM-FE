"use client";

import { useEffect } from "react";
import { useStore, useHydrated } from "@/lib/store";
import { setActiveApiRole } from "@/lib/api/client";

/** Inicializa la conexion con el backend al montar el panel. */
export function ApiBootstrap() {
  const hydrated = useHydrated();
  const inicializarApi = useStore((s) => s.inicializarApi);
  const apiConectado = useStore((s) => s.apiConectado);
  const identidad = useStore((s) => s.identidad);

  useEffect(() => {
    if (!hydrated || apiConectado) return;
    void inicializarApi();
  }, [hydrated, apiConectado, inicializarApi]);

  useEffect(() => {
    if (!apiConectado) return;
    setActiveApiRole(identidad.rol === "empresa" ? "company" : "lead");
  }, [apiConectado, identidad.rol]);

  return null;
}
