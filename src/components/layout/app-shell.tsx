"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useIdentidadSync } from "@/lib/identidad";
import { Sidebar, SidebarContent } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  useIdentidadSync();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  return (
    <div className="flex min-h-screen overflow-x-clip bg-background">
      <Sidebar />

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div id="mobile-sidebar" className="absolute inset-y-0 left-0 w-64 border-r border-sidebar-border shadow-xl">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 rounded-md p-1.5 text-white/80 hover:bg-white/10"
              aria-label="Cerrar menu"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <Topbar mobileOpen={mobileOpen} onMenu={() => setMobileOpen(true)} onCloseMenu={() => setMobileOpen(false)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
