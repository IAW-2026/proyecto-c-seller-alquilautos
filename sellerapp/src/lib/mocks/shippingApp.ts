import { auth } from "@clerk/nextjs/server";

async function authHeaders(): Promise<Record<string, string>> {
  const { userId, getToken } = await auth();
  const token = await getToken();
  console.log("[authHeaders] userId:", userId, "| token presente:", !!token);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

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
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
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
      { cache: "no-store", headers: await authHeaders() }
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
  const url = `${process.env.SHIPPING_API_URL}/api/entregas/${id_reserva}`;
  const headers = { "Content-Type": "application/json", ...(await authHeaders()) };
  console.log("[cancelarEntrega] PATCH a Shipping App:", url, "| headers:", JSON.stringify(headers), "(sin body)");
  try {
    const res = await fetch(url, { method: "PATCH", headers, cache: "no-store" });

    console.log("[cancelarEntrega] status de respuesta de Shipping App:", res.status);

    if (!res.ok) {
      const errorBody = await res.text();
      console.log("[cancelarEntrega] body de error de Shipping App:", errorBody);
      return { data: null, error: `Shipping App respondió ${res.status}` };
    }

    const json = await res.json();
    console.log("[cancelarEntrega] body de respuesta de Shipping App:", JSON.stringify(json));
    return { data: json, error: null };
  } catch (err) {
    console.log("[cancelarEntrega] error al contactar a Shipping App:", err);
    return { data: null, error: "No se pudo contactar a Shipping App" };
  }
}

