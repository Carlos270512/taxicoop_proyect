import { Router, Request, Response } from 'express';
import { SequelizeUnidadRepository } from './repositories/SequelizeUnidadRepository';
import { SequelizeSocioRepository } from './repositories/SequelizeSocioRepository';
import { CreateUnidadUseCase } from '../application/CreateUnidad';
import { GetAllUnidadesUseCase } from '../application/GetAllUnidades';

const router = Router();

const unidadRepository = new SequelizeUnidadRepository();
const socioRepository = new SequelizeSocioRepository();
const createUnidadUseCase = new CreateUnidadUseCase(unidadRepository, socioRepository);
const getAllUnidadesUseCase = new GetAllUnidadesUseCase(unidadRepository);

router.post('/', async (req: Request, res: Response) => {
  try {
    const nuevaUnidad = await createUnidadUseCase.run(req.body);
    return res.status(201).json({
      success: true,
      message: 'Unidad registrada exitosamente',
      data: nuevaUnidad,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/', async (_req: Request, res: Response) => {
  try {
    const unidades = await getAllUnidadesUseCase.run();
    return res.status(200).json({ success: true, data: unidades });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;