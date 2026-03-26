import { useState } from "react";
import { REPORT_TABS } from "../constants";
import { ErrorReport }  from "./reports/ErrorReport";
import { SymbolTable }  from "./reports/SymbolTable";
import { ASTReport }    from "./reports/ASTReport";
 
/**
 * ReportsPanel
 * Panel derecho fijo con tres tabs: Errores, Símbolos, AST.
 * Se muestra al lado del editor (layout horizontal en IDE.jsx).
 *
 * Props:
 * - errors:  Array (viene de useReports)
 * - symbols: Array (viene de useReports)
 * - ast:     Object | null (viene de useReports)
 * - width:   número en px (por defecto 300)
 */
export function ReportsPanel({ errors, symbols, ast, width = 300 }) {
  const [activeTab, setActiveTab] = useState(0);
 
  const errorCount = errors.length;
 
  return (
    <div style={{
      width,
      minWidth: width,
      background: "#1a1a1a",
      borderLeft: "1px solid #2a2a2a",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* Header del panel */}
      <div style={{
        background: "#252526",
        borderBottom: "1px solid #2a2a2a",
        padding: "0 4px",
        display: "flex",
        alignItems: "stretch",
        height: "32px",
        flexShrink: 0,
      }}>
        {REPORT_TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            style={{
              padding: "0 12px",
              border: "none",
              background: "transparent",
              color: i === activeTab ? "#cccccc" : "#5F5E5A",
              borderBottom: i === activeTab ? "2px solid #EF9F27" : "2px solid transparent",
              fontSize: 11,
              fontFamily: "var(--font-sans)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              whiteSpace: "nowrap",
            }}
          >
            {tab}
            {/* Badge con conteo de errores */}
            {tab === "Errores" && errorCount > 0 && (
              <span style={{
                background: "#3a1515", color: "#f09595",
                borderRadius: 10, padding: "0px 5px",
                fontSize: 9, fontWeight: 700,
              }}>
                {errorCount}
              </span>
            )}
          </button>
        ))}
      </div>
 
      {/* Contenido del tab activo */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {activeTab === 0 && <ErrorReport errors={errors} />}
        {activeTab === 1 && <SymbolTable symbols={symbols} />}
        {activeTab === 2 && <ASTReport ast={ast} />}
      </div>
    </div>
  );
}