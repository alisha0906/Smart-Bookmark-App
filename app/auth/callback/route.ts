import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// This Route Handler is the OAuth callback URL.
// After Google login, Google redirects the user here with a "code".
// We exchange that code for a real Supabase session (sets the auth cookie).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    // Exchange the one-time code for a persistent session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If something went wrong, redirect to login with an error message
  return NextResponse.redirect(`${origin}/?error=auth_failed`)
}
