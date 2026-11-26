import { useState } from 'react';
import { Check, Copy, Link2, Plus } from 'lucide-react';
import { Button } from '@components/Button';
import { Modal } from '@components/Modal';
import { useSocios } from '@features/socios';
import { getApiErrorMessage } from '@shared/api/errors';
import { useSolicitudMutations } from '../hooks/useSolicitudes';

type SolicitudLinkModalProps = {
  open: boolean;
  onClose: () => void;
};

/** Genera el enlace externo de postulación y lo muestra para copiar. */
export function SolicitudLinkModal({ open, onClose }: SolicitudLinkModalProps) {
  const { data } = useSocios({ q: '', estado: 'ACTIVO', page: 1, limit: 50 });
  const { create } = useSolicitudMutations();

  const [socioSalienteId, setSocioSalienteId] = useState('');
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const socios = data?.data ?? [];

  async function generar() {
    setError(null);
    setCopied(false);

    try {
      const solicitud = await create.mutateAsync(socioSalienteId || null);
      setLink(`${window.location.origin}/postulacion/${solicitud.token}`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo generar el enlace.'));
    }
  }

  async function copiar() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
  }

  function cerrar() {
    setLink(null);
    setSocioSalienteId('');
    setError(null);
    setCopied(false);
    onClose();
  }

  return (
    <Modal
      open={open}
      title="Generar enlace de postulación"
      onClose={cerrar}
      footer={
        link ? (
          <Button onClick={cerrar}>Listo</Button>
        ) : (
          <>
            <Button variant="ghost" onClick={cerrar} disabled={create.isPending}>
              Cancelar
            </Button>
            <Button onClick={generar} disabled={create.isPending}>
              {create.isPending ? 'Generando…' : 'Generar enlace'}
            </Button>
          </>
        )
      }
    >
      {link ? (
        <>
          <p className="confirm-text">
            <Check size={15} /> Enlace creado. Compártelo con el postulante: allí llenará sus datos y subirá sus
            documentos.
          </p>
          <div className="link-box">
            <code>{link}</code>
            <button type="button" onClick={copiar} title="Copiar enlace">
              {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <p className="confirm-hint">Cuando envíe el formulario aparecerá en «Postulaciones» para aprobar o rechazar.</p>
        </>
      ) : (
        <>
          <p className="confirm-hint">
            El enlace abre un formulario público: el postulante ingresa su cédula (se autocompletan nombres y
            apellidos), sube licencia, contrato notariado y matrícula, y registra su vehículo.
          </p>

          <div className="field">
            <label className="field-label" htmlFor="socio-saliente">
              Socio saliente (opcional)
            </label>
            <select
              id="socio-saliente"
              className="field-input"
              value={socioSalienteId}
              onChange={(event) => setSocioSalienteId(event.target.value)}
            >
              <option value="">Sin socio saliente (puesto nuevo)</option>
              {socios.map((socio) => (
                <option key={socio.id} value={socio.id}>
                  {socio.nombres} {socio.apellidos} — {socio.cedulaRuc}
                </option>
              ))}
            </select>
            <span className="field-hint">Se usará para el contrato de venta del puesto.</span>
          </div>

          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}

          <p className="confirm-hint">
            <Link2 size={13} /> El enlace es único y no caduca hasta que la postulación sea aprobada o rechazada.
          </p>
        </>
      )}
    </Modal>
  );
}

export function NuevoSocioButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="primary-button" onClick={onClick}>
      <Plus size={17} /> Nuevo socio
    </button>
  );
}
