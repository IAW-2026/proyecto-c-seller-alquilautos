"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { onboardingAction } from "@/lib/actions/onboarding.actions";

const inputClass = "border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] px-3 py-[10px] rounded-[var(--radius-md)] text-[14px] font-[inherit] outline-none transition-[border-color,box-shadow] duration-[180ms] focus:border-[var(--border-focus)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary-400)_18%,transparent)]";

export default function OnboardingForm() {
  const { user } = useUser();
  const [form, setForm] = useState({
    nombre:           "",
    apellido:         "",
    fecha_nacimiento: "",
    dni:              "",
    direccion:        "",
    telefono:         "",
  });
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>("");
  const [loading, setLoading]     = useState(false);

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
      const result = await onboardingAction(form);

      if ("error" in result) {
        if (typeof result.error === "object") {
          const fieldErrors: Record<string, string> = {};
          Object.entries(result.error).forEach(([k, v]) => {
            fieldErrors[k] = Array.isArray(v) ? v[0] : String(v);
          });
          setErrors(fieldErrors);
        } else {
          setFormError(String(result.error));
        }
        setLoading(false);
        return;
      }

      await user?.reload();
      window.location.href = "/dashboard";
    } catch (err: any) {
      setFormError(err?.message ?? "Error inesperado");
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-sm)]"
    >
      {formError && (
        <div className="bg-[#fee] text-[#900] px-[14px] py-[10px] rounded-[var(--radius-md)] mb-4 text-[13px] border border-[#fcc]">
          {formError}
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-5 gap-y-[18px] max-[700px]:grid-cols-1">
        <Field label="Nombre" error={errors.nombre} htmlFor="nombre">
          <input id="nombre" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Carlos" className={inputClass} />
        </Field>
        <Field label="Apellido" error={errors.apellido} htmlFor="apellido">
          <input id="apellido" name="apellido" value={form.apellido} onChange={handleChange} placeholder="Gomez" className={inputClass} />
        </Field>
        <Field label="DNI" error={errors.dni} htmlFor="dni">
          <input id="dni" name="dni" value={form.dni} onChange={handleChange} placeholder="28456789" className={inputClass} />
        </Field>
        <Field label="Fecha de nacimiento" error={errors.fecha_nacimiento} htmlFor="fecha_nacimiento">
          <input id="fecha_nacimiento" name="fecha_nacimiento" type="date" value={form.fecha_nacimiento} onChange={handleChange} className={inputClass} />
        </Field>
        <Field label="Teléfono" error={errors.telefono} htmlFor="telefono">
          <input id="telefono" name="telefono" type="tel" value={form.telefono} onChange={handleChange} placeholder="+54 9 11 1234 5678" className={inputClass} />
        </Field>
        <Field label="Dirección" error={errors.direccion} htmlFor="direccion" hint="Barrio o zona donde vivís">
          <input id="direccion" name="direccion" value={form.direccion} onChange={handleChange} placeholder="Av. Corrientes 1234, Buenos Aires" className={inputClass} />
        </Field>
      </div>

      <div className="flex justify-end mt-5">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Guardando..." : "Completar perfil"}
        </Button>
      </div>
    </form>
  );
}