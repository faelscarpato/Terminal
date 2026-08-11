import Editor from '@monaco-editor/react';
import { useSettings } from '../contexts/SettingsContext';

interface EditorComponentProps {
  value: string;
  language: string;
  onChange: (value: string | undefined) => void;
}

export function EditorComponent({ value, language, onChange }: EditorComponentProps) {
  const { settings } = useSettings();

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800">
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language}
          value={value}
          onChange={onChange}
          theme={settings.theme === 'dark' ? 'vs-dark' : 'light'}
          options={{
            fontSize: settings.fontSize,
            minimap: { enabled: false },
            padding: { top: 16, bottom: 16 },
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            wordWrap: 'on',
            lineNumbersMinChars: 3,
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    </div>
  );
}
