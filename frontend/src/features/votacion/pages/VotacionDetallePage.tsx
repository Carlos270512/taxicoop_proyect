import { useState } from 'react';
import { ArrowLeft, Lock, ShieldAlert } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@components/Button';
import { PageHeader } from '@components/PageHeader';
import { useAuth } from '@features/auth';
import { getApiErrorMessage } from '@shared/api/errors';
import { formatPeriod } from '../model/format';
import type { ElectionStatus } from '../model/types';
import { ElectionStatusBadge } from '../components/ElectionStatusBadge';
import { ResultsChart } from '../components/ResultsChart';
import { VotePanel } from '../components/VotePanel';
import { useElection, useElectionResults, useVotacionMutations } from '../hooks/useVotaciones';

export function VotacionDetallePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isAdmin = user?.roles.includes('ADMIN') ?? false;

  const { data: election, isLoading, isError, error, refetch } = useElection(id);
  const resultsEnabled = Boolean(election) && (election?.status === 'CLOSED' || isAdmin);
  const { data: results } = useElectionResults(id, resultsEnabled);

  const { vote, changeStatus } = useVotacionMutations();
  const [voteError, setVoteError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleVote(optionId: string) {
    if (!id) return;
    setVoteError(null);
    try {
      await vote.mutateAsync({ electionId: id, optionId });
    } catch (err) {
      setVoteError(getApiErrorMessage(err, 'No se pudo registrar tu voto.'));
    }
  }

  async function handleStatus(status: ElectionStatus) {
    if (!id) return;
    setActionError(null);
    try {
      await changeStatus.mutateAsync({ id, status });
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'No se pudo cambiar el estado de la elección.'));
    }
  }

  if (isLoading) {
    return <p className="table-note">Cargando elección…</p>;
  }

  if (isError || !election) {
    return (
      <div className="inline-alert" role="alert">
        <ShieldAlert size={15} />
        <span>{getApiErrorMessage(error, 'No se pudo cargar la elección.')}</span>
        <button type="button" onClick={() => refetch()}>Reintentar</button>
      </div>
    );
  }

  const isOpen = election.status === 'ACTIVE';

  return (
    <>
      <Link to="/votaciones" className="back-link">
        <ArrowLeft size={14} /> Volver a votaciones
      </Link>

      <PageHeader
        eyebrow="ELECCIÓN"
        title={election.title}
        subtitle={election.description || 'Sin descripción'}
        action={
          isAdmin ? (
            <div className="header-actions">
              {election.status === 'DRAFT' ? (
                <Button onClick={() => handleStatus('ACTIVE')} disabled={changeStatus.isPending}>
                  Activar elección
                </Button>
              ) : null}
              {election.status === 'ACTIVE' ? (
                <Button variant="danger" onClick={() => handleStatus('CLOSED')} disabled={changeStatus.isPending}>
                  Cerrar elección
                </Button>
              ) : null}
            </div>
          ) : undefined
        }
      />

      {actionError ? (
        <div className="inline-alert" role="alert">
          <ShieldAlert size={15} />
          <span>{actionError}</span>
        </div>
      ) : null}

      <div className="panel votacion-panel">
        <div className="votacion-meta">
          <ElectionStatusBadge status={election.status} />
          <span className="period">{formatPeriod(election.startDate, election.endDate)}</span>
          <span className="period">
            {election.votesCount} {election.votesCount === 1 ? 'voto registrado' : 'votos registrados'}
          </span>
        </div>

        {isOpen ? (
          <VotePanel
            election={election}
            isVoting={vote.isPending}
            error={voteError}
            onVote={handleVote}
          />
        ) : election.status === 'DRAFT' ? (
          <div className="locked-note">
            <Lock size={16} />
            <span>Esta elección está en borrador. Cuando se active, los socios podrán votar.</span>
          </div>
        ) : (
          <div className="locked-note">
            <Lock size={16} />
            <span>La votación está cerrada. No se aceptan más votos.</span>
          </div>
        )}
      </div>

      <div className="panel votacion-panel">
        <div className="panel-heading">
          <div>
            <h2>Resultados</h2>
            <p>{resultsEnabled ? 'Conteo actual de la elección' : 'Disponibles cuando la elección se cierre'}</p>
          </div>
        </div>

        {resultsEnabled && results ? (
          <ResultsChart results={results} />
        ) : (
          <div className="locked-note">
            <Lock size={16} />
            <span>Los resultados estarán disponibles cuando la elección se cierre.</span>
          </div>
        )}
      </div>
    </>
  );
}
