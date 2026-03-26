/**
 * Ejecuta código JavaScript y captura todo lo que se envía a console.
 * Devuelve un array de objetos { type, text } que representan cada línea de output.
 *
 * @param {string} code - El código JS a ejecutar
 * @returns {Array<{ type: string, text: string }>}
 */
export function runCode(code) {
  const logs = [{ type: "sys", text: "▸  Ejecutando..." }];
 
  // Guardamos las funciones originales de console para restaurarlas después
  const original = {
    log:   console.log,
    error: console.error,
    warn:  console.warn,
    info:  console.info,
  };
 
  // Convierte los argumentos del console a un string legible
  const format = (args) =>
    args
      .map((a) => (typeof a === "object" && a !== null ? JSON.stringify(a, null, 2) : String(a)))
      .join(" ");
 
  // Reemplazamos temporalmente los métodos de console para capturar el output
  console.log   = (...args) => logs.push({ type: "log",   text: format(args) });
  console.error = (...args) => logs.push({ type: "error", text: format(args) });
  console.warn  = (...args) => logs.push({ type: "warn",  text: format(args) });
  console.info  = (...args) => logs.push({ type: "info",  text: format(args) });
 
  try {
    // eslint-disable-next-line no-eval
    eval(code);
    logs.push({ type: "sys", text: "▸  Ejecución completada sin errores." });
  } catch (err) {
    logs.push({ type: "error", text: `×  ${err.name}: ${err.message}` });
  } finally {
    // Siempre restauramos console, incluso si hubo error
    Object.assign(console, original);
  }
 
  return logs;
}