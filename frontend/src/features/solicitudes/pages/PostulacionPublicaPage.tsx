import { useEffect, useState } from 'react';
import { CheckCircle2, FileText, IdCard, Loader2, Lock, MapPin, Upload, XCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Button } from '@components/Button';
import { getApiErrorMessage } from '@shared/api/errors';
import { useSolicitudMutations, useSolicitudPublica } from '../hooks/useSolicitudes';
import {
  ARCHIVO_LABELS,
  EMPTY_SOLICITUD_FORM,
  VIGENCIA_MATRICULA_ANIOS,
  validateSolicitudForm,
} from '../model/types';
import type { ArchivoTipo, SolicitudFormErrors, SolicitudFormValues } from '../model/types';
import { solicitudesApi } from '../api/solicitudes.api';

const TIPOS: ArchivoTipo[] = ['LICENCIA', 'CONTRATO', 'MATRICULA'];

type Subido = Partial<Record<ArchivoTipo, { id: string; nombreOriginal: string }>>;

export function PostulacionPublicaPage() {
  const { token = '' } = useParams<{ token: string }>();
  const { data: solicitud, isLoading, isError, error, refetch } = useSolicitudPublica(token);
  const { submit, upload } = useSolicitudMutations();

  const [values, setValues] = useState<SolicitudFormValues>(EMPTY_SOLICITUD_FORM);
  const [errors, setErrors] = useState<SolicitudFormErrors>({});
  const [subidos, setSubidos] = useState<Subido>({});
  const [buscando, setBuscando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    if (!solicitud?.data.cedulaRuc) return;

    setValues((current) => ({
      ...current,
      cedulaRuc: solicitud.data.cedulaRuc ?? '',
      nombres: solicitud.data.nombres ?? '',
      apellidos: solicitud.data.apellidos ?? '',
      telefono: solicitud.data.telefono ?? '',
      email: solicitud.data.email ?? '',
      direccion: solicitud.data.direccion ?? '',
      numeroUnidad: solicitud.data.numeroUnidad ?? '',
      placa: solicitud.data.placa ?? '',
      anioVehiculo: solicitud.data.anioVehiculo ? String(solicitud.data.anioVehiculo) : current.anioVehiculo,
    }));
  }, [solicitud]);

  function update<K extends keyof SolicitudFormValues>(field: K, value: SolicitudFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function consultarCedula() {
    const documento = values.cedulaRuc.replace(/\D/g, '');

    if (documento.length !== 10 && documento.length !== 13) {
      setErrors((current) => ({ ...current, cedulaRuc: 'La cédula debe tener 10 dígitos (o 13 si es RUC).' }));
      return;
    }

    setBuscando(true);
    setAviso(null);
    setErrors((current) => ({ ...current, cedulaRuc: undefined }));

    try {
      const data = await solicitudesApi.publicaCedula(token, documento);
      setValues((current) => ({ ...current, nombres: data.nombres, apellidos: data.apellidos }));
      setAviso('Datos encontrados en el registro civil. Revisa que sean correctos.');
    } catch (requestError) {
      setAviso(getApiErrorMessage(requestError, 'No se pudieron autocompletar los datos.'));
    } finally {
      setBuscando(false);
    }
  }

  async function onFile(tipo: ArchivoTipo, file: File | null) {
    if (!file) return;
    setServerError(null);

    try {
      const archivo = await upload.mutateAsync({ token, tipo, file });
      setSubidos((current) => ({ ...current, [tipo]: { id: archivo.id, nombreOriginal: archivo.nombreOriginal } }));
    } catch (requestError) {
      setServerError(getApiErrorMessage(requestError, 'No se pudo subir el documento.'));
    }
  }

  async function enviar() {
    const nextErrors = validateSolicitudForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setServerError('Revisa los campos marcados en rojo.');
      return;
    }

    if (Object.keys(subidos).length < 3) {
      setServerError('Debes subir los tres documentos: licencia, contrato notariado y matrícula.');
      return;
    }

    setServerError(null);

    try {
      await submit.mutateAsync({
        token,
        payload: {
          cedulaRuc: values.cedulaRuc.replace(/\D/g, ''),
          nombres: values.nombres.trim(),
          apellidos: values.apellidos.trim(),
          telefono: values.telefono.replace(/\s+/g, ''),
          email: values.email.trim(),
          password: values.password,
          direccion: values.direccion.trim(),
          numeroUnidad: values.numeroUnidad.trim(),
          placa: values.placa.trim(),
          anioVehiculo: Number(values.anioVehiculo),
        },
      });
      setEnviado(true);
      void refetch();
    } catch (requestError) {
      setServerError(getApiErrorMessage(requestError, 'No se pudo enviar la postulación.'));
    }
  }

  const vigencia = Number(values.anioVehiculo) + VIGENCIA_MATRICULA_ANIOS;

  return (
    <div className="public-shell">
      <header className="public-head">
        <div className="brand-mark">P</div>
        <div>
          <strong>Pole Taxicoop</strong>
          <span>Postulación de socio</span>
        </div>
      </header>

      {isLoading ? <p className="table-note">Cargando formulario…</p> : null}

      {isError ? (
        <div className="public-card">
          <div className="locked-note">
            <XCircle size={16} />
            <span>{getApiErrorMessage(error, 'El enlace de postulación no es válido.')}</span>
          </div>
        </div>
      ) : null}

      {solicitud ? (
        <>
          {solicitud.estado === 'APROBADA' || enviado ? (
            <div className="public-card">
              <div className="public-success">
                <CheckCircle2 size={30} />
                <h1>¡Postulación enviada!</h1>
                <p>La cooperativa revisará tus documentos y te avisará por correo cuando sea aprobada.</p>
              </div>
            </div>
          ) : solicitud.estado === 'RECHAZADA' ? (
            <div className="public-card">
              <div className="locked-note">
                <Lock size={16} />
                <span>Esta postulación fue rechazada. {solicitud.motivoRechazo ?? ''} Contacta al administrador.</span>
              </div>
            </div>
          ) : (
            <div className="public-card">
              <h1 className="public-title">Completa tu postulación</h1>
              <p className="public-subtitle">
                Necesitas tu cédula, licencia de conducir, contrato de venta notariado y la matrícula del vehículo.
              </p>

              {solicitud.socioSalienteNombre ? (
                <p className="public-note">
                  <MapPin size={13} /> Postulación asociada al puesto de <strong>{solicitud.socioSalienteNombre}</strong>.
                </p>
              ) : null}

              <section className="public-section">
                <h2>1. Datos personales</h2>

                <div className="public-grid">
                  <div className="field">
                    <label className="field-label" htmlFor="cedula">
                      Cédula / RUC
                    </label>
                    <div className="cedula-row">
                      <input
                        id="cedula"
                        className={`field-input${errors.cedulaRuc ? ' has-error' : ''}`}
                        inputMode="numeric"
                        maxLength={13}
                        value={values.cedulaRuc}
                        onChange={(event) => update('cedulaRuc', event.target.value.replace(/\D/g, ''))}
                        onBlur={consultarCedula}
                        placeholder="1710034065"
                      />
                      <Button variant="ghost" size="sm" onClick={consultarCedula} disabled={buscando}>
                        {buscando ? <Loader2 size={14} className="spin" /> : <IdCard size={14} />} Buscar
                      </Button>
                    </div>
                    {errors.cedulaRuc ? <span className="field-error">{errors.cedulaRuc}</span> : null}
                  </div>

                  <div className="field">
                    <label className="field-label" htmlFor="nombres">
                      Nombres
                    </label>
                    <input
                      id="nombres"
                      className={`field-input${errors.nombres ? ' has-error' : ''}`}
                      value={values.nombres}
                      onChange={(event) => update('nombres', event.target.value)}
                    />
                    {errors.nombres ? <span className="field-error">{errors.nombres}</span> : null}
                  </div>

                  <div className="field">
                    <label className="field-label" htmlFor="apellidos">
                      Apellidos
                    </label>
                    <input
                      id="apellidos"
                      className={`field-input${errors.apellidos ? ' has-error' : ''}`}
                      value={values.apellidos}
                      onChange={(event) => update('apellidos', event.target.value)}
                    />
                    {errors.apellidos ? <span className="field-error">{errors.apellidos}</span> : null}
                  </div>

                  <div className="field">
                    <label className="field-label" htmlFor="telefono">
                      Teléfono
                    </label>
                    <input
                      id="telefono"
                      className={`field-input${errors.telefono ? ' has-error' : ''}`}
                      value={values.telefono}
                      onChange={(event) => update('telefono', event.target.value)}
                    />
                    {errors.telefono ? <span className="field-error">{errors.telefono}</span> : null}
                  </div>

                  <div className="field">
                    <label className="field-label" htmlFor="email">
                      Correo electrónico
                    </label>
                    <input
                      id="email"
                      type="email"
                      className={`field-input${errors.email ? ' has-error' : ''}`}
                      value={values.email}
                      onChange={(event) => update('email', event.target.value)}
                    />
                    {errors.email ? <span className="field-error">{errors.email}</span> : null}
                  </div>

                  <div className="field">
                    <label className="field-label" htmlFor="direccion">
                      Dirección
                    </label>
                    <input
                      id="direccion"
                      className={`field-input${errors.direccion ? ' has-error' : ''}`}
                      value={values.direccion}
                      onChange={(event) => update('direccion', event.target.value)}
                    />
                    {errors.direccion ? <span className="field-error">{errors.direccion}</span> : null}
                  </div>

                  <div className="field">
                    <label className="field-label" htmlFor="password">
                      Contraseña
                    </label>
                    <input
                      id="password"
                      type="password"
                      className={`field-input${errors.password ? ' has-error' : ''}`}
                      value={values.password}
                      onChange={(event) => update('password', event.target.value)}
                    />
                    {errors.password ? <span className="field-error">{errors.password}</span> : null}
                  </div>

                  <div className="field">
                    <label className="field-label" htmlFor="confirm">
                      Repetir contraseña
                    </label>
                    <input
                      id="confirm"
                      type="password"
                      className={`field-input${errors.confirmPassword ? ' has-error' : ''}`}
                      value={values.confirmPassword}
                      onChange={(event) => update('confirmPassword', event.target.value)}
                    />
                    {errors.confirmPassword ? <span className="field-error">{errors.confirmPassword}</span> : null}
                  </div>
                </div>

                {aviso ? <p className="ubicacion-notice">{aviso}</p> : null}
              </section>

              <section className="public-section">
                <h2>2. Documentos</h2>
                <p className="confirm-hint">PDF, JPG o PNG. Máximo 8 MB por archivo. Se guardan cifrados.</p>

                <div className="doc-uploads">
                  {TIPOS.map((tipo) => (
                    <label key={tipo} className={`doc-upload${subidos[tipo] ? ' done' : ''}`}>
                      <input
                        type="file"
                        accept="application/pdf,image/jpeg,image/png"
                        onChange={(event) => void onFile(tipo, event.target.files?.[0] ?? null)}
                      />
                      {subidos[tipo] ? <CheckCircle2 size={16} /> : <Upload size={16} />}
                      <span>
                        <strong>{ARCHIVO_LABELS[tipo]}</strong>
                        <em>{subidos[tipo]?.nombreOriginal ?? 'Selecciona un archivo'}</em>
                      </span>
                    </label>
                  ))}
                </div>
              </section>

              <section className="public-section">
                <h2>3. Vehículo</h2>

                <div className="public-grid">
                  <div className="field">
                    <label className="field-label" htmlFor="numeroUnidad">
                      Número de unidad
                    </label>
                    <input
                      id="numeroUnidad"
                      className={`field-input${errors.numeroUnidad ? ' has-error' : ''}`}
                      value={values.numeroUnidad}
                      onChange={(event) => update('numeroUnidad', event.target.value)}
                      placeholder="U-101"
                    />
                    {errors.numeroUnidad ? <span className="field-error">{errors.numeroUnidad}</span> : null}
                  </div>

                  <div className="field">
                    <label className="field-label" htmlFor="placa">
                      Placa
                    </label>
                    <input
                      id="placa"
                      className={`field-input${errors.placa ? ' has-error' : ''}`}
                      value={values.placa}
                      onChange={(event) => update('placa', event.target.value.toUpperCase())}
                      placeholder="ABC-1234"
                    />
                    {errors.placa ? <span className="field-error">{errors.placa}</span> : null}
                  </div>

                  <div className="field">
                    <label className="field-label" htmlFor="anio">
                      Año del vehículo
                    </label>
                    <input
                      id="anio"
                      className={`field-input${errors.anioVehiculo ? ' has-error' : ''}`}
                      inputMode="numeric"
                      maxLength={4}
                      value={values.anioVehiculo}
                      onChange={(event) => update('anioVehiculo', event.target.value.replace(/\D/g, ''))}
                    />
                    {errors.anioVehiculo ? <span className="field-error">{errors.anioVehiculo}</span> : null}
                  </div>

                  <div className="field">
                    <span className="field-label">Vigencia de la matrícula</span>
                    <div className="expiracion-box">
                      <FileText size={14} /> Vence el <strong>31/12/{vigencia}</strong>
                      <span>({VIGENCIA_MATRICULA_ANIOS} años de vigencia)</span>
                    </div>
                  </div>
                </div>
              </section>

              {serverError ? (
                <p className="form-error" role="alert">
                  {serverError}
                </p>
              ) : null}

              <div className="public-actions">
                <Button onClick={enviar} disabled={submit.isPending}>
                  {submit.isPending ? 'Enviando…' : 'Enviar postulación'}
                </Button>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
