# NexusMusic Studio — nueva interfaz

Sitio estático + función serverless para Vercel, sin frameworks ni compilación. La portada, la aplicación musical, la página legal y el perfil del estudio tienen una nueva estructura y una hoja de estilos propia. Se reutiliza la lógica de búsqueda/reproducción/biblioteca del proyecto original para conservar compatibilidad con datos locales y API.

## Publicar
1. Extrae este ZIP. Coloca todos los archivos y `api/` en la raíz del proyecto Vercel. Puedes reemplazar el frontend anterior; no necesitas `33ds.css`, `33dr.js`, `scc.css`, `web-player.css` ni `p.css`.
2. Fusiona tu carpeta `assets/` original con la incluida (no borres `studio-mark.svg`). Conserva también `avatar.png` en la raíz si lo tienes. Las capturas y el avatar no fueron enviados; sin ellos se muestran recuadros de reserva claramente identificados.
3. En Vercel selecciona Framework Preset: Other; sin comando de build ni output directory personalizado.
4. Configura `YOUTUBE_API_KEY` (YouTube Data API v3) en Environment Variables; opcionalmente `YOUTUBE_REGION=CO`. Si ya existía la variable, no necesitas crearla otra vez. Nunca incluyas la clave en el frontend. Restringe la clave a la API indicada.
5. Redeploy. Verifica `/api/music-search?q=rock`, luego `/listen?web=1`. La portada incluye enlaces al reproductor y a la versión APK publicada en `version.json`.

## Notas
- La biblioteca, favoritos, historial, cola y playlists reutilizan las claves localStorage del proyecto original; los datos se conservan en el mismo origen/navegador.
- La reproducción usa YouTube oficial y requiere conexión. Puede incluir publicidad y restricciones. Las funciones avanzadas de Android se describen, pero no se implementan como nuevas funciones web.
- El botón de interés en Pro guarda una preferencia local, no envía notificaciones ni procesa pagos. La fecha y el precio futuros provienen del sitio original.
- ES/EN/PT: se mantienen traducciones originales en el contenido importado y en el texto principal nuevo; algunas etiquetas nuevas permanecen en español. La app web está en español, como la original.
- Los datos de comparación y el registro de cambios proceden del sitio original y no se han actualizado mediante fuentes externas. La privacidad conserva el texto original; comprueba que refleje el servicio que despliegas.
- Las fuentes se cargan desde Google Fonts con fallback local. No se necesita acceso externo para ver el diseño base.
- Para uso público añade límites de solicitudes en Vercel para proteger la cuota de YouTube.

## Comprobaciones
Sintaxis JS comprobada con Node, referencias DOM y duplicados comprobados estáticamente. El entorno de Chromium bloqueó la navegación local; no se pudo completar la prueba visual o de interacción. No se probó una clave real de YouTube.
