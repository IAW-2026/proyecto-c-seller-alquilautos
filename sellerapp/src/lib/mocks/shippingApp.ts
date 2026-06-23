export async function createEntrega(data: {
  id_reserva: string;
  id_vehiculo: string;
  id_propietario: string;
  id_alquilador: string;
  hora_inicio_entrega: string;
  hora_fin_entrega: string;
  hora_inicio_devolucion: string;
  hora_fin_devolucion: string;
  fecha_inicio: Date;
  fecha_fin: Date;
}): Promise<{ data: { id_entrega: string; id_reserva: string; estado: string } | null; error: string | null }> {
  try {
    const res = await fetch(`${process.env.SHIPPING_API_URL}/api/entrega`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      cache: "no-store",
    });

    if (!res.ok) {
      return { data: null, error: `Shipping App respondió ${res.status}` };
    }

    const json = await res.json();
    return { data: json, error: null };
  } catch {
    return { data: null, error: "No se pudo contactar a Shipping App" };
  }
}

export async function getHorarioSeleccionado(id_reserva: string): Promise<{
  data: {
    id_reserva: string;
    hora_inicio_entrega: string;
    hora_fin_entrega: string;
    hora_inicio_devolucion: string;
    hora_fin_devolucion: string;
  } | null;
  error: string | null;
}> {
  try {
    const res = await fetch(
      `${process.env.SHIPPING_API_URL}/api/horario/seleccionada/${id_reserva}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return { data: null, error: `Shipping App respondió ${res.status}` };
    }

    const json = await res.json();
    return { data: json, error: null };
  } catch {
    return { data: null, error: "No se pudo contactar a Shipping App" };
  }
}

export async function cancelarEntrega(id_reserva: string): Promise<{
  data: { id_reserva: string; estado: string } | null;
  error: string | null;
}> {
  try {
    const res = await fetch(
      `${process.env.SHIPPING_API_URL}/api/cancelar/${id_reserva}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return { data: null, error: `Shipping App respondió ${res.status}` };
    }

    const json = await res.json();
    return { data: json, error: null };
  } catch {
    return { data: null, error: "No se pudo contactar a Shipping App" };
  }
}

