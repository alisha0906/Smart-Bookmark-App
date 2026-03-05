import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LoginPage from '@/components/LoginPage'
import Dashboard from '@/components/Dashboard'

// This is a Server Component — it runs on the server, checks auth,
// and renders either the login page or the dashboard
export default async function Home() {
  const supabase = await createClient()

  // getUser() checks the session cookie and returns the logged-in user
  // If no valid session, user will be null
  const { data: { user } } = await supabase.auth.getUser()

  // If user is logged in, fetch their bookmarks from the DB
  if (user) {
    const { data: bookmarks } = await supabase
      .from('bookmarks')
      .select('*')
      .order('created_at', { ascending: false })

    return <Dashboard user={user} initialBookmarks={bookmarks ?? []} />
  }

  return <LoginPage />
}
