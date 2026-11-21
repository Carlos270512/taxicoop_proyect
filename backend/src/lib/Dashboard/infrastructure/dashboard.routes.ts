import { Router, Response } from 'express';
import { MixedDashboardRepository } from './repositories/MixedDashboardRepository';
import { GetDashboardSummaryUseCase } from '../application/GetDashboardSummary';
import { authenticateJWT, AuthenticatedRequest } from '../../Shared/infrastructure/middlewares/auth.middleware';

const router = Router();

const dashboardRepository = new MixedDashboardRepository();
const getDashboardSummaryUseCase = new GetDashboardSummaryUseCase(dashboardRepository);

router.get('/summary', authenticateJWT, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const summary = await getDashboardSummaryUseCase.run();
    return res.status(200).json({ success: true, data: summary });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
