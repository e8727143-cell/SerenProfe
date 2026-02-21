import { useState, useEffect } from 'react';

// Global state for the deferred prompt
let globalDeferredPrompt: any = null;

export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(!!globalDeferredPrompt);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      globalDeferredPrompt = e;
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
      globalDeferredPrompt = null;
      console.log('PWA was installed');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const install = async () => {
    if (!globalDeferredPrompt) {
      return;
    }

    globalDeferredPrompt.prompt();
    const { outcome } = await globalDeferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      globalDeferredPrompt = null;
      setIsInstallable(false);
    }
  };

  return { isInstallable, isInstalled, install };
}
