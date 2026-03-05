'use client'

import { useState } from 'react'
import type { Bookmark } from './Dashboard'

type Props = {
  bookmarks: Bookmark[]
  onDelete: (id: string) => Promise<void>
}

export default function BookmarkList({ bookmarks, onDelete }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await onDelete(id)
    } finally {
      setDeletingId(null)
    }
  }

  // Extract domain from URL for favicon and display
  const getDomain = (url: string) => {
    try { return new URL(url).hostname.replace('www.', '') }
    catch { return url }
  }

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).origin
      return `https://www.google.com/s2/favicons?sz=32&domain=${domain}`
    } catch { return null }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: 'var(--paper-dark)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--muted)' }}>
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <p className="font-display text-lg font-semibold mb-1" style={{ color: 'var(--ink)' }}>
          No bookmarks yet
        </p>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Add your first link using the form above
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark.id}
          className="bookmark-item animate-slide-in group flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
          style={{ background: 'white', borderColor: 'var(--border)' }}
        >
          {/* Favicon */}
          <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden mt-0.5"
            style={{ background: 'var(--paper-dark)' }}>
            {getFaviconUrl(bookmark.url) ? (
              <img
                src={getFaviconUrl(bookmark.url)!}
                alt=""
                width={20}
                height={20}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--muted)' }}>
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block font-medium text-sm leading-snug mb-1 hover:underline truncate"
              style={{ color: 'var(--ink)' }}
              title={bookmark.title}
            >
              {bookmark.title}
            </a>
            <div className="flex items-center gap-2">
              <span className="text-xs truncate" style={{ color: 'var(--muted)' }}>
                {getDomain(bookmark.url)}
              </span>
              <span className="text-xs" style={{ color: 'var(--border)' }}>·</span>
              <span className="text-xs flex-shrink-0" style={{ color: 'var(--muted)' }}>
                {formatDate(bookmark.created_at)}
              </span>
            </div>
          </div>

          {/* Delete button — visible on hover */}
          <button
            onClick={() => handleDelete(bookmark.id)}
            disabled={deletingId === bookmark.id}
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-150 hover:scale-110 disabled:opacity-40"
            style={{ color: 'var(--muted)', background: 'var(--paper-dark)' }}
            title="Delete bookmark"
            aria-label={`Delete ${bookmark.title}`}
          >
            {deletingId === bookmark.id ? (
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
            )}
          </button>
        </div>
      ))}
    </div>
  )
}
