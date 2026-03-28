'use client';

import React, { useEffect, useState, useCallback } from 'react';
import fuzzysort from 'fuzzysort';
import { 
  FilePlus, 
  Sun, 
  Moon, 
  Monitor, 
  Type, 
  X, 
  Copy, 
  Split,
  Download,
  Upload,
  Terminal,
  Play,
  DownloadCloud,
  Maximize2,
  Settings
} from 'lucide-react';
import { useEditorStore } from '@/store/editor-store';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from '@/components/ui/command';

interface Command {
  id: string;
  label: string;
  shortcut?: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
}

interface CommandPaletteProps {
  onImport: () => void;
  onExport: () => void;
  onInstallApp: () => void;
}

export const CommandPalette = React.memo(function CommandPalette({
  onImport,
  onExport,
  onInstallApp,
}: CommandPaletteProps) {
  const { 
    isCommandPaletteOpen, 
    setCommandPaletteOpen,
    createFile,
    updateSettings,
    settings,
    setSettingsOpen,
    setTerminalOpen,
    isTerminalOpen,
    setOutputOpen,
    isOutputOpen,
    isInstallPromptAvailable,
    isAppInstalled,
  } = useEditorStore();

  const [search, setSearch] = useState('');

  const commands: Command[] = [
    {
      id: 'new-file',
      label: 'New File',
      shortcut: '⌘N',
      icon: <FilePlus size={16} />,
      action: () => { createFile(); setCommandPaletteOpen(false); },
      category: 'File',
    },
    {
      id: 'import-file',
      label: 'Import File',
      icon: <Upload size={16} />,
      action: () => { onImport(); setCommandPaletteOpen(false); },
      category: 'File',
    },
    {
      id: 'export-file',
      label: 'Export File',
      icon: <Download size={16} />,
      action: () => { onExport(); setCommandPaletteOpen(false); },
      category: 'File',
    },
    {
      id: 'copy-all',
      label: 'Copy All',
      shortcut: '⌘A',
      icon: <Copy size={16} />,
      action: () => {
        const { files, activeFileId } = useEditorStore.getState();
        navigator.clipboard.writeText(files[activeFileId]?.content || '');
        setCommandPaletteOpen(false);
      },
      category: 'Edit',
    },
    {
      id: 'toggle-theme-light',
      label: 'Switch to Light Theme',
      icon: <Sun size={16} />,
      action: () => { updateSettings({ theme: 'light' }); setCommandPaletteOpen(false); },
      category: 'Appearance',
    },
    {
      id: 'toggle-theme-dark',
      label: 'Switch to Dark Theme',
      icon: <Moon size={16} />,
      action: () => { updateSettings({ theme: 'dark' }); setCommandPaletteOpen(false); },
      category: 'Appearance',
    },
    {
      id: 'toggle-theme-system',
      label: 'Use System Theme',
      icon: <Monitor size={16} />,
      action: () => { updateSettings({ theme: 'system' }); setCommandPaletteOpen(false); },
      category: 'Appearance',
    },
    {
      id: 'increase-font',
      label: 'Increase Font Size',
      icon: <Type size={16} />,
      action: () => { 
        updateSettings({ fontSize: Math.min(settings.fontSize + 2, 24) }); 
        setCommandPaletteOpen(false); 
      },
      category: 'Appearance',
    },
    {
      id: 'decrease-font',
      label: 'Decrease Font Size',
      icon: <Type size={16} />,
      action: () => { 
        updateSettings({ fontSize: Math.max(settings.fontSize - 2, 12) }); 
        setCommandPaletteOpen(false); 
      },
      category: 'Appearance',
    },
    {
      id: 'toggle-split',
      label: 'Toggle Split View',
      icon: <Split size={16} />,
      action: () => { 
        updateSettings({ splitView: !settings.splitView }); 
        setCommandPaletteOpen(false); 
      },
      category: 'View',
    },
    {
      id: 'toggle-distraction-free',
      label: 'Toggle Distraction Free Mode',
      icon: <Maximize2 size={16} />,
      action: () => { 
        updateSettings({ editorOnly: !settings.editorOnly }); 
        setCommandPaletteOpen(false); 
      },
      category: 'View',
    },
    {
      id: 'toggle-terminal',
      label: 'Toggle Terminal',
      shortcut: '⌘`',
      icon: <Terminal size={16} />,
      action: () => { setTerminalOpen(!isTerminalOpen); setCommandPaletteOpen(false); },
      category: 'View',
    },
    {
      id: 'run-code',
      label: 'Run Code',
      shortcut: '⌘R',
      icon: <Play size={16} />,
      action: () => { setOutputOpen(true); setCommandPaletteOpen(false); },
      category: 'Run',
    },
    {
      id: 'open-settings',
      label: 'Open Settings',
      icon: <Settings size={16} />,
      action: () => { setSettingsOpen(true); setCommandPaletteOpen(false); },
      category: 'Preferences',
    },
    ...(isInstallPromptAvailable && !isAppInstalled ? [{
      id: 'install-app',
      label: 'Install App',
      icon: <DownloadCloud size={16} />,
      action: () => { onInstallApp(); setCommandPaletteOpen(false); },
      category: 'PWA',
    }] : []),
  ];

  // Filter commands using fuzzy search
  const filteredCommands = React.useMemo(() => {
    if (!search.trim()) {
      return commands;
    }
    
    const results = fuzzysort.go(search, commands, {
      keys: ['label', 'category'],
      threshold: -10000,
    });
    
    return results.map(result => result.obj);
  }, [search, commands, isInstallPromptAvailable, isAppInstalled]);

  // Group commands by category
  const groupedCommands = React.useMemo(() => {
    const groups: Record<string, Command[]> = {};
    filteredCommands.forEach(cmd => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = [];
      }
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  const handleSelect = useCallback((commandId: string) => {
    const command = commands.find(c => c.id === commandId);
    if (command) {
      command.action();
    }
  }, [commands]);

  // Reset search when dialog closes
  useEffect(() => {
    if (!isCommandPaletteOpen) {
      setTimeout(() => setSearch(''), 100);
    }
  }, [isCommandPaletteOpen]);

  return (
    <CommandDialog
      open={isCommandPaletteOpen}
      onOpenChange={setCommandPaletteOpen}
      title="Command Palette"
      description="Search and run commands"
      className="md:max-w-lg"
    >
      <CommandInput 
        placeholder="Type a command or search..." 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList className="max-h-[60vh] md:max-h-[400px]">
        <CommandEmpty>No commands found.</CommandEmpty>
        {Object.entries(groupedCommands).map(([category, cmds], index) => (
          <React.Fragment key={category}>
            {index > 0 && <CommandSeparator />}
            <CommandGroup heading={category}>
              {cmds.map((cmd) => (
                <CommandItem
                  key={cmd.id}
                  value={cmd.id}
                  onSelect={() => handleSelect(cmd.id)}
                  className="min-h-[48px] px-3"
                >
                  <span className="mr-3 text-zinc-500">{cmd.icon}</span>
                  <span>{cmd.label}</span>
                  {cmd.shortcut && (
                    <CommandShortcut>{cmd.shortcut}</CommandShortcut>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </React.Fragment>
        ))}
      </CommandList>
    </CommandDialog>
  );
});
