import { useState, useEffect } from "react";
import { MONACO_CDN } from "../constants";

/**
 * Hook que carga Monaco Editor desde el CDN.
 * Devuelve `loaded = true` cuando Monaco ya está disponible en window.monaco.
 */
export function useMonaco() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Si Monaco ya fue cargado en una carga anterior, no volvemos a hacerlo
    if (window.monaco) {
      setLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `${MONACO_CDN}/loader.min.js`;

    script.onload = () => {
      window.require.config({ paths: { vs: MONACO_CDN } });
      window.require(["vs/editor/editor.main"], () => setLoaded(true));
    };

    document.head.appendChild(script);
  }, []);

  return { loaded };
}