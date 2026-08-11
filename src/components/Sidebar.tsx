import { useState, useEffect } from 'react';
import { Folder, File, Code, Settings, Download, Cloud, Play } from 'lucide-react';
import { WebContainer } from '@webcontainer/api';
import { exportToZip, saveFileSystemState } from '../lib/fs-utils';

interface SidebarProps {
  wc: WebContainer | null;
  activeFile: string;
  onFileSelect: (path: string) => void;
  onRun: () => void;
  onOpenSettings: () => void;
}

export function Sidebar({ wc, activeFile, onFileSelect, onRun, onOpenSettings }: SidebarProps) {
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    if (!wc) return;
    
    const loadFiles = async () => {
      const entries = await wc.fs.readdir('/', { withFileTypes: true });
      const fileList = entries
        .filter(e => e.isFile() || (e.isDirectory() && e.name !== 'node_modules' && e.name !== '.git'))
        .map(e => e.name)
        .sort((a, b) => {
          return a.localeCompare(b);
        });
      setFiles(fileList);
    };

    loadFiles();
  }, [wc]);

  return (
    <div className="w-full h-full bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col text-sm">
      <div className="p-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
          <Code size={16} />
          Project
        </h2>
        <button 
          onClick={onRun}
          className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded-md flex items-center gap-1 transition-colors"
        >
          <Play size={12} fill="currentColor" /> Run
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {files.map(file => (
          <button
            key={file}
            onClick={() => onFileSelect(`/${file}`)}
            className={`w-full text-left px-3 py-1.5 rounded-md flex items-center gap-2 transition-colors ${
              activeFile === `/${file}` 
                ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' 
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
            }`}
          >
            {file.includes('.') ? <File size={14} /> : <Folder size={14} />}
            {file}
          </button>
        ))}
        {files.length === 0 && (
          <div className="px-3 py-2 text-zinc-500 dark:text-zinc-500 italic">
            Loading project...
          </div>
        )}
      </div>

      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-around text-zinc-500 dark:text-zinc-400">
        <button 
          onClick={async () => {
            await saveFileSystemState();
            alert('Project state saved to local storage!');
          }}
          className="p-2 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          title="Save State (Cloud/Local)"
        >
          <Cloud size={16} />
        </button>
        <button 
          onClick={() => exportToZip()}
          className="p-2 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          title="Export as ZIP"
        >
          <Download size={16} />
        </button>
        <button 
          onClick={onOpenSettings}
          className="p-2 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors" 
          title="Settings"
        >
          <Settings size={16} />
        </button>
      </div>
    </div>
  );
}
