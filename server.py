"""
FastAPI backend – egy fájl. 6 fix időpont a scedule_appointment.tsx számára.

Indítás (EBBA a projekt mappába, ahol a server.py van):
  uvicorn server:app --reload --port 8000

Ha a böngészőben nem ez a szöveg jelenik meg → a 8000-es porton MÁS fut.
Állítsd le (Ctrl+C), majd indítsd ezt a server.py-t a fenti paranccsal.

Emlékeztető e-mail: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, REMINDER_FROM_EMAIL env.
"""
import os
import re
import smtplib
import threading
import time
from collections import defaultdict
from datetime import date, datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel
import httpx

import db

# Validáció: magyar telefon (min. 9 számjegy), e-mail (xxx@yyy.zz)
def _is_valid_phone(s: str) -> bool:
    if not s or not isinstance(s, str):
        return False
    digits = re.sub(r"\D", "", s)
    return len(digits) >= 9


def _is_valid_email(s: str) -> bool:
    if not s or not isinstance(s, str):
        return False
    return bool(re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", s.strip()))

MESSENGER_VERIFY_TOKEN = os.environ.get("MESSENGER_VERIFY_TOKEN", "chirostrong_webhook_2025")
MESSENGER_PAGE_ACCESS_TOKEN = os.environ.get("MESSENGER_PAGE_ACCESS_TOKEN", "")

HONAPOK = {"01": "január", "02": "február", "03": "március", "04": "április", "05": "május",
           "06": "június", "07": "július", "08": "augusztus", "09": "szeptember",
           "10": "október", "11": "november", "12": "december"}

USER_STATE: dict[str, dict] = defaultdict(dict)


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







REMINDER_INTERVAL_MIN = 15
_scheduler_stop = threading.Event()


def _send_reminder_email(to_email: str, name: str, slot_date: str, slot_time: str) -> bool:
    """Emlékeztető e-mail küldése."""
    host = os.environ.get("SMTP_HOST")
    port = int(os.environ.get("SMTP_PORT", "587"))
    user = os.environ.get("SMTP_USER")
    password = os.environ.get("SMTP_PASS")
    from_addr = os.environ.get("REMINDER_FROM_EMAIL", user or "noreply@example.com")
    if not host or not user or not password:
        print("[Reminder] SMTP nincs beállítva (SMTP_HOST, SMTP_USER, SMTP_PASS). E-mail nem küldhető.")
        return False
    body = (
        f"Kedves {name}!\n\n"
        f"Emlékeztetjük: várunk szeretettel az időpontodon ({slot_date} {slot_time}). Ne feledkezz el róla!\n\n"
        f"Időpont: {slot_date} – {slot_time}\n"
        f"Cím: 3980 Sátoraljaújhely, Hősök tere út 2\n\n"
        f"Szolgáltatás díja: 30 € / 11 000 Ft\n\n"
        f"Üdvözlettel,\nChiroStrong"
    )
    msg = MIMEMultipart()
    msg["From"] = from_addr
    msg["To"] = to_email
    msg["Subject"] = f"ChiroStrong – emlékeztető: {slot_date} {slot_time}"
    msg.attach(MIMEText(body, "plain", "utf-8"))
    try:
        with smtplib.SMTP(host, port) as s:
            s.starttls()
            s.login(user, password)
            s.sendmail(from_addr, [to_email], msg.as_string())
        print(f"[Reminder] E-mail küldve: {to_email} ({slot_date} {slot_time})")
        return True
    except Exception as e:
        print(f"[Reminder] E-mail hiba: {e}")
        return False


def _run_reminders():
    """Emlékeztetők ellenőrzése és küldése."""
    while not _scheduler_stop.is_set():
        try:
            for booking in db.get_bookings_needing_reminder():
                email = (booking.get("email") or "").strip()
                name = booking.get("booking_name") or "Kedves vendég"
                slot_date = booking.get("date", "")
                slot_time = booking.get("time", "")
                slot_id = booking.get("id")
                if email and slot_id:
                    if _send_reminder_email(email, name, slot_date, slot_time):
                        db.mark_reminder_sent(slot_id)
        except Exception as e:
            print(f"[Reminder] Hiba: {e}")
        _scheduler_stop.wait(timeout=REMINDER_INTERVAL_MIN * 60)


@app.on_event("startup")
def startup():
    db.init_db()
    t = threading.Thread(target=_run_reminders, daemon=True)
    t.start()
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
    if not _is_valid_phone(data.phone):
        return {"ok": False, "error": "Érvényes telefonszámot adj meg (pl. +36 30 123 4567 vagy 06 30 123 4567)."}
    if not _is_valid_email(data.email):
        return {"ok": False, "error": "Érvényes e-mail címet adj meg (pl. pelda@email.hu)."}
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
    if not _is_valid_phone(data.phone):
        return {"ok": False, "error": "Érvényes telefonszámot adj meg."}
    if not _is_valid_email(data.email):
        return {"ok": False, "error": "Érvényes e-mail címet adj meg."}
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

def _messenger_send(recipient_id: str, message: dict) -> bool:
    """Üzenet küldése Messenger Send API-n."""
    if not MESSENGER_PAGE_ACCESS_TOKEN:
        print("[Messenger] HIBA: MESSENGER_PAGE_ACCESS_TOKEN nincs beállítva")
        return False
    url = f"https://graph.facebook.com/v21.0/me/messages?access_token={MESSENGER_PAGE_ACCESS_TOKEN}"
    payload = {"recipient": {"id": recipient_id}, "messaging_type": "RESPONSE", "message": message}
    try:
        with httpx.Client() as client:
            r = client.post(url, json=payload, timeout=10)
            if r.status_code != 200:
                print(f"[Messenger] Send API hiba: {r.status_code} {r.text}")
            return r.status_code == 200
    except Exception as e:
        print(f"[Messenger] Send API exception: {e}")
        return False


def _send_text(rid: str, text: str) -> bool:
    return _messenger_send(rid, {"text": text})


def _send_buttons(rid: str, text: str, buttons: list[dict]) -> bool:
    """buttons: [{title, payload}, ...] max 3"""
    btns = [{"type": "postback", "title": b["title"], "payload": b["payload"]} for b in buttons[:3]]
    msg = {"attachment": {"type": "template", "payload": {"template_type": "button", "text": text, "buttons": btns}}}
    return _messenger_send(rid, msg)


def _send_quick_replies(rid: str, text: str, replies: list[dict]) -> bool:
    """replies: [{title, payload}, ...] max 13"""
    qr = [{"content_type": "text", "title": r["title"], "payload": r["payload"]} for r in replies[:13]]
    return _messenger_send(rid, {"text": text, "quick_replies": qr})


def _send_greeting_with_button(rid: str) -> bool:
    return _send_buttons(rid, "Szia! ChiroStrong időpontfoglaló bot vagyok. Üdvözöllek! Foglalj időpontot az alábbi gombbal.", [{"title": "Időpont foglalása", "payload": "BOOK_START"}])


def _get_free_slots():
    return [s for s in db.get_slots() if s.get("status") == "free"]


def _months_from_slots(slots: list) -> list[tuple[str, str]]:
    """(yyyy-mm, megjelenített név) párok"""
    seen = set()
    out = []
    for s in slots:
        d = s.get("date", "")
        if len(d) >= 7:
            ym = d[:7]
            if ym not in seen:
                seen.add(ym)
                mn = d[5:7]
                out.append((ym, HONAPOK.get(mn, mn)))
    return sorted(out)[:3]


def _weeks_in_month(slots: list, yyyy_mm: str) -> list[tuple[str, str]]:
    """(week_key, megjelenített név) - hét kezdő dátuma"""
    out = []
    seen = set()
    for s in slots:
        d = s.get("date", "")
        if d.startswith(yyyy_mm):
            try:
                dt = date.fromisoformat(d)
                wk_start = dt - timedelta(days=dt.weekday())
                wk_end = wk_start + timedelta(days=6)
                key = wk_start.isoformat()
                if key not in seen:
                    seen.add(key)
                    mn = HONAPOK.get(wk_start.strftime("%m"), "")
                    out.append((key, f"{wk_start.day}.–{wk_end.day}. {mn}"))
            except (ValueError, AttributeError):
                pass
    return sorted(out)


def _days_in_week(slots: list, week_start: str) -> list[tuple[str, str]]:
    """(date, megjelenített név)"""
    out = []
    try:
        start = date.fromisoformat(week_start)
        for i in range(7):
            d = start + timedelta(days=i)
            ds = d.isoformat()
            if any(s.get("date") == ds for s in slots):
                day_names = ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat", "Vasárnap"]
                out.append((ds, f"{day_names[d.weekday()]} {d.day}."))
    except ValueError:
        pass
    return out


def _slots_for_day(slots: list, day: str) -> list[dict]:
    return [s for s in slots if s.get("date") == day and s.get("status") == "free"]


def _handle_postback(sender_id: str, payload: str) -> None:
    state = USER_STATE[sender_id]
    slots = _get_free_slots()

    if payload in ("GET_STARTED_PAYLOAD", "GET_STARTED"):
        _send_greeting_with_button(sender_id)
    elif payload == "BOOK_START":
        state.clear()
        state["step"] = "month"
        months = _months_from_slots(slots)
        if not months:
            _send_text(sender_id, "Jelenleg nincs szabad időpont. Nézd meg az oldalunkat: https://szabolcs-projektje-production.up.railway.app/idopont")
            return
        replies = [{"title": m[1], "payload": f"month:{m[0]}"} for m in months]
        replies.append({"title": "Vissza", "payload": "BACK_MAIN"})
        _send_quick_replies(sender_id, "Melyik hónapra szeretnél foglalni?", replies)

    elif payload == "BACK_MAIN":
        state.clear()
        _send_greeting_with_button(sender_id)

    elif payload.startswith("CANCEL_SLOT:"):
        try:
            slot_id = int(payload.split(":", 1)[1])
        except (ValueError, IndexError):
            _send_text(sender_id, "Hiba történt.")
            return
        ok = db.cancel_booking(slot_id)
        if ok:
            _send_text(sender_id, "A jelenleg lefoglalt időpontod törlésre került.")
            _send_buttons(sender_id, "Szeretnél új időpontot foglalni?", [{"title": "Új időpont foglalása", "payload": "BOOK_START"}])
        else:
            _send_text(sender_id, "Az időpont törlése sikertelen. Keress minket: blazsi88@gmail.com")

    elif payload.startswith("month:"):
        yyyy_mm = payload[6:]
        state["month"] = yyyy_mm
        state["step"] = "week"
        weeks = _weeks_in_month(slots, yyyy_mm)
        if not weeks:
            _send_text(sender_id, "Ebben a hónapban nincs szabad időpont.")
            return
        replies = [{"title": w[1], "payload": f"week:{w[0]}"} for w in weeks]
        replies.append({"title": "Vissza az előző menüre", "payload": "BOOK_START"})
        _send_quick_replies(sender_id, "Melyik hetére szeretnél időpontot?", replies)

    elif payload.startswith("week:"):
        week_start = payload[5:]
        state["week"] = week_start
        state["step"] = "day"
        days = _days_in_week(slots, week_start)
        if not days:
            _send_text(sender_id, "Ebben a héten nincs szabad nap.")
            return
        replies = [{"title": d[1], "payload": f"day:{d[0]}"} for d in days]
        replies.append({"title": "Vissza az előző menüre", "payload": f"month:{state.get('month','')}"})
        _send_quick_replies(sender_id, "Melyik napra szeretnél időpontot?", replies)

    elif payload.startswith("day:"):
        day = payload[4:]
        state["day"] = day
        try:
            dt = date.fromisoformat(day)
            state["week"] = (dt - timedelta(days=dt.weekday())).isoformat()
            if not state.get("month"):
                state["month"] = day[:7]
        except ValueError:
            pass
        state["step"] = "slot"
        day_slots = _slots_for_day(slots, day)
        if not day_slots:
            _send_text(sender_id, "Ezen a napon nincs szabad időpont.")
            return
        replies = [{"title": s["time"], "payload": f"slot:{s['id']}"} for s in day_slots]
        replies.append({"title": "Vissza", "payload": f"week:{state.get('week','')}"})
        _send_quick_replies(sender_id, "Válassz időpontot:", replies)

    elif payload.startswith("slot:"):
        slot_id = int(payload[5:])
        state["slot_id"] = slot_id
        state["step"] = "ask_name"
        slot = next((s for s in slots if s.get("id") == slot_id), None)
        if slot:
            state["slot_date"] = slot.get("date", "")
            state["slot_time"] = slot.get("time", "")
        _send_text(sender_id, "Add meg a neved:")


def _handle_message_text(sender_id: str, text: str) -> None:
    state = USER_STATE[sender_id]
    step = state.get("step", "")

    if step == "ask_name":
        state["name"] = (text or "").strip()
        state["step"] = "ask_phone"
        _send_text(sender_id, "Add meg a telefonszámod:")
        return
    if step == "ask_phone":
        phone = (text or "").strip()
        if not _is_valid_phone(phone):
            _send_text(sender_id, "Érvényes telefonszámot adj meg (pl. +36 30 123 4567 vagy 06 30 123 4567). Próbáld újra:")
            return
        state["phone"] = phone
        state["step"] = "ask_email"
        _send_text(sender_id, "Add meg az e-mail címed:")
        return
    if step == "ask_email":
        email = (text or "").strip()
        if not _is_valid_email(email):
            _send_text(sender_id, "Érvényes e-mail címet adj meg (pl. pelda@email.hu). Próbáld újra:")
            return
        state["email"] = email
        name = state.get("name", "")
        phone = state.get("phone", "")
        email = state.get("email", "")
        slot_id = state.get("slot_id")
        if not slot_id:
            _send_text(sender_id, "Hiba történt. Kezdd elölről.")
            state.clear()
            _send_greeting_with_button(sender_id)
            return
        ok = db.book_slot(slot_id, name, phone, email)
        slot_date = state.get("slot_date", "")
        slot_time = state.get("slot_time", "")
        day_back = state.get("day", "")
        state.clear()
        if ok:
            msg = (
                f"✅ Foglalás visszaigazolva!\n\n"
                f"Időpont: {slot_date} – {slot_time}\n"
                f"Név: {name}\n"
                f"Telefon: {phone}\n"
                f"E-mail: {email}\n\n"
                f"Várjuk a 3980 Sátoraljaújhely, Hősök tere út 2 címen.\n"
                f"Szolgáltatás díja: 30 € / 11 000 Ft\n\n"
                f"Kérdés esetén érdeklődjön az alábbi e-mail címen:\nblazsi88@gmail.com"
            )
            _send_text(sender_id, msg)
            _send_buttons(sender_id, "Ha meggondoltad magad, akkor:", [{"title": "Időpont lemondása", "payload": f"CANCEL_SLOT:{slot_id}"}])
        else:
            _send_text(sender_id, "Sajnos az időpont már foglalt. Válassz másik időpontot.")
            if day_back:
                _handle_postback(sender_id, f"day:{day_back}")
            else:
                _send_greeting_with_button(sender_id)
        return

    text_lower = (text or "").strip().lower()
    if text_lower in ("szia", "hello", "helo", "üdv", "üdvözöllek", "hi", "helló", "üdvözöllek"):
        _send_greeting_with_button(sender_id)
    elif "időpont" in text_lower or "idopont" in text_lower or "foglal" in text_lower:
        _handle_postback(sender_id, "BOOK_START")
    else:
        _send_greeting_with_button(sender_id)


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
    try:
        body = await request.json()
    except Exception:
        print("[Messenger] Webhook: nem JSON body")
        return {"ok": False}
    if body.get("object") != "page":
        return {"ok": True}
    for entry in body.get("entry", []):
        for event in entry.get("messaging", []):
            if event.get("message", {}).get("is_echo"):
                continue
            sender_id = event.get("sender", {}).get("id")
            if not sender_id:
                continue
            if "postback" in event:
                payload = event["postback"].get("payload", "")
                print(f"[Messenger] Postback: sender={sender_id} payload={payload!r}")
                _handle_postback(sender_id, payload)
            elif "message" in event:
                msg = event["message"]
                qr = msg.get("quick_reply", {})
                payload = qr.get("payload", "")
                if payload:
                    print(f"[Messenger] Quick reply: sender={sender_id} payload={payload!r}")
                    _handle_postback(sender_id, payload)
                else:
                    text = msg.get("text", "")
                    print(f"[Messenger] Üzenet: sender={sender_id} text={text!r}")
                    _handle_message_text(sender_id, text)
    return {"ok": True}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
