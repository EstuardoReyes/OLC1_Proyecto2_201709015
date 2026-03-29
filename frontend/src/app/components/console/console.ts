import { Component, inject } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { ConsoleService }    from '../../services/console.service';

@Component({
  selector: 'app-console',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './console.html'
})
export class Console {
  consoleService = inject(ConsoleService);

  // Colores por tipo de mensaje
  readonly colors: Record<string, string> = {
    log:   '#d4d4d4',
    error: '#f09595',
    warn:  '#FAC775',
    info:  '#85B7EB',
    sys:   '#5F5E5A',
  };

  // Borde lateral por tipo
  readonly borders: Record<string, string> = {
    error: '2px solid #f0959550',
    warn:  '2px solid #FAC77550',
  };

  getColor(type: string):  string { return this.colors[type]  ?? this.colors['log']; }
  getBorder(type: string): string { return this.borders[type] ?? '2px solid transparent'; }

  clear(): void {
    this.consoleService.clear();
  }

  get hasErrors(): boolean {
    return this.consoleService.logs().some(l => l.type === 'error');
  }
}
