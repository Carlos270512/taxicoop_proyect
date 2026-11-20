import { Router, Response } from 'express';
import { SequelizeVotacionRepository } from './repositories/SequelizeVotacionRepository';
import { CreateElectionUseCase } from '../application/CreateElection';
import { CastVoteUseCase } from '../application/CastVote';
import { authenticateJWT, AuthenticatedRequest } from '../../Shared/infrastructure/middlewares/auth.middleware';

const router = Router();
const votacionRepository = new SequelizeVotacionRepository();

const createElectionUseCase = new CreateElectionUseCase(votacionRepository);
const castVoteUseCase = new CastVoteUseCase(votacionRepository);

// 1. Crear Elección 
router.post('/elections', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const election = await createElectionUseCase.run(req.body);
    return res.status(201).json({
      success: true,
      message: 'Elección creada exitosamente.',
      data: election,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// 2. Consultar Elecciones Activas 
router.get('/elections/active', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const activeElections = await votacionRepository.findActiveElections();
    return res.status(200).json({
      success: true,
      data: activeElections,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Emitir Voto 
router.post('/vote', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id; // 🔒 Extraemos el ID real del token JWT verificado

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Usuario no autenticado.' });
    }

    const { electionId, optionId } = req.body;

    const vote = await castVoteUseCase.run({
      electionId,
      optionId,
      userId,
    });

    return res.status(201).json({
      success: true,
      message: '¡Tu voto ha sido registrado de forma segura!',
      data: vote,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// 4. Ver Resultados de la Elección 
router.get('/elections/:id/results', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const electionId = String(req.params.id);
    const results = await votacionRepository.getResults(electionId);
    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;