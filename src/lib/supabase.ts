import { createClient } from '@supabase/supabase-js';

// User provided credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lkwecoiwbprrjggjeusz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_3ltZIUIUoJ-PltTDtPlXtg_lFoKwm-u';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
