
import { Entorno } from './entorno';
import { ErrorInfo, SymbolInfo, ResultadoEjecucion } from './tipos';

interface ContextoEjecucion {
  entorno: Entorno;
  output: string[];
  errors: ErrorInfo[];
  symbols: SymbolInfo[];
  funciones: Map<string, any>;
  structs: Map<string, any>;
  scope: string;
}

export function interpretar(ast: any): ResultadoEjecucion {
  const output: string[] = [];
  const errors: ErrorInfo[] = [];
  const symbols: SymbolInfo[] = [];
  const entorno = new Entorno(null, 'global'); // entorno global
  const funciones: Map<string, any> = new Map();
  const structs: Map<string, any> = new Map();
  const contexto: ContextoEjecucion = { entorno, output, errors, symbols, funciones, structs, scope: entorno.nombre };

  try {
    ejecutarNodo(ast, contexto);
  } catch (e: any) {
    errors.push({ type: 'runtime', message: e.message, line: 0, col: 0 });
  }
  return { output, errors, symbols };
}

class BreakSignal { readonly name = 'BreakSignal'; }
class ContinueSignal { readonly name = 'ContinueSignal'; }
class ReturnSignal { constructor(public valor: any) {} readonly name = 'ReturnSignal';}

const nodeHandlers: Record<string, (nodo: any, contexto: ContextoEjecucion) => any> = {
  Programa:        (nodo, ctx) => ejecutarPrograma(nodo, ctx),
  MainFunc:        (nodo, ctx) => ejecutarBloque(nodo.cuerpo, { ...ctx, scope: ctx.entorno.nombre }),
  FuncDecl:        (nodo, ctx) => ejecutarFuncDecl(nodo, ctx),
  StructDecl:      (nodo, ctx) => ejecutarStructDecl(nodo, ctx),
  VarDecl:         (nodo, ctx) => ejecutarVarDecl(nodo, ctx),
  ShortVarDecl:    (nodo, ctx) => ejecutarShortVarDecl(nodo, ctx),
  PrintlnCall:     (nodo, ctx) => ejecutarPrintln(nodo, ctx),
  BinaryExpr:      (nodo, ctx) => evaluarBinaryExpr(nodo, ctx),
  Assignment:      (nodo, ctx) => ejecutarAssignment(nodo, ctx),
  Block:           (nodo, ctx) => {
    const blockScope = `block_${Date.now()}`;
    return ejecutarBloque(nodo.cuerpo, { ...ctx, entorno: new Entorno(ctx.entorno, blockScope), scope: blockScope });
  },
  CompoundAssign:  (nodo, ctx) => ejecutarCompoundAssign(nodo, ctx),
  UnaryExpr:       (nodo, ctx) => evaluarUnaryExpr(nodo, ctx),
  IfStmt:          (nodo, ctx) => ejecutarIf(nodo, { ...ctx, scope: `if_${Date.now()}` }),
  cuerpo_else:     (nodo, ctx) => ejecutarElse(nodo, ctx),
  SwitchStmt:      (nodo, ctx) => ejecutarSwitch(nodo, ctx),
  ForWhile:        (nodo, ctx) => ejecutarForWhile(nodo, ctx),
  Increment:       (nodo, ctx) => ejecutarIncrement(nodo, ctx),
  Decrement:       (nodo, ctx) => ejecutarDecrement(nodo, ctx),
  ForClassic:      (nodo, ctx) => ejecutarForClassic(nodo, ctx),
  SliceLiteral:    (nodo, ctx) => ejecutarSliceLiteral(nodo, ctx),
  ForRange:        (nodo, ctx) => ejecutarForRange(nodo, ctx),
  SliceAccess:     (nodo, ctx) => ejecutarSliceAccess(nodo, ctx),
  SliceAssign:     (nodo, ctx) => ejecutarSliceAssign(nodo, ctx),
  LenCall:         (nodo, ctx) => ejecutarLenCall(nodo, ctx),
  AppendAssign:    (nodo, ctx) => ejecutarAppendAssign(nodo, ctx),
  SlicesIndexCall:  (nodo, ctx) => ejecutarSlicesIndexCall(nodo, ctx),
  StringsJoinCall:  (nodo, ctx) => ejecutarStringsJoinCall(nodo, ctx),
  MatrixLiteral:   (nodo, ctx) => ejecutarMatrixLiteral(nodo, ctx),
  MatrixAccess:    (nodo, ctx) => ejecutarMatrixAccess(nodo, ctx),
  MatrixAssign:    (nodo, ctx) => ejecutarMatrixAssign(nodo, ctx),
  StructVarDecl:   (nodo, ctx) => ejecutarStructVarDecl(nodo, ctx),
  StructLiteral:   (nodo, ctx) => ejecutarStructLiteral(nodo, ctx),
  AttrAccess:      (nodo, ctx) => ejecutarAttrAccess(nodo, ctx),
  AttrAssign:      (nodo, ctx) => ejecutarAttrAssign(nodo, ctx),
  FuncCall:         (nodo, ctx) => ejecutarFuncCall(nodo, ctx),
  FuncCallExpr:     (nodo, ctx) => ejecutarFuncCallExpr(nodo, ctx),
  ReturnStmt:       (nodo, ctx) => ejecutarReturnStmt(nodo, ctx),
  AppendCall:        (nodo, ctx) => ejecutarAppendCall(nodo, ctx),  
  TypeOfCall:       (nodo, ctx) => ejecutarTypeOfCall(nodo, ctx),
  AtoiCall:          (nodo, ctx) => ejecutarAtoiCall(nodo, ctx),
  ParseFloatCall:    (nodo, ctx) => ejecutarParseFloatCall(nodo, ctx),
  BreakStmt:       ()          => { throw new BreakSignal(); },
  ContinueStmt:    ()          => { throw new ContinueSignal(); },
  Identifier:      (nodo, ctx) => ctx.entorno.get(nodo.nombre),
  IntLiteral:      (nodo)      => nodo.valor,
  StringLiteral:   (nodo)      => nodo.valor,
  BoolLiteral:     (nodo)      => nodo.valor,
  FloatLiteral:    (nodo)      => nodo.valor,
  RuneLiteral:     (nodo)      => nodo.valor,
};

function ejecutarNodo(nodo: any, contexto: ContextoEjecucion): any {
  const handler = nodeHandlers[nodo.type];
  if (handler) {
    return handler(nodo, contexto);
  }
  contexto.errors.push({
    type: 'runtime',
    message: `Nodo no implementado: ${nodo.type}`,
    line: nodo.ubicacion.linea ?? 0,
    col:  nodo.ubicacion.columna ?? 0,
  });
}

// ─── Programa & Bloque ────────────────────────────────────────────────

function ejecutarPrograma(nodo: any, contexto: ContextoEjecucion) {
  for (const hijo of nodo.cuerpo) {
    ejecutarNodo(hijo, contexto);
  }
}

function ejecutarBloque(sentencias: any[], contexto: ContextoEjecucion) {
  for (const s of sentencias) {
    ejecutarNodo(s, contexto);
  }
}

// ─── Funciones ────────────────────────────────────────────────────────
function ejecutarFuncDecl(nodo: any, contexto: ContextoEjecucion) {
  const { funciones } = contexto;
    funciones.set(nodo.nombre, {
    parametros: nodo.parametros,
    tipo_retorno: nodo.tipo_retorno,
    cuerpo: nodo.cuerpo,
    ubicacion: nodo.ubicacion
  });
  return undefined;
}

function ejecutarFuncCall(nodo: any, contexto: ContextoEjecucion): any {
  const { funciones, errors } = contexto;
  const func = funciones.get(nodo.nombre);
  if (!func) {
    errors.push({
      type: 'runtime',
      message: `Función no declarada: ${nodo.nombre}`,
      line: nodo.ubicacion.linea ?? 0,
      col: 0,
    });
    return;
  }
  if (nodo.args.length !== func.parametros.length) {
    errors.push({
      type: 'runtime',
      message: `Número de argumentos incorrecto para función '${nodo.nombre}' (esperado ${func.parametros.length}, got ${nodo.args.length})`,
      line: nodo.ubicacion.linea ?? 0,
      col: 0,
    });
    return;
  }
  const entornoFunc = new Entorno(contexto.entorno, `func_${nodo.nombre}_${Date.now()}`);
  const contextoFunc: ContextoEjecucion = { ...contexto, entorno: entornoFunc, scope: entornoFunc.nombre };
  for (let i = 0; i < nodo.args.length; i++) {
    const argValor = ejecutarNodo(nodo.args[i], contexto);
    const paramTipo = func.parametros[i].tipo;
    entornoFunc.declarar(func.parametros[i].nombre, extraerValor(argValor), extraerTipo(argValor, paramTipo));
  }
  try {
    ejecutarBloque(func.cuerpo, contextoFunc);
    return undefined; // función void sin return explícito
  } catch (e: any) {
    if (e instanceof ReturnSignal) { 
      return { valor: e.valor, tipo: func.tipo_retorno };
    }
    if (e instanceof BreakSignal || e instanceof ContinueSignal) {
      errors.push({
        type: 'runtime',
        message: `No se puede usar '${e instanceof BreakSignal ? 'break' : 'continue'}' fuera de un loop`,
        line: nodo.ubicacion.linea ?? 0,
        col: 0,
      });
      return;
    }
    throw e; // re-lanzar errores reales
  }
}

function ejecutarFuncCallExpr(nodo: any, contexto: ContextoEjecucion): any {
  return ejecutarFuncCall(nodo, contexto);
}

function ejecutarReturnStmt(nodo: any, contexto: ContextoEjecucion): any {
  const valorRetorno = nodo.valor 
    ? extraerValor(ejecutarNodo(nodo.valor, contexto)) 
    : undefined;
  throw new ReturnSignal(valorRetorno);
}

function ejecutarAppendCall(nodo: any, contexto: ContextoEjecucion): any {
  const { entorno, errors } = contexto;
  let slice = entorno.get(nodo.slice);
  const sliceTipo = entorno.getTipo(nodo.slice);
  
  console.log('slice:', slice, 'tipo:', sliceTipo);
  
  const nuevoValor = extraerValor(ejecutarNodo(nodo.valor, contexto));
  
  if (!Array.isArray(slice)) {
    // Verificar si el tipo AST es TipoSlice
    if (sliceTipo?.type === 'TipoSlice') {
      slice = [];
      entorno.set(nodo.slice, slice);
    } else {
      errors.push({
        type: 'runtime',
        message: 'El objetivo de append debe ser un slice',
        line: nodo.ubicacion?.linea ?? 0,
        col: 0,
      });
      return;
    }
  }
  
  slice.push(nuevoValor);
  return slice;
}

function ejecutarTypeOfCall(nodo: any, contexto: ContextoEjecucion): any {
  const valor = extraerValor(ejecutarNodo(nodo.arg, contexto));
  return typeof valor;
}

function ejecutarAtoiCall(nodo: any, contexto: ContextoEjecucion): any {
  const valor = extraerValor(ejecutarNodo(nodo.arg, contexto));
  const resultado = parseInt(valor, 10);
  if (isNaN(resultado)) {
    contexto.errors.push({
      type: 'runtime',
      message: `No se pudo convertir '${valor}' a entero`,
      line: nodo.ubicacion?.linea ?? 0,
      col: 0,
    });
    return 0; // o podrías lanzar un error, dependiendo de cómo quieras manejar esto
  }
  return resultado;
}

function ejecutarParseFloatCall(nodo: any, contexto: ContextoEjecucion): any {
  const valor = extraerValor(ejecutarNodo(nodo.arg, contexto));
  const resultado = parseFloat(valor);
  if (isNaN(resultado)) {
    contexto.errors.push({
      type: 'runtime',
      message: `No se pudo convertir '${valor}' a float`,
      line: nodo.ubicacion?.linea ?? 0,
      col: 0,
    });
    return 0.0; // o podrías lanzar un error, dependiendo de cómo quieras manejar esto
  }
  return resultado;
}

// ─── Structs ──────────────────────────────────────────────────────────

function ejecutarStructVarDecl(nodo: any, contexto: ContextoEjecucion): any {
  const { entorno } = contexto;
  const campos: Record<string, any> = {};
  for (const field of nodo.valor.campos) {
    campos[field.campo] = extraerValor(
      ejecutarNodo(field.valor, contexto)
    );
  }
   entorno.declarar(nodo.nombre, campos, nodo.tipoStruct);
  return undefined;  
}

function ejecutarStructDecl(nodo: any, contexto: ContextoEjecucion): any {
  contexto.structs.set(nodo.nombre, { valor: null, tipo: 'struct', campos: nodo.campos });
  return undefined;  
}

function ejecutarAttrAccess(nodo: any, contexto: ContextoEjecucion): any {
  const { entorno, errors } = contexto;
  
  let objeto;
  if (typeof nodo.objeto === 'string') {
    objeto = extraerValor(entorno.get(nodo.objeto));
  } else {
    objeto = extraerValor(ejecutarNodo(nodo.objeto, contexto));
  }
  
  if (!objeto || typeof objeto !== 'object') {
    errors.push({
      type: 'runtime',
      message: `No se puede acceder al atributo '${nodo.atributo}' de un valor no-objeto`,
      line: nodo.ubicacion?.linea ?? 0,
      col: 0
    });
    return undefined;
  }
  
  return { valor: objeto[nodo.atributo], tipo: typeof objeto[nodo.atributo] };
}

function ejecutarAttrAssign(nodo: any, contexto: ContextoEjecucion): any {
  const { entorno, errors } = contexto;
  // Resolver el acceso encadenado hasta el penúltimo nivel
  let objetoContenedor;
  if (typeof nodo.target.objeto === 'string') {
    // Caso base: alice.edad = 26
    objetoContenedor = extraerValor(entorno.get(nodo.target.objeto));
  } else {
    // Caso recursivo: alice.direccion.ciudad = "Antigua"
    // nodo.target.objeto es AttrAccess(alice.direccion)
    objetoContenedor = extraerValor(ejecutarNodo(nodo.target.objeto, contexto));
  }
  
  if (!objetoContenedor || typeof objetoContenedor !== 'object') {
    errors.push({
      type: 'runtime',
      message: `No se puede asignar al atributo '${nodo.target.atributo}' de un valor no-objeto`,
      line: nodo.ubicacion?.linea ?? 0,
      col: 0
    });
    return undefined;
  }
  
  const nuevoValor = extraerValor(ejecutarNodo(nodo.valor, contexto));
  objetoContenedor[nodo.target.atributo] = nuevoValor;
  
  return undefined;
}
// ─── Variables ────────────────────────────────────────────────────────

function ejecutarVarDecl(nodo: any, contexto: ContextoEjecucion): void {
  const { entorno, errors, symbols, scope } = contexto;
  try {
    const tipo  = nodo.tipo?.nombre ?? 'auto';
    // Evaluar el nodo, no guardarlo directamente
    const valor = nodo.valor === null
      ? valorPorDefecto(tipo)
      : ejecutarNodo(nodo.valor, contexto);
    entorno.declarar(nodo.nombre, extraerValor(valor), extraerTipo(valor, nodo.tipo?.type));
    symbols.push({ nombre: nodo.nombre, tipo, valor, scope, linea: nodo.ubicacion.linea ?? 0 });
  } catch (e: any) {
    errors.push({ type: 'semantico', message: e.message, line: nodo.ubicacion.linea ?? 0, col: 0 });
  }
}

function ejecutarShortVarDecl(nodo: any, contexto: ContextoEjecucion): void {
  const { entorno, errors, symbols, scope } = contexto;
  try {
    const valor = ejecutarNodo(nodo.valor, contexto);
    const tipo  = inferirTipo(valor);
    entorno.declarar(nodo.nombre, extraerValor(valor), extraerTipo(valor, nodo.tipo?.nombre));
    symbols.push({ nombre: nodo.nombre, tipo, valor, scope, linea: nodo.ubicacion?.linea ?? 0 });
  } catch (e: any) {
    errors.push({ type: 'semantico', message: e.message, line: nodo.ubicacion.linea ?? 0, col: 0 });
  }
}

function ejecutarStructLiteral(nodo: any, contexto: ContextoEjecucion): any {
  const campos: Record<string, any> = {};
  for (const field of nodo.campos) {
    campos[field.campo] = extraerValor(
      ejecutarNodo(field.valor, contexto)
    );
  }
  return campos;  // solo retorna el objeto plano
}
// ─── Asignaciones ─────────────────────────────────────────────────────

function ejecutarAssignment(nodo: any, contexto: ContextoEjecucion) {
  const { entorno, symbols } = contexto;
  const valor = ejecutarNodo(nodo.valor, contexto);
  entorno.set(nodo.nombre, extraerValor(valor));
  // Actualizar símbolo para reflejar nuevo valor (simplificado)
  const simbolo = symbols.find(s => s.nombre === nodo.nombre);
  if (simbolo) simbolo.valor = valor;
}

function ejecutarCompoundAssign(nodo: any, contexto: ContextoEjecucion) {
  const { entorno } = contexto;
  const variable = entorno.get(nodo.nombre);
  if (variable === undefined) {
    throw new Error(`Variable no declarada: ${nodo.nombre}`);
  }
  if (nodo.operador == '+=') {
    const valorNuevo = variable + extraerValor(ejecutarNodo(nodo.valor, contexto));
    entorno.set(nodo.nombre, valorNuevo);
  }
  if (nodo.operador == '-=') {
    const valorNuevo = variable - extraerValor(ejecutarNodo(nodo.valor, contexto));
    entorno.set(nodo.nombre, valorNuevo);
  }
}

function ejecutarIncrement(nodo: any, contexto: ContextoEjecucion) {
  const { entorno } = contexto;
  const actual = entorno.getSimbolo(nodo.nombre);
  const nuevoValor = Number(actual?.valor) + 1;
  entorno.set(nodo.nombre, nuevoValor);
}

function ejecutarDecrement(nodo: any, contexto: ContextoEjecucion) {
  const { entorno } = contexto;
  const actual = entorno.getSimbolo(nodo.nombre);
  const nuevoValor = Number(actual?.valor) - 1;
  entorno.set(nodo.nombre, nuevoValor);
}

// ─── Control de flujo ─────────────────────────────────────────────────

function ejecutarIf(nodo: any, contexto: ContextoEjecucion): any {
  const { entorno, output, errors, symbols, funciones, structs, scope } = contexto;
  const condicion = ejecutarNodo(nodo.condicion, contexto);
  if (condicion.valor) {
    ejecutarBloque(nodo.cuerpo, { entorno: new Entorno(entorno, `if_then_${Date.now()}`), output, errors, symbols, funciones, structs, scope });
  } else {
    if (nodo.cuerpo_else == null) { return; }
    ejecutarBloque(nodo.cuerpo_else, { entorno: new Entorno(entorno, `if_else_${Date.now()}`), output, errors, symbols, funciones, structs, scope });
  }
}

function ejecutarElse(nodo: any, contexto: ContextoEjecucion): any {
  const { entorno, output, errors, symbols, funciones, structs, scope } = contexto;
  ejecutarBloque(nodo.cuerpo, { entorno: new Entorno(entorno, `else_${Date.now()}`), output, errors, symbols, funciones, structs, scope });
}

function ejecutarSwitch(nodo: any, contexto: ContextoEjecucion): any {
  const { entorno, output, errors, symbols, funciones, structs, scope } = contexto;
  const valorSwitch = ejecutarNodo(nodo.discriminante, contexto);
  let casoEjecutado = false;
  let defaultCaso: any = null;
  for (const caso of nodo.casos) {
    if (caso.type === 'DefaultClause') {
      defaultCaso = caso;
      continue;
    }
    const valorCaso = ejecutarNodo(caso.condicion, contexto);
    if (valorCaso === valorSwitch) {
      ejecutarBloque(caso.cuerpo, { entorno: new Entorno(entorno, `switch_case_${Date.now()}`), output, errors, symbols, funciones, structs, scope });
      casoEjecutado = true;
      break;
    }
    else if (caso.type === 'DefaultClause' && !casoEjecutado) {
      ejecutarBloque(caso.cuerpo, { entorno: new Entorno(entorno, `switch_default_${Date.now()}`), output, errors, symbols, funciones, structs, scope });
    }
  }
  if (!casoEjecutado && defaultCaso) {
    ejecutarBloque(defaultCaso.cuerpo, { entorno: new Entorno(entorno, `switch_default`), output, errors, symbols, funciones, structs, scope });
  }
}

// ─── Loops ────────────────────────────────────────────────────────────

function ejecutarForWhile(nodo: any, contexto: ContextoEjecucion): any {
  const { entorno, output, errors, symbols, funciones, structs, scope } = contexto;
  const entornoFor = new Entorno(entorno, 'for');
  const contextoFor: ContextoEjecucion = { entorno: entornoFor, output, errors, symbols, funciones, structs, scope };

  while (true) {
    const condicion = extraerValor(ejecutarNodo(nodo.condicion, contextoFor));
    if (!condicion) break;
    try {
      ejecutarBloque(nodo.cuerpo, { entorno: entornoFor, output, errors, symbols, funciones, structs, scope });
    } catch (e) {
      if (e instanceof BreakSignal) break;
      if (e instanceof ContinueSignal) continue;
      throw e; // re-lanzar errores reales
    }
  }
}

function ejecutarForClassic(nodo: any, contexto: ContextoEjecucion) {
  const { entorno, output, errors, symbols, funciones, structs, scope } = contexto;
  const entornoFor = new Entorno(entorno, 'for_classic');
  const contextoFor: ContextoEjecucion = { entorno: entornoFor, output, errors, symbols, funciones, structs, scope };
  ejecutarNodo(nodo.inicializacion, contextoFor);

  while (true) {
    const condicion = extraerValor(ejecutarNodo(nodo.condicion, contextoFor));
    if (!condicion) break;

    let doContinue = false;
    try {
      ejecutarBloque(nodo.cuerpo, { entorno: entornoFor, output, errors, symbols, funciones, structs, scope });
    } catch (e) {
      if (e instanceof BreakSignal) break;
      if (e instanceof ContinueSignal) { doContinue = true; }
      else throw e;
    }

    // La actualización SIEMPRE corre, ya sea continue normal o por ContinueSignal
    ejecutarNodo(nodo.actualizacion, contextoFor);

    if (doContinue) continue;
  }
}

function ejecutarForRange(nodo: any, contexto: ContextoEjecucion): any {
  const { entorno, output, errors, symbols, funciones, structs, scope } = contexto;
  const iterable = extraerValor(ejecutarNodo(nodo.iterable, contexto));
  if (!Array.isArray(iterable)) {
    errors.push({
      type: 'runtime',
      message: 'El valor en un for range debe ser un slice',
      line: nodo.ubicacion.linea ?? 0,
      col: 0,
    });
    return;
  }

  for (let indice = 0; indice < iterable.length; indice++) {
    const valor = iterable[indice];
    procesarIteracionForRange(nodo, indice, valor, { entorno, output, errors, symbols, funciones, structs, scope });
  }
}

function procesarIteracionForRange(nodo: any, indice: number, valor: any, context: ContextoEjecucion): void {
  const entornoRange = new Entorno(context.entorno, `for_range_${indice}`);
  if (nodo.indice && nodo.indice !== '_') {
    entornoRange.declarar(nodo.indice, indice, 'int');
  }
  if (nodo.valor && nodo.valor !== '_') {
    entornoRange.declarar(nodo.valor, valor, inferirTipo(valor));
  }
  try {
    ejecutarBloque(nodo.cuerpo, { ...context, entorno: entornoRange });
  } catch (e) {
    if (e instanceof BreakSignal) throw e;
    if (e instanceof ContinueSignal) throw e;
    throw e;
  }
}

// ─── Slices ───────────────────────────────────────────────────────────

function ejecutarSliceLiteral(nodo: any, contexto: ContextoEjecucion): any {
  const elementos = nodo.valores.map((e: any) => extraerValor(ejecutarNodo(e, contexto)));
  return elementos;
}

function ejecutarSliceAccess(nodo: any, contexto: ContextoEjecucion): any {
  const { entorno, errors } = contexto;
  const slice = entorno.get(nodo.nombre);
  const indice = nodo.indice.valor; // asumiendo que el índice es un IntLiteral, ajustar si es necesario
  if (indice < 0 || indice >= slice.length) {
    errors.push({
      type: 'runtime',
      message: 'Índice fuera de los límites',
      line: nodo.ubicacion.linea ?? 0,
      col: 0,
    });
    return;
  }
  return slice[indice];
}

function ejecutarSliceAssign(nodo: any, contexto: ContextoEjecucion): any {
  const { entorno, errors } = contexto;
  const slices = entorno.get(nodo.nombre);
  const indice = nodo.indice.valor;
  const nuevoValor = extraerValor(ejecutarNodo(nodo.valor, contexto));
  if (indice < 0 || indice >= slices.length) {
    errors.push({
      type: 'runtime',
      message: 'Índice fuera de los límites',
      line: nodo.ubicacion.linea ?? 0,
      col: 0,
    });
    return;
  }
  slices[indice] = nuevoValor;
  return slices;
}

function ejecutarLenCall(nodo: any, contexto: ContextoEjecucion): any {
  const { entorno, errors } = contexto;
  const valor = extraerValor(ejecutarNodo(nodo.arg, contexto));
  console.log('len call, slice:', valor, valor.length);
  const sliceTipo = entorno.getTipo(nodo.arg.nombre);
  if (!Array.isArray(valor)) {
    if (sliceTipo === 'Tiposlice') {
      return 0;
    } else {
      errors.push({
        type: 'warning',
        message: 'El argumento de len debe ser un slice',
        line: nodo.ubicacion.linea ?? 0,
        col: 0,
      });
    }
  }
  return valor.length;
}

function ejecutarAppendAssign(nodo: any, contexto: ContextoEjecucion): any {
  const { entorno, errors } = contexto;
  const slice = entorno.get(nodo.slice);
  const sliceTipo = entorno.getTipo(nodo.slice);
  const nuevoValor = extraerValor(ejecutarNodo(nodo.valor, contexto));
  if (!Array.isArray(slice)) {
    if (sliceTipo === 'TipoSlice') {
      entorno.set(nodo.slice, []); // inicializar como slice vacío si es del tipo correcto pero no es un array real
      const nuevoSlice = entorno.get(nodo.slice);
      nuevoSlice.push(nuevoValor);
      return nuevoSlice;
    } else {
      errors.push({
        type: 'runtime',
        message: 'El objetivo de append debe ser un slice',
        line: nodo.ubicacion.linea ?? 0,
        col: 0,
      });
      return;
    }
  }
  slice.push(nuevoValor);
  return slice;
}

function ejecutarSlicesIndexCall(nodo: any, contexto: ContextoEjecucion): any {
  const { entorno, errors } = contexto;
  const slice = entorno.get(nodo.slice);
  const sliceTipo = entorno.getTipo(nodo.slice);
  const valor = extraerValor(ejecutarNodo(nodo.valor, contexto));
  if (!Array.isArray(slice)) {
    if (sliceTipo !== 'TipoSlice') {
      errors.push({
        type: 'runtime',
        message: 'El objetivo de index call debe ser un slice',
        line: nodo.ubicacion.linea ?? 0,
        col: 0,
      });
      return;
    }
  }
  if (slice.length > 0) {
    for (let i = 0; i < slice.length; i++) {
      if (slice[i] === valor) {
        return i;
      }
    }
    return -1; // no encontrado
  }
}

function ejecutarStringsJoinCall(nodo: any, contexto: ContextoEjecucion): any {
  const { entorno, errors } = contexto;
  const slice = entorno.get(nodo.slice);
  const sliceTipo = entorno.getTipo(nodo.slice);
  const separador = extraerValor(ejecutarNodo(nodo.separador, contexto));
  if (!Array.isArray(slice)) {
    if (sliceTipo !== 'TipoSlice') {
      errors.push({
        type: 'runtime',
        message: 'El argumento de strings join debe ser un slice',
        line: nodo.ubicacion.linea ?? 0,
        col: 0,
      });
      return;
    }
  }
  return slice.join(separador);
}

// ─── Matrices ─────────────────────────────────────────────────────────

function ejecutarMatrixLiteral(nodo: any, contexto: ContextoEjecucion): any {
  const filas = nodo.filas.map((fila: any[]) =>
    fila.map((elementoNodo: any) => extraerValor(ejecutarNodo(elementoNodo, contexto)))
  );
  return filas; // number[][] (o del tipo correspondiente)
}

function ejecutarMatrixAccess(nodo: any, contexto: ContextoEjecucion): any {
  const { entorno, errors } = contexto;
  const matriz = entorno.get(nodo.nombre);
  const fila = nodo.fila.valor;
  const columna = nodo.columna.valor;
  if (!Array.isArray(matriz) || !Array.isArray(matriz[0])) {
    errors.push({
      type: 'runtime',
      message: 'El objetivo de acceso a matriz debe ser una matriz (slice de slices)',
      line: nodo.ubicacion.linea ?? 0,
      col: 0,
    });
    return;
  }
  if (fila < 0 || fila >= matriz.length || columna < 0 || columna >= matriz[0].length) {
    errors.push({
      type: 'runtime',
      message: 'Índices de matriz fuera de los límites',
      line: nodo.ubicacion.linea ?? 0,
      col: 0,
    });
    return;
  }
  return matriz[fila][columna];
}

function ejecutarMatrixAssign(nodo: any, contexto: ContextoEjecucion): any {
  const { entorno, errors } = contexto;
  const matriz = entorno.get(nodo.nombre);
  const fila = nodo.fila.valor;
  const columna = nodo.columna.valor;
  const nuevoValor = extraerValor(ejecutarNodo(nodo.valor, contexto));
  if (!Array.isArray(matriz) || !Array.isArray(matriz[0])) {
    errors.push({
      type: 'runtime',
      message: 'El objetivo de asignación a matriz debe ser una matriz (slice de slices)',
      line: nodo.ubicacion.linea ?? 0,
      col: 0,
    });
    return;
  }
  if (fila < 0 || fila >= matriz.length || columna < 0 || columna >= matriz[0].length) {
    errors.push({
      type: 'runtime',
      message: 'Índices de matriz fuera de los límites',
      line: nodo.ubicacion.linea ?? 0,
      col: 0,
    });
    return;
  }
  matriz[fila][columna] = nuevoValor;
  return matriz;
}

// ─── Expresiones ──────────────────────────────────────────────────────

function evaluarUnaryExpr(nodo: any, contexto: ContextoEjecucion): any {
  const resultado = resolverConTipo(nodo.operando, contexto);
  if (nodo.operador === '-') {
    return { valor: -Number(resultado.valor), tipo: resultado.tipo };
  }
  if (nodo.operador === '!') {
    return { valor: !resultado.valor, tipo: 'bool' };
  }
  return resultado;
}

function evaluarBinaryExpr(nodo: any, contexto: ContextoEjecucion): any {
  const { errors } = contexto;
  const izqR = resolverConTipo(nodo.izquierda, contexto);
  const derR = resolverConTipo(nodo.derecha, contexto);

  const { valor: izq, tipo: ti } = izqR;
  const { valor: der, tipo: td } = derR;

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

// ─── Impresión ────────────────────────────────────────────────────────

function ejecutarPrintln(nodo: any, contexto: ContextoEjecucion) {
  const { output } = contexto;
  const valores = nodo.args.map((arg: any) => formatearArgPrint(arg, contexto));
  output.push(valores.join(''));
}

function formatearArgPrint(arg: any, contexto: ContextoEjecucion): string {
  const { entorno } = contexto;
  if (arg.type === 'Identifier') {
    const simbolo = entorno.getSimbolo(arg.nombre);
    if (Array.isArray(simbolo?.valor)) {
      return formatearValorSlice(simbolo.valor);
    }
    if (simbolo?.valor && typeof simbolo.valor === 'object' && !Array.isArray(simbolo.valor)) {
      return formatearStruct(simbolo.valor);
    }
    if (simbolo?.tipo === 'float64' && Number.isInteger(Number(simbolo.valor))) {
      return Number(simbolo.valor).toFixed(1);
    }
    return String(simbolo?.valor ?? '');
  }
  const resultado = ejecutarNodo(arg, contexto);
  if (resultado && typeof resultado === 'object' && 'tipo' in resultado) {
    if (Array.isArray(resultado.valor)) {
      return formatearValorSlice(resultado.valor);
    }
    return formatearValor(resultado.valor, resultado.tipo);
  }
  if (Array.isArray(resultado)) {
    return formatearValorSlice(resultado);
  }
  return String(resultado);
}

// ─── Helpers de tipos y valores ───────────────────────────────────────

function valorPorDefecto(tipo: string): any {
  switch (tipo) {
    case 'int':     return 0;
    case 'float64': return 0;
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

function resolverConTipo(nodo: any, contexto: ContextoEjecucion): { valor: any; tipo: string } {
  const { entorno } = contexto;
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
    const resultado = resolverConTipo(nodo.operando, contexto);
    if (nodo.operador === '-') {
      return { valor: -Number(resultado.valor), tipo: resultado.tipo };
    }
    return resultado;
  }
  // Para expresiones compuestas (BinaryExpr anidado, etc.)
  const val = ejecutarNodo(nodo, contexto);
  // Si ya viene con tipo (cuando BinaryExpr devuelva {valor, tipo})
  if (val && typeof val === 'object' && 'tipo' in val) return val;
  return { valor: val, tipo: typeof val === 'number' ? 'int' : typeof val };
}

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
  if (typeof v === 'string') return v.codePointAt(0) || 0;
  return Number(v);
}

// ─── Operaciones aritméticas ──────────────────────────────────────────

function operarSuma(izq: any, ti: string, der: any, td: string): { valor: any; tipo: string } {
  // String en cualquier lado → concatenación
  if (ti === 'string' || td === 'string') {
    const si = ti === 'rune' ? String.fromCodePoint(runeANum(izq)) : String(izq);
    const sd = td === 'rune' ? String.fromCodePoint(runeANum(der)) : String(der);
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

// ─── Formateo ─────────────────────────────────────────────────────────

function formatearValor(valor: any, tipo: string): string {
  if (Array.isArray(valor)) return formatearValorSlice(valor);
  
  // Agregar detección de struct
  if (valor && typeof valor === 'object' && valor.constructor === Object) {
    return formatearStruct(valor);
  }
  
  if (tipo === 'float64' && Number.isInteger(Number(valor))) return Number(valor).toFixed(1);
  
  return String(valor ?? '');
}


function formatearValorSlice(valor: any): string {
  if (Array.isArray(valor)) {
    return `[${valor.map(formatearValorSlice).join(' ')}]`;
  }
  return String(valor ?? '');
}

function formatearStruct(obj: Record<string, any>): string {
  const campos = Object.entries(obj).map(([key, val]) => {
    let valorFormateado: string;
    if (Array.isArray(val)) {
      valorFormateado = formatearValorSlice(val);
    } else if (val && typeof val === 'object' && val.constructor === Object) {
      valorFormateado = formatearStruct(val); // recursivo para structs anidados
    } else {
      valorFormateado = String(val);
    }
    return `${key}:${valorFormateado}`;
  });
  return `{${campos.join(' ')}}`;
}
