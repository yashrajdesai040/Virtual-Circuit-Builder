import { useEffect, useRef, useState } from "react";
import { ArduinoRuntime } from "../../utils/arduinoRuntime";
import { PlayIcon, CloseIcon, WarningIcon } from "../icons/PremiumIcons";

const DEFAULT_SKETCH = `void setup() {
  pinMode(2, OUTPUT);
}

void loop() {
  digitalWrite(2, HIGH);
  delay(500);
  digitalWrite(2, LOW);
  delay(500);
}
`;

const TICK_MS = 150; // how often we re-solve the circuit against the backend while code is running

export default function ESP32CodeEditor({ node, onClose, onSaveCode, onLivePinsChange, getLivePinVoltage }) {
  const [code, setCode] = useState(node.code || DEFAULT_SKETCH);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const [serialLines, setSerialLines] = useState([]);

  const runtimeRef = useRef(null);
  const pinStatesRef = useRef({});
  const tickIntervalRef = useRef(null);
  const serialBufRef = useRef("");

  useEffect(() => {
    return () => {
      runtimeRef.current?.stop();
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    };
  }, []);

  function appendSerial(text) {
    serialBufRef.current += text;
    const parts = serialBufRef.current.split("\n");
    serialBufRef.current = parts.pop();
    if (parts.length === 0) return;
    setSerialLines((lines) => [...lines, ...parts].slice(-200));
  }

  function handleRun() {
    onSaveCode(node.id, code);
    setError(null);
    setSerialLines([]);
    pinStatesRef.current = {};

    const runtime = new ArduinoRuntime(node, {
      onPinWrite: (terminal, volts) => {
        pinStatesRef.current = { ...pinStatesRef.current, [terminal]: volts };
      },
      getPinVoltage: (terminal) => getLivePinVoltage(node.id, terminal),
      onSerial: appendSerial,
      onStatus: ({ running: r, error: e }) => {
        setRunning(r);
        if (e) setError(e);
      },
    });
    runtimeRef.current = runtime;
    runtime.start(code);

    tickIntervalRef.current = setInterval(() => {
      onLivePinsChange(node.id, pinStatesRef.current);
    }, TICK_MS);
  }

  function handleStop() {
    runtimeRef.current?.stop();
    if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    tickIntervalRef.current = null;
    setRunning(false);
  }

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{"</>"} {node.name} code</span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {!running ? (
              <button onClick={handleRun} style={styles.runBtn}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <PlayIcon size={11} color="currentColor" /> Run
                </span>
              </button>
            ) : (
              <button onClick={handleStop} style={styles.stopBtn}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 9, height: 9, background: "currentColor", borderRadius: 1 }} /> Stop
                </span>
              </button>
            )}
            <button onClick={onClose} style={styles.closeBtn} aria-label="Close code editor">
              <CloseIcon size={13} color="currentColor" />
            </button>
          </div>
        </div>

        {error && (
          <div style={styles.errorBar}>
            <WarningIcon size={13} color="currentColor" /> {error}
          </div>
        )}

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          style={styles.textarea}
        />

        <div style={styles.serialHeader}>Serial monitor</div>
        <div style={styles.serial}>
          {serialLines.length === 0 && <span style={{ color: "var(--text-faint)" }}>No output yet.</span>}
          {serialLines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(6, 8, 12, 0.72)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 200,
  },
  panel: {
    width: "min(720px, 92vw)",
    maxHeight: "86vh",
    background: "var(--surface)",
    backdropFilter: "blur(24px) saturate(170%)",
    WebkitBackdropFilter: "blur(24px) saturate(170%)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: 18,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    boxShadow: "var(--card-shadow)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  runBtn: {
    background: "var(--cta-bg)",
    color: "var(--cta-text)",
    border: "1px solid var(--cta-border)",
    boxShadow: "var(--cta-shadow)",
    borderRadius: "var(--radius-sm)",
    padding: "6px 14px",
    fontSize: 12.5,
    fontWeight: 700,
    cursor: "pointer",
  },
  stopBtn: {
    background: "var(--danger)",
    color: "#fff",
    border: "none",
    borderRadius: "var(--radius-sm)",
    padding: "6px 14px",
    fontSize: 12.5,
    fontWeight: 600,
    cursor: "pointer",
  },
  closeBtn: {
    background: "transparent",
    border: "1px solid var(--border-bright)",
    color: "var(--text-dim)",
    borderRadius: "var(--radius-sm)",
    width: 28,
    height: 28,
    cursor: "pointer",
  },
  errorBar: {
    background: "rgba(255,71,87,0.12)",
    border: "1px solid var(--danger)",
    color: "var(--danger)",
    borderRadius: "var(--radius-sm)",
    padding: "6px 10px",
    fontSize: 12,
  },
  textarea: {
    width: "100%",
    height: 320,
    background: "var(--surface-2)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    color: "var(--text)",
    fontFamily: "var(--font-mono)",
    fontSize: 13,
    padding: 12,
    outline: "none",
    resize: "vertical",
    tabSize: 2,
    boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.15)",
  },
  serialHeader: {
    fontSize: 11,
    fontFamily: "var(--font-display)",
    color: "var(--text-faint)",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  serial: {
    background: "var(--surface-2)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    padding: 10,
    height: 100,
    overflowY: "auto",
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    color: "var(--color-green)",
    boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.15)",
  },
};