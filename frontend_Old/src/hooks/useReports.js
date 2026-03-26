import { useState } from "react";
 
/**
 * useReports
 * Maneja el estado de los tres reportes del panel derecho.
 *
 * errors:  Array<{ line, col, type, message }>
 * symbols: Array<{ name, type, scope, line }>
 * ast:     Object | null  (nodo raíz del AST)
 *
 * En esta versión los reportes son placeholders visuales.
 * Cuando integres tu parser de GoScript (Go → JS via WASM o API),
 * llama a setErrors / setSymbols / setAst con los datos reales.
 */
export function useReports() {
  const [errors, setErrors]   = useState([]);
  const [symbols, setSymbols] = useState([]);
  const [ast, setAst]         = useState(null);
 
  // Limpia todos los reportes (útil antes de cada ejecución)
  const clearReports = () => {
    setErrors([]);
    setSymbols([]);
    setAst(null);
  };
 
  return {
    errors,  setErrors,
    symbols, setSymbols,
    ast,     setAst,
    clearReports,
  };
}
 