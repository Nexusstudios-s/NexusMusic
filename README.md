# NexusMusic Atmosphere — actualización de Fusion

## Publicar en Vercel
1. Extrae el ZIP y copia su contenido a la raíz del proyecto, incluyendo `api/`. Mantén tu carpeta `assets/` original: en particular `assets/Nexus-logo.png` (no venía adjunta en los archivos). La marca de portada y reproductor apunta a ese PNG.
2. Framework preset: Other. No necesitas build ni variables de entorno para la búsqueda de esta versión. Mantén `version.json` actualizado según tu APK.
3. Redeploy y recarga con Ctrl+Shift+R. Prueba `/listen?web=1` y `/api/music-search?q=blinding%20lights`.

## Reproductor web
- Pulsa ⤢ en el panel de reproducción o la barra inferior para ampliar/reducir sin cambiar el motor. Esc cierra el modo ampliado. En móvil también hay un botón en la barra inferior.
- Guarda canciones, marca favoritos, crea o selecciona una playlist desde el panel y comparte enlaces. Las claves localStorage originales se conservan.
- Activa ♪ para consultar LRCLIB. Si existe una coincidencia de título, artista y duración (±2 segundos), las líneas temporizadas se resaltan según el tiempo del audio/video. Pulsa una línea para saltar. Si solo hay letra normal no se inventan tiempos; si falta la grabación, se avisa. No todas las canciones tienen letras.
- Búsqueda paralela en Audius (reproducción completa de pistas públicas disponibles) y el catálogo comercial de Apple (metadatos y enlaces oficiales, no audio completo). Resultados ordenados por similitud del título y artista; los resultados comerciales están marcados como externos. Puedes buscar en YouTube y pegar el enlace del video compatible para usar el reproductor oficial, sin API key. Las restricciones de inserción, región y titular permanecen. No hay extracción de audio de YouTube ni sustitución automática por otra canción. Los proveedores pueden cambiar, limitar o interrumpir sus servicios.
- Enlaces compartidos desde Discord: `?web=1&v=VIDEO_ID`, `?web=1&url=URL`, `?web=1&audio=URL` (adjuntos de audio compatibles y vigentes). Audius: `?web=1&audius=ID&title=...&artist=...`. Para canciones de YouTube bloqueadas, usa la fuente original. No se modifica tu bot (no fue adjuntado).

## Discord Rich Presence (opcional, en el equipo de quien escucha)
El ID de aplicación está configurado: `1574721846249525328`. La llave pública de Discord verifica firmas de interacciones; no autoriza Rich Presence ni sustituye el cliente de escritorio. No se necesita token de usuario ni de bot. No hace falta configurar Discord para utilizar el reproductor normal.

1. Instala Node.js (18 o superior) y abre Discord de escritorio. Asegúrate de permitir mostrar la actividad en los ajustes de privacidad de Discord. Comprueba que tu aplicación se llama NexusMusic en el Developer Portal.
2. En tu PC, desde una terminal en la carpeta `discord-bridge`, ejecuta `npm install` y luego `npm start`. No se debe ejecutar el asistente en Vercel: usa el cliente Discord local por IPC.
3. Copia el código aleatorio mostrado en la terminal. En `https://nexusmusicx.vercel.app/listen?web=1`, abre Discord en la barra superior, pega el código y pulsa Conectar presencia. Si el navegador solicita acceso a la red local, debes permitirlo para esa web.
4. Escucha una canción. El asistente intenta publicar canción, artista, tiempo y los botones **Visitar NexusMusic** y **Escuchar en NexusMusic** (la visibilidad depende del cliente y permisos de Discord). Los enlaces privados de adjuntos Discord no se publican en presencia: el botón lleva a la página general en ese caso.
5. Pulsa Desconectar o cierra el asistente para quitar la actividad. El asistente también limpia la presencia cuando deja de recibir actualizaciones. Si falla IPC, reinicia el asistente con Discord abierto. Solo acepta solicitudes desde el origen oficial y un código aleatorio de sesión, y escucha en loopback.

## Pruebas y límites
- Sintaxis de JS comprobada con Node. Pruebas de interfaz Chromium con DOM inyectado, respuestas simuladas y reloj simulado: búsqueda, resultados externos diferenciados, biblioteca, favoritos, creación de playlists, expansión, letra resaltada y apertura del diálogo Discord. No hubo excepciones JS en esas pruebas.
- El entorno bloqueó la navegación real y no permitió verificar conexiones en vivo con Audius, Apple, LRCLIB, YouTube ni Discord. El asistente local debe probarse en el equipo del usuario con Discord abierto y dependencias instaladas.
- La carpeta de imágenes original no se recibió. Copia los recursos existentes al desplegar; las capturas de prueba usan recursos de reserva. No borres los assets originales.
- Se reutilizaron las páginas auxiliares y los estilos base de Fusion Fix, además de los archivos más recientes adjuntos de la portada, listen y scripts activos. Los scripts y CSS antiguos que no usa esta versión no son necesarios.
