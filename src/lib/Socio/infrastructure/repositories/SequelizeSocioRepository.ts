import { SocioRepository } from '../../domain/SocioRepository';
import { Socio } from '../../domain/Socio';
import { SocioModel } from '../models/Socio.model';

export class SequelizeSocioRepository implements SocioRepository {
  async save(socio: Socio): Promise<Socio> {
    await SocioModel.create({
      id: socio.id,
      userId: socio.userId,
      cedulaRuc: socio.cedulaRuc,
      nombres: socio.nombres,
      apellidos: socio.apellidos,
      telefono: socio.telefono,
      estado: socio.estado,
    });
    return socio;
  }

  async findAll(): Promise<Socio[]> {
    const socioModels = await SocioModel.findAll();
    return socioModels.map(
      (m) => new Socio(m.id, m.userId, m.cedulaRuc, m.nombres, m.apellidos, m.telefono, m.estado)
    );
  }

  async findById(id: string): Promise<Socio | null> {
    const m = await SocioModel.findByPk(id);
    if (!m) return null;
    return new Socio(m.id, m.userId, m.cedulaRuc, m.nombres, m.apellidos, m.telefono, m.estado);
  }
}