import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../Shared/infrastructure/database/sequelize.config';

export class OptionModel extends Model {
  declare id: string;
  declare electionId: string;
  declare title: string;
  declare description: string;
}

OptionModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    electionId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'election_options',
    timestamps: true,
  }
);