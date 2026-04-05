import { Injectable } from '@nestjs/common';
import { CompileRequest, CompileResponse } from './types/compiler.types';
import { interpretar } from './grammar/interpreter';

// Jison genera un .js plano — se importa con require
// eslint-disable-next-line @typescript-eslint/no-var-requires
const parser = require(require('path').join(__dirname, 'grammar', 'parser.js'));

@Injectable()
export class InterpreterService {

  compile(req: CompileRequest): CompileResponse {
    const { code } = req;
    //console.log('Compilando código:\n', code);

    // Validación básica
    if (!code || code.trim().length === 0) {
      return {
        success: false,
        output:  [],
        errors:  [{ line: 0, col: 0, type: 'lexico', message: 'El código no puede estar vacío.' }],
        symbols: [],
        ast:     null,
      };
    }

    // ── Parsear con Jison ───────────────────────────────────────
    const errors: CompileResponse['errors'] = [];

    // Capturar errores léxicos que vienen del console.error del lexer
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      const mensaje = args.join(' ');
      // Intentar extraer línea y columna del mensaje
      const match = mensaje.match(/línea (\d+), columna (\d+)/);
      errors.push({
        type:    'lexico',
        message: mensaje,
        line:    match ? parseInt(match[1]) : 0,
        col:     match ? parseInt(match[2]) : 0,
      });
    };

    let ast: any = null;

    try {
      ast = parser.parse(code);
    } catch (e: any) {
      // Errores sintácticos — Jison lanza una excepción con e.hash
      errors.push({
        type:    'sintactico',
        message: e.message ?? 'Error sintáctico desconocido',
        line:    e.hash?.loc?.first_line   ?? 0,
        col:     e.hash?.loc?.first_column ?? 0,
      });
    } finally {
      // Restaurar console.error siempre, incluso si hubo excepción
      console.error = originalConsoleError;
    }

    // Si hubo errores, devolver sin ejecutar el intérprete
    if (errors.length > 0) {
      return {
        success: false,
        output:  [],
        errors,
        symbols: [],
        ast:     null,
      };
    }

    // ── Intérprete ───────────────────────────────────────────────
    const { output, errors: erroresRuntime, symbols } = interpretar(ast);

    return {
      success: erroresRuntime.length === 0,
      output,
      errors:  erroresRuntime.map(e => ({ ...e, type: e.type as 'lexico' | 'sintactico' | 'semantico' })),
      symbols: symbols.map(s => ({ name: s.nombre, kind: 'variable' as const, dataType: s.tipo, scope: s.scope, line: s.linea })),
      ast,
    };
  }
}