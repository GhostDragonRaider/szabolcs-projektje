"""
Adatbázis kezelő – időpontok (slots) tárolása SQLite-ban.
Tábla: id, date, time, status, booking_name
- Hétköznap: 15:15, 16:15, 17:00, 17:45, 18:30
- Hétvége: 08:30, 09:30, 10:30, 11:15, 12:00
- Mindig aktuális + következő hónap; hóvégén (25-től) a következő utáni hónap is.
"""
import sqlite3
from contextlib import contextmanager
from datetime import date, timedelta
from calendar import monthrange
from pathlib import Path

DB_PATH = Path(__file__).parent / "app.db"

WEEKDAY_TIMES = ["15:15", "16:15", "17:00", "17:45", "18:30"]
WEEKEND_TIMES = ["08:30", "09:30", "10:30", "11:15", "12:00"]


@contextmanager
def get_connection():
    """Környezetkezelő az adatbázis kapcsolathoz."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def _get_month_range() -> tuple[date, date]:
    """Visszaadja a szükséges dátumtartományt: (kezdő_nap, záró_nap).
    Alap: aktuális + következő hónap.
    Hóvégén (25-től): + következő utáni hónap is."""
    today = date.today()
    start = today.replace(day=1)  # ehónap 1-je

    year, month = today.year, today.month
    _, last_day = monthrange(year, month)
    end_next = date(year, month, last_day)  # ehónap vége

    # következő hónap vége
    if month == 12:
        year, month = year + 1, 1
    else:
        month += 1
    _, last_day = monthrange(year, month)
    end_next_next = date(year, month, last_day)

    if today.day >= 25:
        # hóvége: a következő utáni hónap vége
        if month == 12:
            year, month = year + 1, 1
        else:
            month += 1
        _, last_day = monthrange(year, month)
        end = date(year, month, last_day)
    else:
        end = end_next_next

    return start, end


def _generate_slots_to_insert() -> list[tuple[str, str]]:
    """Generálja a beszúrandó (date, time) párokat."""
    start, end = _get_month_range()
    slots: list[tuple[str, str]] = []
    d = start
    while d <= end:
        weekday = d.weekday()  # 0=Hétfő, 6=Vasárnap
        times = WEEKDAY_TIMES if weekday < 5 else WEEKEND_TIMES
        for t in times:
            slots.append((d.isoformat(), t))
        d += timedelta(days=1)
    return slots


def init_db():
    """Létrehozza a slots táblát, ha még nem létezik, és feltölti a hiányzó slotokat.
    Nem törli a meglévő táblát sem a tartalmát. Resethez töröld az app.db fájlt."""
    with get_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS slots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                time TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'free',
                booking_name TEXT,
                phone TEXT,
                email TEXT,
                UNIQUE(date, time)
            )
        """)
        try:
            conn.execute("ALTER TABLE slots ADD COLUMN phone TEXT")
        except sqlite3.OperationalError:
            pass
        try:
            conn.execute("ALTER TABLE slots ADD COLUMN email TEXT")
        except sqlite3.OperationalError:
            pass
        _ensure_slots_exist(conn)


def _ensure_slots_exist(conn: sqlite3.Connection):
    """Ha új hónapok kerültek a tartományba, beszúrja a hiányzó slotokat."""
    for d, t in _generate_slots_to_insert():
        conn.execute(
            "INSERT OR IGNORE INTO slots (date, time, status) VALUES (?, ?, 'free')",
            (d, t),
        )


def get_slots():
    """Visszaadja az időpontokat: mai napról, aktuális + következő hónap(ok) ablakában.
    Ha booking_name nem üres, status = 'booked'."""
    with get_connection() as conn:
        _ensure_slots_exist(conn)
        today = date.today().isoformat()
        start, end = _get_month_range()
        start_s, end_s = start.isoformat(), end.isoformat()
        rows = conn.execute(
            """
            SELECT id, date, time,
                   CASE WHEN COALESCE(booking_name, '') != '' THEN 'booked' ELSE status END AS status
            FROM slots
            WHERE date >= ? AND date BETWEEN ? AND ?
            ORDER BY date, time
            """,
            (today, start_s, end_s),
        ).fetchall()
        return [dict(row) for row in rows]


def update_slot_status(slot_id: int, status: str) -> bool:
    """Frissíti egy időpont státuszát (pl. 'free' → 'booked')."""
    with get_connection() as conn:
        cur = conn.execute("UPDATE slots SET status = ? WHERE id = ?", (status, slot_id))
        return cur.rowcount > 0


def book_slot(slot_id: int, booking_name: str, phone: str = "", email: str = "") -> bool:
    """Foglalás: booking_name, phone, email beírása, status → 'booked'."""
    with get_connection() as conn:
        try:
            conn.execute("ALTER TABLE slots ADD COLUMN phone TEXT")
        except sqlite3.OperationalError:
            pass
        try:
            conn.execute("ALTER TABLE slots ADD COLUMN email TEXT")
        except sqlite3.OperationalError:
            pass
        cur = conn.execute(
            "UPDATE slots SET booking_name = ?, phone = ?, email = ?, status = 'booked' WHERE id = ? AND status = 'free'",
            (booking_name, phone or "", email or "", slot_id),
        )
        return cur.rowcount > 0


def get_slot(slot_id: int) -> dict | None:
    """Egy adott időpont lekérése ID alapján."""
    with get_connection() as conn:
        row = conn.execute(
            "SELECT id, date, time, status, booking_name, phone, email FROM slots WHERE id = ?",
            (slot_id,),
        ).fetchone()
        if not row:
            return None
        d = dict(row)
        if d.get("booking_name"):
            d["status"] = "booked"
        return d


def get_booked_slots():
    """Csak a lefoglalt időpontok listája, dátum és idő szerint rendezve."""
    with get_connection() as conn:
        rows = conn.execute(
            """
            SELECT id, date, time, status, booking_name, phone, email
            FROM slots
            WHERE status = 'booked' OR COALESCE(booking_name, '') != ''
            ORDER BY date, time
            """
        ).fetchall()
        return [dict(row) for row in rows]


def update_booking(slot_id: int, booking_name: str, phone: str = "", email: str = "") -> bool:
    """Foglalás módosítása."""
    with get_connection() as conn:
        cur = conn.execute(
            "UPDATE slots SET booking_name = ?, phone = ?, email = ? WHERE id = ? AND status = 'booked'",
            (booking_name, phone or "", email or "", slot_id),
        )
        return cur.rowcount > 0


def cancel_booking(slot_id: int) -> bool:
    """Foglalás törlése: status='free', adatok törlése."""
    with get_connection() as conn:
        cur = conn.execute(
            "UPDATE slots SET status = 'free', booking_name = NULL, phone = NULL, email = NULL WHERE id = ?",
            (slot_id,),
        )
        return cur.rowcount > 0


def move_booking(
    old_slot_id: int,
    new_slot_id: int,
    booking_name: str,
    phone: str = "",
    email: str = "",
) -> bool:
    """Foglalás áthelyezése egyik időpontból a másikba."""
    if old_slot_id == new_slot_id:
        return update_booking(old_slot_id, booking_name, phone, email)
    with get_connection() as conn:
        cur = conn.execute(
            "UPDATE slots SET booking_name = ?, phone = ?, email = ?, status = 'booked' WHERE id = ? AND status = 'free'",
            (booking_name or "", phone or "", email or "", new_slot_id),
        )
        if cur.rowcount == 0:
            return False
        conn.execute(
            "UPDATE slots SET status = 'free', booking_name = NULL, phone = NULL, email = NULL WHERE id = ?",
            (old_slot_id,),
        )
        return True
