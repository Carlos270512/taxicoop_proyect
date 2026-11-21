import { Op } from 'sequelize';
import { UnidadFilters, UnidadListResult, UnidadRepository, UpdateUnidadData } from '../../domain/UnidadRepository';
import { Unidad, UnidadEstado } from '../../domain/Unidad';
import { UnidadModel } from '../models/Unidad.model';
import { SocioModel } from '../../../Socio/infrastructure/models/Socio.model';

const SOCIO_INCLUDE = {
  model: SocioModel,
  as: 'socio',
  attributes: ['id', 'nombres', 'apellidos', 'estado'],
  required: false,
};

function toDomain(row: any): Unidad {
  const socio = row.socio;

  return new Unidad(
    row.id,
    row.numeroUnidad,
    row.placa,
    row.anioVehiculo,
    row.socioId,
    row.estado,
    socio ? `${socio.nombres} ${socio.apellidos}` : undefined,
    socio ? socio.estado : undefined,
    row.createdAt
  );
}

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

  async findAll(filters: UnidadFilters): Promise<UnidadListResult> {
    const where: any = {};

    if (filters.estado) {
      where.estado = filters.estado;
    }

    if (filters.socioId) {
      where.socioId = filters.socioId;
    }

    if (filters.q) {
      const like = `%${filters.q}%`;
      where[Op.or] = [
        { numeroUnidad: { [Op.iLike]: like } },
        { placa: { [Op.iLike]: like } },
        { '$socio.nombres$': { [Op.iLike]: like } },
        { '$socio.apellidos$': { [Op.iLike]: like } },
      ];
    }

    const { rows, count } = await UnidadModel.findAndCountAll({
      where,
      include: [SOCIO_INCLUDE],
      order: [['numeroUnidad', 'ASC']],
      limit: filters.limit,
      offset: (filters.page - 1) * filters.limit,
      distinct: true,
      subQuery: false,
    });

    return {
      items: rows.map((model) => toDomain(model.get({ plain: true }))),
      total: count,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.max(1, Math.ceil(count / filters.limit)),
    };
  }

  async findById(id: string): Promise<Unidad | null> {
    const model = await UnidadModel.findByPk(id, { include: [SOCIO_INCLUDE] });
    if (!model) return null;
    return toDomain(model.get({ plain: true }));
  }

  async findByPlaca(placa: string): Promise<Unidad | null> {
    const model = await UnidadModel.findOne({ where: { placa } });
    if (!model) return null;
    return toDomain(model.get({ plain: true }));
  }

  async findByNumero(numeroUnidad: string): Promise<Unidad | null> {
    const model = await UnidadModel.findOne({ where: { numeroUnidad } });
    if (!model) return null;
    return toDomain(model.get({ plain: true }));
  }

  async update(id: string, data: UpdateUnidadData): Promise<Unidad | null> {
    const [affected] = await UnidadModel.update(data, { where: { id } });
    if (affected === 0) return null;
    return this.findById(id);
  }

  async updateEstado(id: string, estado: UnidadEstado): Promise<Unidad | null> {
    const [affected] = await UnidadModel.update({ estado }, { where: { id } });
    if (affected === 0) return null;
    return this.findById(id);
  }

  async suspendBySocioId(socioId: string): Promise<number> {
    const [affected] = await UnidadModel.update(
      { estado: 'SUSPENDIDA' },
      { where: { socioId, estado: { [Op.ne]: 'SUSPENDIDA' } } }
    );
    return affected;
  }
}
