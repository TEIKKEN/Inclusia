# SECURITY_NOTES

## 1. Riesgos encontrados

- El formulario de contacto dependía casi por completo de validación cliente básica.
- El envío aceptaba cualquier campo presente en el DOM al construir `FormData` directamente desde el formulario.
- No existía protección cliente contra doble envío ni contra envíos consecutivos muy rápidos.
- El estado accesible del formulario no se actualizaba de forma consistente en `aria-invalid` y `aria-live`.
- Existía una inserción con `innerHTML` en `assets/JS/page-transitions.js`.
- El proyecto no incluye backend propio para revalidar, limitar solicitudes o aplicar controles antifraude reales.

## 2. Cambios realizados

- Se reforzaron atributos HTML del formulario principal en `index.html`:
  - `minlength`, `maxlength`, `pattern`, `autocomplete`, `inputmode`, `spellcheck`, `accept-charset`.
- Se endureció `assets/JS/form.js` sin cambiar el flujo principal de envío:
  - normalización segura de nombre, correo y mensaje;
  - lista permitida para el campo `tipo`;
  - validación final justo antes del envío;
  - construcción de `FormData` con lista blanca de campos esperados;
  - bloqueo de doble clic mientras el envío está en curso;
  - cooldown local entre envíos consecutivos;
  - tiempo mínimo razonable antes de aceptar un envío;
  - actualización de `aria-invalid`;
  - foco al primer campo inválido;
  - actualización de la región `aria-live` con estados de validación y envío.
- Se sustituyó `innerHTML` por creación segura de nodos en `assets/JS/page-transitions.js`.
- Se añadió una política de referrer mediante meta tag.
- Se agregó estilo visual para el botón deshabilitado durante el envío.

## 3. Riesgos pendientes

- Cualquier control hecho solo en el navegador puede ser omitido por un atacante.
- El endpoint externo de Formspree sigue siendo un contrato ajeno al proyecto y puede responder distinto a futuro.
- No es posible garantizar protección real contra spam, abuso automatizado o falsificación de solicitudes sin servidor.
- Los `console.log` presentes en otros archivos no exponen secretos aquí, pero conviene depurarlos en una fase de limpieza más amplia.

## 4. Medidas obligatorias del lado servidor

- Revalidar y normalizar todos los campos recibidos.
- Rechazar campos inesperados y longitudes fuera de rango.
- Aplicar rate limiting por IP, sesión o identidad.
- Registrar intentos fallidos y patrones anómalos.
- Implementar controles antispam y reputación en servidor.
- Usar consultas parametrizadas si esos datos terminan en base de datos.
- Aplicar protección CSRF solo si existe backend que procese sesiones o formularios propios.

## 5. Recomendaciones de cabeceras HTTP

- `Content-Security-Policy` enviada por cabecera HTTP, no solo por meta tag.
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Content-Type-Options: nosniff`
- `Permissions-Policy` ajustada al sitio.
- `Cross-Origin-Opener-Policy: same-origin` cuando sea compatible.

## 6. Recomendaciones de rate limiting

- Límite por IP y ventana temporal.
- Límite por huella de sesión o token antifraude cuando exista backend.
- Respuestas uniformes para no filtrar reglas internas.

## 7. Recomendaciones para almacenamiento seguro de secretos

- No guardar claves API, tokens privados ni credenciales en frontend.
- Mantener secretos solo en backend o en infraestructura segura.
- No asumir que ocultar una clave en JavaScript la protege.

## 8. Instrucciones para probar el formulario

- Probar envío válido.
- Probar campos vacíos.
- Probar espacios al inicio y final.
- Probar nombre con caracteres no permitidos.
- Probar correo inválido.
- Probar mensaje menor de 10 caracteres.
- Probar mensaje mayor de 500 caracteres.
- Probar doble clic sobre enviar.
- Probar dos envíos seguidos en menos de 15 segundos.
- Probar caída de red o respuesta no exitosa del endpoint.
- Probar navegación completa con teclado.

## 9. Archivos eliminados o reorganizados

- No se eliminaron archivos en esta fase.
- Se refactorizó internamente `assets/JS/form.js`.
- Se reemplazó la construcción del loader en `assets/JS/page-transitions.js`.

## 10. Limitaciones de una aplicación construida únicamente con frontend

- No puede imponer controles de seguridad definitivos.
- No puede ocultar secretos reales.
- No puede evitar por sí sola spam sofisticado, bots ni manipulación intencional del navegador.
- No puede proteger backend, base de datos ni servicios externos si estos no validan por su cuenta.
