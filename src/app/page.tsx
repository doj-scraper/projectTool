'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import {
  SplitEditor,
  Toolbar,
  SettingsDrawer,
  CommandPalette,
  Terminal,
  OutputPanel,
  FileDropZone,
} from '@/components/editor';
import { useEditorStore } from '@/store/editor-store';
import { usePWAInstall } from '@/hooks/use-pwa-install';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EditorPage() {
  const {
    settings,
    updateSettings,
    files,
    activeFileId,
    createFile,
    isTerminalOpen,
    isOutputOpen,
    setCommandPaletteOpen,
  } = useEditorStore();

  const { installApp, isInstallPromptAvailable } = usePWAInstall();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Apply theme
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (settings.theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(settings.theme);
    }
  }, [settings.theme]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command Palette: Ctrl+Shift+P / Cmd+Shift+P
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      // Terminal: Ctrl+` / Cmd+`
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        useEditorStore.getState().setTerminalOpen(!isTerminalOpen);
      }
      // Run: Ctrl+Enter / Cmd+Enter
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        useEditorStore.getState().setOutputOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCommandPaletteOpen, isTerminalOpen]);

  // Handle file import
  const handleImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        useEditorStore.getState().importFile(file.name, content);
      };
      reader.readAsText(file);
      e.target.value = '';
    }
  }, []);

  // Handle file export
  const handleExport = useCallback(() => {
    const file = files[activeFileId];
    if (!file) return;

    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [files, activeFileId]);

  // Handle toggle split
  const handleToggleSplit = useCallback(() => {
    updateSettings({ splitView: !settings.splitView });
  }, [settings.splitView, updateSettings]);

  // Handle install app
  const handleInstallApp = useCallback(() => {
    installApp();
  }, [installApp]);

  return (
    <FileDropZone>
      <div
        className={cn(
          'flex flex-col h-screen w-full bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 transition-colors duration-200 overflow-hidden font-sans'
        )}
      >
        {/* Toolbar */}
        <Toolbar
          onImport={handleImport}
          onExport={handleExport}
          onToggleSplit={handleToggleSplit}
        />

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div
            className={cn(
              'flex-1 flex flex-col overflow-hidden',
              (isTerminalOpen || isOutputOpen) && 'md:flex-row'
            )}
          >
            {/* Editor */}
            <div
              className={cn(
                'flex-1 flex flex-col overflow-hidden',
                (isTerminalOpen || isOutputOpen) && 'md:flex-1'
              )}
            >
              <SplitEditor />
            </div>
          </div>

          {/* Terminal & Output Panels */}
          <div className="flex flex-col md:flex-row">
            {isOutputOpen && (
              <div className="flex-1 md:max-h-[400px]">
                <OutputPanel />
              </div>
            )}
            {isTerminalOpen && isOutputOpen && (
              <div className="w-full md:w-1 md:h-auto bg-zinc-200 dark:bg-zinc-700" />
            )}
            {isTerminalOpen && (
              <div className="flex-1 md:max-h-[300px]">
                <Terminal />
              </div>
            )}
          </div>
        </div>

        {/* Mobile FAB for New File */}
        {!settings.editorOnly && (
          <Button
            onClick={() => createFile()}
            className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg z-40 p-0"
            size="icon"
          >
            <Plus size={28} strokeWidth={2.5} />
          </Button>
        )}

        {/* Mobile FAB for Run */}
        <Button
          onClick={() => useEditorStore.getState().setOutputOpen(true)}
          className="md:hidden fixed bottom-6 left-6 w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg z-40 p-0"
          size="icon"
        >
          <span className="text-lg">▶</span>
        </Button>

        {/* Settings Drawer */}
        <SettingsDrawer />

        {/* Command Palette */}
        <CommandPalette
          onImport={handleImport}
          onExport={handleExport}
          onInstallApp={handleInstallApp}
        />

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".js,.jsx,.ts,.tsx,.py,.html,.css,.json,.xml,.md,.go,.rs,.yaml,.yml,.sql,.sh,.php,.rb,.txt"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </FileDropZone>
  );
}
