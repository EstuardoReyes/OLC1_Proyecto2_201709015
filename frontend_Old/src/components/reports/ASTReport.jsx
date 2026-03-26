import { useState } from "react";

/**
 * ASTReport
 * Visualiza el Árbol de Sintaxis Abstracta (AST).
 *
 * Props:
 * - ast: Object | null  — nodo raíz del árbol
 *   Formato esperado de cada nodo:
 *   { type: string, value?: string, children?: Node[] }
 *
 * El árbol es colapsable: haz clic en cualquier nodo para
 * expandir o colapsar sus hijos.
 *
 * Cuando tu parser genere el AST real, pásalo desde IDE.jsx
 * usando setAst() del hook useReports.
 */
export function ASTReport({ ast }) {
  if (!ast) {
    return (
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        height: "140px", gap: "8px",
      }}>
        <span style={{ fontSize: 22, color: "#3a3a3a" }}>⊘</span>
        <span style={{ color: "#6b6b6b", fontSize: 12, fontFamily: "var(--font-sans)" }}>
          AST no generado
        </span>
        <span style={{ color: "#444", fontSize: 11, fontFamily: "var(--font-sans)" }}>
          Ejecuta el código para ver el árbol
        </span>
      </div>
    );
  }

  return (
    <div style={{
      padding: "8px 4px",
      overflowY: "auto",
      fontFamily: "'Fira Code', monospace",
      fontSize: 11,
    }}>
      <ASTNode node={ast} depth={0} />
    </div>
  );
}

/**
 * ASTNode
 * Nodo recursivo del árbol. Colapsable al hacer clic.
 */
function ASTNode({ node, depth }) {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  // Color del nodo según su tipo
  const typeColors = {
    Program:    "#AFA9EC",
    Function:   "#5DCAA5",
    Variable:   "#85B7EB",
    BinaryOp:   "#FAC775",
    Call:       "#F0997B",
    Literal:    "#d4d4d4",
    Identifier: "#9cdcfe",
  };
  const color = typeColors[node.type] || "#888";

  return (
    <div style={{ paddingLeft: depth === 0 ? 0 : 14, borderLeft: depth > 0 ? "1px solid #2a2a2a" : "none", marginLeft: depth > 0 ? 7 : 0 }}>
      <div
        onClick={() => hasChildren && setOpen((v) => !v)}
        style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "2px 6px",
          cursor: hasChildren ? "pointer" : "default",
          borderRadius: 4,
          userSelect: "none",
        }}
        onMouseEnter={(e) => { if (hasChildren) e.currentTarget.style.background = "#2a2a2a"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
      >
        {/* Triángulo expandir/colapsar */}
        <span style={{ color: "#444", fontSize: 9, width: 10, display: "inline-block" }}>
          {hasChildren ? (open ? "▾" : "▸") : "·"}
        </span>

        {/* Tipo del nodo */}
        <span style={{ color, fontWeight: 500 }}>{node.type}</span>

        {/* Valor opcional (literal, nombre de variable, etc.) */}
        {node.value !== undefined && (
          <span style={{ color: "#888", fontSize: 10 }}>
            = <span style={{ color: "#d4d4d4" }}>{String(node.value)}</span>
          </span>
        )}
      </div>

      {/* Hijos del nodo */}
      {hasChildren && open && (
        <div>
          {node.children.map((child, i) => (
            <ASTNode key={i} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}