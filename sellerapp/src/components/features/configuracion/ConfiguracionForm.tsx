"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { Propietario } from "@/lib/types";
import { actualizarPropietarioAction } from "@/lib/actions/propietario.actions";

interface ConfiguracionFormProps {
  propietario: Propietario;
  onSuccess?: () => void;
  
}

export function ConfiguracionForm({ propietario, onSuccess  }: ConfiguracionFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    nombre: propietario.nombre,
    apellido: propietario.apellido,
    email: propietario.email,
    dni: propietario.dni,
    fecha_nacimiento: new Date(propietario.fecha_nacimiento).toISOString().split("T")[0],
    direccion: propietario.direccion,
    telefono: propietario.telefono ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: "" }));
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  const result = await actualizarPropietarioAction(form);
  setLoading(false);

  if (result.error) {
    if (typeof result.error === "object") {
      const fieldErrors: Record<string, string> = {};
      Object.entries(result.error).forEach(([k, v]) => {
        fieldErrors[k] = Array.isArray(v) ? v[0] : String(v);
      });
      setErrors(fieldErrors);
    }
    return;
  }

  setSuccess(true);
  router.refresh();
  if (onSuccess) onSuccess();
};

  return (
    <form onSubmit={handleSubmit} className="card-surface">
      {success && (
        <div style={{
          background: "var(--color-success-50)",
          color: "var(--color-success-700)",
          padding: "10px 14px",
          borderRadius: "var(--radius-md)",
          marginBottom: 16,
          fontSize: 13,
          fontWeight: 600,
        }}>
          ✓ Cambios guardados correctamente
        </div>
      )}
      <div className="form-grid">
        <Field label="Nombre" error={errors.nombre} htmlFor="nombre">
          <input id="nombre" name="nombre" value={form.nombre} onChange={handleChange} />
        </Field>
        <Field label="Apellido" error={errors.apellido} htmlFor="apellido">
          <input id="apellido" name="apellido" value={form.apellido} onChange={handleChange} />
        </Field>
        <Field label="Email" error={errors.email} htmlFor="email">
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
        </Field>
        <Field label="DNI" error={errors.dni} htmlFor="dni">
          <input id="dni" name="dni" value={form.dni} onChange={handleChange} />
        </Field>
        <Field label="Fecha de nacimiento" error={errors.fecha_nacimiento} htmlFor="fecha_nacimiento">
          <input id="fecha_nacimiento" name="fecha_nacimiento" type="date" value={form.fecha_nacimiento} onChange={handleChange} />
        </Field>
        <Field label="Dirección" error={errors.direccion} htmlFor="direccion">
          <input id="direccion" name="direccion" value={form.direccion} onChange={handleChange} />
        </Field>
        <Field label="Teléfono" error={errors.telefono} htmlFor="telefono">
          <input id="telefono" name="telefono" value={form.telefono} onChange={handleChange} placeholder="+54 9 11 1234 5678" />
        </Field>
      </div>
      
      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={() => router.back()}>Cancelar</Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}