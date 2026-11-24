import { Router, Response } from 'express';
import { SequelizeVotacionRepository } from './repositories/SequelizeVotacionRepository';
import { CreateElectionUseCase } from '../application/CreateElection';
import { CastVoteUseCase } from '../application/CastVote';
import { GetElectionsUseCase } from '../application/GetElections';
import { GetActiveElectionsUseCase } from '../application/GetActiveElections';
import { GetElectionByIdUseCase } from '../application/GetElectionById';
import { ChangeElectionStatusUseCase } from '../application/ChangeElectionStatus';
import { GetElectionResultsUseCase } from '../application/GetElectionResults';
import { HttpError } from '../../Shared/domain/HttpError';
import { authenticateJWT, authorizeRoles, AuthenticatedRequest } from '../../Shared/infrastructure/middlewares/auth.middleware';

const router = Router();

const votacionRepository = new SequelizeVotacionRepository();
const createElectionUseCase = new CreateElectionUseCase(votacionRepository);
const castVoteUseCase = new CastVoteUseCase(votacionRepository);
const getElectionsUseCase = new GetElectionsUseCase(votacionRepository);
const getActiveElectionsUseCase = new GetActiveElectionsUseCase(votacionRepository);
const getElectionByIdUseCase = new GetElectionByIdUseCase(votacionRepository);
const changeElectionStatusUseCase = new ChangeElectionStatusUseCase(votacionRepository);
const getElectionResultsUseCase = new GetElectionResultsUseCase(votacionRepository);

function fail(res: Response, error: unknown) {
  let status = 500;
  let message = error instanceof Error ? error.message : 'Error inesperado.';

  if (error instanceof HttpError) {
    status = error.status;
  } else if (error && typeof error === 'object' && 'name' in error) {
    const name = (error as { name: string }).name;
    if (name === 'SequelizeUniqueConstraintError') {
      status = 409;
      message = 'Ya registraste tu voto en esta elección.';
    } else if (name === 'SequelizeValidationError') {
      status = 400;
    }
  }

  return res.status(status).json({ success: false, error: message });
}

router.use(authenticateJWT);

// Va antes de /elections/:id para que "active" no se tome como un id
router.get('/elections/active', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const elections = await getActiveElectionsUseCase.run();
    return res.status(200).json({ success: true, data: elections });
  } catch (error) {
    return fail(res, error);
  }
});

router.get('/elections', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await getElectionsUseCase.run({
      status: req.query.status as string | undefined,
      page: req.query.page as string | undefined,
      limit: req.query.limit as string | undefined,
    });

    return res.status(200).json({
      success: true,
      data: result.items,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    return fail(res, error);
  }
});

router.get('/elections/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const election = await getElectionByIdUseCase.run(String(req.params.id), req.user?.id);
    return res.status(200).json({ success: true, data: election });
  } catch (error) {
    return fail(res, error);
  }
});

router.get('/elections/:id/results', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const results = await getElectionResultsUseCase.run(String(req.params.id), req.user?.roles ?? []);
    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    return fail(res, error);
  }
});

router.post('/elections', authorizeRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const election = await createElectionUseCase.run(req.body);
    return res.status(201).json({
      success: true,
      message: 'Elección creada exitosamente.',
      data: election,
    });
  } catch (error) {
    return fail(res, error);
  }
});

router.patch('/elections/:id/status', authorizeRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const election = await changeElectionStatusUseCase.run(String(req.params.id), req.body?.status);
    return res.status(200).json({
      success: true,
      message: 'Estado de la elección actualizado.',
      data: election,
    });
  } catch (error) {
    return fail(res, error);
  }
});

router.post('/vote', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Usuario no autenticado.' });
    }

    const vote = await castVoteUseCase.run({
      electionId: req.body?.electionId,
      optionId: req.body?.optionId,
      userId,
    });

    return res.status(201).json({
      success: true,
      message: '¡Tu voto ha sido registrado!',
      data: vote,
    });
  } catch (error) {
    return fail(res, error);
  }
});

export default router;
