import { Router, Request, Response } from 'express';
import { SequelizeAuthRepository } from './repositories/SequelizeAuthRepository';
import { CreateRoleUseCase } from '../application/CreateRole';
import { RegisterUserUseCase } from '../application/RegisterUser';
import { LoginUserUseCase } from '../application/LoginUser';

const router = Router();
const authRepository = new SequelizeAuthRepository();

const createRoleUseCase = new CreateRoleUseCase(authRepository);
const registerUserUseCase = new RegisterUserUseCase(authRepository);
const loginUserUseCase = new LoginUserUseCase(authRepository);


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
      message: 'Usuario registrado exitosamente', 
      data: user 
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'El email y la contraseña son obligatorios.',
      });
    }

    const authData = await loginUserUseCase.run(email, password);

    return res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: authData,
    });
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;