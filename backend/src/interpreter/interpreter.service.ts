import { Injectable } from '@nestjs/common';
import { CompileRequest, CompileResponse } from './types/compiler.types';
import { interpretar } from './grammar/interpreter';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const parser = require(require('path').join(__dirname, 'grammar', 'parser.js'));
(parser as any).parseError = function (msg: any, hash: any) {
    console.log("---- ERROR SINTACTICO ----");
    console.log(msg);
    console.log("Token:", hash.token);
    console.log("Texto:", hash.text);
    console.log("Linea:", hash.loc?.first_line);
    console.log("Columna:", hash.loc?.first_column);
};
@Injectable()
export class InterpreterService {

  compile(req: CompileRequest): CompileResponse {
    const { code } = req;

    if (!code || code.trim().length === 0) {
      return {
        success: false,
        output:  [],
        errors:  [{ line: 0, col: 0, type: 'lexico', message: 'El código no puede estar vacío.' }],
        symbols: [],
        ast:     null,
      };
    }

    const errors: CompileResponse['errors'] = [];
    let ast: any = null;

    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      originalConsoleError(...args);
    };

  try {
  parser.yy = {
    errors: [],
    parseError: (msg: string, hash: any) => {
      errors.push({
        type:    'sintactico',
        message: this.limpiarMensajeJison(msg),
        line:    hash?.loc?.first_line   ?? 0,
        col:     hash?.loc?.first_column ?? 0,
      });
    }
  };

  ast = parser.parse(code);

  // Recoger errores léxicos acumulados durante el tokenizado
  if (parser.yy.lexErrors?.length > 0) {
    errors.push(...parser.yy.lexErrors);
  }

} catch (e: any) {
  errors.push({
    type:    'sintactico',
    message: this.limpiarMensajeJison(e.message ?? 'Error sintáctico'),
    line:    e.hash?.loc?.first_line   ?? 0,
    col:     e.hash?.loc?.first_column ?? 0,
  });
} finally {
  console.error = originalConsoleError;
}

    if (errors.length > 0) {
      return { success: false, output: [], errors, symbols: [], ast: null };
    }

    // ── Generar DOT del AST (siempre que el parse fue exitoso) ──
    const astDot = ast ? this.generateASTDot(ast) : null;

    // ── Intérprete ───────────────────────────────────────────────
    try {
      const { output, errors: erroresRuntime, symbols } = interpretar(ast);
      return {
        success: erroresRuntime.length === 0,
        output,
        errors:  erroresRuntime.map(e => ({
          ...e,
          type: e.type as 'lexico' | 'sintactico' | 'semantico',
        })),
        symbols: symbols.map(s => ({
          name:     s.nombre,
          kind:     'variable' as const,
          dataType: s.tipo,
          scope:    s.scope,
          line:     s.linea,
        })),
        ast: astDot,
      };
    } catch (e: any) {
      // Errores inesperados en el intérprete (bugs internos)
      return {
        success: false,
        output:  [],
        errors:  [{ type: 'semantico', message: `Error interno del intérprete: ${e.message}`, line: 0, col: 0 }],
        symbols: [],
        ast: astDot,
      };
    }
  }

  generateASTDot(ast: any): string {
    let nodeId = 0;
    const lines: string[] = ['digraph AST {'];
    lines.push('  node [shape=box, style=filled, fillcolor=lightblue];');

    const addNode = (nodo: any): number => {
      const currentId = nodeId++;
      const label = this.getNodeLabel(nodo);
      lines.push(`  node${currentId} [label="${label}"];`);

      // Agregar hijos según el tipo de nodo
      const children = this.getChildren(nodo);
      children.forEach(child => {
        if (child) {
          const childId = addNode(child);
          lines.push(`  node${currentId} -> node${childId};`);
        }
      });

      return currentId;
    };

    addNode(ast);
    lines.push('}');
    return lines.join('\n');
  }

private getNodeLabel(nodo: any): string {
  if (!nodo || typeof nodo !== 'object') return String(nodo);
  if (nodo.type === 'IntLiteral') return `Int: ${nodo.valor}`;
  if (nodo.type === 'StringLiteral') return `String: ${nodo.valor}`;
  if (nodo.type === 'Identifier') return `ID: ${nodo.nombre}`;
  if (nodo.type === 'BinaryExpr') return `Op: ${nodo.operador}`;
  return nodo.type || 'Node';
}

private getChildren(nodo: any): any[] {
  if (!nodo || typeof nodo !== 'object') return [];
  const children: any[] = [];
  
  // Campos comunes
  if (nodo.izquierda) children.push(nodo.izquierda);
  if (nodo.derecha) children.push(nodo.derecha);
  if (nodo.cuerpo) children.push(...(Array.isArray(nodo.cuerpo) ? nodo.cuerpo : [nodo.cuerpo]));
  if (nodo.condicion) children.push(nodo.condicion);
  if (nodo.valor) children.push(nodo.valor);
  if (nodo.args) children.push(...nodo.args);
  
  return children;
}

  private limpiarMensajeJison(msg: string): string {
    const match = msg.match(/Parse error on line \d+[^]*?(?=\n\n|$)/);
    return match ? match[0].replace(/\n/g, ' ').trim() : msg;
  }



}