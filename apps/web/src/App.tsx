import { useEffect, useState } from 'react';
import './App.css';
import {
  ApiError,
  getBusinesses,
  getMessages,
  sortInbox,
  type Business,
  type Message,
} from './api.ts';
import { Inbox, RetryButton } from './Inbox.tsx';
import { MessageForm } from './MessageForm.tsx';

const errorText = (error: unknown) =>
  error instanceof ApiError ? error.message : 'Algo salió mal. Probá de nuevo.';

function App() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getBusinesses()
      .then((list) => {
        setBusinesses(list);
        setBusinessId(list[0]?.id ?? null);
      })
      .catch((error_: unknown) => {
        setError(errorText(error_));
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!businessId) return;
    // Ignores a slow response that arrives after the user switched business.
    let current = true;
    getMessages(businessId)
      .then((list) => current && setMessages(list))
      .catch((error_: unknown) => current && setError(errorText(error_)))
      .finally(() => current && setLoading(false));
    return () => {
      current = false;
    };
  }, [businessId]);

  const business = businesses.find((candidate) => candidate.id === businessId);

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI Inbox Triage</h1>
        <p className="muted">
          Escribí como si fueras un cliente. La IA clasifica el mensaje, le
          asigna prioridad y prepara un borrador de respuesta para el equipo.
        </p>
      </header>
      <main className="layout">
        {businessId ? (
          <MessageForm
            businesses={businesses}
            businessId={businessId}
            onBusinessChange={(id) => {
              setMessages([]);
              setLoading(true);
              setError(null);
              setBusinessId(id);
            }}
            onCreated={(message) =>
              setMessages((list) => sortInbox([message, ...list]))
            }
          />
        ) : (
          <section className="panel">
            {error ? (
              <div role="alert">
                <p className="form-error">{error}</p>
                <RetryButton />
              </div>
            ) : (
              <p className="muted">Cargando…</p>
            )}
          </section>
        )}
        {businessId && (
          <Inbox
            business={business}
            messages={messages}
            loading={loading}
            error={error}
          />
        )}
      </main>
    </div>
  );
}

export default App;
