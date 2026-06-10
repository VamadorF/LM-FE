# LeadManager — Contrato de Backend para Implementaciones Frontend

Documento de referencia para cualquier frontend nuevo que se conecte al backend NestJS existente.
Recoge todos los hallazgos y trampas descubiertas durante la implementación.

---

## Stack del Backend

- NestJS 11 + TypeScript
- Prisma ORM + PostgreSQL
- JWT + Passport (`@nestjs/jwt`)
- Puerto por defecto: `3000`
- CORS configurado para `http://localhost:3001` y `http://localhost:5173`
- Swagger disponible en `http://localhost:3000/docs`

---

## Variables de Entorno Requeridas (backend)

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/leadmanager?schema=public"
PORT=3000
JWT_SECRET="change-me"
JWT_EXPIRES_IN="24h"
FRONTEND_URL="http://localhost:5173,http://localhost:3001"
```

---

## Autenticación — Flujo Completo

### ⚠️ Trampas críticas

1. **El campo del token es `accessToken` (camelCase), NO `access_token`.**
   La respuesta de `/auth/login` es:
   ```json
   { "accessToken": "eyJhbG...", "expiresIn": "24h" }
   ```

2. **Los endpoints de registro NO devuelven token.**
   `POST /auth/register/company` y `POST /auth/register/lead-manager` devuelven
   el objeto usuario (sin `passwordHash`). Para obtener el token hay que hacer
   un `POST /auth/login` inmediatamente después con las mismas credenciales.

3. **`GET /auth/me` devuelve el usuario con relaciones anidadas**, no un `profileId` plano:
   ```json
   {
     "id": "uuid",
     "email": "user@example.com",
     "role": "company",
     "company": { "id": "uuid", "legalName": "Acme SpA", ... },
     "leadManager": null
   }
   ```
   El `profileId` se deriva de `user.company?.id` o `user.leadManager?.id`.

### Flujo de login

```
POST /auth/login  { email, password }
  → { accessToken, expiresIn }

GET /auth/me  [Bearer accessToken]
  → { id, email, role, company | leadManager }
```

### Flujo de registro empresa

```
POST /auth/register/company  { ...dto }
  → usuario sin token (ignorar respuesta)

POST /auth/login  { email, password }
  → { accessToken, expiresIn }

GET /auth/me  [Bearer accessToken]
  → perfil completo
```

### Flujo de registro lead manager

```
POST /auth/register/lead-manager  { ...dto }
  → usuario sin token (ignorar respuesta)

POST /auth/login  { email, password }
  → { accessToken, expiresIn }

GET /auth/me  [Bearer accessToken]
  → perfil completo
```

### JWT Payload

El JWT contiene:
```json
{ "sub": "user-uuid", "role": "company|lead_manager", "profileId": "profile-uuid" }
```

---

## Endpoints de Autenticación y Perfil

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/auth/register/company` | ✗ | Registrar empresa |
| POST | `/auth/register/lead-manager` | ✗ | Registrar lead manager |
| POST | `/auth/login` | ✗ | Login → devuelve `accessToken` |
| GET | `/auth/me` | ✓ | Perfil propio con relaciones |
| PATCH | `/companies/me` | ✓ company | Actualizar perfil empresa |
| PATCH | `/lead-managers/me` | ✓ lead_manager | Actualizar perfil lead manager |

---

## DTOs de Registro

### Empresa (`POST /auth/register/company`)

```typescript
{
  email: string;           // requerido
  password: string;        // mínimo 4 chars
  legalName: string;       // razón social
  tradeName?: string;      // nombre comercial (opcional)
  taxId: string;           // RUT — único en el sistema
  industry: string;
  companySize: string;     // "1-10" | "11-50" | "51-200" | "200+"
  country: string;
  city: string;
  address?: string;
  contactName: string;     // nombre del contacto en la empresa
  contactPhone?: string;
  website?: string;
  description?: string;
  logoUrl?: string;
}
```

### Lead Manager (`POST /auth/register/lead-manager`)

```typescript
{
  email: string;
  password: string;        // mínimo 8 chars
  fullName: string;        // ⚠️ UN SOLO CAMPO, no firstName/lastName separados
  phone?: string;
  city: string;            // requerido
  country: string;         // requerido
  bio?: string;
}
```

> **Nota UI:** Para mejor UX en formularios, usar dos campos `firstName` + `lastName`
> y concatenarlos antes de enviar: `fullName: \`\${firstName} \${lastName}\`.trim()`

---

## DTOs de Actualización de Perfil

### Empresa (`PATCH /companies/me`)

```typescript
{
  legalName?: string;
  tradeName?: string;
  industry?: string;
  companySize?: string;
  country?: string;
  city?: string;
  address?: string;
  contactName?: string;
  contactPhone?: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  // Inmutables — el backend los elimina si se envían: email, role, taxId, userId, id
}
```

### Lead Manager (`PATCH /lead-managers/me`)

```typescript
{
  fullName?: string;       // ⚠️ campo único, no firstName/lastName
  phone?: string;
  city?: string;
  country?: string;
  bio?: string;
  // Inmutables — el backend los elimina si se envían: email, role, userId, id
}
```

---

## Endpoints de Propuestas

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| POST | `/proposals` | ✓ | company | Crear propuesta |
| GET | `/proposals/mine` | ✓ | company | Mis propuestas |
| PATCH | `/proposals/:id` | ✓ | company | Editar propuesta |
| PATCH | `/proposals/:id/status` | ✓ | company | Cambiar estado |
| GET | `/proposals` | ✓ | any | Marketplace (paginado) |
| GET | `/proposals/:id` | ✓ | any | Detalle de propuesta |

### DTO Crear Propuesta

```typescript
{
  title: string;             // 5–120 chars
  description: string;       // 20–2000 chars
  contactsNeeded: number;    // ⚠️ NO es maxBids — es la cantidad de contactos
  pricePerContact?: number;  // ⚠️ NO es reward — precio por cada contacto
  ageMin?: number;
  ageMax?: number;
  genderPreference?: string;
  incomeMin?: number;
  incomeMax?: number;
  locationCity?: string;
  locationCountry?: string;
  requiredInterests?: string[];
  expiresAt?: string;        // ISO date string, opcional
}
```

### Respuesta Propuesta

```typescript
{
  id, title, description,
  contactsNeeded: number,    // ⚠️ no maxBids
  pricePerContact: number | null,  // ⚠️ no reward
  status: "open" | "paused" | "closed" | "completed" | "expired",
  ageMin, ageMax, genderPreference, incomeMin, incomeMax,
  locationCity, locationCountry, requiredInterests,
  expiresAt: string | null,
  bidCount: number,
  company: { id, legalName, logoUrl, avgRating },  // ⚠️ legalName, no name
  createdAt
}
```

---

## Endpoints de Bids (Postulaciones)

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| POST | `/proposals/:proposalId/bids` | ✓ | lead_manager | Crear bid |
| GET | `/bids/mine` | ✓ | lead_manager | Mis bids |
| DELETE | `/bids/:id` | ✓ | lead_manager | Retirar bid |
| GET | `/proposals/:proposalId/bids` | ✓ | company | Bids de una propuesta |
| POST | `/bids/:id/accept` | ✓ | company | Aceptar bid |
| POST | `/bids/:id/reject` | ✓ | company | Rechazar bid |
| GET | `/bids/:id/contacts` | ✓ | company | Ver contactos del bid aceptado |
| POST | `/bids/:id/complete` | ✓ | company | Marcar trato completado |

### DTO Crear Bid

```typescript
{
  pitch: string;         // ⚠️ NO es message — campo requerido, descripción del bid
  contactBookId?: string;
  contactIds?: string[];
}
```

### Respuesta Bid

```typescript
{
  id, status,
  pitch: string,           // ⚠️ no message
  totalPrice: number | null,
  companyNote: string | null,
  contactCount: number,
  proposal: { id, title, pricePerContact, expiresAt },
  leadManager: { id, fullName, avgRating, reviewCount },  // ⚠️ fullName no firstName/lastName
  createdAt, updatedAt
}
```

**Estados posibles de un Bid:**
`"pending"` | `"accepted"` | `"rejected"` | `"withdrawn"` | `"completed"`

---

## Endpoints de Contactos y Libretas

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/contacts` | ✓ | Crear contacto |
| GET | `/contacts` | ✓ | Mis contactos |
| PATCH | `/contacts/:id` | ✓ | Editar contacto |
| DELETE | `/contacts/:id` | ✓ | Eliminar contacto |
| POST | `/contact-books` | ✓ | Crear libreta |
| GET | `/contact-books` | ✓ | Mis libretas |
| PATCH | `/contact-books/:id` | ✓ | Editar libreta |
| DELETE | `/contact-books/:id` | ✓ | Eliminar libreta |
| POST | `/contact-books/:id/contacts` | ✓ | Agregar contacto a libreta |
| GET | `/contact-books/:id/contacts` | ✓ | Contactos de una libreta |
| DELETE | `/contact-books/:id/contacts/:contactId` | ✓ | Quitar contacto de libreta |

### DTO Contacto

```typescript
{
  firstName: string;     // requerido
  lastName: string;      // requerido
  age: number;           // ⚠️ requerido (Int), mínimo 18
  email?: string;
  phone?: string;
  gender?: "male" | "female" | "non_binary" | "prefer_not_to_say";
  city?: string;
  country?: string;
  monthlyIncome?: number;
  interests?: string[];
  privateNotes?: string;
  // ⚠️ NO existen los campos: company, position, notes (fueron renombrados/eliminados)
}
```

---

## Endpoints de Reseñas

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/bids/:bidId/reviews` | ✓ | Crear reseña para un bid completado |
| GET | `/companies/:id/reviews` | ✓ | Reseñas de una empresa |
| GET | `/lead-managers/:id/reviews` | ✓ | Reseñas de un lead manager |

---

## Endpoints de Empresas (Directorio Público)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/companies` | ✓ | Listado de empresas |
| GET | `/companies/:id` | ✓ | Perfil público de empresa |

---

## Modelo de Datos — Campos Críticos

### Company

```typescript
{
  id, legalName,          // ⚠️ legalName, NO "name"
  tradeName,
  taxId,                  // único en el sistema
  industry, companySize,
  country, city,
  contactName, contactPhone,
  website, logoUrl, description,
  avgRating,              // ⚠️ avgRating, NO averageRating
  reviewCount,
  subscription: { status, trialEndsAt, currentPeriodEnd }
}
```

### LeadManager

```typescript
{
  id,
  fullName,               // ⚠️ fullName — campo ÚNICO, no firstName/lastName
  phone, city, country, bio,
  avatarUrl,
  avgRating,              // ⚠️ avgRating, NO averageRating
  reviewCount,
  contactCount
}
```

### Tamaños de empresa válidos

```
"1-10" | "11-50" | "51-200" | "200+"
```

### Géneros válidos

```
"male" | "female" | "non_binary" | "prefer_not_to_say"
```

---

## Implementación del Cliente HTTP (Axios)

### El problema principal

El interceptor necesita adjuntar el token JWT a cada request. Sin embargo, en el
flujo post-login/registro, el token existe antes de que Zustand persist lo haya
escrito en localStorage. La solución es un módulo con variable de caché:

```typescript
// lib/axios.ts
const PERSIST_KEY = "lm-auth"; // debe coincidir con el nombre del store Zustand

let _pendingToken: string | null = null;

export function setPendingToken(token: string | null): void {
  _pendingToken = token;
}

function getToken(): string | null {
  // 1. Token provisional (post-login, antes de setAuth)
  if (_pendingToken) return _pendingToken;
  // 2. Token persistido por Zustand en localStorage
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { token?: string | null } };
    return parsed.state?.token ?? null;
  } catch {
    return null;
  }
}

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      _pendingToken = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem(PERSIST_KEY);
        if (!window.location.pathname.startsWith("/auth")) {
          window.location.href = "/auth/login?session=expired";
        }
      }
    }
    return Promise.reject(error);
  }
);
```

### Flujo de login/registro en los hooks

```typescript
// Patrón para login
onSuccess: async (data) => {
  setPendingToken(data.accessToken);  // 1. Cache el token ANTES de /auth/me
  try {
    const { data: user } = await apiClient.get("/auth/me");  // 2. El interceptor lo adjunta
    setAuth(data.accessToken, user);  // 3. Zustand persist escribe en localStorage
  } finally {
    setPendingToken(null);  // 4. Limpiar el caché
  }
};

// Patrón para registro (register no devuelve token → hacer login primero)
mutationFn: async (dto) => {
  await apiClient.post("/auth/register/company", dto);
  const { data: loginData } = await apiClient.post("/auth/login", {
    email: dto.email,
    password: dto.password,
  });
  return loginData; // { accessToken, expiresIn }
},
```

---

## Zustand Store de Autenticación

```typescript
// store/auth.ts
interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  role: "company" | "lead_manager" | null;
  setAuth: (token: string, user: AuthUser) => void;
  logout: () => void;
  updateUser: (partial: Partial<AuthUser>) => void;
}

// persist config
{
  name: "lm-auth",  // ⚠️ debe coincidir con PERSIST_KEY en axios.ts
  partialize: (state) => ({ token, user, isAuthenticated, role })
}
```

El store persiste todo el estado de auth en `localStorage` bajo la clave `"lm-auth"`.
Zustand escribe automáticamente en cada `set()`.

---

## Validaciones de Formulario (Zod)

### Tamaños empresa

```typescript
const COMPANY_SIZES = ["1-10", "11-50", "51-200", "200+"] as const;
z.enum(COMPANY_SIZES)
```

### Password mínimos

- Empresa: mínimo 4 caracteres (backend) → usar 6 en frontend para seguridad
- Lead Manager: mínimo 8 caracteres (backend)

### Edad contacto

- Requerida, entero, mínimo 18

### Pitch de bid

- Requerido, mínimo 10 caracteres, máximo 1000

### Propuesta

- `contactsNeeded`: entero, mínimo 1, máximo 500
- `expiresAt`: opcional (ISO string)
- `pricePerContact`: opcional, no negativo

---

## Notas de Billing

El billing con Stripe **no está activo en MVP**. El registro de empresa crea
automáticamente una suscripción con `status: "trialing"` sin llamar a Stripe.
No bloquea la creación de propuestas. Se puede mostrar `"trialing"` en el UI
como estado de suscripción válido.

---

## Cron Jobs

`ProposalsExpirationService` expira propuestas `open` con `expiresAt` vencido
cada hora. El estado resultante es `"expired"`. Los frontends deben manejar este
estado en la UI.

---

## Resumen de Trampas (TL;DR)

| Campo / Comportamiento | ❌ Asunción incorrecta | ✅ Realidad |
|------------------------|----------------------|-------------|
| Token en respuesta de login | `access_token` | `accessToken` |
| Respuesta de registro | Devuelve token | Solo devuelve usuario, sin token |
| Nombre empresa | `company.name` | `company.legalName` |
| Nombre lead manager | `firstName` + `lastName` | `fullName` (campo único) |
| Rating promedio | `averageRating` | `avgRating` |
| Campo de postulación | `message` | `pitch` (requerido, min 10 chars) |
| Cantidad en propuesta | `maxBids` | `contactsNeeded` |
| Precio en propuesta | `reward` | `pricePerContact` |
| Estados de propuesta | solo `open`/`closed` | + `paused`, `completed`, `expired` |
| Estados de bid | solo `pending`/`accepted`/`rejected` | + `withdrawn`, `completed` |
| Lead manager en bids | `lm.firstName + lm.lastName` | `lm.fullName` |

