-- Evita que un mismo alquilador tenga más de una solicitud Pendiente para el mismo vehículo
-- (corrige el caso de doble envío de la solicitud de reserva).
CREATE UNIQUE INDEX "Reserva_vehiculo_alquilador_pendiente_unique"
ON "Reserva" ("id_vehiculo", "id_alquilador")
WHERE "estado" = 'Pendiente';
