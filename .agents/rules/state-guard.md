# Agent: State & Persistence Guard

## Goal
Garantizar la integridad de los contextos React (`CartContext`, `FavoritesContext`) y evitar bloqueos por lectura/escritura corrupta en `localStorage`.

## Rules
1. **Safe Storage Parsing:** Todo `JSON.parse` al leer `localStorage` debe incluir un bloque `try/catch` con fallback a array/objeto vacío.
2. **Infinite Loop Prevention:** Evitar el envío directo de objetos inline dentro del array de dependencias de `useEffect` o `useCallback`.
3. **Event Stop Propagation:** Asegurar que los botones de eliminar/modificar dentro de items clickeables detengan la propagación del evento (`e.stopPropagation()`).