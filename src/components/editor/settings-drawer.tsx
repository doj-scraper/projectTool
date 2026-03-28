'use client';

import React from 'react';
import { Moon, Sun, Monitor, X, Check, Maximize2, Minimize2 } from 'lucide-react';
import { useEditorStore } from '@/store/editor-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

const FONT_FAMILIES = [
  { label: 'System Mono', value: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' },
  { label: 'Fira Code', value: '"Fira Code", monospace' },
  { label: 'JetBrains Mono', value: '"JetBrains Mono", monospace' },
];

export const SettingsDrawer = React.memo(function SettingsDrawer() {
  const { settings, isSettingsOpen, setSettingsOpen, updateSettings } = useEditorStore();

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-stretch md:justify-end pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto transition-opacity"
        onClick={() => setSettingsOpen(false)}
      />
      
      {/* Drawer Content */}
      <div className="relative w-full md:w-80 bg-white dark:bg-zinc-900 shadow-2xl rounded-t-2xl md:rounded-none h-[85vh] md:h-full overflow-y-auto pointer-events-auto transform transition-transform duration-300 ease-out flex flex-col">
        <div className="p-4 md:p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center sticky top-0 bg-white dark:bg-zinc-900 z-10">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Settings</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(false)}
            className="h-10 w-10"
          >
            <X size={20} className="text-zinc-500" />
          </Button>
        </div>

        <div className="p-4 md:p-6 space-y-6 flex-1">
          {/* Theme */}
          <section>
            <Label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 block">
              Appearance
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {(['light', 'dark', 'system'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => updateSettings({ theme: t })}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all min-h-[70px]",
                    settings.theme === t 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600'
                  )}
                >
                  {t === 'light' && <Sun size={20} className="mb-1" />}
                  {t === 'dark' && <Moon size={20} className="mb-1" />}
                  {t === 'system' && <Monitor size={20} className="mb-1" />}
                  <span className="text-xs font-medium capitalize">{t}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Font Size */}
          <section>
            <div className="flex justify-between items-center mb-3">
              <Label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Font Size
              </Label>
              <span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                {settings.fontSize}px
              </span>
            </div>
            <Slider
              min={12}
              max={24}
              step={1}
              value={[settings.fontSize]}
              onValueChange={([value]) => updateSettings({ fontSize: value })}
              className="w-full"
            />
            <div className="flex justify-between mt-1 text-xs text-zinc-400">
              <span>12px</span>
              <span>24px</span>
            </div>
          </section>

          {/* Font Family */}
          <section>
            <Label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 block">
              Typography
            </Label>
            <div className="space-y-2">
              {FONT_FAMILIES.map((font) => (
                <button
                  key={font.value}
                  onClick={() => updateSettings({ fontFamily: font.value })}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between",
                    settings.fontFamily === font.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                  )}
                  style={{ fontFamily: font.value }}
                >
                  <span className="text-sm">{font.label}</span>
                  {settings.fontFamily === font.value && <Check size={14} />}
                </button>
              ))}
            </div>
          </section>

          {/* Focus Mode */}
          <section>
            <Label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 block">
              Focus Mode
            </Label>
            <button
              onClick={() => updateSettings({ editorOnly: !settings.editorOnly })}
              className={cn(
                "w-full p-3 rounded-xl border-2 flex items-center justify-between transition-all",
                settings.editorOnly
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-zinc-200 dark:border-zinc-700'
              )}
            >
              <div className="flex items-center gap-3">
                {settings.editorOnly ? (
                  <Minimize2 className="text-blue-500" size={18} />
                ) : (
                  <Maximize2 className="text-zinc-400" size={18} />
                )}
                <div className="text-left">
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Distraction Free
                  </div>
                  <div className="text-xs text-zinc-500">Hide toolbar and tabs</div>
                </div>
              </div>
              <div className={cn(
                "w-10 h-5 rounded-full p-0.5 transition-colors",
                settings.editorOnly ? 'bg-blue-500' : 'bg-zinc-300 dark:bg-zinc-600'
              )}>
                <div className={cn(
                  "w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform",
                  settings.editorOnly ? 'translate-x-5' : ''
                )} />
              </div>
            </button>
          </section>
        </div>
      </div>
    </div>
  );
});
