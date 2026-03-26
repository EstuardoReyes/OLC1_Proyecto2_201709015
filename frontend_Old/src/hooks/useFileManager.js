import { useState, useRef } from "react";
import { INITIAL_CODE } from "../constants";
 
/**
 * useFileManager
 * Gestiona pestañas con contenido independiente.
 *
 * Cada pestaña tiene: { name: string, content: string }
 * Al cambiar de pestaña se guarda el contenido actual en Monaco
 * y se carga el contenido de la nueva pestaña.
 */
export function useFileManager(editorRef) {
  const [tabs, setTabs] = useState([
    { name: "nuevo.gst", content: INITIAL_CODE },
  ]);
  const [activeTab, setActiveTabIdx] = useState(0);
 
  // ── Cambiar de pestaña ─────────────────────────────────────────
  const switchTab = (newIndex) => {
    if (!editorRef.current) return;
 
    // Guardar contenido de la pestaña actual antes de cambiar
    setTabs((prev) => {
      const updated = [...prev];
      updated[activeTab] = {
        ...updated[activeTab],
        content: editorRef.current.getValue(),
      };
      return updated;
    });
 
    // Cargar contenido de la nueva pestaña
    const newContent = tabs[newIndex]?.content ?? "";
    editorRef.current.setValue(newContent);
    editorRef.current.setPosition({ lineNumber: 1, column: 1 });
    editorRef.current.revealLine(1);
 
    setActiveTabIdx(newIndex);
  };
 
  // ── Nuevo archivo ──────────────────────────────────────────────
  const newFile = () => {
    // Guardar contenido actual
    const currentContent = editorRef.current?.getValue() ?? "";
    const nombre = `archivo_${tabs.length + 1}.gst`;
 
    setTabs((prev) => {
      const updated = [...prev];
      updated[activeTab] = { ...updated[activeTab], content: currentContent };
      return [...updated, { name: nombre, content: "// Nuevo archivo GoScript\n" }];
    });
 
    // Cambiar a la nueva pestaña
    const newIdx = tabs.length;
    setActiveTabIdx(newIdx);
 
    if (editorRef.current) {
      editorRef.current.setValue("// Nuevo archivo GoScript\n");
      editorRef.current.setPosition({ lineNumber: 1, column: 1 });
      editorRef.current.focus();
    }
  };
 
  // ── Cerrar pestaña ─────────────────────────────────────────────
  const closeTab = (indexToClose) => {
    if (tabs.length === 1) return; // Siempre mantener al menos una pestaña
 
    setTabs((prev) => prev.filter((_, i) => i !== indexToClose));
 
    const nextActive = indexToClose >= tabs.length - 1
      ? tabs.length - 2
      : indexToClose;
 
    setActiveTabIdx(nextActive);
 
    // Cargar contenido de la pestaña que quedará activa
    const nextContent = tabs.filter((_, i) => i !== indexToClose)[nextActive]?.content ?? "";
    if (editorRef.current) {
      editorRef.current.setValue(nextContent);
      editorRef.current.setPosition({ lineNumber: 1, column: 1 });
      editorRef.current.revealLine(1);
    }
  };
 
  // ── Abrir archivo .gst ─────────────────────────────────────────
  const openFile = async () => {
    try {
      if (window.showOpenFilePicker) {
        const [handle] = await window.showOpenFilePicker({
          types: [{ description: "GoScript", accept: { "text/plain": [".gst"] } }],
        });
        const file    = await handle.getFile();
        const content = await file.text();
 
        const newTab = { name: file.name, content };
        const newIdx = tabs.length;
 
        // Guardar pestaña actual primero
        setTabs((prev) => {
          const updated = [...prev];
          if (editorRef.current) {
            updated[activeTab] = { ...updated[activeTab], content: editorRef.current.getValue() };
          }
          return [...updated, newTab];
        });
 
        setActiveTabIdx(newIdx);
 
        if (editorRef.current) {
          editorRef.current.setValue(content);
          editorRef.current.setPosition({ lineNumber: 1, column: 1 });
          editorRef.current.revealLine(1);
        }
      } else {
        // Fallback para Firefox
        const input = document.createElement("input");
        input.type   = "file";
        input.accept = ".gst";
        input.onchange = async (e) => {
          const file    = e.target.files[0];
          if (!file) return;
          const content = await file.text();
          const newTab  = { name: file.name, content };
          const newIdx  = tabs.length;
          setTabs((prev) => [...prev, newTab]);
          setActiveTabIdx(newIdx);
          if (editorRef.current) {
            editorRef.current.setValue(content);
            editorRef.current.setPosition({ lineNumber: 1, column: 1 });
          }
        };
        input.click();
      }
    } catch (err) {
      if (err.name !== "AbortError") console.error(err);
    }
  };
 
  // ── Guardar archivo .gst ───────────────────────────────────────
  const saveFile = () => {
    const code     = editorRef.current?.getValue() ?? "";
    const fileName = tabs[activeTab]?.name || "script.gst";
    const blob     = new Blob([code], { type: "text/plain" });
    const url      = URL.createObjectURL(blob);
    const a        = document.createElement("a");
    a.href         = url;
    a.download     = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };
 
  return {
    tabs,
    activeTab,
    switchTab,
    newFile,
    closeTab,
    openFile,
    saveFile,
  };
}
 