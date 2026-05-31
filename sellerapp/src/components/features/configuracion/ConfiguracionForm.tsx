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

const inputClass = "border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] px-3 py-[10px] rounded-[var(--radius-md)] text-[14px] font-[inherit] outline-none transition-[border-color,box-shadow] duration-[180ms] focus:border-[var(--border-focus)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary-400)_18%,transparent)]";

export function ConfiguracionForm({ propietario, onSuccess }: ConfiguracionFormProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    nombre:           propietario.nombre,
    apellido:         propietario.apellido,
    email:            propietario.email,
    dni:              propietario.dni,
    fecha_nacimiento: new Date(propietario.fecha_nacimiento).toISOString().split("T")[0],
    direccion:        propietario.direccion,
    telefono:         propietario.telefono ?? "",
  });

  const [errors, setErrors]   = useState<Record<string, string>>({});
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
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-sm)]"
    >
      {success && (
        <div className="bg-[var(--color-success-50)] text-[var(--color-success-700)] px-[14px] py-[10px] rounded-[var(--radius-md)] mb-4 text-[13px] font-semibold">
          ✓ Cambios guardados correctamente
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-5 gap-y-[18px] max-[700px]:grid-cols-1">
        <Field label="Nombre" error={errors.nombre} htmlFor="nombre">
          <input id="nombre" name="nombre" value={form.nombre} onChange={handleChange} className={inputClass} />
        </Field>
        <Field label="Apellido" error={errors.apellido} htmlFor="apellido">
          <input id="apellido" name="apellido" value={form.apellido} onChange={handleChange} className={inputClass} />
        </Field>
        <Field label="Email" error={errors.email} htmlFor="email">
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} className={inputClass} />
        </Field>
        <Field label="DNI" error={errors.dni} htmlFor="dni">
          <input id="dni" name="dni" value={form.dni} onChange={handleChange} className={inputClass} />
        </Field>
        <Field label="Fecha de nacimiento" error={errors.fecha_nacimiento} htmlFor="fecha_nacimiento">
          <input id="fecha_nacimiento" name="fecha_nacimiento" type="date" value={form.fecha_nacimiento} onChange={handleChange} className={inputClass} />
        </Field>
        <Field label="Dirección" error={errors.direccion} htmlFor="direccion">
          <input id="direccion" name="direccion" value={form.direccion} onChange={handleChange} className={inputClass} />
        </Field>
        <Field label="Teléfono" error={errors.telefono} htmlFor="telefono">
          <input id="telefono" name="telefono" value={form.telefono} onChange={handleChange} placeholder="+54 9 11 1234 5678" className={inputClass} />
        </Field>
      </div>

      <div className="flex justify-end gap-[10px] mt-5">
        <Button type="button" variant="secondary" onClick={() => router.back()}>Cancelar</Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}