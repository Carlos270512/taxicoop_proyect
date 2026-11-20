import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../Shared/infrastructure/database/sequelize.config';

export class UserRoleModel extends Model {
  declare userId: string;
  declare roleId: string;
}

UserRoleModel.init(
  {
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    roleId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'user_roles',
    timestamps: true,
  }
);