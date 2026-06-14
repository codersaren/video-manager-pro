import { createClient } from '@supabase/supabase-js';

// Fallback placeholder prevents createClient from throwing during Next.js build.
// Actual DB calls only happen client-side when supabaseReady is true (see hooks).
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'placeholder-key'
);
