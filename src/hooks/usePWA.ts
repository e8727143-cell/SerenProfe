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
      // If the prompt isn't available, we can't force it.
      // This happens on iOS or if the browser hasn't fired the event yet.
      // We'll log it for now, but in a real app we might show a custom modal instructions.
      console.log('Install prompt not available yet. User might need to use browser menu.');
      alert('Para instalar, selecciona "Agregar a Inicio" en el menú de tu navegador.');
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
