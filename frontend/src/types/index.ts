export type Provider = 'openai' | 'anthropic' | 'gemini'
export type Message = { role: 'user' | 'assistant' | 'system'; content: string }
export type Document = { id: number; title: string; content: string }
export type Conversation = { id: number; title: string; provider: Provider; model: string; messages: Message[] }
