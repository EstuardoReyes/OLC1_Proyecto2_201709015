import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ReportsService } from './reports.service';
import { ConsoleService, LogEntry } from './console.service';

export interface CompileResponse {
  success: boolean;
  output:  string[];
  errors:  { line: number; col: number; type: 'lexico'|'sintactico'|'semantico'; message: string }[];
  symbols: { name: string; kind: 'variable'|'funcion'|'parametro'|'struct'; dataType: string; scope: string; line: number }[];
  ast:     string | null;   // DOT string para Graphviz
}

/**
 * CompilerService
 * Llama al endpoint POST /api/interpreter/compile del backend NestJS
 * y distribuye la respuesta a ReportsService y ConsoleService.
 *
 * El proxy de Angular redirige /api → http://localhost:3000
 * (configurado en proxy.conf.json)
 */
@Injectable({ providedIn: 'root' })
export class CompilerService {

  private http           = inject(HttpClient);
  private reportsService = inject(ReportsService);
  private consoleService = inject(ConsoleService);
  private API_URL        = 'http://localhost:3000';
  

  async compile(code: string): Promise<void> {
    // Indicar que está compilando
    console.log('Enviando código al compilador ', code);
    this.consoleService.append([
      { type: 'sys', text: '▸  Enviando al compilador...' }
    ]);

    try {
      const res = await firstValueFrom(
        this.http.post<CompileResponse>(`${this.API_URL}/api/interpreter/compile`, { code })
      );

      // ── Consola: líneas de output ─────────────────────────────
      const logs: LogEntry[] = res.output.map(line => ({ type: 'log' as const, text: line }));

      if (res.errors.length > 0) {
        logs.push({ type: 'sys', text: `▸  ${res.errors.length} error(es) encontrado(s).` });
      } else {
        logs.push({ type: 'sys', text: '▸  Compilación exitosa.' });
      }

      this.consoleService.append(logs);

      // ── Panel de reportes ─────────────────────────────────────
      this.reportsService.setErrors(res.errors);
      this.reportsService.setSymbols(res.symbols);
      this.reportsService.setAst(res.ast);

    } catch (err: any) {
      const msg = err?.error?.message ?? err?.message ?? 'Error de conexión con el backend';
      this.consoleService.append([
        { type: 'error', text: `×  ${msg}` },
        { type: 'sys',   text: '▸  Verifica que el backend esté corriendo en el puerto 3000.' },
      ]);
    }
  }
}
