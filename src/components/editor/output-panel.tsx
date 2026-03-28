'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { X, Play, Trash2, Maximize2, Minimize2, RefreshCw } from 'lucide-react';
import { useEditorStore } from '@/store/editor-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { isJsFile, isHtmlFile, isPythonFile } from './language-support';

export const OutputPanel = React.memo(function OutputPanel() {
  const { 
    isOutputOpen, 
    setOutputOpen,
    outputContent,
    outputType,
    clearOutput,
    setOutput,
    files,
    activeFileId,
  } = useEditorStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeFile = files[activeFileId];

  const executeCode = useCallback(() => {
    if (!activeFile) return;

    if (isHtmlFile(activeFile.name)) {
      // For HTML files, render in iframe
      setOutput(activeFile.content, 'html');
    } else if (isJsFile(activeFile.name)) {
      // For JS files, execute and capture console.log
      const logs: string[] = [];
      const errors: string[] = [];
      
      const sandboxCode = `
        (function() {
          const originalLog = console.log;
          const originalError = console.error;
          const originalWarn = console.warn;
          
          console.log = function(...args) {
            window.parent.postMessage({ type: 'log', args: args.map(a => 
              typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
            )}, '*');
          };
          console.error = function(...args) {
            window.parent.postMessage({ type: 'error', args: args.map(a => 
              typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
            )}, '*');
          };
          console.warn = function(...args) {
            window.parent.postMessage({ type: 'warn', args: args.map(a => 
              typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
            )}, '*');
          };
          
          try {
            ${activeFile.content}
          } catch(e) {
            window.parent.postMessage({ type: 'error', args: [e.message] }, '*');
          }
        })();
      `;

      // Create iframe for sandboxed execution
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.sandbox.add('allow-scripts');
      document.body.appendChild(iframe);

      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'log') {
          logs.push(event.data.args.join(' '));
        } else if (event.data.type === 'error') {
          errors.push(event.data.args.join(' '));
        } else if (event.data.type === 'warn') {
          logs.push('⚠️ ' + event.data.args.join(' '));
        }
      };

      window.addEventListener('message', handleMessage);
      
      try {
        iframe.contentDocument?.open();
        iframe.contentDocument?.write(`<script>${sandboxCode}</script>`);
        iframe.contentDocument?.close();
      } catch (e) {
        errors.push(String(e));
      }

      setTimeout(() => {
        window.removeEventListener('message', handleMessage);
        document.body.removeChild(iframe);
        
        if (errors.length > 0) {
          setOutput(`Error: ${errors.join('\n')}`, 'error');
        } else {
          setOutput(logs.join('\n') || 'Code executed successfully (no output)', 'success');
        }
      }, 100);
    } else if (isPythonFile(activeFile.name)) {
      setOutput('🐍 Python execution coming soon!\n\nFor now, you can use online Python interpreters like:\n- Replit\n- Python Tutor\n- Google Colab', 'success');
    } else {
      setOutput('This file type cannot be executed directly.\n\nSupported types:\n- JavaScript (.js, .jsx, .ts, .tsx)\n- HTML (.html, .htm)', 'success');
    }
  }, [activeFile, setOutput]);

  // Execute code when panel opens
  useEffect(() => {
    if (isOutputOpen && !outputContent) {
      executeCode();
    }
  }, [isOutputOpen]);

  if (!isOutputOpen) return null;

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-700 flex flex-col transition-all duration-200",
        isExpanded ? "h-[80vh]" : "h-[300px]",
        "md:relative md:z-auto md:border-t"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Output
          </span>
          {activeFile && (
            <span className="text-xs text-zinc-400">
              ({activeFile.name})
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={executeCode}
            title="Run Again"
          >
            <RefreshCw size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={clearOutput}
            title="Clear"
          >
            <Trash2 size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hidden md:flex"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Minimize" : "Maximize"}
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setOutputOpen(false)}
            title="Close"
          >
            <X size={14} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {outputType === 'html' ? (
          <iframe
            ref={iframeRef}
            srcDoc={outputContent}
            className="w-full h-full border-0 bg-white"
            sandbox="allow-scripts"
            title="HTML Preview"
          />
        ) : (
          <ScrollArea ref={scrollRef} className="h-full p-3">
            <pre 
              className={cn(
                "font-mono text-sm whitespace-pre-wrap",
                outputType === 'error' ? "text-red-500" : "text-zinc-800 dark:text-zinc-200"
              )}
            >
              {outputContent || 'No output'}
            </pre>
          </ScrollArea>
        )}
      </div>
    </div>
  );
});
