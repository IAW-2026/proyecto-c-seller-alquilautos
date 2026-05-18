"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

const SECTION_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard del Propietario",
  "/dashboard/vehiculos": "Mi Flota",
  "/dashboard/vehiculos/nuevo": "Nuevo Vehículo",
  "/dashboard/reservas": "Reservas",
  "/admin": "Panel de Administración",
  "/admin/propietarios": "Propietarios",
  "/admin/vehiculos": "Vehículos",
  "/admin/reservas": "Reservas",
};

function titleFor(path: string): string {
  if (path.includes("/editar")) return "Editar Vehículo";
  return SECTION_TITLES[path] ?? "AlquilAutos";
}

interface HeaderProps {
  onMenu?: () => void;
}

export function Header({ onMenu }: HeaderProps) {
  const pathname = usePathname();
  const title = titleFor(pathname);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
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

  return (
    <>
      <div className="mobile-bar">
        <button onClick={onMenu} aria-label="Abrir menú"><Icon name="menu" /></button>
        <strong>{title}</strong>
        <div style={{ flex: 1 }} />
        <button onClick={toggleTheme} aria-label="Cambiar tema">
          <Icon name={resolved === "dark" ? "sun" : "moon"} />
        </button>
      </div>
      <header className="header">
        <div className="search">
          <Icon name="search" size={16} className="icon" />
          <input type="search" placeholder="Buscar vehículos o reservas..." aria-label="Buscar" />
        </div>
        <button className="icon-btn" onClick={toggleTheme} aria-label="Cambiar tema">
          <Icon name={resolved === "dark" ? "sun" : "moon"} />
        </button>
        <button className="icon-btn" aria-label="Notificaciones">
          <Icon name="bell" /><span className="dot" />
        </button>
        <button className="icon-btn" aria-label="Ayuda">
          <Icon name="help" />
        </button>
        <div className="divider" />
        <div className="section-title">{title}</div>
      </header>
    </>
  );
}