#!/usr/bin/env bash
set -e
# Backend belső porton (a Node proxy felé)
uvicorn server:app --host 0.0.0.0 --port 8000 &
# Frontend (a $PORT-on listenel – Railway erre irányít)
export API_BACKEND=http://127.0.0.1:8000
exec node scripts/serve.js
