"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { EMPRESA_NAV, LEAD_NAV } from "./nav";
import { UserWidget } from "./user-widget";
import { Logo } from "./logo";
import { useAuthStore } from "@/lib/auth-store";

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { role } = useAuthStore();
  const vistaEmpresa = role === "company" || pathname.startsWith("/empresa");
  const items = vistaEmpresa ? EMPRESA_NAV : LEAD_NAV;

  const isActive = (href: string) =>
    pathname === href || (href !== "/empresa" && href !== "/lead" && pathname.startsWith(href + "/"));

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <Link
        href={vistaEmpresa ? "/empresa" : "/lead"}
        className="flex h-16 items-center px-4"
        onClick={onNavigate}
      >
        <Logo height={40} />
      </Link>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-white"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-white",
              )}
            >
              <Icon className="size-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <UserWidget variant="dark" />
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col border-r border-sidebar-border">
      <SidebarContent />
    </aside>
  );
}
