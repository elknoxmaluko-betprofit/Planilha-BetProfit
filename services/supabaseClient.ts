
import { createClient } from '@supabase/supabase-js';

// Acede às variáveis de ambiente injetadas pelo Vite
// Na Vercel, deve configurar VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    '⚠️ Supabase URL ou Key não detetadas. Certifique-se que adicionou VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas Environment Variables da Vercel.'
  );
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');
