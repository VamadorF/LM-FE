import {
  LayoutDashboard,
  Megaphone,
  Inbox,
  Users,
  Wallet,
  BarChart3,
  Trophy,
  UserRound,
  Compass,
  Contact,
  ListChecks,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const EMPRESA_NAV: NavItem[] = [
  { href: "/empresa", label: "Dashboard", icon: LayoutDashboard },
  { href: "/empresa/ofertas", label: "Mis ofertas", icon: Megaphone },
  { href: "/empresa/conectores", label: "Conectores", icon: Users },
  { href: "/empresa/comisiones", label: "Comisiones", icon: Wallet },
  { href: "/empresa/reportes", label: "Reportes", icon: BarChart3 },
];

export const LEAD_NAV: NavItem[] = [
  { href: "/lead", label: "Dashboard", icon: LayoutDashboard },
  { href: "/lead/agenda", label: "Agenda", icon: Contact },
  { href: "/lead/listas", label: "Listas", icon: ListChecks },
  { href: "/lead/ofertas", label: "Explorar ofertas", icon: Compass },
  { href: "/lead/postulaciones", label: "Mis postulaciones", icon: Inbox },
  { href: "/lead/comisiones", label: "Comisiones", icon: Wallet },
  { href: "/lead/ranking", label: "Ranking", icon: Trophy },
  { href: "/lead/perfil", label: "Mi perfil", icon: UserRound },
];
