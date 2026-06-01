[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/ADcDbJbt)

# seller

Aplicación **Seller** del [Proyecto IAW 2026](https://iaw-2026.github.io/proyecto/) — comisión `AlquilAutos`.

Esta app corresponde al rol del vendedor en los proyectos de tipo **B (Delivery)** y **C (Marketplace)**.

---

Enunciado completo: <https://iaw-2026.github.io/proyecto/>

---

## Deploy

[_COMPLETAR_URL_VERCEL_](_COMPLETAR_URL_VERCEL_)

---

## Usuarios de prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Propietario | seller+clerktest@iaw.com | iawuser# |
| Administrador | selleradmin+clerktest@iaw.com | iawuser# |

---

## Instrucciones

```bash
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

> Para correr el seed correctamente, asegurate de tener la `DATABASE_URL` en `.env`. Tomá como referencia el archivo `.env.example`.

---

## Descripción

AlquilAutos Seller App es el panel de gestión para propietarios de vehículos del marketplace de alquiler de autos AlquilAutos. Permite a los propietarios publicar vehículos, gestionar reservas, ver ingresos y responder reseñas de sus alquiladores.

La app forma parte de un ecosistema de cinco microapps (Seller, Buyer, Shipping, Payments, Feedback) que se comunican entre sí mediante APIs REST autenticadas con JWT de Clerk. La integración con las otras apps está actualmente mockeada — cada función mock representa el endpoint real que se consumiría en producción.

Incluye un panel de administración con CRUD completo de propietarios, vehículos y reservas, y un simulador del flujo de estados de reserva para testear el ciclo completo sin necesidad de tener las otras apps disponibles.

---

## Notas para la corrección

- El usuario `selleradmin+clerktest@iaw.com` tiene rol `adminSeller` en Clerk y acceso tanto al dashboard de propietario como al panel de administración desde el mismo sidebar.
- Las imágenes de vehículos se suben a Cloudinary automáticamente desde el formulario con drag & drop y se optimizan a WebP.
- El tipo de cambio dólar blue se consume en tiempo real desde `dolarapi.com` y se muestra junto al precio en pesos en las cards de vehículos e ingresos.
- La documentación técnica extensa (endpoints, mocks, arquitectura) se encuentra en [`docs/arquitectura.md`](docs/arquitectura.md).