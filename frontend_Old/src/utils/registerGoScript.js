import { GOSCRIPT_KEYWORDS, GOSCRIPT_SNIPPETS } from "../constants";
 
/**
 * registerGoScript
 * Registra GoScript como un lenguaje personalizado en Monaco Editor.
 * Llama esta función UNA sola vez, justo después de que Monaco cargue.
 *
 * Qué hace:
 * 1. Registra el lenguaje con el id "goscript"
 * 2. Define reglas de resaltado de sintaxis (tokenizer)
 * 3. Registra un CompletionItemProvider con keywords y snippets
 *
 * Cómo agregar más palabras:
 * → Ve a constants/index.js y agrega a GOSCRIPT_KEYWORDS o GOSCRIPT_SNIPPETS
 */
export function registerGoScript(monaco) {
  // Evitamos registrar el lenguaje dos veces si el componente re-monta
  const already = monaco.languages.getLanguages().some((l) => l.id === "goscript");
  if (already) return;
 
  // ── 1. Registrar el lenguaje ──────────────────────────────────
  monaco.languages.register({ id: "goscript", extensions: [".gst"] });
 
  // ── 2. Resaltado de sintaxis (tokenizer) ──────────────────────
  // Define colores para keywords, strings, comentarios y números.
  monaco.languages.setMonarchTokensProvider("goscript", {
    keywords: GOSCRIPT_KEYWORDS,
 
    tokenizer: {
      root: [
        // Comentarios de línea
        [/\/\/.*$/, "comment"],
 
        // Comentarios de bloque
        [/\/\*/, "comment", "@blockComment"],
 
        // Strings con comillas dobles
        [/"([^"\\]|\\.)*$/, "string.invalid"],
        [/"/, "string", "@string"],
 
        // Números enteros y decimales
        [/\d+\.\d*/, "number.float"],
        [/\d+/, "number"],
 
        // Keywords y identificadores
        [/[a-zA-Z_]\w*/, {
          cases: {
            "@keywords": "keyword",
            "@default":  "identifier",
          },
        }],
 
        // Operadores y puntuación
        [/[{}()\[\]]/, "delimiter"],
        [/[=+\-*/<>!&|;,.]/, "operator"],
      ],
 
      blockComment: [
        [/[^/*]+/, "comment"],
        [/\*\//, "comment", "@pop"],
        [/[/*]/, "comment"],
      ],
 
      string: [
        [/[^\\"]+/, "string"],
        [/\\./, "string.escape"],
        [/"/, "string", "@pop"],
      ],
    },
  });
 
  // ── 3. Autocompletado ─────────────────────────────────────────
  // Monaco llama a provideCompletionItems cada vez que el usuario
  // escribe. Devolvemos la lista de sugerencias.
  monaco.languages.registerCompletionItemProvider("goscript", {
    provideCompletionItems: (model, position) => {
      const word  = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber:   position.lineNumber,
        startColumn:     word.startColumn,
        endColumn:       word.endColumn,
      };
 
      // Sugerencias de keywords
      const keywordSuggestions = GOSCRIPT_KEYWORDS.map((kw) => ({
        label:            kw,
        kind:             monaco.languages.CompletionItemKind.Keyword,
        insertText:       kw,
        range,
      }));
 
      // Sugerencias de snippets (bloques de código)
      const snippetSuggestions = GOSCRIPT_SNIPPETS.map((snip) => ({
        label:            snip.label,
        kind:             monaco.languages.CompletionItemKind.Snippet,
        detail:           snip.detail,
        insertText:       snip.insertText,
        insertTextRules:  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range,
      }));
 
      return { suggestions: [...keywordSuggestions, ...snippetSuggestions] };
    },
  });
}