import { Injectable } from '@nestjs/common';
import { CompileRequest, CompileResponse } from './types/compiler.types';
import { interpretar } from './grammar/interpreter';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const parser = require(require('path').join(__dirname, 'grammar', 'parser.js'));

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

    // ── Capturar errores de Jison vía console.error ANTES de parsear ──
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      // Jison imprime algo como: "Línea X: mensaje"
      // Lo capturamos pero no lo registramos aquí — el catch lo hará con más info
      // Solo logueamos en dev para no perder el trace
      originalConsoleError(...args);
    };

  try {
  // Inicializar el contenedor de errores léxicos en yy
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
        ast,
      };
    } catch (e: any) {
      // Errores inesperados en el intérprete (bugs internos)
      return {
        success: false,
        output:  [],
        errors:  [{ type: 'semantico', message: `Error interno del intérprete: ${e.message}`, line: 0, col: 0 }],
        symbols: [],
        ast,
      };
    }
  }

  private limpiarMensajeJison(msg: string): string {
    // Jison genera mensajes verbosos como:
    // "Parse error on line 3:\n...expecting X, Y, Z"
    // Extraemos solo la parte útil
    const match = msg.match(/Parse error on line \d+[^]*?(?=\n\n|$)/);
    return match ? match[0].replace(/\n/g, ' ').trim() : msg;
  }
}