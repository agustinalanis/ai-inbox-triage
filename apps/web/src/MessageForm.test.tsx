import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Business, Message } from './api.ts';
import {
  COOLDOWN_SECONDS,
  MessageForm,
  WAKING_UP_DELAY_MS,
} from './MessageForm.tsx';

const businesses: Business[] = [
  {
    id: 'consultorio',
    name: 'Consultorio',
    description: '',
    suggestions: ['Quiero un turno para el martes.'],
    categories: [],
  },
];

function renderForm(onCreated = vi.fn()) {
  render(
    <MessageForm
      businesses={businesses}
      businessId="consultorio"
      onBusinessChange={vi.fn()}
      onCreated={onCreated}
    />,
  );
  return {
    onCreated,
    textarea: screen.getByLabelText('Mensaje'),
    submit: () =>
      screen.getByRole<HTMLButtonElement>('button', {
        name: /Clasificar|Clasificando|Esperá/,
      }),
  };
}

const jsonResponse = (status: number, body: unknown) =>
  Promise.resolve(new Response(JSON.stringify(body), { status }));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('MessageForm', () => {
  it('does not allow sending an empty message', () => {
    const { textarea, submit } = renderForm();
    fireEvent.change(textarea, { target: { value: '   ' } });
    expect(submit().disabled).toBe(true);
  });

  it('accepts exactly 1000 characters and rejects 1001', () => {
    const { textarea, submit } = renderForm();
    fireEvent.change(textarea, { target: { value: 'a'.repeat(1000) } });
    expect(submit().disabled).toBe(false);
    expect(screen.queryByRole('alert')).toBeNull();

    fireEvent.change(textarea, { target: { value: 'a'.repeat(1001) } });
    expect(submit().disabled).toBe(true);
    expect(screen.getByRole('alert').textContent).toContain(
      'supera los 1000 caracteres',
    );
  });

  it('shows the limit message the API answers with a 429', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        jsonResponse(429, {
          statusCode: 429,
          message: 'Se alcanzó el límite diario.',
        }),
      ),
    );
    const { textarea, submit, onCreated } = renderForm();
    fireEvent.change(textarea, { target: { value: 'Hola' } });
    fireEvent.click(submit());

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Se alcanzó el límite diario.',
    );
    expect(onCreated).not.toHaveBeenCalled();
    expect(submit().disabled).toBe(false);
  });

  it('tells the user the API is waking up when the request is slow', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {})),
    );
    const { textarea, submit } = renderForm();
    fireEvent.change(textarea, { target: { value: 'Hola' } });
    fireEvent.click(submit());

    expect(screen.queryByRole('status')).toBeNull();
    await act(() => vi.advanceTimersByTimeAsync(WAKING_UP_DELAY_MS));
    expect(screen.getByRole('status').textContent).toContain('despertando');
  });

  it('sends the trimmed message and reports the created one', async () => {
    const created = { id: 'm1' } as Message;
    const fetchMock = vi.fn(() => jsonResponse(201, created));
    vi.stubGlobal('fetch', fetchMock);
    const { textarea, submit, onCreated } = renderForm();
    fireEvent.change(textarea, { target: { value: '  Quiero un turno  ' } });
    fireEvent.click(submit());

    await vi.waitFor(() => expect(onCreated).toHaveBeenCalledWith(created));
    const [, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(JSON.parse(init.body as string)).toEqual({
      businessId: 'consultorio',
      text: 'Quiero un turno',
    });
    expect((textarea as HTMLTextAreaElement).value).toBe('');
  });

  it('fills the message with a suggestion', () => {
    const { textarea, submit } = renderForm();
    fireEvent.click(
      screen.getByRole('button', { name: 'Quiero un turno para el martes.' }),
    );

    expect((textarea as HTMLTextAreaElement).value).toBe(
      'Quiero un turno para el martes.',
    );
    expect(submit().disabled).toBe(false);
  });

  it('waits before allowing another message, at the pace the API allows', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn(() => jsonResponse(201, { id: 'm1' })),
    );
    const { textarea, submit, onCreated } = renderForm();
    fireEvent.change(textarea, { target: { value: 'Hola' } });
    await act(async () => {
      fireEvent.click(submit());
    });
    expect(onCreated).toHaveBeenCalled();

    fireEvent.change(textarea, { target: { value: 'Otro mensaje' } });
    expect(submit().disabled).toBe(true);
    expect(submit().textContent).toBe(
      `Esperá ${COOLDOWN_SECONDS} s para enviar otro`,
    );

    await act(() => vi.advanceTimersByTimeAsync((COOLDOWN_SECONDS - 1) * 1000));
    expect(submit().disabled).toBe(true);
    await act(() => vi.advanceTimersByTimeAsync(1000));
    expect(submit().disabled).toBe(false);
    expect(submit().textContent).toBe('Clasificar mensaje');
  });

  it('locks the business while a message is being sent', async () => {
    let respond: (response: Response) => void = () => {};
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            respond = resolve;
          }),
      ),
    );
    const { textarea, submit } = renderForm();
    const business = screen.getByLabelText<HTMLSelectElement>('Negocio');
    fireEvent.change(textarea, { target: { value: 'Hola' } });
    fireEvent.click(submit());

    expect(business.disabled).toBe(true);
    await act(async () => {
      respond(new Response(JSON.stringify({ id: 'm1' }), { status: 201 }));
    });
    expect(business.disabled).toBe(false);
  });
});
