NexusMusic Web — instalación en Vercel
1. Copia estos archivos en la raíz del proyecto que contiene index.html. Conserva tu carpeta assets y version.json originales (no estaban adjuntos).
2. En Google Cloud Console habilita YouTube Data API v3 y crea una API key. Restringe la clave a YouTube Data API v3. No la pongas en HTML ni JS público.
3. En Vercel > proyecto > Settings > Environment Variables agrega YOUTUBE_API_KEY con tu clave. Opcional: YOUTUBE_REGION=CO (país de búsqueda).
4. Usa Framework Preset Other, raíz donde están index.html y api/, sin build personalizado ni output directory distinto. Redeploy.
5. Abre /api/music-search?q=rock y verifica JSON con items; luego /listen?web=1 y busca una canción.
La reproducción usa YouTube oficial, puede incluir anuncios y estar restringida por titular o región. No extrae audio ni permite descargar. La cuota de Google no es ilimitada. La caché temporal no garantiza protección contra abuso; para producción pública añade rate limiting en Vercel.
