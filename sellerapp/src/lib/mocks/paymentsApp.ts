export async function iniciarPago(data: {
  id_reserva: string;
  id_alquilador: string;
  id_propietario: string;
  monto_pagar: number;
}) {
  return {
    id_pago: `pago_${data.id_reserva}`,
  };
}