"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/Icon";

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
}


const NAV_PROPIETARIO: NavItem[] = [
  { to: "/dashboard", label: "Panel Principal", icon: "grid" },
  { to: "/dashboard/vehiculos", label: "Mi Flota", icon: "car" },
  { to: "/dashboard/reservas", label: "Reservas", icon: "calendar" },
  { to: "/dashboard/ingresos", label: "Ingresos", icon: "money" },
];

const NAV_ADMIN: NavItem[] = [
  { to: "/admin", label: "Métricas", icon: "grid" },
  { to: "/admin/propietarios", label: "Propietarios", icon: "user" },
  { to: "/admin/vehiculos", label: "Vehículos", icon: "car" },
  { to: "/admin/reservas", label: "Reservas", icon: "calendar" },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
  isAdmin?: boolean;
  userName?: string;
  userRole?: string;
}

export function Sidebar({ open = false, onClose, isAdmin = false, userName, userRole }: SidebarProps) {
  const pathname = usePathname();
  const navItems = isAdmin ? NAV_ADMIN : NAV_PROPIETARIO;


  const isActive = (to: string) =>
    pathname === to || (to !== "/dashboard" && to !== "/admin" && pathname.startsWith(to));

 return (
    <>
      {open && <div className="scrim" onClick={onClose} />}
      <aside className={"sidebar " + (open ? "open" : "")}>
        <div className="sidebar-brand">
          <h1>AlquilAutos</h1>
          <p>{isAdmin ? "Panel Admin" : "Gestión de Flota"}</p>
        </div>
        <nav className="sidebar-nav" aria-label="Navegación principal">
          {navItems.map(item => (
            <Link
              key={item.to}
              href={item.to}
              onClick={onClose}
              className={"nav-link " + (isActive(item.to) ? "active" : "")}
            >
              <Icon name={item.icon} className="icon" />
              <span>{item.label}</span>
            </Link>
          ))}
          <div style={{ flex: 1 }} />
        </nav>
      </aside>
    </>
  );
}