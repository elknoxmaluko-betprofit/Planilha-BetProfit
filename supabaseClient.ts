
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lcehjwerooauzxtrxuuo.supabase.co';
const supabaseKey = 'sb_publishable_yvwN3P5SfASsJU3kFYy0Mg_5Vzsx5pQ';

export const supabase = createClient(supabaseUrl, supabaseKey);
