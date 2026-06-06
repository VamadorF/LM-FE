# LeadManager

**LeadManager** es un marketplace de referidos B2B. Las empresas publican ofertas con comisión y los conectores (leads) postulan contactos calificados de su red para generar negocios.

El producto conecta dos actores:

- **Empresa**: busca prospectos, define criterios, revisa propuestas y paga comisión por cierre.
- **Lead (conector)**: organiza su red en una agenda y listas, explora ofertas y postula contactos con un mensaje que explica por qué encajan.

## Qué problema resuelve

Una empresa no compra solo un teléfono: compra una **propuesta calificada**. LeadManager permite evaluar cada postulación con contexto: pitch del conector, carpeta de origen, encaje con los criterios de la oferta, datos del contacto y reputación del conector.

## Funcionalidades principales

### Panel Empresa

- Dashboard con KPIs de ofertas, postulaciones y comisiones
- CRUD de ofertas (comisión fija o porcentaje, criterios, región, ticket estimado)
- Bandeja de postulaciones con tabla virtualizada (~11k registros mock)
- Detalle de postulación con propuesta del conector, encaje y acciones de estado
- Ranking de conectores, reportes y seguimiento de comisiones

### Panel Lead (conector)

- **Agenda**: maestro de contactos (crear/editar una vez)
- **Listas**: carpetas categorizadas que agrupan contactos de la agenda (muchos a muchos)
- Explorador de ofertas con postulación multiselect estilo carpetas
- Mensaje de propuesta al postular (por qué recomienda esos contactos)
- Seguimiento de postulaciones, comisiones, ranking y perfil

### Flujo de postulación

1. El lead abre una oferta y elige una carpeta (Agenda completa o una Lista).
2. Selecciona contactos y escribe una propuesta para la empresa.
3. La empresa revisa la bandeja: ve preview de la propuesta y abre el detalle.
4. Cambia estado (revisión, seleccionada, negociación, rechazada) o completa la transacción.
5. Ambas partes pueden calificarse tras un cierre.

## Stack técnico

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** + componentes UI propios
- **Zustand** con persistencia por deltas en `localStorage`
- **TanStack Virtual** para tablas de alto volumen
- **Recharts** para gráficos del dashboard
- Datos mock generados en `src/lib/seed.ts` (~11k postulaciones)

## Inicio rápido

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). La app redirige al panel Lead. Usa el switcher **Lead / Empresa** en la barra superior para cambiar de rol (modo mock).

### Scripts

| Comando        | Descripción              |
|----------------|--------------------------|
| `npm run dev`  | Servidor de desarrollo   |
| `npm run build`| Build de producción      |
| `npm run start`| Servidor de producción   |
| `npm run lint` | ESLint                   |

## Estructura del proyecto

```
src/
├── app/(panel)/          # Rutas Empresa y Lead
│   ├── empresa/          # Dashboard, ofertas, conectores, comisiones, reportes
│   └── lead/             # Agenda, listas, ofertas, postulaciones, ranking
├── components/
│   ├── contactos/        # Explorador, picker, carpetas
│   ├── listas/           # CRUD de listas
│   ├── ofertas/          # Cards, formulario, postular
│   ├── postulaciones/    # Tabla virtualizada, detalle con propuesta
│   └── layout/           # Shell, sidebar, navegación por rol
└── lib/
    ├── types.ts          # Modelo de dominio
    ├── store.ts          # Estado global + persistencia
    ├── seed.ts           # Datos mock
    └── selectors.ts      # Consultas derivadas
```

## Modelo de datos (resumen)

| Entidad      | Descripción |
|--------------|-------------|
| `Empresa`    | Anunciante de ofertas |
| `Lead`       | Conector que postula contactos |
| `Oferta`     | Oportunidad comercial con comisión y criterios |
| `Contacto`   | Persona en la agenda del lead |
| `Lista`      | Carpeta que agrupa contactos |
| `Postulacion`| Contacto postulado a una oferta, con mensaje de propuesta |
| `Rating`     | Calificación cruzada tras un cierre |

## Persistencia

El estado se guarda en `localStorage` bajo la clave `leadmanager-market`. Solo se persisten los deltas del usuario (cambios sobre el seed base). Para resetear datos mock, borra esa clave en DevTools o usa la acción de reset del store.

## Licencia

Proyecto privado.
