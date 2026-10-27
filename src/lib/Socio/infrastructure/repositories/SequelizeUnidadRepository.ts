import { UnidadRepository } from '../../domain/UnidadRepository';
import { Unidad } from '../../domain/Unidad';
import { UnidadModel } from '../models/Unidad.model';
import { SocioModel } from '../models/Socio.model';

export class SequelizeUnidadRepository implements UnidadRepository {
  async save(unidad: Unidad): Promise<Unidad> {
    await UnidadModel.create({
      id: unidad.id,
      numeroUnidad: unidad.numeroUnidad,
      placa: unidad.placa,
      anioVehiculo: unidad.anioVehiculo,
      socioId: unidad.socioId,
      estado: unidad.estado,
    });
    return unidad;
  }

  async findAll(): Promise<Unidad[]> {
    const unidadModels = await UnidadModel.findAll({
      include: [{ model: SocioModel, as: 'socio' }],
    });
    return unidadModels.map(
      (m) => new Unidad(m.id, m.numeroUnidad, m.placa, m.anioVehiculo, m.socioId, m.estado)
    );
  }

  async findById(id: string): Promise<Unidad | null> {
    const m = await UnidadModel.findByPk(id);
    if (!m) return null;
    return new Unidad(m.id, m.numeroUnidad, m.placa, m.anioVehiculo, m.socioId, m.estado);
  }
}