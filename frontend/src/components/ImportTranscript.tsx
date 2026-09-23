import { useState } from 'react'
import type { Message } from '../types'

const speaker = /^(?:user|you|human)\s*:\s*/i
const assistant = /^(?:assistant|chatgpt|claude|gemini|ai)\s*:\s*/i

export function parseTranscript(value: string): Message[] {
  const messages: Message[] = []
  let current: Message | null = null
  for (const line of value.replace(/\r/g, '').split('\n')) {
    const role = speaker.test(line) ? 'user' : assistant.test(line) ? 'assistant' : null
    if (role) { if (current?.content.trim()) messages.push({...current, content: current.content.trim()}); current = {role, content: line.replace(speaker, '').replace(assistant, '')} }
    else if (current) current.content += `\n${line}`
  }
  if (current?.content.trim()) messages.push({...current, content: current.content.trim()})
  return messages.length ? messages : value.trim() ? [{role: 'user', content: value.trim()}] : []
}

export function ImportTranscript({ onImport }: { onImport: (messages: Message[]) => Promise<void> }) {
  const [value, setValue] = useState(''), [error, setError] = useState('')
  const submit = async () => { const messages = parseTranscript(value); if (!messages.length) { setError('Paste a conversation first.'); return }; await onImport(messages); setValue(''); setError('') }
  return <details className="mt-3"><summary className="cursor-pointer text-sm font-medium text-slate-600">Import transcript</summary><p className="mt-2 text-xs text-slate-500">Paste turns labelled User/You and Assistant/ChatGPT/Claude/Gemini.</p><textarea aria-label="Transcript" value={value} onChange={event => setValue(event.target.value)} placeholder={'User: Hello\nAssistant: Hi!'} className="mt-2 h-28 w-full rounded border p-2 text-sm"/><button onClick={submit} className="mt-2 rounded bg-slate-800 px-3 py-2 text-sm font-medium text-white">Import and continue</button>{error && <p className="mt-1 text-xs text-red-600">{error}</p>}</details>
}
