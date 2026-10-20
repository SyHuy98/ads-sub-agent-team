#!/usr/bin/env sh
# Mở văn phòng Ads Team HQ có Claude Code thật (Mac/Linux).
cd "$(dirname "$0")"
PORT="${PORT:-8000}"
( sleep 1; (command -v open >/dev/null && open "http://localhost:$PORT") || (command -v xdg-open >/dev/null && xdg-open "http://localhost:$PORT") ) >/dev/null 2>&1 &
exec node server.js
