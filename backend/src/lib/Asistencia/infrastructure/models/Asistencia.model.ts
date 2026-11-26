import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../Shared/infrastructure/database/sequelize.config';

export class AsistenciaModel extends Model {
  declare id: string;
  declare socioId: string;
  declare fecha: string;
  declare reunionId: string | null;
  declare presente: boolean;
  declare registradoPor: string | null;
}

AsistenciaModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    socioId: { type: DataTypes.UUID, allowNull: false },
    fecha: { type: DataTypes.DATEONLY, allowNull: false },
    reunionId: { type: DataTypes.UUID, allowNull: true },
    presente: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    registradoPor: { type: DataTypes.UUID, allowNull: true },
  },
  { sequelize, tableName: 'asistencias', timestamps: true }
);
