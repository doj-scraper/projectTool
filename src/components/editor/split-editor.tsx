'use client';

import React, { useState, useCallback, useRef } from 'react';
import { CodeEditor } from './code-editor';
import { FileTabs } from './file-tabs';
import { useEditorStore } from '@/store/editor-store';
import { cn } from '@/lib/utils';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SplitEditorProps {
  className?: string;
}

export const SplitEditor = React.memo(function SplitEditor({ className }: SplitEditorProps) {
  const { 
    files, 
    activeFileId, 
    secondaryFileId,
    settings,
    setActiveFile,
    setSecondaryFile,
    isTerminalOpen,
    isOutputOpen,
  } = useEditorStore();

  const [activePane, setActivePane] = useState<'primary' | 'secondary'>('primary');
  const [splitPosition, setSplitPosition] = useState(50);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fileIds = Object.keys(files);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const isLargeScreen = window.innerWidth >= 1024;
    
    if (isLargeScreen) {
      // Horizontal split on lg screens
      const newPosition = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPosition(Math.min(80, Math.max(20, newPosition)));
    } else {
      // Vertical split on md screens
      const newPosition = ((e.clientY - rect.top) / rect.height) * 100;
      setSplitPosition(Math.min(80, Math.max(20, newPosition)));
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  React.useEffect(() => {
    if (isDragging.current) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Select a file for secondary pane if none selected
  React.useEffect(() => {
    if (settings.splitView && !secondaryFileId && fileIds.length > 1) {
      const otherFile = fileIds.find(id => id !== activeFileId);
      if (otherFile) {
        setSecondaryFile(otherFile);
      }
    }
  }, [settings.splitView, secondaryFileId, fileIds, activeFileId, setSecondaryFile]);

  if (!settings.splitView) {
    // Single pane mode
    return (
      <div className={cn("flex flex-col flex-1 overflow-hidden", className)}>
        <FileTabs variant="primary" />
        <div className="flex-1 overflow-hidden">
          <CodeEditor 
            fileId={activeFileId} 
            onFocus={() => setActivePane('primary')}
          />
        </div>
      </div>
    );
  }

  // Mobile: Show switch button instead of split
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  if (isMobile) {
    return (
      <div className={cn("flex flex-col flex-1 overflow-hidden", className)}>
        <div className="flex items-center justify-between px-2 py-1 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
          <span className="text-xs text-zinc-500">Pane: {activePane === 'primary' ? 'Primary' : 'Secondary'}</span>
          <button
            onClick={() => setActivePane(activePane === 'primary' ? 'secondary' : 'primary')}
            className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Switch Pane
          </button>
        </div>
        <FileTabs 
          variant="primary" 
          activeFileOverride={activePane === 'primary' ? activeFileId : secondaryFileId || undefined}
          onFileSelect={activePane === 'primary' ? setActiveFile : setSecondaryFile}
        />
        <div className="flex-1 overflow-hidden">
          <CodeEditor 
            fileId={activePane === 'primary' ? activeFileId : secondaryFileId || activeFileId} 
          />
        </div>
      </div>
    );
  }

  const isLargeScreen = typeof window !== 'undefined' && window.innerWidth >= 1024;

  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex flex-1 overflow-hidden",
        isLargeScreen ? "flex-row" : "flex-col",
        className
      )}
    >
      {/* Primary Pane */}
      <div 
        className="flex flex-col overflow-hidden"
        style={{ 
          [isLargeScreen ? 'width' : 'height']: `${splitPosition}%` 
        }}
      >
        <div className="hidden md:flex items-center gap-2 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
          <span className="text-xs text-zinc-500">Primary</span>
          <Select value={activeFileId} onValueChange={setActiveFile}>
            <SelectTrigger className="h-7 text-xs w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fileIds.map(id => (
                <SelectItem key={id} value={id} className="text-xs">
                  {files[id].name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <FileTabs variant="primary" />
        <div className="flex-1 overflow-hidden">
          <CodeEditor 
            fileId={activeFileId} 
            onFocus={() => setActivePane('primary')}
          />
        </div>
      </div>

      {/* Resizer */}
      <div
        onMouseDown={handleMouseDown}
        className={cn(
          "flex-shrink-0 bg-zinc-200 dark:bg-zinc-700 hover:bg-blue-400 dark:hover:bg-blue-500 transition-colors cursor-col-resize",
          isLargeScreen ? "w-1" : "h-1 cursor-row-resize"
        )}
      />

      {/* Secondary Pane */}
      <div 
        className="flex flex-col overflow-hidden"
        style={{ 
          [isLargeScreen ? 'width' : 'height']: `${100 - splitPosition}%` 
        }}
      >
        <div className="hidden md:flex items-center gap-2 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
          <span className="text-xs text-zinc-500">Secondary</span>
          <Select 
            value={secondaryFileId || activeFileId} 
            onValueChange={setSecondaryFile}
          >
            <SelectTrigger className="h-7 text-xs w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fileIds.map(id => (
                <SelectItem key={id} value={id} className="text-xs">
                  {files[id].name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <FileTabs variant="secondary" />
        <div className="flex-1 overflow-hidden">
          <CodeEditor 
            fileId={secondaryFileId || activeFileId} 
            onFocus={() => setActivePane('secondary')}
          />
        </div>
      </div>
    </div>
  );
});
