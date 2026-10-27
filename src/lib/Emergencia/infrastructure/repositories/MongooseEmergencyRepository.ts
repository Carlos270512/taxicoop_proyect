import { EmergencyRepository } from '../../domain/EmergencyRepository';
import { EmergencyAlert } from '../../domain/EmergencyAlert';
import { EmergencyAlertModel } from '../models/EmergencyAlert.model';

export class MongooseEmergencyRepository implements EmergencyRepository {
  async save(alert: EmergencyAlert): Promise<EmergencyAlert> {
    const created = await EmergencyAlertModel.create({
      socioId: alert.socioId,
      numeroUnidad: alert.numeroUnidad,
      ubicacion: alert.ubicacion,
      estado: alert.estado,
    });

    return new EmergencyAlert(
      created._id.toString(),
      created.socioId,
      created.numeroUnidad,
      created.ubicacion,
      created.estado,
      created.createdAt
    );
  }

  async findAll(): Promise<EmergencyAlert[]> {
    const docs = await EmergencyAlertModel.find().sort({ createdAt: -1 });
    return docs.map(
      (d) =>
        new EmergencyAlert(
          d._id.toString(),
          d.socioId,
          d.numeroUnidad,
          d.ubicacion,
          d.estado as any,
          d.createdAt
        )
    );
  }
}