import { ArrowRight, ShieldAlert, Vote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@components/PageHeader';
import { getApiErrorStatus, getApiErrorMessage } from '@shared/api/errors';
import { UbicacionCard } from '@features/ubicacion';
import { MisUnidadesTable } from '../components/MisUnidadesTable';
import { ProfileSummary } from '../components/ProfileSummary';
import { useMiPerfil } from '../hooks/useMiPerfil';

export function MiPerfilPage() {
  const { data, isLoading, isError, error, refetch } = useMiPerfil();

  const header = (
    <PageHeader
      eyebrow="MI CUENTA"
      title="Mi perfil"
      subtitle="Tus datos como socio de Pole Taxicoop y las unidades registradas a tu nombre."
    />
  );

  if (isLoading) {
    return (
      <>
        {header}
        <p className="table-note">Cargando tu perfil…</p>
      </>
    );
  }

  if (isError || !data) {
    const status = getApiErrorStatus(error);

    return (
      <>
        {header}
        <div className="inline-alert" role="alert">
          <ShieldAlert size={15} />
          <span>{getApiErrorMessage(error, 'No se pudo cargar tu perfil de socio.')}</span>
          {status !== 404 ? (
            <button type="button" onClick={() => refetch()}>
              Reintentar
            </button>
          ) : null}
        </div>
      </>
    );
  }

  const { socio, unidades } = data;
  const operativas = unidades.filter((unidad) => unidad.estado === 'OPERATIVA').length;

  return (
    <>
      {header}

      <ProfileSummary socio={socio} />

      <UbicacionCard />

      <div className="profile-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Mis unidades</h2>
              <p>Vehículos registrados a tu nombre</p>
            </div>
            <span className="count-pill">{unidades.length}</span>
          </div>
          <MisUnidadesTable unidades={unidades} />
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Resumen</h2>
              <p>Tu situación en la cooperativa</p>
            </div>
          </div>

          <ul className="info-list">
            <li>
              <span>Estado del socio</span>
              <strong>{socio.estado}</strong>
            </li>
            <li>
              <span>Unidades registradas</span>
              <strong>{unidades.length}</strong>
            </li>
            <li>
              <span>Unidades operativas</span>
              <strong>{operativas}</strong>
            </li>
            <li>
              <span>Cédula / RUC</span>
              <strong>{socio.cedulaRuc}</strong>
            </li>
            <li>
              <span>Teléfono</span>
              <strong>{socio.telefono}</strong>
            </li>
          </ul>

          <Link to="/votaciones" className="panel-link">
            <Vote size={15} /> Ir a votaciones <ArrowRight size={14} />
          </Link>
        </section>
      </div>
    </>
  );
}
