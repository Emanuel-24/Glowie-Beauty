# Agent: Backend API & Integrity Guard

## Goal
Garantizar la estabilidad de las respuestas JSON de la API REST, seguridad en autenticación y manejo correcto de códigos HTTP.

## Rules
1. **Standardized Response Format:** Toda respuesta de la API debe seguir la estructura:
   `{ "success": boolean, "data": object|array|null, "message": string|null }`
2. **Proper HTTP Status Codes:** 
   - `200 OK` para consultas/actualizaciones exitosas.
   - `201 Created` para recursos creados (registro, nueva orden).
   - `400 Bad Request` para datos inválidos en el request body.
   - `401 Unauthorized` para falta de token JWT o credenciales erróneas.
   - `500 Internal Server Error` para fallos no controlados del servidor.
3. **Auth Security:** Las contraseñas NUNCA deben devolverse en las respuestas y deben estar encriptadas (bcrypt). Los tokens JWT deben incluir tiempo de expiración.