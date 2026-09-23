import type { Conversation } from '../types'

function download(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a')
  link.href = url; link.download = filename; link.click()
  URL.revokeObjectURL(url)
}
function safeName(title: string) { return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'conversation' }

export function ExportConversation({ conversation }: { conversation: Conversation }) {
  const markdown = () => {
    const header = `# ${conversation.title}\n\n_Provider: ${conversation.provider} · Model: ${conversation.model}_\n\n`
    const turns = conversation.messages.map(message => `## ${message.role === 'user' ? 'User' : message.role === 'assistant' ? 'Assistant' : 'System'}\n\n${message.content}`).join('\n\n')
    download(`${safeName(conversation.title)}.md`, header + turns + '\n', 'text/markdown;charset=utf-8')
  }
  const json = () => download(`${safeName(conversation.title)}.json`, JSON.stringify(conversation, null, 2), 'application/json;charset=utf-8')
  return <div className="flex gap-2"><button onClick={markdown} className="rounded border px-3 py-2 text-sm font-medium hover:bg-slate-50">Export .md</button><button onClick={json} className="rounded border px-3 py-2 text-sm font-medium hover:bg-slate-50">Export JSON</button></div>
}
