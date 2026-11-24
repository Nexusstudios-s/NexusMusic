NexusMusic Web — instalación en Vercel

1. Copia el contenido de esta carpeta a la raíz del proyecto que contiene index.html. Conserva los assets originales y usa Node.js 22.x.
2. No necesitas una clave de YouTube: la búsqueda usa YouTube.js/InnerTube solo para consultar metadatos. La reproducción continúa usando el reproductor oficial.
3. En Vercel configura NEXUS_API_KEY como secreto para habilitar el chat Nexus-Nova. Nunca pongas esa clave en HTML, JavaScript público o una app móvil.
4. Usa el preset Other, la raíz donde están index.html y api/, sin build personalizado ni output directory distinto. Redeploy.
5. Comprueba /api/music-search?q=rock, /api/music-search?q=rock&source=videos y /listen?web=1.

Cuenta Nexus y audio sin conexión
- Configura la app Web de Firebase del mismo proyecto que Android. apiKey, authDomain, projectId y appId son configuración pública; no son la clave de Nexus Forma.
- Activa Email/Contraseña y Google en Firebase Authentication y agrega el dominio HTTPS a Authorized domains.
- La web sincroniza canciones compatibles en users/{uid}/nexusLibrary y mantiene el orden de Biblioteca. Las reglas Firestore deben seguir limitadas al dueño.
- Importa archivos de audio propios desde Biblioteca para escucharlos sin conexión en ese navegador. No se descargan pistas de YouTube ni audio de fuentes que no autoricen la descarga.
- Ajustes incluye guardado automático en la biblioteca, letras automáticas y control de velocidad. Las canciones externas se guardan como metadatos; el audio solo queda offline si importas un archivo autorizado.

La búsqueda, reproducción y disponibilidad de contenido dependen de cada proveedor. InnerTube no es una API oficial y puede cambiar sin aviso.
