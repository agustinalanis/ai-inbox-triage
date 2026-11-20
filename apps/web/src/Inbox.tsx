import { useState, type ReactNode } from 'react';
import type { Business, Message, Priority } from './api.ts';

const PRIORITY_LABELS: Record<Priority, string> = {
  urgent: 'Urgente',
  high: 'Alta',
  normal: 'Normal',
  low: 'Baja',
};

const timeFormat = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

interface Props {
  business: Business | undefined;
  messages: Message[];
  loading: boolean;
  error: string | null;
}

export function Inbox({ business, messages, loading, error }: Readonly<Props>) {
  const mine = messages.filter((message) => !message.isExample);
  const examples = messages.filter((message) => message.isExample);

  return (
    <section
      className="inbox"
      aria-labelledby="inbox-title"
      aria-busy={loading}
    >
      <h2 id="inbox-title" className="visually-hidden">
        Bandeja
      </h2>
      {error && (
        <div role="alert">
          <p className="form-error">{error}</p>
          <RetryButton />
        </div>
      )}
      {loading && messages.length === 0 && !error && (
        <p className="muted">Cargando mensajes…</p>
      )}
      {!loading && !error && (
        <>
          <MessageList title="Mis mensajes" business={business} messages={mine}>
            <p className="muted empty">
              Todavía no enviaste mensajes. Escribí uno o probá con una
              sugerencia.
            </p>
          </MessageList>
          {examples.length > 0 && (
            <MessageList
              title="Ejemplos"
              business={business}
              messages={examples}
            />
          )}
        </>
      )}
    </section>
  );
}

function MessageList({
  title,
  business,
  messages,
  children,
}: Readonly<{
  title: string;
  business: Business | undefined;
  messages: Message[];
  children?: ReactNode;
}>) {
  const headingId = `inbox-${title.toLowerCase().replaceAll(' ', '-')}`;
  return (
    <section className="message-list" aria-labelledby={headingId}>
      <h3 id={headingId}>
        {title} <span className="count">{messages.length}</span>
      </h3>
      {messages.length === 0 ? (
        children
      ) : (
        <ol aria-live="polite">
          {messages.map((message) => (
            <li key={message.id}>
              <MessageCard message={message} business={business} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function MessageCard({
  message,
  business,
}: Readonly<{ message: Message; business: Business | undefined }>) {
  const category = business?.categories.find(
    (candidate) => candidate.id === message.category,
  );
  // In the config order: the stored JSON does not keep key order.
  const extracted = (category?.fields ?? []).flatMap(({ key, label }) =>
    message.extracted[key]
      ? [{ key, label, value: message.extracted[key] }]
      : [],
  );
  const sender = message.senderName ?? message.senderEmail ?? 'Anónimo';
  const hasAnalysis = extracted.length > 0 || message.suggestedReply !== null;

  return (
    <article className="card">
      <p className="card-tags">
        <span className={`priority priority-${message.priority}`}>
          {PRIORITY_LABELS[message.priority]}
        </span>
        <span className="tag">{category?.label ?? 'Sin clasificar'}</span>
        {message.needsHuman && (
          <span className="tag human">Requiere humano</span>
        )}
      </p>
      <p className="card-text">{message.text}</p>
      <p className="card-meta">
        {sender} ·{' '}
        <time dateTime={message.createdAt}>
          {timeFormat.format(new Date(message.createdAt))}
        </time>
      </p>
      {hasAnalysis && (
        <details className="analysis">
          <summary>Ver análisis</summary>
          {extracted.length > 0 && (
            <dl className="extracted">
              {extracted.map(({ key, label, value }) => (
                <div key={key}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          )}
          {message.suggestedReply && (
            <DraftReply text={message.suggestedReply} />
          )}
        </details>
      )}
    </article>
  );
}

function DraftReply({ text }: Readonly<{ text: string }>) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (insecure context, denied permission): the text stays selectable.
    }
  }

  return (
    <div className="draft">
      <div className="draft-header">
        <span className="draft-label">Borrador: revisar antes de enviar</span>
        <button type="button" className="link-button" onClick={copy}>
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <p>{text}</p>
    </div>
  );
}

// A failed load usually means the API was asleep or unreachable: reloading retries every request at once.
export function RetryButton() {
  return (
    <button
      type="button"
      className="retry"
      onClick={() => globalThis.location.reload()}
    >
      Reintentar
    </button>
  );
}
