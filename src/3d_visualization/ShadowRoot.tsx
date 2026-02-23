import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
// @ts-ignore
import tailwindCss from "./shadow-tailwind.css";

function normalizeTailwind(styles: string): string {
  const css = styles.replace(/:root/g, ':host');

  // Extract @property declarations and hoist to document head,
  // because @property doesn't work inside Shadow DOM <style> elements.
  // https://github.com/tailwindlabs/tailwindcss/issues/15005
  const propertyRules: string[] = []
  const shadowCss = css.replace(/@property\s+[^{]+\{[^}]*\}/g, (match) => {
    propertyRules.push(match)
    return ''
  })

  if (propertyRules.length > 0) {
    const propStyle = document.createElement('style')
    propStyle.textContent = propertyRules.join('\n')
    document.head.appendChild(propStyle)
  }

  return shadowCss;
}

export function ShadowRoot({ children }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;

    const root = hostRef.current.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = normalizeTailwind(tailwindCss);
    root.appendChild(style);

    setShadowRoot(root);
  }, []);

  return (
    <div ref={hostRef} style={{height: '100%', width: '100%', position: 'relative'}}>
      {shadowRoot && createPortal(children, shadowRoot)}
    </div>
  );
}