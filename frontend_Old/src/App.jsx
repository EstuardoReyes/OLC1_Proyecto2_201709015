import { IDE } from "./components/IDE";
 
/**
 * App — punto de entrada.
 * El CSS global elimina márgenes y scrollbars del body
 * para que el IDE ocupe el 100% de la pantalla.
 */
export default function App() {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; width: 100%; overflow: hidden; background: #1e1e1e; }
      `}</style>
      <IDE />
    </>
  );
}