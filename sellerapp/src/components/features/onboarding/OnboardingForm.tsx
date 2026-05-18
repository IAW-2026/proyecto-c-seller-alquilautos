"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export default function OnboardingForm() {
  const { user } = useUser();
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    fecha_nacimiento: "",
    dni: "",
    direccion: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: "" }));
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError("");
    setErrors({});

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        if (data.error && typeof data.error === "object") {
          // Errores de validación de Zod (por campo)
          const fieldErrors: Record<string, string> = {};
          Object.entries(data.error).forEach(([k, v]) => {
            fieldErrors[k] = Array.isArray(v) ? v[0] : String(v);
          });
          setErrors(fieldErrors);
        } else {
          // Error de tipo string ("Ya completaste el onboarding", "No autorizado", etc.)
          setFormError(String(data.error ?? `Error ${res.status}`));
        }
        setLoading(false);
        return;
      }

      // Éxito: forzar refresh del token de Clerk con el nuevo publicMetadata
      await user?.reload();

      // Hard navigation para que el middleware lea el JWT fresco con id_propietario
      window.location.href = "/dashboard";
    } catch (err: any) {
      setFormError(err?.message ?? "Error de red");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-surface">
      {formError && (
        <div
          style={{
            background: "#fee",
            color: "#900",
            padding: "10px 14px",
            borderRadius: 8,
            marginBottom: 16,
            border: "1px solid #fcc",
          }}
        >
          {formError}
        </div>
      )}

      <div className="form-grid">
        <Field label="Nombre" error={errors.nombre} htmlFor="nombre">
          <input
            id="nombre"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Carlos"
          />
        </Field>

        <Field label="Apellido" error={errors.apellido} htmlFor="apellido">
          <input
            id="apellido"
            name="apellido"
            value={form.apellido}
            onChange={handleChange}
            placeholder="Gomez"
          />
        </Field>

        <Field label="DNI" error={errors.dni} htmlFor="dni">
          <input
            id="dni"
            name="dni"
            value={form.dni}
            onChange={handleChange}
            placeholder="28456789"
          />
        </Field>

        <Field label="Fecha de nacimiento" error={errors.fecha_nacimiento} htmlFor="fecha_nacimiento">
          <input
            id="fecha_nacimiento"
            name="fecha_nacimiento"
            type="date"
            value={form.fecha_nacimiento}
            onChange={handleChange}
          />
        </Field>

        <Field
          label="Dirección"
          error={errors.direccion}
          htmlFor="direccion"
          hint="Barrio o zona donde vivís"
        >
          <input
            id="direccion"
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
            placeholder="Av. Corrientes 1234, Buenos Aires"
            className="span-2"
          />
        </Field>
      </div>

      <div className="form-actions">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Guardando..." : "Completar perfil"}
        </Button>
      </div>
    </form>
  );
}