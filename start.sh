#!/usr/bin/env bash
set -e
# Nix PATH – Node elérhető legyen a runtime-ban
export PATH="/root/.nix-profile/bin:/usr/local/bin:/usr/bin:$PATH"
# Backend belső porton (a Node proxy felé)
uvicorn server:app --host 0.0.0.0 --port 8000 &
# Frontend (a $PORT-on listenel – Railway erre irányít)
export API_BACKEND=http://127.0.0.1:8000
exec node scripts/serve.js
