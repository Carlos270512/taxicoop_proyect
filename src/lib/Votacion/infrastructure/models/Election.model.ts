import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../Shared/infrastructure/database/sequelize.config';

export class ElectionModel extends Model {
  public id!: string;
  public title!: string;
  public description!: string;
  public startDate!: Date;
  public endDate!: Date;
  public status!: 'DRAFT' | 'ACTIVE' | 'CLOSED';
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