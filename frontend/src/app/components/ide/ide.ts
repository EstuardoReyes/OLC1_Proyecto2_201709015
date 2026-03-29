import { Component, ViewChild, inject } from '@angular/core';
import { Tabs }           from '../tabs/tabs';
import { Editor }         from '../editor/editor';
import { Console }        from '../console/console';
import { Reports }        from '../reports/reports';
import { ConsoleService } from '../../services/console.service';

@Component({
  selector: 'app-ide',
  standalone: true,
  imports: [Tabs, Editor, Console, Reports],
  templateUrl: './ide.html',
})
export class IDE {
  @ViewChild(Editor) editorComponent!: Editor;

  private consoleService = inject(ConsoleService);

  // El botón ▶ Ejecutar del TitleBar delega al EditorComponent
  run(): void {
    this.editorComponent?.runCode();
  }

  clearConsole(): void {
    this.consoleService.clear();
  }

  // Altura del panel de consola (px) — arrastrable
  consoleHeight = 180;
  private dragging = false;
  private startY   = 0;
  private startH   = 0;

  onResizeStart(event: MouseEvent): void {
    this.dragging = true;
    this.startY   = event.clientY;
    this.startH   = this.consoleHeight;
    event.preventDefault();
  }

  onMouseMove = (event: MouseEvent): void => {
    if (!this.dragging) return;
    const delta        = this.startY - event.clientY;
    this.consoleHeight = Math.max(60, Math.min(380, this.startH + delta));
  };

  onMouseUp = (): void => { this.dragging = false; };

  ngOnInit(): void {
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup',   this.onMouseUp);
  }

  ngOnDestroy(): void {
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup',   this.onMouseUp);
  }
}
