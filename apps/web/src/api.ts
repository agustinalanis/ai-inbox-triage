import { getSessionId } from './session.ts'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export const MAX_MESSAGE_LENGTH = 1000

export type Priority = 'low' | 'normal' | 'high' | 'urgent'

export interface Business {
  id: string
  name: string
  description: string
  categories: { id: string; label: string }[]
}

// Mirrors the API response of /messages.
export interface Message {
  id: string
  businessId: string
  senderName: string | null
  senderEmail: string | null
  text: string
  /** null when the classifier fell back and a person must review it. */
  category: string | null
  priority: Priority
  extracted: Record<string, string>
  suggestedReply: string | null
  needsHuman: boolean
  confidence: number
  model: string | null
  latencyMs: number
  createdAt: string
}

export interface NewMessage {
  businessId: string
  text: string
  senderName?: string
  senderEmail?: string
}

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        'X-Demo-Session': getSessionId(),
      },
    })
  } catch {
    throw new ApiError(0, 'No pudimos conectar con la API. Probá de nuevo en unos segundos.')
  }
  const body: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    throw new ApiError(response.status, errorMessage(response.status, body))
  }
  return body as T
}

// 429 messages come in Spanish from the API; the rest are developer-facing, so they get a generic text.
function errorMessage(status: number, body: unknown): string {
  const message = (body as { message?: unknown } | null)?.message
  if (status === 429 && typeof message === 'string') return message
  if (status === 400) return 'Revisá los datos del mensaje.'
  return 'Algo salió mal en la API. Probá de nuevo.'
}

export const getBusinesses = () => request<Business[]>('/businesses')

export const getMessages = (businessId: string) =>
  request<Message[]>(`/messages?businessId=${encodeURIComponent(businessId)}`)

export const postMessage = (input: NewMessage) =>
  request<Message>('/messages', { method: 'POST', body: JSON.stringify(input) })

const PRIORITY_RANK: Record<Priority, number> = { low: 0, normal: 1, high: 2, urgent: 3 }

/** Same order as the API: priority, then newest first. */
export function sortInbox(messages: Message[]): Message[] {
  return messages.toSorted(
    (a, b) =>
      PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority] ||
      b.createdAt.localeCompare(a.createdAt),
  )
}
