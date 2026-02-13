import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import styled from "@emotion/styled"

const API_BASE = "" // relatív: /api → proxy a backendre (dev és production)
const ADMIN_KEY = "admin_session"

type BookedSlot = {
  id: number
  date: string
  time: string
  status: string
  booking_name: string
  phone: string
  email: string
}

type Slot = { id: number; date: string; time: string; status: string }

const Page = styled.div`
  min-height: 100vh;
  padding: 2rem;
  background: #f5f5f5;

  @media (max-width: 640px) {
    padding: 1rem;
  }

  @media (max-width: 400px) {
    padding: 0.75rem;
  }
`

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #ddd;

  @media (max-width: 640px) {
    margin-bottom: 1.5rem;
    padding-bottom: 0.75rem;
  }
`

const Title = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  color: #333;

  @media (max-width: 640px) {
    font-size: 1.2rem;
  }

  @media (max-width: 400px) {
    font-size: 1.1rem;
  }
`

const LogoutButton = styled.button`
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;

  &:hover {
    background: #eee;
  }

  @media (max-width: 640px) {
    padding: 0.4rem 0.75rem;
    font-size: 0.85rem;
  }
`

const ContentRow = styled.div<{ hasPanel?: boolean }>`
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  padding-right: ${({ hasPanel }) => (hasPanel ? "400px" : "0")};

  @media (max-width: 900px) {
    flex-direction: column;
    padding-right: 0;
    gap: 1.5rem;
  }

  @media (max-width: 640px) {
    gap: 1rem;
  }
`

const ListWrapper = styled.div`
  flex: 1;
  min-width: 0;
`

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 0.4rem;
  }
`

const ListItem = styled.li<{ selected?: boolean }>`
  padding: 1rem;
  margin-bottom: 0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid ${({ selected }) => (selected ? "#667eea" : "transparent")};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &:hover {
    background: #fafafa;
  }

  @media (max-width: 640px) {
    padding: 0.85rem;
  }

  @media (max-width: 400px) {
    padding: 0.75rem;
  }
`

const SlotDate = styled.span`
  font-weight: 700;
  color: #333;

  @media (max-width: 640px) {
    font-size: 0.95rem;
  }
`

const SlotTime = styled.span`
  margin-left: 0.5rem;
  color: #666;

  @media (max-width: 640px) {
    font-size: 0.9rem;
  }
`

const DetailPanel = styled.div`
  position: fixed;
  top: 8.5rem;
  right: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  width: 360px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;

  @media (max-width: 900px) {
    position: static;
    width: 100%;
    max-width: 480px;
  }

  @media (max-width: 640px) {
    padding: 1.25rem;
    border-radius: 10px;
  }

  @media (max-width: 400px) {
    padding: 1rem;
  }
`

const DetailTitle = styled.h3`
  margin: 0 0 1rem;
  font-size: 1.1rem;
  color: #333;

  @media (max-width: 640px) {
    font-size: 1rem;
    margin-bottom: 0.85rem;
  }
`

const DetailLine = styled.p`
  margin: 0 0 0.5rem;
  font-size: 0.95rem;
  color: #555;
  word-break: break-word;

  @media (max-width: 640px) {
    font-size: 0.9rem;
  }
`

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;

  @media (max-width: 400px) {
    flex-direction: column;
  }
`

const ActionButton = styled.button<{ danger?: boolean }>`
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background: ${({ danger }) => (danger ? "#dc3545" : "#667eea")};
  color: white;

  &:hover {
    opacity: 0.9;
  }

  @media (max-width: 400px) {
    width: 100%;
    padding: 0.6rem;
  }
`

const EditForm = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  display: grid;
  gap: 0.75rem;

  @media (max-width: 640px) {
    gap: 0.6rem;
    margin-top: 0.85rem;
    padding-top: 0.85rem;
  }
`

const Input = styled.input`
  padding: 0.5rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.95rem;

  @media (max-width: 640px) {
    padding: 0.5rem 0.65rem;
    font-size: 0.9rem;
  }
`

const Label = styled.label`
  display: grid;
  gap: 0.25rem;
  font-size: 0.9rem;
  color: #555;

  @media (max-width: 640px) {
    font-size: 0.85rem;
  }
`

const EmptyText = styled.p`
  color: #888;
  font-style: italic;

  @media (max-width: 640px) {
    font-size: 0.95rem;
  }
`

const LoadingText = styled.p`
  margin: 0;
  color: #666;

  @media (max-width: 640px) {
    font-size: 0.95rem;
  }
`

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`

const AddBookingButton = styled.button`
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background: #28a745;
  color: white;

  &:hover {
    background: #218838;
  }

  @media (max-width: 640px) {
    padding: 0.4rem 0.75rem;
    font-size: 0.85rem;
  }
`

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`

const ModalBox = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`

const ModalTitle = styled.h3`
  margin: 0 0 1rem;
  font-size: 1.2rem;
  color: #333;
`

const SlotGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.5rem;
  max-height: 180px;
  overflow-y: auto;
  margin-bottom: 1rem;
`

const SlotChip = styled.button<{ selected?: boolean }>`
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
  border: 1px solid ${({ selected }) => (selected ? "#28a745" : "#ccc")};
  background: ${({ selected }) => (selected ? "#d4edda" : "white")};
  cursor: pointer;
  font-size: 0.85rem;
  text-align: center;

  &:hover {
    border-color: #28a745;
  }
`

const ModalError = styled.p`
  margin: 0 0 0.75rem;
  font-size: 0.9rem;
  color: #dc3545;
`

const ModalButtonRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
`

const ModalSecondaryButton = styled.button`
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;

  &:hover {
    background: #eee;
  }
`

export default function AdminPage() {
  const navigate = useNavigate()

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_KEY)
    navigate("/")
  }
  const [bookings, setBookings] = useState<BookedSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<BookedSlot | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editName, setEditName] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editEmail, setEditEmail] = useState("")

  const [showAddModal, setShowAddModal] = useState(false)
  const [freeSlots, setFreeSlots] = useState<Slot[]>([])
  const [addModalLoading, setAddModalLoading] = useState(false)
  const [addSlotId, setAddSlotId] = useState<number | null>(null)
  const [addName, setAddName] = useState("")
  const [addPhone, setAddPhone] = useState("")
  const [addEmail, setAddEmail] = useState("")
  const [addError, setAddError] = useState("")

  const loadBookings = () => {
    fetch(`${API_BASE}/api/admin/bookings`)
      .then(async (r) => {
        const text = await r.text()
        try {
          return JSON.parse(text)
        } catch {
          return []
        }
      })
      .then((data) => {
        setBookings(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => {
        setBookings([])
        setLoading(false)
      })
  }

  useEffect(() => {
    loadBookings()
  }, [])

  const openAddModal = () => {
    setShowAddModal(true)
    setAddSlotId(null)
    setAddName("")
    setAddPhone("")
    setAddEmail("")
    setAddError("")
    setAddModalLoading(true)
    fetch(`${API_BASE}/api/slots`)
      .then(async (r) => {
        const text = await r.text()
        try {
          return JSON.parse(text)
        } catch {
          return []
        }
      })
      .then((data: unknown) => {
        const arr = Array.isArray(data) ? data : []
        setFreeSlots(arr.filter((s: Slot) => s?.status === "free"))
        setAddModalLoading(false)
      })
      .catch(() => {
        setAddError("Nem sikerült betölteni az elérhető időpontokat.")
        setAddModalLoading(false)
      })
  }

  const handleAddBooking = () => {
    if (!addSlotId) {
      setAddError("Válassz egy időpontot.")
      return
    }
    setAddError("")
    fetch(`${API_BASE}/api/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slot_id: addSlotId,
        booking_name: addName,
        phone: addPhone,
        email: addEmail,
      }),
    })
      .then(async (r) => {
        try {
          return await r.json()
        } catch {
          return { ok: false }
        }
      })
      .then((res) => {
        if (res.ok) {
          setShowAddModal(false)
          loadBookings()
        } else {
          setAddError("A foglalás felvétele sikertelen (az időpont már foglalt lehet).")
        }
      })
      .catch(() => setAddError("Hiba történt a foglalás felvételekor."))
  }

  useEffect(() => {
    if (selected) {
      setEditName(selected.booking_name || "")
      setEditPhone(selected.phone || "")
      setEditEmail(selected.email || "")
      setEditMode(false)
    }
  }, [selected])

  const handleUpdate = () => {
    if (!selected) return
    fetch(`${API_BASE}/api/admin/bookings/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        booking_name: editName,
        phone: editPhone,
        email: editEmail,
      }),
    })
      .then(async (r) => {
        try {
          return await r.json()
        } catch {
          return { ok: false }
        }
      })
      .then((res) => {
        if (res.ok) {
          setEditMode(false)
          loadBookings()
          setSelected({ ...selected, booking_name: editName, phone: editPhone, email: editEmail })
        }
      })
  }

  const handleDelete = () => {
    if (!selected || !confirm("Biztosan törölni szeretnéd a foglalást?")) return
    fetch(`${API_BASE}/api/admin/bookings/${selected.id}`, { method: "DELETE" })
      .then(async (r) => {
        try {
          return await r.json()
        } catch {
          return { ok: false }
        }
      })
      .then((res) => {
        if (res.ok) {
          setSelected(null)
          setEditMode(false)
          loadBookings()
        }
      })
  }

  return (
    <Page>
      <Header>
        <Title>Admin panel – Foglalt időpontok</Title>
        <HeaderActions>
          <AddBookingButton type="button" onClick={openAddModal}>
            Papír alapú foglalás felvétele
          </AddBookingButton>
          <LogoutButton type="button" onClick={handleLogout}>
            Kijelentkezés
          </LogoutButton>
        </HeaderActions>
      </Header>

      {showAddModal && (
        <ModalOverlay onClick={() => setShowAddModal(false)}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Papír alapú foglalás felvétele</ModalTitle>
            {addModalLoading ? (
              <LoadingText>Elérhető időpontok betöltése…</LoadingText>
            ) : (
              <>
                <Label>Válassz szabad időpontot</Label>
                <SlotGrid>
                  {freeSlots.length === 0 ? (
                    <EmptyText style={{ gridColumn: "1 / -1" }}>Nincs elérhető szabad időpont.</EmptyText>
                  ) : (
                    freeSlots.map((s) => (
                      <SlotChip
                        key={s.id}
                        type="button"
                        selected={addSlotId === s.id}
                        onClick={() => setAddSlotId(s.id)}
                      >
                        {s.date} {s.time}
                      </SlotChip>
                    ))
                  )}
                </SlotGrid>
                <Label>
                  Foglaló neve
                  <Input
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    placeholder="Név"
                  />
                </Label>
                <Label>
                  Telefonszám
                  <Input
                    value={addPhone}
                    onChange={(e) => setAddPhone(e.target.value)}
                    placeholder="+36 30 123 4567"
                  />
                </Label>
                <Label>
                  E-mail cím
                  <Input
                    type="email"
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    placeholder="pelda@email.hu"
                  />
                </Label>
                {addError && <ModalError>{addError}</ModalError>}
                <ModalButtonRow>
                  <ActionButton type="button" onClick={handleAddBooking} style={{ background: "#28a745" }}>
                    Foglalás felvétele
                  </ActionButton>
                  <ModalSecondaryButton type="button" onClick={() => setShowAddModal(false)}>
                    Mégse
                  </ModalSecondaryButton>
                </ModalButtonRow>
              </>
            )}
          </ModalBox>
        </ModalOverlay>
      )}

      {loading ? (
        <LoadingText>Betöltés…</LoadingText>
      ) : (
        <ContentRow hasPanel={bookings.length > 0}>
          <ListWrapper>
            {bookings.length === 0 ? (
              <EmptyText>Nincs foglalt időpont.</EmptyText>
            ) : (
              <List>
                {bookings.map((b) => (
                  <ListItem
                    key={b.id}
                    selected={selected?.id === b.id}
                    onClick={() => setSelected(b)}
                  >
                    <SlotDate>{b.date}</SlotDate>
                    <SlotTime>{b.time}</SlotTime>
                    {b.booking_name && (
                      <DetailLine style={{ marginTop: "0.5rem" }}>
                        – {b.booking_name}
                      </DetailLine>
                    )}
                  </ListItem>
                ))}
              </List>
            )}
          </ListWrapper>

          {bookings.length > 0 && (
            selected ? (
            <DetailPanel>
              <DetailTitle>Foglalás részletei</DetailTitle>
              {!editMode ? (
            <>
              <DetailLine><strong>Időpont:</strong> {selected.date} – {selected.time}</DetailLine>
              <DetailLine><strong>Foglaló neve:</strong> {selected.booking_name || "–"}</DetailLine>
              <DetailLine><strong>Telefonszám:</strong> {selected.phone || "–"}</DetailLine>
              <DetailLine><strong>E-mail:</strong> {selected.email || "–"}</DetailLine>
              <ButtonRow>
                <ActionButton type="button" onClick={() => setEditMode(true)}>
                  Foglalás módosítása
                </ActionButton>
                <ActionButton type="button" danger onClick={handleDelete}>
                  Foglalás törlése
                </ActionButton>
              </ButtonRow>
            </>
          ) : (
            <EditForm>
              <Label>
                Foglaló neve
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Név"
                />
              </Label>
              <Label>
                Telefonszám
                <Input
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+36 30 123 4567"
                />
              </Label>
              <Label>
                E-mail cím
                <Input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="pelda@email.hu"
                />
              </Label>
              <ButtonRow>
                <ActionButton type="button" onClick={handleUpdate}>
                  Mentés
                </ActionButton>
                <ActionButton type="button" onClick={() => setEditMode(false)} style={{ background: "#6c757d" }}>
                  Mégse
                </ActionButton>
              </ButtonRow>
            </EditForm>
              )}
            </DetailPanel>
            ) : (
              <DetailPanel>
                <DetailTitle>Foglalás részletei</DetailTitle>
                <EmptyText style={{ marginTop: "1rem" }}>
                  Válassz egy foglalást a listából.
                </EmptyText>
              </DetailPanel>
            )
          )}
        </ContentRow>
      )}
    </Page>
  )
}
