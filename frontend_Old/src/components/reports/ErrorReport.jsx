/**
 * ErrorReport
 * Muestra la tabla de errores léxicos, sintácticos y semánticos.
 *
 * Props:
 * - errors: Array<{ line, col, type, message }>
 *   type puede ser: "lexico" | "sintactico" | "semantico"
 *
 * Cuando no hay errores muestra un estado vacío en verde.
 * Cuando tu parser genere errores reales, pásalos desde IDE.jsx
 * usando setErrors() del hook useReports.
 */
export function ErrorReport({ errors }) {
  if (errors.length === 0) {
    return (
      <EmptyState
        icon="✓"
        color="#28C840"
        text="Sin errores detectados"
        sub="Ejecuta el código para analizar"
      />
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #2a2a2a" }}>
            {["Línea", "Col", "Tipo", "Descripción"].map((h) => (
              <th key={h} style={{
                padding: "6px 10px", textAlign: "left",
                color: "#5F5E5A", fontWeight: 500,
                fontFamily: "var(--font-sans)", whiteSpace: "nowrap",
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {errors.map((err, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #1e1e1e" }}>
              <td style={cell}>{err.line}</td>
              <td style={cell}>{err.col}</td>
              <td style={cell}>
                <TypeBadge type={err.type} />
              </td>
              <td style={{ ...cell, color: "#f09595", wordBreak: "break-word" }}>
                {err.message}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Sub-componentes ───────────────────────────────────────────────

function TypeBadge({ type }) {
  const colors = {
    lexico:     { bg: "#3a1515", text: "#f09595" },
    sintactico: { bg: "#3a2a10", text: "#FAC775" },
    semantico:  { bg: "#10233a", text: "#85B7EB" },
  };
  const c = colors[type] || colors.lexico;
  return (
    <span style={{
      background: c.bg, color: c.text,
      borderRadius: 4, padding: "2px 6px", fontSize: 10,
      fontFamily: "var(--font-sans)", whiteSpace: "nowrap",
    }}>
      {type}
    </span>
  );
}

function EmptyState({ icon, color, text, sub }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      height: "140px", gap: "8px",
    }}>
      <span style={{ fontSize: 24, color }}>{icon}</span>
      <span style={{ color: "#cccccc", fontSize: 12, fontFamily: "var(--font-sans)" }}>{text}</span>
      <span style={{ color: "#5F5E5A", fontSize: 11, fontFamily: "var(--font-sans)" }}>{sub}</span>
    </div>
  );
}

const cell = {
  padding: "5px 10px",
  color: "#b0b0b0",
  fontFamily: "'Fira Code', monospace",
  fontSize: 11,
  whiteSpace: "nowrap",
};