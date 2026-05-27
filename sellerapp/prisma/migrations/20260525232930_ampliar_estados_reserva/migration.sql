-- CreateEnum
CREATE TYPE "EstadoVehiculo" AS ENUM ('Disponible', 'Alquilado');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EstadoReserva" ADD VALUE 'Coordinada';
ALTER TYPE "EstadoReserva" ADD VALUE 'Pagada';
ALTER TYPE "EstadoReserva" ADD VALUE 'Finalizada';
ALTER TYPE "EstadoReserva" ADD VALUE 'Entregada';
ALTER TYPE "EstadoReserva" ADD VALUE 'Cancelada';

-- AlterTable
ALTER TABLE "Vehiculo" ADD COLUMN     "estado" "EstadoVehiculo" NOT NULL DEFAULT 'Disponible';
