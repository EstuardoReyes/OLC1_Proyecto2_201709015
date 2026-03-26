export const MONACO_CDN = "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs";
 
export const LOG_COLORS = {
  log:   "#d4d4d4",
  error: "#f09595",
  warn:  "#FAC775",
  info:  "#85B7EB",
  sys:   "#5F5E5A",
};
 
// Tabs del panel de reportes (derecha)
export const REPORT_TABS = ["Errores", "Símbolos", "AST"];
 
export const INITIAL_CODE = `// GoScript — Bienvenido
// Presiona ▶ Ejecutar o Ctrl+Enter para correr el código
 
func principal() {
  var x = 10;
  var y = 20;
  var suma = x + y;
  imprimir(suma);
}
 
principal();
`;
 
// ─── Keywords de GoScript ───────────────────────────────────────
// Agrega aquí todas las palabras reservadas de tu lenguaje.
// Monaco las usa para resaltar sintaxis y mostrar sugerencias.
export const GOSCRIPT_KEYWORDS = [
  "func", "var", "return", "if", "else", "for", "while",
  "true", "false", "null", "imprimir", "principal",
  // → Agrega más conforme defines tu gramática
];
 
// Snippets: bloques predefinidos que aparecen al autocompletar
export const GOSCRIPT_SNIPPETS = [
  {
    label: "func",
    detail: "Declarar función",
    insertText: "func ${1:nombre}(${2:params}) {\n\t${3}\n}",
  },
  {
    label: "if",
    detail: "Condicional if/else",
    insertText: "if (${1:condicion}) {\n\t${2}\n} else {\n\t${3}\n}",
  },
  {
    label: "for",
    detail: "Ciclo for",
    insertText: "for (${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t${3}\n}",
  },
  {
    label: "var",
    detail: "Declarar variable",
    insertText: "var ${1:nombre} = ${2:valor};",
  },
  // → Agrega más snippets de GoScript aquí
];