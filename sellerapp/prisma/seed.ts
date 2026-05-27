import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import "dotenv/config";

async function main() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter } as any);

  const propietario1 = await prisma.propietario.create({
    data: {
      email: "carlos.gomez@gmail.com",
      nombre: "Carlos",
      apellido: "Gomez",
      fecha_nacimiento: new Date("1985-03-15"),
      dni: "28456789",
      direccion: "Av. Corrientes 1234, Buenos Aires",
    },
  });

  const propietario2 = await prisma.propietario.create({
    data: {
      email: "maria.lopez@gmail.com",
      nombre: "Maria",
      apellido: "Lopez",
      fecha_nacimiento: new Date("1990-07-22"),
      dni: "32156478",
      direccion: "Av. Santa Fe 567, Buenos Aires",
    },
  });

  const vehiculo1 = await prisma.vehiculo.create({
    data: {
      id_propietario: propietario1.id_propietario,
      marca: "Toyota",
      modelo: "Corolla",
      anio: 2023,
      precio: 15000,
      fotos: ["https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=900&q=80"],
    },
  });

  const vehiculo2 = await prisma.vehiculo.create({
    data: {
      id_propietario: propietario1.id_propietario,
      marca: "Ford",
      modelo: "Focus",
      anio: 2022,
      precio: 12000,
      fotos: ["https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=900&q=80"],
    },
  });

  const vehiculo3 = await prisma.vehiculo.create({
    data: {
      id_propietario: propietario2.id_propietario,
      marca: "Chevrolet",
      modelo: "Cruze",
      anio: 2022,
      precio: 13500,
      fotos: ["https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=900&q=80"],
    },
  });

  await prisma.vehiculo.create({
    data: {
      id_propietario: propietario2.id_propietario,
      marca: "Volkswagen",
      modelo: "Golf",
      anio: 2021,
      precio: 18000,
      fotos: ["https://images.unsplash.com/photo-1502877338535-766e1452684a?w=900&q=80"],
    },
  });

  const vehiculo5 = await prisma.vehiculo.create({
    data: {
      id_propietario: propietario1.id_propietario,
      marca: "Honda",
      modelo: "Civic",
      anio: 2023,
      precio: 16500,
      fotos: ["https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=900&q=80"],
    },
  });

  await prisma.reserva.create({
    data: {
      id_vehiculo: vehiculo1.id_vehiculo,
      id_propietario: propietario1.id_propietario,
      id_alquilador: "alquilador_001",
      fecha_inicio: new Date("2026-06-01"),
      fecha_final: new Date("2026-06-07"),
      estado: "Pendiente",
    },
  });

  await prisma.reserva.create({
    data: {
      id_vehiculo: vehiculo2.id_vehiculo,
      id_propietario: propietario1.id_propietario,
      id_alquilador: "alquilador_002",
      fecha_inicio: new Date("2026-06-10"),
      fecha_final: new Date("2026-06-15"),
      estado: "Aceptada",
    },
  });

  await prisma.reserva.create({
    data: {
      id_vehiculo: vehiculo3.id_vehiculo,
      id_propietario: propietario2.id_propietario,
      id_alquilador: "alquilador_001",
      fecha_inicio: new Date("2026-05-20"),
      fecha_final: new Date("2026-05-25"),
      estado: "Rechazada",
    },
  });

  await prisma.reserva.create({
    data: {
      id_vehiculo: vehiculo5.id_vehiculo,
      id_propietario: propietario1.id_propietario,
      id_alquilador: "alquilador_003",
      fecha_inicio: new Date("2026-07-01"),
      fecha_final: new Date("2026-07-10"),
      estado: "Coordinada",
    },
  });

  console.log("✅ Seed completado: 2 propietarios, 5 vehículos, 4 reservas");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});