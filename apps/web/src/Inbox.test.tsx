import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Business, Message } from './api.ts';
import { Inbox } from './Inbox.tsx';

const business: Business = {
  id: 'consultorio',
  name: 'Consultorio',
  description: '',
  suggestions: [],
  categories: [
    {
      id: 'new-appointment',
      label: 'Pedir turno',
      fields: [
        { key: 'patientName', label: 'Paciente' },
        { key: 'insurance', label: 'Obra social' },
      ],
    },
  ],
};

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
  isExample: false,
  createdAt: '2026-11-20T12:00:00.000Z',
};

const renderInbox = (messages: Message[]) =>
  render(
    <Inbox
      business={business}
      messages={messages}
      loading={false}
      error={null}
    />,
  );

const section = (name: string) =>
  screen.getByRole('region', { name: new RegExp(`^${name}`) });

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('Inbox', () => {
  it('separates the visitor messages from the examples', () => {
    renderInbox([
      message,
      { ...message, id: 'e1', text: 'Un ejemplo', isExample: true },
    ]);

    expect(
      within(section('Mis mensajes')).getByText('Quiero un turno'),
    ).toBeTruthy();
    expect(
      within(section('Mis mensajes')).queryByText('Un ejemplo'),
    ).toBeNull();
    expect(within(section('Ejemplos')).getByText('Un ejemplo')).toBeTruthy();
  });

  it('invites to write when the visitor has not sent anything yet', () => {
    renderInbox([{ ...message, isExample: true }]);

    expect(
      within(section('Mis mensajes')).getByText(/Todavía no enviaste mensajes/),
    ).toBeTruthy();
  });

  it('shows the analysis with field labels and the reply labeled as a draft', () => {
    const { container } = renderInbox([message]);
    container.querySelector('details')!.open = true;

    expect(screen.getByText('Pedir turno')).toBeTruthy();
    expect(screen.getByText('Requiere humano')).toBeTruthy();
    expect(screen.getByText('Obra social')).toBeTruthy();
    expect(screen.queryByText('insurance')).toBeNull();
    expect(screen.getByText('Borrador: revisar antes de enviar')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Copiar' })).toBeTruthy();
  });

  it('lists the extracted data in the config order, whatever order it was stored in', () => {
    const { container } = renderInbox([
      { ...message, extracted: { insurance: 'OSDE', patientName: 'Laura' } },
    ]);

    const labels = [...container.querySelectorAll('dt')].map(
      (dt) => dt.textContent,
    );
    expect(labels).toEqual(['Paciente', 'Obra social']);
  });

  it('shows no analysis for unclassified messages without data or draft', () => {
    renderInbox([
      { ...message, category: null, extracted: {}, suggestedReply: null },
    ]);

    expect(screen.getByText('Sin clasificar')).toBeTruthy();
    expect(screen.queryByText('Ver análisis')).toBeNull();
    expect(screen.queryByText('Borrador: revisar antes de enviar')).toBeNull();
  });

  it('confirms the copy for two seconds', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn(() => Promise.resolve()) },
    });
    renderInbox([message]);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copiar' }));
    });
    expect(screen.getByRole('button', { name: 'Copiado' })).toBeTruthy();

    await act(() => vi.advanceTimersByTimeAsync(2000));
    expect(screen.getByRole('button', { name: 'Copiar' })).toBeTruthy();
  });

  it('keeps the copy button as is when the clipboard is blocked', async () => {
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: vi.fn(() => Promise.reject(new Error('denied'))),
      },
    });
    renderInbox([message]);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copiar' }));
    });
    expect(screen.getByRole('button', { name: 'Copiar' })).toBeTruthy();
  });
});

describe('Inbox, after the visitor sends a message', () => {
  // jsdom does not implement scrolling.
  const scrollIntoView = vi.fn();

  afterEach(() => {
    scrollIntoView.mockClear();
    Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
  });

  const renderWithLatest = (messages: Message[], latestId: string | null) => {
    Element.prototype.scrollIntoView = scrollIntoView;
    render(
      <Inbox
        business={business}
        messages={messages}
        loading={false}
        error={null}
        latestId={latestId}
      />,
    );
  };

  it('brings only the new message into view', () => {
    renderWithLatest(
      [{ ...message, id: 'm2', text: 'Mensaje nuevo' }, message],
      'm2',
    );

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView.mock.contexts[0]).toHaveProperty(
      'textContent',
      expect.stringContaining('Mensaje nuevo'),
    );
    expect(scrollIntoView).toHaveBeenCalledWith({
      block: 'nearest',
      behavior: 'smooth',
    });
  });

  it('does not scroll when the latest id is not in the inbox', () => {
    renderWithLatest([message], 'stale-id');
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('jumps without animation when the visitor prefers reduced motion', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    renderWithLatest([message], 'm1');
    expect(scrollIntoView).toHaveBeenCalledWith({
      block: 'nearest',
      behavior: 'auto',
    });
  });
});
