import { Router, Request, Response } from 'express';
import { SequelizeSocioRepository } from './repositories/SequelizeSocioRepository';
import { CreateSocioUseCase } from '../application/CreateSocio';
import { GetAllSociosUseCase } from '../application/GetAllSocios';

const router = Router();

// Inyección de dependencias manual 
const socioRepository = new SequelizeSocioRepository();
const createSocioUseCase = new CreateSocioUseCase(socioRepository);
const getAllSociosUseCase = new GetAllSociosUseCase(socioRepository);

router.post('/', async (req: Request, res: Response) => {
  try {
    const nuevoSocio = await createSocioUseCase.run(req.body);
    return res.status(201).json({
      success: true,
      message: 'Socio creado exitosamente',
      data: nuevoSocio,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/', async (_req: Request, res: Response) => {
  try {
    const socios = await getAllSociosUseCase.run();
    return res.status(200).json({ success: true, data: socios });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;