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
  { to: "/dashboard",           label: "Panel Principal", icon: "grid"     },
  { to: "/dashboard/vehiculos", label: "Mi Flota",        icon: "car"      },
  { to: "/dashboard/reservas",  label: "Reservas",        icon: "calendar" },
  { to: "/dashboard/ingresos",  label: "Ingresos",        icon: "money"    },
];

const NAV_ADMIN: NavItem[] = [
  { to: "/admin",               label: "Métricas",     icon: "grid"     },
  { to: "/admin/propietarios",  label: "Propietarios", icon: "user"     },
  { to: "/admin/vehiculos",     label: "Vehículos",    icon: "car"      },
  { to: "/admin/reservas",      label: "Reservas",     icon: "calendar" },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
  isAdmin?: boolean;
  userName?: string;
  userRole?: string;
}

export function Sidebar({ open = false, onClose, isAdmin = false }: SidebarProps) {
  const pathname = usePathname();
  const navItems = isAdmin ? NAV_ADMIN : NAV_PROPIETARIO;

  const isActive = (to: string) =>
    pathname === to || (to !== "/dashboard" && to !== "/admin" && pathname.startsWith(to));

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-[rgba(15,23,42,0.45)] z-[80]"
          onClick={onClose}
        />
      )}
      <aside className={[
        "bg-[var(--bg-surface)] border-r border-[var(--border-default)] flex flex-col sticky top-0 h-screen",
        // mobile
        "max-[900px]:fixed max-[900px]:left-0 max-[900px]:top-0 max-[900px]:bottom-0 max-[900px]:w-[260px] max-[900px]:z-[90] max-[900px]:transition-transform max-[900px]:duration-[220ms]",
        open ? "max-[900px]:translate-x-0" : "max-[900px]:-translate-x-full",
      ].join(" ")}>

        {/* Brand */}
        <div className="px-6 pt-6 pb-5">
          <h1 className="m-0 text-[22px] font-bold tracking-[-0.02em] text-[var(--text-primary)]">
            AlquilAutos
          </h1>
          <p className="m-0 mt-[2px] text-[12px] text-[var(--text-secondary)]">
            {isAdmin ? "Panel Admin" : "Gestión de Flota"}
          </p>
        </div>

        {/* Nav */}
        <nav className="px-3 py-4 flex flex-col gap-[2px] flex-1" aria-label="Navegación principal">
          {navItems.map(item => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                href={item.to}
                onClick={onClose}
                className={[
                  "flex items-center gap-3 px-[14px] py-[10px] rounded-[var(--radius-md)] text-[14px] cursor-pointer relative transition-[background,color] duration-[180ms]",
                  active
                    ? "text-[var(--color-primary-400)] font-semibold after:content-[''] after:absolute after:right-[-12px] after:top-2 after:bottom-2 after:w-[3px] after:rounded-[3px] after:bg-[var(--color-primary-400)]"
                    : "text-[var(--color-neutral-700)] [[data-theme='dark']_&]:text-[var(--color-neutral-400)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
                ].join(" ")}
              >
                <Icon name={item.icon} className="w-[18px] h-[18px] shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="flex-1" />
        </nav>
      </aside>
    </>
  );
}