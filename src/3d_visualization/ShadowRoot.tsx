import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
// @ts-ignore
import tailwindCss from "./shadow-tailwind.css";

export function ShadowRoot({ children }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;

    const root = hostRef.current.attachShadow({ mode: "open" });

    console.log({tailwindCss})

    // Inject Tailwind ONLY here
    const style = document.createElement("style");
    style.textContent = tailwindCss;
    root.appendChild(style);

    setShadowRoot(root);
  }, []);

  return (
    <div ref={hostRef} style={{height: '100%', width: '100%', position: 'relative'}}>
      {shadowRoot && createPortal(children, shadowRoot)}
    </div>
  );
}