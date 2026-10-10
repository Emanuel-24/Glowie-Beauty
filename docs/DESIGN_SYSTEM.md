# DESIGN_SYSTEM.md — GLOWE BEAUTY

> **Estado:** FASE 1 cerrada (18/09/2026). **Decisiones de marca tomadas por el dueño: tipografía → Inter; dark → #2D2A2E.**
> Documenta el sistema visual **ACTUAL** (implementado en el código) frente al prototipo legacy (`glowe_beauty_landing_page_completa.html`).

---

## 1. Identidad de marca

| | ACTUAL (código) | OBJETIVO (referencia) |
|---|---|---|
| Tagline | "Tu belleza, tu estilo, tu Glowe." | mismo tagline (prototipo `glowe_beauty_landing_page_completa.html`) |
| Público | Mujeres Colombia, maquillaje + cuidado capilar | igual (COP, envíos nacionales) |
| Tono | Femenino, pastel, glowy, emoji-friendly | igual |
| Símbolo | Logo circular `public/Logo.png` (1.2 MB) en Header/Footer | mismo logo |
| Fuentes | Inter (sans) + Playfair Display (serif) — **decidido 18/09/2026: Inter** (el prototipo usaba Plus Jakarta Sans; se descarta) | Inter (sans) + Playfair Display (serif) |

## 2. Colores

Paleta definida en `Frontend/tailwind.config.js` → `colors.glowe`.

### ACTUAL (Tailwind tokens)
| Token | Hex | Uso |
|---|---|---|
| `glowe.pink` | `#FDE2E4` | fondos suaves, hover |
| `glowe.pink-dark` | `#F4ACB7` | bordes, gradientes |
| `glowe.pink-accent` | `#FF758F` | CTA principal, precios, hover |
| `glowe.blue` | `#E2ECE9` | fondos capilar |
| `glowe.blue-dark` | `#99C1B9` | bordes |
| `glowe.blue-accent` | `#52B788` | éxito/eco |
| `glowe.yellow` | `#FFF1C5` | destacados, ofertas |
| `glowe.yellow-dark` | `#FFE494` | bordes de ofertas |
| `glowe.yellow-accent` | `#F59E0B` | iconos |
| `glowe.offwhite` | `#FAF8F5` | fondo global |
| `glowe.dark` | `#2D2A2E` | texto principal |
| `glowe.muted` | `#78716C` | texto secundario |

También se usan clases de Tailwind por defecto: `rose-300/400/500`, `amber-*`, `purple-300`, `teal-600`, `text-amber-600`.

### OBJETIVO (referencia del prototipo legacy)
- Prototipo `glowe_beauty_landing_page_completa.html` difiere en: `dark: #4A3E3D`, `muted: #8C7B7A`, `card: rgba(255,255,255,0.78)` y usa **Plus Jakarta Sans**.
- **DECISIÓN (18/09/2026):** se mantiene `dark: #2D2A2E` y **Inter**; el prototipo es solo referencia visual, no fuente de tokens.

## 3. Tipografía

| | ACTUAL | OBJETIVO (referencia) |
|---|---|---|
| Sans | **Inter (decidido 18/09/2026)** (variable 100–900) vía Google Fonts (`index.html`) | Inter (se descartó Plus Jakarta Sans) |
| Serif (títulos display) | Playfair Display 500–700 | Playfair Display (coincide) |
| Escalas | Usa token de Tailwind, mayormente `text-[10px]`, `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-3xl/4xl/5xl/6xl` en títulos | Simplificar escalas en FASE 1 |
| Tracking | `tracking-tight`/`tracking-wider` y `tracking-widest` en marcas | mismo |

**Detalle:** hay tamaños inline arbitrarios `text-[10px]`, `text-[11px]` repartidos por todo el código → sin escala tipográfica única (deuda para FASE 1).

## 4. Spacing

- Usa la escala default de Tailwind (`px-4`, `py-12`, `gap-6`, `space-y-*`, `max-w-7xl`).
- Patrón recurrente de contenedor: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
- Secciones con `py-12`/`py-16`; hero con `pt-8 pb-16 lg:pt-16 lg:pb-24`.
- Sin tokens de spacing propios → se hereda la escala Tailwind (ok).

## 5. Border radius

| | ACTUAL |
|---|---|
| Cards | `rounded-2xl` / `rounded-3xl` |
| Botones | `rounded-full` (pills) |
| Badges | `rounded-full` |
| Contenedores modales/drawer | `rounded-2xl`/`rounded-3xl` |
| Nav pills | `rounded-full` |

Radios arbitrarios puntuales: `rounded-lg` (imágenes mini), `rounded-xl` (media), `rounded-[...]` raros (ninguno detectado en estilos base). Consistente mayormente en pills y cards; la FASE 1 debe formalizar el radio jerárquico (lg/xl/2xl/3xl/full).

## 6. Botones

### ACTUAL — IMPLEMENTADO (`components/ui/Button.jsx`, usuario principal del sistema)
- Componente único con variants: `primary` (rosa acento), `glass`, `soft` (rosa pastel), `gradient` (carrito header), `dark`, `plain` (para sobreescribir colores vía `className`, p.ej. botones de bundles guiados por datos).
- Sizes: `sm`, `md`, `lg`, `icon`. Props: `fullWidth`, `loading` (spinner), `disabled`, `focus-visible` ring global.
- Ya aplicado en: `Header` (iconos búsqueda/favoritos + botón carrito), `HeroSection` (CTAs), `ProductCard` (favorito + añadir), `GlowDeals` (Añadir), `BundlesSection` (Comprar Kit, colors desde data), `CartDrawer` (Finalizar Compra), `NewsletterForm`.
- **Pendiente → FASE 2 (EN CURSO):** estandarizar pills de navegación del `Header`, chips filtro del quiz (`FindYourGlow`), steppers +/− del carrito, `MobileBottomNav`, `CategoryPlayground` y `EditorialMakeup` (hoy usan utilities del sistema con estructura propia).

## 7. Cards

- **Componente `ui/Card.jsx` IMPLEMENTADO**: wrapper de superficie con variants (`glass` con hover-lift, `panel`, `subtle`) y radios (`xl`, `2xl`, `3xl`). Las utilities de la capa components se sobreescriben limpiamente con clases Tailwind pasado vía `className` (usado en Deals: `bg-white/90`, Bundles: `border-*` desde data).

## 8. Inputs y formularios

- **`ui/Input.jsx` IMPLEMENTADO** + utility `.glass-input` (`src/styles/index.css`): `w-full rounded-full bg-white/80 border-glowe-pink/60` con `focus:ring-2 ring-glowe-pink-accent`. Sizes `sm`/`md`, `forwardRef`.
- **`ui/NewsletterForm.jsx` IMPLEMENTADO**: unifica los dos formularios de newsletter (footer + SocialProof) en un solo componente con estado local, toast, loading y mensaje de éxito configurable. Elimina la duplicación detectada en FASE 0.
- **`ui/Badge.jsx` IMPLEMENTADO**: tones `white` (promo en cards), `rose` (descuento), `amber` (chips de ofertas), `pink`, `blue`, `neutral`, `dark`, `accent` y `plain` (para colores provistos por datos). Centraliza el `text-[10px]` de las etiquetas.
- Pendiente: el input de búsqueda (`SearchModal`) es un patrón inline transparente dentro de una barra glass — no usa `Input` a propósito (queda como está).

## 9. Navegación

- **Desktop amplio** (`xl+`): Header sticky (`sticky top-0 z-50`) con announcement bar, logo, nav de pills `rounded-full bg-white/50` y acciones completas de cuenta.
- **Móvil/tablet** (`<xl`): Header compacto con búsqueda, carrito y acceso de cuenta por icono; `MobileBottomNav` se mantiene visible hasta laptop para no comprimir seis links en una sola fila.
- La nav inferior usa `safe-area-inset-bottom`; el `<main>` reserva espacio hasta `xl` para evitar que el contenido quede detrás de ella.

## 10. Responsive

- Mobile-first con `sm:`, `md:`, `lg:` y `xl:`. `xl` se reserva para layouts densos: nav completa, sidebar permanente y tablas.
- Las grillas comerciales usan mínimos de ancho puntuales (`min-[440px]`, `min-[520px]`) cuando el contenido de la tarjeta lo permite; no se crean breakpoints globales adicionales.
- Drawers y modales usan `100dvh`, scroll interno y safe area para pantalla táctil.
- Tablas administrativas: tabla semántica en `xl+` y tarjetas de registro bajo ese ancho, reutilizando los mismos datos.
- `html, body { overflow-x: clip }` se conserva como protección, pero los layouts deben no depender de él para ocultar desbordes.
- Viewports objetivo: 320 / 375 / 425 / 768 / 1024 / 1280 / 1440+.
- Elementos decorativos (`GlowBackground`) fijos y `pointer-events-none` para no alterar el layout.

## 11. Glassmorphism

- Utilities en `src/styles/index.css`:
  - `.glass-panel` → `bg-white/80 backdrop-blur-md border-white/70 shadow-glass`
  - `.glass-panel-subtle` → `bg-white/60 backdrop-blur-sm`
  - `.glass-card` → ver "Cards".
- Sombras tokenizadas en Tailwind:
  - `glass`: `0 8px 32px 0 rgba(244,172,183,0.12)`
  - `glass-hover`: `0 14px 40px 0 rgba(244,172,183,0.25)`
  - `soft`: `0 10px 30px -5px rgba(120,113,108,0.08)`
  - `glow`: `0 0 25px rgba(244,172,183,0.45)`
- Combinado con `backdrop-blur` en header, drawer, modales, cards → look "glowy/pastel" coherente, pero sin tokens semánticos (no distingue surface/elevaciones semánticas).

## 12. Sombras

Ya cubiertas arriba (sección 11). También hay `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-2xl` sueltos según contexto.

## 13. Estados interactivos

| Estado | Patrón actual |
|---|---|
| hover | `hover:bg-<x>`, `hover:scale-[1.02]`, `hover:-translate-y-1` (en cards) |
| focus | `focus:outline-none focus:ring-2 focus:ring-glowe-pink-accent` en inputs; en la mayoría de botones **no hay** `focus-visible` explícito |
| active | header item: `bg-glowe-pink/70 scale-105` (mobile nav) |
| disabled | newsletter: `disabled:opacity-60` |
| loading | newsletter: label cambia a "Enviando…"; cards: **sin skeletons** ni loading states |

**Deuda de accesibilidad:** falta consistencia de `focus-visible` en botones; ver skill `accessibility` para FASE 1.

## 14. Animaciones

| | ACTUAL |
|---|---|
| Reveal on scroll | `ui/Reveal.jsx` (IntersectionObserver, `fade + translate-y`, delay opcional) |
| Toast | anim `slideIn` 300ms (keyframe en `index.css`) |
| fadeIn | usado en banners de filtro activo |
| Hover | transitions `duration-300`/`duration-500` + scale |

## 15. Resumen de avance de FASE 1

1. ✅ Atómicos creados/refactorizados: `Button`, `Badge`, `Input`, `Card`, `NewsletterForm` — aplicados en Header, Hero, ProductCard, GlowDeals, Bundles, CartDrawer, Footer y SocialProof.
2. ✅ Dead code de FASE 1 eliminado: `useDisclosure` (hooks) y `getBundles` (api.js); los antiguos `Button.jsx`/`Badge.jsx` muertos ahora son el sistema real en uso.
3. ✅ Duplicación de newsletter eliminada (2 formularios → 1 componente).
4. ✅ `pnpm build` en verde (18/09/2026).
5. ✅ **Decisiones de marca:** tipografía **Inter**; dark **#2D2A2E** (registradas 18/09/2026).
6. ⏳ Traspasado a FASE 2 (EN CURSO): estandarización de componentes interactivos bespoke (nav pills, chips quiz, steppers del carrito, CategoryPlayground, MobileBottomNav, EditorialMakeup) y revisión de SearchModal / toggleFavorite.
