import { LOG_COLORS } from "../constants";

/**
 * ConsolePanel
 * Panel de output con mensajes coloreados por tipo.
 *
 * Props:
 * - logs:   Array<{ type: string, text: string }>
 * - height: número en px (controlado por ResizeHandle)
 */
export function ConsolePanel({ logs, height }) {
  const hasErrors = logs.some((l) => l.type === "error");

  return (
    <div style={{
      height,
      background: "#141414",
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        padding: "5px 14px",
        borderBottom: "1px solid #2a2a2a",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        flexShrink: 0,
        background: "#1a1a1a",
      }}>
        <span style={{
          color: "#5F5E5A", fontSize: 10,
          textTransform: "uppercase", letterSpacing: "0.1em",
          fontFamily: "var(--font-sans)",
        }}>
          Consola
        </span>
        <span style={{
          width: 6, height: 6, borderRadius: "50%",
          background: hasErrors ? "#f09595" : "#28C840",
        }} />
        <span style={{ marginLeft: "auto", color: "#444", fontSize: 10, fontFamily: "var(--font-sans)" }}>
          Ctrl+Enter para ejecutar
        </span>
      </div>

      {/* Logs */}
      <div style={{
        flex: 1, overflowY: "auto",
        padding: "8px 14px",
        display: "flex", flexDirection: "column", gap: "1px",
      }}>
        {logs.map((line, i) => (
          <div key={i} style={{
            fontSize: 12,
            lineHeight: 1.7,
            fontFamily: "'Fira Code', 'Consolas', monospace",
            color: LOG_COLORS[line.type] || LOG_COLORS.log,
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            borderLeft: line.type === "error" ? "2px solid #f0959550"
                      : line.type === "warn"  ? "2px solid #FAC77550"
                      : "2px solid transparent",
            paddingLeft: "8px",
          }}>
            {line.text}
          </div>
        ))}
      </div>
    </div>
  );
}