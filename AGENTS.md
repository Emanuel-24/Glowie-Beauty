# AGENTS.md — GLOWE BEAUTY

Reglas permanentes del proyecto. Todos los agentes y desarrolladores deben leerlas **antes** de modificar cualquier parte del repositorio.

---

## 1. Proyecto

- **Glowe Beauty** — tienda e-commerce comercializadora y distribuidora multimarca de maquillaje y cuidado capilar (Colombia, COP). Vende productos 100% originales de marcas aliadas reconocidas (Trendy, Montoc, Ame, Olaplex, L'Oréal, Maybelline, etc.); no es fabricante ni laboratorio propio.
- El código fuente de la app vive en `Frontend/`. El repositorio puede crecer a futuro con backend, base de datos y panel administrativo.
- **Prioridad 1: experiencia del cliente / frontend.** Toda decisión técnica debe proteger: velocidad de carga, claridad visual, responsive y flujo de compra simple (catálogo → carrito → pedido por WhatsApp).
- La estrategia por fases está documentada en `docs/ROADMAP.md`. Trabaja solo dentro de la fase activa solicitada.

## 2. Package manager obligatorio: PNPM

- **PNPM es el único package manager permitido.** Nunca usar `npm`, `yarn` ni `bun` para instalar, actualizar, ejecutar scripts ni generar locks.
- Todos los comandos se ejecutan como `pnpm <script>` (ej. `pnpm dev`, `pnpm build`).
- El único lockfile válido es `pnpm-lock.yaml`. Si aparece `package-lock.json`, `yarn.lock`, `bun.lock`, etc., **reportarlo como hallazgo**; no borrarlo sin aprobación previa.
- No mezclar versiones de node/npm en la documentación: el proyecto usa Node v22+ y pnpm 11 (visto en auditoría).
- **`node_modules` fue reparado en FASE 0 (18/09/2026)**: el proyecto había sido movido a `Frontend/` y el `virtualStoreDir` quedaba apuntando a la carpeta padre. Se reparó con `pnpm install --frozen-lockfile --config.confirmModulesPurge=false`. Si vuelve a aparecer `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY` al ejecutar `pnpm dev/build`, repetir ese comando (reparación; no añade dependencias) y reportar.

## 3. Arquitectura (resumen)

- SPA en React 18 + Vite + React Router 7 + Tailwind CSS 3.
- Capas en `src/`:
  - `app/` → App Shell, punto de montaje (`main.jsx`), providers (`AppProviders.jsx`), rutas (`routes.js`), enrutador lazy con code-splitting (`router.jsx`) y layout global (`layout/AppLayout.jsx`, Header, Footer, MobileBottomNav).
  - `features/` → módulos de dominio autónomos (`account/`, `admin/`, `auth/`, `cart/`, `favorites/`, `home/`, `newsletter/`, `orders/`, `products/`, `promotions/`) con sus páginas, componentes, servicios y hooks.
  - `shared/` → utilidades transversales agnósticas: cliente HTTP (`shared/api/`), configuración (`shared/config/`), átomos del design system (`shared/components/ui/`), toasts (`shared/toast/`) y utilidades puras (`shared/utils/`).
  - `styles/` → CSS global + utilidades Tailwind.
- Detalle completo en `docs/ARCHITECTURE.md`.

## 4. Reglas para modificar código

- **No implementar funcionalidades fuera del alcance solicitado.** Si una tarea pide documentar o auditar, no programar. Si pide una feature, no hacer otra.
- Revisar siempre `docs/ROADMAP.md` para saber qué fase está en curso.
- Mantener el estilo de archivo existente: componentes en `.jsx`, imports sin extensión (ej. `import App from './App'`), componentes con `export default`.
- No dejar código comentado "por si acaso". El dead code detectado se **reporta** y solo se elimina con autorización previa del usuario (ver sección 17).
- Al agregar estado global nuevo, seguir el patrón Provider ya existente (`createContext` + hook `useX()` que valida el provider).
- No añadir dependencias sin autorización explícita. Si una feature lo requiere, justificarlo antes.
- Las variables de entorno usan prefijo `VITE_` (ver `Frontend/.env.example`).

## 5. Reutilización de componentes

- Extraer partes repetidas a `shared/components/ui/` o subcomponentes de feature en lugar de duplicar JSX.
- El newsletter ya está unificado en `features/newsletter/components/NewsletterForm.jsx`: todo formulario de suscripción debe usar este componente, no duplicar lógica.
- Evitar componentes monolíticos con muchos `props` booleanos; preferir composición (ver skill `composition-patterns`).
- **Design system en uso:** botones→`shared/components/ui/Button.jsx`, etiquetas→`Badge.jsx`, inputs→`Input.jsx` (y `.glass-input`), superficies→`Card.jsx`. Preferir estos atómicos antes que clases inline repetidas.

## 6. Responsive design

- Mobile-first. Las utilidades Tailwind se escriben para `mobile` y se escalan con `sm:`, `md:`, `lg:`.
- La navegación móvil se apoya en `MobileBottomNav` (solo `md:hidden`); el menú de escritorio se oculta en móvil.
- Probar siempre: 375px (móvil), 768px (tablet), 1024px+ (desktop). Evitar scroll horizontal en cualquier viewport.
- No romper el layout con elementos fijos (`GlowBackground`, blobs) — están diseñados para no alterar el alto del documento.

## 7. Accesibilidad

- Botones icon-only deben llevar `aria-label` (y `title` cuando aporte). Ya se usa en este proyecto; mantenerlo.
- Las etiquetas `<button>` deben ser accionables por teclado (Enter/Espacio) y con `focus-visible`.
- Modales/drawers (Carrito, Búsqueda): deben ser cerrables (X, click en overlay) y no dejar foco atrapado; no bloquear el scroll del fondo sin necesidad real.
- Imágenes con `alt` descriptivo. Texto y color: mantener contraste suficiente; no transmitir significado solo por color.
- No usar emojis como único medio de comunicación de estado crítico (ej. confirmaciones de pedido) sin texto acompañante.
- Ver skill `accessibility`.

## 8. Manejo de secretos

- Nunca commitear `.env`. Ya está en `.gitignore`.
- Mantener `Frontend/.env.example` con las mismas variables (sin valores reales).
- Los secretos del backend (token WhatsApp, claves de pago, DB) **nunca** deben llegar al frontend; solo exponer lo necesario vía `VITE_*` (y no exponer secretos ni en `VITE_*` salvo que sea estrictamente público).
- No loguear tokens, emails completos innecesariamente ni datos sensibles.

## 9. Testing

- Hoy **no existe** suite de tests ni script de lint (verificado en FASE 0). No asumir su existencia.
- Al implementar, ejecutar la verificación disponible: `pnpm build`.
- Si en el futuro se agregan `pnpm lint` / `pnpm test`, es **obligatorio** correrlos antes de declarar terminada una tarea.
- La validación mínima de cada cambio de UI: sin errores en consola, estados vacío/loading/error contemplados, y flujo carrito/favoritos intacto.

## 10. Validación antes de finalizar

1. `pnpm build` pasa sin errores (o, si el entorno está roto, reportarlo y no fingir éxito).
2. Revisar que no se hayan tocado archivos fuera del alcance.
3. Si se modificó estado/carrito/pedidos, revisar que no se pierda comportamiento de los contextos.
4. Actualizar la documentación afectada (`docs/`) y, si cambió la arquitectura, `AGENTS.md`.

## 11. Uso de `.agents/skills`

- Las skills del proyecto viven en `Frontend/.agents/skills/`. Están registradas en `Frontend/skills-lock.json`.
- Cargar **solo** la skill relevante a la tarea (ej. `react-best-practices`, `composition-patterns`, `tailwind-css-patterns`, `frontend-design`, `accessibility`, `seo`, `vite`, `deploy-to-vercel`). No leer todas indiscriminadamente.
- **Nunca ejecutar un script de una skill sin inspeccionar antes qué hace.** Las scripts de deploy (`deploy.sh`, `deploy-codex.sh`) requieren revisión y una fase habilitada para deploy.
- Las skills son guías; si contradicen una regla de este archivo, prevalece `AGENTS.md` salvo decisión explícita del usuario.

## 12. Uso de `/docs`

- La documentación técnica vive en `docs/`:
  - `docs/ARCHITECTURE.md` — arquitectura real y decisiones.
  - `docs/DESIGN_SYSTEM.md` — sistema visual actual vs objetivo.
  - `docs/UX_FLOWS.md` — flujos de usuario actuales vs objetivo.
  - `docs/ROADMAP.md` — fases 0–9 y criterios de terminación.
- Actualizar el documento correspondiente cuando una fase cambie el estado real del sistema. No duplicar contenido en varios archivos.
- La documentación describe el estado **real**; marcar explícitamente IMPLEMENTADO / PARCIAL / MOCK / NO IMPLEMENTADO.

## 13. Prohibiciones generales

- No cambiar de package manager.
- No instalar dependencias sin autorización.
- No implementar features fuera del alcance de la tarea/fase.
- No borrar lockfiles de otros managers sin aprobación.
- No commitear sin petición explícita.

---

## 14. Stack tecnológico exacto (detectado en FASE 1)

> Versiones tomadas de `Frontend/package.json` y `Backend/package.json` (rangos semver). Runtime: Node v22+, pnpm 11.

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend | React / React DOM | ^18.3.1 |
| Frontend | Vite / `@vitejs/plugin-react` | `vite` ^5.4.11 / plugin ^4.3.4 |
| Frontend | React Router (`react-router-dom`) | ^7.18.3 |
| Frontend | Tailwind CSS + PostCSS + Autoprefixer | ^3.4.17 / ^8.4.49 / ^10.4.20 |
| Frontend | UI/animación/utilidades | `lucide-react` ^1.47.0, `gsap` ^3.15.0, `@uiball/loaders` ^1.3.1, `jspdf` ^4.2.1, `xlsx` ^0.18.5 |
| Backend | Node.js (ESM, `"type": "module"`) + Express | ^4.21.2 |
| Backend | Autenticación | `jsonwebtoken` ^9.0.2, `bcryptjs` ^2.4.3 |
| Backend | Utilidades | `cors` ^2.8.5, `dotenv` ^16.4.5 |
| Base de datos | MongoDB (Atlas) vía Mongoose | ^9.10.1 |
| Despliegue | Vercel (`vercel.json` en Frontend y Backend) | — |
| Lenguaje | **JavaScript** (no hay TypeScript ni `tsconfig`) | — |

- Estructura de repo: `Frontend/` (SPA), `Backend/` (API REST Express), `Recursos/` (documentación y material de apoyo), `Proyecto/` (material auxiliar), `ROADMAP.md` y `PROJECT_STATE.md` (memoria del agente).
- **No hay** suite de tests, linter ni script `check` todavía (se abordan en FASE 3 y 5).
- Corrección de nomenclatura: la sección 3 menciona `docs/`; en el estado actual la documentación técnica vive en `Recursos/` (no existe `docs/` en la raíz). Hasta decisión de FASE 2, buscar allí.

## 15. Convenciones de código

- **Componentes React:** PascalCase, funcionales (hooks), un componente por archivo, `export default`. Archivo `.jsx` con el mismo nombre (`ProductCard.jsx`).
- **Funciones, variables, hooks, servicios:** camelCase. Hooks con prefijo `use` (`useCart`). Constantes globales en `UPPER_SNAKE_CASE`.
- **Archivos no-componente:** camelCase (`productService.js`, `authController.js`); modelos Mongoose en PascalCase singular (`Product.js`).
- **Arquitectura modular:** código nuevo en su capa correspondiente (sección 3 y 16); no mezclar UI, estado, acceso a datos y reglas de negocio en un mismo archivo.
- **Imports:**
  - Frontend: sin extensión (`import App from './App'`).
  - Backend (ESM): la extensión `.js` **es obligatoria** (`import Order from '../models/Order.js'`).
  - **Alias `@/` (implementado en FASE 2):** configurado en `Frontend/vite.config.js` (`resolve.alias`) y `Frontend/jsconfig.json`. Se pueden usar alias absolutos como `@/components`, `@/services`, `@/context`, `@/hooks`, `@/pages`, `@/data`, `@/styles`.
- **Respuestas de la API:** formato uniforme `{ success, data, message }` (ya usado por el backend).
- **Idioma:** UI y mensajes al usuario en español; identificadores de código en inglés.

## 16. Reglas estrictas de arquitectura

- **El frontend NUNCA** accede a la base de datos ni contiene lógica de negocio pesada (cálculo de totales definitivos, validaciones de pago, autorización). Solo presenta y consume la API vía `src/services/` (cliente central: `services/api.js`).
- **Los componentes no llaman `fetch` directamente**: usan `services/`. Páginas y secciones componen; no contienen acceso a datos.
- **Backend por capas:** `routes` → `controllers` → `services` → `models`.
  - `routes/`: define endpoints y middlewares (`middleware/auth.js`).
  - `controllers/`: **solo** reciben `req`/`res`, validan formato básico y devuelven la respuesta; **delegan la lógica de negocio a `services/`**.
  - `services/`: lógica de negocio y acceso a modelos (`Backend/src/services/`).
  - `models/`: esquemas Mongoose, sin lógica de negocio compleja.
- **Estado actual:** capa `services/` implementada en FASE 2 (`authService`, `userService`, `categoryService`, `productService`, `orderService`, `paymentService`). Los controladores delegan las operaciones de negocio a los servicios.
- Autorización y roles se validan **siempre en el backend**; el frontend solo oculta/gestiona UI (`ProtectedRoute`, `AuthContext`).

## 17. Seguridad y restricciones (reglas de bloqueo)

- **PROHIBIDO modificar** `.env` (`Frontend/.env`, `Backend/.env`), secretos, claves API, `JWT_SECRET` o cadenas de conexión sin **confirmación explícita previa del usuario**. Leer/mostrar su contenido tampoco debe exponerlo en respuestas o logs.
- `.env.example` puede actualizarse (sin valores reales) cuando se añada una variable nueva, informándolo al usuario.
- **PROHIBIDO borrar** código, archivos o carpetas sin autorización previa. Ante duda, reportar y esperar. Mover/renombrar archivos también requiere aprobación si afecta rutas de importación.
- No ejecutar comandos destructivos (`rm -rf`, `git reset --hard`, `drop`/`seed` contra BD) sin confirmación. `pnpm seed` en Backend modifica datos: **solo con autorización**.
- Los secretos nunca viajan al frontend (ver sección 8).

## 18. Memoria del agente

- **Antes de empezar cualquier tarea:** leer `AGENTS.md`, `ROADMAP.md` (fase en curso) y `PROJECT_STATE.md` (decisiones y estado de módulos).
- **Al terminar:** marcar `[x]` en `ROADMAP.md`, actualizar el estado de módulos y registrar nuevas decisiones relevantes (ADR) en `PROJECT_STATE.md`.
- No iniciar una fase del `ROADMAP.md` sin instrucción explícita del usuario.