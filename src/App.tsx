/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useRef } from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebContainer, WebContainerProcess } from '@webcontainer/api';

import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { TerminalComponent } from './components/TerminalComponent';
import { EditorComponent } from './components/EditorComponent';
import { Sidebar } from './components/Sidebar';
import { SettingsModal } from './components/SettingsModal';
import { getWebContainer } from './lib/webcontainer';
import { loadFileSystemState, defaultFiles } from './lib/fs-utils';

function IDE() {
  const [wc, setWc] = useState<WebContainer | null>(null);
  const [activeFile, setActiveFile] = useState<string>('/index.js');
  const [fileContent, setFileContent] = useState<string>('');
  const [isBooting, setIsBooting] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const termRef = useRef<{ term: Terminal; fitAddon: FitAddon } | null>(null);
  const shellProcess = useRef<WebContainerProcess | null>(null);

  useEffect(() => {
    async function boot() {
      try {
        const container = await getWebContainer();
        setWc(container);
        
        const savedState = await loadFileSystemState();
        if (savedState) {
          await container.mount(savedState);
        } else {
          await container.mount(defaultFiles);
        }
        
        setIsBooting(false);
      } catch (err) {
        console.error("Boot error", err);
      }
    }
    boot();
  }, []);

  useEffect(() => {
    if (!wc) return;
    const loadContent = async () => {
      try {
        const content = await wc.fs.readFile(activeFile, 'utf-8');
        setFileContent(content);
      } catch (e) {
        setFileContent('');
      }
    };
    loadContent();
  }, [wc, activeFile]);

  useEffect(() => {
    if (!wc || !termRef.current) return;
    
    let process: WebContainerProcess;
    
    async function startShell() {
      process = await wc!.spawn('jsh', {
        terminal: {
          cols: termRef.current!.term.cols,
          rows: termRef.current!.term.rows,
        },
      });
      
      shellProcess.current = process;

      process.output.pipeTo(
        new WritableStream({
          write(data) {
            termRef.current?.term.write(data);
          },
        })
      );

      const input = process.input.getWriter();
      termRef.current!.term.onData((data) => {
        input.write(data);
      });
    }

    startShell();
    
    return () => {
      process?.kill();
    };
  }, [wc]);

  const handleEditorChange = async (value: string | undefined) => {
    const val = value || '';
    setFileContent(val);
    if (wc && activeFile) {
      await wc.fs.writeFile(activeFile, val);
    }
  };

  const handleRun = async () => {
    if (!wc || !termRef.current) return;
    if (shellProcess.current) {
      const input = shellProcess.current.input.getWriter();
      await input.write('npm run start\r');
      input.releaseLock();
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden font-sans">
      <Group orientation="horizontal">
        <Panel defaultSize={20} minSize={15} maxSize={30}>
          <Sidebar 
            wc={wc} 
            activeFile={activeFile} 
            onFileSelect={setActiveFile} 
            onRun={handleRun}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        </Panel>

        <Separator className="w-1 bg-zinc-200 dark:bg-zinc-800 hover:bg-emerald-500 dark:hover:bg-emerald-500 transition-colors cursor-col-resize" />

        <Panel defaultSize={80}>
          <Group orientation="vertical">
            <Panel defaultSize={60} minSize={20}>
              {isBooting ? (
                <div className="flex items-center justify-center h-full text-zinc-500">
                  Booting WebContainer environment...
                </div>
              ) : (
                <EditorComponent 
                  value={fileContent}
                  language={activeFile.endsWith('.js') ? 'javascript' : activeFile.endsWith('.json') ? 'json' : 'plaintext'}
                  onChange={handleEditorChange}
                />
              )}
            </Panel>

            <Separator className="h-1 bg-zinc-200 dark:bg-zinc-800 hover:bg-emerald-500 dark:hover:bg-emerald-500 transition-colors cursor-row-resize" />

            <Panel defaultSize={40} minSize={20}>
              <div className="h-full bg-[#09090b] relative">
                <TerminalComponent 
                  onTerminalReady={(term, fitAddon) => {
                    termRef.current = { term, fitAddon };
                  }}
                />
              </div>
            </Panel>
          </Group>
        </Panel>
      </Group>

      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <IDE />
    </SettingsProvider>
  );
}
