/* GoScript – Gramática Jison (Léxico + Sintáctico) */

%{
    // Utilidades para construir nodos del AST
    function loc(l) {
        return { line: l.first_line, column: l.first_column };
    }
%}

/* ANALIZADOR LEXICO */
%lex

/* Espacios en blanco y saltos de línea */
[ \t]+                              /* ignorar espacios y tabs */
\r\n|\r|\n                           /* salto de línea */

/* Comentarios */
\/\/.*                               /* comentario de una línea */
\/\*[\s\S]*?\*\/                     /* comentario multilínea */

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
\'([^\'\\]|\\.)\'                   return 'LIT_RUNE';

/* Operadores aritméticos de asignación */
"+="                                return 'MAS_IGUAL';
"-="                                return 'MENOS_IGUAL';

/* Operadores de comparación */
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

/* Asignación */
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

/* Identificadores */
[a-zA-Z_][a-zA-Z0-9_]*             return 'IDENTIFICADOR';

/* Fin de archivo */
<<EOF>>                             return 'EOF';

/* Error léxico */
.   {
        console.error('Error léxico: símbolo no reconocido "' + yytext + '" en línea ' + yylloc.first_line + ', columna ' + yylloc.first_column);
    }

/lex

/* PRECEDENCIA Y ASOCIATIVIDAD DE OPERADORES */

%left 'OR'
%left 'AND'
%left 'DOBLE_IGUAL' 'NO_IGUAL'
%left 'MENOR' 'MENOR_IGUAL' 'MAYOR_IGUAL' 'MAYOR'
%left 'MAS' 'MENOS'
%left 'ASTERISCO' 'DIVISION' 'PORCENTAJE'
%right 'NOT' UMINUS

/* ANALIZADOR SINTÁCTICO */
%%

/* ================================================================
 *  EJEMPLO 1 – Declaración de variables
 *  -----------------------------------------------------------------
 *  Cubre las 3 formas de declarar variables en GoScript:
 *    1. var <id> <tipo> = <expr>
 *    2. var <id> <tipo>
 *    3. <id> := <expr>
 *  También cubre la asignación simple: <id> = <expr>
 *  Y los operadores de asignación:   <id> += <expr>  /  <id> -= <expr>
 *  Además del incremento/decremento:  <id>++  /  <id>--
 * ================================================================ */

/* ================================================================
 *  EJEMPLO 2 – Sentencias de control de flujo (if / else / for)
 *  -----------------------------------------------------------------
 *  Cubre:
 *    - if <cond> { ... }
 *    - if <cond> { ... } else { ... }
 *    - if <cond> { ... } else if <cond> { ... } else { ... }
 *    - for <cond> { ... }                          (estilo while)
 *    - for <init> ; <cond> ; <update> { ... }      (clásico)
 *    - for <idx>, <val> := range <expr> { ... }    (range)
 *    - switch <expr> { case <val>: ... default: ... }
 * ================================================================ */

/* ── Programa (raíz del AST) ───────────────────────────────────── */
programa
    : definiciones_globales EOF
        { $$ = { type: 'Programa', cuerpo: $1, ubicacion: loc(@1) }; return $$; }
    ;

definiciones_globales
    : definiciones_globales definicion_global
        { $1.push($2); $$ = $1; }
    | definicion_global
        { $$ = [$1]; }
    ;

definicion_global
    : declaracion_funcion
        { $$ = $1; }
    | declaracion_struct
        { $$ = $1; }
    ;

/* ── Structs ───────────────────────────────────────────────────── */
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

campo_struct
    : tipo IDENTIFICADOR PUNTO_COMA
        { $$ = { type: 'FieldDecl', dataType: $1, name: $2, loc: loc(@1) }; }
    | tipo IDENTIFICADOR
        { $$ = { type: 'FieldDecl', dataType: $1, name: $2, loc: loc(@1) }; }
    ;

/* ── Funciones ─────────────────────────────────────────────────── */
declaracion_funcion
    : FUNC MAIN PARENTESIS_A PARENTESIS_C LLAVE_A sentencias LLAVE_C
        { $$ = { type: 'MainFunc', body: $6, loc: loc(@1) }; }
    | FUNC IDENTIFICADOR PARENTESIS_A parametros PARENTESIS_C tipo_retorno LLAVE_A sentencias LLAVE_C
        { $$ = { type: 'FuncDecl', name: $2, params: $4, returnType: $6, body: $8, loc: loc(@1) }; }
    | FUNC IDENTIFICADOR PARENTESIS_A PARENTESIS_C tipo_retorno LLAVE_A sentencias LLAVE_C
        { $$ = { type: 'FuncDecl', name: $2, params: [], returnType: $5, body: $7, loc: loc(@1) }; }
    | FUNC IDENTIFICADOR PARENTESIS_A parametros PARENTESIS_C LLAVE_A sentencias LLAVE_C
        { $$ = { type: 'FuncDecl', name: $2, params: $4, returnType: null, body: $7, loc: loc(@1) }; }
    | FUNC IDENTIFICADOR PARENTESIS_A PARENTESIS_C LLAVE_A sentencias LLAVE_C
        { $$ = { type: 'FuncDecl', name: $2, params: [], returnType: null, body: $6, loc: loc(@1) }; }
    ;

parametros
    : parametros COMA parametro
        { $1.push($3); $$ = $1; }
    | parametro
        { $$ = [$1]; }
    ;

parametro
    : IDENTIFICADOR tipo
        { $$ = { type: 'Param', name: $1, dataType: $2, loc: loc(@1) }; }
    ;

tipo_retorno
    : tipo
        { $$ = $1; }
    ;

/* ── Tipos ─────────────────────────────────────────────────────── */
tipo
    : INT
        { $$ = { type: 'TipoPrimitivo', name: 'int' }; }
    | FLOAT
        { $$ = { type: 'TipoPrimitivo', name: 'float' }; }
    | STRING
        { $$ = { type: 'TipoPrimitivo', name: 'string' }; }
    | BOOL
        { $$ = { type: 'TipoPrimitivo', name: 'bool' }; }
    | RUNE
        { $$ = { type: 'TipoPrimitivo', name: 'rune' }; }
    | CORCHETE_A CORCHETE_C tipo
        { $$ = { type: 'SliceType', elementType: $3 }; }
    | CORCHETE_A CORCHETE_C CORCHETE_A CORCHETE_C tipo
        { $$ = { type: 'SliceType', elementType: { type: 'SliceType', elementType: $5 } }; }
    | IDENTIFICADOR
        { $$ = { type: 'StructType', name: $1 }; }
    ;

/* ── Bloque de sentencias ──────────────────────────────────────── */
sentencias
    : sentencias sentencia
        { $1.push($2); $$ = $1; }
    | /* vacío */
        { $$ = []; }
    ;

sentencia
    : declaracion_variable
        { $$ = $1; }
    | asignacion
        { $$ = $1; }
    | llamada_funcion
        { $$ = $1; }
    | sentencia_if
        { $$ = $1; }
    | sentencia_switch
        { $$ = $1; }
    | sentencia_for
        { $$ = $1; }
    | sentencia_break
        { $$ = $1; }
    | sentencia_continue
        { $$ = $1; }
    | sentencia_return
        { $$ = $1; }
    | bloque_independiente
        { $$ = $1; }
    | incremento_decremento
        { $$ = $1; }
    ;

/* Declaración de variables */
declaracion_variable
    : VAR IDENTIFICADOR tipo IGUAL expresion
        { $$ = { type: 'VarDecl', name: $2, dataType: $3, value: $5, loc: loc(@1) }; }
    | VAR IDENTIFICADOR tipo
        { $$ = { type: 'VarDecl', name: $2, dataType: $3, value: null, loc: loc(@1) }; }
    | IDENTIFICADOR DECL_SHORT expresion
        { $$ = { type: 'ShortVarDecl', name: $1, value: $3, loc: loc(@1) }; }
    | VAR IDENTIFICADOR CORCHETE_A CORCHETE_C tipo
        { $$ = { type: 'VarDecl', name: $2, dataType: { type: 'SliceType', elementType: $5 }, value: null, loc: loc(@1) }; }
    | IDENTIFICADOR IDENTIFICADOR IGUAL PARENTESIS_A campos_struct_init PARENTESIS_C
        { $$ = { type: 'StructInstance', structName: $1, varName: $2, fields: $5, loc: loc(@1) }; }
    ;

/* Asignación de variables */
asignacion
    : IDENTIFICADOR IGUAL expresion
        { $$ = { type: 'Assignment', name: $1, value: $3, loc: loc(@1) }; }
    | IDENTIFICADOR MAS_IGUAL expresion
        { $$ = { type: 'CompoundAssign', name: $1, operator: '+=', value: $3, loc: loc(@1) }; }
    | IDENTIFICADOR MENOS_IGUAL expresion
        { $$ = { type: 'CompoundAssign', name: $1, operator: '-=', value: $3, loc: loc(@1) }; }
    | IDENTIFIER IGUAL llamada_funcion_expr
        { $$ = { type: 'Assignment', name: $1, value: $3, loc: loc(@1) }; }
    | IDENTIFIER LBRACKET expresion RBRACKET EQUALS expresion
        { $$ = { type: 'SliceAssign', name: $1, index: $3, value: $6, loc: loc(@1) }; }
    | IDENTIFIER LBRACKET expresion RBRACKET LBRACKET expresion RBRACKET EQUALS expresion
        { $$ = { type: 'MatrixAssign', name: $1, row: $3, col: $6, value: $9, loc: loc(@1) }; }
    | acceso_atributo EQUALS expresion
        { $$ = { type: 'AttrAssign', target: $1, value: $3, loc: loc(@1) }; }
    | IDENTIFIER EQUALS APPEND LPAREN IDENTIFIER COMMA expresion RPAREN
        { $$ = { type: 'AppendAssign', target: $1, slice: $5, value: $7, loc: loc(@1) }; }
    | IDENTIFIER EQUALS APPEND LPAREN IDENTIFIER COMMA IDENTIFIER RPAREN
        { $$ = { type: 'AppendAssign', target: $1, slice: $5, value: { type: 'Identifier', name: $7, loc: loc(@7) }, loc: loc(@1) }; }
    ;

/* Incremento y decremento */
incremento_decremento
    : IDENTIFIER PLUS_PLUS
        { $$ = { type: 'Increment', name: $1, loc: loc(@1) }; }
    | IDENTIFIER MINUS_MINUS
        { $$ = { type: 'Decrement', name: $1, loc: loc(@1) }; }
    ;

/* Inicialización de campos de struct */
campos_struct_init
    : campos_struct_init COMA campo_struct_init
        { $1.push($3); $$ = $1; }
    | campo_struct_init
        { $$ = [$1]; }
    ;

campo_struct_init
    : IDENTIFICADOR DOS_PUNTOS expresion
        { $$ = { type: 'FieldInit', name: $1, value: $3, loc: loc(@1) }; }
    | IDENTIFIER DOS_PUNTOS PARENTESIS_A campos_struct_init PARENTESIS_C
        { $$ = { type: 'FieldInit', name: $1, value: { type: 'StructLiteral', fields: $4, loc: loc(@3) }, loc: loc(@1) }; }
    ;


/* Sentencia IF / ELSE IF / ELSE */
sentencia_if
    : IF expresion LBRACE sentencias RBRACE
        { $$ = { type: 'IfStmt', condition: $2, body: $4, elseBody: null, loc: loc(@1) }; }
    | IF expresion LBRACE sentencias RBRACE ELSE LBRACE sentencias RBRACE
        { $$ = { type: 'IfStmt', condition: $2, body: $4, elseBody: $8, loc: loc(@1) }; }
    | IF expresion LBRACE sentencias RBRACE ELSE sentencia_if
        { $$ = { type: 'IfStmt', condition: $2, body: $4, elseBody: [$7], loc: loc(@1) }; }
    | IF LPAREN expresion RPAREN LBRACE sentencias RBRACE
        { $$ = { type: 'IfStmt', condition: $3, body: $6, elseBody: null, loc: loc(@1) }; }
    | IF LPAREN expresion RPAREN LBRACE sentencias RBRACE ELSE LBRACE sentencias RBRACE
        { $$ = { type: 'IfStmt', condition: $3, body: $6, elseBody: $10, loc: loc(@1) }; }
    | IF LPAREN expresion RPAREN LBRACE sentencias RBRACE ELSE sentencia_if
        { $$ = { type: 'IfStmt', condition: $3, body: $6, elseBody: [$9], loc: loc(@1) }; }
    ;

/* Sentencia SWITCH / CASE */
sentencia_switch
    : SWITCH expresion LBRACE casos_switch RBRACE
        { $$ = { type: 'SwitchStmt', discriminant: $2, cases: $4, loc: loc(@1) }; }
    ;

casos_switch
    : casos_switch caso_switch
        { $1.push($2); $$ = $1; }
    | caso_switch
        { $$ = [$1]; }
    ;

caso_switch
    : CASE expresion COLON sentencias
        { $$ = { type: 'CaseClause', test: $2, body: $4, loc: loc(@1) }; }
    | DEFAULT COLON sentencias
        { $$ = { type: 'DefaultClause', body: $3, loc: loc(@1) }; }
    ;

/* Sentencia FOR */
sentencia_for
    : FOR expresion LBRACE sentencias RBRACE
        { $$ = { type: 'ForWhile', condition: $2, body: $4, loc: loc(@1) }; }
    | FOR for_init SEMICOLON expresion SEMICOLON for_update LBRACE sentencias RBRACE
        { $$ = { type: 'ForClassic', init: $2, condition: $4, update: $6, body: $8, loc: loc(@1) }; }
    | FOR IDENTIFIER COMMA IDENTIFIER DECL_SHORT RANGE expresion LBRACE sentencias RBRACE
        { $$ = { type: 'ForRange', index: $2, value: $4, iterable: $7, body: $9, loc: loc(@1) }; }
    | FOR IDENTIFIER COMMA IDENTIFIER DECL_SHORT RANGE IDENTIFIER LBRACE sentencias RBRACE
        { $$ = { type: 'ForRange', index: $2, value: $4, iterable: { type: 'Identifier', name: $7, loc: loc(@7) }, body: $9, loc: loc(@1) }; }
    ;

for_init
    : IDENTIFIER DECL_SHORT expresion
        { $$ = { type: 'ShortVarDecl', name: $1, value: $3, loc: loc(@1) }; }
    | VAR IDENTIFIER tipo EQUALS expresion
        { $$ = { type: 'VarDecl', name: $2, dataType: $3, value: $5, loc: loc(@1) }; }
    | IDENTIFIER EQUALS expresion
        { $$ = { type: 'Assignment', name: $1, value: $3, loc: loc(@1) }; }
    ;

for_update
    : IDENTIFIER PLUS_PLUS
        { $$ = { type: 'Increment', name: $1, loc: loc(@1) }; }
    | IDENTIFIER MINUS_MINUS
        { $$ = { type: 'Decrement', name: $1, loc: loc(@1) }; }
    | IDENTIFIER PLUS_EQ expresion
        { $$ = { type: 'CompoundAssign', name: $1, operator: '+=', value: $3, loc: loc(@1) }; }
    | IDENTIFIER MINUS_EQ expresion
        { $$ = { type: 'CompoundAssign', name: $1, operator: '-=', value: $3, loc: loc(@1) }; }
    | IDENTIFIER EQUALS expresion
        { $$ = { type: 'Assignment', name: $1, value: $3, loc: loc(@1) }; }
    ;

/* ── Sentencias de transferencia ───────────────────────────────── */
sentencia_break
    : BREAK
        { $$ = { type: 'BreakStmt', loc: loc(@1) }; }
    ;

sentencia_continue
    : CONTINUE
        { $$ = { type: 'ContinueStmt', loc: loc(@1) }; }
    ;

sentencia_return
    : RETURN expresion
        { $$ = { type: 'ReturnStmt', value: $2, loc: loc(@1) }; }
    | RETURN
        { $$ = { type: 'ReturnStmt', value: null, loc: loc(@1) }; }
    ;

/* ── Bloque independiente (scope) ──────────────────────────────── */
bloque_independiente
    : LBRACE sentencias RBRACE
        { $$ = { type: 'Block', body: $2, loc: loc(@1) }; }
    ;

/* ── Llamadas a funciones (como sentencia) ─────────────────────── */
llamada_funcion
    : FMT DOT PRINTLN LPAREN argumentos RPAREN
        { $$ = { type: 'PrintlnCall', args: $5, loc: loc(@1) }; }
    | FMT DOT PRINTLN LPAREN RPAREN
        { $$ = { type: 'PrintlnCall', args: [], loc: loc(@1) }; }
    | IDENTIFIER LPAREN argumentos RPAREN
        { $$ = { type: 'FuncCall', name: $1, args: $3, loc: loc(@1) }; }
    | IDENTIFIER LPAREN RPAREN
        { $$ = { type: 'FuncCall', name: $1, args: [], loc: loc(@1) }; }
    ;

/* ── Llamadas a funciones (como expresión) ─────────────────────── */
llamada_funcion_expr
    : IDENTIFIER LPAREN argumentos RPAREN
        { $$ = { type: 'FuncCallExpr', name: $1, args: $3, loc: loc(@1) }; }
    | IDENTIFIER LPAREN RPAREN
        { $$ = { type: 'FuncCallExpr', name: $1, args: [], loc: loc(@1) }; }
    | FMT DOT PRINTLN LPAREN argumentos RPAREN
        { $$ = { type: 'PrintlnCallExpr', args: $5, loc: loc(@1) }; }
    | STRCONV DOT ATOI LPAREN expresion RPAREN
        { $$ = { type: 'AtoiCall', arg: $5, loc: loc(@1) }; }
    | STRCONV DOT PARSEFLOAT LPAREN expresion RPAREN
        { $$ = { type: 'ParseFloatCall', arg: $5, loc: loc(@1) }; }
    | REFLECT DOT TYPEOF LPAREN expresion RPAREN
        { $$ = { type: 'TypeOfCall', arg: $5, loc: loc(@1) }; }
    | LEN LPAREN expresion RPAREN
        { $$ = { type: 'LenCall', arg: $3, loc: loc(@1) }; }
    | APPEND LPAREN IDENTIFIER COMMA expresion RPAREN
        { $$ = { type: 'AppendCall', slice: $3, value: $5, loc: loc(@1) }; }
    | SLICES DOT INDEX LPAREN IDENTIFIER COMMA expresion RPAREN
        { $$ = { type: 'SlicesIndexCall', slice: $5, value: $7, loc: loc(@1) }; }
    | STRINGS DOT JOIN LPAREN IDENTIFIER COMMA expresion RPAREN
        { $$ = { type: 'StringsJoinCall', slice: $5, separator: $7, loc: loc(@1) }; }
    ;

/* ── Argumentos ────────────────────────────────────────────────── */
argumentos
    : argumentos COMMA expresion
        { $1.push($3); $$ = $1; }
    | expresion
        { $$ = [$1]; }
    ;

/* ── Expresiones ───────────────────────────────────────────────── */
expresion
    : expresion PLUS expresion
        { $$ = { type: 'BinaryExpr', operator: '+', left: $1, right: $3, loc: loc(@1) }; }
    | expresion MINUS expresion
        { $$ = { type: 'BinaryExpr', operator: '-', left: $1, right: $3, loc: loc(@1) }; }
    | expresion TIMES expresion
        { $$ = { type: 'BinaryExpr', operator: '*', left: $1, right: $3, loc: loc(@1) }; }
    | expresion DIV expresion
        { $$ = { type: 'BinaryExpr', operator: '/', left: $1, right: $3, loc: loc(@1) }; }
    | expresion MOD expresion
        { $$ = { type: 'BinaryExpr', operator: '%', left: $1, right: $3, loc: loc(@1) }; }
    | expresion EQ_EQ expresion
        { $$ = { type: 'BinaryExpr', operator: '==', left: $1, right: $3, loc: loc(@1) }; }
    | expresion NOT_EQ expresion
        { $$ = { type: 'BinaryExpr', operator: '!=', left: $1, right: $3, loc: loc(@1) }; }
    | expresion LT expresion
        { $$ = { type: 'BinaryExpr', operator: '<', left: $1, right: $3, loc: loc(@1) }; }
    | expresion LTE expresion
        { $$ = { type: 'BinaryExpr', operator: '<=', left: $1, right: $3, loc: loc(@1) }; }
    | expresion GT expresion
        { $$ = { type: 'BinaryExpr', operator: '>', left: $1, right: $3, loc: loc(@1) }; }
    | expresion GTE expresion
        { $$ = { type: 'BinaryExpr', operator: '>=', left: $1, right: $3, loc: loc(@1) }; }
    | expresion AND expresion
        { $$ = { type: 'BinaryExpr', operator: '&&', left: $1, right: $3, loc: loc(@1) }; }
    | expresion OR expresion
        { $$ = { type: 'BinaryExpr', operator: '||', left: $1, right: $3, loc: loc(@1) }; }
    | NOT expresion
        { $$ = { type: 'UnaryExpr', operator: '!', operand: $2, loc: loc(@1) }; }
    | MINUS expresion %prec UMINUS
        { $$ = { type: 'UnaryExpr', operator: '-', operand: $2, loc: loc(@1) }; }
    | LPAREN expresion RPAREN
        { $$ = $2; }
    | llamada_funcion_expr
        { $$ = $1; }
    | acceso_slice
        { $$ = $1; }
    | acceso_atributo
        { $$ = $1; }
    | literal_slice
        { $$ = $1; }
    | literal
        { $$ = $1; }
    | IDENTIFIER
        { $$ = { type: 'Identifier', name: $1, loc: loc(@1) }; }
    ;

/* ── Acceso a elementos de slice ───────────────────────────────── */
acceso_slice
    : IDENTIFIER LBRACKET expresion RBRACKET
        { $$ = { type: 'SliceAccess', name: $1, index: $3, loc: loc(@1) }; }
    | IDENTIFIER LBRACKET expresion RBRACKET LBRACKET expresion RBRACKET
        { $$ = { type: 'MatrixAccess', name: $1, row: $3, col: $6, loc: loc(@1) }; }
    ;

/* ── Acceso a atributos de struct (dot notation) ───────────────── */
acceso_atributo
    : IDENTIFIER DOT IDENTIFIER
        { $$ = { type: 'AttrAccess', object: $1, attribute: $3, loc: loc(@1) }; }
    | acceso_atributo DOT IDENTIFIER
        { $$ = { type: 'AttrAccess', object: $1, attribute: $3, loc: loc(@1) }; }
    ;

/* ── Literal de slice ──────────────────────────────────────────── */
literal_slice
    : LBRACKET RBRACKET tipo LBRACE lista_expresiones RBRACE
        { $$ = { type: 'SliceLiteral', elementType: $3, values: $5, loc: loc(@1) }; }
    | LBRACKET RBRACKET LBRACKET RBRACKET tipo LBRACE lista_filas RBRACE
        { $$ = { type: 'MatrixLiteral', elementType: $5, rows: $7, loc: loc(@1) }; }
    ;

lista_filas
    : lista_filas COMMA LBRACE lista_expresiones RBRACE
        { $1.push($4); $$ = $1; }
    | LBRACE lista_expresiones RBRACE
        { $$ = [$2]; }
    ;

lista_expresiones
    : lista_expresiones COMMA expresion
        { $1.push($3); $$ = $1; }
    | expresion
        { $$ = [$1]; }
    ;

/* ── Literales primitivos ──────────────────────────────────────── */
literal
    : LIT_INT
        { $$ = { type: 'IntLiteral', value: parseInt($1), loc: loc(@1) }; }
    | LIT_FLOAT
        { $$ = { type: 'FloatLiteral', value: parseFloat($1), loc: loc(@1) }; }
    | LIT_STRING
        { $$ = { type: 'StringLiteral', value: $1.slice(1, -1), loc: loc(@1) }; }
    | LIT_RUNE
        { $$ = { type: 'RuneLiteral', value: $1.slice(1, -1), loc: loc(@1) }; }
    | TRUE
        { $$ = { type: 'BoolLiteral', value: true, loc: loc(@1) }; }
    | FALSE
        { $$ = { type: 'BoolLiteral', value: false, loc: loc(@1) }; }
    | NIL
        { $$ = { type: 'NilLiteral', value: null, loc: loc(@1) }; }
    ;