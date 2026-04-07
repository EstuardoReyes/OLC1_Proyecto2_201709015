/* GoScript – Gramática Jison (Léxico + Sintáctico) */

/* ══════════════════════════════════════════════════════════════════
   ANALIZADOR LÉXICO
   ══════════════════════════════════════════════════════════════════ */
%lex
%%

/* Espacios en blanco y saltos de línea */
[ \t]+                              /* ignorar espacios y tabs */
\r\n|\r|\n                          /* salto de línea */

/* Comentarios */
\/\/.*                              /* comentario de una línea */
\/\*[\s\S]*?\*\/                    /* comentario multilínea */

/* Palabras reservadas */
"int"                               return 'INT';
"float64"                           return 'FLOAT';
"string"                            return 'STRING';
"bool"                              return 'BOOL';
"rune"                              return 'RUNE';
"nil"                               return 'NIL';
"true"                              return 'TRUE';
"false"                             return 'FALSE';

"var"                               return 'VAR';
"func"                              return 'FUNC';
"main"                              return 'MAIN';
"return"                            return 'RETURN';
"struct"                            return 'STRUCT';

"if"                                return 'IF';
"else"                              return 'ELSE';
"switch"                            return 'SWITCH';
"case"                              return 'CASE';
"default"                           return 'DEFAULT';

"for"                               return 'FOR';
"range"                             return 'RANGE';
"break"                             return 'BREAK';
"continue"                          return 'CONTINUE';

"fmt"                               return 'FMT';
"Println"                           return 'PRINTLN';

"append"                            return 'APPEND';
"len"                               return 'LEN';

"slices"                            return 'SLICES';
"Index"                             return 'INDEX';

"strings"                           return 'STRINGS';
"Join"                              return 'JOIN';

"strconv"                           return 'STRCONV';
"Atoi"                              return 'ATOI';
"ParseFloat"                        return 'PARSEFLOAT';

"reflect"                           return 'REFLECT';
"TypeOf"                            return 'TYPEOF';

/* Literales */
[0-9]+\.[0-9]+                      return 'LIT_FLOAT';
[0-9]+                              return 'LIT_INT';
\"([^\"\\]|\\.)*\"                  return 'LIT_STRING';
\'([^\'\\]|\\.){1}\'                return 'LIT_RUNE';

/* Operadores de asignación compuesta*/
"+="                                return 'MAS_IGUAL';
"-="                                return 'MENOS_IGUAL';

/* Operadores de comparación — multi-char ANTES que single-char */
"=="                                return 'DOBLE_IGUAL';
"!="                                return 'NO_IGUAL';
">="                                return 'MAYOR_IGUAL';
"<="                                return 'MENOR_IGUAL';
">"                                 return 'MAYOR';
"<"                                 return 'MENOR';

/* Operadores lógicos */
"&&"                                return 'AND';
"||"                                return 'OR';
"!"                                 return 'NOT';

/* Declaración corta */
":="                                return 'DECL_SHORT';

/* Incremento / decremento */
"++"                                return 'INCREMENTO';
"--"                                return 'DECREMENTO';

/* Operadores aritméticos */
"+"                                 return 'MAS';
"-"                                 return 'MENOS';
"*"                                 return 'ASTERISCO';
"/"                                 return 'DIVISION';
"%"                                 return 'PORCENTAJE';

/* Asignación simple */
"="                                 return 'IGUAL';

/* Delimitadores */
"("                                 return 'PARENTESIS_A';
")"                                 return 'PARENTESIS_C';
"{"                                 return 'LLAVE_A';
"}"                                 return 'LLAVE_C';
"["                                 return 'CORCHETE_A';
"]"                                 return 'CORCHETE_C';

/* Puntuación */
";"                                 return 'PUNTO_COMA';
":"                                 return 'DOS_PUNTOS';
","                                 return 'COMA';
"."                                 return 'PUNTO';

/* Identificadores — al final, después de todas las keywords */
[a-zA-Z_][a-zA-Z0-9_]*             return 'IDENTIFICADOR';

/* Fin de archivo */
<<EOF>>                             return 'EOF';

/* Error léxico — descarta el carácter y continúa */
.         {
            /* Catch-all: cualquier carácter no reconocido */
            yy.lexErrors = yy.lexErrors || [];
            yy.lexErrors.push({
                type:    'lexico',
                message: `Carácter inesperado: '${yytext}'`,
                line:    yylloc.first_line,
                col:     yylloc.first_column,
            });
            /* No retornamos token — el lexer sigue al siguiente carácter */
          }

/lex

/* ══════════════════════════════════════════════════════════════════
   CÓDIGO AUXILIAR (disponible en toda la gramática)
   ══════════════════════════════════════════════════════════════════ */
%{
    /**
     * Construye un objeto de ubicación con línea y columna.
     * Se usa en cada nodo del AST: ubicacion: loc(@1)
     * @param {object} l - objeto de posición de Jison (@N)
     */
    function loc(l) {
        return {
            linea:   l.first_line,
            columna: l.first_column
        };
    }
%}

%start programa

/*  PRECEDENCIA Y ASOCIATIVIDAD DE OPERADORES  */
%left     'OR'
%left     'AND'
%left     'DOBLE_IGUAL' 'NO_IGUAL'
%left     'MENOR' 'MENOR_IGUAL' 'MAYOR' 'MAYOR_IGUAL'
%left     'MAS' 'MENOS'
%left     'ASTERISCO' 'DIVISION' 'PORCENTAJE'
%right    'NOT' UMINUS

/* ANALIZADOR SINTÁCTICO */
%%

/* ── Programa (raíz del AST) ────────────────────────────────────── */
programa
    : definiciones_globales EOF
        { $$ = { type: 'Programa', cuerpo: $1, ubicacion: loc(@1) }; return $$; }
    | error EOF
        { $$ = { type: 'Programa', cuerpo: [], ubicacion: loc(@1) }; return $$; }
    ;

/* Lista de definiciones globales (funciones y structs) */
definiciones_globales
    : definiciones_globales definicion_global
        { $1.push($2); $$ = $1; }
    | definiciones_globales error '}'
        { $$ = $1; /* descarta la definición inválida y sigue */ }
    | definicion_global
        { $$ = [$1]; }
    | /* vacío */
        { $$ = []; }
    ;

definicion_global
    : declaracion_funcion
        { $$ = $1; }
    | declaracion_struct
        { $$ = $1; }
    ;


/* ── Structs ─────────────────────────────────────────────────────── */
declaracion_struct
    : STRUCT IDENTIFICADOR LLAVE_A campos_struct LLAVE_C
        { $$ = { type: 'StructDecl', nombre: $2, campos: $4, ubicacion: loc(@1) }; }
    ;

campos_struct
    : campos_struct campo_struct
        { $1.push($2); $$ = $1; }
    | campo_struct
        { $$ = [$1]; }
    ;

/* Cada campo lleva tipo y luego nombre (orden del spec GoScript) */
campo_struct
    : tipo IDENTIFICADOR PUNTO_COMA
        { $$ = { type: 'FieldDecl', tipo: $1, nombre: $2, ubicacion: loc(@1) }; }
    ;


/* ── Funciones ───────────────────────────────────────────────────── */
declaracion_funcion
    /* func main() { ... } */
    : FUNC MAIN PARENTESIS_A PARENTESIS_C LLAVE_A sentencias LLAVE_C
        { $$ = { type: 'MainFunc', cuerpo: $6, ubicacion: loc(@1) }; }

    /* func nombre(params) tipoRetorno { ... } */
    | FUNC IDENTIFICADOR PARENTESIS_A parametros PARENTESIS_C tipo_retorno LLAVE_A sentencias LLAVE_C
        { $$ = { type: 'FuncDecl', nombre: $2, parametros: $4, tipo_retorno: $6, cuerpo: $8, ubicacion: loc(@1) }; }

    /* func nombre() tipoRetorno { ... } */
    | FUNC IDENTIFICADOR PARENTESIS_A PARENTESIS_C tipo_retorno LLAVE_A sentencias LLAVE_C
        { $$ = { type: 'FuncDecl', nombre: $2, parametros: [], tipo_retorno: $5, cuerpo: $7, ubicacion: loc(@1) }; }

    /* func nombre(params) { ... }  — void */
    | FUNC IDENTIFICADOR PARENTESIS_A parametros PARENTESIS_C LLAVE_A sentencias LLAVE_C
        { $$ = { type: 'FuncDecl', nombre: $2, parametros: $4, tipo_retorno: null, cuerpo: $7, ubicacion: loc(@1) }; }

    /* func nombre() { ... }  — void sin parámetros */
    | FUNC IDENTIFICADOR PARENTESIS_A PARENTESIS_C LLAVE_A sentencias LLAVE_C
        { $$ = { type: 'FuncDecl', nombre: $2, parametros: [], tipo_retorno: null, cuerpo: $6, ubicacion: loc(@1) }; }
    ;

parametros
    : parametros COMA parametro
        { $1.push($3); $$ = $1; }
    | parametro
        { $$ = [$1]; }
    ;

parametro
    : IDENTIFICADOR tipo
        { $$ = { type: 'Param', nombre: $1, tipo: $2, ubicacion: loc(@1) }; }
    ;

tipo_retorno
    : tipo
        { $$ = $1; }
    ;


/* ── Tipos ───────────────────────────────────────────────────────── */
tipo
    : INT
        { $$ = { type: 'TipoPrimitivo', nombre: 'int' }; }
    | FLOAT
        { $$ = { type: 'TipoPrimitivo', nombre: 'float64' }; }
    | STRING
        { $$ = { type: 'TipoPrimitivo', nombre: 'string' }; }
    | BOOL
        { $$ = { type: 'TipoPrimitivo', nombre: 'bool' }; }
    | RUNE
        { $$ = { type: 'TipoPrimitivo', nombre: 'rune' }; }
    | CORCHETE_A CORCHETE_C tipo
        { $$ = { type: 'TipoSlice', tipo: $3 }; }
    | CORCHETE_A CORCHETE_C CORCHETE_A CORCHETE_C tipo
        { $$ = { type: 'TipoSlice', tipo: { type: 'TipoSlice', tipo: $5 } }; }
    | IDENTIFICADOR
        { $$ = { type: 'TipoStruct', nombre: $1 }; }
    ;


/* ── Bloque de sentencias ────────────────────────────────────────── */
sentencias
    : sentencias sentencia
        { $1.push($2); $$ = $1; }
    | sentencias error ';'
        { $$ = $1; /* descarta sentencia inválida, sincroniza en ';' */ }
    | sentencias error '}'
    { $$ = $1; /* recupera bloques mal formados */ }
    | /* vacío */
        { $$ = []; }
    ;

sentencia
    : declaracion_variable    { $$ = $1; }
    | asignacion              { $$ = $1; }
    | llamada_funcion         { $$ = $1; }
    | sentencia_if            { $$ = $1; }
    | sentencia_switch        { $$ = $1; }
    | sentencia_for           { $$ = $1; }
    | sentencia_break         { $$ = $1; }
    | sentencia_continue      { $$ = $1; }
    | sentencia_return        { $$ = $1; }
    | bloque_independiente    { $$ = $1; }
    | incremento_decremento   { $$ = $1; }
    ;


/* ── Declaración de variables ────────────────────────────────────── */
declaracion_variable
    /* var x int = 5 */
    : VAR IDENTIFICADOR tipo IGUAL expresion
        { $$ = { type: 'VarDecl', nombre: $2, tipo: $3, valor: $5, ubicacion: loc(@1) }; }

    /* var x int  — sin valor inicial */
    | VAR IDENTIFICADOR tipo
        { $$ = { type: 'VarDecl', nombre: $2, tipo: $3, valor: null, ubicacion: loc(@1) }; }

    /* x := expresion */
    | IDENTIFICADOR DECL_SHORT expresion
        { $$ = { type: 'ShortVarDecl', nombre: $1, valor: $3, ubicacion: loc(@1) }; }

    /* var x []int  — slice sin valor inicial */
    | VAR IDENTIFICADOR CORCHETE_A CORCHETE_C tipo
        { $$ = { type: 'VarDecl', nombre: $2, tipo: { type: 'TipoSlice', tipo: $5 }, valor: null, ubicacion: loc(@1) }; }

    /* Persona p = (nombre: "Juan", edad: 20) */
    | IDENTIFICADOR IDENTIFICADOR IGUAL PARENTESIS_A campos_struct_init PARENTESIS_C
        { $$ = { type: 'StructInstance', tipoStruct: $1, nombre: $2, campos: $5, ubicacion: loc(@1) }; }
    ;


/* ── Asignación de variables ─────────────────────────────────────── */
asignacion
    /* x = expresion */
    : IDENTIFICADOR IGUAL expresion
        { $$ = { type: 'Assignment', nombre: $1, valor: $3, ubicacion: loc(@1) }; }

    /* x += expresion */
    | IDENTIFICADOR MAS_IGUAL expresion
        { $$ = { type: 'CompoundAssign', nombre: $1, operador: '+=', valor: $3, ubicacion: loc(@1) }; }

    /* x -= expresion */
    | IDENTIFICADOR MENOS_IGUAL expresion
        { $$ = { type: 'CompoundAssign', nombre: $1, operador: '-=', valor: $3, ubicacion: loc(@1) }; }

    /* slice[i] = expresion */
    | IDENTIFICADOR CORCHETE_A expresion CORCHETE_C IGUAL expresion
        { $$ = { type: 'SliceAssign', nombre: $1, indice: $3, valor: $6, ubicacion: loc(@1) }; }

    /* matriz[i][j] = expresion */
    | IDENTIFICADOR CORCHETE_A expresion CORCHETE_C CORCHETE_A expresion CORCHETE_C IGUAL expresion
        { $$ = { type: 'MatrixAssign', nombre: $1, fila: $3, columna: $6, valor: $9, ubicacion: loc(@1) }; }

    /* obj.attr = expresion */
    | acceso_atributo IGUAL expresion
        { $$ = { type: 'AttrAssign', target: $1, valor: $3, ubicacion: loc(@1) }; }

    /* x = append(slice, expresion) */
    | IDENTIFICADOR IGUAL APPEND PARENTESIS_A IDENTIFICADOR COMA expresion PARENTESIS_C
        { $$ = { type: 'AppendAssign', target: $1, slice: $5, valor: $7, ubicacion: loc(@1) }; }
    ;


/* ── Incremento y decremento ─────────────────────────────────────── */
incremento_decremento
    : IDENTIFICADOR INCREMENTO
        { $$ = { type: 'Increment', nombre: $1, ubicacion: loc(@1) }; }
    | IDENTIFICADOR DECREMENTO
        { $$ = { type: 'Decrement', nombre: $1, ubicacion: loc(@1) }; }
    ;


/* ── Inicialización de campos de struct ──────────────────────────── */
campos_struct_init
    : campos_struct_init COMA campo_struct_init
        { $1.push($3); $$ = $1; }
    | campo_struct_init
        { $$ = [$1]; }
    ;

campo_struct_init
    /* nombre: expresion */
    : IDENTIFICADOR DOS_PUNTOS expresion
        { $$ = { type: 'FieldInit', nombre: $1, valor: $3, ubicacion: loc(@1) }; }

    /* nombre: (campos_anidados)  — struct anidado */
    | IDENTIFICADOR DOS_PUNTOS PARENTESIS_A campos_struct_init PARENTESIS_C
        { $$ = { type: 'FieldInit', nombre: $1, valor: { type: 'StructLiteral', campos: $4, ubicacion: loc(@3) }, ubicacion: loc(@1) }; }
    ;


/* ── Sentencia IF / ELSE IF / ELSE ───────────────────────────────── */
sentencia_if
    /* if condicion { ... } */
    : IF expresion LLAVE_A sentencias LLAVE_C
        { $$ = { type: 'IfStmt', condicion: $2, cuerpo: $4, cuerpo_else: null, ubicacion: loc(@1) }; }

    /* if condicion { ... } else { ... } */
    | IF expresion LLAVE_A sentencias LLAVE_C ELSE LLAVE_A sentencias LLAVE_C
        { $$ = { type: 'IfStmt', condicion: $2, cuerpo: $4, cuerpo_else: $8, ubicacion: loc(@1) }; }

    /* if condicion { ... } else if ... */
    | IF expresion LLAVE_A sentencias LLAVE_C ELSE sentencia_if
        { $$ = { type: 'IfStmt', condicion: $2, cuerpo: $4, cuerpo_else: [$7], ubicacion: loc(@1) }; }

    /* if (condicion) { ... }  — con paréntesis opcionales */
    | IF PARENTESIS_A expresion PARENTESIS_C LLAVE_A sentencias LLAVE_C
        { $$ = { type: 'IfStmt', condicion: $3, cuerpo: $6, cuerpo_else: null, ubicacion: loc(@1) }; }

    /* if (condicion) { ... } else { ... } */
    | IF PARENTESIS_A expresion PARENTESIS_C LLAVE_A sentencias LLAVE_C ELSE LLAVE_A sentencias LLAVE_C
        { $$ = { type: 'IfStmt', condicion: $3, cuerpo: $6, cuerpo_else: $10, ubicacion: loc(@1) }; }

    /* if (condicion) { ... } else if ... */
    | IF PARENTESIS_A expresion PARENTESIS_C LLAVE_A sentencias LLAVE_C ELSE sentencia_if
        { $$ = { type: 'IfStmt', condicion: $3, cuerpo: $6, cuerpo_else: [$9], ubicacion: loc(@1) }; }
    ;


/* ── Sentencia SWITCH ────────────────────────────────────────────── */
sentencia_switch
    : SWITCH expresion LLAVE_A casos_switch LLAVE_C
        { $$ = { type: 'SwitchStmt', discriminante: $2, casos: $4, ubicacion: loc(@1) }; }
    ;

casos_switch
    : casos_switch caso_switch
        { $1.push($2); $$ = $1; }
    | caso_switch
        { $$ = [$1]; }
    ;

caso_switch
    : CASE expresion DOS_PUNTOS sentencias
        { $$ = { type: 'CaseClause', condicion: $2, cuerpo: $4, ubicacion: loc(@1) }; }
    | DEFAULT DOS_PUNTOS sentencias
        { $$ = { type: 'DefaultClause', cuerpo: $3, ubicacion: loc(@1) }; }
    ;


/* ── Sentencia FOR ───────────────────────────────────────────────── */
sentencia_for
    /* for condicion { ... }  — estilo while */
    : FOR expresion LLAVE_A sentencias LLAVE_C
        { $$ = { type: 'ForWhile', condicion: $2, cuerpo: $4, ubicacion: loc(@1) }; }

    /* for init; condicion; update { ... }  — clásico */
    | FOR for_init PUNTO_COMA expresion PUNTO_COMA for_update LLAVE_A sentencias LLAVE_C
        { $$ = { type: 'ForClassic', inicializacion: $2, condicion: $4, actualizacion: $6, cuerpo: $8, ubicacion: loc(@1) }; }

    /* for i, v := range expresion { ... } */
    | FOR IDENTIFICADOR COMA IDENTIFICADOR DECL_SHORT RANGE expresion LLAVE_A sentencias LLAVE_C
        { $$ = { type: 'ForRange', indice: $2, valor: $4, iterable: $7, cuerpo: $9, ubicacion: loc(@1) }; }

    /* for i, v := range identificador { ... } */
    | FOR IDENTIFICADOR COMA IDENTIFICADOR DECL_SHORT RANGE IDENTIFICADOR LLAVE_A sentencias LLAVE_C
        { $$ = { type: 'ForRange', indice: $2, valor: $4, iterable: { type: 'Identifier', nombre: $7, ubicacion: loc(@7) }, cuerpo: $9, ubicacion: loc(@1) }; }
    ;

for_init
    : IDENTIFICADOR DECL_SHORT expresion
        { $$ = { type: 'ShortVarDecl', nombre: $1, valor: $3, ubicacion: loc(@1) }; }
    | VAR IDENTIFICADOR tipo IGUAL expresion
        { $$ = { type: 'VarDecl', nombre: $2, tipo: $3, valor: $5, ubicacion: loc(@1) }; }
    | IDENTIFICADOR IGUAL expresion
        { $$ = { type: 'Assignment', nombre: $1, valor: $3, ubicacion: loc(@1) }; }
    ;

for_update
    : IDENTIFICADOR INCREMENTO
        { $$ = { type: 'Increment', nombre: $1, ubicacion: loc(@1) }; }
    | IDENTIFICADOR DECREMENTO
        { $$ = { type: 'Decrement', nombre: $1, ubicacion: loc(@1) }; }
    | IDENTIFICADOR MAS_IGUAL expresion
        { $$ = { type: 'CompoundAssign', nombre: $1, operador: '+=', valor: $3, ubicacion: loc(@1) }; }
    | IDENTIFICADOR MENOS_IGUAL expresion
        { $$ = { type: 'CompoundAssign', nombre: $1, operador: '-=', valor: $3, ubicacion: loc(@1) }; }
    | IDENTIFICADOR IGUAL expresion
        { $$ = { type: 'Assignment', nombre: $1, valor: $3, ubicacion: loc(@1) }; }
    ;


/* ── Sentencias de transferencia ─────────────────────────────────── */
sentencia_break
    : BREAK
        { $$ = { type: 'BreakStmt', ubicacion: loc(@1) }; }
    ;

sentencia_continue
    : CONTINUE
        { $$ = { type: 'ContinueStmt', ubicacion: loc(@1) }; }
    ;

sentencia_return
    : RETURN expresion
        { $$ = { type: 'ReturnStmt', valor: $2, ubicacion: loc(@1) }; }
    | RETURN
        { $$ = { type: 'ReturnStmt', valor: null, ubicacion: loc(@1) }; }
    ;


/* ── Bloque independiente (crea nuevo scope) ─────────────────────── */
bloque_independiente
    : LLAVE_A sentencias LLAVE_C
        { $$ = { type: 'Block', cuerpo: $2, ubicacion: loc(@1) }; }
    ;


/* ── Llamadas a funciones como sentencia ─────────────────────────── */
llamada_funcion
    /* fmt.Println(args) */
    : FMT PUNTO PRINTLN PARENTESIS_A argumentos PARENTESIS_C
        { $$ = { type: 'PrintlnCall', args: $5, ubicacion: loc(@1) }; }

    /* fmt.Println() — sin argumentos */
    | FMT PUNTO PRINTLN PARENTESIS_A PARENTESIS_C
        { $$ = { type: 'PrintlnCall', args: [], ubicacion: loc(@1) }; }

    /* nombre(args) */
    | IDENTIFICADOR PARENTESIS_A argumentos PARENTESIS_C
        { $$ = { type: 'FuncCall', nombre: $1, args: $3, ubicacion: loc(@1) }; }

    /* nombre() — sin argumentos */
    | IDENTIFICADOR PARENTESIS_A PARENTESIS_C
        { $$ = { type: 'FuncCall', nombre: $1, args: [], ubicacion: loc(@1) }; }
    ;


/* ── Llamadas a funciones como expresión ─────────────────────────── */
llamada_funcion_expr
    : IDENTIFICADOR PARENTESIS_A argumentos PARENTESIS_C
        { $$ = { type: 'FuncCallExpr', nombre: $1, args: $3, ubicacion: loc(@1) }; }
    | IDENTIFICADOR PARENTESIS_A PARENTESIS_C
        { $$ = { type: 'FuncCallExpr', nombre: $1, args: [], ubicacion: loc(@1) }; }
    | FMT PUNTO PRINTLN PARENTESIS_A argumentos PARENTESIS_C
        { $$ = { type: 'PrintlnCallExpr', args: $5, ubicacion: loc(@1) }; }
    | STRCONV PUNTO ATOI PARENTESIS_A expresion PARENTESIS_C
        { $$ = { type: 'AtoiCall', arg: $5, ubicacion: loc(@1) }; }
    | STRCONV PUNTO PARSEFLOAT PARENTESIS_A expresion PARENTESIS_C
        { $$ = { type: 'ParseFloatCall', arg: $5, ubicacion: loc(@1) }; }
    | REFLECT PUNTO TYPEOF PARENTESIS_A expresion PARENTESIS_C
        { $$ = { type: 'TypeOfCall', arg: $5, ubicacion: loc(@1) }; }
    | LEN PARENTESIS_A expresion PARENTESIS_C
        { $$ = { type: 'LenCall', arg: $3, ubicacion: loc(@1) }; }
    | APPEND PARENTESIS_A IDENTIFICADOR COMA expresion PARENTESIS_C
        { $$ = { type: 'AppendCall', slice: $3, valor: $5, ubicacion: loc(@1) }; }
    | SLICES PUNTO INDEX PARENTESIS_A IDENTIFICADOR COMA expresion PARENTESIS_C
        { $$ = { type: 'SlicesIndexCall', slice: $5, valor: $7, ubicacion: loc(@1) }; }
    | STRINGS PUNTO JOIN PARENTESIS_A IDENTIFICADOR COMA expresion PARENTESIS_C
        { $$ = { type: 'StringsJoinCall', slice: $5, separador: $7, ubicacion: loc(@1) }; }
    ;


/* ── Argumentos ──────────────────────────────────────────────────── */
argumentos
    : argumentos COMA expresion
        { $1.push($3); $$ = $1; }
    | expresion
        { $$ = [$1]; }
    ;


/* ── Expresiones ─────────────────────────────────────────────────── */
expresion
    /* Operaciones binarias — resueltas por precedencia declarada arriba */
    : expresion MAS expresion
        { $$ = { type: 'BinaryExpr', operador: '+', izquierda: $1, derecha: $3, ubicacion: loc(@1) }; }
    | expresion MENOS expresion
        { $$ = { type: 'BinaryExpr', operador: '-', izquierda: $1, derecha: $3, ubicacion: loc(@1) }; }
    | expresion ASTERISCO expresion
        { $$ = { type: 'BinaryExpr', operador: '*', izquierda: $1, derecha: $3, ubicacion: loc(@1) }; }
    | expresion DIVISION expresion
        { $$ = { type: 'BinaryExpr', operador: '/', izquierda: $1, derecha: $3, ubicacion: loc(@1) }; }
    | expresion PORCENTAJE expresion
        { $$ = { type: 'BinaryExpr', operador: '%', izquierda: $1, derecha: $3, ubicacion: loc(@1) }; }
    | expresion DOBLE_IGUAL expresion
        { $$ = { type: 'BinaryExpr', operador: '==', izquierda: $1, derecha: $3, ubicacion: loc(@1) }; }
    | expresion NO_IGUAL expresion
        { $$ = { type: 'BinaryExpr', operador: '!=', izquierda: $1, derecha: $3, ubicacion: loc(@1) }; }
    | expresion MENOR expresion
        { $$ = { type: 'BinaryExpr', operador: '<', izquierda: $1, derecha: $3, ubicacion: loc(@1) }; }
    | expresion MENOR_IGUAL expresion
        { $$ = { type: 'BinaryExpr', operador: '<=', izquierda: $1, derecha: $3, ubicacion: loc(@1) }; }
    | expresion MAYOR expresion
        { $$ = { type: 'BinaryExpr', operador: '>', izquierda: $1, derecha: $3, ubicacion: loc(@1) }; }
    | expresion MAYOR_IGUAL expresion
        { $$ = { type: 'BinaryExpr', operador: '>=', izquierda: $1, derecha: $3, ubicacion: loc(@1) }; }
    | expresion AND expresion
        { $$ = { type: 'BinaryExpr', operador: '&&', izquierda: $1, derecha: $3, ubicacion: loc(@1) }; }
    | expresion OR expresion
        { $$ = { type: 'BinaryExpr', operador: '||', izquierda: $1, derecha: $3, ubicacion: loc(@1) }; }

    /* Operaciones unarias */
    | NOT expresion
        { $$ = { type: 'UnaryExpr', operador: '!', operando: $2, ubicacion: loc(@1) }; }
    | MENOS expresion %prec UMINUS
        { $$ = { type: 'UnaryExpr', operador: '-', operando: $2, ubicacion: loc(@1) }; }

    /* Expresión entre paréntesis */
    | PARENTESIS_A expresion PARENTESIS_C
        { $$ = $2; }

    /* Sub-expresiones */
    | llamada_funcion_expr      { $$ = $1; }
    | acceso_slice              { $$ = $1; }
    | acceso_atributo           { $$ = $1; }
    | literal_slice             { $$ = $1; }
    | literal                   { $$ = $1; }

    /* Identificador simple */
    | IDENTIFICADOR
        { $$ = { type: 'Identifier', nombre: $1, ubicacion: loc(@1) }; }
    ;


/* ── Acceso a elementos de slice / matriz ────────────────────────── */
acceso_slice
    /* slice[i] */
    : IDENTIFICADOR CORCHETE_A expresion CORCHETE_C
        { $$ = { type: 'SliceAccess', nombre: $1, indice: $3, ubicacion: loc(@1) }; }

    /* matriz[i][j] */
    | IDENTIFICADOR CORCHETE_A expresion CORCHETE_C CORCHETE_A expresion CORCHETE_C
        { $$ = { type: 'MatrixAccess', nombre: $1, fila: $3, columna: $6, ubicacion: loc(@1) }; }
    ;


/* ── Acceso a atributos de struct (dot notation) ─────────────────── */
acceso_atributo
    /* obj.campo */
    : IDENTIFICADOR PUNTO IDENTIFICADOR
        { $$ = { type: 'AttrAccess', objeto: $1, atributo: $3, ubicacion: loc(@1) }; }

    /* obj.campo1.campo2  — acceso encadenado */
    | acceso_atributo PUNTO IDENTIFICADOR
        { $$ = { type: 'AttrAccess', objeto: $1, atributo: $3, ubicacion: loc(@1) }; }
    ;


/* ── Literal de slice / matriz ───────────────────────────────────── */
literal_slice
    /* []int{1, 2, 3} */
    : CORCHETE_A CORCHETE_C tipo LLAVE_A lista_expresiones LLAVE_C
        { $$ = { type: 'SliceLiteral', tipo: $3, valores: $5, ubicacion: loc(@1) }; }

    /* [][]int{{1,2},{3,4}} */
    | CORCHETE_A CORCHETE_C CORCHETE_A CORCHETE_C tipo LLAVE_A lista_filas LLAVE_C
        { $$ = { type: 'MatrixLiteral', tipo: $5, filas: $7, ubicacion: loc(@1) }; }
    ;

lista_filas
    : lista_filas COMA LLAVE_A lista_expresiones LLAVE_C
        { $1.push($4); $$ = $1; }
    | LLAVE_A lista_expresiones LLAVE_C
        { $$ = [$2]; }
    ;

lista_expresiones
    : lista_expresiones COMA expresion
        { $1.push($3); $$ = $1; }
    | expresion
        { $$ = [$1]; }
    ;


/* ── Literales primitivos ────────────────────────────────────────── */
literal
    : LIT_INT
        { $$ = { type: 'IntLiteral', valor: parseInt($1, 10), ubicacion: loc(@1) }; }
    | LIT_FLOAT
        { $$ = { type: 'FloatLiteral', valor: parseFloat($1), ubicacion: loc(@1) }; }
    | LIT_STRING
        { $$ = { type: 'StringLiteral', valor: $1.slice(1, -1), ubicacion: loc(@1) }; }
    | LIT_RUNE
        { $$ = { type: 'RuneLiteral', valor: $1.slice(1, -1), ubicacion: loc(@1) }; }
    | TRUE
        { $$ = { type: 'BoolLiteral', valor: true, ubicacion: loc(@1) }; }
    | FALSE
        { $$ = { type: 'BoolLiteral', valor: false, ubicacion: loc(@1) }; }
    | NIL
        { $$ = { type: 'NilLiteral', valor: null, ubicacion: loc(@1) }; }
    ;
