'use client';

import React, { useRef, useCallback } from 'react';
import { 
  File, 
  Copy, 
  Settings, 
  Download, 
  Upload, 
  Split,
  Terminal,
  Play,
  Command,
  Palette,
  Monitor,
  Smartphone
} from 'lucide-react';
import { useEditorStore } from '@/store/editor-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const getWordCount = (text: string) => {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
};

interface ToolbarProps {
  onImport: () => void;
  onExport: () => void;
  onToggleSplit: () => void;
}

export const Toolbar = React.memo(function Toolbar({ 
  onImport, 
  onExport,
  onToggleSplit 
}: ToolbarProps) {
  const { 
    files, 
    activeFileId, 
    settings, 
    setSettingsOpen,
    setCommandPaletteOpen,
    setTerminalOpen,
    setOutputOpen,
    isTerminalOpen,
    isOutputOpen,
    createFile
  } = useEditorStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeFile = files[activeFileId];

  const handleCopyAll = useCallback(() => {
    if (activeFile) {
      navigator.clipboard.writeText(activeFile.content);
    }
  }, [activeFile]);

  const handleNewFile = useCallback(() => {
    createFile();
  }, [createFile]);

  const handleRun = useCallback(() => {
    setOutputOpen(true);
  }, [setOutputOpen]);

  const handleImportClick = useCallback(() => {
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

  if (!activeFile) return null;

  return (
    <div className={cn(
      "flex items-center justify-between p-2 md:px-3 md:py-2 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 gap-2",
      settings.editorOnly && 'hidden'
    )}>
      {/* Left Actions */}
      <div className="flex items-center gap-1 overflow-x-auto">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNewFile}
                className="h-9 px-2 md:px-3"
              >
                <File size={16} className="md:mr-2" />
                <span className="hidden md:inline text-xs">New</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>New File</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyAll}
                className="h-9 px-2 md:px-3"
              >
                <Copy size={16} className="md:mr-2" />
                <span className="hidden md:inline text-xs">Copy</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy All</TooltipContent>
          </Tooltip>

          <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-700 mx-1 hidden md:block" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onImport}
                className="h-9 px-2 md:px-3"
              >
                <Upload size={16} className="md:mr-2" />
                <span className="hidden md:inline text-xs">Import</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Import File</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onExport}
                className="h-9 px-2 md:px-3"
              >
                <Download size={16} className="md:mr-2" />
                <span className="hidden md:inline text-xs">Export</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export File</TooltipContent>
          </Tooltip>

          <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-700 mx-1 hidden md:block" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleSplit}
                className={cn("h-9 px-2 md:px-3", settings.splitView && "text-blue-500")}
              >
                <Split size={16} className="md:mr-2" />
                <span className="hidden md:inline text-xs">Split</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Split View</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTerminalOpen(!isTerminalOpen)}
                className={cn("h-9 px-2 md:px-3", isTerminalOpen && "text-blue-500")}
              >
                <Terminal size={16} className="md:mr-2" />
                <span className="hidden md:inline text-xs">Terminal</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Terminal</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCommandPaletteOpen(true)}
                className="h-9 px-2 md:px-3"
              >
                <Command size={16} className="md:mr-2" />
                <span className="hidden md:inline text-xs">Commands</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Command Palette (⌘⇧P)</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center text-xs text-zinc-500 font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full h-7">
          <span>{getWordCount(activeFile.content)} words</span>
          <span className="mx-2">•</span>
          <span>{activeFile.content.length} chars</span>
        </div>

        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="sm"
                onClick={handleRun}
                className="h-9 px-3 bg-green-600 hover:bg-green-700"
              >
                <Play size={14} className="mr-1" />
                <span className="text-xs">Run</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Run Code</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSettingsOpen(true)}
          className="h-9 w-9"
        >
          <Settings size={18} />
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".js,.jsx,.ts,.tsx,.py,.html,.css,.json,.xml,.md,.go,.rs,.yaml,.yml,.sql,.sh,.php,.rb,.txt"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
});
