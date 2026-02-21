import { GoogleGenAI } from '@google/genai';
import { supabase } from './supabase';

export class GeminiService {
  private currentKey: string | null = null;

  // Obtiene una clave válida desde Supabase
  private async getApiKey(): Promise<string> {
    const { data, error } = await supabase.rpc('get_valid_api_key');
    
    if (error || !data) {
      throw new Error('No hay claves API disponibles o activas en el sistema.');
    }
    
    this.currentKey = data;
    return data;
  }

  // Marca la clave actual como agotada
  private async markKeyAsExhausted(key: string) {
    console.warn(`Marcando clave ${key.substring(0, 5)}... como agotada.`);
    await supabase.rpc('mark_key_exhausted', { target_key: key });
    this.currentKey = null; // Reset local key
  }

  // Genera contenido con reintentos automáticos y rotación
  async generateContentWithRotation(prompt: string, retries = 3): Promise<string> {
    let attempts = 0;

    while (attempts < retries) {
      try {
        // 1. Obtener clave (si no tenemos una)
        if (!this.currentKey) {
          await this.getApiKey();
        }

        if (!this.currentKey) throw new Error("No se pudo obtener una clave API.");

        // 2. Inicializar cliente con la clave actual
        const ai = new GoogleGenAI({ apiKey: this.currentKey });

        // 3. Intentar generar
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text || '';

      } catch (error: any) {
        console.error(`Intento ${attempts + 1} fallido:`, error);

        // Detectar error de cuota (429) o clave inválida
        const isQuotaError = error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('Resource has been exhausted');
        const isAuthError = error.message?.includes('API key') || error.message?.includes('403');

        if ((isQuotaError || isAuthError) && this.currentKey) {
          // Reportar clave mala y rotar
          await this.markKeyAsExhausted(this.currentKey);
          attempts++;
          // Continuar al siguiente ciclo while para obtener nueva clave
        } else {
          // Si es otro error (ej. red), lanzar
          throw error;
        }
      }
    }

    throw new Error('Se agotaron todas las claves API disponibles o se alcanzó el límite de reintentos.');
  }
}

export const geminiService = new GeminiService();
