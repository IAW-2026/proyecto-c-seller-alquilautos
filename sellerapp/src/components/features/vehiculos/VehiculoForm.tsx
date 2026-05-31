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

export function VehiculoForm({ vehiculo, onSuccess }: VehiculoFormProps) {
  const router = useRouter();
  const isEditing = !!vehiculo;

  const [form, setForm] = useState({
    marca: vehiculo?.marca ?? "",
    modelo: vehiculo?.modelo ?? "",
    anio: vehiculo?.anio?.toString() ?? new Date().getFullYear().toString(),
    precio: vehiculo?.precio?.toString() ?? "",
    fotos: vehiculo?.fotos ?? "",
    estado: (vehiculo?.estado ?? "Disponible") as "Disponible" | "Alquilado",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const body = {
      marca: form.marca,
      modelo: form.modelo,
      anio: Number(form.anio),
      precio: Number(form.precio),
      fotos: form.fotos,
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

    if (onSuccess) {
      onSuccess();
    } else {
      router.push("/dashboard/vehiculos");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-surface">
      <div className="form-grid">
        <Field label="Marca" error={errors.marca} htmlFor="marca">
          <input id="marca" name="marca" value={form.marca} onChange={handleChange} placeholder="Toyota" />
        </Field>

        <Field label="Modelo" error={errors.modelo} htmlFor="modelo">
          <input id="modelo" name="modelo" value={form.modelo} onChange={handleChange} placeholder="Corolla" />
        </Field>

        <Field label="Año" error={errors.anio} htmlFor="anio">
          <input
            id="anio"
            name="anio"
            type="number"
            min="1990"
            max={new Date().getFullYear() + 1}
            value={form.anio}
            onChange={handleChange}
          />
        </Field>

        <Field label="Precio por día ($)" error={errors.precio} htmlFor="precio">
          <input id="precio" name="precio" type="number" min="0" value={form.precio} onChange={handleChange} placeholder="15000" />
        </Field>

        <Field label="Foto (URL)" error={errors.fotos} htmlFor="fotos" hint="Ingresá la URL de la foto del vehículo">
          <input
            id="fotos"
            name="fotos"
            value={form.fotos}
            onChange={handleChange}
            placeholder="https://ejemplo.com/foto.jpg"
          />
        </Field>

        <Field label="Estado" htmlFor="estado">
          <select
            id="estado"
            name="estado"
            value={form.estado}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setForm(prev => ({ ...prev, estado: e.target.value as "Disponible" | "Alquilado" }))
            }
          >
            <option value="Disponible">Disponible</option>
            <option value="Alquilado">Alquilado</option>
          </select>
        </Field>
      </div>

      <div className="form-actions">
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