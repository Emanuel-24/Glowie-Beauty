# ARCHITECTURE.md — GLOWE BEAUTY

> **Estado:** FASE 10 COMPLETADA (09/10/2026) — Plan de Reestructuración Frontend y Desacoplamiento.
> Arquitectura Feature-Driven (Domain-Driven UI) + App Shell + Capa Shared + Enrutamiento con Code-Splitting.

---

## 1. Stack tecnológico real

| Capa | Tecnología | Versión | Propósito / Evidencia |
|------|------------|---------|-----------------------|
| Runtime | Node.js | v22.17.1 | ESM nativo, runner de pruebas nativo (`node:test`) |
| Package manager | pnpm | 11.2.2 | Workspace monorepo único con `pnpm-lock.yaml` en raíz |
| UI Framework | React / React DOM | ^18.3.1 | Componentes funcionales, hooks, providers y `React.lazy` |
| Router | React Router DOM | ^7.18.3 | `createBrowserRouter` + `RouterProvider` con Suspense |
| Bundler | Vite | ^5.4.11 / 5.4.21 | Alias `@/` absoluto, chunking bajo demanda |
| Estilos | Tailwind CSS | ^3.4.17 | Utility-first, responsive mobile-first, paleta `glowe-*` |
| Iconografía | Lucide React | ^1.47.0 | Iconos SVG optimizados |
| Animaciones | GSAP + ScrollTrigger | ^3.15.0 | Animaciones de scroll en Hero |
| Reportes (Admin) | jspdf + xlsx + html2canvas | ^4.2.1 / ^0.18.5 | Carga diferida dinámica (`import()`) en `reportService.js` |
| Backend | Node.js + Express + Mongoose | 4.21.2 / 9.10.1 | API REST multicapa (`routes → controllers → services → models`) |
| Pruebas Unitarias | Node.js Test Runner | v22 nativo | 29 pruebas frontend y 15 backend sin dependencias extra |
| Linting y Gobernanza | ESLint + Madge | Native flat config | Límites de capa con `no-restricted-imports`, 0 ciclos Madge |

---

## 2. Estructura de carpetas (`Frontend/src/`)

```
Frontend/src/
├── app/                           ← App Shell, enrutador y providers
│   ├── main.jsx                   ← Entry point de React (montaje en #root)
│   ├── App.jsx                    ← AppProviders + RouterProvider
│   ├── AppProviders.jsx           ← Orquestador jerárquico de providers
│   ├── router.jsx                 ← createBrowserRouter con code-splitting lazy
│   ├── routes.js                  ← Constantes inmutables de rutas (ROUTES)
│   └── layout/                    ← Layout global (AppLayout, Header, Footer, MobileBottomNav)
│
├── features/                      ← Dominios de negocio aislados (Feature-Driven UI)
│   ├── account/                   ← Perfil de usuario e historial de pedidos
│   ├── admin/                     ← Panel administrativo modular (8 tabs) y reportes diferidos
│   ├── auth/                      ← Login, registro, recuperación, guards y sesión JWT
│   ├── cart/                      ← Carrito, drawer, persistencia y cálculo desacoplado
│   ├── favorites/                 ← Lista de deseos persistente
│   ├── home/                      ← Landing principal, hero dinámico, social proof y métricas
│   ├── newsletter/                ← Captura de suscriptores y servicio
│   ├── orders/                    ← Checkout autenticado, hook useCheckout y WhatsApp
│   ├── products/                  ← Catálogo, PDP (/producto/:id), filtrado, variantes y fixtures
│   └── promotions/                ← Combos (/combos/:id), kits y ofertas flash (Glow Deals)
│
├── shared/                        ← Capa compartida agnóstica de dominio
│   ├── api/                       ← httpClient (fetch con 401 callback), tokenStorage, ApiError
│   ├── config/                    ← Lectura validada de variables de entorno y storageKeys
│   ├── components/ui/             ← Átomos del design system (Button, Input, Card, Badge...)
│   ├── hooks/                     ← Hooks agnósticos (useCountdown, usePageMeta)
│   ├── toast/                     ← Sistema global desacoplado de notificaciones
│   └── utils/                     ← Utilidades puras (whatsapp, text)
│
└── styles/index.css               ← Directivas Tailwind + utilidades glass + animaciones
```

---

## 3. Entry point y ciclo de vida de la aplicación

```
Frontend/index.html
  └── src/app/main.jsx
       └── <App />
            ├── <AppProviders>
            │    ├── <AuthProvider>
            │    ├── <CartProvider>
            │    ├── <FavoritesProvider>
            │    └── <ToastProvider>
            └── <RouterProvider router={router} />
                 └── <AppLayout> (Header, Suspense Outlet, Footer, MobileBottomNav, CartDrawer)
```

1. **`index.html`**: Carga directa de fuentes Google, metadatos y script modular `/src/app/main.jsx`.
2. **`main.jsx`**: Monta `<App />` en `React.StrictMode` e importa `styles/index.css`.
3. **`AppProviders.jsx`**: Gestiona el orden estricto de inyección de contextos para prevenir fallos de inicialización.
4. **`router.jsx`**: Enrutador declarativo creado con `createBrowserRouter`. Todas las rutas hijas implementan `React.lazy()` y cargan sus chunks bajo demanda dentro de un fallback global de `Suspense`.

---

## 4. Mapa de rutas y Code-Splitting

Todas las páginas de dominio se dividen en chunks asíncronos:

| Ruta | Componente | Feature | Carga |
|------|------------|---------|-------|
| `/` | `HomePage` | `features/home` | Lazy Chunk |
| `/maquillaje` | `MakeupPage` | `features/products` | Lazy Chunk |
| `/cabello` | `HairPage` | `features/products` | Lazy Chunk |
| `/descubrir` | `DiscoverPage` | `features/products` | Lazy Chunk |
| `/producto/:id` | `ProductPage` | `features/products` | Lazy Chunk |
| `/favoritos` | `FavoritesPage` | `features/products` | Lazy Chunk |
| `/combos` | `BundlesPage` | `features/promotions` | Lazy Chunk |
| `/combos/:id` | `BundleDetailPage` | `features/promotions` | Lazy Chunk |
| `/ofertas` | `OffersPage` | `features/promotions` | Lazy Chunk |
| `/checkout` | `CheckoutPage` | `features/orders` | Lazy Chunk (Protegido) |
| `/auth` | `AuthPage` | `features/auth` | Lazy Chunk |
| `/perfil` | `ProfilePage` | `features/account` | Lazy Chunk (Protegido) |
| `/admin` | `AdminPage` | `features/admin` | Lazy Chunk (Admin Protegido) |
| `*` | `NotFoundPage` | `features/home` | Lazy Chunk |

---

## 5. Reglas de Límites de Capa (Architecture Boundaries)

1. **DAG de Importaciones:**
   - `shared` **NO** puede importar nada de `features` ni de `app`.
   - `features` **NO** puede importar nada de `app`.
   - Una `feature` puede consumir otra `feature` únicamente a través de su barrel público (`@/features/<nombre>`), nunca archivos internos privados.
   - Toda la aplicación usa alias `@/` absoluto; los imports ascendentes `../` están estrictamente prohibidos y vigilados por ESLint (`no-restricted-imports`).
2. **Desacoplamiento de Servicios:**
   - La capa de persistencia de token (`tokenStorage.js`) opera de forma atómica sobre la clave canónica `glowe:token:v1`.
   - El cliente HTTP (`httpClient.js`) es agnóstico del estado de React y gestiona la sesión expirada (401) mediante `setUnauthorizedHandler`.
   - Cero dependencias circulares verificadas continuamente mediante `madge --circular`.
3. **Optimización de Librerías Pesadas:**
   - Las librerías de generación de reportes (`jspdf`, `xlsx`) son importadas dinámicamente en tiempo de ejecución solo cuando el usuario administrador pulsa el botón de exportación, evitando sobrecargar el bundle principal de los clientes.

---

## 6. Verificación y Calidad

El proyecto dispone de un estándar de calidad unificado en el workspace monorepo:

```powershell
# Gate de verificación completo
pnpm install --frozen-lockfile
pnpm -r build
pnpm -r check
pnpm -r test
pnpm dlx madge --circular --extensions js,jsx Frontend/src/app/main.jsx
```

- **Pruebas unitarias de Frontend:** Ejecutadas con el runner nativo de Node.js v22 (`node --test`), evaluando funciones puras de cálculo de totales (`cartTotals`), opciones y detalles de variantes cosméticas (`variants`) y generación de URLs de WhatsApp con emojis UTF-8 (`whatsapp`).
- **Pruebas de integración de Backend:** Pruebas nativas cubriendo sanitización de credenciales, balance de órdenes y pagos.