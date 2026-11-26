import { useEffect, useState, type FormEvent } from 'react';
import { FileUp } from 'lucide-react';
import { Button } from '@components/Button';
import { Input } from '@components/Input';
import { Modal } from '@components/Modal';
import { getApiErrorMessage } from '@shared/api/errors';
import { MAX_REGLAMENTO_BYTES } from '../model/types';
import { useReglamentoMutations } from '../hooks/useReglamentos';

type ReglamentoFormModalProps = {
  open: boolean;
  onClose: () => void;
};

export function ReglamentoFormModal({ open, onClose }: ReglamentoFormModalProps) {
  const { subir } = useReglamentoMutations();

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitulo('');
    setDescripcion('');
    setArchivo(null);
    setError(null);
  }, [open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (titulo.trim().length < 3) {
      setError('Indica un título de al menos 3 caracteres.');
      return;
    }

    if (!archivo) {
      setError('Selecciona el PDF del reglamento.');
      return;
    }

    if (archivo.type !== 'application/pdf') {
      setError('El archivo debe ser un PDF.');
      return;
    }

    if (archivo.size > MAX_REGLAMENTO_BYTES) {
      setError('El PDF no debe superar los 10 MB.');
      return;
    }

    try {
      await subir.mutateAsync({ titulo: titulo.trim(), descripcion: descripcion.trim(), archivo });
      onClose();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo publicar el reglamento.'));
    }
  }

  return (
    <Modal
      open={open}
      title="Subir reglamento"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={subir.isPending}>
            Cancelar
          </Button>
          <Button type="submit" form="reglamento-form" disabled={subir.isPending}>
            {subir.isPending ? 'Subiendo…' : 'Publicar'}
          </Button>
        </>
      }
    >
      <form id="reglamento-form" className="form-grid" onSubmit={handleSubmit} noValidate>
        <Input
          label="Título del reglamento"
          name="titulo"
          value={titulo}
          onChange={(event) => setTitulo(event.target.value)}
          placeholder="Reglamento interno 2027"
          autoFocus
        />

        <div className="field">
          <label className="field-label" htmlFor="reglamento-descripcion">
            Descripción (opcional)
          </label>
          <textarea
            id="reglamento-descripcion"
            className="field-input field-textarea"
            rows={2}
            value={descripcion}
            onChange={(event) => setDescripcion(event.target.value)}
            placeholder="Aprobado en asamblea del…"
          />
        </div>

        <label className={`doc-upload${archivo ? ' done' : ''}`}>
          <input
            type="file"
            accept="application/pdf"
            onChange={(event) => setArchivo(event.target.files?.[0] ?? null)}
          />
          <FileUp size={16} />
          <span>
            <strong>Archivo PDF</strong>
            <em>{archivo ? archivo.name : 'Selecciona el PDF (máx. 10 MB)'}</em>
          </span>
        </label>

        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
