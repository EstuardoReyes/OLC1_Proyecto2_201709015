%lex
%%
\s+        /* ignorar */
<<EOF>>    return 'EOF';
.          return 'INVALID';
/lex

%start program
%%
program
  : EOF { return {}; }
  ;