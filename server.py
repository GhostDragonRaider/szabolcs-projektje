"""
FastAPI backend – egy fájl. 6 fix időpont a scedule_appointment.tsx számára.

Indítás (EBBA a projekt mappába, ahol a server.py van):
  uvicorn server:app --reload --port 8000

Ha a böngészőben nem ez a szöveg jelenik meg → a 8000-es porton MÁS fut.
Állítsd le (Ctrl+C), majd indítsd ezt a server.py-t a fenti paranccsal.
"""
import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel
import httpx

import db

MESSENGER_VERIFY_TOKEN = os.environ.get("MESSENGER_VERIFY_TOKEN", "chirostrong_webhook_2025")
MESSENGER_PAGE_ACCESS_TOKEN = os.environ.get("MESSENGER_PAGE_ACCESS_TOKEN", "")


class BookRequest(BaseModel):
    slot_id: int
    booking_name: str = ""
    phone: str = ""
    email: str = ""

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)







@app.on_event("startup")
def startup():
    db.init_db()
    print("\n>>> PROJECT1 server.py fut a 8000-es porton <<<")
    print(">>> Ha a böngészőben nem ezt látod, más szerver fut 8000-en – állítsd le. <<<\n")


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "app": "project1",
        "message": "Ez a project1/server.py – ha ezt látod, a helyes szerver fut.",
    }


@app.get("/api/which")
def which():
    """Közvetlenül a 8000-es porton: http://localhost:8000/api/which"""
    return {"app": "project1", "file": "server.py", "message": "Helyes szerver."}


@app.get("/api/slots")
@app.get("/slots")
def get_slots():
    """Időpontok az adatbázisból – a scedule_appointment.tsx ezt várja: id, date, time, status."""
    return db.get_slots()


@app.post("/api/book")
@app.post("/book")
def book_appointment(data: BookRequest):
    """Időpont foglalása. A foglaló neve, telefonszám és e-mail a kliensből jön."""
    ok = db.book_slot(data.slot_id, data.booking_name, data.phone, data.email)
    return {"ok": ok, "slot_id": data.slot_id}


# --- Admin API ---

@app.get("/api/admin/bookings")
@app.get("/admin/bookings")
def get_admin_bookings():
    """Csak a lefoglalt időpontok listája."""
    return db.get_booked_slots()


class UpdateBookingRequest(BaseModel):
    booking_name: str = ""
    phone: str = ""
    email: str = ""
    new_slot_id: int | None = None


@app.patch("/api/admin/bookings/{slot_id}")
@app.patch("/admin/bookings/{slot_id}")
def update_admin_booking(slot_id: int, data: UpdateBookingRequest):
    """Foglalás módosítása (adatok és/vagy időpont)."""
    if data.new_slot_id is not None and data.new_slot_id != slot_id:
        ok = db.move_booking(slot_id, data.new_slot_id, data.booking_name, data.phone, data.email)
    else:
        ok = db.update_booking(slot_id, data.booking_name, data.phone, data.email)
    return {"ok": ok}


@app.delete("/api/admin/bookings/{slot_id}")
@app.delete("/admin/bookings/{slot_id}")
def delete_admin_booking(slot_id: int):
    """Foglalás törlése."""
    ok = db.cancel_booking(slot_id)
    return {"ok": ok}


# --- Facebook Messenger webhook ---

def _send_messenger_message(recipient_id: str, text: str) -> bool:
    """Válasz küldése Messenger Send API-n keresztül."""
    if not MESSENGER_PAGE_ACCESS_TOKEN:
        return False
    url = f"https://graph.facebook.com/v21.0/me/messages?access_token={MESSENGER_PAGE_ACCESS_TOKEN}"
    payload = {
        "recipient": {"id": recipient_id},
        "messaging_type": "RESPONSE",
        "message": {"text": text},
    }
    try:
        with httpx.Client() as client:
            r = client.post(url, json=payload, timeout=10)
            return r.status_code == 200
    except Exception:
        return False


def _handle_messenger_message(sender_id: str, message_text: str) -> str:
    """Chatbot logika: üzenet alapján válasz generálása."""
    text = (message_text or "").strip().lower()
    if text in ("szia", "hello", "helo", "üdv", "üdvözöllek", "hi", "helló"):
        return "Szia! ChiroStrong időpontfoglaló bot vagyok. Írd: időpont – szabad időpontok, foglalás – rövid segítség."
    if "időpont" in text or "idopont" in text or "szabad" in text:
        slots = db.get_slots()
        free = [s for s in slots if s.get("status") == "free"][:10]
        if not free:
            return "Jelenleg nincs szabad időpont. Nézd meg az oldalunkat: szabolcs-projektje-production.up.railway.app/idopont"
        lines = ["Szabad időpontok:\n"] + [f"• {s['date']} {s['time']}" for s in free]
        return "\n".join(lines)
    if "foglal" in text or "web" in text or "oldal" in text:
        return "Időpontot itt foglalhatsz: https://szabolcs-projektje-production.up.railway.app/idopont"
    return "Üdvözöllek! ChiroStrong – csontkovács és manuálterapeuta. Írd: időpont – szabad időpontok, foglalás – webes foglalás."


@app.get("/api/messenger/webhook")
@app.get("/messenger/webhook")
def messenger_webhook_verify(request: Request):
    """Facebook webhook validáció – a Verify and save gomb erre hív."""
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")
    if mode == "subscribe" and token == MESSENGER_VERIFY_TOKEN:
        return PlainTextResponse(content=challenge)
    return PlainTextResponse(content="Forbidden", status_code=403)


@app.post("/api/messenger/webhook")
@app.post("/messenger/webhook")
async def messenger_webhook_post(request: Request):
    """Facebook webhook – bejövő üzenetek feldolgozása."""
    body = await request.json()
    if body.get("object") != "page":
        return {"ok": False}
    for entry in body.get("entry", []):
        for event in entry.get("messaging", []):
            sender_id = event.get("sender", {}).get("id")
            if not sender_id:
                continue
            if "message" in event:
                text = event["message"].get("text", "")
                reply = _handle_messenger_message(sender_id, text)
                _send_messenger_message(sender_id, reply)
    return {"ok": True}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
