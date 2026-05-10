
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
      precio: 15000,
      ubicacion: "Buenos Aires, Argentina",
      fotos: ["https://example.com/fotos/corolla1.jpg", "https://example.com/fotos/corolla2.jpg"],
    },
  });

  const vehiculo2 = await prisma.vehiculo.create({
    data: {
      id_propietario: propietario1.id_propietario,
      marca: "Ford",
      modelo: "Focus",
      precio: 12000,
      ubicacion: "Buenos Aires, Argentina",
      fotos: ["https://example.com/fotos/focus1.jpg"],
    },
  });

  const vehiculo3 = await prisma.vehiculo.create({
    data: {
      id_propietario: propietario2.id_propietario,
      marca: "Chevrolet",
      modelo: "Cruze",
      precio: 13500,
      ubicacion: "Córdoba, Argentina",
      fotos: ["https://example.com/fotos/cruze1.jpg"],
    },
  });

  await prisma.vehiculo.create({
    data: {
      id_propietario: propietario2.id_propietario,
      marca: "Volkswagen",
      modelo: "Golf",
      precio: 18000,
      ubicacion: "Rosario, Argentina",
      fotos: ["https://example.com/fotos/golf1.jpg", "https://example.com/fotos/golf2.jpg"],
    },
  });

  const vehiculo5 = await prisma.vehiculo.create({
    data: {
      id_propietario: propietario1.id_propietario,
      marca: "Honda",
      modelo: "Civic",
      precio: 16500,
      ubicacion: "Buenos Aires, Argentina",
      fotos: ["https://example.com/fotos/civic1.jpg"],
    },
  });

  await prisma.reserva.create({
    data: {
      id_vehiculo: vehiculo1.id_vehiculo,
      id_propietario: propietario1.id_propietario,
      id_alquilador: "alquilador_001",
      fecha_inicio: new Date("2025-06-01"),
      fecha_final: new Date("2025-06-07"),
      estado: "Pendiente",
    },
  });

  await prisma.reserva.create({
    data: {
      id_vehiculo: vehiculo2.id_vehiculo,
      id_propietario: propietario1.id_propietario,
      id_alquilador: "alquilador_002",
      fecha_inicio: new Date("2025-06-10"),
      fecha_final: new Date("2025-06-15"),
      estado: "Aceptada",
    },
  });

  await prisma.reserva.create({
    data: {
      id_vehiculo: vehiculo3.id_vehiculo,
      id_propietario: propietario2.id_propietario,
      id_alquilador: "alquilador_001",
      fecha_inicio: new Date("2025-05-20"),
      fecha_final: new Date("2025-05-25"),
      estado: "Rechazada",
    },
  });

  await prisma.reserva.create({
    data: {
      id_vehiculo: vehiculo5.id_vehiculo,
      id_propietario: propietario1.id_propietario,
      id_alquilador: "alquilador_003",
      fecha_inicio: new Date("2025-07-01"),
      fecha_final: new Date("2025-07-10"),
      estado: "Pendiente",
    },
  });

  console.log("✅ Seed completado: 2 propietarios, 5 vehículos, 4 reservas");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});