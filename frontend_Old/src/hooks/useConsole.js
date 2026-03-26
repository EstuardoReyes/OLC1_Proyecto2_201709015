import { useState } from "react";
 
const WELCOME_MESSAGE = {
  type: "sys",
  text: "▸  Console lista. Presiona Run o usa Ctrl+Enter para ejecutar.",
};
 
/**
 * Hook que maneja el estado de los mensajes de la consola.
 * Expone la lista de logs y una función para limpiarla.
 */
export function useConsole() {
  const [logs, setLogs] = useState([WELCOME_MESSAGE]);
 
  const appendLogs = (newLogs) => setLogs(newLogs);
 
  const clearLogs = () => setLogs([{ type: "sys", text: "▸  Console limpiada." }]);
 
  return { logs, appendLogs, clearLogs };
}
 