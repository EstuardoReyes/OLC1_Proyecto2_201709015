%lex
%%

\r|\n|\r\n                  /* saltar hotizontal */
/\/\/.*$/                   /* Comentario */
/\/\*/                      /* MultiComentario */

"int"                       return 'INTEGER';
"float64"                   return 'FLOAT';
"string"                    return 'STRING';
"bool"                      return 'BOOLEAN';
"rune"                      return 'RUNE';
"nil"                       return 'NULL';
"func"                      return 'FUNCION'
"main"                      return '


[a-zA-Z_][a-zA-Z0-9_]*      return 'VARIABLE';
[0-9]+                      return 'ENTERO';
[0-9]+"."[0-9]+             return 'DECIMAL'; 
                  


[a-zA-Z_][a-zA-Z0-9_]*      return "IDENTIFICADOR";

.   { console.error(...) }

/lex

%left '+' '-'
%left '*' '/'

%%

programa
    : sentencias EOF
        {return $1;}