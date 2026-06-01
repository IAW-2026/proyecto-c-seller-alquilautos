# Arquitectura — AlquilAutos Seller App

## Regla principal de datos

- **Server Components** → llaman funciones de `src/lib/services/` directamente
- **Client Components** → ejecutan Server Actions de `src/lib/actions/`
- **Endpoints HTTP** (`src/app/api/`) → solo se exponen para las otras apps del ecosistema
- **Nunca** importar mocks directamente en componentes — siempre pasar por servicios

---

## Ecosistema de microapps

| App | Responsabilidad |
|-----|----------------|
| **Seller App** (este repo) | Gestión de vehículos, propietarios y reservas |
| **Buyer App** | Exploración, reservas y gestión del alquilador |
| **Shipping App** | Coordinación de entregas y devoluciones |
| **Payments App** | Procesamiento de pagos |
| **Feedback App** | Reseñas y calificaciones |

---

## Mocks — Mapping a endpoints externos

La integración con las otras apps está pendiente. Los mocks se encuentran en `src/lib/mocks/`. Cada función mockeada representa el endpoint real de una app externa que se llamaría en producción.

| Archivo | Función | Endpoint externo equivalente | App |
|---------|---------|------------------------------|-----|
| `buyerApp.ts` | `getAlquilador(id)` | `GET /api/alquilador/{id}` | Buyer App |
| `shippingApp.ts` | `createEntrega(data)` | `POST /api/entrega` | Shipping App |
| `shippingApp.ts` | `getHorarioSeleccionado(id_reserva)` | `GET /api/horario/seleccionada/{id_reserva}` | Shipping App |
| `shippingApp.ts` | `cancelarEntrega(id_reserva)` | `PATCH /api/entrega/{id_reserva}` (estado: Cancelada) | Shipping App |
| `paymentsApp.ts` | `iniciarPago(data)` | `POST /api/pago` | Payments App |
| `feedbackApp.ts` | `getResenaVehiculoReserva(id_reserva)` | `GET /api/resena/vehiculo/reserva/{id_reserva}` | Feedback App |
| `feedbackApp.ts` | `getResenaPropietarioReserva(id_reserva)` | `GET /api/resena/propietario/reserva/{id_reserva}` | Feedback App |
| `feedbackApp.ts` | `getResenaAlquiladorReserva(id_reserva)` | `GET /api/resena/alquilador/reserva/{id_reserva}` | Feedback App |
| `feedbackApp.ts` | `getResenasPropietario(id_propietario)` | `GET /api/resena/propietario/{id_propietario}` | Feedback App |
| `feedbackApp.ts` | `getResenasVehiculo(id_vehiculo)` | `GET /api/resena/vehiculo/{id_vehiculo}` | Feedback App |
| `feedbackApp.ts` | `getPromedioPropietario(id_propietario)` | `GET /api/promedio/propietario/{id_propietario}` | Feedback App |
| `feedbackApp.ts` | `getPromedioVehiculo(id_vehiculo)` | `GET /api/promedio/vehiculo/{id_vehiculo}` | Feedback App |
| `feedbackApp.ts` | `getResumenPropietario(id_propietario)` | `GET /api/resumen/propietario/{id_propietario}` | Feedback App |
| `feedbackApp.ts` | `getResumenVehiculo(id_vehiculo)` | `GET /api/resumen/vehiculo/{id_vehiculo}` | Feedback App |
| `feedbackApp.ts` | `crearResena(data)` | `POST /api/reseña` | Feedback App |
| `feedbackApp.ts` | `responderResena(data)` | `POST /api/respuesta` | Feedback App |

---

## Endpoints expuestos

| Endpoint | Método | Request | Response | Consumido por |
|----------|--------|---------|----------|---------------|
| `/api/vehiculo/disponible` | GET | — | `{ data: { vehiculos: [...] } }` | Buyer App |
| `/api/vehiculo/[id]` | GET | — | `{ data: { vehiculo } }` | Buyer App |
| `/api/propietario/[id]` | GET | — | `{ data: { propietario } }` | Buyer App, Feedback App |
| `/api/reserva` | POST | `{ id_alquilador, id_vehiculo, id_propietario, fecha_inicio, fecha_final }` | `{ data: { id_reserva } }` | Buyer App |
| `/api/reserva/[id]` | GET | — | `{ data: { reserva } }` | Buyer App, Shipping App, Feedback App |
| `/api/reserva/[id]` | PATCH | `{ estado: EstadoReserva }` | `{ data: { id_reserva, estado } }` | Shipping App, Payments App, Feedback App |
| `/api/reserva/alquilador/[id]` | GET | — | `{ data: { reservas: [...] } }` | Buyer App |
| `/api/upload` | POST | `FormData` con `file` | `{ url: string }` | Seller App (interno) |

### Endpoint de subida de imágenes

Se expone como endpoint HTTP y no como Server Action porque las Server Actions tienen limitaciones para manejar archivos binarios. El endpoint recibe el archivo, lo procesa en el servidor y lo sube a Cloudinary. Las credenciales nunca se exponen al cliente.

---

## Servicios (`src/lib/services/`)

| Servicio | Funciones |
|----------|-----------|
| `propietario.service.ts` | `getPropietario`, `registrarPropietario`, `actualizarPropietario` |
| `vehiculo.service.ts` | `getVehiculo`, `getVehiculosDisponibles`, `getVehiculosByPropietario`, `crearVehiculo`, `actualizarVehiculo` |
| `reserva.service.ts` | `getReserva`, `crearReserva`, `actualizarEstadoReserva`, `cancelarReserva`, `coordinarReserva`, `getReservasByPropietario`, `getReservasByAlquilador` |

---

## Autenticación y roles

Se utiliza **Clerk** para la autenticación. Los roles se gestionan mediante `publicMetadata` en el dashboard de Clerk.

| Rol | Acceso |
|-----|--------|
| `propietario` | Dashboard del propietario (`/dashboard`) |
| `adminSeller` | Dashboard del propietario + Panel de administración (`/admin`) |

Para asignar el rol admin: Dashboard de Clerk → Users → seleccionar usuario → Metadata → Public:

```json
{
  "role": "adminSeller",
  "id_propietario": "ID_DEL_PROPIETARIO_EN_LA_DB"
}
```

Todas las apps del ecosistema comparten la misma instancia de Clerk, por lo que los JWTs son válidos entre apps para los endpoints expuestos.

---

## Flujo de estados de reserva
Pendiente → Aceptada → Coordinada → Pagada → Entregada → Finalizada
↘ Rechazada       ↘ Cancelada ↘ Cancelada 
↘ Cancelada  

| Estado | Quién lo gestiona |
|--------|-------------------|
| Pendiente | Buyer App al crear reserva |
| Aceptada / Rechazada | Propietario desde Seller App |
| Coordinada | Shipping App tras seleccionar horarios |
| Pagada | Payments App tras procesar el pago |
| Entregada / Finalizada | Shipping App tras la entrega y devolución |
| Cancelada | Buyer App (Pendiente), Shipping App (Coordinada) o Payments App (Pagada) |

---

## Base de datos (Prisma + Neon)

```prisma
model Propietario {
  id_propietario   String    @id @default(cuid())
  email            String    @unique
  nombre           String
  apellido         String
  fecha_nacimiento DateTime
  dni              String    @unique
  direccion        String
  telefono         String?
  vehiculos        Vehiculo[]
  reservas         Reserva[]
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
}

model Vehiculo {
  id_vehiculo    String         @id @default(cuid())
  id_propietario String
  propietario    Propietario    @relation(fields: [id_propietario], references: [id_propietario])
  marca          String
  modelo         String
  anio           Int
  precio         Decimal
  fotos          String
  estado         EstadoVehiculo @default(Disponible)
  reservas       Reserva[]
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
}

model Reserva {
  id_reserva     String        @id @default(cuid())
  id_vehiculo    String
  id_propietario String
  id_alquilador  String
  fecha_inicio   DateTime
  fecha_final    DateTime
  estado         EstadoReserva @default(Pendiente)
  vehiculo       Vehiculo      @relation(fields: [id_vehiculo], references: [id_vehiculo])
  propietario    Propietario   @relation(fields: [id_propietario], references: [id_propietario])
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
}

enum EstadoVehiculo {
  Disponible
  Alquilado
}

enum EstadoReserva {
  Pendiente
  Aceptada
  Rechazada
  Coordinada
  Pagada
  Entregada
  Finalizada
  Cancelada
}
```
