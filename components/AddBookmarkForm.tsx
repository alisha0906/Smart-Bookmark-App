'use client'

import { useState } from 'react'

type Props = {
  onAdd: (url: string, title: string) => Promise<void>
}

export default function AddBookmarkForm({ onAdd }: Props) {
  const [url, setUrl]       = useState('')
  const [title, setTitle]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Basic URL validation
    try { new URL(url) } catch {
      setError('Please enter a valid URL (include https://)')
      return
    }

    setLoading(true)
    try {
      await onAdd(url.trim(), title.trim())
      setUrl('')
      setTitle('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl p-6 border shadow-sm"
      style={{ background: 'white', borderColor: 'var(--border)' }}>

      <h2 className="font-display text-base font-semibold mb-4" style={{ color: 'var(--ink)' }}>
        Add a bookmark
      </h2>

      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={120}
          className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all duration-150 focus:ring-2"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--paper)',
            color: 'var(--ink)',
            '--tw-ring-color': 'var(--accent)',
          } as React.CSSProperties}
        />
        <input
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all duration-150 focus:ring-2"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--paper)',
            color: 'var(--ink)',
          } as React.CSSProperties}
        />

        {error && (
          <p className="text-xs px-1" style={{ color: 'var(--accent)' }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !url || !title}
          className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'var(--accent)', color: 'white' }}
        >
          {loading ? (
            <>
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              Saving…
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Save bookmark
            </>
          )}
        </button>
      </div>
    </form>
  )
}
