import { useEffect, useState } from 'react'
import { addDocument, documents } from '../services/api'
import type { Document } from '../types'
export function DocumentPanel() {
  const [items, setItems] = useState<Document[]>([]), [title, setTitle] = useState(''), [content, setContent] = useState('')
  useEffect(() => { documents().then(setItems).catch(() => undefined) }, [])
  const save = async () => { if (!title.trim() || !content.trim()) return; const item = await addDocument(title, content); setItems([item, ...items]); setTitle(''); setContent('') }
  return <aside className="w-full border-t border-slate-200 p-5 lg:w-80 lg:border-l lg:border-t-0"><h2 className="font-bold">Local context</h2><p className="mt-1 text-sm text-slate-500">FTS5-searchable notes</p><input aria-label="Document title" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="mt-4 w-full rounded border p-2"/><textarea aria-label="Document content" value={content} onChange={e=>setContent(e.target.value)} placeholder="Paste a note or project context" className="mt-2 h-24 w-full rounded border p-2"/><button onClick={save} className="mt-2 rounded bg-slate-800 px-3 py-2 text-sm font-medium text-white">Save context</button><ul className="mt-5 space-y-2">{items.map(item=><li key={item.id} className="rounded bg-white p-3 text-sm shadow-sm"><strong>{item.title}</strong><p className="mt-1 line-clamp-2 text-slate-500">{item.content}</p></li>)}</ul></aside>
}
