import { useState } from 'react';
import { CheckCircle2, Vote as VoteIcon } from 'lucide-react';
import { Button } from '@components/Button';
import { Modal } from '@components/Modal';
import type { Election } from '../model/types';

type VotePanelProps = {
  election: Election;
  isVoting: boolean;
  error?: string | null;
  onVote: (optionId: string) => void;
};

export function VotePanel({ election, isVoting, error, onVote }: VotePanelProps) {
  const [selected, setSelected] = useState<string>('');
  const [confirming, setConfirming] = useState(false);

  const selectedOption = election.options.find((option) => option.id === selected);

  if (election.hasVoted) {
    return (
      <div className="locked-note">
        <CheckCircle2 size={16} />
        <span>Ya registraste tu voto en esta elección. Tu voto no se puede modificar.</span>
      </div>
    );
  }

  return (
    <>
      <div className="option-list" role="radiogroup" aria-label="Opciones de voto">
        {election.options.map((option) => (
          <label
            key={option.id}
            className={`option-item${selected === option.id ? ' selected' : ''}`}
          >
            <input
              type="radio"
              name="voto"
              value={option.id}
              checked={selected === option.id}
              onChange={() => setSelected(option.id)}
              disabled={isVoting}
            />
            <span className="option-copy">
              <strong>{option.title}</strong>
              {option.description ? <span>{option.description}</span> : null}
            </span>
          </label>
        ))}
      </div>

      {error ? <p className="form-error" role="alert">{error}</p> : null}

      <div className="vote-actions">
        <Button onClick={() => setConfirming(true)} disabled={!selected || isVoting}>
          <VoteIcon size={15} /> {isVoting ? 'Registrando…' : 'Emitir mi voto'}
        </Button>
      </div>

      <Modal
        open={confirming}
        title="Confirmar voto"
        onClose={() => { if (!isVoting) setConfirming(false); }}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirming(false)} disabled={isVoting}>
              Cancelar
            </Button>
            <Button
              onClick={() => { setConfirming(false); onVote(selected); }}
              disabled={isVoting}
            >
              Confirmar voto
            </Button>
          </>
        }
      >
        <p className="confirm-text">
          Vas a votar por <strong>{selectedOption?.title ?? ''}</strong>.
        </p>
        <p className="confirm-hint">Esta acción no se puede deshacer ni cambiar después.</p>
      </Modal>
    </>
  );
}
