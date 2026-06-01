"use client";
import { useState } from "react";
import { DetalleModal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { actualizarVehiculoAdminAction } from "@/lib/actions/admin.actions";

interface Vehiculo {
  id_vehiculo: string;
  marca: string;
  modelo: string;
  anio: number;
  precio: number;
  fotos: string;
  estado: string;
}

const inputClass = "w-full border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] px-3 py-[10px] rounded-[var(--radius-md)] text-[14px] font-[inherit] outline-none transition-[border-color,box-shadow] duration-[180ms] focus:border-[var(--border-focus)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary-400)_18%,transparent)]";

export function EditarVehiculoAdminModal({ vehiculo }: { vehiculo: Vehiculo }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    marca: vehiculo.marca,
    modelo: vehiculo.modelo,
    anio: vehiculo.anio.toString(),
    precio: vehiculo.precio.toString(),
    fotos: vehiculo.fotos ?? "",
    estado: vehiculo.estado as "Disponible" | "Alquilado",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await actualizarVehiculoAdminAction(vehiculo.id_vehiculo, {
      marca: form.marca,
      modelo: form.modelo,
      anio: Number(form.anio),
      precio: Number(form.precio),
      fotos: form.fotos,
      estado: form.estado,
    });
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    setOpen(false);
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="inline-flex items-center justify-center px-[10px] py-[6px] rounded-[var(--radius-md)] text-[12px] font-semibold bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-colors duration-[180ms]">
        Editar
      </button>
      <DetalleModal open={open} onClose={() => setOpen(false)} title="Editar vehículo">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <div className="bg-[var(--color-danger-50)] text-[var(--color-danger-700)] px-3 py-2 rounded-[var(--radius-md)] text-[13px]">{error}</div>}
          <div className="grid grid-cols-2 gap-3 max-[500px]:grid-cols-1">
            {[
              { label: "Marca", name: "marca" },
              { label: "Modelo", name: "modelo" },
              { label: "Año", name: "anio", type: "number" },
              { label: "Precio/día", name: "precio", type: "number" },
              { label: "Foto (URL)", name: "fotos", type: "url" },
            ].map(({ label, name, type = "text" }) => (
              <div key={name} className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[var(--text-secondary)]">{label}</label>
                <input
                  name={name} type={type}
                  value={form[name as keyof typeof form]}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-[var(--text-secondary)]">Estado</label>
              <select name="estado" value={form.estado} onChange={handleChange} className={inputClass}>
                <option value="Disponible">Disponible</option>
                <option value="Alquilado">Alquilado</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-[10px] mt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </DetalleModal>
    </>
  );
}