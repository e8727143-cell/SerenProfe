import { motion } from 'motion/react';
import { Download } from 'lucide-react';

interface InstallPromptProps {
  onInstall: () => void;
}

export function InstallPrompt({ onInstall }: InstallPromptProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
    >
      <button
        onClick={onInstall}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-full shadow-lg flex items-center space-x-2 transition-all duration-300 transform active:scale-95"
      >
        <Download className="w-5 h-5" />
        <span>Instalar SerenProfe como App</span>
      </button>
    </motion.div>
  );
}
