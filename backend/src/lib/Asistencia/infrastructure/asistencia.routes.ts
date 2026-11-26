import { Router, Response } from 'express';
import { HttpError } from '../../Shared/domain/HttpError';
import { authenticateJWT, authorizeRoles, AuthenticatedRequest } from '../../Shared/infrastructure/middlewares/auth.middleware';
import { SequelizeAsistenciaRepository } from './repositories/SequelizeAsistenciaRepository';
import { GetAsistenciaUseCase, SaveAsistenciaUseCase } from '../application/AsistenciaUseCases';

const router = Router();

const asistenciaRepository = new SequelizeAsistenciaRepository();
const getAsistencia = new GetAsistenciaUseCase(asistenciaRepository);
const saveAsistencia = new SaveAsistenciaUseCase(asistenciaRepository);

function fail(res: Response, error: unknown) {
  let status = 500;
  let message = error instanceof Error ? error.message : 'Error inesperado.';

  if (error instanceof HttpError) status = error.status;

  return res.status(status).json({ success: false, error: message });
}

router.use(authenticateJWT);

router.get('/', authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const hoy = new Date().toISOString().slice(0, 10);
    const data = await getAsistencia.run(req.query.fecha ?? hoy);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return fail(res, error);
  }
});

router.put('/', authorizeRoles('ADMIN'), async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) throw new HttpError(401, 'Acceso no autorizado.');

    const data = await saveAsistencia.run(req.body?.fecha, req.body?.registros, req.user.id);
    return res.status(200).json({ success: true, message: 'Asistencia guardada', data });
  } catch (error) {
    return fail(res, error);
  }
});

export default router;
