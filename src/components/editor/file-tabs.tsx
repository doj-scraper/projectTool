'use client';

import React, { useRef, useEffect } from 'react';
import { File, Plus, Trash2, X } from 'lucide-react';
import { useEditorStore } from '@/store/editor-store';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface FileTabsProps {
  variant?: 'primary' | 'secondary';
  activeFileOverride?: string;
  onFileSelect?: (id: string) => void;
}

export const FileTabs = React.memo(function FileTabs({ 
  variant = 'primary',
  activeFileOverride,
  onFileSelect 
}: FileTabsProps) {
  const { 
    files, 
    activeFileId, 
    secondaryFileId,
    renamingFileId,
    setActiveFile,
    setSecondaryFile,
    deleteFile,
    renameFile,
    setRenamingFile,
    createFile,
    settings,
  } = useEditorStore();

  const tabContainerRef = useRef<HTMLDivElement>(null);
  const currentFileId = activeFileOverride ?? (variant === 'primary' ? activeFileId : secondaryFileId);
  const setCurrentFileId = onFileSelect ?? (variant === 'primary' ? setActiveFile : setSecondaryFile);

  const fileIds = Object.keys(files);

  // Scroll active tab into view
  useEffect(() => {
    if (tabContainerRef.current && currentFileId) {
      const activeTab = document.getElementById(`tab-${currentFileId}-${variant}`);
      if (activeTab) {
        activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentFileId, variant]);

  const handleDeleteFile = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (Object.keys(files).length <= 1) {
      return;
    }
    deleteFile(id);
  };

  const handleRenameFile = (id: string, newName: string) => {
    if (!newName.trim()) {
      setRenamingFile(null);
      return;
    }
    renameFile(id, newName);
  };

  const handleCreateFile = () => {
    createFile();
  };

  return (
    <div 
      ref={tabContainerRef}
      className="flex overflow-x-auto border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {fileIds.map(id => {
        const file = files[id];
        const isActive = id === currentFileId;
        const isEditing = renamingFileId === id;

        return (
          <div
            key={id}
            id={`tab-${id}-${variant}`}
            onClick={() => setCurrentFileId(id)}
            className={cn(
              "group flex items-center min-w-[100px] max-w-[180px] h-10 px-3 border-r border-zinc-200 dark:border-zinc-800 cursor-pointer select-none transition-colors flex-shrink-0",
              isActive 
                ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 border-t-2 border-t-blue-500' 
                : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-t-2 border-t-transparent'
            )}
          >
            {isEditing ? (
              <Input
                autoFocus
                className="w-full h-6 bg-transparent border-b border-blue-500 outline-none text-xs font-medium px-0 py-0"
                defaultValue={file.name}
                onBlur={(e) => handleRenameFile(id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRenameFile(id, e.currentTarget.value);
                  }
                  if (e.key === 'Escape') {
                    setRenamingFile(null);
                  }
                  e.stopPropagation();
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <>
                <File size={14} className="mr-2 flex-shrink-0 text-zinc-400" />
                <span 
                  className="truncate text-xs font-medium flex-1" 
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setRenamingFile(id);
                  }}
                >
                  {file.name}
                </span>
                <button
                  onClick={(e) => handleDeleteFile(e, id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500 transition-all min-h-[24px] min-w-[24px] flex items-center justify-center ml-1"
                  aria-label="Delete file"
                >
                  <X size={12} />
                </button>
              </>
            )}
          </div>
        );
      })}
      
      {/* Desktop New Button */}
      <button
        onClick={handleCreateFile}
        className="hidden md:flex items-center justify-center min-w-[40px] h-10 px-2 text-zinc-400 hover:text-blue-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border-r border-zinc-200 dark:border-zinc-800 flex-shrink-0"
        aria-label="New File"
      >
        <Plus size={16} />
      </button>
    </div>
  );
});
