import * as monaco from 'monaco-editor';
import { GOSCRIPT_KEYWORDS, GOSCRIPT_SNIPPETS } from '../constants/goscript.constants';

/**
 * registerGoScript
 * Registra GoScript como lenguaje en Monaco Editor (versión npm).
 * Llama esta función UNA sola vez antes de crear el editor.
 *
 * Hace tres cosas:
 * 1. Registra el id "goscript" con extensión .gst
 * 2. Define tokenizer para resaltado de sintaxis
 * 3. Registra CompletionItemProvider con keywords y snippets
 */
export function registerGoScript(): void {
  // Evitar registrar dos veces si el componente se re-monta
  const already = monaco.languages.getLanguages().some(l => l.id === 'goscript');
  if (already) return;

  // ── 1. Registrar lenguaje ─────────────────────────────────────
  monaco.languages.register({ id: 'goscript', extensions: ['.gst'] });

  // ── 2. Resaltado de sintaxis ──────────────────────────────────
  monaco.languages.setMonarchTokensProvider('goscript', {
    keywords: GOSCRIPT_KEYWORDS,

    tokenizer: {
      root: [
        [/\/\/.*$/,         'comment'],
        [/\/\*/,            'comment', '@blockComment'],
        [/"([^"\\]|\\.)*$/, 'string.invalid'],
        [/"/,               'string', '@string'],
        [/\d+\.\d*/,        'number.float'],
        [/\d+/,             'number'],
        [/[a-zA-Z_]\w*/, {
          cases: {
            '@keywords': 'keyword',
            '@default':  'identifier',
          }
        }],
        [/[{}()\[\]]/,      'delimiter'],
        [/[=+\-*/<>!&|;,.:]/, 'operator'],
      ],

      blockComment: [
        [/[^/*]+/, 'comment'],
        [/\*\//,   'comment', '@pop'],
        [/[/*]/,   'comment'],
      ],

      string: [
        [/[^\\"]+/, 'string'],
        [/\\./,     'string.escape'],
        [/"/,       'string', '@pop'],
      ],
    },
  } as monaco.languages.IMonarchLanguage);

  // ── 3. Autocompletado ─────────────────────────────────────────
  monaco.languages.registerCompletionItemProvider('goscript', {
    provideCompletionItems: (model, position) => {
      const word  = model.getWordUntilPosition(position);
      const range: monaco.IRange = {
        startLineNumber: position.lineNumber,
        endLineNumber:   position.lineNumber,
        startColumn:     word.startColumn,
        endColumn:       word.endColumn,
      };

      const keywordSuggestions: monaco.languages.CompletionItem[] = GOSCRIPT_KEYWORDS.map(kw => ({
        label:      kw,
        kind:       monaco.languages.CompletionItemKind.Keyword,
        insertText: kw,
        range,
      }));

      const snippetSuggestions: monaco.languages.CompletionItem[] = GOSCRIPT_SNIPPETS.map(s => ({
        label:           s.label,
        kind:            monaco.languages.CompletionItemKind.Snippet,
        detail:          s.detail,
        insertText:      s.insertText,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range,
      }));

      return { suggestions: [...keywordSuggestions, ...snippetSuggestions] };
    },
  });
}
