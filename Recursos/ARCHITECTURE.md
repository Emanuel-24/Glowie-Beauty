# ARCHITECTURE.md — GLOWE BEAUTY

> **Estado:** FASE 8 (implementada 22/09/2026) sobre base de FASE 1.
> FASE 8 añade: checkout con orden persistida en el almacenamiento real del auth local (`orders`), historial de pedidos en perfil usando `useAuth()`, y registro de pedidos desde `Checkout.jsx` con `addOrder()` tras la confirmación del flujo.
> Marcas usadas: IMPLEMENTADO / PARCIAL / MOCK / NO IMPLEMENTADO / REQUIERE REVISIÓN.

---

## 1. Stack tecnológico real

| Capa | Tecnología | Versión (resuelta) | Evidencia |
|------|------------|--------------------|-----------|
| Runtime | Node.js | v22.17.1 | auditoría |
| Package manager | pnpm | 11.2.2 | `pnpm --version` |
| UI | React | 18.3.1 | `package.json` |
| Router | react-router-dom (v7, modo data/legacy BrowserRouter) | 7.18.3 | `src/App.jsx` |
| Bundler | Vite | 5.4.21 | `vite.config.js` |
| Estilos | Tailwind CSS | 3.4.19 | `tailwind.config.js`, `src/styles/index.css` |
| PostCSS | postcss + autoprefixer | 8.5.28 / 10.6.0 | `postcss.config.js` |
| Plugin | @vitejs/plugin-react | 4.7.0 | `vite.config.js` |
| Deploy target | Vercel (SPA rewrite) | — | `vercel.json` |

- **No hay TypeScript** (todo `.js/.jsx`).
- **No hay framework de testing ni lint configurado** (verificado: solo scripts `dev`, `build`, `preview`).
- **El backend NO existe**: `VITE_API_BASE_URL=http://localhost:5000/api` está definida en `.env`, pero ninguna capa la usa en la práctica (el "http client" nunca se invoca).

## 2. Estructura de carpetas (real)

```
Glowe Beauty/
├── AGENTS.md                              ← creado en FASE 0
├── docs/                                  ← creado en FASE 0 (ARCHITECTURE, DESIGN_SYSTEM, UX_FLOWS, ROADMAP)
└── Frontend/
    ├── .agents/skills/                    ← skills instaladas (ver Frontend/skills-lock.json)
    ├── .env / .env.example                ← VITE_API_BASE_URL (mock, sin backend)
    ├── .gitignore
    ├── index.html                         ← entry point HTML (meta, fonts, #root)
    ├── package.json / pnpm-lock.yaml / pnpm-workspace.yaml
    ├── postcss.config.js / tailwind.config.js / vite.config.js
    ├── vercel.json                        ← rewrite SPA → index.html
    ├── Logo.png                           ← asset (1.2 MB, pesado)
    ├── glowe_beauty_landing_page_completa.html   ← prototipo standalone legacy (Tailwind CDN)
    ├── interactive_visual_im_*.html        ← artefacto generado externo (NO parte de la app)
    ├── dist/                              ← build previo (13/09/2026)
    ├── public/Logo.png
    └── src/
        ├── main.jsx                       ← entry point de React
        ├── App.jsx                        ← providers + routing + layout shell
        ├── pages/                         ← 7 páginas
        ├── components/
        │   ├── layout/                    ← Header, Footer, MobileBottomNav
        │   ├── sections/                  ← HeroSection, CategoryPlayground, ProductGrid, ...
        │   └── ui/                        ← Button, Badge, Reveal, SearchModal, CartDrawer
        ├── context/                       ← CartContext, FavoritesContext, ToastContext
        ├── hooks/                         ← useDisclosure, useScrollY, useCountdown
        ├── services/api.js                ← capa de datos (mock)
        ├── data/products.js               ← catálogo estático (16 productos + extras)
        └── styles/index.css               ← Tailwind directives + glass utilities + keyframes
```

## 3. Entry points y bootstrap

```
index.html (gráfico, fuentes Google, #root)
  └── src/main.jsx (ReactDOM.createRoot + <StrictMode>)
       └── src/App.jsx
```

- `src/main.jsx` → monta `<App/>` con `React.StrictMode` e importa `styles/index.css`.
- `src/App.jsx` es el componente raíz y contiene **toda la estructura de la app**:
  1. Carga `getProducts()` en un `useEffect` y la pasa a `<Header products={products}/>`.
  2. Concatena los providers: `CartProvider > FavoritesProvider > ToastProvider > AuthProvider > BrowserRouter`.
  3. Renderiza layout fijo: `GlowBackground` (blobs fijos), `Header`, `<main>` con `<Routes>`, `Footer`, `MobileBottomNav`, `CartDrawer`.
  4. Componente interno `ScrollToTop` (scroll al inicio en cada cambio de ruta).

## 4. Routing (real)

`src/App.jsx` — `<Routes>` dentro de `BrowserRouter`:

| Ruta | Página | Composición |
|------|--------|-------------|
| `/` | `pages/Inicio` | HeroSection + CategoryPlayground + TrustBadges + SocialProof |
| `/maquillaje` | `pages/Maquillaje` | EditorialMakeup + ProductGrid (categoryLock="maquillaje") |
| `/cabello` | `pages/Cabello` | HairCareSection + ProductGrid (categoryLock="cabello") |
| `/ofertas` | `pages/Ofertas` | GlowDeals |
| `/combos` | `pages/Combos` | BundlesSection |
| `/descubrir` | `pages/Descubrir` | FindYourGlow + ProductGrid (filtro por `?tag=` vía query param) |
| `/checkout` | `pages/Checkout` | Checkout (envuelto en `ProtectedRoute`) — prefill del form desde `useAuth()` |
| `/login` | `pages/Login` | Login (mock) — usuario demo `valentina@glowe.com` / `glowe2024` |
| `/registro` | `pages/Registro` | Registro (mock) — crea sesión vía `register()` |
| `/perfil` | `pages/Perfil` | Perfil (envuelto en `ProtectedRoute`) — datos del usuario + `logout()` |
| `*` | `pages/NotFound` | mensaje + botón “Volver al Inicio” |

- **NO IMPLEMENTADO:** página de detalle de producto (`/producto/:id`).
- **NO IMPLEMENTADO:** favoritos (vista dedicada), historial de pedidos.

## 5. Componentes y responsabilidades

### layout/ (estructura global)
| Componente | Responsabilidad | Observaciones |
|---|---|---|
| `Header.jsx` | Barra anuncio, logo, nav escritorio, búsqueda, favoritos, carrito | recibe `products` por props; state local `searchOpen` |
| `Footer.jsx` | Links, redes, **newsletter** | duplica lógica de newsletter con `SocialProof` |
| `MobileBottomNav.jsx` | Nav inferior fija (solo móvil, `md:hidden`) | 5 accesos |

### sections/ (bloques de página)
| Componente | Responsabilidad |
|---|---|
| `HeroSection.jsx` | Hero + micro-cards + CTAs → `/descubrir` |
| `CategoryPlayground.jsx` | Grilla de 4 categorías → rutas |
| `TrustBadges.jsx` | 4 sellos de confianza (estático) |
| `SocialProof.jsx` | Feed social (de `data`) + newsletter vía `NewsletterForm` |
| `ProductGrid.jsx` | Grilla + filtro de categoría + empty state; recibe `products`, `glowFilter`, `categoryLock` |
| `ProductCard.jsx` | Card de producto: favorito, al carrito, precio, rating (usa `Card`/`Badge`/`Button`) |
| `FindYourGlow.jsx` | Quiz/filtros por `tag` → `/descubrir?tag=` |
| `EditorialMakeup.jsx` | Categorías editoriales → `/descubrir?tag=` |
| `HairCareSection.jsx` | Cards capilar → `/descubrir?tag=cabello` |
| `GlowDeals.jsx` | Deals + countdown + añadir al carrito (usa `Card`/`Badge`/`Button`) |
| `BundlesSection.jsx` | Combos + añadir al carrito (usa `Card`/`Badge`/`Button`; colores desde data) |

### ui/ (átomos)
| Componente | Estado |
|---|---|
| `Button.jsx` | IMPLEMENTADO (FASE 1) — variants primary/glass/soft/gradient/dark/plain, sizes sm/md/lg/icon, loading, disabled, focus-visible. Usado en Header, Hero, ProductCard, GlowDeals, Bundles, CartDrawer, NewsletterForm |
| `Badge.jsx` | IMPLEMENTADO (FASE 1) — tones white/rose/pink/blue/amber/neutral/dark/accent/plain. Usado en ProductCard, GlowDeals, Bundles, HairCareSection |
| `Input.jsx` | IMPLEMENTADO (FASE 1) — `.glass-input` + sizes sm/md, forwardRef |
| `Card.jsx` | IMPLEMENTADO (FASE 1) — variants glass/panel/subtle, radios xl/2xl/3xl |
| `NewsletterForm.jsx` | IMPLEMENTADO (FASE 1) — unifica Footer + SocialProof (estado, toast, loading, éxito propio) |
| `Reveal.jsx` | IMPLEMENTADO — reveal on scroll (IntersectionObserver), usado en CategoryPlayground, BundlesSection, GlowDeals |
| `SearchModal.jsx` | Búsqueda live sobre `products`; al elegir resultado agrega al carrito y navega a `/descubrir` |
| `CartDrawer.jsx` | Drawer del carrito: qty +/−, total, checkout mock |

## 6. Contextos (estado global)

| Context | Archivo | Estado | Contenido | Persistencia |
|---|---|---|---|---|
| Carrito | `context/CartContext.jsx` | IMPLEMENTADO (en memoria) | `items[]`, `itemCount`, `total`, `isOpen`, `open/close/toggleCart`, `addItem`, `removeItem`, `clearCart` | **NO IMPLEMENTADA** (se pierde al recargar) |
| Favoritos | `context/FavoritesContext.jsx` | IMPLEMENTADO (en memoria) | `favorites[]` (ids), `count`, `toggleFavorite`, `isFavorite` | **NO IMPLEMENTADA** |
| Auth | `context/AuthContext.jsx` | IMPLEMENTADO (mock; usuario demo valentina@glowe.com / glowe2024) | `user`, `isAuthenticated`, `login()`, `register()`, `logout()`; `logout()` llama `clearCart()` | **EN MEMORIA** |`
| Toasts | `context/ToastContext.jsx` | IMPLEMENTADO | `showToast(title, message, icon)`; auto-cierre 3s | — |

- Los cuatro siguen el patrón `createContext` + hook `useX()` que valida que exista el provider.
- **REQUIERE REVISIÓN:** `toggleFavorite` usa un patrón de "return value" con variable mutable (`let added`) que no es fiable en StrictMode (doble invocación del updater), aunque funciona en la práctica.

## 7. Hooks

| Hook | Archivo | Estado |
|---|---|---|
| `useScrollY` | `hooks/index.js` | IMPLEMENTADO — usado en `Header` |
| `useCountdown` | `hooks/index.js` | IMPLEMENTADO — usado en `GlowDeals` (countdown hardcodeado 8h42m19s) |

## 8. Services / data layer

### `src/services/api.js` — **MOCK/SIMULADO**
- Declara `httpClient` (fetch a `VITE_API_BASE_URL`) pero **nunca se usa**.
- Exporta:
  - `getProducts()` → devuelve `data/products.js` tras 150ms fake.
  - `getProductById(id)` → busca en el array local (100ms).
  - `getGlowDeals()` → `{ deals, bundles }` (150ms).
  - `subscribeNewsletter(email)` → simula éxito (300ms), sin validación de email.
  - `createOrder(orderData)` → simula éxito con `orderId: GLOWE-<timestamp>` (400ms). **No hay backend, no se genera pedido real, sin WhatsApp.**
- FASE 1 eliminó el export muerto `getBundles`.

### `src/data/products.js` — catálogo estático (16 productos)
- `products` (16 ítems): maquillaje y cabello, precios COP, `oldPrice` (opcional), `rating`, `badge`, `image` (Unsplash), `desc`.
- `quizOptions` (6 tags), `categories` (4), `editorialCategories` (6), `hairCards` (6), `bundles` (4), `glowDeals` (3), `socialPosts` (4).

## 9. Flujo de datos actual

```
App (useEffect getProducts + useState)
 ├── Header  (products → SearchModal)
 └── Páginas (cada una hace SU PROPIO getProducts() local)
      ├── Maquillaje   → getProducts()
      ├── Cabello      → getProducts()
      └── Descubrir    → getProducts()
        + /ofertas     → GlowDeals.getGlowDeals()
        + /combos      → BundlesSection.getGlowDeals()
Producto → addItem(CartContext)  → CartDrawer.showToast + createOrder(mock) + clearCart
Favorito → toggleFavorite(FavoritesContext) → toast
Newsletter → Footer / SocialProof → subscribeNewsletter(mock)
```

**Duplicación de lectura de datos**: `App`, `Maquillaje`, `Cabello` y `Descubrir` llaman `getProducts()` por separado (mismo array estático, sin cache/context de datos). No hay estado global de "catálogo".

## 10. Estado local vs global

- **Global (context)** — carrito, favoritos, toasts.
- **Local (useState/useEffect por componente)** — productos por página, búsqueda (`SearchModal`), newsletter (ahora dentro de `NewsletterForm`), category pill (`ProductGrid`), scrolled (`Header`).
- No hay props drilling relevante; las páginas se comunican con secciones vía props simples (`products`, `glowFilter`, `categoryLock`).

## 11. Dependencias reales

- **En uso:** `react`, `react-dom`, `react-router-dom`, `@vitejs/plugin-react`, `vite`, `postcss`, `autoprefixer`, `tailwindcss`.
- **No existen** dependencias extra ni de terceros sin usar (excepto el patrón: se detectaron 2 componentes locales muertos, no librerías).

## 12. Problemas arquitectónicos detectados

1. ~~`node_modules` roto / `virtualStoreDir` desfasado~~ → **REPARADO 18/09/2026**: el proyecto fue movido a `Frontend/` y `.modules.yaml` apuntaba `virtualStoreDir` a la carpeta padre (`...\Glowe Beauty
ode_modules\.pnpm`), dejando los junctions top-level rotos (`pnpm build` abortaba con `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY`). Se reparó ejecutando `pnpm install --frozen-lockfile --config.confirmModulesPurge=false`, que recreó `node_modules` con las versiones exactas del lockfile; `.modules.yaml` ahora apunta a `...\Glowe Beauty\Frontend
ode_modules\.pnpm`. Build (`pnpm build`), `pnpm dev` y `pnpm preview` verificados OK. Si el error reaparece, repetir ese comando (repara dependencias existentes; no añade nuevas).
2. **Capa de datos no real**: `httpClient` vestigial, `API_BASE_URL` definida pero inerte; toda la "API" es mock. Riesgo de confundir mock con realidad.
3. **Sin capa de catálogo compartida**: cada página re-fetchea el mismo array; no hay cache/contexto de productos ni loading/error states reales (solo `console.error`).
4. **TODO el estado comercial es transitorio**: carrito y favoritos en memoria; se pierden al recargar.
5. ~~**Componentes sin usar**~~ → **RESUELTO en FASE 1 (18/09/2026)**: `ui/Button.jsx` y `ui/Badge.jsx` son ahora el sistema atómico en uso; se eliminaron `useDisclosure` (hooks) y `getBundles` (api.js).
6. ~~**Duplicación de lógica**~~ → **PARCIALMENTE RESUELTO (FASE 1)**: el newsletter se unificó en `NewsletterForm` (Footer + SocialProof); sigue existiendo la lógica repetida "agregar al carrito + toast" en varios componentes (se normalizará en fases de e-commerce).
7. **Sin detalle de producto**: no hay ruta ni componente de ficha; las cards no llevan a nada.
8. **`GlowBackground` y blobs** bien aislados (no rompen documento), correcto según diseño.
9. **Artefactos legacy en la raíz**: `glowe_beauty_landing_page_completa.html` e `interactive_visual_im_*.html` no forman parte del bundle y pueden confundir; el primero es el prototipo monolítico de referencia visual.
10. **`Logo.png` de 1.2 MB** copiado en raíz y en `public/` (peso excesivo para favicon/logo; se puede optimizar).

## 13. Decisiones que deberían tomarse posteriormente

- **FASE 1 (diseño):** definir el Design System real (colores/espaciados/`buttons` únicos) y eliminar/absorber `Button.jsx`/`Badge.jsx`.
- **FASE 3 (catálogo):** unificar lectura de productos (contexto o hook con cache) y crear ruta de detalle.
- **FASE 4 (carrito):** persistencia en `localStorage` versionado; mover lógica de negocio fuera del componente `CartDrawer`.
- **FASES 6–7 (pedidos):** definir contrato de API (`/products`, `/orders`, `/newsletter`), sustituir mocks y definir payload de pedido → WhatsApp.
- **FASE 7 (backend):** decidir si Node (skills disponibles: `nodejs-backend-patterns`, `nodejs-best-practices`) o alternativa; definir esquema DB, auth y token de WhatsApp como secreto de backend únicamente.
- **QA/FASE 9:** añadir `pnpm lint` y `pnpm test`; hoy no existen.