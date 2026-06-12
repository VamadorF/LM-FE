# Cambios requeridos en el Backend para integracion completa

Documento de referencia para alinear el backend NestJS (`leadmanager-main` / deploy en Render) con el frontend Next.js (`LEADMANAGER`).

**Estado actual:** el frontend conecta parcialmente los modulos compatibles. El resto sigue en modo mock.

**API desplegada:** https://leadmanager-x2i9.onrender.com/docs

---

## Modulos conectados (sin cambios en backend)

| Modulo frontend | Endpoints backend | Notas |
|-----------------|-------------------|-------|
| Auth (bootstrap dev) | `POST /auth/register/*`, `POST /auth/login`, `GET /auth/me` | Cuentas demo auto-registradas |
| Agenda / Contactos | `POST/GET/PATCH/DELETE /contacts` | Mapeo parcial de campos |
| Listas | `POST/GET/PATCH/DELETE /contact-books`, membresia en `/contact-books/:id/contacts` | `categoria` solo local |
| Ofertas empresa | `POST/PATCH /proposals`, `GET /proposals/mine`, `PATCH /proposals/:id/status` | Borradores solo locales |
| Ofertas lead (explorar) | `GET /proposals` (publico) | Merge con seed mock |

---

## Mapeo entidad por entidad

### Empresa (`Empresa`) ↔ `Company`

| Campo frontend | Campo backend | Estado |
|----------------|---------------|--------|
| `id` | `id` | ok |
| `nombre` | `tradeName` / `legalName` | ok |
| `rubro` | `industry` | ok |
| `descripcion` | `description` | ok |
| `sitioWeb` | `website` | ok |
| `comuna` | `city` | parcial (semantica distinta) |
| `region` | `country` | parcial (semantica distinta) |
| `verificada` | — | **falta** (hoy se infiere de `reviewCount > 0`) |
| `fechaIngreso` | `createdAt` | ok |

### Lead / Conector (`Lead`) ↔ `LeadManager`

| Campo frontend | Campo backend | Estado |
|----------------|---------------|--------|
| `id` | `id` | ok |
| `nombre` | `fullName` | ok |
| `email` | `User.email` | parcial (requiere join) |
| `telefono` | `phone` | ok |
| `comuna` | `city` | parcial |
| `region` | `country` | parcial |
| `bio` | `bio` | ok |
| `fechaIngreso` | `createdAt` | ok |

### Contacto (`Contacto`) ↔ `Contact`

| Campo frontend | Campo backend | Estado |
|----------------|---------------|--------|
| `nombre` | `firstName` + `lastName` | ok (split/join) |
| `email` | `email` | ok |
| `telefono` | `phone` | ok |
| `comuna` | `city` | ok |
| `region` | `country` | ok |
| `notas` | `privateNotes` | ok |
| `empresa` | — | **falta** (guardado solo en localStorage) |
| `rut` | — | **falta** (guardado solo en localStorage) |
| — | `age` (requerido) | frontend envia valor por defecto `35` |
| — | `interests[]` (requerido) | frontend envia `["General"]` |

### Lista (`Lista`) ↔ `ContactBook`

| Campo frontend | Campo backend | Estado |
|----------------|---------------|--------|
| `nombre` | `name` | ok |
| `descripcion` | `description` | ok |
| `contactoIds` | `ContactBookEntry` | ok |
| `categoria` | — | **falta** (guardado solo en localStorage) |

### Oferta (`Oferta`) ↔ `Proposal`

| Campo frontend | Campo backend | Estado |
|----------------|---------------|--------|
| `titulo` | `title` | ok |
| `descripcion` | `description` | ok |
| `objetivoContactos` | `contactsNeeded` | ok |
| `fechaCierre` | `expiresAt` | ok |
| `valorComision` (tipo fijo) | `pricePerContact` | parcial |
| `estado: activa` | `status: open` | ok |
| `estado: pausada` | `status: paused` | ok |
| `estado: cerrada` | `status: closed` | ok |
| `categoria` | `requiredInterests[0]` | parcial |
| `region` | `locationCountry` | parcial |
| `tipoComision: porcentaje` | — | **falta** |
| `valorTicketEstimado` | — | **falta** |
| `criterios` | — | **falta** (se usa `description` como fallback) |
| `slug` | — | **falta** (generado en frontend) |
| `destacada` | — | **falta** |
| `estado: borrador` | — | **falta** (solo local, no se envia al API) |
| — | `ageMin/Max`, `incomeMin/Max`, `genderPreference` | no usados por el frontend |

### Postulacion (`Postulacion`) ↔ `Bid` + `BidContact`

| Aspecto frontend | Aspecto backend | Estado |
|------------------|-----------------|--------|
| 1 fila = 1 contacto | 1 `Bid` = N contactos | **incompatible** |
| 6 estados granulares | 1 estado por `Bid` | **incompatible** |
| `valorTransaccion` por contacto | `totalPrice` por `Bid` | **incompatible** |
| `comision` por contacto | `CommissionLedger` por `Bid` | **incompatible** |
| `mensaje` (pitch) | `pitch` en `Bid` | parcial (es a nivel bid, no contacto) |

**Modulo NO conectado.** Sigue funcionando con datos mock del seed.

---

## Pregunta abierta: modelado de postulaciones

El mayor desajuste entre frontend y backend es como se modela una postulacion.

### Opcion A — Extender `BidContact` (menos invasiva)

Agregar a `BidContact`:
- `status` (por contacto: postulada, en_revision, seleccionada, etc.)
- `transactionValue`, `commissionAmount`
- Endpoints: `PATCH /bids/:bidId/contacts/:contactId/status`, bulk update

**Pros:** mantiene `Bid` como agrupador (pitch unico, un conector por oferta).  
**Contras:** el frontend debe agrupar contactos en bids al postular; cambia flujo de bandeja.

### Opcion B — Modelo nuevo `Application` (1 contacto = 1 fila)

Crear entidad `Application` alineada al frontend actual:
- `proposalId`, `leadManagerId`, `contactId`, `status`, `message`, `transactionValue`, `commission`

**Pros:** match directo con UI actual.  
**Contras:** migracion invasiva; reemplaza semantica de `Bid`.

### Opcion C — Adaptar el frontend al modelo `Bid` actual

El frontend agrupa contactos en un bid con un pitch y un solo estado.

**Pros:** cero cambios en backend.  
**Contras:** pierde granularidad de la bandeja (estados por contacto, completar transaccion individual).

> **Decision pendiente.** Hasta resolver esto, postulaciones, ratings y comisiones permanecen en mock.

---

## Endpoints faltantes (no existen en backend)

| Funcionalidad frontend | Endpoint sugerido | Prioridad |
|------------------------|-------------------|-----------|
| Dashboard empresa (KPIs) | `GET /companies/me/stats` | alta |
| Dashboard lead (KPIs) | `GET /lead-managers/me/stats` | alta |
| Ranking conectores | `GET /lead-managers/ranking` o por proposal | media |
| Reportes empresa | `GET /companies/me/reports` | media |
| Comisiones lead | `GET /lead-managers/me/commissions` | media |
| Comisiones empresa | `GET /companies/me/commissions` | media |
| Listado publico de empresas en panel | `GET /companies` (existe, no integrado) | baja |

---

## Campos sugeridos para agregar al schema Prisma

### `Proposal`
```prisma
commissionType  String   // "percentage" | "fixed"
commissionValue Decimal?
estimatedTicket Decimal?
category        String?
slug            String?  @unique
featured        Boolean  @default(false)
criteria        String?
draft           Boolean  @default(false)  // o status "draft"
```

### `Contact`
```prisma
companyName  String?  // empresa del contacto
taxId        String?  // rut
```

### `ContactBook`
```prisma
category  String?
```

### `Company`
```prisma
verified  Boolean @default(false)
commune   String?  // comuna (distinto de city)
region    String?  // region chilena
```

---

## Configuracion del frontend

```env
NEXT_PUBLIC_API_URL=https://leadmanager-x2i9.onrender.com
```

Si el backend no responde (cold start de Render, timeout), el frontend cae automaticamente a modo mock sin romper la UI.

Cuentas demo usadas en bootstrap:
- Empresa: `demo.empresa@leadmanager.dev` / `demo1234`
- Conector: `demo.lead@leadmanager.dev` / `demo12345678`

---

## Modulos que permanecen en mock

- Postulaciones (bandeja, estados, bulk actions)
- Ratings / resenas bidireccionales
- Ranking de conectores
- Dashboards y reportes (KPIs agregados)
- Comisiones (vistas de ingresos)
- Perfil lead (solo lectura, sin edicion conectada)
- Conectores empresa (listado de leads del seed)
