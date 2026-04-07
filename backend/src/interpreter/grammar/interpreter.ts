import { Entorno } from './entorno';
import { ErrorInfo, SymbolInfo, ResultadoEjecucion } from './tipos';

export function interpretar(ast: any): ResultadoEjecucion {
  const output: string[] = [];
  const errors: ErrorInfo[] = [];
  const symbols: SymbolInfo[] = [];
  const funciones: Map<string, any> = new Map();
  const scope = '';

  const entorno = new Entorno(null, 'global'); // entorno global

  try {
    ejecutarNodo(ast, entorno, output, errors, symbols);
  } catch (e: any) {
    errors.push({ type: 'runtime', message: e.message, line: 0, col: 0 });
  }
  return { output, errors, symbols };
}

class BreakSignal {}
class ContinueSignal {}

function ejecutarNodo(nodo: any, entorno: Entorno, output: string[], errors: ErrorInfo[], symbols: SymbolInfo[], funciones: Map<string, any> = new Map(), scope: string = entorno.nombre ) {
  switch (nodo.type) {
    case 'Programa':      return ejecutarPrograma(nodo, entorno, output, errors, symbols, funciones, scope);
    case 'MainFunc':      return ejecutarBloque(nodo.cuerpo, entorno, output, errors, symbols, funciones, scope);
    case 'FuncDecl':      break;
    case 'VarDecl':      return ejecutarVarDecl(nodo, entorno, output, errors, symbols, funciones, scope);
    case 'ShortVarDecl': return ejecutarShortVarDecl(nodo, entorno, output, errors, symbols, funciones, scope);
    case 'PrintlnCall':   return ejecutarPrintln(nodo, entorno, output, errors, symbols, funciones, scope);
    case 'BinaryExpr':    return evaluarBinaryExpr(nodo, entorno, output, errors, symbols, funciones, scope);
    case 'Assignment':    return ejecutarAssignment(nodo, entorno, symbols, funciones, scope);
    case 'Block':         return ejecutarBloque(nodo.cuerpo, new Entorno(entorno, `block_${Date.now()}`), output, errors, symbols, funciones,  `block_${Date.now()}`);
    case 'CompoundAssign':return ejecutarCompoundAssign(nodo, entorno, symbols, funciones, scope);
    case 'UnaryExpr':     return evaluarUnaryExpr(nodo, entorno, output, errors, symbols, funciones, scope);
    case 'IfStmt':        return ejecutarIf(nodo, entorno, output, errors, symbols, funciones,  `if_${Date.now()}`);
    case 'cuerpo_else':   return ejecutarElse(nodo, entorno, output, errors, symbols, funciones, scope);
    case 'SwitchStmt':    return ejecutarSwitch(nodo, entorno, output, errors, symbols, funciones, scope);
    case 'ForWhile':      return ejecutarForWhile(nodo, entorno, output, errors, symbols, funciones, scope);
    case 'Increment':     return ejecutarIncrement(nodo, entorno, symbols, funciones, scope);
    case 'Decrement':     return ejecutarDecrement(nodo, entorno, symbols, funciones, scope);
    case 'ForClassic':    return ejecutarForClassic(nodo, entorno, output, errors, symbols, funciones, scope);
    case 'SliceLiteral':  return ejecutarSliceLiteral(nodo, entorno, output, errors, symbols, funciones, scope);
    case 'ForRange':      return ejecutarForRange(nodo, entorno, output, errors, symbols, funciones, scope);
    case 'BreakStmt':     throw new BreakSignal(); // manejar en el siguiente paso
    case 'ContinueStmt':  throw new ContinueSignal(); // manejar en el siguiente paso
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

    entorno.declarar(nodo.nombre, extraerValor(valor), extraerTipo(valor, nodo.tipo?.nombre));
    symbols.push({ nombre: nodo.nombre, tipo, valor, scope, linea: nodo.ubicacion?.linea ?? 0 });
  } catch (e: any) {
    errors.push({ type: 'semantico', message: e.message, line: nodo.ubicacion?.linea ?? 0, col: 0 });
  }
}

function ejecutarCompoundAssign(nodo: any, entorno: Entorno, symbols: SymbolInfo[], funciones: Map<string, any>, scope: string) {
  const variable = entorno.get(nodo.nombre);
  if (variable === undefined) {
    throw new Error(`Variable no declarada: ${nodo.nombre}`);
  }
  if (nodo.operador == '+=') {
      const valorActual = variable;
      const valorNuevo = valorActual + ejecutarNodo(nodo.valor, entorno, [], [], symbols, funciones, scope);
      entorno.set(nodo.nombre, valorNuevo); 
  }
  if (nodo.operador == '-=') {
      const valorActual = variable;
      const valorNuevo = valorActual - ejecutarNodo(nodo.valor, entorno, [], [], symbols, funciones, scope);
      entorno.set(nodo.nombre, valorNuevo); 
  }
}

function ejecutarIf(nodo: any, entorno: Entorno, output: string[], errors: ErrorInfo[], symbols: SymbolInfo[], funciones: Map<string, any>, scope: string) {
  const condicion = ejecutarNodo(nodo.condicion, entorno, output, errors, symbols, funciones, scope);
  if (condicion.valor) {
    ejecutarBloque(nodo.cuerpo, new Entorno(entorno, `if_then_${Date.now()}`), output, errors, symbols, funciones, scope);
  } else{
    if (nodo.cuerpo_else == null) {return;}
    else{
    ejecutarBloque(nodo.cuerpo_else, new Entorno(entorno, `if_else_${Date.now()}`), output, errors, symbols, funciones, scope);
    }
  }
}

function ejecutarElse(nodo: any, entorno: Entorno, output: string[], errors: ErrorInfo[], symbols: SymbolInfo[], funciones: Map<string, any>, scope: string){
  ejecutarBloque(nodo.cuerpo, new Entorno(entorno, `else_${Date.now()}`), output, errors, symbols, funciones, scope);
}

function ejecutarSwitch(nodo: any, entorno: Entorno, output: string[], errors: ErrorInfo[], symbols: SymbolInfo[], funciones: Map<string, any>, scope: string) {
  const valorSwitch = ejecutarNodo(nodo.discriminante, entorno, output, errors, symbols, funciones, scope);
  let casoEjecutado = false;
  let defaultCaso: any = null;
  for (const caso of nodo.casos) {
    if (caso.type === 'DefaultClause') {
      defaultCaso = caso;
      continue;
    }
    const valorCaso = ejecutarNodo(caso.condicion, entorno, output, errors, symbols, funciones, scope);
    if (valorCaso === valorSwitch) {
      ejecutarBloque(caso.cuerpo, new Entorno(entorno, `switch_case_${Date.now()}`), output, errors, symbols, funciones, scope);
      casoEjecutado = true;
      break;
    }
    else if (caso.type === 'DefaultClause' && !casoEjecutado) {
      ejecutarBloque(caso.cuerpo, new Entorno(entorno, `switch_default_${Date.now()}`), output, errors, symbols, funciones, scope);
    }
  }
    if (!casoEjecutado && defaultCaso) {
    ejecutarBloque(defaultCaso.cuerpo, new Entorno(entorno, `switch_default`), output, errors, symbols, funciones, scope);
  }

}


function ejecutarForWhile(nodo: any, entorno: Entorno, output: string[], errors: ErrorInfo[], symbols: SymbolInfo[], funciones: Map<string, any>, scope: string) {
  const entornoFor = new Entorno(entorno, 'for');
  
  while (true) {
    const condicion = extraerValor(ejecutarNodo(nodo.condicion, entornoFor, output, errors, symbols, funciones, scope));
    if (!condicion) break;
    try {
      ejecutarBloque(nodo.cuerpo, entornoFor, output, errors, symbols, funciones, scope);
    } catch (e) {
      if (e instanceof BreakSignal) break;
      if (e instanceof ContinueSignal) continue;
      throw e; // re-lanzar errores reales
    }
  }
}

function ejecutarIncrement(nodo: any, entorno: Entorno, symbols: SymbolInfo[], funciones: Map<string, any>, scope: string) {
  const actual = entorno.getSimbolo(nodo.nombre);
  const nuevoValor = Number(actual?.valor) + 1;
  entorno.set(nodo.nombre, nuevoValor);
}

function ejecutarDecrement(nodo: any, entorno: Entorno, symbols: SymbolInfo[], funciones: Map<string, any>, scope: string) {
  const actual = entorno.getSimbolo(nodo.nombre);
  const nuevoValor = Number(actual?.valor) - 1;
  entorno.set(nodo.nombre, nuevoValor);
}

function ejecutarForClassic(nodo: any, entorno: Entorno, output: string[], errors: ErrorInfo[], symbols: SymbolInfo[], funciones: Map<string, any>, scope: string) {
  const entornoFor = new Entorno(entorno, 'for_classic');
  ejecutarNodo(nodo.inicializacion, entornoFor, output, errors, symbols, funciones, scope);

  while (true) {
    const condicion = extraerValor(ejecutarNodo(nodo.condicion, entornoFor, output, errors, symbols, funciones, scope));
    if (!condicion) break;

    let doContinue = false;
    try {
      ejecutarBloque(nodo.cuerpo, entornoFor, output, errors, symbols, funciones, scope);
    } catch (e) {
      if (e instanceof BreakSignal) break;
      if (e instanceof ContinueSignal) { doContinue = true; }
      else throw e;
    }

    // La actualización SIEMPRE corre, ya sea continue normal o por ContinueSignal
    ejecutarNodo(nodo.actualizacion, entornoFor, output, errors, symbols, funciones, scope);

    if (doContinue) continue;
  }
}

function ejecutarSliceLiteral(nodo: any, entorno: Entorno, output: string[], errors: ErrorInfo[], symbols: SymbolInfo[], funciones: Map<string, any>, scope: string) {
  const elementos = nodo.valores.map((e: any) => extraerValor(ejecutarNodo(e, entorno, output, errors, symbols, funciones, scope)));
  return elementos;
}

function ejecutarForRange(nodo: any, entorno: Entorno, output: string[], errors: ErrorInfo[], symbols: SymbolInfo[], funciones: Map<string, any>, scope: string) {
  const iterable = extraerValor(ejecutarNodo(nodo.iterable, entorno, output, errors, symbols, funciones, scope));
  if (!Array.isArray(iterable)) {
    errors.push({
      type: 'runtime',
      message: 'El valor en un for range debe ser un slice',
      line: nodo.ubicacion?.linea ?? 0,
      col: 0,
    });
    return;
  }

  for (let indice = 0; indice < iterable.length; indice++) {
    const valor = iterable[indice];
    const entornoRange = new Entorno(entorno, `for_range_${indice}`);
    if (nodo.indice && nodo.indice !== '_') {
      entornoRange.declarar(nodo.indice, indice, 'int');
    }
    if (nodo.valor && nodo.valor !== '_') {
      entornoRange.declarar(nodo.valor, valor, inferirTipo(valor));
    }
    try {
      ejecutarBloque(nodo.cuerpo, entornoRange, output, errors, symbols, funciones, scope);
    } catch (e) {
      if (e instanceof BreakSignal)    break;
      if (e instanceof ContinueSignal) continue;
      throw e;
    }
  }
}


function evaluarUnaryExpr(nodo: any, entorno: Entorno, output: string[], errors: ErrorInfo[], symbols: SymbolInfo[], funciones: Map<string, any>, scope: string) {
  const resultado = resolverConTipo(nodo.operando, entorno, output, errors, symbols, funciones, scope);
  if (nodo.operador === '-') {
    return { valor: -Number(resultado.valor), tipo: resultado.tipo };
  }
  if (nodo.operador === '!') {
    return { valor: !resultado.valor, tipo: 'bool' };
  }
  return resultado;
}



function ejecutarAssignment(nodo: any, entorno: Entorno, symbols: SymbolInfo[], funciones: Map<string, any>, scope: string) {
  const valor = ejecutarNodo(nodo.valor, entorno, [], [], symbols);
  entorno.set(nodo.nombre, extraerValor(valor));
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

    entorno.declarar(nodo.nombre, extraerValor(valor), extraerTipo(valor, nodo.tipo?.nombre));
    symbols.push({ nombre: nodo.nombre, tipo, valor, scope, linea: nodo.ubicacion?.linea ?? 0 });
  } catch (e: any) {
    errors.push({ type: 'semantico', message: e.message, line: nodo.ubicacion?.linea ?? 0, col: 0 });
  }
}

function ejecutarPrintln(nodo: any, entorno: Entorno, output: string[], errors: ErrorInfo[], symbols: SymbolInfo[], funciones: Map<string, any>, scope: string) {
  const valores = nodo.args.map((arg: any) => formatearArgPrint(arg, entorno, output, errors, symbols, funciones, scope));
  output.push(valores.join(''));
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


function formatearArgPrint(arg: any, entorno: Entorno, output: string[], errors: ErrorInfo[], symbols: SymbolInfo[], funciones: Map<string, any>, scope: string): string {
  if (arg.type === 'Identifier') {
    const simbolo = entorno.getSimbolo(arg.nombre); // el objeto completo, no solo el valor
    if (simbolo?.tipo === 'float64' && Number.isInteger(Number(simbolo.valor))) {
      return Number(simbolo.valor).toFixed(1);
    }
    return String(simbolo?.valor ?? '');
  }
  // Para todo lo demás (literales, expresiones binarias, etc.) ejecuta normal
  const resultado = ejecutarNodo(arg, entorno, output, errors, symbols, funciones, scope);
  if (resultado && typeof resultado === 'object' && 'tipo' in resultado) {
    return formatearValor(resultado.valor, resultado.tipo);
  }
  return String(resultado);
}

function valorRune(v: any): number {
  if (typeof v === 'string' && v.length === 1) return v.charCodeAt(0);
  return Number(v);
}


function resolverConTipo(nodo: any, entorno: Entorno, output: string[], errors: ErrorInfo[], symbols: SymbolInfo[], funciones: Map<string, any>, scope: string): { valor: any; tipo: string } {
  if (nodo.type === 'Identifier') {
    const s = entorno.getSimbolo(nodo.nombre);
    return { valor: s?.valor, tipo: s?.tipo ?? 'int' };
  }
  if (nodo.type === 'IntLiteral')    return { valor: nodo.valor, tipo: 'int' };
  if (nodo.type === 'FloatLiteral')  return { valor: nodo.valor, tipo: 'float64' };
  if (nodo.type === 'StringLiteral') return { valor: nodo.valor, tipo: 'string' };
  if (nodo.type === 'BoolLiteral')   return { valor: nodo.valor, tipo: 'bool' };
  if (nodo.type === 'RuneLiteral')   return { valor: nodo.valor, tipo: 'rune' };
  if (nodo.type === 'UnaryExpr') {
  const resultado = resolverConTipo(nodo.operando, entorno, output, errors, symbols, funciones, scope);
  if (nodo.operador === '-') {
    return { valor: -Number(resultado.valor), tipo: resultado.tipo };
  }
  return resultado;
}
  // Para expresiones compuestas (BinaryExpr anidado, etc.)
  const val = ejecutarNodo(nodo, entorno, output, errors, symbols, funciones, scope);
  // Si ya viene con tipo (cuando BinaryExpr devuelva {valor, tipo})
  if (val && typeof val === 'object' && 'tipo' in val) return val;
  return { valor: val, tipo: typeof val === 'number' ? 'int' : typeof val };
}
// Helper universal — ponlo cerca de ejecutarNodo
function extraerValor(resultado: any): any {
  if (resultado && typeof resultado === 'object' && 'tipo' in resultado) {
    return resultado.valor;
  }
  return resultado;
}

function extraerTipo(resultado: any, tipoDeclarado?: string): string {
  if (tipoDeclarado) return tipoDeclarado; // declaración explícita gana siempre
  if (resultado && typeof resultado === 'object' && 'tipo' in resultado) {
    return resultado.tipo;
  }
  return 'int';
}
function runeANum(v: any): number {
  if (typeof v === 'string') return v.charCodeAt(0);
  return Number(v);
}

function evaluarBinaryExpr(nodo: any, entorno: Entorno, output: string[], errors: ErrorInfo[], symbols: SymbolInfo[], funciones: Map<string, any>, scope: string): any {
  const izqR = resolverConTipo(nodo.izquierda, entorno, output, errors, symbols, funciones, scope);
  const derR = resolverConTipo(nodo.derecha,   entorno, output, errors, symbols, funciones, scope);

  let { valor: izq, tipo: ti } = izqR;
  let { valor: der, tipo: td } = derR;

  switch (nodo.operador) {
    case '+': return operarSuma(izq, ti, der, td);
    case '-': return operarResta(izq, ti, der, td);
    case '*': return operarMulti(izq, ti, der, td);
    case '/': return operarDiv(izq, ti, der, td);
    case '%': return { valor: Number(izq) % Number(der), tipo: 'int' };

    // Relacionales → siempre bool
    case '==': return { valor: izq === der, tipo: 'bool' };
    case '!=': return { valor: izq !== der, tipo: 'bool' };
    case '<':  return { valor: izq <   der, tipo: 'bool' };
    case '<=': return { valor: izq <=  der, tipo: 'bool' };
    case '>':  return { valor: izq >   der, tipo: 'bool' };
    case '>=': return { valor: izq >=  der, tipo: 'bool' };
    case '&&': return { valor: izq && der,  tipo: 'bool' };
    case '||': return { valor: izq || der,  tipo: 'bool' };

    default:
      errors.push({ type: 'runtime', message: `Operador no implementado: ${nodo.operador}`, line: nodo.ubicacion?.linea ?? 0, col: 0 });
  }
}

function operarSuma(izq: any, ti: string, der: any, td: string): { valor: any; tipo: string } {
  // String en cualquier lado → concatenación
  if (ti === 'string' || td === 'string') {
    const si = ti === 'rune' ? String.fromCharCode(runeANum(izq)) : String(izq);
    const sd = td === 'rune' ? String.fromCharCode(runeANum(der)) : String(der);
    return { valor: si + sd, tipo: 'string' };
  }
  if (ti === 'bool' && td === 'bool') return { valor: izq || der, tipo: 'bool' };
  if (ti === 'float64' || td === 'float64') {
    return { valor: Number(ti === 'rune' ? runeANum(izq) : izq) + Number(td === 'rune' ? runeANum(der) : der), tipo: 'float64' };
  }
  return { valor: runeANum(izq) + runeANum(der), tipo: 'int' };
}

function operarResta(izq: any, ti: string, der: any, td: string): { valor: any; tipo: string } {
  if (ti === 'float64' || td === 'float64') {
    return { valor: runeANum(izq) - runeANum(der), tipo: 'float64' };
  }
  return { valor: runeANum(izq) - runeANum(der), tipo: 'int' };
}

function operarMulti(izq: any, ti: string, der: any, td: string): { valor: any; tipo: string } {
  // int * string o string * int → repetición
  if (ti === 'int' && td === 'string') return { valor: String(der).repeat(Number(izq)), tipo: 'string' };
  if (ti === 'string' && td === 'int') return { valor: String(izq).repeat(Number(der)), tipo: 'string' };
  // bool * bool → bool (AND)
  if (ti === 'bool' && td === 'bool') return { valor: izq && der, tipo: 'bool' };
  // float64 en cualquier lado → float64
  if (ti === 'float64' || td === 'float64') {
    return { valor: runeANum(izq) * runeANum(der), tipo: 'float64' };
  }
  return { valor: runeANum(izq) * runeANum(der), tipo: 'int' };
}

function operarDiv(izq: any, ti: string, der: any, td: string): { valor: any; tipo: string } {
  // int / int → truncamiento
  if (ti === 'int' && td === 'int') {
    return { valor: Math.trunc(Number(izq) / Number(der)), tipo: 'int' };
  }
  return { valor: runeANum(izq) / runeANum(der), tipo: 'float64' };
}

function formatearValor(valor: any, tipo: string): string {
  if (tipo === 'float64' && Number.isInteger(Number(valor))) {
    return Number(valor).toFixed(1);
  }
  return String(valor);
}