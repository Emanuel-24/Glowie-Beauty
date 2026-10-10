# ADR-0001: Arquitectura Frontend Feature-Driven, App Shell y Capas Desacopladas

- **Fecha:** 09/10/2026
- **Estado:** Aceptada e Implementada (Fase 10 - Plan de Reestructuración)
- **Ámbito:** `Frontend/` (SPA React 18 + Vite 5 + React Router 7 + Tailwind 3)

---

## 1. Contexto y Problema

En el diagnóstico inicial previo a la reestructuración (Fase 0), el frontend de Glowe Beauty presentaba problemas de arquitectura, rendimiento y mantenibilidad:

1. **Dependencias circulares:** `src/services/api.js` importaba dinámicamente y estáticamente a los 8 servicios de dominio, y estos a su vez importaban a `api.js` para acceder a helpers y token storage.
2. **Monolito de Administración:** `src/pages/Admin.jsx` concentraba 2,529 líneas de código en un solo archivo, mezclando 8 pestañas de gestión, llamadas a endpoints, control de modales y bibliotecas de exportación pesadas (`jspdf` y `xlsx`).
3. **Sobredimensionamiento del Bundle Inicial:** El archivo principal `index.js` pesaba **1,245.71 kB** (401.93 kB gzip) debido a la ausencia de code-splitting en rutas y la inclusión estática de `jspdf`, `xlsx` y `html2canvas` en el chunk inicial.
4. **Mocks estáticos en producción:** `src/data/products.js` (468 líneas) alimentaba vistas de catálogo y combos mediante importaciones estáticas que enmascaraban el estado real de la API.
5. **Estructura plana y sin límites de capa:** Carpetas planas en `src/` (`components/`, `pages/`, `services/`, `context/`, `data/`) sin aislamiento entre dominios ni protección de límites arquitectónicos.

---

## 2. Decisión Arquitectónica

Se adopta una **Arquitectura Feature-Driven (Domain-Driven UI)** estructurada estrictamente en 4 capas de primer nivel bajo `Frontend/src/`:

```
Frontend/src/
├── app/          # App Shell, providers, router lazy y layout global
├── features/     # Módulos de dominio autónomos con API pública (barrels)
├── shared/       # Primitivas transversales reutilizables y agnósticas
└── styles/       # CSS global y utilidades de Tailwind
```

### 2.1. Capa `app/` (App Shell)
- **`main.jsx`**: Punto de entrada de la aplicación montado en `#root`.
- **`App.jsx`**: Componente raíz con el árbol de providers y enrutador.
- **`AppProviders.jsx`**: Composición ordenada de providers de contexto (`AuthProvider`, `CartProvider`, `FavoritesProvider`, `ToastProvider`).
- **`routes.js`**: Definición centralizada de metadatos y rutas del sistema.
- **`router.jsx`**: Enrutador declarativo con `React.lazy()` y `Suspense` para todas las páginas y pestañas pesadas.
- **`layout/`**: Shell visual unificado (`AppLayout.jsx`, `Header.jsx`, `Footer.jsx`, `MobileBottomNav.jsx`).

### 2.2. Capa `features/` (Módulos de Dominio)
Cada dominio reside en su propia carpeta bajo un grafo acíclico dirigido (DAG) estricto:
- **Features Hoja (sin dependencias entre features):**
  - `auth/` (Login, registro, recuperación, perfil, token y `ProtectedRoute`).
  - `favorites/` (Gestión y persistencia local de favoritos).
  - `cart/` (Carrito, drawer, cálculo de totales desacoplado).
  - `newsletter/` (Captura de suscriptores y servicio).
- **Features de Catálogo y Promociones:**
  - `products/` (Catálogo, PDP, búsqueda, filtros, variantes y fixtures).
  - `promotions/` (Combos, kits, Glow Deals y cronómetro de ofertas).
- **Features de Conversión y Experiencia:**
  - `orders/` (Checkout autenticado, hook orquestador `useCheckout`, pasarela asistida por WhatsApp).
  - `account/` (Perfil de usuario y visualización de historial de pedidos).
  - `home/` (Landing principal, hero dinámico, social proof y métricas).
  - `admin/` (Panel modular descompuesto en 8 tabs independientes con carga diferida de reportes).

### 2.3. Capa `shared/` (Componentes y Utilidades Transversales)
- **`shared/api/`**: Cliente HTTP desacoplado (`httpClient.js`, `tokenStorage.js`, `ApiError.js`). Manejo centralizado de errores 401 vía callback (`setUnauthorizedHandler`), y almacenamiento atómico del token canónico (`glowe:token:v1`).
- **`shared/config/`**: Lectura y validación centralizada de variables de entorno (`env.js`) y claves de persistencia (`storageKeys.js`).
- **`shared/components/ui/`**: Átomos y moléculas del design system (`Button`, `Input`, `Badge`, `Card`, `Pagination`, `PillGroup`, `QuantityStepper`, `Reveal`).
- **`shared/hooks/`**: Hooks transversales (`useCountdown`, `usePageMeta`).
- **`shared/toast/`**: Sistema desacoplado de notificaciones toast.
- **`shared/utils/`**: Funciones puras de integración y formateo (`whatsapp.js`, `text.js`).

---

## 3. Reglas de Límites de Capa y Calidad (Gobernanza)

1. **Límites de Importación (ESLint):**
   - `shared` **NO** puede importar módulos de `features` ni de `app`.
   - `features` **NO** puede importar módulos de `app`.
   - El consumo de una feature desde otra debe realizarse a través de su punto de entrada público (`@/features/<nombre>`), evitando acoplamientos internos.
2. **Prohibición de imports relativos ascendentes:** Todos los módulos usan `@/` (alias absoluto mapeado a `src/`), erradicando `../`.
3. **Cero Dependencias Circulares:** Verificación estricta mediante `madge --circular` integrada en el pipeline de CI.
4. **Pruebas Unitarias Nativas:** Suite de pruebas con el Node.js test runner (`node:test`, `node:assert/strict`) y un loader de alias para validar la lógica pura (`cartTotals`, `variants`, `whatsapp`) sin añadir dependencias de prueba a producción.

---

## 4. Consecuencias y Métricas Comparativas

| Métrica | Fase 0 (Pre-Refactor) | Fase 10 (Post-Refactor) | Impacto |
|---|---|---|---|
| **Tamaño Chunk Principal JS** | 1,245.71 kB | **297.07 kB** | **-76.15% (reducción masiva)** |
| **Gzip Chunk Principal** | 401.93 kB | **95.38 kB** | **-76.27%** |
| **Code Splitting / Chunks** | 6 chunks planos | **32 chunks bajo demanda** | Carga granular por ruta |
| **Librerías PDF/Excel (`jspdf`, `xlsx`)** | En bundle principal | En chunks dinámicos aislados | No penalizan a clientes |
| **Ciclos Circulares (Madge)** | Múltiples (api ↔ servicios) | **0 ciclos detectados** | 100% desacoplado |
| **Líneas del archivo Admin** | 2,529 líneas (`Admin.jsx`) | **8 tabs modulares (<300 líneas c/u)** | Mantenibilidad alta |
| **Pruebas Unitarias Frontend** | 0 pruebas | **29 pruebas automáticas** | 100% aprobadas |
| **Pruebas de Integración Backend** | 15 pruebas | **15 pruebas automáticas** | 100% aprobadas |
| **Verificación CI (GitHub Actions)** | Verificación básica | **Gate completo (build, check, test, madge)** | Integración continua sólida |
