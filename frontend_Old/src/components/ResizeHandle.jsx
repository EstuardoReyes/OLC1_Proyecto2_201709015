import { useEffect, useRef, useState } from "react";

/**
 * ResizeHandle
 * Barra arrastrable para redimensionar la altura de la consola.
 */
export function ResizeHandle({ consoleHeight, onResize }) {
  const [hovered, setHovered] = useState(false);
  const dragging = useRef(false);
  const start    = useRef({ y: 0, h: 0 });

  const onMouseDown = (e) => {
    dragging.current = true;
    start.current    = { y: e.clientY, h: consoleHeight };
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      const delta = start.current.y - e.clientY;
      onResize(Math.max(60, Math.min(380, start.current.h + delta)));
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [onResize]);

  return (
    <div
      onMouseDown={onMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        height: 5,
        background: hovered ? "#EF9F2760" : "#2a2a2a",
        cursor: "row-resize",
        flexShrink: 0,
        borderTop: "1px solid #3a3a3a",
        borderBottom: "1px solid #3a3a3a",
        transition: "background 0.15s",
      }}
    />
  );
}