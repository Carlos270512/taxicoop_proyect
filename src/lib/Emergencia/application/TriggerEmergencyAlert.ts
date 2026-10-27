import { EmergencyRepository } from '../domain/EmergencyRepository';
import { EmergencyAlert } from '../domain/EmergencyAlert';
import { v4 as uuidv4 } from 'uuid';

export class TriggerEmergencyAlertUseCase {
  constructor(private readonly emergencyRepository: EmergencyRepository) {}

  async run(data: { socioId: string; numeroUnidad: string; latitud: number; longitud: number }): Promise<EmergencyAlert> {
    const alert = new EmergencyAlert(
      uuidv4(),
      data.socioId,
      data.numeroUnidad,
      {
        latitud: data.latitud,
        longitud: data.longitud,
      },
      'PENDIENTE',
      new Date()
    );

    return await this.emergencyRepository.save(alert);
  }
}