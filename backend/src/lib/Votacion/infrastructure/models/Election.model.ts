import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../Shared/infrastructure/database/sequelize.config';
import { OptionModel } from './Option.model';

export class ElectionModel extends Model {
  declare id: string;
  declare title: string;
  declare description: string;
  declare startDate: Date;
  declare endDate: Date;
  declare status: 'DRAFT' | 'ACTIVE' | 'CLOSED';
  declare options?: OptionModel[];
}

ElectionModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('DRAFT', 'ACTIVE', 'CLOSED'),
      allowNull: false,
      defaultValue: 'DRAFT',
    },
  },
  {
    sequelize,
    tableName: 'elections',
    timestamps: true,
  }
);