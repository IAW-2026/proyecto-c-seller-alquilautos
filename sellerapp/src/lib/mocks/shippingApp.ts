export async function createEntrega(data: {
  id_reserva: string;
  id_vehiculo: string;
  id_propietario: string;
  id_alquilador: string;
  coordinaciones: {
    tipo: "entrega" | "devolucion";
    fecha: string;
    hora_inicio_disponible: string;
    hora_fin_disponible: string;
  }[];
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

interface HorarioSeleccionadoEvento {
  fecha: string;
  hora_seleccionada: string;
}

export async function getHorarioSeleccionado(id_reserva: string): Promise<{
  data: {
    id_reserva: string;
    id_entrega: string;
    entrega: HorarioSeleccionadoEvento | null;
    devolucion: HorarioSeleccionadoEvento | null;
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

    const json: {
      id_reserva: string;
      id_entrega: string;
      horarios: { tipo: "entrega" | "devolucion"; fecha: string; hora_seleccionada: string }[];
    } = await res.json();

    const entrega    = json.horarios.find(h => h.tipo === "entrega") ?? null;
    const devolucion = json.horarios.find(h => h.tipo === "devolucion") ?? null;

    return {
      data: {
        id_reserva: json.id_reserva,
        id_entrega: json.id_entrega,
        entrega: entrega ? { fecha: entrega.fecha, hora_seleccionada: entrega.hora_seleccionada } : null,
        devolucion: devolucion ? { fecha: devolucion.fecha, hora_seleccionada: devolucion.hora_seleccionada } : null,
      },
      error: null,
    };
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
      `${process.env.SHIPPING_API_URL}/api/entregas/${id_reserva}`,
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

