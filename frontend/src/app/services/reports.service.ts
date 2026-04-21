import { Injectable, signal } from '@angular/core';

export interface ErrorEntry {
  line:    number;
  col:     number;
  type:    'lexico' | 'sintactico' | 'semantico';
  message: string;
}

export interface SymbolEntry {
  name:     string;
  kind:     'variable' | 'funcion' | 'parametro' | 'struct';
  dataType: string;
  scope:    string;
  line:     number;
}


/**
 * ReportsService
 * Almacena los resultados del análisis léxico, sintáctico y semántico.
 *
 * Cuando integres tu parser de GoScript (NestJS + Jison),
 * llama a setErrors(), setSymbols() y setAst() con los datos reales
 * que devuelva tu API en /api/compile.
 */
@Injectable({ providedIn: 'root' })
export class ReportsService {
  errors  = signal<ErrorEntry[]>([]);
  symbols = signal<SymbolEntry[]>([]);
  ast     = signal<string | null>(null);

  setErrors(errors: ErrorEntry[]):   void { this.errors.set(errors); }
  setSymbols(symbols: SymbolEntry[]): void { this.symbols.set(symbols); }
  setAst(dotString: string | null):  void { this.ast.set(dotString); }

  clearAll(): void {
    this.errors.set([]);
    this.symbols.set([]);
    this.ast.set(null);
  }
}
