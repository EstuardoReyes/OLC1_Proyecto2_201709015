// ─── Código inicial que aparece al abrir el IDE ──────────────────
export const GOSCRIPT_INITIAL_CODE = `// ¡Bienvenido a GoScript IDE!
`;

// ─── Palabras reservadas del lenguaje GoScript ───────────────────
// Agrega aquí conforme defines tu gramática con Jison
export const GOSCRIPT_KEYWORDS = [
  'func', 'var', 'return', 'if', 'else', 'for', 'while',
  'true', 'false', 'nil', 'struct', 'break', 'continue',
  'int', 'float64', 'string', 'bool', 'rune',
  'fmt', 'Println', 'Print', 'Sprintf',
  // → Agrega más keywords conforme defines la gramática
];

// ─── Snippets: bloques predefinidos de GoScript ──────────────────
export const GOSCRIPT_SNIPPETS = [
  {
    label: 'func',
    detail: 'Declarar función',
    insertText: 'func ${1:nombre}(${2:params}) {\n\t${3}\n}',
  },
  {
    label: 'if',
    detail: 'Condicional if/else',
    insertText: 'if ${1:condicion} {\n\t${2}\n} else {\n\t${3}\n}',
  },
  {
    label: 'for',
    detail: 'Ciclo for',
    insertText: 'for ${1:i} := 0; ${1:i} < ${2:n}; ${1:i}++ {\n\t${3}\n}',
  },
  {
    label: 'var',
    detail: 'Declarar variable',
    insertText: 'var ${1:nombre} ${2:tipo} = ${3:valor};',
  },
  {
    label: 'struct',
    detail: 'Declarar struct',
    insertText: 'struct ${1:Nombre} {\n\t${2:campo} ${3:tipo};\n}',
  },
  {
    label: 'fmt.Println',
    detail: 'Imprimir línea',
    insertText: 'fmt.Println(${1:valor});',
  },
  // → Agrega más snippets aquí
];
