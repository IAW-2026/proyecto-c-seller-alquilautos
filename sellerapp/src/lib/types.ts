

export interface Propietario {
  id_propietario: string;
  email: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: Date;
  dni: string;
  direccion: string;
  telefono?: string;
}

export interface Vehiculo {
  id_vehiculo: string;
  id_propietario: string;
  marca: string;
  modelo: string;
  anio: number;
  precio: number;
  fotos: string;
  estado?: "Disponible" | "Alquilado";
}

export interface Reserva {
  id_reserva: string;
  id_vehiculo: string;
  id_propietario: string;
  id_alquilador: string;
  fecha_inicio: Date;
  fecha_final: Date;
  estado: "Pendiente" | "Aceptada" | "Rechazada" | "Coordinada" | "Pagada" | "Finalizada" | "Entregada" | "Cancelada";
}

export interface Alquilador {
  id_alquilador: string;
  nombre: string;
  apellido: string;
  email: string;
}

// Métricas (Analytics App) 
export interface ResumenGeneral {
  total_propietarios: number;
  vehiculos: {
    total: number;
    disponibles: number;
    alquilados: number;
  };
  reservas: {
    total: number;
    por_estado: Record<Reserva["estado"], number>;
  };
  ingresos_totales_ars: number;
}

export interface VehiculoTop {
  id_vehiculo: string;
  marca: string;
  modelo: string;
  anio: number;
  id_propietario: string;
  cantidad_alquileres: number;
  ingresos_generados: number;
  propietario: {
    nombre: string;
    apellido: string;
  };
}

export interface PropietarioTop {
  id_propietario: string;
  nombre: string;
  apellido: string;
  email: string;
  cantidad_vehiculos: number;
  cantidad_reservas_finalizadas: number;
  ingresos_totales: number;
}

export interface IngresoPorPeriodo {
  periodo: string;
  ingresos: number;
  cantidad_reservas: number;
}

export interface TasaConversion {
  total_reservas: number;
  finalizadas: number;
  canceladas: number;
  tasa_conversion: number;
  tasa_cancelacion: number;
  tiempo_promedio_ciclo_dias: number;
}

export interface OcupacionVehiculo {
  id_vehiculo: string;
  marca: string;
  modelo: string;
  dias_alquilados: number;
  dias_totales: number;
  porcentaje: number;
}

export interface OcupacionVehiculos {
  ocupacion_promedio_plataforma: number;
  vehiculos: OcupacionVehiculo[];
}

export interface DistribucionMarca {
  marca: string;
  cantidad_vehiculos: number;
  cantidad_reservas_finalizadas: number;
  ingresos_totales: number;
}

export interface ActividadRecienteReserva {
  id_reserva: string;
  estado: Reserva["estado"];
  id_propietario: string;
  vehiculo: string;
  createdAt: Date;
}

export interface ActividadRecientePropietario {
  id_propietario: string;
  nombre: string;
  apellido: string;
  email: string;
  createdAt: Date;
}

export interface ActividadReciente {
  ultimas_reservas: ActividadRecienteReserva[];
  nuevos_propietarios: ActividadRecientePropietario[];
}

export interface MetricasResponse<T> {
  data: T | null;
  error: string | null;
}