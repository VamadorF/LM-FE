"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { EMPRESA_NAV, LEAD_NAV } from "./nav";
import { DevRoleSwitch } from "./dev-role-switch";

function titulo(pathname: string): string {
  const items = [...EMPRESA_NAV, ...LEAD_NAV].sort((a, b) => b.href.length - a.href.length);
  const match = items.find((i) => pathname === i.href || pathname.startsWith(i.href + "/"));
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
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-base font-semibold text-foreground">{titulo(pathname)}</h2>
        <p
          suppressHydrationWarning
          className="hidden text-xs capitalize text-muted-foreground sm:block"
        >
          {hoy}
        </p>
      </div>
      <DevRoleSwitch />
    </header>
  );
}
