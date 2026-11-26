import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../Shared/infrastructure/database/sequelize.config';

export class ArchivoModel extends Model {
  declare id: string;
  declare solicitudId: string | null;
  declare socioId: string | null;
  declare tipo: 'LICENCIA' | 'CONTRATO' | 'MATRICULA';
  declare nombreOriginal: string;
  declare mimeType: string;
  declare tamano: number;
  declare ruta: string;
  declare createdAt: Date;
}

ArchivoModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    solicitudId: { type: DataTypes.UUID, allowNull: true },
    socioId: { type: DataTypes.UUID, allowNull: true },
    tipo: { type: DataTypes.ENUM('LICENCIA', 'CONTRATO', 'MATRICULA'), allowNull: false },
    nombreOriginal: { type: DataTypes.STRING(200), allowNull: false },
    mimeType: { type: DataTypes.STRING(80), allowNull: false },
    tamano: { type: DataTypes.INTEGER, allowNull: false },
    ruta: { type: DataTypes.STRING(200), allowNull: false },
  },
  { sequelize, tableName: 'archivos', timestamps: true }
);
