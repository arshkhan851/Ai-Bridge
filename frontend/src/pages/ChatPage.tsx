import { useEffect, useState } from 'react'
import { DocumentPanel } from '../components/DocumentPanel'
import { ExportConversation } from '../components/ExportConversation'
import { ImportTranscript } from '../components/ImportTranscript'
import { MessageBubble } from '../components/MessageBubble'
import { conversation, conversations, createConversation, streamChat } from '../services/api'
import type { Conversation, Message, Provider } from '../types'

const defaults: Record<Provider, string> = { openai: 'gpt-4o-mini', anthropic: 'claude-3-5-haiku-latest', gemini: 'gemini-2.0-flash' }

export function ChatPage() {
  const [provider, setProvider] = useState<Provider>('openai'), [model, setModel] = useState(defaults.openai)
  const [items, setItems] = useState<Conversation[]>([]), [active, setActive] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([]), [prompt, setPrompt] = useState(''), [loading, setLoading] = useState(false), [error, setError] = useState('')
  const refresh = () => conversations().then(setItems).catch(() => undefined)
  useEffect(() => { refresh() }, [])
  const start = async () => { const item = await createConversation(provider, model); setActive(item); setMessages([]); setItems([item, ...items]) }
  const importTranscript = async (imported: Message[]) => { const item = await createConversation(provider, model, imported); setActive(item); setMessages(item.messages); setItems([item, ...items]) }
  const select = async (id: number) => { const item = await conversation(id); setActive(item); setMessages(item.messages); setProvider(item.provider); setModel(item.model); setError('') }
  const send = async () => {
    if (!prompt.trim() || loading) return
    let current = active
    if (!current) { current = await createConversation(provider, model); setActive(current); setItems([current, ...items]) }
    const next = [...messages, { role: 'user' as const, content: prompt }]
    setMessages([...next, { role: 'assistant', content: '' }]); setPrompt(''); setLoading(true); setError('')
    try { await streamChat(provider, model, next, current.id, text => setMessages(all => { const copy = [...all]; copy[copy.length - 1] = { ...copy[copy.length - 1], content: copy[copy.length - 1].content + text }; return copy })); refresh() }
    catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong') }
    finally { setLoading(false) }
  }
  return <main className="min-h-screen lg:flex">
    <aside className="w-full border-b bg-white p-4 lg:w-64 lg:border-b-0 lg:border-r"><button onClick={start} className="w-full rounded-xl bg-bridge px-3 py-2 font-semibold text-white">+ New chat</button><ImportTranscript onImport={importTranscript}/><h2 className="mt-6 text-xs font-bold uppercase tracking-wider text-slate-400">History</h2><nav className="mt-2 space-y-1">{items.map(item => <button key={item.id} onClick={() => select(item.id)} className={`w-full truncate rounded-lg px-3 py-2 text-left text-sm ${active?.id === item.id ? 'bg-blue-50 text-bridge' : 'hover:bg-slate-100'}`}>{item.title}</button>)}</nav></aside>
    <section className="flex min-h-screen flex-1 flex-col"><header className="flex flex-wrap items-center gap-3 border-b bg-white px-6 py-4"><div className="mr-auto"><h1 className="text-xl font-bold">AI Bridge</h1><p className="text-sm text-slate-500">Chats are saved locally.</p></div>{active && <ExportConversation conversation={{...active, messages}}/>}<select aria-label="Provider" value={provider} onChange={e => { const value = e.target.value as Provider; setProvider(value); setModel(defaults[value]) }} className="rounded border p-2"><option value="openai">OpenAI</option><option value="anthropic">Anthropic</option><option value="gemini">Gemini</option></select><input aria-label="Model" value={model} onChange={e => setModel(e.target.value)} className="w-52 rounded border p-2"/></header><div className="flex-1 space-y-4 overflow-y-auto p-6">{messages.length === 0 && <p className="pt-16 text-center text-slate-400">Start a new conversation or select a saved chat.</p>}{messages.map((message, index) => <MessageBubble key={index} message={message}/>)}</div>{error && <p role="alert" className="mx-6 text-sm text-red-600">{error}</p>}<form className="flex gap-3 border-t bg-white p-5" onSubmit={event => { event.preventDefault(); send() }}><textarea aria-label="Message" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Message AI Bridge..." className="min-h-12 flex-1 rounded-xl border p-3"/><button disabled={loading} className="rounded-xl bg-bridge px-5 font-semibold text-white disabled:opacity-50">{loading ? 'Thinking...' : 'Send'}</button></form></section><DocumentPanel/>
  </main>
}
