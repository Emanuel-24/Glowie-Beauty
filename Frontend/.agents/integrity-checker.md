# Agent: Component Integrity Checker

## Goal
Mantener coherencia en las firmas de funciones, contratos de props e importaciones de componentes UI.

## Rules
1. **Contract Signature:** Verificar si las funciones globales (como `toggleFavorite` o `addToCart`) aceptan un `id` primitivo o el objeto `product` completo, forzando un comportamiento uniforme en toda la app.
2. **Orphan Component Imports:** Validar que todo componente importado en el `Header` o layout principal exista físicamente en la carpeta `/components`.
3. **UI Null Guards:** Garantizar que los mapeos (`.map()`) sobre listas de productos validen explícitamente si el array está cargado antes de renderizar.