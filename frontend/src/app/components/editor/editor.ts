import {
  Component, ElementRef, ViewChild,
  AfterViewInit, OnDestroy, effect, inject
} from '@angular/core';
import * as monaco from 'monaco-editor';
import { registerGoScript }  from '../../utils/register-goscript';
import { FileService }       from '../../services/file.service';
import { ConsoleService, LogEntry } from '../../services/console.service';
import { GOSCRIPT_INITIAL_CODE }    from '../../constants/goscript.constants';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [],
  templateUrl: './editor.html',
})
export class Editor implements AfterViewInit, OnDestroy {

  // FIX: el nombre del ViewChild debe coincidir exactamente con #editorContainer en el HTML
  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;

  private editor!: monaco.editor.IStandaloneCodeEditor;
  private ignoreContentChange = false; // evita bucle al cargar contenido de otra pestaña

  private fileService    = inject(FileService);
  private consoleService = inject(ConsoleService);

  constructor() {
    let lastLoadedFileId: number | null = null;

    effect(() => {
  const activeId = this.fileService.activeTabId();
  if (!this.editor || !activeId) return;

  if (lastLoadedFileId === activeId) return; // 🔥 evita recarga innecesaria

  const file = this.fileService.activeFile();
  if (!file) return;

  this.ignoreContentChange = true;
  this.editor.setValue(file.content);
  this.ignoreContentChange = false;

  lastLoadedFileId = activeId;
});
  }

  ngAfterViewInit(): void {
    // Registrar GoScript antes de crear el editor
    registerGoScript();

    this.editor = monaco.editor.create(this.editorContainer.nativeElement, {
      value:                  GOSCRIPT_INITIAL_CODE,
      language:               'goscript',
      theme:                  'vs-dark',
      fontSize:               13.5,
      fontFamily:             "'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
      fontLigatures:          true,
      minimap:                { enabled: false },
      scrollBeyondLastLine:   false,
      automaticLayout:        true,
      padding:                { top: 14, bottom: 14 },
      lineNumbers:            'on',
      glyphMargin:            false,
      folding:                true,
      tabSize:                2,
      renderLineHighlight:    'gutter',
      cursorBlinking:         'smooth',
      smoothScrolling:        true,
      quickSuggestions:       true,
      fixedOverflowWidgets:   true,
    });

    // Guardar contenido en FileService al escribir
    this.editor.onDidChangeModelContent(() => {
      if (!this.ignoreContentChange) {
        this.fileService.updateContent(this.editor.getValue());
      }
    });

    // Ctrl/Cmd + Enter para ejecutar
    this.editor.addCommand(
      
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      () => this.runCode()
    );

    this.editor.setPosition({ lineNumber: 1, column: 1 });
  }

  // ── Ejecutar código ───────────────────────────────────────────
  // Por ahora evalúa JS directamente; cuando el parser esté listo
  // esto será un POST a /api/compile y recibirá errores/símbolos/AST.
  runCode(): void {
    const code = this.editor.getValue();
    const logs: LogEntry[] = [{ type: 'sys', text: '▸  Ejecutando...' }];

    const orig = {
      log:   console.log,
      error: console.error,
      warn:  console.warn,
      info:  console.info,
    };

    const fmt = (args: any[]) =>
      args.map(a => typeof a === 'object' && a !== null ? JSON.stringify(a, null, 2) : String(a)).join(' ');

    console.log   = (...a) => logs.push({ type: 'log',   text: fmt(a) });
    console.error = (...a) => logs.push({ type: 'error', text: fmt(a) });
    console.warn  = (...a) => logs.push({ type: 'warn',  text: fmt(a) });
    console.info  = (...a) => logs.push({ type: 'info',  text: fmt(a) });

    try {
      // eslint-disable-next-line no-eval
      eval(code);
      logs.push({ type: 'sys', text: '▸  Completado sin errores.' });
    } catch (e: any) {
      logs.push({ type: 'error', text: `×  ${e.name}: ${e.message}` });
    } finally {
      Object.assign(console, orig);
    }

    this.consoleService.append(logs);
  }

  getEditor(): monaco.editor.IStandaloneCodeEditor {
    return this.editor;
  }

  ngOnDestroy(): void {
    this.editor?.dispose();
  }
}
