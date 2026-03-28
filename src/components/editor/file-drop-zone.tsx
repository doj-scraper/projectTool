'use client';

import React, { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';
import { useEditorStore } from '@/store/editor-store';
import { cn } from '@/lib/utils';

interface FileDropZoneProps {
  children: React.ReactNode;
}

export const FileDropZone = React.memo(function FileDropZone({ children }: FileDropZoneProps) {
  const { importFile } = useEditorStore();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        importFile(file.name, content);
      };
      reader.readAsText(file);
    });
  }, [importFile]);

  return (
    <div
      className="relative w-full h-full"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
      
      {/* Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-blue-500/10 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl p-8 border-2 border-dashed border-blue-500">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Upload size={32} className="text-blue-500" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                  Drop files here
                </p>
                <p className="text-sm text-zinc-500">
                  Files will be opened as new tabs
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
