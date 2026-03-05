import { createBrowserClient } from '@supabase/ssr'

// Used in Client Components (browser-side code)
// Each call creates a fresh browser Supabase client with your project credentials
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
