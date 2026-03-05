'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import AddBookmarkForm from './AddBookmarkForm'
import BookmarkList from './BookmarkList'

// TypeScript type defining what a bookmark object looks like
export type Bookmark = {
  id: string
  url: string
  title: string
  user_id: string
  created_at: string
}

type Props = {
  user: User
  initialBookmarks: Bookmark[]
}

// Dashboard is a Client Component — it manages state and sets up real-time subscriptions
export default function Dashboard({ user, initialBookmarks }: Props) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const supabase = createClient()

  // ── Real-time subscription ──────────────────────────────────────────
  // Supabase Realtime listens to Postgres changes and pushes them to the browser.
  // This is what makes two tabs stay in sync without refreshing.
  useEffect(() => {
    const channel = supabase
      .channel('bookmarks-realtime')  // Give the channel a unique name
      .on(
        'postgres_changes',
        {
          event: '*',         // Listen to INSERT, UPDATE, and DELETE
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${user.id}`,  // Only this user's bookmarks
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // A new bookmark was added (possibly in another tab)
            // Add it to the top of the list
            setBookmarks((prev) => [payload.new as Bookmark, ...prev])
          } else if (payload.eventType === 'DELETE') {
            // A bookmark was deleted — remove it from state
            setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    // Cleanup: unsubscribe when the component unmounts
    return () => { supabase.removeChannel(channel) }
  }, [user.id, supabase])

  // ── Add bookmark ────────────────────────────────────────────────────
  const handleAdd = useCallback(async (url: string, title: string) => {
    const res = await fetch('/api/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, title }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to add bookmark')
    }
    // Note: we do NOT manually update state here.
    // The real-time subscription above will fire and add it automatically.
    // This prevents duplicate entries.
  }, [])

  // ── Delete bookmark ─────────────────────────────────────────────────
  const handleDelete = useCallback(async (id: string) => {
    await fetch(`/api/bookmarks?id=${id}`, { method: 'DELETE' })
    // Again, real-time subscription handles the state update
  }, [])

  // ── Sign out ────────────────────────────────────────────────────────
  const handleSignOut = async () => {
    setIsLoggingOut(true)
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const avatarUrl = user.user_metadata?.avatar_url
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'there'

  return (
    <main className="min-h-screen" style={{ background: 'var(--paper)' }}>

      {/* Header */}
      <header className="sticky top-0 z-10 border-b backdrop-blur-sm"
        style={{ borderColor: 'var(--border)', background: 'rgba(247,244,239,0.85)' }}>
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--accent)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <span className="font-display font-bold text-lg" style={{ color: 'var(--ink)' }}>Markd</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm hidden sm:block" style={{ color: 'var(--muted)' }}>
              Hi, {displayName.split(' ')[0]}
            </span>
            {avatarUrl && (
              <img src={avatarUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover ring-2"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-stone-200" />
            )}
            <button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="text-sm px-3 py-1.5 rounded-lg border transition-all duration-150 hover:opacity-80 disabled:opacity-50"
              style={{ borderColor: 'var(--border)', color: 'var(--muted)', background: 'white' }}
            >
              {isLoggingOut ? '...' : 'Sign out'}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Page title */}
        <div className="mb-8 animate-fade-up">
          <h1 className="font-display text-3xl font-bold mb-1" style={{ color: 'var(--ink)' }}>
            Your Bookmarks
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {bookmarks.length === 0
              ? 'Nothing saved yet — add your first link below.'
              : `${bookmarks.length} saved link${bookmarks.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Add bookmark form */}
        <div className="mb-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <AddBookmarkForm onAdd={handleAdd} />
        </div>

        {/* Bookmark list */}
        <BookmarkList bookmarks={bookmarks} onDelete={handleDelete} />
      </div>
    </main>
  )
}
