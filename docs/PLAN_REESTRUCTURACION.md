# Propuesta de reestructuración de Glowe Beauty

Trabajo solo con el diagnóstico que adjuntaste, no con el código. Donde algo depende de lo que realmente hay en un archivo, lo marco como **[verificar]**. Asumo un equipo de 1 a 4 personas, probablemente con agentes de IA, que despliega en Vercel desde Windows.

---

## 1. Justificación del modelo

**Elección: monorepo pnpm ligero, Frontend feature-driven con dependencias unidireccionales y API pública por feature, y Backend sin tocar.**

El problema actual no es la falta de capas sino que el código está agrupado por tipo técnico (`components/`, `pages/`, `services/`, `context/`). Para añadir "favoritos" o "checkout" hay que editar 5 carpetas, y nada impide que `CartContext` importe `orderService` o que `api.js` importe a sus propios consumidores. La solución es agrupar por capacidad de negocio y hacer cumplir las reglas de dependencia con lint, no solo con convención.

| Alternativa | Por qué no |
|---|---|
| **Layered por tipo** (actual) | Es la causa de la deuda: alto acoplamiento entre carpetas, bajo entre responsabilidades. |
| **Hexagonal / Clean completa** | Casos de uso, puertos y adaptadores son ceremonia desproporcionada para un SPA que es un cliente delgado sobre REST. El Backend ya tiene una separación limpia en 4 capas. |
| **Feature-Sliced Design completo** | Sus 6-7 capas (`entities`, `widgets`, etc.) son demasiado para este tamaño. Tomo lo útil: capas, API pública y flujo unidireccional. |
| **Microfrontends / `packages/ui`** | Prematuro. Se reevalúa solo si aparece un segundo cliente, por ejemplo un admin como app separada. |
| **Backend modular por feature** | El Backend ya es limpio y es lo que menos conviene mover. Se queda como está. |

**Regla de dependencias (se verifica con ESLint):**

```text
app ──► features ──► shared
         features ↔ features: solo vía index.js (API pública) y formando un DAG, sin ciclos
shared nunca importa de features ni de app
```

**DAG de features propuesto:**

```text
shared
  ↑
auth · favorites · cart · newsletter      (hojas: no importan otras features)
  ↑
products                                  (usa cart, favorites)
  ↑
promotions · home                         (usan products)
  ↑
orders (usa cart, auth) → account (usa auth, orders)
  ↑
admin                                     (consumidor privilegiado: usa las APIs públicas de todas)
```

Hay dos trampas de ciclo que el diagnóstico no menciona y que este diseño evita:

- **`Favoritos.jsx` vive en `products/`, no en `favorites/`.** Necesita `ProductGrid`, y `ProductCard` necesita el botón de favorito. Si `favorites` importara `products` se crearía un ciclo.
- **`Perfil` es una feature `account` aparte.** Muestra el historial de órdenes, así que depende de `orders`, y `orders` depende de `auth`. Si estuviera dentro de `auth` habría un ciclo.

---

## 2. Árbol de directorios propuesto

Mantengo los nombres `Frontend/` y `Backend/`. Renombrarlos a `apps/web` y `apps/api` en Windows implica cambios solo de mayúsculas y reconfigurar el *Root Directory* en Vercel. No aporta nada a esta refactorización.

```text
Glowe Beauty/
├── .agents/                          # ÚNICA copia: skills/, skills-lock.json, rules/api-guard.md
├── .github/workflows/ci.yml          # NUEVO: install --frozen-lockfile, build FE, check+test BE
├── docs/                             # antes Recursos/
│   ├── ARCHITECTURE.md  DESIGN_SYSTEM.md  UX_FLOWS.md
│   ├── archive/                      # ROADMAP viejo de 10 fases, plaintext.md
│   └── adr/0001-feature-driven-frontend.md
├── package.json                      # NUEVO: scripts del workspace, packageManager fijado
├── pnpm-workspace.yaml               # MOVIDO desde Frontend/ (+ packages)
├── pnpm-lock.yaml                    # ÚNICO lockfile
├── .nvmrc  .editorconfig  .prettierrc  .gitignore
├── AGENTS.md  PROJECT_STATE.md  README.md  ROADMAP.md  LICENSE
│
├── Backend/                          # SIN CAMBIOS estructurales
│   ├── src/{config,routes,middleware,controllers,services,models}/ seed.js server.js
│   ├── tests/integration.test.js
│   └── package.json  vercel.json  .env.example   # sin pnpm-lock propio
│
└── Frontend/
    ├── index.html                    # <script src="/src/app/main.jsx">
    ├── vite.config.js  jsconfig.json  tailwind.config.js  postcss.config.js  vercel.json
    ├── eslint.config.js              # NUEVO: límites de capas, no-cycle, alias
    ├── .env.example  public/
    └── src/
        ├── styles/index.css
        │
        ├── app/                      # Composición: conoce todo, nadie lo importa
        │   ├── main.jsx
        │   ├── App.jsx               # <AppProviders><RouterProvider/></AppProviders>
        │   ├── AppProviders.jsx      # orden de providers fijo y documentado
        │   ├── router.jsx            # rutas con React.lazy; paths idénticos a los actuales
        │   ├── routes.js             # ROUTES.product(id), ROUTES.admin, ...
        │   └── layout/               # shell: depende de features, por eso NO está en shared
        │       ├── AppLayout.jsx  Header.jsx  Footer.jsx  MobileBottomNav.jsx
        │
        ├── shared/                   # Agnóstico al dominio
        │   ├── api/
        │   │   ├── httpClient.js     # apiRequest, ApiError, 401 vía callback
        │   │   └── tokenStorage.js   # get/set/clear + migración de claves legacy
        │   ├── config/
        │   │   ├── env.js            # ÚNICO lugar con import.meta.env
        │   │   └── storageKeys.js    # glowe:cart:v1, glowe:favorites:v1, glowe:token:v1
        │   ├── components/ui/        # Button Badge Input Card Pagination PillGroup QuantityStepper Reveal
        │   ├── hooks/                # useScrollY.js  useCountdown.js  usePageMeta.js
        │   ├── toast/                # ToastProvider.jsx  useToast.js
        │   └── utils/                # whatsapp.js  text.js (sanitizado UTF-8/Unicode)  format.js
        │
        └── features/
            ├── auth/
            │   ├── index.js          # AuthProvider, useAuth, ProtectedRoute, authService
            │   ├── context/AuthContext.jsx   hooks/useAuth.js
            │   ├── services/authService.js
            │   ├── guards/ProtectedRoute.jsx
            │   ├── components/{LoginForm,RegisterForm,MosaicLens}.jsx   # partidos de Auth.jsx
            │   └── pages/AuthPage.jsx
            ├── favorites/            # hoja: contexto + hook + FavoriteButton
            ├── cart/
            │   ├── index.js
            │   ├── context/CartContext.jsx   hooks/useCart.js
            │   ├── utils/cartTotals.js       # puro y testeable (subtotal, envío)
            │   └── components/CartDrawer.jsx
            ├── newsletter/           # NewsletterForm.jsx + services/subscriberService.js
            ├── products/
            │   ├── index.js
            │   ├── services/{productService,categoryService,tagService}.js
            │   ├── hooks/{useProducts,useProductSearch}.js
            │   ├── utils/variants.js                 # variantOptionsFor, detailsFor
            │   ├── components/{ProductCard,ProductGrid,SearchModal,FindYourGlow,
            │   │              CategoryPlayground,EditorialMakeup,HairCareSection}.jsx
            │   └── pages/{ProductPage,MakeupPage,HairPage,DiscoverPage,FavoritesPage}.jsx
            ├── promotions/
            │   ├── services/bundleService.js
            │   ├── fixtures/bundles.fixture.js       # temporal hasta que exista /api/bundles
            │   ├── components/{BundlesSection,GlowDeals}.jsx
            │   └── pages/{OffersPage,BundlesPage,BundleDetailPage}.jsx
            ├── orders/
            │   ├── services/orderService.js
            │   ├── hooks/useCheckout.js              # createOrder + clearCart + URL WhatsApp
            │   ├── components/{OrderSummary,OrderHistory}.jsx
            │   └── pages/CheckoutPage.jsx
            ├── account/pages/ProfilePage.jsx
            ├── home/
            │   ├── services/siteConfigService.js     # lectura; admin importa la escritura
            │   ├── components/{HeroSection,SocialProof,TrustBadges}.jsx
            │   └── pages/{HomePage,NotFoundPage}.jsx
            └── admin/
                ├── pages/AdminPage.jsx               # shell ≤150 líneas
                ├── tabs/
                │   ├── dashboard/   products/   categories/   tags/   offers/
                │   ├── orders/      payments/   users/        site-config/
                │   │   (cada una: XxxTab.jsx + Form/Columns/useXxx.js según haga falta)
                ├── components/{AdminModal,DataTable,StatusBadge,ActionButton}.jsx
                ├── hooks/useAdminResource.js         # estado list/create/update/delete genérico
                ├── services/{reportService,userService,paymentService}.js
                └── constants.js
```

**Responsabilidad por directorio y comunicación entre capas**

- **`app/`** monta providers, define el router y el layout. Es la única capa que puede importar de cualquier feature.
- **`shared/`** contiene lo que usan al menos dos features y no sabe de negocio. `shared/api/httpClient` es el único punto que hace `fetch`. El token se lee de `tokenStorage`, y el 401 se notifica mediante un callback que registra `AuthProvider`. Así `shared` no importa `auth`.
- **`features/x/`** es dueña de su contexto, servicios, componentes, páginas y utilidades. Solo exporta lo que otras necesitan a través de `index.js`.
- **Páginas**: viven dentro de su feature y son delgadas, porque componen y no contienen lógica. El router las carga con `lazy(() => import('@/features/x/pages/XPage'))`. Las páginas **no** se exportan desde el barrel, para no romper el code-splitting.
- **Dueño de cada servicio**: lo es la feature que lo consume en la tienda. Los servicios que usa solo el admin (`user`, `payment`) viven en `admin/services`. El admin los usa como consumidor privilegiado.
- **`variants.js`**: no va a `shared/utils`, como pedía la directiva, sino a `products/utils`. Solo lo usa `Producto.jsx` y es lógica de dominio. Una utilidad se promueve a `shared` cuando la usa una segunda feature.

---

## 3. Estrategia para los puntos críticos

### 3.1 Descomponer `Admin.jsx` (2,529 líneas)

El método es extraer por costuras, de lo más aislado a lo más acoplado, con un commit por extracción.

1. **Mapear costuras:** `Get-ChildItem Frontend\src\pages\Admin.jsx | Select-String -Pattern "^(function|const|export) [A-Z]"` (o `rg -n "^(function|const|export) [A-Z]" Frontend/src/pages/Admin.jsx`). Dibuja en papel qué bloques son componentes, cuáles son helpers y qué estado comparten.
2. **Hojas puras primero:** constantes, formateadores y datos mock van a `constants.js` o se eliminan. Los mocks hardcodeados del dashboard se reemplazan por métricas derivadas de `orders` o se quitan **[verificar con el dueño del producto]**.
3. **Componentes ya acoplados:** `AdminModal`, `DataTable`, `StatusBadge` y `ActionButton` pasan a `admin/components/` (Fase 6).
4. **`reportService.js`:** el código de PDF y Excel se aísla con `await import('jspdf')` y `await import('xlsx')` dentro de la función de exportación. Así ~500 kB salen del bundle inicial.
5. **Un tab por vez**, en este orden: `SiteConfig → Tags → Categories → Users → Payments → Orders → Offers → Products → Dashboard`. Cada tab no recibe props y obtiene sus datos con `useAdminResource`, y se pasa lo mínimo explícitamente. Los lookups compartidos, como las categorías en el formulario de producto, se refetchean al montar. Es simple y suficiente.
6. **Shell final:** `AdminPage` queda con la navegación de pestañas y `<ActiveTab/>`. En la Fase 9 las pestañas pasan opcionalmente a rutas anidadas `/admin/productos`, lo que permite enlaces directos y lazy por tab.

Reglas de cierre: ningún archivo de `features/**` supera 300 líneas (`max-lines` como warning) y ningún componente se define dentro de otro componente (provoca remontajes y pérdida de estado).

### 3.2 Dependencias circulares y mocks en `services/api.js`

1. Se crea `shared/api/httpClient.js` con `apiRequest`. Todos los servicios apuntan ahí, **no** a `./api`. Con eso desaparece el ciclo.
2. `api.js` pasa a ser una fachada **temporal**, con re-exports estáticos y sin `await import()`. Los consumidores migran por feature y el archivo se elimina cuando `rg "services/api"` no devuelva nada.
3. **Token:** una sola clave (`glowe:token:v1`) con migración de una vez. Si encuentra una de las 4 claves legacy, la copia a la nueva y la borra. Esa lectura de respaldo se elimina una o dos releases después.
4. **Mocks:**
   - `getGlowDeals` pierde el fallback a mocks. Las ofertas son productos con oferta activa vía API, y si la API falla se muestra un estado de error o vacío. Es un cambio de comportamiento visible, así que confírmalo.
   - `getComboById` y los combos: **el Backend no tiene modelo `Bundle`**, así que combos solo existe en `data/products.js`. Borrar ese archivo sin más rompe la sección. Propongo en dos pasos: durante la refactorización los combos pasan a `promotions/fixtures/bundles.fixture.js`, con el nombre del archivo declarando que es temporal, tras `bundleService`. Después, como ticket aparte, se crea `Bundle` y `/api/bundles` en el Backend. No conviene mezclar un feature nuevo del Backend con esta migración.

```js
// shared/api/httpClient.js (esqueleto)
import { env } from '@/shared/config/env'
import { getToken } from './tokenStorage'

let onUnauthorized = () => {}
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn }

export async function apiRequest(path, { method = 'GET', body, auth = true, signal } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = auth ? getToken() : null
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${env.API_URL}${path}`, { method, headers, signal,
    body: body ? JSON.stringify(body) : undefined })
  const json = await res.json().catch(() => null)
  if (res.status === 401) onUnauthorized()
  if (!res.ok || json?.success === false) throw new ApiError(json?.message ?? res.statusText, res.status)
  return json?.data
}
```

### 3.3 Código muerto y `src/data/`

| Elemento | Decisión |
|---|---|
| `Navbar.jsx`, `FavoritesDrawer.jsx` | Eliminar, tras buscar el nombre **y** el fragmento de ruta (`import(`, docs). `knip` ayuda a confirmar. |
| `data/contact.js` | Se divide en `shared/utils/whatsapp.js` y `shared/utils/text.js`. |
| `data/variants.js` | A `features/products/utils/variants.js`. |
| `data/products.js` (468 líneas) | **[verificar]** con `rg "data/products"` qué exporta cada consumidor. Los bundles van al fixture y el resto se elimina. |
| `hooks/index.js` | Se parte en 3 archivos. Se elimina el barrel y los imports pasan al archivo concreto. |
| `ProtectedRoute` | A `features/auth/guards/`. |
| `MosaicLens` | A `features/auth/components/`, cargado con lazy si no es crítico para el primer render. |
| `Frontend.zip`, `interactive_visual_im_*.html`, `dist/` | `git rm --cached`, entrada en `.gitignore`. Revisa también el historial si pesan mucho. |
| `Backend/.agents/api-guard.md` | **No es una copia**, es contenido único. Muévelo a `.agents/rules/api-guard.md` antes de borrar la carpeta. |
| `pnpm-workspace.yaml` de Frontend | Se mueve a la raíz **fusionando** su `allowBuilds`, sin renombrar la clave, porque depende de tu versión de pnpm. |

### 3.4 Estándar de importaciones

- `@/` para todo lo que cruza carpetas.
- `./` solo para archivos hermanos en la misma carpeta.
- `../` prohibido (lint). Es matizable respecto a la directiva "todo con `@/`": prohibir también `./` en hermanos solo añade verbosidad sin ganancia.
- Entre features solo se importa `@/features/x` (el barrel). Lo hace cumplir `eslint-plugin-boundaries` con la regla `entry-point`, o `import/no-restricted-paths` con zonas.
- Dentro de una feature nunca se importa su propio `index.js`. Es la causa típica de ciclos.

```js
// Frontend/eslint.config.js (extracto)
rules: {
  'no-restricted-imports': ['error', { patterns: [{ group: ['../*'], message: 'Usa @/ o ./' }] }],
  'import/no-cycle': 'error',
  'import/no-restricted-paths': ['error', { zones: [
    { target: './src/shared',   from: './src/features' },
    { target: './src/shared',   from: './src/app' },
    { target: './src/features', from: './src/app' },
    // generar una zona por feature hoja (auth, cart, favorites, newsletter) hacia las demás
  ]}],
  'max-lines': ['warn', { max: 300, skipComments: true, skipBlankLines: true }],
}
```

El orden importa: **primero se convierte `../` a `@/` y después se mueven los archivos**. Con imports absolutos, mover un archivo solo obliga a actualizar quienes lo importan, y no a reescribir sus propios imports.

---

## 4. Plan por fases

Reglas generales: una rama y un PR por fase; los `git mv` van en commits separados de los cambios de lógica, para que el historial siga a los archivos; etiqueta `pre-refactor` antes de empezar.

**Gate estándar** (se repite en cada fase):

```powershell
pnpm install --frozen-lockfile
pnpm --filter ./Frontend build
pnpm --filter ./Backend check
pnpm --filter ./Backend test
```

**Smoke test manual (S)**, que debe pasar al final de cada fase:

1. `/` carga sin errores en consola.
2. La búsqueda del Header devuelve resultados.
3. Categoría: ordenar, filtrar y paginar.
4. PDP: elegir variante, añadir al carrito, y el drawer muestra subtotal y envío.
5. Favorito y carrito persisten tras recargar.
6. Registro, login y logout; la sesión sobrevive a F5 y una ruta protegida redirige.
7. Checkout crea la orden y abre la URL de WhatsApp correcta; el carrito se vacía.
8. Admin: cada tab lista, crea, edita y borra un registro de prueba; exporta Excel y PDF.
9. F5 en `/producto/:id` (rewrite del SPA).
10. Combos y detalle de combo.

### Fase 0: Red de seguridad
- **Objetivo:** poder comparar antes y después.
- **Cambios:** tag `pre-refactor`; `.github/workflows/ci.yml`; `git config core.ignorecase false`; guardar el tamaño de cada chunk de `pnpm build` en `docs/adr/baseline-build.txt`.
- **Verificación:** la CI corre en Linux y pasa; S pasa y queda documentado.

### Fase 1: Higiene del monorepo
- **Objetivo:** un solo workspace, un solo lockfile, sin basura.
- **Cambios:**
  - Crear `package.json` raíz con `"private": true` y `"packageManager": "pnpm@<tu versión>"`. Scripts: `dev` = `pnpm -r --parallel --stream dev`, y `build`, `check`, `test` con `pnpm -r`.
  - Mover y fusionar `pnpm-workspace.yaml`.
  - Borrar los `pnpm-lock.yaml` de `Frontend/` y `Backend/`. Ejecutar `pnpm install` en la raíz y commitear el único lockfile.
  - Unificar `.agents/`, moviendo `api-guard.md` a `.agents/rules/`.
  - Limpiar binarios y ampliar `.gitignore`.
  - `Recursos/` pasa a `docs/`, con el ROADMAP duplicado en `docs/archive/`.
- **Verificación:** el gate estándar y `pnpm dev` levantando ambos. **Antes de mergear**, un deploy de preview de Frontend y de Backend en Vercel, para confirmar que el install resuelve el lockfile de la raíz.

### Fase 2: Alias y lint (sin mover archivos)
- **Objetivo:** dejar listo el terreno para mover archivos sin romper imports.
- **Cambios:** `eslint.config.js` (reglas en `warn`, anota el recuento inicial); codemod mecánico `../x` → `@/x` en todo `src/`; `no-restricted-imports` para `../` pasa a `error`.
- **Verificación:** gate estándar, S, y el diff solo contiene especificadores de import.

```powershell
Get-ChildItem Frontend\src -Recurse -Include *.js,*.jsx | Select-String -Pattern "from '\.\./"   # debe dar 0
```

### Fase 3: Código muerto
- **Objetivo:** reducir el área antes de mover.
- **Cambios:** eliminar `Navbar.jsx` y `FavoritesDrawer.jsx`.
- **Verificación:** `rg "Navbar|FavoritesDrawer" Frontend` solo devuelve docs; `pnpm dlx knip` no lista nuevos huérfanos; gate estándar.

### Fase 4: Capa HTTP y fin del ciclo
- **Objetivo:** eliminar la circularidad `api.js` ↔ servicios.
- **Cambios:** crear `shared/config/{env,storageKeys}.js`, `shared/api/{httpClient,tokenStorage,ApiError}.js`; los 8 servicios usan `httpClient`; `AuthProvider` registra `setUnauthorizedHandler`; `api.js` queda como fachada estática.
- **Verificación:** `pnpm dlx madge --circular --extensions js,jsx --ts-config Frontend/jsconfig.json Frontend/src` reporta 0 ciclos en servicios. Con una sesión iniciada antes de desplegar, un F5 no cierra la sesión y la pestaña Network muestra las mismas requests que en la línea base. Después, S.

### Fase 5: `src/data/` y mocks
- **Objetivo:** que ningún dato mock alimente producción.
- **Cambios:** crear `shared/utils/{whatsapp,text}.js`, `features/products/utils/variants.js`, `features/promotions/{fixtures,services}`; `getComboById` y `getGlowDeals` quitan el `import('../data/products')`; eliminar `data/`.
- **Verificación:** `rg "data/(products|contact|variants)" Frontend/src` da 0 resultados; Combos y detalle funcionan (S.10); apagar el Backend en local muestra estados de error o vacío, nunca datos falsos.

### Fase 6: Design system y shared
- **Objetivo:** separar lo reutilizable de lo específico.
- **Cambios:** átomos a `shared/components/ui/`; `AdminModal`, `DataTable`, `StatusBadge` y `ActionButton` a `features/admin/components/`; `MosaicLens` a `features/auth/components/`; `hooks/index.js` partido en 3 archivos; `ToastContext` a `shared/toast/`.
- **Verificación:** gate estándar, S, y revisión visual de Home, PDP, Auth y Admin.

### Fase 7: Features de dominio (un PR por feature)
- **Orden:** `auth → favorites → cart → newsletter → products → promotions → orders → account → home`.
- **Cambios por feature:** crear carpeta; `git mv` de contexto, servicio, componentes y páginas; `index.js` con solo la API pública; las páginas pasan a default export.
- **Casos especiales:**
  - **Cart/orders:** se quita `createOrder` de `CartContext`. El nuevo hook `orders/hooks/useCheckout.js` llama a `createOrder`, luego a `clearCart()`, y devuelve la URL de WhatsApp. **[verificar]** con el grep que hiciste qué función de `CartContext` lo usa.
  - **Newsletter:** el diagnóstico no lista un `subscriberService` en el Frontend aunque el Backend tiene `/api/newsletter`. **[verificar]** cómo se llama hoy desde `NewsletterForm`/`Footer`.
  - **Header/búsqueda:** `Header` deja de recibir `products` por props desde `App`. `useProductSearch` hace el fetch al abrir la búsqueda, lo que también elimina una request al cargar.
- **Cierre de fase:** cuando `rg "services/api"` dé 0, se elimina `api.js`.
- **Verificación por PR:** gate estándar, S, y `import/no-restricted-paths` sin violaciones en la feature recién movida.

### Fase 8: Descomposición de Admin
- **Objetivo:** que ningún archivo del admin supere 300 líneas.
- **Cambios:** seguir 3.1. Un commit por tab, con `reportService` primero. Cada tab se mueve con su estado completo al archivo nuevo, sin retoques de lógica.
- **Verificación por tab:** build + S.8 solo para esa tab (CRUD completo). Al final, `Admin.jsx` ya no existe y el chunk de admin queda separado.

### Fase 9: App shell y router
- **Objetivo:** que `pages/` y `App.jsx` desaparezcan.
- **Cambios:** crear `app/{main,App,AppProviders,router,routes}.jsx` y `app/layout/*`; actualizar `index.html`; rutas con `lazy` + `Suspense`; las pestañas del admin pasan opcionalmente a rutas anidadas; eliminar `src/pages/`, `src/context/`, `src/services/`, `src/components/`.
- **Importante:** `AppProviders` mantiene exactamente el orden actual de providers.
- **Verificación:** S completo; `pnpm build` muestra el chunk principal más pequeño que la línea base de la Fase 0 y `jspdf`/`xlsx` ausentes del chunk inicial; F5 en rutas profundas funciona.

### Fase 10: Endurecimiento y cierre
- **Cambios:** todas las reglas de lint a `error`; `madge --circular` en la CI; eliminar la lectura de claves legacy del token; Vitest con pruebas de `whatsapp`, `variants` y `cartTotals` (ahora son funciones puras); actualizar `ARCHITECTURE.md`, `AGENTS.md` y `PROJECT_STATE.md` con la regla de dependencias, y ADR 0001.
- **Verificación:** CI verde en Linux y `pnpm test` ejecutando las pruebas nuevas.

---

## 5. Matriz de prevención de errores

| Riesgo | Síntoma | Prevención |
|---|---|---|
| **Tailwind no encuentra clases tras mover** | Build correcto pero UI sin estilos o sin los colores `glowe-*` | Mantén `content: ['./index.html','./src/**/*.{js,jsx}']`. Tailwind v3 resuelve rutas desde el *cwd*, así que ejecuta siempre con `pnpm --filter ./Frontend`, o usa `content: { relative: true, files: [...] }`. Las clases armadas con template strings no se detectan: mantén el `safelist`. |
| **`index.html` apunta al `main.jsx` viejo** | Dev: 404 en `/src/main.jsx`; build: `Could not resolve entry module` | Actualiza el `<script src>` a `/src/app/main.jsx` en la misma PR que mueve el archivo. |
| **Alias solo en `jsconfig`, o duplicado distinto** | `Failed to resolve import "@/…" from "…". Does the file exist?` o el editor resuelve y Vite no | La fuente de verdad es `vite.config.js`. `jsconfig.json` solo sirve al editor. Configura el resolver de ESLint con el mismo alias. |
| **Mayúsculas y minúsculas (Windows → Linux)** | Funciona local; Vercel falla con `Could not resolve './Button'` | `core.ignorecase false`; renombrar con `git mv` en dos pasos; CI en Linux desde la Fase 0. |
| **Variables `.env` mal ubicadas o mal leídas** | `undefined/api/...`, o peticiones que devuelven `index.html` y `Unexpected token '<' in JSON` | `.env` sigue en `Frontend/`; `import.meta.env` solo se lee en `shared/config/env.js`, que lanza error al arrancar si falta `VITE_API_URL`. |
| **Ciclos en barrels (`index.js`)** | `ReferenceError: Cannot access 'X' before initialization`, pantalla en blanco o `X is not a function` | Barrels solo con API pública, sin `export *`; nunca importar el propio `index.js`; `import/no-cycle: error`; `madge --circular` en la CI. |
| **Barrel de admin rompe el code-splitting** | Aviso `Some chunks are larger than 500 kB`; `jspdf`/`xlsx` en el chunk inicial | Páginas fuera de los barrels; `lazy` en el router; `import()` dinámico en `reportService`. Compara contra la línea base. |
| **Orden de providers alterado** | `useAuth must be used within AuthProvider` (o similar) al arrancar | `AppProviders` copia el orden actual de `App.jsx`. Cualquier cambio, en PR aparte. |
| **`React.lazy` con export nombrado** | `Element type is invalid. Received a promise that resolves to: undefined` | Las páginas usan `export default`, o `.then(m => ({ default: m.X }))`. |
| **Claves de `localStorage` cambiadas** | Sin error: los usuarios pierden carrito, favoritos o sesión tras el deploy | `storageKeys.js` con los mismos valores; una prueba que verifique las 3 claves. |
| **Retirar claves legacy del token demasiado pronto** | Sesiones antiguas dan 401 o bucle de logout | Primero migrar y borrar, y quitar el respaldo una o dos releases después; el handler de 401 cierra sesión una sola vez. |
| **`import()` dinámico con rutas viejas** | `Failed to fetch dynamically imported module` solo en ejecución, no en lint | Busca también `import(` con `rg`, no solo `from`. Elimina los dinámicos de `api.js` en la Fase 4. |
| **Lockfile único / workspace** | `ERR_PNPM_OUTDATED_LOCKFILE` en Vercel, o `Ignored build scripts` | `pnpm install` en la raíz y commitear un único lockfile; fusionar `allowBuilds`; verificar un deploy de preview de ambos proyectos **antes** de mergear la Fase 1. |
| **Root Directory de Vercel o rewrites** | 404 al refrescar `/producto/:id`, o build que no encuentra `package.json` | `Frontend/vercel.json` no se mueve; el Root Directory sigue siendo `Frontend` y `Backend`; S.9 en cada preview. |
| **Cambio accidental de URLs** | 404 y pérdida de SEO (`sitemap.xml` es estático) | Los paths en `routes.js` quedan idénticos aunque los archivos cambien de nombre; revisar `sitemap.xml` en la Fase 9. |
| **Borrar código "muerto" que se usa** | `Failed to resolve import` en el build | Busca nombre y fragmento de ruta, incluyendo `import(`, y contrasta con `knip`. |
| **Quitar el fallback de mocks** | Páginas vacías o `Cannot read properties of undefined (reading 'find')` | Fixtures para combos; estados vacío y error explícitos en las páginas afectadas (Fase 5). |
| **Búsquedas incompletas en PowerShell** | `Select-String -Path "src\**\*.jsx"` no recorre todos los niveles: los conteos del diagnóstico pueden estar subestimados | Usa `Get-ChildItem -Recurse -Include *.js,*.jsx \| Select-String ...` o `rg`. |
| **Closures al extraer tabs de `Admin.jsx`** | `ReferenceError: x is not defined` o estado que se resetea al abrir una tab | `no-undef` activo; extraer con props explícitas; no declarar componentes dentro de componentes. |

---

## Fuera de alcance (backlog)

- Modelo `Bundle` y `/api/bundles` en el Backend.
- Unificar `MakeupPage` y `HairPage` en una `CategoryPage` por slug.
- TanStack Query para reemplazar los `useEffect` de carga.
- `xlsx@0.18.5` es la última versión publicada en npm y tiene CVEs conocidos al *leer* archivos. Como aquí solo se usa para exportar el riesgo es bajo, pero conviene evaluar SheetJS desde su CDN o `exceljs`.
- Migración gradual a TypeScript, que esta estructura facilita.