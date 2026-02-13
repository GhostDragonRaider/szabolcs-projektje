import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import styled from "@emotion/styled"
import { keyframes, css, Global } from "@emotion/react"


const Page = styled.div`
  min-height: 100vh;
  padding: 3rem 1.5rem 4rem;
  background: radial-gradient(circle at top, #f7f2ea 0%, #f2f7f5 45%, #edf3f7 100%);
  color: #1c1c1c;
  position: relative;
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding: 2rem 1rem 3rem;
  }

  @media (max-width: 480px) {
    padding: 1.5rem 0.75rem 2rem;
  }

  &::before,
  &::after {
    content: "";
    position: absolute;
    border-radius: 999px;
    filter: blur(0px);
    opacity: 0.45;
    pointer-events: none;
  }

  &::before {
    width: 320px;
    height: 320px;
    background: linear-gradient(140deg, #f5d4b6 0%, #ffd8c2 100%);
    top: -120px;
    right: -80px;
  }

  &::after {
    width: 280px;
    height: 280px;
    background: linear-gradient(160deg, #bce7df 0%, #c5e9f5 100%);
    bottom: -120px;
    left: -80px;
  }
`

const Shell = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  display: grid;
  gap: 2.5rem;

  @media (max-width: 768px) {
    gap: 1.5rem;
  }
`

const floatIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const Header = styled.header`
  display: grid;
  gap: 0.75rem;
  text-align: center;
  animation: ${floatIn} 0.7s ease both;

  @media (max-width: 480px) {
    gap: 0.5rem;
  }
`

const Eyebrow = styled.span`
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  color: #5b6f6b;
  font-weight: 600;

  @media (max-width: 480px) {
    font-size: 0.7rem;
    letter-spacing: 0.15em;
  }
`

const Title = styled.h1`
  font-family: "Fraunces", serif;
  font-size: clamp(2rem, 4vw, 3rem);
  margin: 0;
  color: #163d3a;

  @media (max-width: 480px) {
    font-size: clamp(1.5rem, 6vw, 2rem);
  }
`

const Subtitle = styled.p`
  margin: 0 auto;
  max-width: 720px;
  line-height: 1.7;
  color: #3a4c49;
  font-size: 1.05rem;

  @media (max-width: 640px) {
    font-size: 0.95rem;
    padding: 0 0.5rem;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`

const ContentGrid = styled.form`
  display: grid;
  gap: 2rem;
  min-width: 0;

  @media (min-width: 960px) {
    grid-template-columns: minmax(0, 1200px) minmax(0, 1fr);
    align-items: start;
  }

  @media (max-width: 640px) {
    gap: 1.5rem;
  }

  & > section:nth-of-type(2) {
    animation-delay: 0.12s;
  }
`

const Card = styled.section`
  background: #ffffff;
  border-radius: 20px;
  padding: 1.75rem;
  box-shadow: 0 18px 40px rgba(15, 45, 40, 0.08);
  border: 1px solid rgba(22, 61, 58, 0.08);
  animation: ${floatIn} 0.7s ease both;
  min-width: 0;

  @media (max-width: 640px) {
    padding: 1.25rem;
    border-radius: 16px;
  }
`

const FormTitle = styled.h2`
  font-family: "Fraunces", serif;
  font-size: 1.5rem;
  margin: 0 0 1.25rem;
  color: #163d3a;

  @media (max-width: 640px) {
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }
`



const Field = styled.label`
  display: grid;
  gap: 0.35rem;
  font-weight: 600;
  color: #2c3a38;
  font-size: 0.95rem;
`

const Input = styled.input`
  border-radius: 12px;
  border: 1px solid rgba(22, 61, 58, 0.2);
  padding: 0.75rem 0.9rem;
  font-size: 0.95rem;
  font-family: "Manrope", sans-serif;
  background: #f7fbfa;
  color: #1c1c1c;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: #1f8a7a;
    box-shadow: 0 0 0 3px rgba(31, 138, 122, 0.16);
    background: #ffffff;
  }

  @media (max-width: 640px) {
    padding: 0.6rem 0.75rem;
    font-size: 0.9rem;
  }
`






const DateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  @media (max-width: 400px) {
    grid-template-columns: 1fr;
  }
`

const DateColumn = styled.div<{ weekend?: boolean }>`
  background: ${({ weekend }) => (weekend ? "#fff6ef" : "#f3fbf9")};
  border-radius: 16px;
  padding: 0.85rem;
  border: 1px solid ${({ weekend }) => (weekend ? "rgba(192, 108, 44, 0.25)" : "rgba(31, 138, 122, 0.18)")};
  display: grid;
  gap: 0.65rem;

  @media (max-width: 640px) {
    padding: 0.65rem;
    border-radius: 12px;
    gap: 0.5rem;
  }
`

const DayHeader = styled.div`
  display: grid;
  gap: 0.25rem;
  text-align: center;
`

const DayName = styled.span`
  font-weight: 700;
  color: #163d3a;
  text-transform: capitalize;

  @media (max-width: 640px) {
    font-size: 0.85rem;
  }
`

const DayDate = styled.span`
  font-size: 0.85rem;
  color: #5b6f6b;

  @media (max-width: 640px) {
    font-size: 0.75rem;
  }
`



const SlotButton = styled.button<{ selected?: boolean; disabled?: boolean }>`
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  border: 1px solid ${({ selected }) => (selected ? "#1f8a7a" : "rgba(22, 61, 58, 0.2)")};
  background: ${({ selected, disabled }) =>
    disabled ? "#f0f0f0" : selected ? "#daf1ed" : "#ffffff"};
  color: ${({ disabled }) => (disabled ? "#999" : "#1c1c1c")};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  font-weight: 600;
  font-size: 0.9rem;
  transition: border-color 0.2s, background 0.2s;

  &:hover:not(:disabled) {
    border-color: #1f8a7a;
    background: #e8f7f4;
  }

  @media (max-width: 640px) {
    padding: 0.4rem 0.5rem;
    font-size: 0.8rem;
  }
`

const SummaryCard = styled.div`
  margin-top: 1.25rem;
  background: #ffffff;
  border-radius: 16px;
  padding: 1rem 1.25rem;
  border: 1px dashed rgba(22, 61, 58, 0.3);
  display: grid;
  gap: 0.4rem;
  text-align: center;

  @media (max-width: 640px) {
    margin-top: 1rem;
    padding: 0.85rem 1rem;
  }
`

const SummaryLabel = styled.span`
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #5b6f6b;
  font-weight: 600;
`

const SummaryValue = styled.span`
  font-weight: 700;
  color: #163d3a;
`

const TherapySection = styled.div`
  margin-top: 1.5rem;
  display: grid;
  gap: 1rem;
`

const TherapyTitle = styled.h3`
  margin: 0;
  font-family: "Fraunces", serif;
  color: #163d3a;
  text-align: center;
`

const TherapyOptions = styled.div`
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));

  @media (max-width: 400px) {
    grid-template-columns: 1fr;
  }
`

const FormFieldsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

const TherapyCard = styled.button<{ selected?: boolean }>`
  text-align: left;
  padding: 0.85rem 0.9rem;
  border-radius: 14px;
  border: 1px solid ${({ selected }) => (selected ? "#1f8a7a" : "rgba(22, 61, 58, 0.2)")};
  background: ${({ selected }) => (selected ? "#daf1ed" : "#ffffff")};
  color: #1c1c1c;
  cursor: pointer;
  font-weight: 600;
  transition: border-color 0.2s, transform 0.15s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(15, 45, 40, 0.12);
  }

  @media (max-width: 640px) {
    padding: 0.75rem 0.8rem;
    font-size: 0.95rem;
  }
`



const PriceTag = styled.div`
  padding: 0.85rem 1rem;
  border-radius: 14px;
  background: linear-gradient(135deg, #163d3a 0%, #1f8a7a 100%);
  color: #ffffff;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  width: 100%;
  text-align: center;
`

const PriceNote = styled.span`
  font-size: 0.85rem;
  font-weight: 500;
  opacity: 0.8;
`

const ActionRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1.5rem;
`

const SubmitButton = styled.button`
  width: fit-content;
  border: none;
  border-radius: 999px;
  padding: 0.9rem 1.8rem;
  font-size: 1rem;
  font-weight: 700;
  background: #c06c2c;
  color: #ffffff;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s, background 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(192, 108, 44, 0.35);
    background: #b55c1f;
  }

  &:disabled {
    cursor: not-allowed;
    background: #d9c5b8;
    box-shadow: none;
    transform: none;
  }

  @media (max-width: 640px) {
    padding: 0.8rem 1.5rem;
    font-size: 0.95rem;
    width: 100%;
    max-width: 220px;
  }
`

const HelperText = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: #5b6f6b;
`



const ErrorMessage = styled.div`
  padding: 0.85rem 1rem;
  border-radius: 12px;
  background: rgba(183, 28, 28, 0.12);
  color: #b71c1c;
  font-weight: 600;
`

const ConfirmationCard = styled.div`
  background: #ffffff;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 18px 40px rgba(15, 45, 40, 0.08);
  border: 1px solid rgba(22, 61, 58, 0.08);
  max-width: 480px;
  width: 100%;
  margin: 0 auto;
  display: grid;
  gap: 1.25rem;
  text-align: center;
  box-sizing: border-box;

  @media (max-width: 640px) {
    padding: 1.5rem 1rem;
    margin: 0 0.5rem;
    border-radius: 16px;
    gap: 1rem;
  }

  @media (max-width: 400px) {
    padding: 1.25rem 0.75rem;
    margin: 0 0.5rem;
    border-radius: 14px;
    gap: 0.85rem;
  }
`

const ConfirmationTitle = styled.h2`
  margin: 0;
  font-family: "Fraunces", serif;
  font-size: 1.75rem;
  color: #163d3a;

  @media (max-width: 640px) {
    font-size: 1.4rem;
  }

  @media (max-width: 400px) {
    font-size: 1.25rem;
  }
`

const ConfirmationLine = styled.p`
  margin: 0;
  font-size: 1rem;
  color: #3a4c49;
  line-height: 1.6;
  word-break: break-word;

  @media (max-width: 640px) {
    font-size: 0.95rem;
  }

  @media (max-width: 400px) {
    font-size: 0.9rem;
  }

  a {
    color: #1f8a7a;
    text-decoration: none;
    font-weight: 600;
    &:hover {
      text-decoration: underline;
    }
  }
`

const BackToHomeButton = styled.button`
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #163d3a 0%, #1f8a7a 100%);
  color: #ffffff;
  cursor: pointer;
  display: block;
  margin-left: auto;
  margin-right: auto;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  @media (max-width: 640px) {
    padding: 0.85rem 1.25rem;
    font-size: 0.95rem;
    width: 100%;
    max-width: 260px;
  }

  @media (max-width: 400px) {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
    max-width: 100%;
    margin-top: 1rem;
  }
`

const globalStyles = css`
  @import url("https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=Manrope:wght@400;500;600;700&display=swap");

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: "Manrope", sans-serif;
    background: #f7f2ea;
  }
`

type Slot = { id: number; date: string; time: string; status: string }

const API_BASE = "" // relatív: /api → proxy a backendre (dev és production)
const DAY_NAMES: Record<number, string> = {
  0: "vasárnap", 1: "hétfő", 2: "kedd", 3: "szerda",
  4: "csütörtök", 5: "péntek", 6: "szombat",
}

type TherapyType = "manuál" | "köpöly" | ""

type ConfirmationData = {
  date: string
  time: string
  therapy: string
  price: string
}

export default function SceduleAppointment() {
  const navigate = useNavigate()
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [selectedTherapy, setSelectedTherapy] = useState<TherapyType>("")
  const [bookingName, setBookingName] = useState("")
  const [bookingPhone, setBookingPhone] = useState("")
  const [bookingEmail, setBookingEmail] = useState("")
  const [confirmation, setConfirmation] = useState<ConfirmationData | null>(null)
  const [bookingError, setBookingError] = useState<string | null>(null)

  useEffect(() => {
    const ctrl = new AbortController()
    fetch(`${API_BASE}/api/slots`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data) => { setSlots(data); setError(null) })
      .catch((e) => { if (e.name !== "AbortError") setError(e.message) })
      .finally(() => setLoading(false))
    return () => ctrl.abort()
  }, [])

  const byDate = slots.reduce<Record<string, Slot[]>>((acc, s) => {
    if (!acc[s.date]) acc[s.date] = []
    acc[s.date].push(s)
    return acc
  }, {})

  const handleBook = () => {
    if (!selectedSlot) return
    setBookingError(null)
    fetch(`${API_BASE}/api/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slot_id: selectedSlot.id,
        booking_name: bookingName,
        phone: bookingPhone,
        email: bookingEmail,
      }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.ok) {
          const therapyLabel = selectedTherapy === "manuál" ? "Manuál terápia" : "Köpöly terápia"
          setConfirmation({
            date: selectedSlot.date,
            time: selectedSlot.time,
            therapy: therapyLabel,
            price: "30 € / 11 000 Ft",
          })
          setSlots((prev) =>
            prev.map((s) => (s.id === selectedSlot.id ? { ...s, status: "booked" } : s))
          )
        } else {
          setBookingError("A foglalás sikertelen. Próbáld újra.")
        }
      })
      .catch(() => setBookingError("Hiba történt. Próbáld újra."))
  }

  if (confirmation) {
    return (
      <Page>
        <Global styles={globalStyles} />
        <Shell>
          <Header>
            <Eyebrow>Időpont foglalás</Eyebrow>
            <Title>Köszönjük a foglalását!</Title>
            <Subtitle>Visszaigazoljuk az időpontot.</Subtitle>
          </Header>
          <ConfirmationCard>
            <ConfirmationTitle>Foglalás visszaigazolva</ConfirmationTitle>
            <ConfirmationLine><strong>Időpont:</strong> {confirmation.date} – {confirmation.time}</ConfirmationLine>
            <ConfirmationLine><strong>Terápia:</strong> {confirmation.therapy}</ConfirmationLine>
            <ConfirmationLine><strong>Szolgáltatás díja:</strong> {confirmation.price}</ConfirmationLine>
            <ConfirmationLine>Várjuk szeretettel a <strong>3980 Sátoraljaújhely, Hősök tere út 2</strong> cím alatt.</ConfirmationLine>
            <ConfirmationLine>Bármilyen kérdésed van, keress bizalommal:</ConfirmationLine>
            <ConfirmationLine>E-mail: <a href="mailto:blazsi88@gmail.com">blazsi88@gmail.com</a></ConfirmationLine>
            <BackToHomeButton type="button" onClick={() => navigate("/")}>
              Vissza a főoldalra
            </BackToHomeButton>
          </ConfirmationCard>
        </Shell>
      </Page>
    )
  }

  return (
    <Page>
      <Global styles={globalStyles} />
      <Shell>
        <Header>
          <Eyebrow>Időpont foglalás</Eyebrow>
          <Title>Válassz időpontot</Title>
          <Subtitle>
            Válaszd ki a neked megfelelő időpontot az alábbi listából.
          </Subtitle>
        </Header>
        <ContentGrid as="div">
          <Card>
            <FormTitle>Elérhető időpontok</FormTitle>
            {loading && <HelperText>Betöltés…</HelperText>}
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {!loading && !error && (
              <DateGrid>
                {Object.entries(byDate).map(([dateStr, daySlots]) => {
                  const d = new Date(dateStr)
                  const weekend = d.getDay() === 0 || d.getDay() === 6
                  return (
                    <DateColumn key={dateStr} weekend={weekend}>
                      <DayHeader>
                        <DayName>{DAY_NAMES[d.getDay()]}</DayName>
                        <DayDate>{dateStr}</DayDate>
                      </DayHeader>
                      {daySlots.map((slot) => (
                        <SlotButton
                          key={slot.id}
                          type="button"
                          selected={selectedSlot?.id === slot.id}
                          disabled={slot.status !== "free"}
                          onClick={() => setSelectedSlot(slot)}
                        >
                          {slot.time}
                        </SlotButton>
                      ))}
                    </DateColumn>
                  )
                })}
              </DateGrid>
            )}
            {selectedSlot && (
              <>
                <SummaryCard>
                  <SummaryLabel>Kiválasztott időpont</SummaryLabel>
                  <SummaryValue>
                    {selectedSlot.date} – {selectedSlot.time}
                  </SummaryValue>
                </SummaryCard>
                <TherapySection>
                  <TherapyTitle>Milyen kezelést szeretnél?</TherapyTitle>
                  <TherapyOptions>
                    <TherapyCard
                      type="button"
                      selected={selectedTherapy === "manuál"}
                      onClick={() => setSelectedTherapy("manuál")}
                    >
                      Manuál terápia
                    </TherapyCard>
                    <TherapyCard
                      type="button"
                      selected={selectedTherapy === "köpöly"}
                      onClick={() => setSelectedTherapy("köpöly")}
                    >
                      Köpöly terápia
                    </TherapyCard>
                  </TherapyOptions>
                  <FormFieldsRow>
                    <Field>
                      Foglaló neve
                      <Input
                        type="text"
                        placeholder="Név"
                        value={bookingName}
                        onChange={(e) => setBookingName(e.target.value)}
                      />
                    </Field>
                    <Field>
                      Telefonszám
                      <Input
                        type="tel"
                        placeholder="+36 30 123 4567"
                        value={bookingPhone}
                        onChange={(e) => setBookingPhone(e.target.value)}
                      />
                    </Field>
                    <Field>
                      E-mail cím
                      <Input
                        type="email"
                        placeholder="pelda@email.hu"
                        value={bookingEmail}
                        onChange={(e) => setBookingEmail(e.target.value)}
                      />
                    </Field>
                  </FormFieldsRow>
                  <PriceTag> A szolgáltatás díja:
                    30 € <PriceNote>/ 11 000 Ft</PriceNote>
                  </PriceTag>
                  {bookingError && <ErrorMessage>{bookingError}</ErrorMessage>}
                  <ActionRow>
                    <SubmitButton type="button" onClick={handleBook}>Időpont foglalása</SubmitButton>
                  </ActionRow>
                </TherapySection>
              </>
            )}
          </Card>
        </ContentGrid>
      </Shell>
    </Page>
  )
}