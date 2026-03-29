import { Injectable, signal } from '@angular/core';

export type LogType = 'log' | 'error' | 'warn' | 'info' | 'sys';

export interface LogEntry {
  type: LogType;
  text: string;
}

/**
 * ConsoleService
 * Gestiona los mensajes del panel de consola.
 * El EditorComponent escribe aquí al ejecutar código.
 * El ConsoleComponent lee de aquí para mostrar los logs.
 */
@Injectable({ providedIn: 'root' })
export class ConsoleService {

  logs = signal<LogEntry[]>([
    { type: 'sys', text: '▸  Consola lista. Presiona ▶ Ejecutar o Ctrl+Enter.' }
  ]);

  append(entries: LogEntry[]): void {
    this.logs.set(entries);
  }

  clear(): void {
    this.logs.set([{ type: 'sys', text: '▸  Consola limpiada.' }]);
  }
}
