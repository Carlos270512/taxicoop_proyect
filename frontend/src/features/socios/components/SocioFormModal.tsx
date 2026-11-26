import { useEffect, useState, type FormEvent } from 'react';
import { IdCard, Loader2 } from 'lucide-react';
import { Button } from '@components/Button';
import { Input } from '@components/Input';
import { Modal } from '@components/Modal';
import { getApiErrorMessage } from '@shared/api/errors';
import { solicitudesApi } from '@features/solicitudes';
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
  const [buscando, setBuscando] = useState(false);
  const [avisoCedula, setAvisoCedula] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setErrors({});
    setAvisoCedula(null);
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

  /** Autocompleta nombres y apellidos consultando la cédula en el backend. */
  async function consultarCedula() {
    const documento = values.cedulaRuc.replace(/\D/g, '');

    if (documento.length !== 10 && documento.length !== 13) return;

    setBuscando(true);
    setAvisoCedula(null);

    try {
      const data = await solicitudesApi.cedula(documento);
      setValues((current) => ({ ...current, nombres: data.nombres, apellidos: data.apellidos }));
      setAvisoCedula('Datos autocompletados desde el registro civil.');
    } catch (requestError) {
      setAvisoCedula(getApiErrorMessage(requestError, 'No se pudo consultar la cédula.'));
    } finally {
      setBuscando(false);
    }
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
        <div className="field">
          <label className="field-label" htmlFor="socio-cedula">
            Cédula / RUC
          </label>
          <div className="cedula-row">
            <input
              id="socio-cedula"
              name="cedulaRuc"
              inputMode="numeric"
              maxLength={13}
              className={`field-input${errors.cedulaRuc ? ' has-error' : ''}`}
              value={values.cedulaRuc}
              onChange={(event) => update('cedulaRuc', event.target.value.replace(/\D/g, ''))}
              onBlur={() => { if (mode === 'create') void consultarCedula(); }}
              autoFocus
            />
            {mode === 'create' ? (
              <Button variant="ghost" size="sm" onClick={consultarCedula} disabled={buscando}>
                {buscando ? <Loader2 size={14} className="spin" /> : <IdCard size={14} />} Buscar
              </Button>
            ) : null}
          </div>
          {errors.cedulaRuc ? <span className="field-error">{errors.cedulaRuc}</span> : null}
          {avisoCedula ? <span className="field-hint">{avisoCedula}</span> : null}
        </div>
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
