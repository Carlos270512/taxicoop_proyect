import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@components/Button';
import { Input } from '@components/Input';
import { Modal } from '@components/Modal';
import { useElections } from '@features/votacion';
import { getApiErrorMessage } from '@shared/api/errors';
import { hoyISO } from '../model/types';
import { useReunionMutations } from '../hooks/useReuniones';

type ReunionFormModalProps = {
  open: boolean;
  onClose: () => void;
};

export function ReunionFormModal({ open, onClose }: ReunionFormModalProps) {
  const { crear } = useReunionMutations();
  const { data: elecciones } = useElections({ status: '', page: 1, limit: 30 });

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(hoyISO);
  const [eleccionId, setEleccionId] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitulo('');
    setDescripcion('');
    setFecha(hoyISO());
    setEleccionId('');
    setError(null);
  }, [open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (titulo.trim().length < 3) {
      setError('Escribe el motivo de la reunión (mínimo 3 caracteres).');
      return;
    }

    try {
      await crear.mutateAsync({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        fecha,
        eleccionId: eleccionId || null,
      });
      onClose();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo crear la reunión.'));
    }
  }

  return (
    <Modal
      open={open}
      title="Nueva reunión"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={crear.isPending}>
            Cancelar
          </Button>
          <Button type="submit" form="reunion-form" disabled={crear.isPending}>
            {crear.isPending ? 'Creando…' : 'Crear reunión'}
          </Button>
        </>
      }
    >
      <form id="reunion-form" className="form-grid" onSubmit={handleSubmit} noValidate>
        <Input
          label="Motivo de la reunión"
          name="titulo"
          value={titulo}
          onChange={(event) => setTitulo(event.target.value)}
          placeholder="Asamblea general ordinaria"
          error={error && titulo.trim().length < 3 ? error : undefined}
          autoFocus
        />

        <Input
          label="Fecha"
          name="fecha"
          type="date"
          value={fecha}
          onChange={(event) => setFecha(event.target.value)}
        />

        <div className="field">
          <label className="field-label" htmlFor="reunion-descripcion">
            Detalle (opcional)
          </label>
          <textarea
            id="reunion-descripcion"
            className="field-input field-textarea"
            rows={2}
            value={descripcion}
            onChange={(event) => setDescripcion(event.target.value)}
            placeholder="Orden del día, lugar, etc."
          />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="reunion-eleccion">
            Elección vinculada (opcional)
          </label>
          <select
            id="reunion-eleccion"
            className="field-input"
            value={eleccionId}
            onChange={(event) => setEleccionId(event.target.value)}
          >
            <option value="">Sin elección</option>
            {(elecciones?.data ?? []).map((eleccion) => (
              <option key={eleccion.id} value={eleccion.id}>
                {eleccion.title} ({eleccion.status})
              </option>
            ))}
          </select>
          <span className="field-hint">
            Si eliges una elección ACTIVA, los socios podrán votar desde esta reunión.
          </span>
        </div>

        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
