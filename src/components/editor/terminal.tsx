'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { useEditorStore } from '@/store/editor-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

export const Terminal = React.memo(function Terminal() {
  const { 
    isTerminalOpen, 
    setTerminalOpen,
    terminalLines,
    addTerminalLine,
    clearTerminal,
    addToTerminalHistory,
    navigateTerminalHistory,
    files,
    terminalHistoryIndex,
  } = useEditorStore();

  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [height, setHeight] = useState(300);

  // Scroll to bottom on new output
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [terminalLines]);

  // Focus input when terminal opens
  useEffect(() => {
    if (isTerminalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isTerminalOpen]);

  // Handle drag to resize
  const handleDragStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStartY(clientY);
  }, []);

  const handleDragMove = useCallback((e: TouchEvent | MouseEvent) => {
    if (!isDragging) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const delta = dragStartY - clientY;
    setHeight(prev => Math.max(150, Math.min(600, prev + delta)));
    setDragStartY(clientY);
  }, [isDragging, dragStartY]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove);
      window.addEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  const processCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    addTerminalLine('input', `$ ${trimmed}`);
    addToTerminalHistory(trimmed);

    const parts = trimmed.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case 'echo':
        addTerminalLine('output', args.join(' '));
        break;
      case 'clear':
        clearTerminal();
        break;
      case 'date':
        addTerminalLine('output', new Date().toString());
        break;
      case 'help':
        addTerminalLine('output', `Available commands:
  echo <text>  - Print text
  clear        - Clear terminal
  date         - Show current date
  help         - Show this help
  ls           - List open files
  pwd          - Show current directory
  whoami       - Show current user`);
        break;
      case 'ls':
        const fileNames = Object.values(files).map(f => f.name).join('\n');
        addTerminalLine('output', fileNames || 'No files');
        break;
      case 'pwd':
        addTerminalLine('output', '/workspace');
        break;
      case 'whoami':
        addTerminalLine('output', 'developer');
        break;
      default:
        addTerminalLine('error', `Command not found: ${command}. Type 'help' for available commands.`);
    }
  }, [addTerminalLine, addToTerminalHistory, clearTerminal, files]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    processCommand(input);
    setInput('');
  }, [input, processCommand]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevCmd = navigateTerminalHistory('up');
      if (prevCmd) setInput(prevCmd);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextCmd = navigateTerminalHistory('down');
      setInput(nextCmd || '');
    }
  }, [navigateTerminalHistory]);

  // Swipe to close on mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch.clientY > window.innerHeight - 50) {
      setIsDragging(true);
      setDragStartY(touch.clientY);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const delta = touch.clientY - dragStartY;
    if (delta > 100) {
      setTerminalOpen(false);
      setIsDragging(false);
    }
  }, [isDragging, dragStartY, setTerminalOpen]);

  if (!isTerminalOpen) return null;

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 bg-zinc-900 border-t border-zinc-700 flex flex-col transition-all duration-200",
        isExpanded ? "h-[80vh]" : "",
        "md:relative md:z-auto"
      )}
      style={{ height: isExpanded ? undefined : height }}
    >
      {/* Drag Handle */}
      <div 
        className="h-2 bg-zinc-800 cursor-ns-resize flex items-center justify-center hidden md:flex"
        onMouseDown={handleDragStart}
      >
        <div className="w-12 h-1 bg-zinc-600 rounded-full" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-800 border-b border-zinc-700">
        <span className="text-xs font-medium text-zinc-400">Terminal</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-zinc-400 hover:text-white"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-zinc-400 hover:text-white"
            onClick={() => setTerminalOpen(false)}
          >
            <X size={14} />
          </Button>
        </div>
      </div>

      {/* Output */}
      <ScrollArea 
        ref={scrollRef}
        className="flex-1 p-3 font-mono text-sm overflow-auto"
      >
        {terminalLines.map((line) => (
          <div 
            key={line.id} 
            className={cn(
              "whitespace-pre-wrap mb-1",
              line.type === 'input' && "text-green-400",
              line.type === 'output' && "text-zinc-300",
              line.type === 'error' && "text-red-400"
            )}
          >
            {line.content}
          </div>
        ))}
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-2 bg-zinc-800 border-t border-zinc-700">
        <div className="flex items-center gap-2">
          <span className="text-green-400 font-mono">$</span>
          <Input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
            className="flex-1 bg-transparent border-0 text-white font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </form>
    </div>
  );
});
