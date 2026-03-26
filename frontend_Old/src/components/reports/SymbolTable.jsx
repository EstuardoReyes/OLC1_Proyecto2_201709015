/**
 * SymbolTable
 * Tabla de símbolos: variables, funciones y métodos declarados.
 *
 * Props:
 * - symbols: Array<{ name, type, dataType, scope, line }>
 *   type puede ser: "variable" | "funcion" | "parametro"
 *
 * Cuando tu parser genere la tabla real, pásala desde IDE.jsx
 * usando setSymbols() del hook useReports.
 */
export function SymbolTable({ symbols }) {
  if (symbols.length === 0) {
    return (
      <EmptyState
        text="Tabla de símbolos vacía"
        sub="Ejecuta el código para analizar los símbolos"
      />
    );
  }
 
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #2a2a2a" }}>
            {["Nombre", "Tipo", "Dato", "Entorno", "Línea"].map((h) => (
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
          {symbols.map((sym, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #1e1e1e" }}>
              <td style={{ ...cell, color: "#85B7EB" }}>{sym.name}</td>
              <td style={cell}><KindBadge kind={sym.type} /></td>
              <td style={{ ...cell, color: "#FAC775" }}>{sym.dataType}</td>
              <td style={{ ...cell, color: "#9e9e9e" }}>{sym.scope}</td>
              <td style={{ ...cell, color: "#5F5E5A" }}>{sym.line}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
 
function KindBadge({ kind }) {
  const colors = {
    variable:  { bg: "#1a2a1a", text: "#5DCAA5" },
    funcion:   { bg: "#2a1a2a", text: "#AFA9EC" },
    parametro: { bg: "#1a1a2a", text: "#85B7EB" },
  };
  const c = colors[kind] || colors.variable;
  return (
    <span style={{
      background: c.bg, color: c.text,
      borderRadius: 4, padding: "2px 6px", fontSize: 10,
      fontFamily: "var(--font-sans)", whiteSpace: "nowrap",
    }}>
      {kind}
    </span>
  );
}
 
function EmptyState({ text, sub }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      height: "140px", gap: "8px",
    }}>
      <span style={{ fontSize: 22, color: "#3a3a3a" }}>⊘</span>
      <span style={{ color: "#6b6b6b", fontSize: 12, fontFamily: "var(--font-sans)" }}>{text}</span>
      <span style={{ color: "#444", fontSize: 11, fontFamily: "var(--font-sans)" }}>{sub}</span>
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