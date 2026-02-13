"""6 próbafoglalás létrehozása az adatbázisban."""
import db

TEST_BOOKINGS = [
    ("Kovács Anna", "+36 30 111 2233", "kovacs.anna@email.hu"),
    ("Nagy Péter", "+36 70 222 3344", "nagy.peter@gmail.com"),
    ("Szabó Eszter", "+36 20 333 4455", "szabo.eszter@freemail.hu"),
    ("Tóth Balázs", "+36 30 444 5566", "toth.balazs@outlook.com"),
    ("Horváth Mária", "+36 70 555 6677", "horvath.maria@email.hu"),
    ("Varga Dávid", "+36 20 666 7788", "varga.david@yahoo.hu"),
]

if __name__ == "__main__":
    slots = db.get_slots()
    free_ids = [s["id"] for s in slots if s.get("status") == "free"][:6]
    if len(free_ids) < 6:
        print(f"Csak {len(free_ids)} szabad időpont van. Foglalva: {len(free_ids)} db.")
    for i, slot_id in enumerate(free_ids):
        if i < len(TEST_BOOKINGS):
            name, phone, email = TEST_BOOKINGS[i]
            ok = db.book_slot(slot_id, name, phone, email)
            if ok:
                print(f"  ✓ Foglalva: {name} (id={slot_id})")
            else:
                print(f"  ✗ Nem sikerült: id={slot_id}")
    print("Kész.")
