/**
 * Tipos compartidos entre el intérprete y el servicio.
 */
 
export interface ErrorInfo {
  type:    'lexico' | 'sintactico' | 'semantico' | 'runtime';
  message: string;
  line:    number;
  col:     number;
}
 
export interface SymbolInfo {
  nombre:  string;
  tipo:    string;
  valor:   any;
  scope:   string;
  linea:   number;
}
 
export interface ResultadoEjecucion {
  output:  string[];
  symbols: SymbolInfo[];
  errors:  ErrorInfo[];
}
 
/**
 * Señal interna usada para implementar return, break y continue.
 * No es un error — es un mecanismo de control de flujo.
 */
export class ReturnSignal {
  constructor(public valor: any) {}
}
 
export class BreakSignal {}
export class ContinueSignal {}
 