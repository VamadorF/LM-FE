"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { NAV_ITEMS } from "./nav";

function tituloActual(pathname: string): string {
  const match = NAV_ITEMS.find(
    (i) => pathname === i.href || pathname.startsWith(i.href + "/"),
  );
  return match?.label ?? "LeadManager";
}

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const hoy = new Intl.DateTimeFormat("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur sm:px-6">
      <button
        onClick={onMenu}
        className="rounded-md p-2 text-muted-foreground hover:bg-secondary lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="size-5" />
      </button>
      <div className="min-w-0">
        <h2 className="truncate text-base font-semibold text-foreground">
          {tituloActual(pathname)}
        </h2>
        <p className="hidden text-xs capitalize text-muted-foreground sm:block">{hoy}</p>
      </div>
    </header>
  );
}
