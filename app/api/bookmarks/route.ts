import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/bookmarks — Create a new bookmark
export async function POST(request: Request) {
  const supabase = await createClient()

  // Verify the user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { url, title } = await request.json()

  // Validate inputs
  if (!url || !title) {
    return NextResponse.json({ error: 'URL and title are required' }, { status: 400 })
  }

  // Insert into the bookmarks table
  // user_id is set to the current user — this enforces private bookmarks
  const { data, error } = await supabase
    .from('bookmarks')
    .insert({ url, title, user_id: user.id })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

// DELETE /api/bookmarks?id=xxx — Delete a bookmark
export async function DELETE(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Bookmark ID required' }, { status: 400 })
  }

  // The .eq('user_id', user.id) check means a user can ONLY delete their OWN bookmarks
  // Row Level Security in Supabase also enforces this at the DB level
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
