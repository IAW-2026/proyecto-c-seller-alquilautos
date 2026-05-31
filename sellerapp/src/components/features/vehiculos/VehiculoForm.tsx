"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { crearVehiculoAction, actualizarVehiculoAction } from "@/lib/actions/vehiculo.actions";
import type { Vehiculo } from "@/lib/types";

interface VehiculoFormProps {
  vehiculo?: Vehiculo;
  onSuccess?: () => void;
}

const inputClass = "border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] px-3 py-[10px] rounded-[var(--radius-md)] text-[14px] font-[inherit] outline-none transition-[border-color,box-shadow] duration-[180ms] focus:border-[var(--border-focus)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary-400)_18%,transparent)]";

export function VehiculoForm({ vehiculo, onSuccess }: VehiculoFormProps) {
  const router    = useRouter();
  const isEditing = !!vehiculo;

  const [form, setForm] = useState({
    marca:  vehiculo?.marca   ?? "",
    modelo: vehiculo?.modelo  ?? "",
    anio:   vehiculo?.anio?.toString()    ?? new Date().getFullYear().toString(),
    precio: vehiculo?.precio?.toString()  ?? "",
    fotos:  vehiculo?.fotos   ?? "",
    estado: (vehiculo?.estado ?? "Disponible") as "Disponible" | "Alquilado",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>(vehiculo?.fotos ?? "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: "" }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrors(prev => ({ ...prev, fotos: "" }));

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (data.error) {
        setErrors(prev => ({ ...prev, fotos: data.error }));
        return;
      }

      setPreview(data.url);
      setForm(prev => ({ ...prev, fotos: data.url }));
    } catch {
      setErrors(prev => ({ ...prev, fotos: "Error al subir la imagen" }));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const body = {
      marca:  form.marca,
      modelo: form.modelo,
      anio:   Number(form.anio),
      precio: Number(form.precio),
      fotos:  form.fotos,
      estado: form.estado,
    };

    const result = isEditing
      ? await actualizarVehiculoAction(vehiculo.id_vehiculo, body)
      : await crearVehiculoAction(body);

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

    if (onSuccess) onSuccess();
    else router.push("/dashboard/vehiculos");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-sm)]"
    >
      {/* Grid de campos */}
      <div className="grid grid-cols-2 gap-x-5 gap-y-[18px] max-[700px]:grid-cols-1">
        <Field label="Marca" error={errors.marca} htmlFor="marca">
          <input id="marca" name="marca" value={form.marca} onChange={handleChange} placeholder="Toyota" className={inputClass} />
        </Field>

        <Field label="Modelo" error={errors.modelo} htmlFor="modelo">
          <input id="modelo" name="modelo" value={form.modelo} onChange={handleChange} placeholder="Corolla" className={inputClass} />
        </Field>

        <Field label="Año" error={errors.anio} htmlFor="anio">
          <input
            id="anio" name="anio" type="number"
            min="1990" max={new Date().getFullYear() + 1}
            value={form.anio} onChange={handleChange}
            className={inputClass}
          />
        </Field>

        <Field label="Precio por día ($)" error={errors.precio} htmlFor="precio">
          <input
            id="precio" name="precio" type="number" min="0"
            value={form.precio} onChange={handleChange} placeholder="15000"
            className={inputClass}
          />
        </Field>

        <Field label="Foto" error={errors.fotos} htmlFor="fotos">
          <label
            htmlFor="fotos"
            className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[var(--border-default)] rounded-[var(--radius-md)] p-4 cursor-pointer hover:border-[var(--border-focus)] transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-32 object-cover rounded-[var(--radius-md)]" />
            ) : (
              <>
                <span className="text-[var(--text-secondary)] text-[13px]">
                  {uploading ? "Subiendo..." : "Arrastrá o hacé click para subir una foto"}
                </span>
                <span className="text-[var(--text-tertiary)] text-[11px]">PNG, JPG, WEBP</span>
              </>
            )}
            <input
              id="fotos"
              name="fotos"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              aria-label="Subir foto del vehículo"
            />
          </label>
          {preview && (
            <button
              type="button"
              onClick={() => { setPreview(""); setForm(prev => ({ ...prev, fotos: "" })); }}
              className="text-[12px] text-[var(--color-danger-500)] hover:underline mt-1 self-start"
            >
              Quitar foto
            </button>
          )}
        </Field>

        <Field label="Estado" htmlFor="estado">
          <select
            id="estado" name="estado"
            value={form.estado}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setForm(prev => ({ ...prev, estado: e.target.value as "Disponible" | "Alquilado" }))
            }
            className={inputClass}
          >
            <option value="Disponible">Disponible</option>
            <option value="Alquilado">Alquilado</option>
          </select>
        </Field>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-[10px] mt-5">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear vehículo"}
        </Button>
      </div>
    </form>
  );
}