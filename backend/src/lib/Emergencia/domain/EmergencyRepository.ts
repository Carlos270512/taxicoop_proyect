import { EmergencyAlert } from './EmergencyAlert';

export interface EmergencyRepository {
  save(alert: EmergencyAlert): Promise<EmergencyAlert>;
  findAll(): Promise<EmergencyAlert[]>;
}