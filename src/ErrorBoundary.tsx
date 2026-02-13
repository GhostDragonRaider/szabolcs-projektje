import React from "react"

type Props = { children: React.ReactNode }
type State = { hasError: boolean; error?: Error }

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            fontFamily: "system-ui, sans-serif",
            background: "#f5f5f5",
            textAlign: "center",
          }}
        >
          <h1 style={{ margin: "0 0 1rem", color: "#333" }}>Hiba történt</h1>
          <p style={{ margin: "0 0 1.5rem", color: "#666" }}>
            Az alkalmazás hibát észlelt. Kérlek frissítsd az oldalt.
          </p>
          <button
            type="button"
            onClick={() => window.location.href = "/"}
            style={{
              padding: "0.5rem 1.5rem",
              fontSize: "1rem",
              borderRadius: "8px",
              border: "none",
              background: "#667eea",
              color: "white",
              cursor: "pointer",
            }}
          >
            Vissza a főoldalra
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
