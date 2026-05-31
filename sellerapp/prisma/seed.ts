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
      telefono: "+54 9 11 1234 5678",
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
      telefono: "+54 9 11 8765 4321",
    },
  });

  // Vehículos de Carlos (propietario1)
  const vehiculo1 = await prisma.vehiculo.create({
    data: {
      id_propietario: propietario1.id_propietario,
      marca: "Toyota",
      modelo: "Corolla",
      anio: 2023,
      precio: 15000,
      fotos: "https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=900&q=80",
    },
  });

  const vehiculo2 = await prisma.vehiculo.create({
    data: {
      id_propietario: propietario1.id_propietario,
      marca: "Ford",
      modelo: "Focus",
      anio: 2022,
      precio: 12000,
      fotos: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=900&q=80",
    },
  });

  const vehiculo5 = await prisma.vehiculo.create({
    data: {
      id_propietario: propietario1.id_propietario,
      marca: "Honda",
      modelo: "Civic",
      anio: 2023,
      precio: 16500,
      fotos: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=900&q=80",
    },
  });

  // Vehículos de Maria (propietario2)
  const vehiculo3 = await prisma.vehiculo.create({
    data: {
      id_propietario: propietario2.id_propietario,
      marca: "Chevrolet",
      modelo: "Cruze",
      anio: 2022,
      precio: 13500,
      fotos: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=900&q=80",
    },
  });

  const vehiculo4 = await prisma.vehiculo.create({
    data: {
      id_propietario: propietario2.id_propietario,
      marca: "Volkswagen",
      modelo: "Golf",
      anio: 2021,
      precio: 18000,
      fotos: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=900&q=80",
    },
  });

  const vehiculo6 = await prisma.vehiculo.create({
    data: {
      id_propietario: propietario2.id_propietario,
      marca: "BMW",
      modelo: "Serie 3",
      anio: 2024,
      precio: 35000,
      estado: "Alquilado",
      fotos: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&q=80",
    },
  });

  const vehiculo7 = await prisma.vehiculo.create({
    data: {
      id_propietario: propietario2.id_propietario,
      marca: "Jeep",
      modelo: "Renegade",
      anio: 2023,
      precio: 22000,
      fotos: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=900&q=80",
    },
  });

  const vehiculo8 = await prisma.vehiculo.create({
    data: {
      id_propietario: propietario2.id_propietario,
      marca: "Renault",
      modelo: "Sandero",
      anio: 2022,
      precio: 9000,
      fotos: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=900&q=80",
    },
  });

  // Reservas de Carlos
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
      id_vehiculo: vehiculo5.id_vehiculo,
      id_propietario: propietario1.id_propietario,
      id_alquilador: "alquilador_003",
      fecha_inicio: new Date("2026-07-01"),
      fecha_final: new Date("2026-07-10"),
      estado: "Coordinada",
    },
  });

  // Reservas de Maria - Pendientes para aceptar
  await prisma.reserva.create({
    data: {
      id_vehiculo: vehiculo3.id_vehiculo,
      id_propietario: propietario2.id_propietario,
      id_alquilador: "alquilador_001",
      fecha_inicio: new Date("2026-06-05"),
      fecha_final: new Date("2026-06-10"),
      estado: "Pendiente",
    },
  });

  await prisma.reserva.create({
    data: {
      id_vehiculo: vehiculo4.id_vehiculo,
      id_propietario: propietario2.id_propietario,
      id_alquilador: "alquilador_002",
      fecha_inicio: new Date("2026-06-12"),
      fecha_final: new Date("2026-06-18"),
      estado: "Pendiente",
    },
  });

  await prisma.reserva.create({
    data: {
      id_vehiculo: vehiculo7.id_vehiculo,
      id_propietario: propietario2.id_propietario,
      id_alquilador: "alquilador_003",
      fecha_inicio: new Date("2026-06-20"),
      fecha_final: new Date("2026-06-25"),
      estado: "Pendiente",
    },
  });

  // Reservas de Maria - Finalizadas
  await prisma.reserva.create({
    data: {
      id_vehiculo: vehiculo6.id_vehiculo,
      id_propietario: propietario2.id_propietario,
      id_alquilador: "alquilador_001",
      fecha_inicio: new Date("2026-04-01"),
      fecha_final: new Date("2026-04-08"),
      estado: "Finalizada",
    },
  });

  await prisma.reserva.create({
    data: {
      id_vehiculo: vehiculo8.id_vehiculo,
      id_propietario: propietario2.id_propietario,
      id_alquilador: "alquilador_002",
      fecha_inicio: new Date("2026-04-15"),
      fecha_final: new Date("2026-04-20"),
      estado: "Finalizada",
    },
  });

  await prisma.reserva.create({
    data: {
      id_vehiculo: vehiculo3.id_vehiculo,
      id_propietario: propietario2.id_propietario,
      id_alquilador: "alquilador_003",
      fecha_inicio: new Date("2026-03-10"),
      fecha_final: new Date("2026-03-15"),
      estado: "Rechazada",
    },
  });

  console.log("✅ Seed completado: 2 propietarios, 8 vehículos, 9 reservas");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});