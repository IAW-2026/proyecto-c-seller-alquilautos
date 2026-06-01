import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import "dotenv/config";

async function main() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter } as any);

  // ===== PROPIETARIOS =====

  const propietario1 = await prisma.propietario.create({
    data: {
      email: "seller+clerk_test@iaw.com",
      nombre: "Maria",
      apellido: "Lopez",
      fecha_nacimiento: new Date("1990-07-22"),
      dni: "32156478",
      direccion: "Av. Santa Fe 567, Buenos Aires",
      telefono: "+54 9 11 8765 4321",
    },
  });

  // ===== ADMIN =====
  const propietario2 = await prisma.propietario.create({
    data: {
      email: "selleradmin+clerk_test@iaw.com",
      nombre: "Carlos",
      apellido: "Gomez",
      fecha_nacimiento: new Date("1985-03-15"),
      dni: "28456789",
      direccion: "Av. Corrientes 1234, Buenos Aires",
      telefono: "+54 9 11 1234 5678",
    },
  });

  // ===== VEHÍCULOS DE MARIA =====

  // v1 Jeep Renegade → reserva Pendiente → Disponible
  const v1 = await prisma.vehiculo.create({
    data: {
      id_propietario: propietario1.id_propietario,
      marca: "Jeep", modelo: "Renegade", anio: 2023, precio: 22000,
      estado: "Disponible", fotos: "",
    },
  });

  // v2 Volkswagen Golf → reserva Aceptada → Alquilado
  const v2 = await prisma.vehiculo.create({
    data: {
      id_propietario: propietario1.id_propietario,
      marca: "Volkswagen", modelo: "Golf", anio: 2022, precio: 18000,
      estado: "Alquilado", fotos: "",
    },
  });

  // v3 Toyota Corolla → reserva Coordinada → Alquilado
  const v3 = await prisma.vehiculo.create({
    data: {
      id_propietario: propietario1.id_propietario,
      marca: "Toyota", modelo: "Corolla", anio: 2023, precio: 15000,
      estado: "Alquilado", fotos: "",
    },
  });

  // v4 Chevrolet Cruze → reserva Pagada → Alquilado
  const v4 = await prisma.vehiculo.create({
    data: {
      id_propietario: propietario1.id_propietario,
      marca: "Chevrolet", modelo: "Cruze", anio: 2021, precio: 13500,
      estado: "Alquilado", fotos: "",
    },
  });

  // v5 Renault Sandero → reserva Entregada → Alquilado
  const v5 = await prisma.vehiculo.create({
    data: {
      id_propietario: propietario1.id_propietario,
      marca: "Renault", modelo: "Sandero", anio: 2022, precio: 9000,
      estado: "Alquilado", fotos: "",
    },
  });

  // v6 BMW Serie 3 → reservas históricas + pendiente futura → Disponible
  const v6 = await prisma.vehiculo.create({
    data: {
      id_propietario: propietario1.id_propietario,
      marca: "BMW", modelo: "Serie 3", anio: 2024, precio: 35000,
      estado: "Disponible", fotos: "",
    },
  });

  // ===== VEHÍCULOS DE CARLOS =====

  // v7 Ford Focus → reserva Pendiente → Disponible
  const v7 = await prisma.vehiculo.create({
    data: {
      id_propietario: propietario2.id_propietario,
      marca: "Ford", modelo: "Focus", anio: 2022, precio: 12000,
      estado: "Disponible", fotos: "",
    },
  });

  // v8 Honda Civic → Disponible
  const v8 = await prisma.vehiculo.create({
    data: {
      id_propietario: propietario2.id_propietario,
      marca: "Honda", modelo: "Civic", anio: 2023, precio: 16500,
      estado: "Disponible", fotos: "",
    },
  });

  // v9 Fiat Cronos → Disponible
  const v9 = await prisma.vehiculo.create({
    data: {
      id_propietario: propietario2.id_propietario,
      marca: "Fiat", modelo: "Cronos", anio: 2022, precio: 10000,
      estado: "Disponible", fotos: "",
    },
  });

  // v10 Peugeot 208 → reserva Coordinada → Alquilado
  const v10 = await prisma.vehiculo.create({
    data: {
      id_propietario: propietario2.id_propietario,
      marca: "Peugeot", modelo: "208", anio: 2023, precio: 11000,
      estado: "Alquilado", fotos: "",
    },
  });

  // v11 Volkswagen Vento → reserva Pagada → Alquilado
  const v11 = await prisma.vehiculo.create({
    data: {
      id_propietario: propietario2.id_propietario,
      marca: "Volkswagen", modelo: "Vento", anio: 2022, precio: 14000,
      estado: "Alquilado", fotos: "",
    },
  });

  // ===== RESERVAS DE MARIA =====

  // v1 Jeep Renegade — Pendiente
  await prisma.reserva.create({
    data: {
      id_vehiculo: v1.id_vehiculo,
      id_propietario: propietario1.id_propietario,
      id_alquilador: "alquilador_001",
      fecha_inicio: new Date("2026-06-20"),
      fecha_final: new Date("2026-06-25"),
      estado: "Pendiente",
    },
  });

  // v6 BMW Serie 3 — Pendiente futura
  await prisma.reserva.create({
    data: {
      id_vehiculo: v6.id_vehiculo,
      id_propietario: propietario1.id_propietario,
      id_alquilador: "alquilador_002",
      fecha_inicio: new Date("2026-07-01"),
      fecha_final: new Date("2026-07-06"),
      estado: "Pendiente",
    },
  });

  // v2 Volkswagen Golf — Aceptada
  await prisma.reserva.create({
    data: {
      id_vehiculo: v2.id_vehiculo,
      id_propietario: propietario1.id_propietario,
      id_alquilador: "alquilador_002",
      fecha_inicio: new Date("2026-06-15"),
      fecha_final: new Date("2026-06-20"),
      estado: "Aceptada",
    },
  });

  // v3 Toyota Corolla — Coordinada
  await prisma.reserva.create({
    data: {
      id_vehiculo: v3.id_vehiculo,
      id_propietario: propietario1.id_propietario,
      id_alquilador: "alquilador_003",
      fecha_inicio: new Date("2026-06-12"),
      fecha_final: new Date("2026-06-18"),
      estado: "Coordinada",
    },
  });

  // v4 Chevrolet Cruze — Pagada
  await prisma.reserva.create({
    data: {
      id_vehiculo: v4.id_vehiculo,
      id_propietario: propietario1.id_propietario,
      id_alquilador: "alquilador_001",
      fecha_inicio: new Date("2026-06-10"),
      fecha_final: new Date("2026-06-15"),
      estado: "Pagada",
    },
  });

  // v5 Renault Sandero — Entregada
  await prisma.reserva.create({
    data: {
      id_vehiculo: v5.id_vehiculo,
      id_propietario: propietario1.id_propietario,
      id_alquilador: "alquilador_002",
      fecha_inicio: new Date("2026-06-05"),
      fecha_final: new Date("2026-06-10"),
      estado: "Entregada",
    },
  });

  // v6 BMW Serie 3 — historial finalizadas
  await prisma.reserva.create({
    data: {
      id_vehiculo: v6.id_vehiculo,
      id_propietario: propietario1.id_propietario,
      id_alquilador: "alquilador_001",
      fecha_inicio: new Date("2026-05-01"),
      fecha_final: new Date("2026-05-08"),
      estado: "Finalizada",
    },
  });

  await prisma.reserva.create({
    data: {
      id_vehiculo: v6.id_vehiculo,
      id_propietario: propietario1.id_propietario,
      id_alquilador: "alquilador_002",
      fecha_inicio: new Date("2026-04-10"),
      fecha_final: new Date("2026-04-17"),
      estado: "Finalizada",
    },
  });

  await prisma.reserva.create({
    data: {
      id_vehiculo: v6.id_vehiculo,
      id_propietario: propietario1.id_propietario,
      id_alquilador: "alquilador_003",
      fecha_inicio: new Date("2026-03-15"),
      fecha_final: new Date("2026-03-20"),
      estado: "Finalizada",
    },
  });

  // v3 Toyota Corolla — historial finalizadas
  await prisma.reserva.create({
    data: {
      id_vehiculo: v3.id_vehiculo,
      id_propietario: propietario1.id_propietario,
      id_alquilador: "alquilador_001",
      fecha_inicio: new Date("2026-04-01"),
      fecha_final: new Date("2026-04-07"),
      estado: "Finalizada",
    },
  });

  await prisma.reserva.create({
    data: {
      id_vehiculo: v3.id_vehiculo,
      id_propietario: propietario1.id_propietario,
      id_alquilador: "alquilador_002",
      fecha_inicio: new Date("2026-03-01"),
      fecha_final: new Date("2026-03-07"),
      estado: "Finalizada",
    },
  });

  // v1 Jeep Renegade — Rechazada
  await prisma.reserva.create({
    data: {
      id_vehiculo: v1.id_vehiculo,
      id_propietario: propietario1.id_propietario,
      id_alquilador: "alquilador_003",
      fecha_inicio: new Date("2026-02-10"),
      fecha_final: new Date("2026-02-15"),
      estado: "Rechazada",
    },
  });

  // v4 Chevrolet Cruze — Cancelada
  await prisma.reserva.create({
    data: {
      id_vehiculo: v4.id_vehiculo,
      id_propietario: propietario1.id_propietario,
      id_alquilador: "alquilador_002",
      fecha_inicio: new Date("2026-02-01"),
      fecha_final: new Date("2026-02-05"),
      estado: "Cancelada",
    },
  });

  // ===== RESERVAS DE CARLOS =====

  // v7 Ford Focus — Pendiente
  await prisma.reserva.create({
    data: {
      id_vehiculo: v7.id_vehiculo,
      id_propietario: propietario2.id_propietario,
      id_alquilador: "alquilador_001",
      fecha_inicio: new Date("2026-06-15"),
      fecha_final: new Date("2026-06-20"),
      estado: "Pendiente",
    },
  });

  // v9 Fiat Cronos — Pendiente
  await prisma.reserva.create({
    data: {
      id_vehiculo: v9.id_vehiculo,
      id_propietario: propietario2.id_propietario,
      id_alquilador: "alquilador_003",
      fecha_inicio: new Date("2026-06-22"),
      fecha_final: new Date("2026-06-27"),
      estado: "Pendiente",
    },
  });

  // v8 Honda Civic — Pendiente
  await prisma.reserva.create({
    data: {
      id_vehiculo: v8.id_vehiculo,
      id_propietario: propietario2.id_propietario,
      id_alquilador: "alquilador_001",
      fecha_inicio: new Date("2026-06-25"),
      fecha_final: new Date("2026-06-30"),
      estado: "Pendiente",
    },
  });

  // v10 Peugeot 208 — Coordinada
  await prisma.reserva.create({
    data: {
      id_vehiculo: v10.id_vehiculo,
      id_propietario: propietario2.id_propietario,
      id_alquilador: "alquilador_001",
      fecha_inicio: new Date("2026-06-12"),
      fecha_final: new Date("2026-06-17"),
      estado: "Coordinada",
    },
  });

  // v11 Volkswagen Vento — Pagada
  await prisma.reserva.create({
    data: {
      id_vehiculo: v11.id_vehiculo,
      id_propietario: propietario2.id_propietario,
      id_alquilador: "alquilador_002",
      fecha_inicio: new Date("2026-06-10"),
      fecha_final: new Date("2026-06-14"),
      estado: "Pagada",
    },
  });

  // v8 Honda Civic — historial finalizado
  await prisma.reserva.create({
    data: {
      id_vehiculo: v8.id_vehiculo,
      id_propietario: propietario2.id_propietario,
      id_alquilador: "alquilador_002",
      fecha_inicio: new Date("2026-05-10"),
      fecha_final: new Date("2026-05-15"),
      estado: "Finalizada",
    },
  });

  // v9 Fiat Cronos — historial finalizado
  await prisma.reserva.create({
    data: {
      id_vehiculo: v9.id_vehiculo,
      id_propietario: propietario2.id_propietario,
      id_alquilador: "alquilador_003",
      fecha_inicio: new Date("2026-04-10"),
      fecha_final: new Date("2026-04-15"),
      estado: "Finalizada",
    },
  });

  // v7 Ford Focus — historial finalizado
  await prisma.reserva.create({
    data: {
      id_vehiculo: v7.id_vehiculo,
      id_propietario: propietario2.id_propietario,
      id_alquilador: "alquilador_002",
      fecha_inicio: new Date("2026-03-01"),
      fecha_final: new Date("2026-03-05"),
      estado: "Finalizada",
    },
  });

  // v8 Honda Civic — Cancelada
  await prisma.reserva.create({
    data: {
      id_vehiculo: v8.id_vehiculo,
      id_propietario: propietario2.id_propietario,
      id_alquilador: "alquilador_003",
      fecha_inicio: new Date("2026-02-10"),
      fecha_final: new Date("2026-02-15"),
      estado: "Cancelada",
    },
  });

  console.log("✅ Seed completado: 2 propietarios, 11 vehículos, 25 reservas");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});