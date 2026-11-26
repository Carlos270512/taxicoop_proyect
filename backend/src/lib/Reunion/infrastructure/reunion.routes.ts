import { Router, Response } from 'express';
import { HttpError } from '../../Shared/domain/HttpError';
import { authenticateJWT, authorizeRoles, AuthenticatedRequest } from '../../Shared/infrastructure/middlewares/auth.middleware';
import { SequelizeReunionRepository } from './repositories/SequelizeReunionRepository';
import { SequelizeSocioRepository } from '../../Socio/infrastructure/repositories/SequelizeSocioRepository';
import { parseRegistrosAsistencia, parseReunion } from '../application/reunion.validation';

const router = Router();

const reunionRepository = new SequelizeReunionRepository();
const socioRepository = new SequelizeSocioRepository();

function fail(res: Response, error: unknown) {
  let status = 500;
  let message = error instanceof Error ? error.message : 'Error inesperado.';
  if (error instanceof HttpError) status = error.status;
  return res.status(status).json({ success: false, error: message });
}

router.use(authenticateJWT);

// Historial propio del socio (y util para el administrador)
router.get('/mias', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) throw new HttpError(401, 'Acceso no autorizado.');

    const socio = await socioRepository.findByUserId(req.user.id);
    if (!socio) return res.status(200).json({ success: true, data: [] });

    return res.status(200).json({ success: true, data: await reunionRepository.findMiasBySocioId(socio.id, req.user.id) });
  } catch (error) {
    return fail(res, error);
  }
});

router.get('/', authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
    const result = await reunionRepository.findAll({ page, limit });

    return res.status(200).json({
      success: true,
      data: result.items,
      meta: { total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages },
    });
  } catch (error) {
    return fail(res, error);
  }
});

router.post('/', authorizeRoles('ADMIN'), async (req: AuthenticatedRequest, res) => {
  try {
    const data = parseReunion((req.body ?? {}) as Record<string, unknown>);
    const reunion = await reunionRepository.create({ ...data, creadaPor: req.user?.id ?? null });

    return res.status(201).json({ success: true, message: 'Reunión creada', data: reunion });
  } catch (error) {
    return fail(res, error);
  }
});

router.get('/:id', authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const detalle = await reunionRepository.findById(String(req.params.id));
    if (!detalle) throw new HttpError(404, 'Reunión no encontrada.');
    return res.status(200).json({ success: true, data: detalle });
  } catch (error) {
    return fail(res, error);
  }
});

router.put('/:id/asistencia', authorizeRoles('ADMIN'), async (req: AuthenticatedRequest, res) => {
  try {
    const detalle = await reunionRepository.findById(String(req.params.id));
    if (!detalle) throw new HttpError(404, 'Reunión no encontrada.');

    const registros = parseRegistrosAsistencia(req.body?.registros);
    const saved = await reunionRepository.saveAsistencia(detalle.id, detalle.fecha, registros, req.user?.id ?? null);

    return res.status(200).json({ success: true, message: 'Asistencia guardada', data: saved });
  } catch (error) {
    return fail(res, error);
  }
});

router.delete('/:id', authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const removed = await reunionRepository.remove(String(req.params.id));
    if (!removed) throw new HttpError(404, 'Reunión no encontrada.');
    return res.status(200).json({ success: true, message: 'Reunión eliminada' });
  } catch (error) {
    return fail(res, error);
  }
});

export default router;
