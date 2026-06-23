export async function iniciarPago(data: {
  id_reserva: string;
  id_alquilador: string;
  id_propietario: string;
  monto_pagar: number;
}): Promise<{ data: { id_pago: string | number } | null; error: string | null }> {
  try {
    const res = await fetch(`${process.env.PAYMENTS_API_URL}/api/pago`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      cache: "no-store",
    });

    if (!res.ok) {
      return { data: null, error: `Payments App respondió ${res.status}` };
    }

    const json = await res.json();
    return { data: json, error: null };
  } catch {
    return { data: null, error: "No se pudo contactar a Payments App" };
  }
}
