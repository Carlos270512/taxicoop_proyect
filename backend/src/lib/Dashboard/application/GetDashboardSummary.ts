import { DashboardRepository } from '../domain/DashboardRepository';
import { DashboardSummary } from '../domain/DashboardSummary';

export class GetDashboardSummaryUseCase {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async run(recentLimit = 8): Promise<DashboardSummary> {
    const [counters, recentActivity] = await Promise.all([
      this.dashboardRepository.getCounters(),
      this.dashboardRepository.getRecentActivity(recentLimit),
    ]);

    return {
      counters,
      recentActivity,
      generatedAt: new Date().toISOString(),
    };
  }
}
