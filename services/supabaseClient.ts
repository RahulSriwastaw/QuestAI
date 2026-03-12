import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xwkbrjihkidgdoblyyms.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3a2Jyamloa2lkZ2RvYmx5eW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMjE4MjgsImV4cCI6MjA4ODg5NzgyOH0.HtzyOH5DrvdxBUlr4yvU2sSgj9qRVMah_eyDi9-ADNM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
