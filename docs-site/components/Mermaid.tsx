'use client';

import { useEffect, useId, useRef } from 'react';

interface MermaidProps {
  chart: string;
}

/**
 * Client-side Mermaid diagram renderer.
 * Import in MDX files:
 *   import { Mermaid } from '../components/Mermaid'
 */
export function Mermaid({ chart }: MermaidProps) {
  const id = useId().replace(/:/g, '');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    import('mermaid').then(({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: 'system-ui, sans-serif',
        fontSize: 14,
      });

      const diagramId = `mermaid-${id}`;
      mermaid
        .render(diagramId, chart.trim())
        .then(({ svg }) => {
          if (ref.current) {
            ref.current.innerHTML = svg;
            // Make SVG responsive
            const svgEl = ref.current.querySelector('svg');
            if (svgEl) {
              svgEl.style.maxWidth = '100%';
              svgEl.removeAttribute('height');
            }
          }
        })
        .catch((err) => {
          if (ref.current) {
            ref.current.innerHTML = `<pre style="color:red">Mermaid error: ${String(err)}</pre>`;
          }
        });
    });
  }, [chart, id]);

  return (
    <div
      ref={ref}
      className="my-6 overflow-x-auto rounded-lg border border-gray-200 p-4 dark:border-gray-700"
      aria-label="Architecture diagram"
    />
  );
}
