import { Router, Response } from 'express';
import { SequelizeSocioRepository } from './repositories/SequelizeSocioRepository';
import { CreateSocioUseCase } from '../application/CreateSocio';
import { GetAllSociosUseCase } from '../application/GetAllSocios';
import { GetSocioByIdUseCase } from '../application/GetSocioById';
import { UpdateSocioUseCase } from '../application/UpdateSocio';
import { ChangeSocioEstadoUseCase } from '../application/ChangeSocioEstado';
import { RetireSocioUseCase } from '../application/RetireSocio';
import { HttpError } from '../../Shared/domain/HttpError';
import { authenticateJWT, authorizeRoles } from '../../Shared/infrastructure/middlewares/auth.middleware';

const router = Router();

// Inyección de dependencias manual
const socioRepository = new SequelizeSocioRepository();
const createSocioUseCase = new CreateSocioUseCase(socioRepository);
const getAllSociosUseCase = new GetAllSociosUseCase(socioRepository);
const getSocioByIdUseCase = new GetSocioByIdUseCase(socioRepository);
const updateSocioUseCase = new UpdateSocioUseCase(socioRepository);
const changeSocioEstadoUseCase = new ChangeSocioEstadoUseCase(socioRepository);
const retireSocioUseCase = new RetireSocioUseCase(socioRepository);

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

// Todo el módulo requiere sesión válida
router.use(authenticateJWT);

router.get('/', async (req, res) => {
  try {
    const result = await getAllSociosUseCase.run({
      q: req.query.q as string | undefined,
      estado: req.query.estado as string | undefined,
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
    const socio = await getSocioByIdUseCase.run(String(req.params.id));
    return res.status(200).json({ success: true, data: socio });
  } catch (error) {
    return fail(res, error);
  }
});

router.post('/', authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const socio = await createSocioUseCase.run(req.body);
    return res.status(201).json({
      success: true,
      message: 'Socio creado exitosamente',
      data: socio,
    });
  } catch (error) {
    return fail(res, error);
  }
});

router.put('/:id', authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const socio = await updateSocioUseCase.run(String(req.params.id), req.body);
    return res.status(200).json({
      success: true,
      message: 'Socio actualizado exitosamente',
      data: socio,
    });
  } catch (error) {
    return fail(res, error);
  }
});

router.patch('/:id/estado', authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const socio = await changeSocioEstadoUseCase.run(String(req.params.id), req.body?.estado);
    return res.status(200).json({
      success: true,
      message: 'Estado del socio actualizado',
      data: socio,
    });
  } catch (error) {
    return fail(res, error);
  }
});

router.delete('/:id', authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const socio = await retireSocioUseCase.run(String(req.params.id));
    return res.status(200).json({
      success: true,
      message: 'Socio retirado (baja lógica)',
      data: socio,
    });
  } catch (error) {
    return fail(res, error);
  }
});

export default router;