import { Router, Response } from 'express';
import { SequelizeUnidadRepository } from './repositories/SequelizeUnidadRepository';
import { SequelizeSocioRepository } from '../../Socio/infrastructure/repositories/SequelizeSocioRepository';
import { CreateUnidadUseCase } from '../application/CreateUnidad';
import { GetAllUnidadesUseCase } from '../application/GetAllUnidades';
import { GetUnidadByIdUseCase } from '../application/GetUnidadById';
import { UpdateUnidadUseCase } from '../application/UpdateUnidad';
import { ChangeUnidadEstadoUseCase } from '../application/ChangeUnidadEstado';
import { RetireUnidadUseCase } from '../application/RetireUnidad';
import { HttpError } from '../../Shared/domain/HttpError';
import { authenticateJWT, authorizeRoles } from '../../Shared/infrastructure/middlewares/auth.middleware';

const router = Router();

const unidadRepository = new SequelizeUnidadRepository();
const socioRepository = new SequelizeSocioRepository();

const createUnidadUseCase = new CreateUnidadUseCase(unidadRepository, socioRepository);
const getAllUnidadesUseCase = new GetAllUnidadesUseCase(unidadRepository);
const getUnidadByIdUseCase = new GetUnidadByIdUseCase(unidadRepository);
const updateUnidadUseCase = new UpdateUnidadUseCase(unidadRepository, socioRepository);
const changeUnidadEstadoUseCase = new ChangeUnidadEstadoUseCase(unidadRepository);
const retireUnidadUseCase = new RetireUnidadUseCase(unidadRepository);

function fail(res: Response, error: unknown) {
  let status = 500;
  let message = error instanceof Error ? error.message : 'Error inesperado.';

  if (error instanceof HttpError) {
    status = error.status;
  } else if (error && typeof error === 'object' && 'name' in error) {
    const name = (error as { name: string }).name;
    if (name === 'SequelizeUniqueConstraintError') {
      status = 409;
      message = 'Ya existe un registro con esos datos.';
    } else if (name === 'SequelizeValidationError') {
      status = 400;
    }
  }

  return res.status(status).json({ success: false, error: message });
}

router.use(authenticateJWT);

router.get('/', async (req, res) => {
  try {
    const result = await getAllUnidadesUseCase.run({
      q: req.query.q as string | undefined,
      estado: req.query.estado as string | undefined,
      socioId: req.query.socioId as string | undefined,
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

router.get('/:id', async (req, res) => {
  try {
    const unidad = await getUnidadByIdUseCase.run(String(req.params.id));
    return res.status(200).json({ success: true, data: unidad });
  } catch (error) {
    return fail(res, error);
  }
});

router.post('/', authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const unidad = await createUnidadUseCase.run(req.body);
    return res.status(201).json({
      success: true,
      message: 'Unidad registrada exitosamente',
      data: unidad,
    });
  } catch (error) {
    return fail(res, error);
  }
});

router.put('/:id', authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const unidad = await updateUnidadUseCase.run(String(req.params.id), req.body);
    return res.status(200).json({
      success: true,
      message: 'Unidad actualizada exitosamente',
      data: unidad,
    });
  } catch (error) {
    return fail(res, error);
  }
});

router.patch('/:id/estado', authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const unidad = await changeUnidadEstadoUseCase.run(String(req.params.id), req.body?.estado);
    return res.status(200).json({
      success: true,
      message: 'Estado de la unidad actualizado',
      data: unidad,
    });
  } catch (error) {
    return fail(res, error);
  }
});

router.delete('/:id', authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const unidad = await retireUnidadUseCase.run(String(req.params.id));
    return res.status(200).json({
      success: true,
      message: 'Unidad suspendida (baja lógica)',
      data: unidad,
    });
  } catch (error) {
    return fail(res, error);
  }
});

export default router;
