import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Loader2, Copy, Check, Sparkles, BookOpen, GraduationCap, History, Trash2, Globe, ArrowLeft, Leaf, Shield, Heart, FileText, Zap, Printer, FileType, LogOut, Settings, Download } from 'lucide-react';
import { supabase } from './lib/supabase';
import { geminiService } from './lib/gemini';
import Login from './Login';
import AdminPanel from './AdminPanel';
import InstallPrompt from './components/InstallPrompt';
import { usePWA } from './hooks/usePWA';

interface Plan {
  id: number;
  created_at: string;
  tema: string;
  grado: string;
  contenido: string;
}

const ADMIN_EMAIL = 'e8727143@gmail.com';

const COUNTRIES = [
  { id: 'MX', name: 'México' },
  { id: 'CO', name: 'Colombia' },
  { id: 'AR', name: 'Argentina' },
  { id: 'ES', name: 'España' },
  { id: 'CL', name: 'Chile' },
  { id: 'PE', name: 'Perú' },
  { id: 'US', name: 'EE. UU. (Español)' },
  { id: 'CA', name: 'Centroamérica' },
  { id: 'OTRO', name: 'Otro / Genérico' }
];

const INCLUSION_OPTIONS = [
  { id: 'tdah', label: 'TDAH' },
  { id: 'autismo', label: 'Autismo / TEA' },
  { id: 'rezago', label: 'Rezago Educativo' },
  { id: 'dislexia', label: 'Dislexia' },
  { id: 'altas_capacidades', label: 'Altas Capacidades' }
];

// Educational systems mapping
const EDUCATION_LEVELS: Record<string, string[]> = {
  MX: [
    'Preescolar', '1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria',
    '1° Secundaria', '2° Secundaria', '3° Secundaria',
    'Bachillerato / Preparatoria', 'Universidad / Facultad'
  ],
  CO: [
    'Preescolar / Transición', '1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria',
    '6° Bachillerato', '7° Bachillerato', '8° Bachillerato', '9° Bachillerato',
    '10° Media', '11° Media', 'Universidad'
  ],
  ES: [
    'Educación Infantil', '1° Primaria', '2° Primaria', '3° Primaria', '4° Primaria', '5° Primaria', '6° Primaria',
    '1° ESO', '2° ESO', '3° ESO', '4° ESO',
    '1° Bachillerato', '2° Bachillerato', 'Formación Profesional', 'Universidad'
  ],
  AR: [
    'Nivel Inicial', '1° Grado', '2° Grado', '3° Grado', '4° Grado', '5° Grado', '6° Grado', '7° Grado',
    '1° Año Secundaria', '2° Año Secundaria', '3° Año Secundaria', '4° Año Secundaria', '5° Año Secundaria', '6° Año Secundaria',
    'Nivel Superior / Universitario'
  ],
  CL: [
    'Educación Parvularia', '1° Básico', '2° Básico', '3° Básico', '4° Básico', '5° Básico', '6° Básico', '7° Básico', '8° Básico',
    '1° Medio', '2° Medio', '3° Medio', '4° Medio', 'Educación Superior'
  ],
  US: [
    'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade',
    '6th Grade (Middle School)', '7th Grade (Middle School)', '8th Grade (Middle School)',
    '9th Grade (High School)', '10th Grade (High School)', '11th Grade (High School)', '12th Grade (High School)',
    'College / University'
  ],
  OTRO: [
    'Preescolar / Inicial', 'Primaria (Grados 1-3)', 'Primaria (Grados 4-6)',
    'Secundaria / Media', 'Bachillerato / High School', 'Universidad'
  ]
};

const LOGO_URL = "https://lkwecoiwbprrjggjeusz.supabase.co/storage/v1/object/public/Galeria%20SerenProfe/Logo%20SerenProfe.png";



export default function App() {
  const [session, setSession] = useState<{ user: { email: string } } | null>(null);
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [history, setHistory] = useState<Plan[]>([]);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Iniciando...');
  const [showAdmin, setShowAdmin] = useState(false);
  const { isInstallable, isInstalled, install } = usePWA();
  
  // Loading steps messages
  const LOADING_STEPS = [
    "Conectando con el cerebro pedagógico...",
    "Analizando normativa educativa...",
    "Estructurando secuencia didáctica...",
    "Diseñando estrategias de inclusión...",
    "Redactando instrumentos de evaluación...",
    "Afinando detalles finales..."
  ];
  
  // New State Variables
  const [survivalMode, setSurvivalMode] = useState<'practical' | 'inspection'>('practical');
  const [selectedInclusions, setSelectedInclusions] = useState<string[]>([]);

  // Auth check (Local Storage)
  useEffect(() => {
    const storedEmail = localStorage.getItem('serenprofe_user_email');
    if (storedEmail) {
      setSession({ user: { email: storedEmail } });
    }
  }, []);

  const handleLogin = (email: string) => {
    localStorage.setItem('serenprofe_user_email', email);
    setSession({ user: { email } });
  };

  const handleLogout = async () => {
    localStorage.removeItem('serenprofe_user_email');
    setSession(null);
    // Optional: await supabase.auth.signOut(); if we were using real auth
  };

  // Get available grades based on selected country
  const availableGrades = useMemo(() => {
    return EDUCATION_LEVELS[country] || EDUCATION_LEVELS['OTRO'] || EDUCATION_LEVELS['MX'];
  }, [country]);

  // Reset grade when country changes
  useEffect(() => {
    setGrade('');
  }, [country]);

  useEffect(() => {
    if (session) {
      fetchHistory();
    }
  }, [session]);

  // Smoother progress bar simulation & Dynamic Messages
  useEffect(() => {
    if (loading) {
      setProgress(0);
      setLoadingMessage(LOADING_STEPS[0]);
      
      const startTime = Date.now();
      const duration = 12000; // Increased duration slightly for better pacing

      // Progress animation
      const animateProgress = () => {
        const elapsed = Date.now() - startTime;
        const nextProgress = Math.min((elapsed / duration) * 100, 95); 
        setProgress(nextProgress);
        if (elapsed < duration && loading) {
          requestAnimationFrame(animateProgress);
        }
      };
      requestAnimationFrame(animateProgress);

      // Message cycling
      const messageInterval = setInterval(() => {
        setLoadingMessage(prev => {
          const currentIndex = LOADING_STEPS.indexOf(prev);
          const nextIndex = (currentIndex + 1) % LOADING_STEPS.length;
          return LOADING_STEPS[nextIndex];
        });
      }, 2500); // Change message every 2.5 seconds

      return () => clearInterval(messageInterval);
    } else {
      setProgress(100);
    }
  }, [loading]);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('planeaciones')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        // Silently fail for history fetch errors to avoid console noise
        // console.error('Error fetching history:', error);
      } else {
        setHistory(data || []);
      }
    } catch (err) {
      // Silently fail for network errors on history fetch
      // console.error('Supabase connection error:', err);
    }
  };

  const toggleInclusion = (id: string) => {
    setSelectedInclusions(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };



  const generatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !grade) return;

    setLoading(true);
    setGeneratedPlan(null);
    setShowHistory(false);

    try {
      // 1. Fetch normative data from Supabase
      let marcoCurricular = 'Estándares Internacionales';
      let terminologia = 'Objetivos, Actividades, Evaluación';
      let paisNombre = COUNTRIES.find(c => c.id === country)?.name || 'el país seleccionado';

      if (country !== 'OTRO') {
        const { data: normativa, error: normativaError } = await supabase
          .from('normativa_paises')
          .select('*')
          .eq('pais_id', country)
          .single();

        if (!normativaError && normativa) {
          marcoCurricular = normativa.marco_curricular;
          terminologia = normativa.terminologia;
          paisNombre = normativa.pais_nombre;
        }
      }

      // 2. Construct the precise prompt with new modules
      const inclusionText = selectedInclusions.length > 0 
        ? `ATENCIÓN A LA DIVERSIDAD (Módulo Corazón Ético): Genera adaptaciones curriculares específicas y detalladas para alumnos con: ${selectedInclusions.map(id => INCLUSION_OPTIONS.find(opt => opt.id === id)?.label).join(', ')}.`
        : 'ATENCIÓN A LA DIVERSIDAD: Incluye sugerencias generales de diseño universal para el aprendizaje.';

      const modeInstruction = survivalMode === 'inspection'
        ? "MODO INSPECCIÓN (Escudo Legal): La planeación debe ser ultra-detallada, con justificación normativa exhaustiva, citas textuales del marco curricular y un tono formal impecable para blindar al docente ante cualquier supervisión."
        : "MODO PRÁCTICO (Supervivencia en el Aula): La planeación debe ser directa, al grano, fácil de leer en medio de una clase, con tiempos reales y consejos de 'trinchera'.";

      const prompt = `Actúa como un Docente Senior experto en el sistema educativo de ${paisNombre}. Tu objetivo es generar una planeación que un supervisor califique con 10/10, pero que parezca escrita por un humano (de maestro a maestro).

DATOS DEL CONTEXTO:
- País: ${paisNombre}
- Marco Curricular Oficial: ${marcoCurricular}
- Terminología Legal Obligatoria: ${terminologia}
- Tema: ${topic}
- Grado: ${grade}

CONFIGURACIÓN DE GENERACIÓN:
1. ${modeInstruction}
2. ${inclusionText}

INSTRUCCIONES DE ESTILO (Para evitar el 'Vibe' de IA):
1. Lenguaje Práctico: No uses párrafos demasiado largos ni perfectos. Usa viñetas, términos que un docente usa en el pasillo y abreviaciones comunes del país (ej. en México: SEP, NEM, PDA).
2. Tiempos Quirúrgicos: Desglosa CADA actividad en minutos (ej: Pase de lista y encuadre: 5 min; Lluvia de ideas: 10 min).
3. Tono: Profesional pero listo para el combate diario en el salón de clases.

INSTRUCCIONES DE CONTENIDO (El 10 de Supervisión):
1. Aterrizaje al Aula:
   - Tiempos: Desglosa cada sesión con minutos específicos.
   - Dificultades: Añade una sección de 'Posibles retos en el aula' (ej. 'Los alumnos podrían confundir masa con peso').
2. Producto Tangible (ABP Real): Define un Producto Final Concreto al final del proyecto (ej. Una feria de experimentos, un mural comunitario).
3. Evidencias para Supervisión: Genera una Lista de Cotejo lista para imprimir y un espacio para Registro Anecdótico.
4. Aprendizaje Esperado: Redacta una frase clara al inicio: 'Al finalizar este proyecto, el estudiante será capaz de...'

ESTRUCTURA DE SALIDA (Markdown Limpio):
1. Ficha Técnica (Breve, alineada a ${marcoCurricular})
2. Aprendizaje Esperado (Frase clara)
3. Secuencia Didáctica (Inicio, Desarrollo, Cierre con tiempos minuto a minuto)
4. Posibles Retos en el Aula
5. Adaptaciones Curriculares (Detalladas para ${selectedInclusions.length > 0 ? selectedInclusions.join(', ') : 'el grupo general'})
6. Producto Final Tangible
7. Anexo: Lista de Cotejo (Formato tabla o lista verificable)

Usa ÚNICAMENTE la terminología oficial de ${paisNombre} (${terminologia}). NO mezcles términos de otros países.`;

      // Use the rotation service instead of direct call
      const content = await geminiService.generateContentWithRotation(prompt);
      
      setGeneratedPlan(content);

      // Save to Supabase
      const { error } = await supabase
        .from('planeaciones')
        .insert([{ tema: topic, grado: grade, contenido: content }]);

      if (error) {
        console.error('Error saving to Supabase:', error);
      } else {
        fetchHistory();
      }

    } catch (error: any) {
      console.error('Error generating plan:', error);
      let errorMessage = 'Lo siento, hubo un error al generar la planeación.';
      
      if (error.message?.includes('No hay claves')) {
        errorMessage = '⚠️ **Sistema Saturado:** Todas las claves API disponibles se han agotado. Por favor contacta al administrador.';
      } else {
        errorMessage = `⚠️ **Error:** ${error.message || 'Intenta de nuevo más tarde.'}`;
      }
      
      setGeneratedPlan(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedPlan) return;
    navigator.clipboard.writeText(generatedPlan);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownload = (format: 'txt' | 'doc' | 'pdf') => {
    if (!generatedPlan) return;
    
    const filename = `Planeacion_${topic.replace(/\s+/g, '_')}_${grade.replace(/\s+/g, '_')}`;

    if (format === 'txt') {
      downloadFile(generatedPlan, `${filename}.txt`, 'text/plain');
    } else if (format === 'doc') {
      // Simple HTML wrapper for Word
      const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
          <head>
            <meta charset="utf-8">
            <title>${topic}</title>
            <style>
              body { font-family: Arial, sans-serif; }
            </style>
          </head>
          <body>
            ${document.querySelector('.prose')?.innerHTML || generatedPlan}
          </body>
        </html>
      `;
      downloadFile(htmlContent, `${filename}.doc`, 'application/msword');
    } else if (format === 'pdf') {
      window.print();
    }
  };

  const deletePlan = async (id: number) => {
    const { error } = await supabase.from('planeaciones').delete().eq('id', id);
    if (!error) {
      setHistory(history.filter(plan => plan.id !== id));
    }
  };

  const resetView = () => {
    setGeneratedPlan(null);
    setTopic('');
    setGrade('');
    setCountry('MX');
    setSurvivalMode('practical');
    setSelectedInclusions([]);
  };

  if (!session) {
    return <Login onLogin={handleLogin} />;
  }

  // Loading Screen
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F5F9F7] flex flex-col items-center justify-center overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="z-50 flex flex-col items-center max-w-md w-full px-4"
        >
          <img src={LOGO_URL} alt="SerenProfe Logo" className="w-40 h-40 mb-8 object-contain drop-shadow-2xl animate-pulse-slow" />
          
          <h2 className="text-2xl md:text-3xl font-bold text-emerald-900 mb-8 text-center tracking-tight min-h-[80px] flex items-center justify-center">
            {loadingMessage}
          </h2>

          {/* Smooth Progress Bar */}
          <div className="w-full h-4 bg-emerald-100 rounded-full relative overflow-hidden shadow-inner">
            <motion.div 
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full relative"
              style={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
                <Leaf className="w-8 h-8 text-emerald-600 fill-emerald-600 drop-shadow-md" />
              </div>
            </motion.div>
          </div>
          
          <p className="mt-4 text-emerald-700 font-medium text-lg">
            {Math.round(progress)}% completado
          </p>
        </motion.div>
      </div>
    );
  }

  // Result View
  if (generatedPlan) {
    return (
      <div className="min-h-screen bg-[#F5F9F7] py-8 px-4 relative overflow-hidden print:bg-white print:p-0">
        <div className="max-w-4xl mx-auto relative z-10 print:max-w-none">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 print:hidden">
            <button 
              onClick={resetView}
              className="flex items-center text-emerald-700 hover:text-emerald-900 font-medium transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver al inicio
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownload('pdf')}
                className="flex items-center space-x-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors px-4 py-2 rounded-full shadow-sm border border-gray-200"
                title="Imprimir / Guardar como PDF"
              >
                <Printer className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">PDF</span>
              </button>
              <button
                onClick={() => handleDownload('doc')}
                className="flex items-center space-x-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors px-4 py-2 rounded-full shadow-sm border border-blue-200"
                title="Descargar como Word"
              >
                <FileText className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">Word</span>
              </button>
              <button
                onClick={() => handleDownload('txt')}
                className="flex items-center space-x-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors px-4 py-2 rounded-full shadow-sm border border-gray-200"
                title="Descargar como Texto"
              >
                <FileType className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">TXT</span>
              </button>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <button
                onClick={copyToClipboard}
                className="flex items-center space-x-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors px-4 py-2 rounded-full shadow-md hover:shadow-lg"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1.5" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1.5" />
                    Copiar Texto
                  </>
                )}
              </button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 50, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="bg-white rounded-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden perspective-1000 print:shadow-none print:border-none"
          >
            {/* 3D Sheet Header - Hidden in Print */}
            <div className="h-4 bg-gradient-to-r from-emerald-400 to-teal-500 print:hidden" />
            
            <div className="p-8 lg:p-12 print:p-0">
              {/* Print Header */}
              <div className="hidden print:block mb-8 text-center border-b pb-4">
                <h1 className="text-2xl font-bold text-gray-900">Planeación Didáctica - SerenProfe</h1>
                <p className="text-sm text-gray-500">Generado automáticamente</p>
              </div>

              <div className="prose prose-emerald prose-lg max-w-none print:prose-sm">
                <ReactMarkdown>{generatedPlan}</ReactMarkdown>
              </div>
            </div>
            
            {/* 3D Sheet Footer Effect - Hidden in Print */}
            <div className="h-12 bg-gradient-to-t from-gray-50 to-white border-t border-gray-50 print:hidden" />
          </motion.div>
        </div>
      </div>
    );
  }

  // Main Form View
  return (
    <div className="min-h-screen bg-[#F5F9F7] text-gray-800 font-sans selection:bg-emerald-200 flex flex-col items-center justify-center p-4">
      
      {/* Header - Outside Container */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center mb-6"
      >
        <div className="flex items-center justify-center gap-3">
          <img 
            src={LOGO_URL} 
            alt="SerenProfe Logo" 
            className="w-12 h-12 object-contain drop-shadow-sm" 
          />
          <h1 className="text-3xl font-bold font-serif bg-gradient-to-r from-teal-600 to-blue-800 bg-clip-text text-transparent pb-1">
            SerenProfe
          </h1>
        </div>
      </motion.div>

      {/* Main "Window" Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-7xl relative"
      >
        {/* Gradient Border Wrapper */}
        <div className="p-[3px] rounded-3xl bg-gradient-to-r from-emerald-500 to-blue-900 shadow-2xl">
          <div className="bg-white rounded-[20px] overflow-hidden flex flex-col min-h-[80vh]">
            
            {/* Window Title Bar - Controls Only */}
            <div className="bg-gray-50 border-b border-gray-100 px-6 py-2 flex items-center justify-end select-none min-h-[48px]">
              {/* Right: Window Controls */}
              <div className="flex items-center gap-2">
                {isInstallable && (
                  <button 
                    onClick={install}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors rounded-md text-xs font-medium border border-emerald-200"
                    title="Instalar Aplicación"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Instalar</span>
                  </button>
                )}

                {session?.user?.email === ADMIN_EMAIL && (
                  <button 
                    onClick={() => setShowAdmin(true)}
                    className="p-1.5 text-gray-400 hover:text-emerald-600 transition-colors rounded hover:bg-gray-200"
                    title="Configuración"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={handleLogout}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded hover:bg-gray-200"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="p-6 lg:p-8 flex-grow flex flex-col">
              <form onSubmit={generatePlan} className="flex-grow flex flex-col">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full flex-grow">
                  
                  {/* Column 1: Configuration (2x2 Grid) */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-emerald-800 font-semibold border-b border-emerald-100 pb-2 mb-2">
                      <Settings className="w-4 h-4" />
                      <span>Configuración</span>
                    </div>

                    {/* Row 1: Country & Grade */}
                    <div className="flex gap-4">
                      {/* Country */}
                      <div className="flex-1">
                        <label htmlFor="country" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                          País
                        </label>
                        <div className="relative">
                          <select
                            id="country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none appearance-none cursor-pointer text-gray-700 text-xs font-medium truncate"
                          >
                            <option value="" disabled>País</option>
                            {COUNTRIES.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Grade */}
                      <div className="flex-1">
                        <label htmlFor="grade" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                          Grado
                        </label>
                        <div className="relative">
                          <select
                            id="grade"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none appearance-none cursor-pointer text-gray-700 text-xs font-medium truncate"
                            required
                          >
                            <option value="" disabled>Grado</option>
                            {availableGrades.map((g) => (
                              <option key={g} value={g}>
                                {g}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Mode & Inclusion */}
                    <div className="flex gap-4 flex-grow">
                      {/* Mode */}
                      <div className="flex-1 flex flex-col">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                          Modo
                        </label>
                        <div className="flex flex-col gap-2 h-full">
                          <button
                            type="button"
                            onClick={() => setSurvivalMode('practical')}
                            className={`flex-1 py-2 px-2 rounded-xl text-xs font-medium transition-all flex flex-col items-center justify-center text-center gap-1 border ${
                              survivalMode === 'practical' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm' 
                                : 'bg-white text-gray-500 hover:bg-gray-50 border-gray-200'
                            }`}
                          >
                            <Zap className="w-4 h-4" />
                            Práctico
                          </button>
                          <button
                            type="button"
                            onClick={() => setSurvivalMode('inspection')}
                            className={`flex-1 py-2 px-2 rounded-xl text-xs font-medium transition-all flex flex-col items-center justify-center text-center gap-1 border ${
                              survivalMode === 'inspection' 
                                ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm' 
                                : 'bg-white text-gray-500 hover:bg-gray-50 border-gray-200'
                            }`}
                          >
                            <FileText className="w-4 h-4" />
                            Inspección
                          </button>
                        </div>
                      </div>

                      {/* Inclusion */}
                      <div className="flex-1 flex flex-col">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                          Inclusión
                        </label>
                        <div className="bg-gray-50 rounded-xl p-2 border border-gray-200 h-full overflow-y-auto custom-scrollbar flex flex-col gap-1.5">
                          {INCLUSION_OPTIONS.map((option) => (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => toggleInclusion(option.id)}
                              className={`py-1.5 px-2 rounded-lg text-[10px] font-medium transition-all text-left leading-tight border ${
                                selectedInclusions.includes(option.id)
                                  ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-sm'
                                  : 'bg-white text-gray-500 border-transparent hover:bg-gray-100'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Topic & Action */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-emerald-800 font-semibold border-b border-emerald-100 pb-2 mb-2">
                      <BookOpen className="w-4 h-4" />
                      <span>Tema de la Clase</span>
                    </div>
                    
                    <div className="flex-grow flex flex-col relative">
                      <textarea
                        id="topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Describe el tema, objetivo o contenido..."
                        className="w-full h-full p-5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none placeholder-gray-400 text-lg resize-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Column 3: History */}
                  <div className="flex flex-col gap-4 h-full max-h-[400px] lg:max-h-none">
                    <div className="flex items-center gap-2 text-emerald-800 font-semibold border-b border-emerald-100 pb-2 mb-2">
                      <History className="w-4 h-4" />
                      <span>Historial</span>
                    </div>
                    
                    <div className="flex-grow bg-gray-50 rounded-xl border border-gray-200 p-3 overflow-y-auto custom-scrollbar">
                      {history.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center p-4">
                          <History className="w-8 h-8 mb-2 opacity-20" />
                          <p className="text-xs">Sin historial reciente.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {history.map((plan) => (
                            <div 
                              key={plan.id}
                              onClick={() => {
                                setGeneratedPlan(plan.contenido);
                                setTopic(plan.tema);
                                setGrade(plan.grado);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="group p-3 rounded-lg bg-white hover:bg-emerald-50 cursor-pointer transition-all border border-gray-100 hover:border-emerald-200 relative shadow-sm"
                            >
                              <div className="font-medium text-gray-800 truncate pr-6 text-xs">{plan.tema}</div>
                              <div className="text-[10px] text-gray-500 mt-1 flex justify-between items-center">
                                <span className="truncate max-w-[60%]">{plan.grado}</span>
                                <span className="text-gray-400">{new Date(plan.created_at).toLocaleDateString()}</span>
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deletePlan(plan.id);
                                }}
                                className="absolute top-2 right-2 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Footer Button - Full Width */}
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={loading || !topic || !grade}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-lg shadow-lg shadow-emerald-200/50 transition-all transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    Generar Planeación
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Admin Panel Modal */}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
      
      {/* Install PWA Prompt */}
      <InstallPrompt />
    </div>
  );
}
