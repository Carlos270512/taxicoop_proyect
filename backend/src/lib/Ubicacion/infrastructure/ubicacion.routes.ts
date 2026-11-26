import { Router, Response } from 'express';
import { HttpError } from '../../Shared/domain/HttpError';
import { authenticateJWT, authorizeRoles, AuthenticatedRequest } from '../../Shared/infrastructure/middlewares/auth.middleware';
import { SequelizeSocioRepository } from '../../Socio/infrastructure/repositories/SequelizeSocioRepository';
import { SequelizeUbicacionRepository } from './repositories/SequelizeUbicacionRepository';
import { SaveMyUbicacionUseCase } from '../application/SaveMyUbicacion';
import { GetMyUbicacionUseCase } from '../application/GetMyUbicacion';
import { GetSocioUbicacionUseCase } from '../application/GetSocioUbicacion';

const router = Router();

const socioRepository = new SequelizeSocioRepository();
const ubicacionRepository = new SequelizeUbicacionRepository();
const saveMyUbicacionUseCase = new SaveMyUbicacionUseCase(socioRepository, ubicacionRepository);
const getMyUbicacionUseCase = new GetMyUbicacionUseCase(socioRepository, ubicacionRepository);
const getSocioUbicacionUseCase = new GetSocioUbicacionUseCase(socioRepository, ubicacionRepository);

function fail(res: Response, error: unknown) {
  let status = 500;
  let message = error instanceof Error ? error.message : 'Error inesperado.';

  if (error instanceof HttpError) {
    status = error.status;
  }

  return res.status(status).json({ success: false, error: message });
}

router.use(authenticateJWT);

router.get('/me', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) throw new HttpError(401, 'Acceso no autorizado.');
    const ubicacion = await getMyUbicacionUseCase.run(req.user.id);
    return res.status(200).json({ success: true, data: ubicacion });
  } catch (error) {
    return fail(res, error);
  }
});

router.post('/me', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) throw new HttpError(401, 'Acceso no autorizado.');

    const ubicacion = await saveMyUbicacionUseCase.run(req.user.id, {
      latitud: req.body?.latitud,
      longitud: req.body?.longitud,
      precisionMetros: req.body?.precisionMetros,
    });

    return res.status(201).json({
      success: true,
      message: 'Ubicación registrada',
      data: ubicacion,
    });
  } catch (error) {
    return fail(res, error);
  }
});

router.get('/:socioId', authorizeRoles('ADMIN'), async (req: AuthenticatedRequest, res) => {
  try {
    const ubicacion = await getSocioUbicacionUseCase.run(String(req.params.socioId));
    return res.status(200).json({ success: true, data: ubicacion });
  } catch (error) {
    return fail(res, error);
  }
});

export default router;
