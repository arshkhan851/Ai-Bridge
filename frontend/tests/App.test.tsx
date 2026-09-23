import { render, screen } from '@testing-library/react'
import App from '../src/App'
import { expect, test, vi } from 'vitest'
vi.mock('../src/services/api', () => ({ documents: vi.fn().mockResolvedValue([]), addDocument: vi.fn(), conversations: vi.fn().mockResolvedValue([]), createConversation: vi.fn(), conversation: vi.fn(), streamChat: vi.fn() }))
test('renders the chat workspace', () => { render(<App />); expect(screen.getByText('AI Bridge')).toBeInTheDocument(); expect(screen.getByLabelText('Provider')).toBeInTheDocument() })
