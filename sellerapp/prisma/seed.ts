import { PrismaClient, EstadoReserva, EstadoVehiculo } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import "dotenv/config";

// =====================================================================================
// SEED DE DATOS "REALISTAS" PARA ANALYTICS
// -------------------------------------------------------------------------------------
// Genera ~30 propietarios (máx. 2 vehículos c/u), reservas con varios meses de
// antigüedad (enero -> fines de junio 2026), sin solapamientos por vehículo, con un
// vehículo claramente "más alquilado", una distribución de estados con mayoría de
// Finalizadas, ~1/4 de Canceladas, algunas Rechazadas, y una tendencia de ingresos
// mensuales creciente (con una caída puntual en marzo) que termina con reservas
// activas "hoy".
//
// Usa un RNG con semilla fija (mulberry32) para que el dataset sea reproducible.
// =====================================================================================

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(20260625);
const randInt = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;
const randFloat = (min: number, max: number) => rng() * (max - min) + min;
const pick = <T>(arr: T[]): T => arr[randInt(0, arr.length - 1)];
const chance = (p: number) => rng() < p;

const addDays = (date: Date, days: number): Date => {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
};
const dateUTC = (y: number, m: number, d: number) => new Date(Date.UTC(y, m, d));

// Hoy (referencia fija del dataset, coincide con el final del rango de datos)
const ANCHOR = dateUTC(2026, 5, 25); // 25/06/2026
const RANGE_START = dateUTC(2026, 0, 5); // 05/01/2026
const HORIZON_END = dateUTC(2026, 6, 15); // 15/07/2026 (reservas futuras/pendientes)

// Estados que mantienen un vehículo marcado como "Alquilado" mientras el alquiler
// no haya terminado (Aceptada/Coordinada/Pagada/Entregada con fecha_final >= hoy)
const ESTADOS_COMPROMETEN_VEHICULO: EstadoReserva[] = [
  EstadoReserva.Aceptada,
  EstadoReserva.Coordinada,
  EstadoReserva.Pagada,
  EstadoReserva.Entregada,
];

const ALQUILADORES = Array.from({ length: 45 }, (_, i) => `alquilador_${String(i + 1).padStart(3, "0")}`);

// ===== Propietarios =====

type OwnerSeed = {
  email: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: Date;
  dni: string;
  direccion: string;
  telefono: string;
  joinDate: Date;
};

const NOMBRES = [
  "Lucia", "Martin", "Sofia", "Diego", "Valentina", "Nicolas", "Camila", "Federico",
  "Julieta", "Matias", "Florencia", "Agustin", "Paula", "Sebastian", "Daniela", "Tomas",
  "Romina", "Ezequiel", "Carolina", "Gonzalo", "Victoria", "Ignacio", "Marina", "Franco",
  "Belen", "Emiliano", "Antonella", "Joaquin",
];
const APELLIDOS = [
  "Fernandez", "Rodriguez", "Garcia", "Martinez", "Sosa", "Diaz", "Romero", "Alvarez",
  "Torres", "Ruiz", "Flores", "Acosta", "Benitez", "Suarez", "Medina", "Herrera",
  "Aguirre", "Vega", "Castro", "Nunez", "Ibarra", "Paz", "Molina", "Ortiz",
  "Silva", "Cabrera", "Rios", "Lujan",
];
const CALLES = [
  "Av. Santa Fe", "Av. Corrientes", "Av. Rivadavia", "Av. Cabildo", "Av. Belgrano",
  "San Martin", "Mitre", "Sarmiento", "Av. Pueyrredon", "Av. Callao", "Av. Cordoba",
  "Av. Independencia", "Av. Las Heras", "Av. Maipu", "Av. Libertador",
];
const CIUDADES = [
  "Buenos Aires", "Cordoba", "Rosario", "La Plata", "Mendoza", "Mar del Plata", "San Isidro",
];

function buildOwners(): OwnerSeed[] {
  const owners: OwnerSeed[] = [];

  // Propietarios originales (NO modificar email/dni: son las cuentas de prueba de Clerk)
  owners.push({
    email: "seller+clerk_test@iaw.com",
    nombre: "Maria",
    apellido: "Lopez",
    fecha_nacimiento: new Date("1990-07-22"),
    dni: "32156478",
    direccion: "Av. Santa Fe 567, Buenos Aires",
    telefono: "+54 9 11 8765 4321",
    joinDate: dateUTC(2026, 0, 8),
  });
  owners.push({
    email: "selleradmin+clerk_test@iaw.com",
    nombre: "Carlos",
    apellido: "Gomez",
    fecha_nacimiento: new Date("1985-03-15"),
    dni: "28456789",
    direccion: "Av. Corrientes 1234, Buenos Aires",
    telefono: "+54 9 11 1234 5678",
    joinDate: dateUTC(2026, 0, 12),
  });

  // Tiers de alta: [tamaño, [añoBase, mesBase, díaMin, díaMax]]
  const tiers: Array<{ count: number; month: number; dayMin: number; dayMax: number }> = [
    { count: 4, month: 0, dayMin: 14, dayMax: 28 }, // enero (resto de los early adopters)
    { count: 8, month: 1, dayMin: 1, dayMax: 25 }, // febrero
    { count: 8, month: 2, dayMin: 1, dayMax: 25 }, // marzo
    { count: 5, month: 3, dayMin: 1, dayMax: 20 }, // abril
    { count: 3, month: 4, dayMin: 1, dayMax: 15 }, // mayo
  ];

  let idx = 0;
  for (const tier of tiers) {
    for (let i = 0; i < tier.count; i++) {
      const nombre = NOMBRES[idx];
      const apellido = APELLIDOS[idx];
      const dni = String(30100000 + idx * 97);
      const email = `propietario${String(idx + 3).padStart(2, "0")}@iaw.com`;
      const anioNac = randInt(1965, 2002);
      const mesNac = randInt(0, 11);
      const diaNac = randInt(1, 28);
      const calle = pick(CALLES);
      const numero = randInt(100, 4500);
      const ciudad = pick(CIUDADES);
      const telefono = `+54 9 11 ${randInt(1000, 9999)} ${randInt(1000, 9999)}`;
      const joinDate = dateUTC(2026, tier.month, randInt(tier.dayMin, tier.dayMax));

      owners.push({
        email,
        nombre,
        apellido,
        fecha_nacimiento: dateUTC(anioNac, mesNac, diaNac),
        dni,
        direccion: `${calle} ${numero}, ${ciudad}`,
        telefono,
        joinDate,
      });
      idx++;
    }
  }

  return owners;
}

// ===== Vehículos =====

const BRANDS: Array<{ marca: string; modelo: string; precioBase: number }> = [
  { marca: "Volkswagen", modelo: "Golf", precioBase: 18000 },
  { marca: "Chevrolet", modelo: "Cruze", precioBase: 13500 },
  { marca: "Renault", modelo: "Sandero", precioBase: 9000 },
  { marca: "Ford", modelo: "Focus", precioBase: 12000 },
  { marca: "Honda", modelo: "Civic", precioBase: 16500 },
  { marca: "Fiat", modelo: "Cronos", precioBase: 10000 },
  { marca: "Peugeot", modelo: "208", precioBase: 11000 },
  { marca: "Volkswagen", modelo: "Vento", precioBase: 14000 },
  { marca: "BMW", modelo: "Serie 3", precioBase: 35000 },
  { marca: "Jeep", modelo: "Renegade", precioBase: 22000 },
  { marca: "Nissan", modelo: "Versa", precioBase: 11500 },
  { marca: "Citroen", modelo: "C4", precioBase: 13000 },
  { marca: "Toyota", modelo: "Hilux", precioBase: 28000 },
  { marca: "Chevrolet", modelo: "Onix", precioBase: 10500 },
  { marca: "Renault", modelo: "Kangoo", precioBase: 12500 },
  { marca: "Ford", modelo: "Ranger", precioBase: 30000 },
  { marca: "Peugeot", modelo: "308", precioBase: 14500 },
  { marca: "Fiat", modelo: "Argo", precioBase: 11800 },
  { marca: "Volkswagen", modelo: "Amarok", precioBase: 32000 },
  { marca: "Honda", modelo: "HR-V", precioBase: 21000 },
  { marca: "Toyota", modelo: "Etios", precioBase: 9500 },
  { marca: "Chevrolet", modelo: "Tracker", precioBase: 19000 },
  { marca: "Renault", modelo: "Duster", precioBase: 16000 },
  { marca: "Nissan", modelo: "Kicks", precioBase: 18500 },
];

type VehiculoPlan = {
  ownerIndex: number;
  marca: string;
  modelo: string;
  anio: number;
  precio: number;
  joinDate: Date;
  isStar: boolean;
  applyDip: boolean;
};

function buildVehiclePlans(owners: OwnerSeed[]): VehiculoPlan[] {
  const plans: VehiculoPlan[] = [];
  let brandCounter = 0;

  owners.forEach((owner, ownerIndex) => {
    const vehicleCount = ownerIndex % 5 === 0 ? 1 : 2;

    for (let slot = 0; slot < vehicleCount; slot++) {
      const isStar = ownerIndex === 0 && slot === 0; // el Toyota Corolla de Maria
      const vehiculoJoinDate = addDays(owner.joinDate, randInt(0, 5));

      let marca: string;
      let modelo: string;
      let precio: number;
      let anio: number;

      if (isStar) {
        marca = "Toyota";
        modelo = "Corolla";
        anio = 2023;
        precio = 15000;
      } else {
        const brand = BRANDS[brandCounter % BRANDS.length];
        brandCounter++;
        marca = brand.marca;
        modelo = brand.modelo;
        anio = 2019 + randInt(0, 5);
        precio = Math.round((brand.precioBase * randFloat(0.9, 1.12)) / 100) * 100;
      }

      plans.push({
        ownerIndex,
        marca,
        modelo,
        anio,
        precio,
        joinDate: vehiculoJoinDate,
        isStar,
        applyDip: chance(0.5),
      });
    }
  });

  return plans;
}

// ===== Reservas =====

type ReservaPlan = {
  fecha_inicio: Date;
  fecha_final: Date;
  estado: EstadoReserva;
  id_alquilador: string;
  createdAt: Date;
  updatedAt: Date;
};

function generarReservas(joinDate: Date, isStar: boolean, applyDip: boolean): ReservaPlan[] {
  const reservas: ReservaPlan[] = [];
  let cursor = addDays(joinDate, randInt(0, 8));
  let dipApplied = false;
  let guard = 0;

  while (cursor < HORIZON_END && guard < 30) {
    guard++;

    const duracion = isStar ? randInt(4, 6) : randInt(3, 8);
    const fecha_inicio = new Date(cursor);
    const fecha_final = addDays(fecha_inicio, duracion);

    // "Mes flojo": evitamos que ciertos vehículos cierren reservas en marzo,
    // generando una caída visible en los ingresos de ese mes.
    if (applyDip && !dipApplied && fecha_final.getUTCMonth() === 2) {
      dipApplied = true;
      cursor = addDays(cursor, randInt(16, 24));
      continue;
    }

    const gap = isStar ? randInt(1, 3) : randInt(2, 8);

    let estado: EstadoReserva;
    if (fecha_final < ANCHOR) {
      // Reserva ya concluida en el pasado
      const r = rng();
      estado = r < 0.62 ? EstadoReserva.Finalizada : r < 0.92 ? EstadoReserva.Cancelada : EstadoReserva.Rechazada;
    } else if (fecha_inicio <= ANCHOR && ANCHOR <= fecha_final) {
      // En curso "hoy"
      const r = rng();
      estado = r < 0.4 ? EstadoReserva.Coordinada : r < 0.75 ? EstadoReserva.Pagada : EstadoReserva.Entregada;
    } else {
      // Todavía no arrancó (a futuro, cerca del horizonte)
      estado = chance(0.75) ? EstadoReserva.Pendiente : EstadoReserva.Aceptada;
    }

    const createdAt = addDays(fecha_inicio, -randInt(2, 6));
    let updatedAt = createdAt;
    if (estado === EstadoReserva.Finalizada || estado === EstadoReserva.Cancelada) {
      updatedAt = fecha_final;
    } else if (estado === EstadoReserva.Rechazada) {
      updatedAt = addDays(fecha_inicio, -randInt(0, 2));
    } else if (
      estado === EstadoReserva.Aceptada ||
      estado === EstadoReserva.Coordinada ||
      estado === EstadoReserva.Pagada ||
      estado === EstadoReserva.Entregada
    ) {
      updatedAt = addDays(createdAt, randInt(1, 3));
    }

    reservas.push({
      fecha_inicio,
      fecha_final,
      estado,
      id_alquilador: pick(ALQUILADORES),
      createdAt,
      updatedAt,
    });

    cursor = addDays(fecha_final, gap);
  }

  return reservas;
}

async function main() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter } as any);

  // Limpieza total (en orden por FKs) para que el seed sea repetible sin chocar
  // con los unique de email/dni si se corre sin "migrate reset" previo.
  await prisma.reserva.deleteMany({});
  await prisma.vehiculo.deleteMany({});
  await prisma.propietario.deleteMany({});

  const ownerSeeds = buildOwners();
  const propietarios = [];
  for (const o of ownerSeeds) {
    const propietario = await prisma.propietario.create({
      data: {
        email: o.email,
        nombre: o.nombre,
        apellido: o.apellido,
        fecha_nacimiento: o.fecha_nacimiento,
        dni: o.dni,
        direccion: o.direccion,
        telefono: o.telefono,
        createdAt: o.joinDate,
        updatedAt: o.joinDate,
      },
    });
    propietarios.push(propietario);
  }

  const vehiculoPlans = buildVehiclePlans(ownerSeeds);

  const reservasAInsertar: Array<
    ReservaPlan & { id_vehiculo: string; id_propietario: string }
  > = [];

  let starVehiculoLabel = "";
  const vehiculoCountByEstado: Record<string, number> = { Disponible: 0, Alquilado: 0 };

  for (const plan of vehiculoPlans) {
    const owner = propietarios[plan.ownerIndex];
    const reservasVehiculo = generarReservas(plan.joinDate, plan.isStar, plan.applyDip);

    const estaComprometido = reservasVehiculo.some(
      (r) => ESTADOS_COMPROMETEN_VEHICULO.includes(r.estado) && r.fecha_final >= ANCHOR
    );
    const estadoVehiculo: EstadoVehiculo = estaComprometido
      ? EstadoVehiculo.Alquilado
      : EstadoVehiculo.Disponible;
    vehiculoCountByEstado[estadoVehiculo]++;

    const vehiculo = await prisma.vehiculo.create({
      data: {
        id_propietario: owner.id_propietario,
        marca: plan.marca,
        modelo: plan.modelo,
        anio: plan.anio,
        precio: plan.precio,
        fotos: "",
        estado: estadoVehiculo,
        createdAt: plan.joinDate,
        updatedAt: plan.joinDate,
      },
    });

    if (plan.isStar) {
      starVehiculoLabel = `${plan.marca} ${plan.modelo} (${vehiculo.id_vehiculo}) de ${owner.nombre} ${owner.apellido}`;
    }

    for (const r of reservasVehiculo) {
      reservasAInsertar.push({
        ...r,
        id_vehiculo: vehiculo.id_vehiculo,
        id_propietario: owner.id_propietario,
      });
    }
  }

  await prisma.reserva.createMany({
    data: reservasAInsertar.map((r) => ({
      id_vehiculo: r.id_vehiculo,
      id_propietario: r.id_propietario,
      id_alquilador: r.id_alquilador,
      fecha_inicio: r.fecha_inicio,
      fecha_final: r.fecha_final,
      estado: r.estado,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    })),
  });

  const porEstado: Record<string, number> = {};
  for (const r of reservasAInsertar) {
    porEstado[r.estado] = (porEstado[r.estado] ?? 0) + 1;
  }

  console.log("✅ Seed completado");
  console.log(`   Propietarios: ${propietarios.length}`);
  console.log(`   Vehiculos: ${vehiculoPlans.length} (Disponible: ${vehiculoCountByEstado.Disponible}, Alquilado: ${vehiculoCountByEstado.Alquilado})`);
  console.log(`   Reservas: ${reservasAInsertar.length}`);
  console.log(`   Por estado:`, porEstado);
  console.log(`   Vehiculo mas alquilado (objetivo): ${starVehiculoLabel}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
