# ElectroSoft — Sistema de Gestión Comercial y Tienda Web

[![Node.js](https://img.shields.io/badge/Node.js-v22+-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4.11-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_Mongoose_9-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Package Manager](https://img.shields.io/badge/pnpm-11+-F69220?style=flat&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> Plataforma e-commerce moderna, modular y de alto rendimiento diseñada para la comercialización de productos de belleza, maquillaje y cuidado personal (Colombia / COP), con panel administrativo, arquitectura desacoplada en 4 capas y cierre de pedidos asistido por WhatsApp.

---

## 🌟 Características Principales

- 📲 **Checkout Asistido con Redirección a WhatsApp:** Creación inmediata de orden en base de datos (`Pendiente` / `Sin pagos`) con generación de ID único y redirección automática a WhatsApp con mensaje preformateado (desglose de ítems, totales y método de pago).
- 🔐 **Autenticación Obligatoria con Sincronización de Carrito (*Merge Strategy*):** Los visitantes pueden explorar y agregar productos libremente (almacenamiento en `localStorage`). Para finalizar la compra es mandatorio iniciar sesión o registrarse, momento en el cual el sistema sincroniza automáticamente el carrito local con el de la base de datos.
- 📦 **Modelo de Ventas Bajo Pedido (*On-Demand*):** Catálogo configurado sin bloqueos por saldo de stock cero, garantizando disponibilidad continua y ocultando contadores numéricos al cliente final.
- 🎁 **Módulo de Combos (Bundles) Avanzado:** Renderizado con imagen grupal personalizada en el catálogo y detalle exclusivo (`/combos/:id`) con galería fotográfica de cada producto individual que integra el combo.
- 🔥 **Ofertas Destacadas y Descuentos Dinámicos:** Gestión de promociones con cálculo dinámico de porcentaje de descuento (`discountPercentage` / `onSale`) y selección de las 3 mejores ofertas destacadas (`isFeaturedOffer`).
- 📸 **Validación Estricta de Multimedia:** Validación tanto en frontend como en backend que exige un mínimo obligatorio de 2 imágenes reales por producto (`images.length >= 2`), eliminando imágenes genéricas.
- ♿ **Accesibilidad (a11y) y SEO de Alto Nivel:** Semántica HTML5 completa, punto de anclaje `<main id="contenido-principal">`, skip links accesibles, lazy loading en imágenes y hook reactivo `usePageMeta` para metadatos dinámicos Open Graph y Twitter Cards.

---

## 🏗️ Arquitectura Técnica

El proyecto implementa una separación estricta de responsabilidades entre cliente y servidor:

```
┌─────────────────────────────────────────────────────────────┐
│                       FRONTEND SPA                          │
│     React 18 + Vite 5 + Tailwind CSS + React Router 7       │
│  (Pages / Sections → Contexts / Hooks → Services [api.js])  │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP REST JSON
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                       BACKEND API                           │
│        Node.js (ESM) + Express 4 + Mongoose 9               │
│                                                             │
│   [Routes] ──▶ [Controllers] ──▶ [Services] ──▶ [Models]    │
│  (Endpoints)    (Req/Res HTTP)   (Lógica/BD)     (Mongoose) │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
                     [ MongoDB Atlas Database ]
```

- **Backend en 4 Capas:**
  1. `routes/`: Enrutamiento y middlewares de autenticación JWT.
  2. `controllers/`: Adaptadores HTTP delgados que procesan `req`/`res` y retornan el formato estandarizado `{ success, data, message }`.
  3. `services/`: Lógica de negocio pura, cálculo de totales, reglas de orden y transacciones con la base de datos (`authService`, `productService`, `orderService`, `paymentService`, `userService`, `categoryService`).
  4. `models/`: Esquemas de Mongoose estructurados.
- **Frontend Modular:** Configurado con alias absolutos de importación `@/` (`@/components`, `@/services`, `@/context`, `@/hooks`, `@/pages`, `@/styles`), optimizado con Vite y Tailwind CSS.
- **Suite de Pruebas Nativa:** Pruebas unitarias e integrales en `Backend/tests/integration.test.js` impulsadas por el runner nativo de Node.js v22 (`node:test` y `node:assert/strict`) con **0 dependencias externas añadidas**.

---

## 📁 Estructura del Proyecto

```text
Glowe Beauty/
├── .agents/
│   └── skills/
│       └── glowe-maintenance/       # Skill de gobernanza y mantenimiento continuo
├── Backend/
│   ├── src/
│   │   ├── config/                  # Conexión a MongoDB Atlas
│   │   ├── controllers/             # Controladores HTTP delgados
│   │   ├── middleware/              # Auth JWT y protección de roles
│   │   ├── models/                  # Modelos Mongoose (User, Product, Order, Payment, Category)
│   │   ├── routes/                  # Definición de endpoints REST
│   │   ├── services/                # Capa de lógica de negocio y persistencia
│   │   ├── seed.js                  # Script de sembrado de datos
│   │   └── server.js                # Punto de entrada Express
│   ├── tests/
│   │   └── integration.test.js      # Suite de pruebas automatizadas (node:test)
│   ├── package.json
│   └── vercel.json
├── Frontend/
│   ├── public/                      # robots.txt, sitemap.xml y assets estáticos
│   ├── src/
│   │   ├── components/              # layout/, sections/, ui/ (Atomic Design)
│   │   ├── context/                 # AuthContext, CartContext, FavoritesContext, ToastContext
│   │   ├── data/                    # Catálogo y mocks iniciales
│   │   ├── hooks/                   # usePageMeta, useCart, useAuth, useFavorites
│   │   ├── pages/                   # Home, Products, Combos, ComboDetalle, Ofertas, Cart, Checkout, Admin...
│   │   ├── services/                # Cliente API centralizado (api.js, etc.)
│   │   └── styles/                  # Tailwind CSS y directivas globales
│   ├── jsconfig.json                # Mapeo de alias '@/ -> ./src/*'
│   ├── vite.config.js               # Configuración Vite + Alias
│   ├── package.json
│   └── vercel.json
├── AGENTS.md                        # Reglas y directrices de desarrollo permanente
├── PROJECT_STATE.md                 # Memoria activa del proyecto y registro de ADRs
├── ROADMAP.md                       # Hoja de ruta y tablero de control (100%)
├── .gitignore                       # Filtro robusto de dependencias, entornos y assets
└── README.md                        # Documentación principal del sistema
```

---

## 🚀 Guía de Instalación y Ejecución

> **Importante:** Este proyecto utiliza **PNPM** como único gestor de paquetes obligatorio.

### 1. Prerrequisitos
- **Node.js:** v22 o superior
- **PNPM:** v11 o superior (`corepack enable pnpm` o `npm i -g pnpm`)
- **Base de Datos:** Instancia local de MongoDB o clúster en MongoDB Atlas.

### 2. Clonar el repositorio
```bash
git clone https://github.com/Emanuel-24/Glowie-Beauty.git
cd Glowie-Beauty
```

### 3. Configuración de Variables de Entorno
Crea los archivos `.env` en sus respectivas carpetas tomando como base los `.env.example`:

**`Backend/.env`**
```env
PORT=5000
MONGODB_URI=mongodb+srv://<usuario>:<password>@cluster.mongodb.net/electrosoft?retryWrites=true&w=majority
JWT_SECRET=tu_clave_secreta_jwt_super_segura
FRONTEND_URL=http://localhost:5173
```

**`Frontend/.env`**
```env
VITE_API_URL=http://localhost:5000/api
VITE_WHATSAPP_PHONE=573001234567
```

### 4. Instalación de Dependencias
```bash
# En el Backend
cd Backend
pnpm install

# En el Frontend
cd ../Frontend
pnpm install
```

### 5. Sembrado de Datos Iniciales (Opcional)
```bash
cd Backend
pnpm seed
```

### 6. Ejecución en Modo Desarrollo
En terminales independientes:

```bash
# Terminal 1 - Backend (Puerto 5000)
cd Backend
pnpm dev

# Terminal 2 - Frontend (Puerto 5173)
cd Frontend
pnpm dev
```

### 7. Comandos de Verificación y Testing Autónomo
Ambos módulos cuentan con scripts estandarizados para validación de calidad:

```bash
# Backend: Verificación sintáctica y pruebas unitarias/integración
cd Backend
pnpm check        # Verifica sintaxis de scripts con node --check
pnpm test:unit    # Ejecuta la suite de pruebas nativa (node:test)

# Frontend: Validación de compilación y empaquetado Vite
cd Frontend
pnpm check        # Ejecuta build productivo para garantizar ausencia de errores
```

---

## 🏛️ Registro de Decisiones de Arquitectura (ADRs)

El desarrollo del proyecto está respaldado por 15 decisiones arquitectónicas documentadas en `PROJECT_STATE.md`:

| ADR | Título / Decisión |
| :--- | :--- |
| **ADR-001** | **PNPM como único package manager:** Prohibición de npm/yarn para evitar desincronizaciones de dependencias. |
| **ADR-002** | **Frontend y Backend como proyectos desacoplados:** Despliegues y ciclos de vida independientes. |
| **ADR-003** | **JavaScript Moderno (ESM):** Código limpio sin sobrecarga de transpilación TypeScript, tipado asistido por `jsconfig.json`. |
| **ADR-004** | **Backend en 4 Capas:** Controladores delgados delegando a capa `services/`. |
| **ADR-005** | **Contrato de API Estándar:** Formato uniforme `{ success, data, message }` para todas las respuestas HTTP. |
| **ADR-006** | **Gobernanza de Memoria IA:** Seguimiento coordinado mediante `AGENTS.md`, `ROADMAP.md` y `PROJECT_STATE.md`. |
| **ADR-007** | **Auth Obligatoria y Merge de Carrito:** Persistencia en `localStorage` con fusión automática a la base de datos al autenticarse. |
| **ADR-008** | **Cierre Asistido por WhatsApp:** Creación instantánea de orden en BD y redirección con mensaje estructurado. |
| **ADR-009** | **Inventario On-Demand:** Disponibilidad continua sin restricciones por saldo de inventario cero. |
| **ADR-010** | **Validación Estricta Multimedia:** Mínimo 2 imágenes reales por producto validadas en frontend y backend. |
| **ADR-011** | **Gestión Integral de Pagos:** Soporte para `CONTRA_ENTREGA`, `TRANSFERENCIA`, `EFECTIVO` y seguimiento de `ABONOS`. |
| **ADR-012** | **Combos y Ofertas Destacadas:** Modelo `type: COMBO` con vista grupal/individual y carrusel top 3 ofertas destacadas. |
| **ADR-013** | **Scripts Autónomos y Reducción de Ruido:** Limpieza contextual vía `.gitignore` y comandos `check`, `lint` y `test:unit`. |
| **ADR-014** | **SEO Dinámico y Accesibilidad WCAG:** `usePageMeta`, robots/sitemap, navegación accesible por teclado y lazy loading. |
| **ADR-015** | **Suite de Pruebas Nativas y Mantenimiento:** Pruebas con `node:test` y skill `.agents/skills/glowe-maintenance/`. |

---

## 📄 Licencia

Este proyecto está distribuido bajo los términos de la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.
