-- CreateEnum
CREATE TYPE "EstadoReserva" AS ENUM ('Pendiente', 'Aceptada', 'Rechazada');

-- CreateTable
CREATE TABLE "Propietario" (
    "id_propietario" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "fecha_nacimiento" TIMESTAMP(3) NOT NULL,
    "dni" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Propietario_pkey" PRIMARY KEY ("id_propietario")
);

-- CreateTable
CREATE TABLE "Vehiculo" (
    "id_vehiculo" TEXT NOT NULL,
    "id_propietario" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "fotos" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehiculo_pkey" PRIMARY KEY ("id_vehiculo")
);

-- CreateTable
CREATE TABLE "Reserva" (
    "id_reserva" TEXT NOT NULL,
    "id_vehiculo" TEXT NOT NULL,
    "id_propietario" TEXT NOT NULL,
    "id_alquilador" TEXT NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_final" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoReserva" NOT NULL DEFAULT 'Pendiente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reserva_pkey" PRIMARY KEY ("id_reserva")
);

-- CreateIndex
CREATE UNIQUE INDEX "Propietario_email_key" ON "Propietario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Propietario_dni_key" ON "Propietario"("dni");

-- AddForeignKey
ALTER TABLE "Vehiculo" ADD CONSTRAINT "Vehiculo_id_propietario_fkey" FOREIGN KEY ("id_propietario") REFERENCES "Propietario"("id_propietario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_id_vehiculo_fkey" FOREIGN KEY ("id_vehiculo") REFERENCES "Vehiculo"("id_vehiculo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_id_propietario_fkey" FOREIGN KEY ("id_propietario") REFERENCES "Propietario"("id_propietario") ON DELETE RESTRICT ON UPDATE CASCADE;
