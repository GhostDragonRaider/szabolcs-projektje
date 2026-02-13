#!/usr/bin/env bash
set -e
# Nix környezet betöltése (Railway Nixpacks)
[ -f /root/.nix-profile/etc/profile.d/nix.sh ] && . /root/.nix-profile/etc/profile.d/nix.sh
export PATH="/root/.nix-profile/bin:/nix/var/nix/profiles/default/bin:/usr/local/bin:/usr/bin:$PATH"
# Backend belső porton (a Node proxy felé)
python3 -m uvicorn server:app --host 0.0.0.0 --port 8000 &
# Frontend (a $PORT-on listenel – Railway erre irányít)
export API_BACKEND=http://127.0.0.1:8000
exec node scripts/serve.js
