import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../Shared/infrastructure/database/sequelize.config';

export class ReglamentoModel extends Model {
  declare id: string;
  declare titulo: string;
  declare descripcion: string | null;
  declare nombreOriginal: string;
  declare mimeType: string;
  declare tamano: number;
  declare ruta: string;
  declare subidoPor: string | null;
  declare createdAt: Date;
}

ReglamentoModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    titulo: { type: DataTypes.STRING(180), allowNull: false },
    descripcion: { type: DataTypes.STRING(400), allowNull: true },
    nombreOriginal: { type: DataTypes.STRING(200), allowNull: false },
    mimeType: { type: DataTypes.STRING(80), allowNull: false },
    tamano: { type: DataTypes.INTEGER, allowNull: false },
    ruta: { type: DataTypes.STRING(200), allowNull: false },
    subidoPor: { type: DataTypes.UUID, allowNull: true },
  },
  { sequelize, tableName: 'reglamentos', timestamps: true }
);
