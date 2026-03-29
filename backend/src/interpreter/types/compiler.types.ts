/* ================================================================
   compiler.types.ts
   Interfaces compartidas entre controller, service y frontend.
   ================================================================ */

/** Nodo genérico del AST */
export interface ASTNode {
  type:       string;
  value?:     any;
  op?:        string;
  dataType?:  string;
  returnType?: string;
  line?:      number;
  children?:  ASTNode[];
}

/** Error de compilación (léxico, sintáctico o semántico) */
export interface CompilerError {
  line:    number;
  col:     number;
  type:    'lexico' | 'sintactico' | 'semantico';
  message: string;
}

/** Entrada de la tabla de símbolos */
export interface SymbolEntry {
  name:     string;
  kind:     'variable' | 'funcion' | 'parametro' | 'struct';
  dataType: string;
  scope:    string;
  line:     number;
}

/** Request del frontend */
export interface CompileRequest {
  code: string;
}

/** Response que el backend devuelve al frontend */
export interface CompileResponse {
  success: boolean;
  output:  string[];          // líneas de consola (fmt.Println, etc.)
  errors:  CompilerError[];
  symbols: SymbolEntry[];
  ast:     ASTNode | null;
}
