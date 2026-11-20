import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../Shared/infrastructure/database/sequelize.config';
import { RoleModel } from './Role.model';

export class UserAuthModel extends Model {
  declare id: string;
  declare email: string;
  declare passwordHash: string;
  declare roles?: RoleModel[];
}

UserAuthModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'users_auth',
    timestamps: true,
  }
);