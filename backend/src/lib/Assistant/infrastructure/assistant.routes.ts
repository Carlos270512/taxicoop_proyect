import { Router, Response } from 'express';
import { HttpError } from '../../Shared/domain/HttpError';
import { authenticateJWT, AuthenticatedRequest } from '../../Shared/infrastructure/middlewares/auth.middleware';
import { AskAssistantUseCase } from '../application/AskAssistant';
import { AssistantContextBuilder } from '../application/AssistantContext';
import { MixedDashboardRepository } from '../../Dashboard/infrastructure/repositories/MixedDashboardRepository';
import { SequelizeSocioRepository } from '../../Socio/infrastructure/repositories/SequelizeSocioRepository';
import { SequelizeUnidadRepository } from '../../Unidad/infrastructure/repositories/SequelizeUnidadRepository';
import { SequelizeVotacionRepository } from '../../Votacion/infrastructure/repositories/SequelizeVotacionRepository';
import { DeepSeekAssistantRepository } from './repositories/DeepSeekAssistantRepository';
import { parseMessages } from './assistant.validation';
import { checkAssistantRateLimit } from './rateLimiter';

const router = Router();

const contextBuilder = new AssistantContextBuilder(
  new MixedDashboardRepository(),
  new SequelizeSocioRepository(),
  new SequelizeUnidadRepository(),
  new SequelizeVotacionRepository()
);
const askAssistantUseCase = new AskAssistantUseCase(new DeepSeekAssistantRepository(), contextBuilder);

function fail(res: Response, error: unknown) {
  let status = 500;
  let message = error instanceof Error ? error.message : 'Error inesperado.';

  if (error instanceof HttpError) {
    status = error.status;
  }

  return res.status(status).json({ success: false, error: message });
}

router.use(authenticateJWT);

router.get('/status', (_req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      configured: Boolean(process.env.DEEPSEEK_API_KEY),
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
    },
  });
});

router.post('/chat', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new HttpError(401, 'Acceso no autorizado.');
    }

    checkAssistantRateLimit(req.user.id);

    const messages = parseMessages(req.body?.messages);
    const completion = await askAssistantUseCase.run({
      userId: req.user.id,
      roles: req.user.roles,
      messages,
    });

    return res.status(200).json({ success: true, data: completion });
  } catch (error) {
    return fail(res, error);
  }
});

export default router;
