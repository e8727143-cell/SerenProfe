import { useState, useEffect } from 'react';

// Variable global para guardar el evento, fuera del ciclo de vida de React
let deferredPrompt: any = null;

export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(!!deferredPrompt);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (installed)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      // 1. Evitar que el navegador muestre su propio banner feo
      e.preventDefault();
      // 2. Guardar el evento para usarlo después
      deferredPrompt = e;
      // 3. Actualizar estado para mostrar el botón
      setIsInstallable(true);
      console.log('Evento beforeinstallprompt capturado');
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      console.log('App instalada exitosamente');
      setIsInstalled(true);
      setIsInstallable(false);
      deferredPrompt = null;
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) {
      console.log('No hay evento de instalación diferido');
      return;
    }

    // 4. Mostrar el cuadro de diálogo de instalación real
    deferredPrompt.prompt();
    
    // 5. Esperar la respuesta del usuario
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Usuario eligió: ${outcome}`);
    
    // 6. Limpiar la variable si se aceptó
    if (outcome === 'accepted') {
      deferredPrompt = null;
      setIsInstallable(false);
    }
  };

  return { isInstallable, isInstalled, install };
}
