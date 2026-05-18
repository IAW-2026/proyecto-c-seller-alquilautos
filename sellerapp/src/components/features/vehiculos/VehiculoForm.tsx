"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { Vehiculo } from "@/lib/types";

interface VehiculoFormProps {
  vehiculo?: Vehiculo;
}

export function VehiculoForm({ vehiculo }: VehiculoFormProps) {
  const router = useRouter();
  const isEditing = !!vehiculo;

  const [form, setForm] = useState({
    marca: vehiculo?.marca ?? "",
    modelo: vehiculo?.modelo ?? "",
    precio: vehiculo?.precio?.toString() ?? "",
    ubicacion: vehiculo?.ubicacion ?? "",
    fotos: vehiculo?.fotos?.join(", ") ?? "",
    estado: vehiculo?.estado ?? "Disponible",
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
      precio: Number(form.precio),
      ubicacion: form.ubicacion,
      fotos: form.fotos.split(",").map(f => f.trim()).filter(Boolean),
    };

    const url = isEditing ? `/api/vehiculo/${vehiculo.id_vehiculo}` : "/api/vehiculo";
    const method = isEditing ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setLoading(false);

    if (data.error) {
      if (typeof data.error === "object") {
        const fieldErrors: Record<string, string> = {};
        Object.entries(data.error).forEach(([k, v]) => {
          fieldErrors[k] = Array.isArray(v) ? v[0] : String(v);
        });
        setErrors(fieldErrors);
      }
      return;
    }

    router.push("/dashboard/vehiculos");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="card-surface">
      <div className="form-grid">
        <Field label="Marca" error={errors.marca} htmlFor="marca">
          <input
            id="marca"
            name="marca"
            value={form.marca}
            onChange={handleChange}
            placeholder="Toyota"
          />
        </Field>

        <Field label="Modelo" error={errors.modelo} htmlFor="modelo">
          <input
            id="modelo"
            name="modelo"
            value={form.modelo}
            onChange={handleChange}
            placeholder="Corolla"
          />
        </Field>

        <Field label="Precio por día ($)" error={errors.precio} htmlFor="precio">
          <input
            id="precio"
            name="precio"
            type="number"
            min="0"
            value={form.precio}
            onChange={handleChange}
            placeholder="15000"
          />
        </Field>

        <Field label="Ubicación" error={errors.ubicacion} htmlFor="ubicacion">
          <input
            id="ubicacion"
            name="ubicacion"
            value={form.ubicacion}
            onChange={handleChange}
            placeholder="Buenos Aires, Argentina"
          />
        </Field>

        <Field
          label="URLs de fotos (separadas por coma)"
          error={errors.fotos}
          htmlFor="fotos"
          hint="Ingresá las URLs de las fotos separadas por coma"
        >
          <input
            id="fotos"
            name="fotos"
            value={form.fotos}
            onChange={handleChange}
            placeholder="https://ejemplo.com/foto1.jpg, https://ejemplo.com/foto2.jpg"
            className="span-2"
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
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear vehículo"}
        </Button>
      </div>
    </form>
  );
}