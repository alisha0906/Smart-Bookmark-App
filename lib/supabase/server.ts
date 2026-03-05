import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Used in Server Components and Route Handlers (server-side code)
// Reads cookies to get the current user's auth session
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // In Server Components, cookie setting is handled by middleware
          }
        },
      },
    }
  )
}
