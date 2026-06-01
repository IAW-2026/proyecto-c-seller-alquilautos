[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/ADcDbJbt)

# seller

Aplicación **Seller** del [Proyecto IAW 2026](https://iaw-2026.github.io/proyecto/) — comisión `AlquilAutos`.

Esta app corresponde al rol del vendedor en los proyectos de tipo **B (Delivery)** y **C (Marketplace)**.

---

Enunciado completo: <https://iaw-2026.github.io/proyecto/>

---

# AlquilAutos — Seller App

## Cuentas de prueba

### Propietario

| Campo | Valor |
|-------|-------|
| Email | _COMPLETAR_EMAIL_PROPIETARIO_ |
| Contraseña | _COMPLETAR_PASSWORD_ |

### Administrador

| Campo | Valor |
|-------|-------|
| Email | _COMPLETAR_EMAIL_ADMIN_ |
| Contraseña | _COMPLETAR_PASSWORD_ |

---

## Deploy

[_COMPLETAR_URL_VERCEL_](_COMPLETAR_URL_VERCEL_)

---

Panel de gestión para propietarios de vehículos del marketplace de alquiler de autos AlquilAutos. Permite a los propietarios publicar vehículos, gestionar reservas, ver ingresos y responder reseñas. Incluye un panel de administración con CRUD completo y un simulador del flujo de estados de reserva. Forma parte de un ecosistema de microapps que se comunican entre sí.

---

## Instalación y desarrollo

```bash
# Instalar dependencias
npm install

# Generar cliente de Prisma
npx prisma generate

# Correr migraciones y seed
npx prisma migrate dev
npx prisma db seed

# Correr en desarrollo
npm run dev
```

**Build command en Vercel:**
```bash
npx prisma generate && npm run build
```

---

## Stack tecnológico

- **Framework:** Next.js 16 con App Router
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS v4 con variables CSS en `globals.css`
- **Autenticación:** Clerk
- **Base de datos:** Prisma + Neon (PostgreSQL)
- **Almacenamiento de imágenes:** Cloudinary
- **Package manager:** npm
- **Deploy:** Vercel

---

## Variables de entorno

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Base de datos
DATABASE_URL=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

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

## Estado actual — Datos mockeados

> **Importante:** La integración con las otras apps está pendiente. Los mocks se encuentran en `src/lib/mocks/`. Cada función mockeada representa el endpoint real de una app externa que se llamaría en producción.

### Mapping de funciones mockeadas a endpoints externos

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



## Endpoint interno de subida de imágenes

La app expone un único endpoint propio que se utiliza internamente desde el formulario de creación/edición de vehículos:

| Endpoint | Método | Request | Response |
|----------|--------|---------|----------|
| `/api/upload` | POST | `FormData` con campo `file` (imagen) | `{ url: string }` |

**¿Por qué se expone como endpoint y no como Server Action?**

Server Actions tienen limitaciones para manejar archivos binarios grandes. El endpoint recibe el archivo desde el formulario via `FormData`, lo procesa en el servidor y lo sube al CDN de Cloudinary usando el SDK oficial. Cloudinary se encarga automáticamente de:

- Convertir la imagen a WebP
- Redimensionar a 900x600 con crop inteligente
- Optimizar la calidad

Las credenciales de Cloudinary nunca se exponen al cliente — quedan solo en variables de entorno del servidor.

---

## Arquitectura de la aplicación

### Regla principal de datos

- **Server Components** → llaman funciones de `src/lib/services/` directamente
- **Client Components** → ejecutan Server Actions de `src/lib/actions/`
- **Endpoints HTTP** (`src/app/api/`) → solo se exponen para las otras apps del ecosistema
- **Nunca** importar mocks directamente en componentes — siempre pasar por servicios

---

### Servicios (`src/lib/services/`)

Capa de lógica de negocio para Server Components y Server Actions.

| Servicio | Funciones |
|----------|-----------|
| `propietario.service.ts` | `getPropietario`, `registrarPropietario`, `actualizarPropietario` |
| `vehiculo.service.ts` | `getVehiculo`, `getVehiculosDisponibles`, `getVehiculosByPropietario`, `crearVehiculo`, `actualizarVehiculo` |
| `reserva.service.ts` | `getReserva`, `crearReserva`, `actualizarEstadoReserva`, `cancelarReserva`, `coordinarReserva`, `getReservasByPropietario`, `getReservasByAlquilador` |

---

## Funcionalidades implementadas

### Dashboard del propietario
- Métricas de reservas (pendientes, aceptadas, totales)
- Listado de vehículos publicados con CRUD completo
- Listado de reservas con filtro por estado
- Vista de ingresos del mes filtrada por reservas finalizadas
- Perfil con datos personales editables y reseñas recibidas

### Vehículos
- Creación de vehículos con drag & drop de imágenes (sube a Cloudinary y optimiza a WebP automáticamente)
- Edición y eliminación de vehículos
- Vista de detalle con reseñas, calificación promedio y resumen generado

### Reservas
- Listado paginado con filtro por estado (todos los estados del flujo)
- Modal de detalle con datos del alquilador, vehículo y horarios
- Acciones de aceptar/rechazar reservas pendientes
- Modal de horarios para coordinar entrega y devolución al aceptar
- Modal de reseñas con calificaciones del alquilador y posibilidad de responder

### Reseñas
- Modal de reseñas en cada reserva finalizada
- Posibilidad de responder la reseña que el alquilador dejó sobre el propietario
- Vista de reseñas en el detalle del vehículo y del perfil del propietario

### Panel de administración (`/admin`)
- Accesible solo para usuarios con rol `adminSeller` en Clerk
- **Propietarios:** edición y eliminación (con verificación de reservas activas)
- **Vehículos:** edición y eliminación (con verificación de reservas activas)
- **Reservas:** eliminación
- **Simulador de flujo:** página interactiva para simular las transiciones de estado de una reserva, útil para testear el flujo completo sin tener las otras apps disponibles

---

## Autenticación y roles

Se utiliza **Clerk** para la autenticación. Los roles se gestionan mediante `publicMetadata` en el dashboard de Clerk.

| Rol | Acceso |
|-----|--------|
| `propietario` | Dashboard del propietario (`/dashboard`) |
| `adminSeller` | Panel de administración (`/admin`) |

Para asignar el rol admin: Dashboard de Clerk → Users → seleccionar usuario → Metadata → Public → `{ "role": "adminSeller" }`.

Todas las apps del ecosistema comparten la misma instancia de Clerk, por lo que los JWTs son válidos entre apps para los endpoints expuestos.

---
