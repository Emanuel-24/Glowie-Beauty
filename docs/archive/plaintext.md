======================================================================
FASE 10: ROL ADMIN, CONTROL DE SESIÓN Y SEEDER DE BASE DE DATOS
======================================================================
Objetivo: Resolver pantalla en blanco en /producto, añadir login/logout
visibles y crear la vista protegida /admin.

- Tarea 10.1: Seeder en Backend (`npm run seed`) para poblar productos
  reales en MongoDB Atlas con imágenes de prueba.
- Tarea 10.2: Actualizar `Navbar.jsx` para mostrar estado de sesión,
  botón de Logout y acceso condicional a "/admin" si `user.role === 'admin'`.
- Tarea 10.3: Crear vista administrativa `AdminPanel.jsx` con formulario
  CRUD de productos e historial global de ventas.
- Tarea 10.4: Reestructurar `Producto.jsx` con manejo defensivo de estados de
  carga (Loaders de UI Ball) para evitar la pantalla en blanco.

======================================================================
FASE 11: INTEGRACIÓN DE CANVAS MOSAIC LENS Y REDISEÑO AUTENTICACIÓN
======================================================================
Objetivo: Crear el componente `MosaicLens.jsx` con el shader WebGL personalizado 
de Originkit y aplicarlo en las vistas de Login y Registro.

- Tarea 11.1: Crear `Frontend/src/components/ui/MosaicLens.jsx` con el código 
  Shader WebGL2 de Originkit.
- Tarea 11.2: Rediseñar `Login.jsx` y `Registro.jsx` usando `MosaicLens` como 
  fondo interactivo con tarjetas centrales en estilo Glassmorfismo refinado.

======================================================================
FASE 12: REDISEÑO DE UI, MORPHICONS, PALETA Y CARROUSEL DE IMÁGENES
======================================================================
Objetivo: Aplicar la nueva paleta (#FFD1E1, #FFE7A3, #8DE2F7), reemplazar
iconos de acción por Morphicons y mejorar la navegación de productos.

- Tarea 12.1: Actualizar variables CSS globales/Tailwind con la nueva paleta.
- Tarea 12.2: Rediseñar el modal de búsqueda (más amplio y clic en toda
  la tarjeta del producto).
- Tarea 12.3: Reemplazar la vista/drawer actual de favoritos por una página
  dedicada `/favoritos`.
- Tarea 12.4: Integrar carrusel con botones circulares en estilo Glassmorfismo
  en las cards y galería estilo Amazon en la vista de producto.
- Tarea 12.5: Reemplazar iconos interactivos por animaciones Morphicons.
- Tarea 12.6: Eliminar la sección de reseñas de productos.

======================================================================
FASE 13: GSAP, SCROLLTRIGGER, LOADERS UI BALL Y GLASSMORFISMO ELEGANTE
======================================================================
Objetivo: Pulir animaciones de alto rendimiento e incrementos de traslucidez.

- Tarea 13.1: Configurar GSAP + ScrollTrigger para animaciones de entrada
  y scroll fluido.
- Tarea 13.2: Reemplazar indicadores de carga por Loaders de UI Ball.
- Tarea 13.3: Ajustar el Navbar y modales con `backdrop-blur-md` y bordes
  semitransparentes elegantes.

======================================================================
FASE 14: QA FINAL, SEPARACIÓN TOTA DE STORE Y ADMIN, Y HARDENING
======================================================================
Objetivo: Consolidar la app en un estado estable, separar completamente la
experiencia de cliente y la plataforma de administración, y dejarla lista
para validación final.

- Tarea 14.1: Separar completamente el shell público y el shell administrativo,
  con rutas protegidas y redirección segura según rol.
- Tarea 14.2: Revisar autenticación, persistencia de sesión, logout y acceso
  a /admin usando reglas de permisos reales.
- Tarea 14.3: Validar flujo principal de compra: catálogo, favoritos, carrito,
  checkout y confirmación de pedido.
- Tarea 14.4: Ajustar la jerarquía visual del navbar y la navegación mobile
  para priorizar la compra y la experiencia comercial.
- Tarea 14.5: Ejecutar `pnpm build` en Frontend y corregir errores de
  compilación, imports o sintaxis antes de cerrar la fase.
- Tarea 14.6: Hacer QA responsive (375, 768, 1024+) y revisión de
  accesibilidad básica, estados vacíos y errores de UI.
- Tarea 14.7: Preparar la última revisión del proyecto para cierre de fase,
  despliegue y handoff técnico.

======================================================================
FASE 15: CIERRE FINAL, HANDOFF TÉCNICO Y VALIDACIÓN DE ENTREGA
======================================================================
Objetivo: Dejar la app lista para cierre comercial y técnico, con todo el
flujo integrado, validado y documentado para handoff sin fricción.

- Tarea 15.1: Revisar flujo completo del negocio: catálogo, producto,
  favoritos, carrito, checkout, confirmación de pedido y login/logout.
- Tarea 15.2: Validar autenticación y permisos reales: sesión persistente,
  rutas protegidas, acceso a /admin solo para admin y flujo de logout limpio.
- Tarea 15.3: Revisión final de seguridad y estado de datos: secretos del
  backend sin exponer en frontend, manejo de errores y validación de inputs.
- Tarea 15.4: Ejecutar `pnpm build` en Frontend y corregir errores de
  compilación, imports, rutas y sintaxis residual antes del cierre final.
- Tarea 15.5: Realizar QA responsive final en 375px, 768px y 1024px+,
  validando legibilidad, accesibilidad básica, estados vacío/loading/error
  y ausencia de scroll horizontal.
- Tarea 15.6: Actualizar la documentación de proyecto (`docs/ROADMAP.md`,
  `docs/ARCHITECTURE.md`, `docs/UX_FLOWS.md`) con el estado real e indicar
  IMPLEMENTADO / PARCIAL / MOCK / NO IMPLEMENTADO.
- Tarea 15.7: Preparar handoff técnico con resumen de entregables,
  pendientes conocidos, instrucciones de despliegue y guía de uso.
- Tarea 15.8: Dejar el proyecto listo para validación final del cliente,
  con build en verde, flujo principal verificado y documentación coherente.

Criterio de cierre: la app queda lista para pasar de desarrollo a entrega,
con experiencia de usuario validada, permisos y sesión correctos, build
estable y documentación alineada con el estado real del proyecto.