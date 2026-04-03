import { Entorno } from './entorno';
import { ErrorInfo, SymbolInfo, ResultadoEjecucion } from './tipos';

export function interpretar(ast: any): ResultadoEjecucion {
  const output: string[] = [];
  const errors: ErrorInfo[] = [];
  const symbols: SymbolInfo[] = [];
  const funciones: Map<string, any> = new Map();
  const scope = '';

  const entorno = new Entorno(null); // entorno global

  try {
    ejecutarNodo(ast, entorno, output, errors, symbols);
  } catch (e: any) {
    errors.push({ type: 'runtime', message: e.message, line: 0, col: 0 });
  }
  return { output, errors, symbols };
}

function ejecutarNodo(nodo: any, entorno: Entorno, output: string[], errors: ErrorInfo[], symbols: SymbolInfo[], funciones: Map<string, any> = new Map(), scope: string = '' ) {
  switch (nodo.type) {
    case 'Programa':      return ejecutarPrograma(nodo, entorno, output, errors, symbols, funciones, scope);
    case 'MainFunc':      return ejecutarBloque(nodo.cuerpo, entorno, output, errors, symbols, funciones, scope);
    case 'FuncDecl':      break;
    case 'VarDecl':      return ejecutarVarDecl(nodo, entorno, output, errors, symbols, funciones, scope);
    case 'ShortVarDecl': return ejecutarShortVarDecl(nodo, entorno, output, errors, symbols, funciones, scope);
    case 'PrintlnCall':   return ejecutarPrintln(nodo, entorno, output, errors, symbols, funciones, scope);
    case 'BinaryExpr':    return evaluarBinaryExpr(nodo, entorno, output, errors, symbols, funciones, scope);
    case 'Assignment':    return ejecutarAssignment(nodo, entorno, symbols, funciones, scope);
    case 'Block':         return ejecutarBloque(nodo.cuerpo, new Entorno(entorno), output, errors, symbols, funciones, scope);
    case 'Identifier':    return entorno.get(nodo.nombre);
    case 'IntLiteral':    return nodo.valor;
    case 'StringLiteral': return nodo.valor;
    case 'BoolLiteral':   return nodo.valor;
    case 'FloatLiteral':  return nodo.valor;
    case 'RuneLiteral':   return nodo.valor;
    default:
      errors.push({
        type: 'runtime',
        message: `Nodo no implementado: ${nodo.type}`,
        line: nodo.ubicacion?.linea ?? 0,
        col:  nodo.ubicacion?.columna ?? 0,
      });
  }
}

// Stubs — implementar en el siguiente paso
function ejecutarPrograma(nodo: any, entorno: Entorno, output: string[], errors: ErrorInfo[], symbols: SymbolInfo[], funciones: Map<string, any>, scope: string) {
  for (const hijo of nodo.cuerpo) {
    ejecutarNodo(hijo, entorno, output, errors, symbols, funciones, scope);
  }
}

function ejecutarBloque(sentencias: any[], entorno: Entorno, output: string[], errors: ErrorInfo[], symbols: SymbolInfo[], funciones: Map<string, any>, scope: string) {
  for (const s of sentencias) {
    ejecutarNodo(s, entorno, output, errors, symbols, funciones, scope);
  }
}

function ejecutarVarDecl(nodo: any, entorno: Entorno, output: string[], errors: ErrorInfo[],symbols: SymbolInfo[], funciones: Map<string, any>, scope: string): void {
  try {
    const tipo  = nodo.tipo?.nombre ?? 'auto';
    // ← CLAVE: evaluar el nodo, no guardarlo directamente
    const valor = nodo.valor !== null
      ? ejecutarNodo(nodo.valor, entorno, output, errors, symbols, funciones, scope)
      : valorPorDefecto(tipo);

    entorno.declarar(nodo.nombre, valor);
    symbols.push({ nombre: nodo.nombre, tipo, valor, scope, linea: nodo.ubicacion?.linea ?? 0 });
  } catch (e: any) {
    errors.push({ type: 'semantico', message: e.message, line: nodo.ubicacion?.linea ?? 0, col: 0 });
  }
}

function ejecutarAssignment(nodo: any, entorno: Entorno, symbols: SymbolInfo[], funciones: Map<string, any>, scope: string) {
  const valor = ejecutarNodo(nodo.valor, entorno, [], [], symbols);
  entorno.set(nodo.nombre, valor);
  // Actualizar símbolo para reflejar nuevo valor (simplificado)
  const simbolo = symbols.find(s => s.nombre === nodo.nombre);
  if (simbolo) simbolo.valor = valor;
}

function ejecutarShortVarDecl(
  nodo: any, entorno: Entorno, output: string[], errors: ErrorInfo[],
  symbols: SymbolInfo[], funciones: Map<string, any>, scope: string,
): void {
  try {
    // ← CLAVE: evaluar el nodo
    const valor = ejecutarNodo(nodo.valor, entorno, output, errors, symbols, funciones, scope);
    const tipo  = inferirTipo(valor);

    entorno.declarar(nodo.nombre, valor);
    symbols.push({ nombre: nodo.nombre, tipo, valor, scope, linea: nodo.ubicacion?.linea ?? 0 });
  } catch (e: any) {
    errors.push({ type: 'semantico', message: e.message, line: nodo.ubicacion?.linea ?? 0, col: 0 });
  }
}

function ejecutarPrintln(nodo: any, entorno: Entorno, output: string[], errors: ErrorInfo[], symbols: SymbolInfo[], funciones: Map<string, any>, scope: string) {
  const valores = nodo.args.map((arg: any) => ejecutarNodo(arg, entorno, output, errors, symbols));
  output.push(valores.join(' '));
}

function evaluarBinaryExpr(nodo: any, entorno: Entorno, output: string[], errors: ErrorInfo[], symbols: SymbolInfo[], funciones: Map<string, any>, scope: string): any {
  const izq = ejecutarNodo(nodo.izquierda, entorno, output, errors, symbols);
  const der = ejecutarNodo(nodo.derecha,   entorno, output, errors, symbols);
  switch (nodo.operador) {
    case '+':  return izq + der;
    case '-':  return izq - der;
    case '*':  return izq * der;
    case '/':  return izq / der;
    case '%':  return izq % der;
    case '==': return izq === der;
    case '!=': return izq !== der;
    case '<':  return izq < der;
    case '<=': return izq <= der;
    case '>':  return izq > der;
    case '>=': return izq >= der;
    case '&&': return izq && der;
    case '||': return izq || der;
    default:
      errors.push({ type: 'runtime', message: `Operador no implementado: ${nodo.operador}`, line: nodo.ubicacion?.linea ?? 0, col: 0 });
  }
}
function resolverValor(val: any): any {
  if (val === null || val === undefined) return val;
  
  // Si ya es un primitivo, retornarlo directo
  if (typeof val !== 'object') return val;
  
  // Desenvuelve el valor según la forma de tus nodos
  if ('value' in val) return val.valor;
  
  return val;
}

function valorPorDefecto(tipo: string): any {
  switch (tipo) {
    case 'int':     return 0;
    case 'float64': return 0.0;
    case 'bool':    return false;
    case 'string':  return '';
    case 'rune':    return 0;
    default:        return null;
  }
}


function inferirTipo(valor: any): string {
  if (valor === null)             return 'nil';
  if (typeof valor === 'boolean') return 'bool';
  if (typeof valor === 'string')  return 'string';
  if (Number.isInteger(valor))    return 'int';
  if (typeof valor === 'number')  return 'float64';
  if (Array.isArray(valor))       return 'slice';
  return 'auto';
}