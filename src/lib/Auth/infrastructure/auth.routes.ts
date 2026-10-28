import { Router, Request, Response } from 'express';
import { SequelizeAuthRepository } from './repositories/SequelizeAuthRepository';
import { CreateRoleUseCase } from '../application/CreateRole';
import { RegisterUserUseCase } from '../application/RegisterUser';

const router = Router();
const authRepository = new SequelizeAuthRepository();

const createRoleUseCase = new CreateRoleUseCase(authRepository);
const registerUserUseCase = new RegisterUserUseCase(authRepository);

router.post('/roles', async (req: Request, res: Response) => {
  try {
    const role = await createRoleUseCase.run(req.body);
    return res.status(201).json({ success: true, data: role });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/roles', async (_req: Request, res: Response) => {
  try {
    const roles = await authRepository.findAllRoles();
    return res.status(200).json({ success: true, data: roles });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/register', async (req: Request, res: Response) => {
  try {
    const user = await registerUserUseCase.run(req.body);
    return res.status(201).json({ 
      success: true, 
      message: 'Usuario registrado exitosamente ', 
      data: user 
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

export default router;