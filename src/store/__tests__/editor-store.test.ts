import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useEditorStore, type FileData, type EditorSettings } from '../editor-store'

// Mock zustand's persist middleware to avoid localStorage issues in tests
vi.mock('zustand/middleware', () => ({
  persist: (config: () => unknown) => config,
}))

describe('Editor Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useEditorStore.getState()
    // Clear all files except default
    const fileIds = Object.keys(store.files).filter(id => id !== 'default')
    fileIds.forEach(id => store.deleteFile(id))
    store.setActiveFile('default')
    store.setSecondaryFile(null)
    store.clearTerminal()
    store.clearOutput()
  })

  describe('File Management', () => {
    it('should initialize with default file', () => {
      const state = useEditorStore.getState()
      
      expect(Object.keys(state.files)).toHaveLength(1)
      expect(state.files['default']).toBeDefined()
      expect(state.files['default'].name).toBe('untitled.js')
      expect(state.activeFileId).toBe('default')
    })

    it('should create a new file with default name', () => {
      const state = useEditorStore.getState()
      const newId = state.createFile()
      
      expect(Object.keys(state.files)).toHaveLength(2)
      expect(state.files[newId]).toBeDefined()
      expect(state.files[newId].name).toMatch(/^untitled\.\d+\.js$/)
      expect(state.activeFileId).toBe(newId)
    })

    it('should create a new file with custom name and content', () => {
      const state = useEditorStore.getState()
      const customName = 'custom.js'
      const customContent = 'console.log("test")'
      
      const newId = state.createFile(customName, customContent)
      
      expect(state.files[newId].name).toBe(customName)
      expect(state.files[newId].content).toBe(customContent)
    })

    it('should update file content', () => {
      const state = useEditorStore.getState()
      const newContent = 'const x = 1;'
      
      state.updateFileContent('default', newContent)
      
      expect(state.files['default'].content).toBe(newContent)
      expect(state.files['default'].lastModified).toBeGreaterThan(0)
    })

    it('should update file scroll position', () => {
      const state = useEditorStore.getState()
      const scrollPosition = 100
      
      state.updateFileScroll('default', scrollPosition)
      
      expect(state.files['default'].scrollPosition).toBe(scrollPosition)
    })

    it('should update file cursor position', () => {
      const state = useEditorStore.getState()
      const cursorPosition = { line: 5, ch: 10 }
      
      state.updateFileCursor('default', cursorPosition)
      
      expect(state.files['default'].cursorPosition).toEqual(cursorPosition)
    })

    it('should delete a file and switch active file', () => {
      const state = useEditorStore.getState()
      const newId = state.createFile('test.js', '')
      
      state.deleteFile('default')
      
      expect(state.files['default']).toBeUndefined()
      expect(state.activeFileId).toBe(newId)
    })

    it('should not delete the last remaining file', () => {
      const state = useEditorStore.getState()
      
      state.deleteFile('default')
      
      expect(state.files['default']).toBeDefined()
    })

    it('should rename a file', () => {
      const state = useEditorStore.getState()
      const newName = 'renamed.js'
      
      state.renameFile('default', newName)
      
      expect(state.files['default'].name).toBe(newName)
      expect(state.renamingFileId).toBeNull()
    })

    it('should import a file', () => {
      const state = useEditorStore.getState()
      const fileName = 'imported.py'
      const fileContent = 'print("hello")'
      
      const importedId = state.importFile(fileName, fileContent)
      
      expect(state.files[importedId].name).toBe(fileName)
      expect(state.files[importedId].content).toBe(fileContent)
      expect(state.activeFileId).toBe(importedId)
    })

    it('should set active file', () => {
      const state = useEditorStore.getState()
      const newId = state.createFile()
      
      state.setActiveFile('default')
      
      expect(state.activeFileId).toBe('default')
    })

    it('should set secondary file for split view', () => {
      const state = useEditorStore.getState()
      const newId = state.createFile()
      
      state.setSecondaryFile(newId)
      
      expect(state.secondaryFileId).toBe(newId)
    })
  })

  describe('Settings', () => {
    it('should have default settings', () => {
      const state = useEditorStore.getState()
      
      expect(state.settings.theme).toBe('system')
      expect(state.settings.fontSize).toBe(14)
      expect(state.settings.editorOnly).toBe(false)
      expect(state.settings.splitView).toBe(false)
    })

    it('should update settings partially', () => {
      const state = useEditorStore.getState()
      
      state.updateSettings({ fontSize: 16, theme: 'dark' })
      
      expect(state.settings.fontSize).toBe(16)
      expect(state.settings.theme).toBe('dark')
      expect(state.settings.editorOnly).toBe(false) // unchanged
    })
  })

  describe('UI State', () => {
    it('should toggle settings panel', () => {
      const state = useEditorStore.getState()
      
      expect(state.isSettingsOpen).toBe(false)
      
      state.setSettingsOpen(true)
      expect(useEditorStore.getState().isSettingsOpen).toBe(true)
      
      state.setSettingsOpen(false)
      expect(useEditorStore.getState().isSettingsOpen).toBe(false)
    })

    it('should toggle command palette', () => {
      const state = useEditorStore.getState()
      
      state.setCommandPaletteOpen(true)
      expect(useEditorStore.getState().isCommandPaletteOpen).toBe(true)
    })

    it('should toggle terminal', () => {
      const state = useEditorStore.getState()
      
      state.setTerminalOpen(true)
      expect(useEditorStore.getState().isTerminalOpen).toBe(true)
    })
  })

  describe('Terminal', () => {
    it('should add terminal lines', () => {
      const state = useEditorStore.getState()
      
      state.addTerminalLine('input', 'ls -la')
      state.addTerminalLine('output', 'file.txt')
      
      const lines = useEditorStore.getState().terminalLines
      expect(lines).toHaveLength(2)
      expect(lines[0].type).toBe('input')
      expect(lines[0].content).toBe('ls -la')
      expect(lines[1].type).toBe('output')
    })

    it('should clear terminal', () => {
      const state = useEditorStore.getState()
      state.addTerminalLine('input', 'test')
      
      state.clearTerminal()
      
      expect(useEditorStore.getState().terminalLines).toHaveLength(0)
    })

    it('should add to terminal history', () => {
      const state = useEditorStore.getState()
      
      state.addToTerminalHistory('command1')
      state.addToTerminalHistory('command2')
      
      const history = useEditorStore.getState().terminalHistory
      expect(history).toEqual(['command1', 'command2'])
    })

    it('should navigate terminal history up', () => {
      const state = useEditorStore.getState()
      state.addToTerminalHistory('first')
      state.addToTerminalHistory('second')
      
      const result = state.navigateTerminalHistory('up')
      
      expect(result).toBe('second')
      expect(useEditorStore.getState().terminalHistoryIndex).toBe(0)
    })

    it('should navigate terminal history down', () => {
      const state = useEditorStore.getState()
      state.addToTerminalHistory('first')
      state.addToTerminalHistory('second')
      state.navigateTerminalHistory('up')
      
      const result = state.navigateTerminalHistory('down')
      
      expect(result).toBeNull()
    })

    it('should return null when navigating empty history', () => {
      const state = useEditorStore.getState()
      
      const result = state.navigateTerminalHistory('up')
      
      expect(result).toBeNull()
    })
  })

  describe('Output Panel', () => {
    it('should set output content and type', () => {
      const state = useEditorStore.getState()
      
      state.setOutput('Hello World', 'success')
      
      expect(useEditorStore.getState().outputContent).toBe('Hello World')
      expect(useEditorStore.getState().outputType).toBe('success')
      expect(useEditorStore.getState().isOutputOpen).toBe(true)
    })

    it('should clear output', () => {
      const state = useEditorStore.getState()
      state.setOutput('content', 'error')
      
      state.clearOutput()
      
      expect(useEditorStore.getState().outputContent).toBe('')
      expect(useEditorStore.getState().outputType).toBe('success')
    })

    it('should toggle output panel', () => {
      const state = useEditorStore.getState()
      
      state.setOutputOpen(false)
      expect(useEditorStore.getState().isOutputOpen).toBe(false)
    })
  })

  describe('PWA State', () => {
    it('should set install prompt availability', () => {
      const state = useEditorStore.getState()
      
      state.setInstallPromptAvailable(true)
      
      expect(useEditorStore.getState().isInstallPromptAvailable).toBe(true)
    })

    it('should set app installed status', () => {
      const state = useEditorStore.getState()
      
      state.setAppInstalled(true)
      
      expect(useEditorStore.getState().isAppInstalled).toBe(true)
    })
  })

  describe('Renaming', () => {
    it('should set renaming file id', () => {
      const state = useEditorStore.getState()
      
      state.setRenamingFile('default')
      
      expect(useEditorStore.getState().renamingFileId).toBe('default')
    })
  })
})
