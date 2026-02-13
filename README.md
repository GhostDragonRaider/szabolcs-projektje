# Project1

**React + TypeScript + Node.js** – NEM Vite.

- **React 18** + **TypeScript**
- **Node.js** környezet: **Express** szerver + **esbuild** bundle
- Nincs Vite, nincs Create React App

## Telepítés

```bash
npm install
```

## Parancsok

| Parancs       | Leírás                                      |
|---------------|---------------------------------------------|
| `npm run dev` | Fejlesztés: watch build + szerver (3000)    |
| `npm run build` | Production build → `dist/`               |
| `npm start`   | Szerver a `dist/` mappából (production)    |

## Indítás

```bash
npm run dev
```

Megnyitás: http://localhost:3000

Változás után a build újrafut; frissítsd a böngészőt.

## Backend (időpontok – FastAPI)

A `scedule_appointment.tsx` a `/api/slots` kérésre 6 fix időpontot vár. A backend egy fájlban van: `server.py`.

**Telepítés (Python):**
```bash
pip install -r requirements.txt
```

**Indítás (8000-es port) – EBBA a projekt mappából:**
```bash
cd /mnt/diskD/Webkészítés/project1
uvicorn server:app --reload --port 8000
```

Sikeres indításnál a terminálban: `>>> PROJECT1 server.py fut a 8000-es porton <<<`

**Ha a health / slots nem változik a böngészőben:** a 8000-es porton valószínűleg **más** fut (pl. AntiCode).  
→ Állítsd le azt (Ctrl+C a másik terminálban), majd indítsd **ezt** a `server.py`-t a fenti paranccsal **ezen projekt** mappájából.

**Ellenőrzés:** nyisd meg **http://localhost:8000/api/health** – ha ez a project1, ezt látod:  
`{"status":"ok","app":"project1","message":"Ez a project1/server.py – ha ezt látod, a helyes szerver fut."}`  
Ha más szöveg jön → más szerver fut 8000-en.

## Emlékeztető e-mail

Az időpont 1 órával előtt a rendszer automatikusan e-mailt küld a foglalónak. Beállítás környezeti változókkal:

- `SMTP_HOST` – SMTP szerver (pl. smtp.gmail.com)
- `SMTP_PORT` – port (általában 587)
- `SMTP_USER` – SMTP felhasználónév
- `SMTP_PASS` – SMTP jelszó
- `REMINDER_FROM_EMAIL` – (opcionális) feladó e-mail cím

Ha nincs beállítva → emlékeztető nem küldhető (log üzenet).

## Struktúra

```
project1/
├── scripts/
│   ├── build.js   # esbuild (TypeScript/React → dist/main.js)
│   └── serve.js   # Express szerver
├── src/
│   ├── main.tsx   # React belépés
│   ├── App.tsx
│   └── env.d.ts
├── dist/          # build kimenet (generált)
├── server.py      # FastAPI backend – 6 fix időpont (/api/slots)
├── requirements.txt
├── package.json   # Nincs Vite – express, esbuild, react
└── tsconfig.json
```
