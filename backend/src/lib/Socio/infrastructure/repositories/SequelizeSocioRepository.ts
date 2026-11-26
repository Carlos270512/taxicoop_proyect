import { Op, literal } from 'sequelize';
import { sequelize } from '../../../Shared/infrastructure/database/sequelize.config';
import { HttpError } from '../../../Shared/domain/HttpError';
import { SocioFilters, SocioListResult, SocioRepository, UpdateSocioData } from '../../domain/SocioRepository';
import { Socio, SocioEstado } from '../../domain/Socio';
import { SocioModel } from '../models/Socio.model';
import { UserAuthModel } from '../../../Identity/infrastructure/models/UserAuth.model';
import { RoleModel } from '../../../Identity/infrastructure/models/Role.model';
import { UserRoleModel } from '../../../Identity/infrastructure/models/UserRole.model';

const UNIDADES_COUNT = literal('(select count(*) from unidades u where u."socioId" = "SocioModel"."id")');

function toDomain(row: any): Socio {
  return new Socio(
    row.id,
    row.userId,
    row.cedulaRuc,
    row.nombres,
    row.apellidos,
    row.telefono,
    row.estado,
    row.userAuth ? row.userAuth.email : undefined,
    Number(row.unidadesCount ?? 0),
    row.createdAt,
    row.direccion ?? null,
    row.socioSalienteId ?? null,
    row.solicitudId ?? null
  );
}

export class SequelizeSocioRepository implements SocioRepository {
  async createWithUser(
    socio: Socio,
    email: string,
    passwordHash: string,
    roles: string[],
    extras?: { direccion?: string | null; solicitudId?: string | null; socioSalienteId?: string | null }
  ): Promise<Socio> {
    return await sequelize.transaction(async (transaction) => {
      await UserAuthModel.create(
        { id: socio.userId, email, passwordHash },
        { transaction }
      );

      const roleModels = await RoleModel.findAll({
        where: { nombre: { [Op.in]: roles } },
        transaction,
      });

      if (roleModels.length !== roles.length) {
        const encontrados = roleModels.map((role) => role.nombre);
        const faltantes = roles.filter((role) => !encontrados.includes(role));
        throw new HttpError(400, `Rol inexistente: ${faltantes.join(', ')}.`);
      }

      if (roleModels.length > 0) {
        await UserRoleModel.bulkCreate(
          roleModels.map((role) => ({ userId: socio.userId, roleId: role.id })),
          { transaction }
        );
      }

      await SocioModel.create(
        {
          id: socio.id,
          userId: socio.userId,
          cedulaRuc: socio.cedulaRuc,
          nombres: socio.nombres,
          apellidos: socio.apellidos,
          telefono: socio.telefono,
          estado: socio.estado,
          direccion: extras?.direccion ?? null,
          solicitudId: extras?.solicitudId ?? null,
          socioSalienteId: extras?.socioSalienteId ?? null,
        },
        { transaction }
      );

      return socio;
    });
  }

  async findAll(filters: SocioFilters): Promise<SocioListResult> {
    const where: any = {};

    if (filters.estado) {
      where.estado = filters.estado;
    }

    if (filters.q) {
      const like = `%${filters.q}%`;
      where[Op.or] = [
        { nombres: { [Op.iLike]: like } },
        { apellidos: { [Op.iLike]: like } },
        { cedulaRuc: { [Op.iLike]: like } },
        { telefono: { [Op.iLike]: like } },
        { '$userAuth.email$': { [Op.iLike]: like } },
      ];
    }

    const { rows, count } = await SocioModel.findAndCountAll({
      where,
      attributes: { include: [[UNIDADES_COUNT, 'unidadesCount']] },
      include: [{ model: UserAuthModel, as: 'userAuth', attributes: ['email'], required: false }],
      order: [['createdAt', 'DESC']],
      limit: filters.limit,
      offset: (filters.page - 1) * filters.limit,
      distinct: true,
      subQuery: false,
    });

    const items = rows.map((model) => toDomain(model.get({ plain: true })));

    return {
      items,
      total: count,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.max(1, Math.ceil(count / filters.limit)),
    };
  }

  async findById(id: string): Promise<Socio | null> {
    const model = await SocioModel.findByPk(id, {
      attributes: { include: [[UNIDADES_COUNT, 'unidadesCount']] },
      include: [{ model: UserAuthModel, as: 'userAuth', attributes: ['email'], required: false }],
    });

    if (!model) return null;
    return toDomain(model.get({ plain: true }));
  }

  async findByUserId(userId: string): Promise<Socio | null> {
    const model = await SocioModel.findOne({
      where: { userId },
      attributes: { include: [[UNIDADES_COUNT, 'unidadesCount']] },
      include: [{ model: UserAuthModel, as: 'userAuth', attributes: ['email'], required: false }],
    });

    if (!model) return null;
    return toDomain(model.get({ plain: true }));
  }

  async findByCedula(cedulaRuc: string): Promise<Socio | null> {
    const model = await SocioModel.findOne({ where: { cedulaRuc } });
    if (!model) return null;
    return toDomain(model.get({ plain: true }));
  }

  async update(id: string, data: UpdateSocioData): Promise<Socio | null> {
    const [affected] = await SocioModel.update(data, { where: { id } });
    if (affected === 0) return null;
    return this.findById(id);
  }

  async updateEstado(id: string, estado: SocioEstado): Promise<Socio | null> {
    const [affected] = await SocioModel.update({ estado }, { where: { id } });
    if (affected === 0) return null;
    return this.findById(id);
  }

  async existsEmail(email: string): Promise<boolean> {
    const total = await UserAuthModel.count({ where: { email } });
    return total > 0;
  }
}