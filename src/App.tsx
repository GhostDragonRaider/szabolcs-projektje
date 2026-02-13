import styled from "@emotion/styled"
import { Routes, Route, useNavigate, Navigate } from "react-router-dom"
import SceduleAppointment from "./components/scedule_appointment"
import AdminPage from "./adminpage"
import { useState } from "react"

import profileImg from "../pics/profile.png"
import kep1 from "../pics/kép1.png"
import kep2 from "../pics/kép2.png"
import kep3 from "../pics/kép3.png"
import kep4 from "../pics/kép4.png"

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;

  @media (max-width: 640px) {
    padding: 1rem;
  }
`

const HeroSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  margin-bottom: 4rem;

  @media (max-width: 640px) {
    gap: 1.25rem;
    margin-bottom: 2.5rem;
  }
`

const ProfileImage = styled.img`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  @media (max-width: 640px) {
    width: 140px;
    height: 140px;
  }
`

const IntroText = styled.p`
  font-size: 1.2rem;
  line-height: 1.6;
  text-align: center;
  max-width: 600px;
  color: #333;

  @media (max-width: 640px) {
    font-size: 1rem;
    padding: 0 0.5rem;
  }
`

const GallerySection = styled.section`
  margin-bottom: 4rem;

  @media (max-width: 640px) {
    margin-bottom: 2.5rem;
  }
`

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 400px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`

const GalleryImage = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.05);
  }
`

const CtaText = styled.p`
  font-size: 1.2rem;
  line-height: 1.6;
  text-align: center;
  max-width: 600px;
  margin: 0 auto 2rem;
  color: #333;

  @media (max-width: 640px) {
    font-size: 1rem;
    margin-bottom: 1.5rem;
    padding: 0 0.5rem;
  }
`

const CtaSection = styled.section`
  text-align: center;
  padding: 3rem 0;

  @media (max-width: 640px) {
    padding: 2rem 0.5rem;
  }
`

const Divider = styled.div`
  width: 100%;
  max-width: 600px;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, #000 20%, #000 80%, transparent 100%);
  margin: 0 auto 2rem;

  @media (max-width: 640px) {
    margin-bottom: 1.5rem;
  }
`

const TopBar = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;

  @media (max-width: 640px) {
    top: 0.75rem;
    right: 0.75rem;
  }
`

const AdminLoginButton = styled.button`
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  background: #f5f5f5;
  color: #333;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;

  &:hover {
    background: #e8e8e8;
    border-color: rgba(0, 0, 0, 0.3);
  }

  @media (max-width: 640px) {
    padding: 0.4rem 0.75rem;
    font-size: 0.85rem;
  }
`

const LoginOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`

const LoginBox = styled.div`
  position: relative;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  min-width: 280px;
  max-width: 100%;
  width: 340px;

  @media (max-width: 400px) {
    padding: 1.25rem;
    min-width: 0;
  }
`

const LoginTitle = styled.h3`
  margin: 0 0 1rem;
  font-size: 1.1rem;
  color: #333;
  text-align: center;
`

const LoginField = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 0.95rem;
`

const LoginButton = styled.button`
  width: 100%;
  padding: 0.6rem;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  background: #667eea;
  color: white;
  cursor: pointer;
  margin-top: 0.25rem;

  &:hover {
    background: #5568d3;
  }
`

const LoginError = styled.p`
  margin: 0 0 0.75rem;
  font-size: 0.85rem;
  color: #b71c1c;
  text-align: center;
`

const CloseButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 1.2rem;
  color: #666;
  cursor: pointer;
  line-height: 1;

  &:hover {
    color: #333;
  }
`

const LoginBoxWrapper = styled.div``

const CtaButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 640px) {
    padding: 0.85rem 2rem;
    font-size: 1rem;
    width: 100%;
    max-width: 280px;
    display: block;
    margin-left: auto;
    margin-right: auto;
  }
`

const ADMIN_KEY = "admin_session"

function ProtectedAdmin() {
  const isLoggedIn = typeof window !== "undefined" && sessionStorage.getItem(ADMIN_KEY)
  if (!isLoggedIn) return <Navigate to="/" replace />
  return <AdminPage />
}

function HomePage() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    sessionStorage.setItem(ADMIN_KEY, "1");
    setShowLoginModal(false);
    setLoginError("");
    navigate("/admin");
  };

  return (
    <Container style={{ position: "relative" }}>
      <TopBar>
        <AdminLoginButton
          type="button"
          onClick={() => {
            setShowLoginModal(true);
            setLoginEmail("");
            setLoginPassword("");
            setLoginError("");
          }}
        >
          Admin login
        </AdminLoginButton>
      </TopBar>
      {showLoginModal && (
        <LoginOverlay onClick={() => setShowLoginModal(false)}>
          <LoginBoxWrapper onClick={(e) => e.stopPropagation()}>
            <LoginBox>
              <CloseButton type="button" onClick={() => setShowLoginModal(false)} aria-label="Bezárás">
                ×
              </CloseButton>
              <LoginTitle>Admin bejelentkezés</LoginTitle>
              {loginError && <LoginError>{loginError}</LoginError>}
              <LoginField
                type="email"
                placeholder="E-mail cím"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
              <LoginField
                type="password"
                placeholder="Jelszó"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              <LoginButton
                type="button"
                onClick={() => {
                  if (loginEmail === "blazsi88@gmail.com" && loginPassword === "proba123") {
                    handleLoginSuccess();
                  } else {
                    setLoginError("Hibás felhasználónév vagy jelszó.");
                  }
                }}
              >
                Bejelentkezés
              </LoginButton>
            </LoginBox>
          </LoginBoxWrapper>
        </LoginOverlay>
      )}
      <HeroSection>
        <ProfileImage 
          src={profileImg} 
          alt="Profil kép" 
        />
        <IntroText>
          Üdvözöllek! Blaskó Szabolcs #ChiroStrong - Csontkovács és Manuálterapeuta. 
        </IntroText>
      </HeroSection>

      <GallerySection>
        <GalleryGrid>
          <GalleryImage src={kep1} alt="Kép 1" />
          <GalleryImage src={kep2} alt="Kép 2" />
          <GalleryImage src={kep3} alt="Kép 3" />
          <GalleryImage src={kep4} alt="Kép 4" />
        </GalleryGrid>
      </GallerySection>
      <CtaSection>
        <CtaText>
        <strong>ChiroStrong – Erő és stabilitás a gerincednek</strong>

Több mint 10 éve foglalkozom manuálterápiával és csontkovácsolással, 
szakterületem a gerincproblémák hatékony kezelése. Erősember versenyzőként a 
saját bőrömön tapasztaltam meg a test határait és a regeneráció fontosságát, 
ezt a gyakorlati tudást viszem át a kezeléseimbe is. Nem bontom külön a folyamatokat: 
egyetlen alkalom alatt, komplexen ötvözöm a manuálterápiát a csontkovácsolással és a 
köpöly terápiával, hogy a lehető leggyorsabb és legtartósabb javulást érjük el.”
        </CtaText>
        <Divider />
        <CtaButton type="button" onClick={() => navigate("/idopont")}>
          Foglalj időpontot most
        </CtaButton>
      </CtaSection>
    </Container>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/idopont" element={<SceduleAppointment />} />
      <Route path="/admin" element={<ProtectedAdmin />} />
    </Routes>
  )
}

export default App