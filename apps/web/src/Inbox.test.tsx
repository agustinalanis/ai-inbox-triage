import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import type { Business, Message } from './api.ts'
import { Inbox } from './Inbox.tsx'

const business: Business = {
  id: 'consultorio',
  name: 'Consultorio',
  description: '',
  categories: [{ id: 'new-appointment', label: 'Pedir turno' }],
}

const message: Message = {
  id: 'm1',
  businessId: 'consultorio',
  senderName: 'Laura',
  senderEmail: null,
  text: 'Quiero un turno',
  category: 'new-appointment',
  priority: 'normal',
  extracted: { insurance: 'OSDE' },
  suggestedReply: 'Hola Laura, el equipo te va a contactar.',
  needsHuman: true,
  confidence: 0.9,
  model: 'gemini',
  latencyMs: 100,
  createdAt: '2026-11-20T12:00:00.000Z',
}

afterEach(cleanup)

describe('Inbox', () => {
  it('labels the suggested reply as a draft to review', () => {
    render(<Inbox business={business} messages={[message]} loading={false} error={null} />)
    expect(screen.getByText('Borrador: revisar antes de enviar')).toBeTruthy()
    expect(screen.getByText(message.suggestedReply!)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Copiar' })).toBeTruthy()
    expect(screen.getByText('Pedir turno')).toBeTruthy()
    expect(screen.getByText('Requiere humano')).toBeTruthy()
  })

  it('shows no draft for escalated messages and labels unclassified ones', () => {
    render(
      <Inbox
        business={business}
        messages={[{ ...message, category: null, suggestedReply: null }]}
        loading={false}
        error={null}
      />,
    )
    expect(screen.queryByText('Borrador: revisar antes de enviar')).toBeNull()
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.getByText('Sin clasificar')).toBeTruthy()
  })
})
