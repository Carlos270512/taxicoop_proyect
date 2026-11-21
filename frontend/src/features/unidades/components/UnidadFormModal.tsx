import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@components/Button';
import { Input } from '@components/Input';
import { Modal } from '@components/Modal';
import type { Socio } from '@features/socios';
import { EMPTY_UNIDAD_FORM } from '../model/types';
import type { Unidad, UnidadFormValues } from '../model/types';
import { validateUnidadForm } from '../model/validation';
import type { UnidadFormErrors } from '../model/validation';

type UnidadFormModalProps = {
  open: boolean;
  mode: 'create' | 'edit';
  unidad?: Unidad | null;
  socios: Socio[];
  lockedSocioId?: string;
  isSaving: boolean;
  serverError?: string | null;
  onClose: () => void;
  onSubmit: (values: UnidadFormValues) => void;
};

export function UnidadFormModal({
  open,
  mode,
  unidad,
  socios,
  lockedSocioId,
  isSaving,
  serverError,
  onClose,
  onSubmit,
}: UnidadFormModalProps) {
  const [values, setValues] = useState<UnidadFormValues>(EMPTY_UNIDAD_FORM);
  const [errors, setErrors] = useState<UnidadFormErrors>({});

  useEffect(() => {
    if (!open) return;

    setErrors({});
    setValues(
      mode === 'edit' && unidad
        ? {
            numeroUnidad: unidad.numeroUnidad,
            placa: unidad.placa,
            anioVehiculo: String(unidad.anioVehiculo),
            socioId: unidad.socioId,
          }
        : { ...EMPTY_UNIDAD_FORM, socioId: lockedSocioId ?? '' },
    );
  }, [open, mode, unidad, lockedSocioId]);

  function update<K extends keyof UnidadFormValues>(field: K, value: UnidadFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateUnidadForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    onSubmit(values);
  }

  return (
    <Modal
      open={open}
      title={mode === 'create' ? 'Nueva unidad' : 'Editar unidad'}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button type="submit" form="unidad-form" disabled={isSaving}>
            {isSaving ? 'Guardando…' : 'Guardar'}
          </Button>
        </>
      }
    >
      <form id="unidad-form" className="form-grid" onSubmit={handleSubmit} noValidate>
        <Input
          label="Número de unidad"
          name="numeroUnidad"
          value={values.numeroUnidad}
          onChange={(event) => update('numeroUnidad', event.target.value.toUpperCase())}
          error={errors.numeroUnidad}
          placeholder="U-101"
          autoFocus
        />
        <Input
          label="Placa"
          name="placa"
          value={values.placa}
          onChange={(event) => update('placa', event.target.value.toUpperCase())}
          error={errors.placa}
          placeholder="ABC-1234"
        />
        <Input
          label="Año del vehículo"
          name="anioVehiculo"
          type="number"
          inputMode="numeric"
          min={1950}
          max={new Date().getFullYear() + 1}
          value={values.anioVehiculo}
          onChange={(event) => update('anioVehiculo', event.target.value)}
          error={errors.anioVehiculo}
        />

        <div className="field">
          <label className="field-label" htmlFor="unidad-socio">
            Socio dueño
          </label>
          <select
            id="unidad-socio"
            className={`field-input${errors.socioId ? ' has-error' : ''}`.trim()}
            value={values.socioId}
            onChange={(event) => update('socioId', event.target.value)}
            aria-invalid={Boolean(errors.socioId)}
          >
            <option value="">Selecciona un socio…</option>
            {socios.map((socio) => (
              <option key={socio.id} value={socio.id}>
                {socio.nombres} {socio.apellidos} · {socio.cedulaRuc}
              </option>
            ))}
          </select>
          {errors.socioId ? <span className="field-error">{errors.socioId}</span> : null}
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
