import { ProbeIcon, LightbulbIcon } from "../icons/PremiumIcons";

const STATUS_LABEL = {
  complete: "Circuit complete",
  open: "Open circuit",
  short: "Short circuit",
  no_source: "No power source",
  error: "Simulation error",
};
const STATUS_COLOR = {
  complete: "var(--primary)",
  open: "var(--gold)",
  short: "var(--danger)",
  no_source: "var(--text-faint)",
  error: "var(--danger)",
};

// Small helper - some readings won't have every field depending on part
// type (e.g. a switch that's off has no meaningful current/power).
function fmt(n, digits = 2) {
  return typeof n === "number" && !Number.isNaN(n) ? n.toFixed(digits) : "—";
}

export default function MeasurementsPanel({ simResult, nodes, simRunning }) {
  const readings = simResult?.readings || {};

  const rows = nodes
    .map((n) => ({ node: n, reading: readings[n.id] || null }))
    .filter((r) => r.reading); // only parts the sim actually reported on

  const onRows = rows.filter((r) => r.reading.state === "on");
  const totalCurrentMA = onRows.reduce((sum, r) => sum + (r.reading.current_mA || 0), 0);
  const totalPowerMW = onRows.reduce((sum, r) => sum + (r.reading.power_mW || 0), 0);
  const railVoltage = onRows.length ? Math.max(...onRows.map((r) => r.reading.voltage || 0)) : 0;

  if (!simResult) {
    return (
      <div style={styles.panel}>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>
            <ProbeIcon size={26} color="var(--text-dim)" />
          </div>
          <p style={styles.emptyTitle}>No readings yet</p>
          <p style={styles.emptyText}>
            Click <strong>Run circuit</strong> to see live voltage, current, and power for every part.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <span style={styles.headerLabel}>Measurements</span>
        {simRunning && <span style={styles.liveDot} />}
      </div>

      <div
        style={{
          ...styles.statusBadge,
          color: STATUS_COLOR[simResult.status] || "var(--text-dim)",
          borderColor: STATUS_COLOR[simResult.status] || "var(--border)",
        }}
      >
        {STATUS_LABEL[simResult.status] || simResult.status}
      </div>
      {simResult.message && <p style={styles.statusMessage}>{simResult.message}</p>}

      {/* circuit-level summary */}
      <div style={styles.summaryGrid}>
        <div style={styles.summaryCell}>
          <span style={styles.summaryValue}>{fmt(railVoltage)}<small>V</small></span>
          <span style={styles.summaryLabel}>Rail voltage</span>
        </div>
        <div style={styles.summaryCell}>
          <span style={styles.summaryValue}>{fmt(totalCurrentMA, 1)}<small>mA</small></span>
          <span style={styles.summaryLabel}>Total current</span>
        </div>
        <div style={styles.summaryCell}>
          <span style={styles.summaryValue}>{fmt(totalPowerMW, 1)}<small>mW</small></span>
          <span style={styles.summaryLabel}>Total power</span>
        </div>
        <div style={styles.summaryCell}>
          <span style={styles.summaryValue}>
            {onRows.length}<small>/{nodes.length}</small>
          </span>
          <span style={styles.summaryLabel}>Parts live</span>
        </div>
      </div>

      {/* per-component breakdown */}
      <div style={styles.sectionLabel}>Per-component readings</div>
      {rows.length === 0 && <p style={styles.noRows}>No component readings for this run.</p>}

      <div style={styles.rowsWrap}>
        {rows
          .sort((a, b) => (b.reading.current_mA || 0) - (a.reading.current_mA || 0))
          .map(({ node, reading }) => {
            const isOn = reading.state === "on";
            return (
              <div key={node.id} style={styles.row}>
                <div style={styles.rowTop}>
                  <span style={styles.rowName}>{node.name}</span>
                  <span
                    style={{
                      ...styles.rowState,
                      color: isOn ? "var(--primary)" : "var(--text-faint)",
                    }}
                  >
                    {isOn ? "● live" : "○ idle"}
                  </span>
                </div>
                {isOn ? (
                  <div style={styles.rowStats}>
                    <span>
                      <strong>{fmt(reading.voltage)}</strong> V
                    </span>
                    <span>
                      <strong>{fmt(reading.current_mA, 1)}</strong> mA
                    </span>
                    <span>
                      <strong>{fmt(reading.power_mW, 1)}</strong> mW
                    </span>
                    {node.default_value != null && node.unit && (
                      <span style={styles.rowRating}>
                        {node.default_value} {node.unit} rated
                      </span>
                    )}
                  </div>
                ) : (
                  <div style={styles.rowStatsIdle}>No current flowing through this part.</div>
                )}
              </div>
            );
          })}
      </div>

      {simResult.suggestions?.length > 0 && (
        <>
          <div style={styles.sectionLabel}>Suggestions</div>
          <div style={styles.suggestionsWrap}>
            {simResult.suggestions.map((s, i) => (
              <div key={i} style={styles.suggestionRow}>
                <LightbulbIcon size={14} color="var(--color-accent)" />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  panel: {
    width: 300,
    flexShrink: 0,
    borderLeft: "1px solid var(--border)",
    background: "var(--surface)",
    backdropFilter: "blur(20px) saturate(160%)",
    WebkitBackdropFilter: "blur(20px) saturate(160%)",
    padding: "18px 16px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    boxShadow: "var(--card-shadow)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  headerLabel: {
    fontFamily: "var(--font-display)",
    fontSize: 11.5,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    color: "var(--text-faint)",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "var(--gold)",
    boxShadow: "0 0 5px 1px var(--gold)",
  },
  statusBadge: {
    display: "inline-block",
    fontFamily: "var(--font-display)",
    fontSize: 12,
    fontWeight: 600,
    padding: "5px 12px",
    borderRadius: 20,
    border: "1px solid",
    marginBottom: 8,
  },
  statusMessage: {
    fontSize: 12,
    color: "var(--text-dim)",
    lineHeight: 1.5,
    margin: "0 0 18px",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    marginBottom: 20,
  },
  summaryCell: {
    background: "var(--surface-2)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    padding: "10px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 2,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  },
  summaryValue: {
    fontFamily: "var(--font-display)",
    fontSize: 16,
    fontWeight: 700,
    color: "var(--primary)",
  },
  summaryLabel: {
    fontSize: 10.5,
    color: "var(--text-faint)",
  },
  sectionLabel: {
    fontFamily: "var(--font-display)",
    fontSize: 10.5,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "var(--text-faint)",
    margin: "4px 0 10px",
  },
  noRows: {
    fontSize: 12,
    color: "var(--text-dim)",
  },
  rowsWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginBottom: 8,
  },
  row: {
    background: "var(--surface-2)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    padding: "9px 11px",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.06)",
  },
  rowTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  rowName: {
    fontSize: 12.5,
    fontWeight: 600,
    color: "var(--text)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  rowState: {
    fontSize: 10,
    fontFamily: "var(--font-display)",
    flexShrink: 0,
    marginLeft: 8,
  },
  rowStats: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    fontSize: 11,
    color: "var(--text-dim)",
  },
  rowStatsIdle: {
    fontSize: 11,
    color: "var(--text-faint)",
    fontStyle: "italic",
  },
  rowRating: {
    color: "var(--text-faint)",
  },
  suggestionsWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  suggestionRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    fontSize: 11.5,
    color: "var(--text-dim)",
    lineHeight: 1.5,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "50px 10px 0",
  },
  emptyIcon: {
    fontSize: 22,
    color: "var(--text-faint)",
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 13.5,
    fontWeight: 600,
    color: "var(--text)",
    margin: "0 0 6px",
  },
  emptyText: {
    fontSize: 12,
    color: "var(--text-faint)",
    lineHeight: 1.6,
    maxWidth: 220,
  },
};