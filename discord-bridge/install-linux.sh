#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"
command -v node >/dev/null || { echo 'Instala Node.js primero (CachyOS: run0 pacman -Syu nodejs npm).'; exit 1; }
command -v npm >/dev/null || { echo 'Instala npm primero.'; exit 1; }
command -v systemctl >/dev/null || { echo 'Se requiere systemd de usuario.'; exit 1; }
# Copy to a stable per-user directory; do not require administrator privileges.
base="$HOME/.local/share/nexusmusic-discord"; mkdir -p "$base" "$HOME/.config/systemd/user"
cp package.json bridge.cjs "$base/"
(cd "$base" && npm install --omit=dev)
nodepath="$(command -v node)"
cat > "$HOME/.config/systemd/user/nexusmusic-discord.service" <<UNIT
[Unit]
Description=NexusMusic Discord Presence
After=graphical-session.target
[Service]
Type=simple
WorkingDirectory=%h/.local/share/nexusmusic-discord
ExecStart="$nodepath" %h/.local/share/nexusmusic-discord/bridge.cjs
Restart=on-failure
RestartSec=5
[Install]
WantedBy=default.target
UNIT
systemctl --user daemon-reload
systemctl --user enable nexusmusic-discord.service
systemctl --user restart nexusmusic-discord.service
echo 'Instalado. El asistente arrancará al iniciar sesión. Abre Discord y activa presencia en NexusMusic.'
