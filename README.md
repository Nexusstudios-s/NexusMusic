# NexusMusic Obsidian + Discord automático

## Publicar en Vercel
1. Extrae el ZIP y copia su contenido a la raíz del proyecto, incluyendo `api/`. Mantén tu carpeta `assets/` original: en particular `assets/Nexus-logo.png` (no venía adjunta en los archivos). La marca de portada y reproductor apunta a ese PNG.
2. Framework preset: Other. Node.js 22.x. Install Command: `npm install` (o el predeterminado de Vercel). Build Command y Output Directory sin personalizar. Vercel instala `youtubei.js` desde el package.json raíz. No necesitas variables de entorno para la búsqueda. No publiques si la instalación de dependencias falla. Mantén `version.json` actualizado según tu APK.
3. Redeploy y recarga con Ctrl+Shift+R. Prueba `/listen?web=1` y `/api/music-search?q=blinding%20lights`.

## Chat de ayuda Nexus Forma
- En Vercel → Project → Settings → Environment Variables, define `NEXUS_API_KEY` con una clave nueva de Nexus Forma. No la pongas en HTML, JavaScript, Git ni en el APK. Revoca cualquier clave que se haya compartido en un chat o captura y crea otra antes de desplegar.
- El proxy usa el modelo `Nexus-Nova`.
- Redeploy después de guardar las variables. El chat flotante usa `/api/nexus-chat`, que reenvía las conversaciones desde el backend a `https://www.nexusforms.lat/v1/chat/completions`; el navegador nunca recibe la clave. Cada mensaje puede consumir tokens del plan de Nexus Forma.
- El chat no conserva conversaciones al recargar la página. No envíes contraseñas ni datos sensibles. El endpoint limita el tamaño/historial de los mensajes y aplica un límite básico por IP; configura también límites de uso en Nexus Forma.

## Reproductor web
- Pulsa ⤢ en el panel de reproducción o la barra inferior para ampliar/reducir sin cambiar el motor. Esc cierra el modo ampliado. En móvil también hay un botón en la barra inferior.
- Guarda canciones, marca favoritos, crea o selecciona una playlist desde el panel y comparte enlaces. Las flechas de Biblioteca cambian el orden en este dispositivo y, al iniciar sesión, también en Biblioteca Nexus. Las claves localStorage originales se conservan.
- En Ajustes puedes activar el guardado automático en la biblioteca al reproducir y la búsqueda automática de letras. La velocidad también se puede cambiar desde el control de reproducción. El guardado de canciones externas conserva sus metadatos: no descarga su audio.
- Activa ♪ para consultar LRCLIB. Las letras sincronizadas se aceptan con una diferencia razonable de duración; si no coincide el tiempo, se pueden mostrar letras planas pero nunca se simulan marcas de tiempo. Pulsa una línea sincronizada para saltar. No todas las canciones tienen letras.
- La búsqueda musical usa YouTube Music mediante YouTube.js 18.3.0 (InnerTube, integración no oficial, solo metadatos), Audius (audio de pistas públicas disponibles) y Apple (metadatos y enlaces oficiales). La sección Videos consulta la búsqueda general de YouTube, además de la búsqueda musical. Puedes filtrar por canciones, videos, Audius o Apple. Los errores parciales se muestran; el resto de fuentes sigue disponible. Resultados ordenados por similitud del título y artista; los resultados comerciales están marcados como externos. No hace falta una API key de YouTube. Si un video está bloqueado, Buscar alternativas consulta videos y excluye el ID fallido; el usuario elige otra versión. No se eluden restricciones de reproducción. Las restricciones de inserción, región y titular permanecen. No hay extracción de audio de YouTube ni sustitución automática por otra canción. Los proveedores pueden cambiar, limitar o interrumpir sus servicios.
- Enlaces compartidos desde Discord: `?web=1&v=VIDEO_ID`, `?web=1&url=URL`, `?web=1&audio=URL` (adjuntos de audio compatibles y vigentes). Audius: `?web=1&audius=ID&title=...&artist=...`. Para canciones de YouTube bloqueadas, usa la fuente original. No se modifica tu bot (no fue adjuntado).

## Cuenta Nexus Web y audio sin conexión
- La web ya apunta a la app Web registrada del mismo proyecto Firebase que usa Android. La configuración pública (`apiKey`, `authDomain`, `projectId` y `appId`) está en `firebase-web-config.js`; no es una clave secreta y no debe confundirse con `NEXUS_API_KEY` de Nexus Forma.
- En Firebase Authentication activa Email/Contraseña y Google, y agrega el dominio HTTPS de Vercel a Authorized domains. La web acepta el mismo correo/contraseña y Google que la app.
- Mantén las reglas de `firestore.rules`: la biblioteca se escribe en `users/{uid}/nexusLibrary` y solo la puede leer/modificar su dueño. La sincronización combina canciones compatibles de este navegador con las guardadas en Nexus y respeta las eliminaciones remotas; al quitar una canción de la web estando conectado también se elimina de la biblioteca remota.
- El orden de Biblioteca Nexus se guarda como `webSortOrder` en esos documentos, sin cambiar las reglas de acceso.
- La sincronización incluye canciones con ID de YouTube de 11 caracteres y pistas Audius `au:…`. Favoritos, playlists, historial y archivos locales siguen siendo de este navegador por ahora.
- Inicio muestra **Continúa escuchando** y recomendaciones basadas en tus escuchas recientes, favoritos y artistas; el historial y esas preferencias se quedan en este navegador. Las sugerencias consultan el catálogo de YouTube Music y los chips de artista permiten buscar más canciones.
- En Biblioteca, pulsa **Importar audio** para guardar archivos propios en IndexedDB (máximo 100 MB por archivo). Se reproducen sin conexión en ese navegador; no se suben a Firebase ni se comparten con otros dispositivos. Abre NexusMusic al menos una vez en HTTPS con conexión para que el service worker guarde la página y sus recursos. La disponibilidad de almacenamiento depende del navegador.
- No se permite descargar audio desde YouTube Music ni de otras fuentes que no autoricen la descarga. Para escuchar offline, importa archivos de audio que tengas derecho a usar.

## Discord Rich Presence — sin código (opcional)
El ID de aplicación `1574721846249525328` se conserva. La llave pública no permite activar Rich Presence desde una web. No se utiliza token de usuario o bot ni un código universal.
1. Cierra el asistente anterior. Descarga el nuevo desde el botón Discord en la web, o utiliza `discord-bridge/` de este ZIP.
2. Abre Discord de escritorio. Desde la carpeta del asistente ejecuta `npm install` y `npm start`. En CachyOS/Linux también puedes ejecutar `bash install-linux.sh` para iniciar automáticamente el asistente al iniciar sesión (systemd de usuario, sin sudo).
3. En la web oficial, pulsa Discord → Activar presencia. Permite acceso local si el navegador lo pide. Tu preferencia se recuerda en localStorage; no necesitas pegar códigos. La página reintenta la conexión mientras esté activada.
4. El asistente intenta reconectarse a Discord y publica canción, artista, progreso y la carátula de fuentes admitidas, además de los botones Visitar NexusMusic y Escuchar en NexusMusic. Desactiva desde la web para dejar de compartir. El navegador puede bloquear acceso local; no se deben deshabilitar protecciones globales.
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
- Discord utiliza SET_ACTIVITY con tipo Listening (2) y portada externa de dominios permitidos (YouTube, Apple y Audius), con logo como alternativa. Si el cliente rechaza el asset, se reintenta sin portada. El texto visible depende del cliente Discord y no se ha probado con un cliente real.
- Pruebas Obsidian: 2 pruebas Node del buscador pasadas; prueba Chromium con DOM y Audio simulados, búsqueda, avance de primera a segunda y tercera canción, repetición, tema rosa, toggle glass, diálogo de ajustes, expansión, Discord simulado y anchura móvil, sin errores JS. No equivale a probar reproducción real ni proveedores en red.
