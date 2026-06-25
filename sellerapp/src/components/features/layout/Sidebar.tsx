"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/Icon";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";

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
  isAdminSeller?: boolean;
  pendientesUrgentes?: number;
}

export function Sidebar({ open = false, onClose, isAdmin = false, isAdminSeller = false, pendientesUrgentes = 0 }: SidebarProps) {
  const pathname = usePathname();
  const navItems = isAdminSeller ? NAV_PROPIETARIO : (isAdmin ? NAV_ADMIN : NAV_PROPIETARIO);
  const [adminOpen, setAdminOpen] = useState(false);
 
  const isActive = (to: string) =>
  pathname === to || (to !== "/dashboard" && to !== "/admin" && pathname.startsWith(to));
  
  useEffect(() => {
    if (pathname.startsWith("/admin")) setAdminOpen(true);
  }, [pathname]);
  
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-[rgba(15,23,42,0.45)] z-[80]"
          onClick={onClose}
        />
      )}
      <aside className={[
        "bg-[var(--chrome-bg)] border-r border-[var(--chrome-border)] flex flex-col sticky top-0 h-screen",
        // mobile
        "max-[900px]:fixed max-[900px]:left-0 max-[900px]:top-0 max-[900px]:bottom-0 max-[900px]:w-[260px] max-[900px]:z-[90] max-[900px]:transition-transform max-[900px]:duration-[220ms]",
        open ? "max-[900px]:translate-x-0" : "max-[900px]:-translate-x-full",
      ].join(" ")}>

        {/* Brand */}
        <div className="px-6 pt-6 pb-5">
          <h1 className="m-0 text-[22px] font-bold tracking-[-0.02em] text-[var(--chrome-text-active)]">
            AlquilAutos
          </h1>
          <p className="m-0 mt-[2px] text-[12px] text-[var(--chrome-text)]">
            {isAdmin && !isAdminSeller ? "Panel Admin" : "Gestión de Flota"}
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
                    ? "bg-[var(--chrome-bg-active)] text-[var(--chrome-text-active)] font-semibold shadow-[var(--shadow-sm)]"
                    : "text-[var(--chrome-text)] hover:bg-[var(--chrome-bg-hover)] hover:text-[var(--chrome-text-active)]",
                ].join(" ")}
              >
                <Icon name={item.icon} className="w-[18px] h-[18px] shrink-0" />
                <span>{item.label}</span>
                {item.to === "/dashboard/reservas" && pendientesUrgentes > 0 && (
                  <Badge tone="danger">{pendientesUrgentes}</Badge>
                )}
              </Link>
            );
          })}
          <div className="flex-1" />

          {/* Botón Panel Admin — solo si es admin (adminSeller o adminGlobal) en el dashboard */}
          {isAdminSeller && (
            <div>
              <button
                onClick={() => setAdminOpen(prev => !prev)}
                className="w-full flex items-center gap-3 px-[14px] py-[10px] rounded-[var(--radius-md)] text-[14px] cursor-pointer transition-[background,color] duration-[180ms] text-[var(--chrome-text)] hover:bg-[var(--chrome-bg-hover)] hover:text-[var(--chrome-text-active)]"
              >
                <Icon name="shield" className="w-[18px] h-[18px] shrink-0" />
                <span>Panel Admin</span>
                <Icon name={adminOpen ? "chevronLeft" : "chevronRight"} size={14} className="ml-auto" />
              </button>
              {adminOpen && (
                <div className="ml-4 flex flex-col gap-[2px] mt-[2px]">
                  {NAV_ADMIN.map(item => {
                    const active = isActive(item.to);
                    return (
                      <Link
                        key={item.to}
                        href={item.to}
                        onClick={onClose}
                        className={[
                          "flex items-center gap-3 px-[14px] py-[9px] rounded-[var(--radius-md)] text-[13px] cursor-pointer transition-[background,color] duration-[180ms]",
                          active
                            ? "bg-[var(--chrome-bg-active)] text-[var(--chrome-text-active)] font-semibold"
                            : "text-[var(--chrome-text)] hover:bg-[var(--chrome-bg-hover)] hover:text-[var(--chrome-text-active)]",
                        ].join(" ")}
                      >
                        <Icon name={item.icon} className="w-[16px] h-[16px] shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}