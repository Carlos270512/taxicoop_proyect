import { Router, Request, Response } from 'express';
import { MongooseEmergencyRepository } from './repositories/MongooseEmergencyRepository';
import { TriggerEmergencyAlertUseCase } from '../application/TriggerEmergencyAlert';
import { GetAllEmergencyAlertsUseCase } from '../application/GetAllEmergencyAlerts';

const router = Router();

const emergencyRepository = new MongooseEmergencyRepository();
const triggerAlertUseCase = new TriggerEmergencyAlertUseCase(emergencyRepository);
const getAllAlertsUseCase = new GetAllEmergencyAlertsUseCase(emergencyRepository);

router.post('/', async (req: Request, res: Response) => {
  try {
    const nuevaAlerta = await triggerAlertUseCase.run(req.body);
    return res.status(201).json({
      success: true,
      message: '¡Alerta de emergencia registrada!',
      data: nuevaAlerta,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/', async (_req: Request, res: Response) => {
  try {
    const alertas = await getAllAlertsUseCase.run();
    return res.status(200).json({ success: true, data: alertas });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;