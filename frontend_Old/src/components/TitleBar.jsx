/**
 * TitleBar
 * Barra superior con botones de archivo (Nuevo, Abrir, Guardar),
 * nombre del archivo activo, y acciones Run / Clear.
 */
export function TitleBar({ activeFileName, onNew, onOpen, onSave, onRun, onClear }) {
  const fileActions = [
    { label: "Nuevo",   fn: onNew,  tip: "Nuevo archivo .gst" },
    { label: "Abrir",   fn: onOpen, tip: "Abrir archivo .gst" },
    { label: "Guardar", fn: onSave, tip: "Guardar como .gst"  },
  ];

  return (
    <div style={{
      background: "#2d2d2d",
      borderBottom: "1px solid #3a3a3a",
      padding: "0 14px",
      height: "40px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      flexShrink: 0,
    }}>
      {["#FF5F57", "#FFBD2E", "#28C840"].map((c) => (
        <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c, flexShrink: 0 }} />
      ))}

      <div style={{ display: "flex", gap: "2px", marginLeft: "6px" }}>
        {fileActions.map(({ label, fn, tip }) => (
          <GhostButton key={label} onClick={fn} title={tip}>{label}</GhostButton>
        ))}
      </div>

      <div style={{ flex: 1, textAlign: "center" }}>
        <span style={{ color: "#6b6b6b", fontSize: 11, fontFamily: "var(--font-sans)" }}>
          {activeFileName}
        </span>
      </div>

      <button
        onClick={onRun}
        title="Ejecutar (Ctrl+Enter)"
        style={{
          background: "#EF9F27", color: "#1a1a1a",
          border: "none", borderRadius: "6px",
          padding: "5px 14px", fontSize: 12, fontWeight: 700,
          cursor: "pointer", fontFamily: "var(--font-sans)",
          display: "flex", alignItems: "center", gap: "5px",
        }}
      >
        ▶ Ejecutar
      </button>

      <GhostButton onClick={onClear} title="Limpiar consola">Clear</GhostButton>
    </div>
  );
}

function GhostButton({ onClick, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: "transparent", color: "#9e9e9e",
        border: "1px solid transparent", borderRadius: "4px",
        padding: "3px 9px", fontSize: 11,
        cursor: "pointer", fontFamily: "var(--font-sans)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "#cccccc";
        e.currentTarget.style.borderColor = "#444";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "#9e9e9e";
        e.currentTarget.style.borderColor = "transparent";
      }}
    >
      {children}
    </button>
  );
}