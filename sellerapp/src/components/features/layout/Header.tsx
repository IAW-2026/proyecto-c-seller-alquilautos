"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { UserButton } from "@clerk/nextjs";

const SECTION_TITLES: Record<string, string> = {
  "/dashboard":                  "Dashboard del Propietario",
  "/dashboard/vehiculos":        "Mi Flota",
  "/dashboard/vehiculos/nuevo":  "Nuevo Vehículo",
  "/dashboard/reservas":         "Reservas",
  "/admin":                      "Panel de Administración",
  "/admin/propietarios":         "Propietarios",
  "/admin/vehiculos":            "Vehículos",
  "/admin/reservas":             "Reservas",
  "/dashboard/perfil":           "Mi Perfil",
};

function titleFor(path: string): string {
  if (path.includes("/editar")) return "Editar Vehículo";
  return SECTION_TITLES[path] ?? "AlquilAutos";
}

interface HeaderProps {
  onMenu?: () => void;
}

export function Header({ onMenu }: HeaderProps) {
  const pathname  = usePathname();
  const title     = titleFor(pathname);
  const [theme, setTheme]     = useState<"light" | "dark" | "system">("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("aa_theme") as "light" | "dark" | "system" | null;
      if (saved) setTheme(saved);
    } catch {}
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
    try { localStorage.setItem("aa_theme", theme); } catch {}
  }, [theme, mounted]);

  const resolved = !mounted
    ? "light"
    : theme === "system"
    ? (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : theme;

  const toggleTheme = () => setTheme(resolved === "dark" ? "light" : "dark");

  const iconBtnClass = "w-9 h-9 grid place-items-center bg-transparent border-none rounded-[var(--radius-full)] text-[var(--text-secondary)] cursor-pointer transition-[background] duration-[180ms] hover:bg-[var(--bg-hover)] relative";

  return (
    <>
      {/* Mobile bar */}
      <div className="hidden max-[900px]:flex items-center gap-3 px-4 py-3 border-b border-[var(--border-default)] bg-[var(--bg-surface)]">
        <button
          onClick={onMenu}
          aria-label="Abrir menú"
          className="border border-[var(--border-default)] bg-[var(--bg-surface)] rounded-[var(--radius-md)] px-[10px] py-[6px] cursor-pointer"
        >
          <Icon name="menu" />
        </button>
        <strong className="text-[var(--text-primary)]">{title}</strong>
        <div className="flex-1" />
        <button onClick={toggleTheme} aria-label="Cambiar tema" className="cursor-pointer bg-transparent border-none">
          <Icon name={resolved === "dark" ? "sun" : "moon"} />
        </button>
      </div>

      {/* Desktop header */}
      <header className="flex items-center gap-4 px-8 py-[18px] border-b border-[var(--border-default)] bg-[var(--bg-surface)] sticky top-0 z-10 max-[900px]:px-[18px] max-[900px]:py-[14px]">

        {/* Search */}
        <div className="flex-1 max-w-[480px] mr-auto relative">
          <Icon name="search" size={16} className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="search"
            placeholder="Buscar vehículos o reservas..."
            aria-label="Buscar"
            className="w-full border-none bg-[var(--color-neutral-100)] text-[var(--text-primary)] pl-[40px] pr-[14px] py-[10px] rounded-[var(--radius-full)] text-[13px] outline-none transition-[box-shadow] duration-[180ms] focus:shadow-[0_0_0_2px_var(--border-focus)]"
          />
        </div>

        {/* Section title — desktop only */}
        <span className="text-[18px] font-bold text-[var(--color-primary-400)] tracking-[-0.01em] max-[900px]:hidden">
          {title}
        </span>

        {/* Icon buttons */}
        <button className={iconBtnClass} onClick={toggleTheme} aria-label="Cambiar tema">
          <Icon name={resolved === "dark" ? "sun" : "moon"} />
        </button>
        <button className={iconBtnClass} aria-label="Notificaciones">
          <Icon name="bell" />
          <span className="absolute top-2 right-[9px] w-[7px] h-[7px] rounded-full bg-[var(--color-danger-500)] border-2 border-[var(--bg-surface)]" />
        </button>
        <button className={iconBtnClass} aria-label="Ayuda">
          <Icon name="help" />
        </button>

        <div className="w-px h-[22px] bg-[var(--border-default)]" />

        <UserButton>
          <UserButton.MenuItems>
            <UserButton.Link
              label="Mi perfil"
              labelIcon={<Icon name="user" size={14} />}
              href="/dashboard/perfil"
            />
          </UserButton.MenuItems>
        </UserButton>
      </header>
    </>
  );
}