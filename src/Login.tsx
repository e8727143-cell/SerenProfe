import { useState } from 'react';
import { motion } from 'motion/react';
import { Loader2, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { supabase } from './lib/supabase';
import InstallPrompt from './components/InstallPrompt';

const LOGO_URL = "https://lkwecoiwbprrjggjeusz.supabase.co/storage/v1/object/public/Galeria%20SerenProfe/Logo%20SerenProfe.png";

interface LoginProps {
  onLogin: (email: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMessage('');

    try {
      // 1. Verificar si el correo está en la White List
      let isAuthorized = false;
      
      // Fallback para el admin principal si la DB falla
      if (email.trim().toLowerCase() === 'e8727143@gmail.com') {
        isAuthorized = true;
      } else {
        const { data, error: rpcError } = await supabase.rpc('is_email_authorized', {
          email_check: email.trim().toLowerCase()
        });
        
        if (rpcError) {
          console.error('Error verificando whitelist:', rpcError);
          // Si hay error de RPC, asumimos falso a menos que sea el admin hardcoded arriba
        } else {
          isAuthorized = !!data;
        }
      }

      if (!isAuthorized) {
        setErrorMessage('Este correo no tiene un acceso activo. Contacta a soporte para adquirir tu licencia.');
        setLoading(false);
        return;
      }

      // 2. Acceso Inmediato (Soft Login)
      onLogin(email.trim().toLowerCase());

    } catch (error: any) {
      console.error('Error de login:', error);
      setErrorMessage(error.message || 'Ocurrió un error al intentar ingresar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F9F7] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl shadow-emerald-100/50 border border-white z-10"
      >
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
             <img 
              src={LOGO_URL} 
              alt="SerenProfe Logo" 
              className="w-16 h-16 object-contain drop-shadow-lg" 
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 font-serif">Bienvenido a <span className="text-emerald-600">Seren</span><span className="text-blue-600">Profe</span></h1>
          <p className="text-gray-500">Tu asistente pedagógico inteligente</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 ml-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="tu@correo.com"
                required
              />
            </div>
          </div>

          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-50 text-red-700 p-4 rounded-xl text-sm flex items-start"
            >
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-base font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                Verificando...
              </>
            ) : (
              <>
                Ingresar
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <div className="flex items-center justify-center text-xs text-gray-400 space-x-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Acceso verificado</span>
          </div>
        </div>
      </motion.div>
      
      {/* Install PWA Prompt */}
      <InstallPrompt />
    </div>
  );
}

