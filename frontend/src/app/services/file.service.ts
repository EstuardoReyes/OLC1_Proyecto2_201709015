import { Injectable, signal, computed, effect } from '@angular/core';
import { GOSCRIPT_INITIAL_CODE } from '../constants/goscript.constants';

export interface Tab {
  id:      number;
  name:    string;
  content: string;
}

/**
 * FileService
 * Servicio singleton que gestiona las pestañas y archivos del IDE.
 *
 * Usa signals de Angular 17+ para reactividad.
 * El EditorComponent se suscribe a activeTabId para cargar contenido.
 */
@Injectable({ providedIn: 'root' })
export class FileService {

  // ── Estado reactivo ───────────────────────────────────────────
  tabs        = signal<Tab[]>([{ id: 1, name: 'main.gst', content: GOSCRIPT_INITIAL_CODE }]);
  activeTabId = signal<number>(1);

  activeFile = computed(() =>
    this.tabs().find(t => t.id === this.activeTabId())
  );

  // ── Cambiar de pestaña ────────────────────────────────────────
  // NOTA: antes de llamar esto, el EditorComponent guarda el contenido
  // actual vía updateContent(). El orden es importante.
  setActiveTab(id: number): void {
    this.activeTabId.set(id);
  }

  // ── Actualizar contenido de la pestaña activa ─────────────────
  // El EditorComponent llama esto en onDidChangeModelContent
  updateContent(content: string): void {
    this.tabs.update(tabs =>
      tabs.map(t => t.id === this.activeTabId() ? { ...t, content } : t)
    );
  }

  // ── Nuevo archivo en blanco ───────────────────────────────────
  createFile(): void {
    const newTab: Tab = {
      id:      Date.now(),
      name:    `archivo_${this.tabs().length + 1}.gst`,
      content: '// Nuevo archivo GoScript\n',
    };
    this.tabs.update(tabs => [...tabs, newTab]);
    this.activeTabId.set(newTab.id);
  }

  // ── Cerrar pestaña ────────────────────────────────────────────
  closeTab(id: number): void {
    if (this.tabs().length === 1) return; // siempre mantener una pestaña

    const currentTabs = this.tabs();
    const idx         = currentTabs.findIndex(t => t.id === id);
    const newTabs     = currentTabs.filter(t => t.id !== id);

    this.tabs.set(newTabs);

    // Si se cerró la pestaña activa, activar la anterior o la primera
    if (id === this.activeTabId()) {
      const nextIdx = Math.max(0, idx - 1);
      this.activeTabId.set(newTabs[nextIdx].id);
    }
  }

  // ── Abrir archivo .gst desde disco ───────────────────────────
  async openFile(): Promise<void> {
    try {
      if ('showOpenFilePicker' in window) {
        const [handle] = await (window as any).showOpenFilePicker({
          types: [{ description: 'GoScript', accept: { 'text/plain': ['.gst'] } }],
        });
        const file    = await handle.getFile();
        const content = await file.text();
        const newTab: Tab = { id: Date.now(), name: file.name, content };
        this.tabs.update(tabs => [...tabs, newTab]);
        this.activeTabId.set(newTab.id);
      } else {
        // Fallback: input[type=file]
        const input    = document.createElement('input');
        input.type     = 'file';
        input.accept   = '.gst';
        input.onchange = async (e: any) => {
          const file    = e.target.files[0];
          if (!file) return;
          const content = await file.text();
          const newTab: Tab = { id: Date.now(), name: file.name, content };
          this.tabs.update(tabs => [...tabs, newTab]);
          this.activeTabId.set(newTab.id);
        };
        input.click();
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') console.error(err);
    }
  }

  // ── Guardar pestaña activa como .gst ─────────────────────────
  saveFile(): void {
    const file = this.activeFile();
    if (!file) return;
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  }

  getFileById(id: number) {
    return this.tabs().find(f => f.id === id);
  }
}
