import { DashboardCounters, RecentActivityItem } from './DashboardSummary';

export interface DashboardRepository {
  getCounters(): Promise<DashboardCounters>;
  getRecentActivity(limit: number): Promise<RecentActivityItem[]>;
}
