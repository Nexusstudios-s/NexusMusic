# NexusMusic Obsidian — InnerTube + Discord automático

## Publicar en Vercel
1. Extrae el ZIP y copia su contenido a la raíz del proyecto, incluyendo `api/`. Mantén tu carpeta `assets/` original: en particular `assets/Nexus-logo.png` (no venía adjunta en los archivos). La marca de portada y reproductor apunta a ese PNG.
2. Framework preset: Other. Node.js 22.x. Install Command: `npm install` (o el predeterminado de Vercel). Build Command y Output Directory sin personalizar. Vercel instala `youtubei.js` desde el package.json raíz. No necesitas variables de entorno para la búsqueda. No publiques si la instalación de dependencias falla. Mantén `version.json` actualizado según tu APK.
3. Redeploy y recarga con Ctrl+Shift+R. Prueba `/listen?web=1` y `/api/music-search?q=blinding%20lights`.

## Reproductor web
- Pulsa ⤢ en el panel de reproducción o la barra inferior para ampliar/reducir sin cambiar el motor. Esc cierra el modo ampliado. En móvil también hay un botón en la barra inferior.
- Guarda canciones, marca favoritos, crea o selecciona una playlist desde el panel y comparte enlaces. Las claves localStorage originales se conservan.
- Activa ♪ para consultar LRCLIB. Si existe una coincidencia de título, artista y duración (±2 segundos), las líneas temporizadas se resaltan según el tiempo del audio/video. Pulsa una línea para saltar. Si solo hay letra normal no se inventan tiempos; si falta la grabación, se avisa. No todas las canciones tienen letras.
- Búsqueda paralela en YouTube Music mediante YouTube.js 18.3.0 (InnerTube, integración no oficial, solo metadatos), Audius (audio de pistas públicas disponibles) y Apple (metadatos y enlaces oficiales). Puedes filtrar por canciones de YouTube Music, videos, Audius o Apple. Los errores parciales se muestran; el resto de fuentes sigue disponible. Resultados ordenados por similitud del título y artista; los resultados comerciales están marcados como externos. Los resultados de YouTube Music se pueden seleccionar directamente para usar el reproductor oficial, sin API key. Si un video está bloqueado, Buscar alternativas consulta videos y excluye el ID fallido; el usuario elige otra versión. No se eluden restricciones de reproducción. Las restricciones de inserción, región y titular permanecen. No hay extracción de audio de YouTube ni sustitución automática por otra canción. Los proveedores pueden cambiar, limitar o interrumpir sus servicios.
- Enlaces compartidos desde Discord: `?web=1&v=VIDEO_ID`, `?web=1&url=URL`, `?web=1&audio=URL` (adjuntos de audio compatibles y vigentes). Audius: `?web=1&audius=ID&title=...&artist=...`. Para canciones de YouTube bloqueadas, usa la fuente original. No se modifica tu bot (no fue adjuntado).

## Discord Rich Presence — sin código (opcional)
El ID de aplicación `1574721846249525328` se conserva. La llave pública no permite activar Rich Presence desde una web. No se utiliza token de usuario o bot ni un código universal.
1. Cierra el asistente anterior. Descarga el nuevo desde el botón Discord en la web, o utiliza `discord-bridge/` de este ZIP.
2. Abre Discord de escritorio. Desde la carpeta del asistente ejecuta `npm install` y `npm start`. En CachyOS/Linux también puedes ejecutar `bash install-linux.sh` para iniciar automáticamente el asistente al iniciar sesión (systemd de usuario, sin sudo).
3. En la web oficial, pulsa Discord → Activar presencia. Permite acceso local si el navegador lo pide. Tu preferencia se recuerda en localStorage; no necesitas pegar códigos. La página reintenta la conexión mientras esté activada.
4. El asistente intenta reconectarse a Discord y publica canción, artista, progreso y los botones Visitar NexusMusic y Escuchar en NexusMusic. Desactiva desde la web para dejar de compartir. El navegador puede bloquear acceso local; no se deben deshabilitar protecciones globales.
5. El asistente solo escucha en loopback y acepta solicitudes del origen HTTPS oficial con una cabecera de cliente. No se envían datos privados de adjuntos en los botones. No se instala nada en Vercel para Rich Presence. Cada usuario requiere el asistente local y Discord de escritorio; la preferencia se guarda por navegador.

## Pruebas y límites
- En esta edición se añaden pruebas Node de normalización y del endpoint con fuentes simuladas (`npm test`). La instalación npm real no pudo completarse por un fallo DNS del entorno de trabajo. La búsqueda InnerTube en vivo y el despliegue Vercel deben verificarse después de instalar dependencias. InnerTube puede fallar o cambiar sin aviso; no garantiza todo el catálogo ni la reproducción de todos los resultados.
- Documentación de la biblioteca: https://ytjs.dev/api/youtubei.js/namespaces/Clients/classes/Music y https://www.npmjs.com/package/youtubei.js.
- Sintaxis de JS comprobada con Node. Pruebas de interfaz Chromium con DOM inyectado, respuestas simuladas y reloj simulado: búsqueda, resultados externos diferenciados, biblioteca, favoritos, creación de playlists, expansión, letra resaltada y apertura del diálogo Discord. No hubo excepciones JS en esas pruebas.
- El entorno bloqueó la navegación real y no permitió verificar conexiones en vivo con Audius, Apple, LRCLIB, YouTube ni Discord. El asistente local debe probarse en el equipo del usuario con Discord abierto y dependencias instaladas.
- La carpeta de imágenes original no se recibió. Copia los recursos existentes al desplegar; las capturas de prueba usan recursos de reserva. No borres los assets originales.
- Se reutilizaron las páginas auxiliares y los estilos base de Fusion Fix, además de los archivos más recientes adjuntos de la portada, listen y scripts activos. Los scripts y CSS antiguos que no usa esta versión no son necesarios.

## Obsidian
Nueva capa visual `obsidian.css` para la portada y el reproductor: tarjetas glass, contraste, barra flotante, modales y adaptación móvil. El motor musical, claves localStorage y letras de la versión anterior permanecen.

- Ajustes (⚙): seis colores, ambiente dinámico a partir de portada, Liquid Glass, blur, animaciones, reproducción continua, repetir pista, shuffle, velocidad y volumen. Guardado en localStorage. El color extraído requiere CORS; si no es posible se conserva el fondo de portada y el color elegido. Las pistas siguientes se toman de la cola, después del contexto de búsqueda/lista y finalmente se consultan pistas del artista evitando las recientes. No se garantiza una pista alternativa disponible ni se saltan bloqueos de YouTube.
- Acerca de: créditos de Santiago Caro, Instagram y número de donación proporcionados por el propietario.
- Discord utiliza SET_ACTIVITY con tipo Listening (2) y portada externa de dominios permitidos (YouTube/Apple), con logo como alternativa. Si el cliente rechaza el asset, se reintenta sin portada. El texto visible depende del cliente Discord y no se ha probado con un cliente real.
- Pruebas Obsidian: 2 pruebas Node del buscador pasadas; prueba Chromium con DOM y Audio simulados, búsqueda, avance de primera a segunda y tercera canción, repetición, tema rosa, toggle glass, diálogo de ajustes, expansión, Discord simulado y anchura móvil, sin errores JS. No equivale a probar reproducción real ni proveedores en red.
