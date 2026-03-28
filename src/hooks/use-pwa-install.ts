'use client';

import { useEffect, useCallback } from 'react';
import { useEditorStore } from '@/store/editor-store';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWAInstall() {
  const { 
    setInstallPromptAvailable, 
    setAppInstalled,
    isInstallPromptAvailable,
    isAppInstalled,
  } = useEditorStore();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setAppInstalled(true);
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPromptAvailable(true);
      // Store the event for later use
      (window as unknown as { deferredPrompt: BeforeInstallPromptEvent }).deferredPrompt = e as BeforeInstallPromptEvent;
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setAppInstalled(true);
      setInstallPromptAvailable(false);
      (window as unknown as { deferredPrompt: BeforeInstallPromptEvent | null }).deferredPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [setInstallPromptAvailable, setAppInstalled]);

  const installApp = useCallback(async () => {
    const deferredPrompt = (window as unknown as { deferredPrompt: BeforeInstallPromptEvent | null }).deferredPrompt;
    
    if (!deferredPrompt) {
      // iOS Safari doesn't support beforeinstallprompt
      // Show manual instructions
      const isIos = /ipad|iphone|ipod/.test(navigator.userAgent.toLowerCase());
      if (isIos) {
        alert(
          'To install this app on iOS:\n\n' +
          '1. Tap the Share button in Safari\n' +
          '2. Scroll down and tap "Add to Home Screen"\n' +
          '3. Tap "Add" in the top right corner'
        );
      }
      return;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setAppInstalled(true);
    }
    
    (window as unknown as { deferredPrompt: BeforeInstallPromptEvent | null }).deferredPrompt = null;
    setInstallPromptAvailable(false);
  }, [setAppInstalled, setInstallPromptAvailable]);

  return {
    isInstallPromptAvailable,
    isAppInstalled,
    installApp,
  };
}
