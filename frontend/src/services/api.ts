import type { Conversation, Document, Message, Provider } from '../types'
const BASE = 'http://localhost:8000/api'
export async function documents(): Promise<Document[]> { const r = await fetch(`${BASE}/documents`); return r.json() }
export async function addDocument(title: string, content: string): Promise<Document> { const r = await fetch(`${BASE}/documents`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({title, content}) }); if (!r.ok) throw new Error('Could not save document'); return r.json() }
export async function conversations(): Promise<Conversation[]> { const r = await fetch(`${BASE}/conversations`); return r.json() }
export async function createConversation(provider: Provider, model: string, messages: Message[] = []): Promise<Conversation> { const r = await fetch(`${BASE}/conversations`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({provider, model, messages})}); if (!r.ok) throw new Error('Could not create conversation'); return r.json() }
export async function conversation(id: number): Promise<Conversation> { const r = await fetch(`${BASE}/conversations/${id}`); if (!r.ok) throw new Error('Could not load conversation'); return r.json() }
export async function streamChat(provider: Provider, model: string, messages: Message[], conversationId: number, onToken: (text: string) => void): Promise<void> {
  const response = await fetch(`${BASE}/chat/stream`, {method:'POST', headers:{'Content-Type':'application/json','Accept':'text/event-stream'}, body:JSON.stringify({provider, model, messages, conversation_id: conversationId})})
  if (!response.ok || !response.body) throw new Error('Could not connect to AI Bridge')
  const reader = response.body.getReader(), decoder = new TextDecoder(); let buffer = ''
  while (true) { const {done, value} = await reader.read(); if (done) break; buffer += decoder.decode(value, {stream:true}); const events = buffer.split('\n\n'); buffer = events.pop() ?? ''; for (const event of events) { const data = event.split('\n').find(line => line.startsWith('data: '))?.slice(6); if (data && event.includes('event: token')) onToken(JSON.parse(data).text); if (data && event.includes('event: error')) throw new Error(JSON.parse(data).message) } }
}
