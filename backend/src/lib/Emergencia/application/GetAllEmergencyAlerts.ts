import { EmergencyRepository } from '../domain/EmergencyRepository';
import { EmergencyAlert } from '../domain/EmergencyAlert';

export class GetAllEmergencyAlertsUseCase {
  constructor(private readonly emergencyRepository: EmergencyRepository) {}

  async run(): Promise<EmergencyAlert[]> {
    return await this.emergencyRepository.findAll();
  }
}