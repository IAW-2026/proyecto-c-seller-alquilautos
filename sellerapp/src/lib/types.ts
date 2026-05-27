

export interface Propietario {
  id_propietario: string;
  email: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: Date;
  dni: string;
  direccion: string;
}

export interface Vehiculo {
  id_vehiculo: string;
  id_propietario: string;
  marca: string;
  modelo: string;
  anio: number;
  precio: number | string | { toNumber: () => number };
  fotos: string[];
  createdAt?: Date;
  updatedAt?: Date;
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