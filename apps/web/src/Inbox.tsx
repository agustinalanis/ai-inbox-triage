import { useState } from 'react'
import type { Business, Message, Priority } from './api.ts'

const PRIORITY_LABELS: Record<Priority, string> = {
  urgent: 'Urgente',
  high: 'Alta',
  normal: 'Normal',
  low: 'Baja',
}

const timeFormat = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' })

interface Props {
  business: Business | undefined
  messages: Message[]
  loading: boolean
  error: string | null
}

export function Inbox({ business, messages, loading, error }: Readonly<Props>) {
  const categoryLabel = (id: string | null) =>
    business?.categories.find((category) => category.id === id)?.label ?? 'Sin clasificar'

  return (
    <section className="panel inbox" aria-labelledby="inbox-title" aria-busy={loading}>
      <h2 id="inbox-title">Bandeja{business && <span className="muted"> · {business.name}</span>}</h2>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {loading && messages.length === 0 && <p className="muted">Cargando mensajes…</p>}
      {!loading && !error && messages.length === 0 && (
        <p className="muted">No hay mensajes todavía.</p>
      )}
      <ol className="messages" aria-live="polite">
        {messages.map((message) => (
          <li key={message.id}>
            <MessageCard message={message} categoryLabel={categoryLabel(message.category)} />
          </li>
        ))}
      </ol>
    </section>
  )
}

function MessageCard({ message, categoryLabel }: Readonly<{ message: Message; categoryLabel: string }>) {
  const extracted = Object.entries(message.extracted)
  const sender = message.senderName ?? message.senderEmail ?? 'Anónimo'

  return (
    <article className="card">
      <header className="card-header">
        <span className={`badge priority-${message.priority}`}>
          {PRIORITY_LABELS[message.priority]}
        </span>
        <span className="badge category">{categoryLabel}</span>
        {message.needsHuman && <span className="badge human">Requiere humano</span>}
      </header>
      <p className="card-meta">
        {sender} · <time dateTime={message.createdAt}>{timeFormat.format(new Date(message.createdAt))}</time>
      </p>
      <p className="card-text">{message.text}</p>
      {extracted.length > 0 && (
        <dl className="extracted">
          {extracted.map(([key, value]) => (
            <div key={key}>
              <dt>{key}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}
      {message.suggestedReply && <DraftReply text={message.suggestedReply} />}
    </article>
  )
}

function DraftReply({ text }: Readonly<{ text: string }>) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked (insecure context, denied permission): the text stays selectable.
    }
  }

  return (
    <div className="draft">
      <div className="draft-header">
        <span className="draft-label">Borrador: revisar antes de enviar</span>
        <button type="button" className="secondary" onClick={copy}>
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <p>{text}</p>
    </div>
  )
}
