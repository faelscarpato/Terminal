import { X, Moon, Sun, Type } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Preferences</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Theme */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Theme</label>
            <div className="flex gap-2">
              <button 
                onClick={() => updateSettings({ theme: 'light' })}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${settings.theme === 'light' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
              >
                <Sun size={18} /> Light
              </button>
              <button 
                onClick={() => updateSettings({ theme: 'dark' })}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${settings.theme === 'dark' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
              >
                <Moon size={18} /> Dark
              </button>
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <Type size={16} /> Editor Font Size
            </label>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="10" 
                max="24" 
                step="1" 
                value={settings.fontSize} 
                onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value, 10) })}
                className="flex-1 accent-emerald-500"
              />
              <span className="w-8 text-center text-sm font-mono text-zinc-500">{settings.fontSize}px</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
