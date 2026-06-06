"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useStore, useHydrated } from "./store";

export function useEmpresaActiva() {
  const empresaId = useStore((s) => s.identidad.empresaId);
  return useStore((s) => s.empresas.find((e) => e.id === empresaId) ?? s.empresas[0]);
}

export function useLeadActivo() {
  const leadId = useStore((s) => s.identidad.leadId);
  return useStore((s) => s.leads.find((l) => l.id === leadId) ?? s.leads[0]);
}

export function useRol() {
  return useStore((s) => s.identidad.rol);
}

/** Mantiene el rol del store alineado con la ruta actual (/lead o /empresa). */
export function useIdentidadSync() {
  const hydrated = useHydrated();
  const pathname = usePathname();
  const setRol = useStore((s) => s.setRol);

  useEffect(() => {
    if (!hydrated) return;
    const rolRuta = pathname.startsWith("/empresa") ? "empresa" : "lead";
    setRol(rolRuta);
  }, [hydrated, pathname, setRol]);
}
