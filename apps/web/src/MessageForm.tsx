import { useEffect, useId, useState, type SubmitEvent } from 'react'
import { ApiError, MAX_MESSAGE_LENGTH, postMessage, type Business, type Message } from './api.ts'

// The free-tier API host sleeps when idle; past this delay, the first request is probably waking it up.
export const WAKING_UP_DELAY_MS = 3000

interface Props {
  businesses: Business[]
  businessId: string
  onBusinessChange: (id: string) => void
  onCreated: (message: Message) => void
}

export function MessageForm({ businesses, businessId, onBusinessChange, onCreated }: Readonly<Props>) {
  const id = useId()
  const [text, setText] = useState('')
  const [senderName, setSenderName] = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [wakingUp, setWakingUp] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sending) return
    const timer = setTimeout(() => setWakingUp(true), WAKING_UP_DELAY_MS)
    return () => {
      clearTimeout(timer)
      setWakingUp(false)
    }
  }, [sending])

  const length = text.trim().length
  const tooLong = length > MAX_MESSAGE_LENGTH
  const canSend = length > 0 && !tooLong && !sending

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSend) return
    setSending(true)
    setError(null)
    try {
      const message = await postMessage({
        businessId,
        text: text.trim(),
        senderName: senderName.trim() || undefined,
        senderEmail: senderEmail.trim() || undefined,
      })
      setText('')
      onCreated(message)
    } catch (error_) {
      setError(error_ instanceof ApiError ? error_.message : 'Algo salió mal. Probá de nuevo.')
    } finally {
      setSending(false)
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

      <label htmlFor={`${id}-text`}>Mensaje</label>
      <textarea
        id={`${id}-text`}
        rows={6}
        value={text}
        placeholder="Ej.: Hola, quiero sacar un turno para el martes a la mañana. Tengo OSDE."
        aria-invalid={tooLong}
        aria-describedby={`${id}-count`}
        onChange={(event) => setText(event.target.value)}
      />
      <p id={`${id}-count`} className={tooLong ? 'counter counter-over' : 'counter'}>
        {length}/{MAX_MESSAGE_LENGTH}
      </p>
      {tooLong && (
        <p className="form-error" role="alert">
          El mensaje supera los {MAX_MESSAGE_LENGTH} caracteres.
        </p>
      )}

      <button type="submit" disabled={!canSend}>
        {sending ? 'Clasificando…' : 'Clasificar mensaje'}
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
        Es una demo: los mensajes se procesan con Google Gemini (nivel gratuito), donde Google puede
        usarlos para mejorar sus productos y revisores humanos pueden leerlos. No escribas datos
        personales reales.{' '}
        <a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noreferrer">
          Términos de Gemini API
        </a>
      </p>
    </form>
  )
}
