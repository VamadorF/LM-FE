import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  Handshake,
  UserCog,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  { href: "/referidores", label: "Referidores", icon: Handshake },
  { href: "/agentes", label: "Agentes", icon: UserCog },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
];
