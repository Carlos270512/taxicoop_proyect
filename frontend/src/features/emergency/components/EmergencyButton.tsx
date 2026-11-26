import { useEffect, useState } from 'react';
import { PhoneCall, ShieldAlert, Siren } from 'lucide-react';
import { Modal } from '@components/Modal';
import { EMERGENCY_CONTACTS, EMERGENCY_NOTE } from '../model/contacts';

/** Botón flotante de emergencia con los teléfonos de auxilio. */
export function EmergencyButton() {
  const [open, setOpen] = useState(false);

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
      <button
        type="button"
        className="emergency-fab"
        onClick={() => setOpen(true)}
        aria-label="Abrir botón de emergencia"
        title="Botón de emergencia"
      >
        <Siren size={20} />
      </button>

      <Modal open={open} title="Botón de emergencia" onClose={() => setOpen(false)}>
        <p className="emergency-note">
          <ShieldAlert size={14} />
          <span>{EMERGENCY_NOTE}</span>
        </p>

        <div className="emergency-list">
          {EMERGENCY_CONTACTS.map((contact) => (
            <a key={contact.id} className={`emergency-item tone-${contact.tone}`} href={`tel:${contact.number}`}>
              <span className="emergency-icon">
                <PhoneCall size={16} />
              </span>
              <span className="emergency-copy">
                <strong>{contact.label}</strong>
                <span>{contact.detail}</span>
              </span>
              <span className="emergency-number">{contact.number}</span>
            </a>
          ))}
        </div>
      </Modal>
    </>
  );
}
