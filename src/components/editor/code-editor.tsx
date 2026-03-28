'use client';

import React, { useCallback, useRef, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { keymap } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { autocompletion, completionKeymap } from '@codemirror/autocomplete';
import { lintKeymap } from '@codemirror/lint';
import { useEditorStore } from '@/store/editor-store';
import { getLanguageFromFilename } from './language-support';
import { cn } from '@/lib/utils';

interface CodeEditorProps {
  fileId: string;
  className?: string;
  onFocus?: () => void;
}

export const CodeEditor = React.memo(function CodeEditor({ 
  fileId, 
  className,
  onFocus 
}: CodeEditorProps) {
  const { files, settings, updateFileContent } = useEditorStore();
  const file = files[fileId];
  const editorRef = useRef<HTMLDivElement>(null);

  const handleChange = useCallback((value: string) => {
    updateFileContent(fileId, value);
  }, [fileId, updateFileContent]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Command Palette shortcut: Ctrl+Shift+P / Cmd+Shift+P
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'P') {
      event.preventDefault();
      useEditorStore.getState().setCommandPaletteOpen(true);
    }
    // Terminal shortcut: Ctrl+` / Cmd+`
    if ((event.ctrlKey || event.metaKey) && event.key === '`') {
      event.preventDefault();
      useEditorStore.getState().setTerminalOpen(!useEditorStore.getState().isTerminalOpen);
    }
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener('keydown', handleKeyDown);
      return () => editor.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown]);

  if (!file) return null;

  return (
    <div 
      ref={editorRef}
      className={cn("h-full w-full overflow-hidden", className)}
      onFocus={onFocus}
    >
      <CodeMirror
        value={file.content}
        height="100%"
        theme={settings.theme === 'dark' ? 'dark' : 'light'}
        extensions={[
          getLanguageFromFilename(file.name),
          history(),
          keymap.of([
            ...defaultKeymap,
            ...historyKeymap,
            ...searchKeymap,
            ...completionKeymap,
            ...lintKeymap,
          ]),
          autocompletion(),
          highlightSelectionMatches(),
        ]}
        onChange={handleChange}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          foldGutter: true,
          drawSelection: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          syntaxHighlighting: true,
          bracketMatching: true,
          closeBrackets: true,
          rectangularSelection: true,
          crosshairCursor: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          defaultKeymap: true,
          searchKeymap: true,
          historyKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: true,
        }}
        style={{
          fontSize: `${settings.fontSize}px`,
          fontFamily: settings.fontFamily,
          height: '100%',
        }}
        className="h-full [&_.cm-editor]:h-full [&_.cm-scroller]:h-full [&_.cm-content]:min-h-full"
      />
    </div>
  );
});
