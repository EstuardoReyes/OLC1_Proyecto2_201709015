/**
 * FileTabs
 * Pestañas de archivos con botón × para cerrar cada una.
 * La última pestaña no puede cerrarse.
 *
 * Props:
 * - tabs:        Array<{ name, content }>
 * - activeIndex: número
 * - onTabClick:  (index) => void
 * - onClose:     (index) => void
 */
export function FileTabs({ tabs, activeIndex, onTabClick, onClose }) {
  return (
    <div style={{
      background: "#252526",
      borderBottom: "1px solid #2a2a2a",
      display: "flex",
      alignItems: "stretch",
      height: "32px",
      flexShrink: 0,
      overflowX: "auto",
      paddingLeft: "4px",
    }}>
      {tabs.map((tab, i) => {
        const isActive = i === activeIndex;
        return (
          <div
            key={i}
            onClick={() => onTabClick(i)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "0 10px 0 14px",
              fontSize: 11,
              fontFamily: "var(--font-sans)",
              cursor: "pointer",
              color: isActive ? "#cccccc" : "#6b6b6b",
              background: isActive ? "#1e1e1e" : "transparent",
              borderRight: "1px solid #2a2a2a",
              borderBottom: isActive ? "2px solid #EF9F27" : "2px solid transparent",
              userSelect: "none",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {tab.name}
 
            {/* Botón cerrar — se oculta en la última pestaña */}
            {tabs.length > 1 && (
              <span
                onClick={(e) => {
                  e.stopPropagation(); // no activar la pestaña al cerrarla
                  onClose(i);
                }}
                title="Cerrar pestaña"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 14,
                  height: 14,
                  borderRadius: 3,
                  fontSize: 11,
                  lineHeight: 1,
                  color: isActive ? "#888" : "#555",
                  transition: "color 0.1s, background 0.1s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color      = "#f09595";
                  e.currentTarget.style.background = "#3a1515";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color      = isActive ? "#888" : "#555";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                ×
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
 