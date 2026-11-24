# Discord · conexión automática (v2)
Ejecuta en tu equipo, no en Vercel. Requiere Discord de escritorio y Node.js 18+ con npm.
1. `npm install` y `npm start` desde esta carpeta (cierra el asistente viejo antes).
2. Abre https://nexusmusicx.vercel.app/listen?web=1 y pulsa Discord → Activar presencia. Permite el acceso a loopback/red local si el navegador lo solicita.
3. Tu preferencia se conserva en localStorage; el navegador intentará volver a conectarse automáticamente. Puedes desactivarla desde la web. Si no está abierto el asistente o Discord, no se publicará actividad.

En CachyOS/Linux con systemd, para instalar el asistente en el inicio de sesión, ejecuta `bash install-linux.sh` desde esta carpeta. Si usas VS Code Flatpak, ejecuta el instalador en el sistema anfitrión:

```bash
flatpak-spawn --host bash /home/dextermorgan/Documentos/NexusMusicCCP/landing/discord-bridge/install-linux.sh
```

Comprueba el servicio con `systemctl --user status nexusmusic-discord.service`. Para quitar el arranque automático: `systemctl --user disable --now nexusmusic-discord.service`.

En Windows, instala Node.js 18 o posterior y ejecuta PowerShell desde esta carpeta:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\install-windows.ps1
```

El instalador copia el asistente a `%LOCALAPPDATA%\NexusMusic\discord-bridge`, instala sus dependencias y crea una tarea del Programador de tareas para iniciarlo al iniciar sesión. No requiere permisos de administrador. Si el puerto 17845 ya está ocupado, cierra el asistente anterior y vuelve a ejecutar el comando.

No compartas tokens ni instales un código universal. El asistente escucha solo en 127.0.0.1:17845 y acepta exclusivamente el origen HTTPS oficial de NexusMusic, con preflight y cabecera de cliente. La preferencia no se sincroniza entre navegadores. La actividad se borra al dejar de recibir actualizaciones; cada pestaña solo limpia su propia sesión. En caso de que el navegador no permita acceso local, usa un navegador compatible y su permiso de sitio.

Obsidian: actividad de tipo Listening (2), portada externa si es compatible y reconexión sin código. El cliente real puede no mostrar la portada o los botones; los adjuntos privados no se comparten. Si ya tienes el servicio de usuario instalado, vuelve a ejecutar install-linux.sh desde esta versión para actualizarlo y reiniciarlo.
