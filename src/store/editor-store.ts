import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// --- Types ---

export interface FileData {
  id: string;
  name: string;
  content: string;
  lastModified: number;
  scrollPosition?: number;
  cursorPosition?: { line: number; ch: number };
}

export interface EditorSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  fontFamily: string;
  editorOnly: boolean;
  splitView: boolean;
  splitDirection: 'horizontal' | 'vertical';
}

export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error';
  content: string;
  timestamp: number;
}

export interface EditorState {
  // Files
  files: Record<string, FileData>;
  activeFileId: string;
  secondaryFileId: string | null;
  
  // Settings
  settings: EditorSettings;
  
  // UI State
  isSettingsOpen: boolean;
  isCommandPaletteOpen: boolean;
  isTerminalOpen: boolean;
  terminalLines: TerminalLine[];
  terminalHistory: string[];
  terminalHistoryIndex: number;
  
  // Run Output
  isOutputOpen: boolean;
  outputContent: string;
  outputType: 'success' | 'error' | 'html';
  
  // PWA
  isInstallPromptAvailable: boolean;
  isAppInstalled: boolean;
  
  // Renaming
  renamingFileId: string | null;
  
  // Actions - Files
  setActiveFile: (id: string) => void;
  setSecondaryFile: (id: string | null) => void;
  createFile: (name?: string, content?: string) => string;
  updateFileContent: (id: string, content: string) => void;
  updateFileScroll: (id: string, position: number) => void;
  updateFileCursor: (id: string, position: { line: number; ch: number }) => void;
  deleteFile: (id: string) => void;
  renameFile: (id: string, name: string) => void;
  importFile: (name: string, content: string) => string;
  
  // Actions - Settings
  updateSettings: (settings: Partial<EditorSettings>) => void;
  
  // Actions - UI
  setSettingsOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setTerminalOpen: (open: boolean) => void;
  addTerminalLine: (type: 'input' | 'output' | 'error', content: string) => void;
  clearTerminal: () => void;
  addToTerminalHistory: (cmd: string) => void;
  navigateTerminalHistory: (direction: 'up' | 'down') => string | null;
  
  // Actions - Output
  setOutputOpen: (open: boolean) => void;
  setOutput: (content: string, type: 'success' | 'error' | 'html') => void;
  clearOutput: () => void;
  
  // Actions - PWA
  setInstallPromptAvailable: (available: boolean) => void;
  setAppInstalled: (installed: boolean) => void;
  
  // Actions - Renaming
  setRenamingFile: (id: string | null) => void;
}

// --- Constants ---

const DEFAULT_FILE: FileData = {
  id: 'default',
  name: 'untitled.js',
  content: `// Welcome to Code Editor!
// Start typing to auto-save.

console.log("Hello, World!");

function greet(name) {
  return \`Hello, \${name}!\`;
}

// Try running this code with the Run button!`,
  lastModified: Date.now(),
};

const DEFAULT_SETTINGS: EditorSettings = {
  theme: 'system',
  fontSize: 14,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  editorOnly: false,
  splitView: false,
  splitDirection: 'horizontal',
};

const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Store ---

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      // Initial State
      files: { 'default': DEFAULT_FILE },
      activeFileId: 'default',
      secondaryFileId: null,
      settings: DEFAULT_SETTINGS,
      isSettingsOpen: false,
      isCommandPaletteOpen: false,
      isTerminalOpen: false,
      terminalLines: [],
      terminalHistory: [],
      terminalHistoryIndex: -1,
      isOutputOpen: false,
      outputContent: '',
      outputType: 'success',
      isInstallPromptAvailable: false,
      isAppInstalled: false,
      renamingFileId: null,
      
      // File Actions
      setActiveFile: (id) => set({ activeFileId: id }),
      
      setSecondaryFile: (id) => set({ secondaryFileId: id }),
      
      createFile: (name, content) => {
        const id = generateId();
        const fileCount = Object.keys(get().files).length;
        const newFile: FileData = {
          id,
          name: name || `untitled.${fileCount + 1}.js`,
          content: content || '',
          lastModified: Date.now(),
        };
        set((state) => ({
          files: { ...state.files, [id]: newFile },
          activeFileId: id,
        }));
        return id;
      },
      
      updateFileContent: (id, content) => set((state) => ({
        files: {
          ...state.files,
          [id]: { ...state.files[id], content, lastModified: Date.now() },
        },
      })),
      
      updateFileScroll: (id, position) => set((state) => ({
        files: {
          ...state.files,
          [id]: { ...state.files[id], scrollPosition: position },
        },
      })),
      
      updateFileCursor: (id, position) => set((state) => ({
        files: {
          ...state.files,
          [id]: { ...state.files[id], cursorPosition: position },
        },
      })),
      
      deleteFile: (id) => {
        const state = get();
        if (Object.keys(state.files).length <= 1) {
          return;
        }
        const newFiles = { ...state.files };
        delete newFiles[id];
        const newActiveId = state.activeFileId === id 
          ? Object.keys(newFiles)[0] 
          : state.activeFileId;
        const newSecondaryId = state.secondaryFileId === id 
          ? null 
          : state.secondaryFileId;
        set({ 
          files: newFiles, 
          activeFileId: newActiveId,
          secondaryFileId: newSecondaryId,
        });
      },
      
      renameFile: (id, name) => set((state) => ({
        files: {
          ...state.files,
          [id]: { ...state.files[id], name },
        },
        renamingFileId: null,
      })),
      
      importFile: (name, content) => {
        const id = generateId();
        const newFile: FileData = {
          id,
          name,
          content,
          lastModified: Date.now(),
        };
        set((state) => ({
          files: { ...state.files, [id]: newFile },
          activeFileId: id,
        }));
        return id;
      },
      
      // Settings Actions
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings },
      })),
      
      // UI Actions
      setSettingsOpen: (open) => set({ isSettingsOpen: open }),
      setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
      setTerminalOpen: (open) => set({ isTerminalOpen: open }),
      
      addTerminalLine: (type, content) => {
        const id = generateId();
        set((state) => ({
          terminalLines: [...state.terminalLines, {
            id,
            type,
            content,
            timestamp: Date.now(),
          }],
        }));
      },
      
      clearTerminal: () => set({ terminalLines: [] }),
      
      addToTerminalHistory: (cmd) => set((state) => ({
        terminalHistory: [...state.terminalHistory, cmd],
        terminalHistoryIndex: -1,
      })),
      
      navigateTerminalHistory: (direction) => {
        const state = get();
        const history = state.terminalHistory;
        if (history.length === 0) return null;
        
        let newIndex = state.terminalHistoryIndex;
        if (direction === 'up') {
          newIndex = Math.min(newIndex + 1, history.length - 1);
        } else {
          newIndex = Math.max(newIndex - 1, -1);
        }
        set({ terminalHistoryIndex: newIndex });
        return newIndex >= 0 ? history[history.length - 1 - newIndex] : null;
      },
      
      // Output Actions
      setOutputOpen: (open) => set({ isOutputOpen: open }),
      setOutput: (content, type) => set({ outputContent: content, outputType: type, isOutputOpen: true }),
      clearOutput: () => set({ outputContent: '', outputType: 'success' }),
      
      // PWA Actions
      setInstallPromptAvailable: (available) => set({ isInstallPromptAvailable: available }),
      setAppInstalled: (installed) => set({ isAppInstalled: installed }),
      
      // Renaming Actions
      setRenamingFile: (id) => set({ renamingFileId: id }),
    }),
    {
      name: 'code-editor-storage',
      partialize: (state) => ({
        files: state.files,
        settings: state.settings,
        terminalHistory: state.terminalHistory,
      }),
    }
  )
);
