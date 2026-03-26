/**
 * StatusBar
 * Barra inferior con info del archivo: lenguaje, encoding, cursor.
 *
 * Props:
 * - cursorPos: string "Ln X, Col Y"
 */
export function StatusBar({ cursorPos }) {
  return (
    <div style={{
      background: "#BA7517",
      height: 21,
      display: "flex",
      alignItems: "center",
      padding: "0 14px",
      gap: 20,
      flexShrink: 0,
    }}>
      {["GoScript", "UTF-8", "LF", cursorPos, "Tab: 2"].map((item) => (
        <span key={item} style={{
          fontSize: 10.5,
          color: "#1a1a1a",
          fontFamily: "var(--font-sans)",
          letterSpacing: "0.02em",
          opacity: 0.85,
        }}>
          {item}
        </span>
      ))}
    </div>
  );
}
 