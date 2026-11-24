import { useEffect, useState, type FormEvent } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@components/Button';
import { Input } from '@components/Input';
import { Modal } from '@components/Modal';
import { EMPTY_ELECTION_FORM } from '../model/types';
import type { ElectionFormValues } from '../model/types';
import { validateElectionForm } from '../model/validation';
import type { ElectionFormErrors } from '../model/validation';

type ElectionFormModalProps = {
  open: boolean;
  isSaving: boolean;
  serverError?: string | null;
  onClose: () => void;
  onSubmit: (values: ElectionFormValues) => void;
};

export function ElectionFormModal({ open, isSaving, serverError, onClose, onSubmit }: ElectionFormModalProps) {
  const [values, setValues] = useState<ElectionFormValues>(EMPTY_ELECTION_FORM);
  const [errors, setErrors] = useState<ElectionFormErrors>({});

  useEffect(() => {
    if (!open) return;
    setValues(EMPTY_ELECTION_FORM);
    setErrors({});
  }, [open]);

  function update<K extends keyof ElectionFormValues>(field: K, value: ElectionFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function updateOption(index: number, value: string) {
    setValues((current) => ({
      ...current,
      options: current.options.map((option, position) => (position === index ? value : option)),
    }));
  }

  function addOption() {
    setValues((current) => ({ ...current, options: [...current.options, ''] }));
  }

  function removeOption(index: number) {
    setValues((current) => ({ ...current, options: current.options.filter((_, position) => position !== index) }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateElectionForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    onSubmit(values);
  }

  return (
    <Modal
      open={open}
      title="Nueva elección"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button type="submit" form="election-form" disabled={isSaving}>
            {isSaving ? 'Guardando…' : 'Crear elección'}
          </Button>
        </>
      }
    >
      <form id="election-form" className="form-grid" onSubmit={handleSubmit} noValidate>
        <Input
          label="Título"
          name="title"
          value={values.title}
          onChange={(event) => update('title', event.target.value)}
          error={errors.title}
          placeholder="Aprobación del presupuesto 2027"
          autoFocus
        />

        <div className="field">
          <label className="field-label" htmlFor="election-description">
            Descripción (opcional)
          </label>
          <textarea
            id="election-description"
            className={`field-input field-textarea${errors.description ? ' has-error' : ''}`.trim()}
            value={values.description}
            onChange={(event) => update('description', event.target.value)}
            rows={2}
          />
          {errors.description ? <span className="field-error">{errors.description}</span> : null}
        </div>

        <Input
          label="Inicio"
          name="startDate"
          type="date"
          value={values.startDate}
          onChange={(event) => update('startDate', event.target.value)}
          error={errors.startDate}
        />
        <Input
          label="Fin"
          name="endDate"
          type="date"
          value={values.endDate}
          onChange={(event) => update('endDate', event.target.value)}
          error={errors.endDate}
        />

        <div className="field option-field">
          <span className="field-label">Opciones de voto</span>

          <div className="option-editor">
            {values.options.map((option, index) => (
              <div className="option-editor-row" key={`option-${index}`}>
                <input
                  className="field-input"
                  value={option}
                  onChange={(event) => updateOption(index, event.target.value)}
                  placeholder={`Opción ${index + 1}`}
                  aria-label={`Opción ${index + 1}`}
                />
                <button
                  type="button"
                  className="icon-action icon-action-danger"
                  onClick={() => removeOption(index)}
                  disabled={values.options.length <= 2}
                  aria-label={`Quitar la opción ${index + 1}`}
                  title="Quitar"
                >
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>

          <Button variant="ghost" size="sm" onClick={addOption}>
            <Plus size={14} /> Agregar opción
          </Button>

          {errors.options ? <span className="field-error">{errors.options}</span> : null}
        </div>

        {serverError ? (
          <p className="form-error" role="alert">
            {serverError}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
