import { useEffect, useId, useRef, useState, type SubmitEvent } from 'react';
import {
  ApiError,
  MAX_MESSAGE_LENGTH,
  postMessage,
  type Business,
  type Message,
} from './api.ts';

// The free-tier API host sleeps when idle; past this delay, the first request is probably waking it up.
export const WAKING_UP_DELAY_MS = 3000;

// The API allows 5 messages per minute per IP: pacing sends at that rate means visitors never hit its 429.
export const COOLDOWN_SECONDS = 12;

interface Props {
  businesses: Business[];
  businessId: string;
  onBusinessChange: (id: string) => void;
  onCreated: (message: Message) => void;
}

export function MessageForm({
  businesses,
  businessId,
  onBusinessChange,
  onCreated,
}: Readonly<Props>) {
  const id = useId();
  const [text, setText] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [wakingUp, setWakingUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // When the visitor may send again, and the clock that counts down to it.
  const [cooldownEnd, setCooldownEnd] = useState(0);
  const [now, setNow] = useState(Date.now);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const suggestions =
    businesses.find((business) => business.id === businessId)?.suggestions ??
    [];

  useEffect(() => {
    if (!sending) return;
    const timer = setTimeout(() => setWakingUp(true), WAKING_UP_DELAY_MS);
    return () => {
      clearTimeout(timer);
      setWakingUp(false);
    };
  }, [sending]);

  useEffect(() => {
    if (cooldownEnd === 0) return;
    const timer = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= cooldownEnd) clearInterval(timer);
    }, 250);
    return () => clearInterval(timer);
  }, [cooldownEnd]);

  const cooldown = Math.max(0, Math.ceil((cooldownEnd - now) / 1000));

  const length = text.trim().length;
  const tooLong = length > MAX_MESSAGE_LENGTH;
  const canSend = length > 0 && !tooLong && !sending && cooldown === 0;

  function applySuggestion(suggestion: string) {
    setText(suggestion);
    setError(null);
    textRef.current?.focus();
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSend) return;
    setSending(true);
    setError(null);
    try {
      const message = await postMessage({
        businessId,
        text: text.trim(),
        senderName: senderName.trim() || undefined,
        senderEmail: senderEmail.trim() || undefined,
      });
      setText('');
      const sentAt = Date.now();
      setNow(sentAt);
      setCooldownEnd(sentAt + COOLDOWN_SECONDS * 1000);
      onCreated(message);
    } catch (error_) {
      setError(
        error_ instanceof ApiError
          ? error_.message
          : 'Algo salió mal. Probá de nuevo.',
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="panel form" onSubmit={handleSubmit} noValidate>
      <h2>Nuevo mensaje</h2>

      <label htmlFor={`${id}-business`}>Negocio</label>
      <select
        id={`${id}-business`}
        value={businessId}
        onChange={(event) => onBusinessChange(event.target.value)}
      >
        {businesses.map((business) => (
          <option key={business.id} value={business.id}>
            {business.name}
          </option>
        ))}
      </select>

      <div className="form-row">
        <div>
          <label htmlFor={`${id}-name`}>
            Nombre <span className="optional">(opcional)</span>
          </label>
          <input
            id={`${id}-name`}
            value={senderName}
            maxLength={100}
            autoComplete="off"
            onChange={(event) => setSenderName(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor={`${id}-email`}>
            Email <span className="optional">(opcional)</span>
          </label>
          <input
            id={`${id}-email`}
            type="email"
            value={senderEmail}
            autoComplete="off"
            onChange={(event) => setSenderEmail(event.target.value)}
          />
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="suggestions">
          <p className="suggestions-title">
            ¿No sabés qué escribir? Probá con uno de estos:
          </p>
          <ul>
            {suggestions.map((suggestion) => (
              <li key={suggestion}>
                <button
                  type="button"
                  className="suggestion"
                  onClick={() => applySuggestion(suggestion)}
                >
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <label htmlFor={`${id}-text`}>Mensaje</label>
      <textarea
        ref={textRef}
        id={`${id}-text`}
        rows={6}
        value={text}
        placeholder="Ej.: Hola, quiero sacar un turno para el martes a la mañana. Tengo OSDE."
        aria-invalid={tooLong}
        aria-describedby={`${id}-count`}
        onChange={(event) => setText(event.target.value)}
      />
      <p
        id={`${id}-count`}
        className={tooLong ? 'counter counter-over' : 'counter'}
      >
        {length}/{MAX_MESSAGE_LENGTH}
      </p>
      {tooLong && (
        <p className="form-error" role="alert">
          El mensaje supera los {MAX_MESSAGE_LENGTH} caracteres.
        </p>
      )}

      <button type="submit" className="primary" disabled={!canSend}>
        {submitLabel(sending, cooldown)}
      </button>

      {wakingUp && (
        <output className="form-status">
          La API se está despertando, puede tardar unos segundos…
        </output>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <p className="privacy">
        Es una demo: los mensajes se procesan con Google Gemini (nivel
        gratuito), donde Google puede usarlos para mejorar sus productos y
        revisores humanos pueden leerlos. No escribas datos personales reales.{' '}
        <a
          href="https://ai.google.dev/gemini-api/terms"
          target="_blank"
          rel="noreferrer"
        >
          Términos de Gemini API
        </a>
      </p>
    </form>
  );
}

function submitLabel(sending: boolean, cooldown: number): string {
  if (sending) return 'Clasificando…';
  if (cooldown > 0) return `Esperá ${cooldown} s para enviar otro`;
  return 'Clasificar mensaje';
}
