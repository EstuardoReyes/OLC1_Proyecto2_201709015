import * as monaco from 'monaco-editor';
import { GOSCRIPT_KEYWORDS, GOSCRIPT_SNIPPETS } from '../constants/goscript.constants';

export function registerGoScript(): void {
  const already = monaco.languages.getLanguages().some(l => l.id === 'goscript');
  if (already) return;

  // ── 1. Registrar lenguaje ─────────────────────────────────────
  monaco.languages.register({ id: 'goscript', extensions: ['.gst'] });

  // ── 2. Resaltado de sintaxis ──────────────────────────────────
  monaco.languages.setMonarchTokensProvider('goscript', {
    keywords: GOSCRIPT_KEYWORDS,
    tokenizer: {
      root: [
        [/\/\/.*$/,            'comment'],
        [/\/\*/,               'comment', '@blockComment'],
        [/"([^"\\]|\\.)*$/,    'string.invalid'],
        [/"/,                  'string', '@string'],
        [/\d+\.\d*/,           'number.float'],
        [/\d+/,                'number'],
        [/[a-zA-Z_]\w*/, { cases: { '@keywords': 'keyword', '@default': 'identifier' } }],
        [/[{}()\[\]]/,         'delimiter'],
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

  // ── 3. Autocompletado — SOLO keywords y snippets de GoScript ──
  monaco.languages.registerCompletionItemProvider('goscript', {
    triggerCharacters: [], // sin trigger automático — se activa con Ctrl+Space

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
        sortText:   '0' + kw,
      }));

      const snippetSuggestions: monaco.languages.CompletionItem[] = GOSCRIPT_SNIPPETS.map(s => ({
        label:           s.label,
        kind:            monaco.languages.CompletionItemKind.Snippet,
        detail:          s.detail,
        insertText:      s.insertText,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range,
        sortText:        '1' + s.label,
      }));

      return {
        suggestions: [...keywordSuggestions, ...snippetSuggestions],
        incomplete:  false, // lista completa — Monaco no agrega nada más
      };
    },
  });
}