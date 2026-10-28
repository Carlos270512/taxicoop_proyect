import { AuthRepository } from '../../domain/AuthRepository';
import { UserAuth } from '../../domain/UserAuth';
import { Role } from '../../domain/Role';
import { UserAuthModel } from '../models/UserAuth.model';
import { RoleModel } from '../models/Role.model';
import {UserRoleModel} from '../models/UserRole.model'

export class SequelizeAuthRepository implements AuthRepository {
  async saveRole(role: Role): Promise<Role> {
    const created = await RoleModel.create({
      id: role.id,
      nombre: role.nombre,
      descripcion: role.descripcion,
    });
    return new Role(created.id, created.nombre, created.descripcion);
  }

  async findAllRoles(): Promise<Role[]> {
    const models = await RoleModel.findAll();
    return models.map(m => new Role(m.id, m.nombre, m.descripcion));
  }

 async saveUser(user: UserAuth): Promise<UserAuth> {
    // 1. Creamos el usuario base
    const userModel = await UserAuthModel.create({
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
    });
    
    // 2. Insertamos la relación directamente en la tabla pivote
    if (user.roles.length > 0) {
      const roleModels = await RoleModel.findAll({
        where: { id: user.roles.map(r => r.id) }
      });

      for (const role of roleModels) {
        await UserRoleModel.create({
          userId: userModel.id,
          roleId: role.id,
        });
      }
    }

    return user;
  }

  async findByEmail(email: string): Promise<UserAuth | null> {
    const model = await UserAuthModel.findOne({
      where: { email },
      include: [{ model: RoleModel, as: 'roles' }]
    });

    if (!model) return null;

    const roles = (model.roles || []).map(r => new Role(r.id, r.nombre, r.descripcion));
    return new UserAuth(model.id, model.email, model.passwordHash, roles);
  }
}