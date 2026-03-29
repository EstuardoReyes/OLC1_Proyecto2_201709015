import { Injectable } from '@nestjs/common';
import { CompileRequest, CompileResponse } from './types/compiler.types';

/**
 * InterpreterService
 * Por ahora devuelve una respuesta stub con la forma correcta.
 * Cuando tengas la gramática Jison lista, aquí va el parser real.
 */
@Injectable()
export class InterpreterService {

  compile(req: CompileRequest): CompileResponse {
    const { code } = req;

    // ── Validación básica ───────────────────────────────────────
    if (!code || code.trim().length === 0) {
      return {
        success: false,
        output:  [],
        errors:  [{ line: 0, col: 0, type: 'lexico', message: 'El código no puede estar vacío.' }],
        symbols: [],
        ast:     null,
      };
    }

    // ── Stub: respuesta de prueba ───────────────────────────────
    // Reemplazar esto con el parser Jison cuando esté listo.
    // El frontend ya sabe manejar todos estos campos.
    return {
      success: true,
      output:  [`Código recibido: ${code.split('\n').length} líneas`, 'Parser pendiente de implementar'],
      errors:  [],
      symbols: [
        // Ejemplo de cómo se verá la tabla de símbolos real:
        // { name: 'x', kind: 'variable', dataType: 'int', scope: 'principal', line: 3 },
      ],
      ast: {
        type: 'Program',
        children: [
          { type: 'Info', value: 'AST pendiente — conecta el parser Jison aquí' }
        ],
      },
    };
  }
}
