import { useEffect, useRef } from "react";
import { useMonaco } from "../hooks/useMonaco";
import { registerGoScript } from "../utils/registerGoScript";
import { INITIAL_CODE } from "../constants";
 
/**
 * Editor
 * Wrapper de Monaco Editor para GoScript.
 *
 * Fixes:
 * - Contenedor con position:absolute + inset:0 → ancho 100% real
 * - Cursor siempre en Ln 1, Col 1 al montar (con setTimeout para
 *   esperar el primer layout de Monaco)
 */
export function Editor({ editorRef, onCursorChange, onRun, value, onChange }) {
  const { loaded } = useMonaco();
  const containerRef = useRef(null);
 
  useEffect(() => {
    if (!loaded || !containerRef.current || editorRef.current) return;
 
    registerGoScript(window.monaco);
 
    const editor = window.monaco.editor.create(containerRef.current, {
      value: value,
      language: "goscript",
      theme: "vs-dark",
      fontSize: 13.5,
      fontFamily: "'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
      fontLigatures: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      padding: { top: 14, bottom: 14 },
      lineNumbers: "on",
      glyphMargin: false,
      folding: true,
      tabSize: 2,
      wordWrap: "off",          // off evita el centrado visual extraño
      renderLineHighlight: "gutter",
      cursorBlinking: "smooth",
      smoothScrolling: true,
      quickSuggestions: true,
      suggestOnTriggerCharacters: true,
      fixedOverflowWidgets: true,
    });

    editor.onDidChangeModelContent(() => {
        const currentValue = editor.getValue();
        onChange(currentValue);
    });

    useEffect(() => {
        if (editorRef.current && value !== undefined) {
            const current = editorRef.current.getValue();
            if (current !== value) {
            editorRef.current.setValue(value);
            }
        }
        }, [value]);
 
    // FIX cursor: esperamos al primer layout antes de mover el cursor
    setTimeout(() => {
      editor.setPosition({ lineNumber: 1, column: 1 });
      editor.revealLine(1);
      editor.focus();
    }, 50);
 
    editor.onDidChangeCursorPosition((e) => {
      onCursorChange(`Ln ${e.position.lineNumber}, Col ${e.position.column}`);
    });
 
    editor.addCommand(
      window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.Enter,
      onRun
    );
 
    editorRef.current = editor;
 
    return () => {
      editor.dispose();
      editorRef.current = null;
    };
  }, [loaded]);
 
  return (
    // Wrapper relativo → hijo absoluto → Monaco ocupa exactamente este espacio
    <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
      {!loaded && <LoadingOverlay />}
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          inset: 0,             // top:0 right:0 bottom:0 left:0 → 100% width y height
        }}
      />
    </div>
  );
}
 
function LoadingOverlay() {
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 10,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: "12px", background: "#1e1e1e",
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{
        width: 24, height: 24,
        border: "2px solid #3a3a3a",
        borderTopColor: "#EF9F27",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <span style={{ color: "#5F5E5A", fontSize: 12, fontFamily: "var(--font-sans)" }}>
        Cargando Monaco Editor...
      </span>
    </div>
  );
}