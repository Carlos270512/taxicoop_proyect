import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@components/Button';
import { Input } from '@components/Input';
import { Modal } from '@components/Modal';
import { EMPTY_SOCIO_FORM } from '../model/types';
import type { Socio, SocioFormValues } from '../model/types';
import { validateSocioForm } from '../model/validation';
import type { SocioFormErrors } from '../model/validation';

type SocioFormModalProps = {
  open: boolean;
  mode: 'create' | 'edit';
  socio?: Socio | null;
  isSaving: boolean;
  serverError?: string | null;
  onClose: () => void;
  onSubmit: (values: SocioFormValues) => void;
};

export function SocioFormModal({ open, mode, socio, isSaving, serverError, onClose, onSubmit }: SocioFormModalProps) {
  const [values, setValues] = useState<SocioFormValues>(EMPTY_SOCIO_FORM);
  const [errors, setErrors] = useState<SocioFormErrors>({});

  useEffect(() => {
    if (!open) return;

    setErrors({});
    setValues(
      mode === 'edit' && socio
        ? {
            cedulaRuc: socio.cedulaRuc,
            nombres: socio.nombres,
            apellidos: socio.apellidos,
            telefono: socio.telefono,
            email: socio.email ?? '',
            password: '',
          }
        : EMPTY_SOCIO_FORM,
    );
  }, [open, mode, socio]);

  function update<K extends keyof SocioFormValues>(field: K, value: SocioFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateSocioForm(values, mode);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    onSubmit(values);
  }

  return (
    <Modal
      open={open}
      title={mode === 'create' ? 'Nuevo socio' : 'Editar socio'}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button type="submit" form="socio-form" disabled={isSaving}>
            {isSaving ? 'Guardando…' : 'Guardar'}
          </Button>
        </>
      }
    >
      <form id="socio-form" className="form-grid" onSubmit={handleSubmit} noValidate>
        <Input
          label="Cédula / RUC"
          name="cedulaRuc"
          inputMode="numeric"
          value={values.cedulaRuc}
          onChange={(event) => update('cedulaRuc', event.target.value)}
          error={errors.cedulaRuc}
          autoFocus
        />
        <Input
          label="Teléfono"
          name="telefono"
          inputMode="tel"
          value={values.telefono}
          onChange={(event) => update('telefono', event.target.value)}
          error={errors.telefono}
        />
        <Input
          label="Nombres"
          name="nombres"
          value={values.nombres}
          onChange={(event) => update('nombres', event.target.value)}
          error={errors.nombres}
        />
        <Input
          label="Apellidos"
          name="apellidos"
          value={values.apellidos}
          onChange={(event) => update('apellidos', event.target.value)}
          error={errors.apellidos}
        />

        {mode === 'create' ? (
          <>
            <Input
              label="Correo de acceso"
              name="email"
              type="email"
              autoComplete="off"
              value={values.email}
              onChange={(event) => update('email', event.target.value)}
              error={errors.email}
              hint="Con este correo el socio iniciará sesión."
            />
            <Input
              label="Contraseña inicial"
              name="password"
              type="password"
              autoComplete="new-password"
              value={values.password}
              onChange={(event) => update('password', event.target.value)}
              error={errors.password}
              hint="Mínimo 8 caracteres."
            />
          </>
        ) : null}

        {serverError ? (
          <p className="form-error" role="alert">
            {serverError}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
