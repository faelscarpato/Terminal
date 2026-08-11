import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

export interface TerminalComponentProps {
  onTerminalReady?: (terminal: Terminal, fitAddon: FitAddon) => void;
}

export function TerminalComponent({ onTerminalReady }: TerminalComponentProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const termInstance = useRef<Terminal | null>(null);
  const fitAddonInstance = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      theme: {
        background: '#09090b', // Tailwind zinc-950
        foreground: '#f4f4f5', // Tailwind zinc-100
        cursor: '#f4f4f5',
        selectionBackground: '#3f3f46',
      },
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      fontSize: 14,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    
    // Delay fit to ensure container has dimensions
    requestAnimationFrame(() => {
      try {
        if (terminalRef.current && terminalRef.current.clientWidth > 0 && fitAddon.proposeDimensions()) {
          fitAddon.fit();
        }
      } catch (e) {}
    });

    termInstance.current = term;
    fitAddonInstance.current = fitAddon;

    if (onTerminalReady) {
      onTerminalReady(term, fitAddon);
    }

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        try {
          if (terminalRef.current && terminalRef.current.clientWidth > 0 && fitAddon.proposeDimensions()) {
            fitAddon.fit();
          }
        } catch (e) {}
      });
    });
    
    resizeObserver.observe(terminalRef.current);

    return () => {
      resizeObserver.disconnect();
      term.dispose();
    };
  }, [onTerminalReady]);

  return <div ref={terminalRef} className="w-full h-full overflow-hidden" />;
}
