import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
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
            background: "#08090C",
            color: "#E5E4E2",
            fontFamily: "Space Grotesk, sans-serif",
            padding: 24,
            textAlign: "center",
          }}
        >
          <div
            style={{
              padding: "32px 40px",
              background: "rgba(22, 24, 30, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: 16,
              maxWidth: 520,
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div>
            <h2 style={{ margin: "0 0 8px", fontSize: 20, color: "#FFFFFF" }}>Workspace Reload Required</h2>
            <p style={{ margin: "0 0 24px", color: "#94A3B8", fontSize: 14, lineHeight: 1.5 }}>
              A temporary render hiccup occurred. Resetting session cache will bring the studio back online.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.hash = "#/dashboard";
                  window.location.reload();
                }}
                style={{
                  background: "#FFFFFF",
                  color: "#0A0A0D",
                  border: "none",
                  padding: "10px 22px",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Reload Dashboard
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("cl_token");
                  localStorage.removeItem("cl_demo_user");
                  window.location.hash = "#/login";
                  window.location.reload();
                }}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: "#E5E4E2",
                  border: "1px solid rgba(255,255,255,0.15)",
                  padding: "10px 20px",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Reset Session
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
