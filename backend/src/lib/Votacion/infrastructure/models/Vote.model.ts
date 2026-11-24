import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../Shared/infrastructure/database/sequelize.config';

export class VoteModel extends Model {
  declare id: string;
  declare electionId: string;
  declare optionId: string;
  declare userId: string;
}

VoteModel.init(
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
    optionId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'votes',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['electionId', 'userId'],
      },
    ],
  }
);