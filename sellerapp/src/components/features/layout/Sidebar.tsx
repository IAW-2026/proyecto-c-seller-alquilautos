"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/Icon";
import { useClerk } from "@clerk/nextjs";

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
}


const NAV_PROPIETARIO: NavItem[] = [
  { to: "/dashboard", label: "Panel Principal", icon: "grid" },
  { to: "/dashboard/vehiculos", label: "Mi Flota", icon: "car" },
  { to: "/dashboard/reservas", label: "Reservas", icon: "calendar" },
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
  const { signOut } = useClerk();


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
          <Link
            href={isAdmin ? "/dashboard" : "/admin"}
            onClick={onClose}
            className="nav-link"
          >
            <Icon name={isAdmin ? "user" : "shield"} className="icon" />
            <span>{isAdmin ? "Vista Propietario" : "Vista Admin"}</span>
          </Link>
        </nav>
        <div className="sidebar-user">
          <div style={{ flex: 1 }}>
            <div className="name">{userName ?? "Usuario"}</div>
            <div className="role">{userRole ?? (isAdmin ? "Administrador" : "Propietario")}</div>
          </div>
          <button
            className="icon-btn"
            onClick={() => signOut({ redirectUrl: "/sign-in" })}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <Icon name="x" size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}