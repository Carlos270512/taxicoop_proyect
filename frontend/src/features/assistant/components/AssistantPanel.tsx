import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Bot, RotateCcw, SendHorizonal, ShieldAlert, Sparkles, X } from 'lucide-react';
import { useAuth } from '@features/auth';
import { SUGGESTIONS } from '../model/types';
import type { ChatMessage } from '../model/types';
import { MessageBubble, TypingBubble } from './MessageBubble';
import { SuggestedQuestions } from './SuggestedQuestions';

type AssistantPanelProps = {
  messages: ChatMessage[];
  isSending: boolean;
  error: string | null;
  onSend: (text: string) => void;
  onReset: () => void;
  onClose: () => void;
};

export function AssistantPanel({ messages, isSending, error, onSend, onReset, onClose }: AssistantPanelProps) {
  const { user } = useAuth();
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.roles.includes('ADMIN') ?? false;
  const suggestions = SUGGESTIONS[isAdmin ? 'ADMIN' : 'SOCIO'];

  useEffect(() => {
    const container = scrollRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages.length, isSending, error]);

  function submit() {
    const text = draft.trim();
    if (!text || isSending) return;
    setDraft('');
    onSend(text);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <section className="assistant-panel" role="dialog" aria-label="Asistente TaxiCoop">
      <header className="assistant-panel-head">
        <div className="assistant-title">
          <span className="assistant-title-icon">
            <Bot size={18} />
          </span>
          <div>
            <strong>Asistente TaxiCoop</strong>
            <span>Preguntas sobre el sistema</span>
          </div>
        </div>
        <div className="assistant-head-actions">
          <button type="button" onClick={onReset} disabled={messages.length === 0 || isSending} title="Nueva conversación" aria-label="Nueva conversación">
            <RotateCcw size={15} />
          </button>
          <button type="button" onClick={onClose} title="Cerrar" aria-label="Cerrar asistente">
            <X size={16} />
          </button>
        </div>
      </header>

      <div className="assistant-messages" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="assistant-empty">
            <div className="assistant-empty-icon">
              <Sparkles size={20} />
            </div>
            <strong>¿En qué te ayudo?</strong>
            <span>Puedo responderte sobre socios, unidades, votaciones y cómo usar el panel.</span>
          </div>
        ) : null}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isSending ? <TypingBubble /> : null}

        {error ? (
          <div className="assistant-error" role="alert">
            <ShieldAlert size={14} />
            <span>{error}</span>
          </div>
        ) : null}
      </div>

      {messages.length === 0 ? (
        <SuggestedQuestions questions={suggestions} onPick={onSend} disabled={isSending} />
      ) : null}

      <form className="assistant-composer" onSubmit={handleSubmit}>
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Escribe tu pregunta…"
          aria-label="Escribe tu pregunta"
          autoFocus
        />
        <button type="submit" disabled={!draft.trim() || isSending} aria-label="Enviar pregunta">
          <SendHorizonal size={16} />
        </button>
      </form>
    </section>
  );
}
