import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import type { Message } from '../types'
export function MessageBubble({ message }: { message: Message }) {
  return <article className={`max-w-3xl rounded-2xl px-5 py-4 ${message.role === 'user' ? 'ml-auto bg-bridge text-white' : 'bg-white shadow-sm ring-1 ring-slate-200'}`}>
    <p className="mb-2 text-xs font-bold uppercase tracking-widest opacity-60">{message.role}</p>
    <div className="prose prose-slate max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>{message.content}</ReactMarkdown></div>
  </article>
}
