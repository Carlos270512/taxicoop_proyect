import { UserAuthModel } from './UserAuth.model';
import { RoleModel } from './Role.model';
import { UserRoleModel } from './UserRole.model';

UserAuthModel.belongsToMany(RoleModel, {
  through: UserRoleModel,
  foreignKey: 'userId',
  otherKey: 'roleId',
  as: 'roles',
});

RoleModel.belongsToMany(UserAuthModel, {
  through: UserRoleModel,
  foreignKey: 'roleId',
  otherKey: 'userId',
  as: 'users',
});