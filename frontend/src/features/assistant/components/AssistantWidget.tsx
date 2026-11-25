import { useEffect, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useAssistant } from '../hooks/useAssistant';
import { AssistantPanel } from './AssistantPanel';

/** Boton flotante + panel del asistente. Se monta una sola vez en el layout. */
export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const { messages, isSending, error, send, reset } = useAssistant();

  useEffect(() => {
    if (!open) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open]);

  return (
    <>
      {open ? (
        <div className="assistant-shell">
          <AssistantPanel
            messages={messages}
            isSending={isSending}
            error={error}
            onSend={send}
            onReset={reset}
            onClose={() => setOpen(false)}
          />
        </div>
      ) : null}

      <button
        type="button"
        className={`assistant-fab${open ? ' open' : ''}`}
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? 'Cerrar asistente' : 'Abrir asistente'}
        title={open ? 'Cerrar asistente' : 'Asistente TaxiCoop'}
      >
        {open ? <X size={20} /> : <Sparkles size={20} />}
      </button>
    </>
  );
}
