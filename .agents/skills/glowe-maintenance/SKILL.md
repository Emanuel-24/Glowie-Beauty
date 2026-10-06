---
name: glowe-maintenance
description: Protocolo de mantenimiento, verificación continua y reglas de desarrollo para Glowe Beauty. Use when asked to "verificar proyecto", "hacer check", "auditar calidad", "mantenimiento" o antes de finalizar tareas de código.
license: MIT
metadata:
  author: Glowe Beauty Architecture Team
  version: "1.0"
---

# Glowe Beauty — Protocolo de Mantenimiento y Verificación

Instrucciones permanentes para agentes de IA y desarrolladores encargados del mantenimiento, evolución y entrega de cambios en Glowe Beauty.

---

## 1. Verificación Continua Obligatoria (Gatekeeper)

Antes de dar por finalizada **cualquier tarea** que modifique código en el repositorio, es estrictamente obligatorio ejecutar la suite de validación autónoma:

1. **Frontend (Vite Build & Syntax):**
   ```bash
   pnpm --dir Frontend check
   ```
   *Criterio de éxito:* Código de salida 0, sin errores de compilación ni imports rotos.

2. **Backend (Sintaxis Node.js & Modelos):**
   ```bash
   pnpm --dir Backend check
   ```
   *Criterio de éxito:* Código de salida 0 sin errores sintácticos en servidores ni seeds.

3. **Backend Suite de Pruebas (Servicios e Integración):**
   ```bash
   pnpm --dir Backend test:unit
   ```
   *Criterio de éxito:* 100% de tests passing (0 fallos, 0 errores).

---

## 2. Reglas de Arquitectura No Negociables

- **Frontend Aislado:** Nunca conectar componentes directamente a Mongoose ni MongoDB. Toda petición pasa por `@/services/api.js`.
- **Backend por Capas:** Controladores delgados que solo manejan `req`/`res` y delegan la lógica a `@/services/` (`authService`, `productService`, `orderService`, `paymentService`, `categoryService`, `userService`).
- **Seguridad:** Prohibido modificar variables de entorno (`.env`) o claves secretas sin confirmación expresa del usuario.
- **Package Manager:** Solo `pnpm`. Nunca generar `package-lock.json` ni usar `npm`/`yarn`.

---

## 3. Protocolo de Memoria Persistente

1. **Antes de iniciar una tarea:** Leer `AGENTS.md`, `ROADMAP.md` y `PROJECT_STATE.md`.
2. **Al completar una tarea:**
   - Registrar la decisión técnica o de negocio en `PROJECT_STATE.md` (formato ADR).
   - Marcar el progreso en `ROADMAP.md` con `[x]`.
   - Actualizar el porcentaje de la barra de avance.
