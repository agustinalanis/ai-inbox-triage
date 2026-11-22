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
  const [latestId, setLatestId] = useState<string | null>(null);

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
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <p className="brand">
            AI Inbox <span>Triage</span>
          </p>
          <nav className="topbar-links" aria-label="Sobre el proyecto">
            <a href="https://github.com/agustinalanis/ai-inbox-triage">
              Código
            </a>
            <a href="https://agusdev-portfolio.vercel.app/proyectos/ai-inbox-triage">
              Caso de estudio
            </a>
          </nav>
        </div>
      </header>
      <div className="app">
        <main className="layout">
          <div className="compose">
            <div className="intro">
              <h1>
                <span>Escribí como un cliente.</span>{' '}
                <span>La IA ordena el resto.</span>
              </h1>
              <p>
                Clasifica el mensaje, le asigna prioridad, extrae los datos y
                deja un borrador de respuesta para que lo revise el equipo.
              </p>
            </div>
            {businessId ? (
              <MessageForm
                businesses={businesses}
                businessId={businessId}
                onBusinessChange={(id) => {
                  setMessages([]);
                  setLoading(true);
                  setError(null);
                  setLatestId(null);
                  setBusinessId(id);
                }}
                onCreated={(message) => {
                  setMessages((list) => sortInbox([message, ...list]));
                  setLatestId(message.id);
                }}
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
          </div>
          {businessId && (
            <Inbox
              business={business}
              messages={messages}
              loading={loading}
              error={error}
              latestId={latestId}
            />
          )}
        </main>
      </div>
    </>
  );
}

export default App;
