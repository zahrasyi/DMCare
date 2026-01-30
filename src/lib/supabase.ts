import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Pastikan urutannya: URL dulu, baru Kunci (Anon Key)
export const supabase = createSupabaseClient(
  'https://mlscfkpdmfptidsqssrz.supabase.co', // URL dari temen kamu
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sc2Nma3BkbWZwdGlkc3Fzc3J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MTg3MjgsImV4cCI6MjA3NzE5NDcyOH0.wm_ONflzbli8sZTqJ8wGQ8ajUhlqnhOpHSifBwL_YpQ' // Anon Key dari temen kamu
);

// Untuk API URL Edge Functions
export const API_URL = `https://mlscfkpdmfptidsqssrz.supabase.co/functions/v1/make-server-12535b8b`;