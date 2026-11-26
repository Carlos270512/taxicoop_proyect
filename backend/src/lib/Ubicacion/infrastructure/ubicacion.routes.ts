import { Router, Response } from 'express';
import { HttpError } from '../../Shared/domain/HttpError';
import { authenticateJWT, authorizeRoles, AuthenticatedRequest } from '../../Shared/infrastructure/middlewares/auth.middleware';
import { SequelizeSocioRepository } from '../../Socio/infrastructure/repositories/SequelizeSocioRepository';
import { SequelizeUbicacionRepository } from './repositories/SequelizeUbicacionRepository';
import { SaveMyUbicacionUseCase } from '../application/SaveMyUbicacion';
import { GetMyUbicacionUseCase } from '../application/GetMyUbicacion';
import { GetSocioUbicacionUseCase } from '../application/GetSocioUbicacion';
import { MapaRepository } from './repositories/MapaRepository';

const router = Router();

const socioRepository = new SequelizeSocioRepository();
const ubicacionRepository = new SequelizeUbicacionRepository();
const saveMyUbicacionUseCase = new SaveMyUbicacionUseCase(socioRepository, ubicacionRepository);
const getMyUbicacionUseCase = new GetMyUbicacionUseCase(socioRepository, ubicacionRepository);
const getSocioUbicacionUseCase = new GetSocioUbicacionUseCase(socioRepository, ubicacionRepository);
const mapaRepository = new MapaRepository();

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

// Mapa de taxis: última ubicación de cada socio con su unidad
router.get('/mapa/taxis', authorizeRoles('ADMIN'), async (_req: AuthenticatedRequest, res) => {
  try {
    const taxis = await mapaRepository.findTaxis();
    return res.status(200).json({ success: true, data: taxis });
  } catch (error) {
    return fail(res, error);
  }
});

export default router;
