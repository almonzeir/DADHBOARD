import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your actual Supabase URL and Anon Key
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://kxboqjmswkraudlrhkex.supabase.co';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4Ym9xam1zd2tyYXVkbHJoa2V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NDcwNzksImV4cCI6MjA3OTIyMzA3OX0.E1z0vkCQQuavqi8iTGjUgCfSb5RBa4tsrVZGsf9d5_s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
