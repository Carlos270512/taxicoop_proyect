import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../Shared/infrastructure/database/sequelize.config';

export class ReunionModel extends Model {
  declare id: string;
  declare titulo: string;
  declare descripcion: string | null;
  declare fecha: string;
  declare eleccionId: string | null;
  declare creadaPor: string | null;
  declare createdAt: Date;
}

ReunionModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    titulo: { type: DataTypes.STRING(180), allowNull: false },
    descripcion: { type: DataTypes.STRING(400), allowNull: true },
    fecha: { type: DataTypes.DATEONLY, allowNull: false },
    eleccionId: { type: DataTypes.UUID, allowNull: true },
    creadaPor: { type: DataTypes.UUID, allowNull: true },
  },
  { sequelize, tableName: 'reuniones', timestamps: true }
);
