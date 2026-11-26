import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../Shared/infrastructure/database/sequelize.config';

export class SolicitudModel extends Model {
  declare id: string;
  declare token: string;
  declare estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  declare datos: Record<string, unknown>;
  declare passwordHash: string | null;
  declare socioSalienteId: string | null;
  declare socioId: string | null;
  declare motivoRechazo: string | null;
  declare submittedAt: Date | null;
  declare reviewedAt: Date | null;
  declare createdAt: Date;
}

SolicitudModel.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    token: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    estado: {
      type: DataTypes.ENUM('PENDIENTE', 'APROBADA', 'RECHAZADA'),
      allowNull: false,
      defaultValue: 'PENDIENTE',
    },
    datos: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
    passwordHash: { type: DataTypes.STRING(120), allowNull: true },
    socioSalienteId: { type: DataTypes.UUID, allowNull: true },
    socioId: { type: DataTypes.UUID, allowNull: true },
    motivoRechazo: { type: DataTypes.STRING(400), allowNull: true },
    submittedAt: { type: DataTypes.DATE, allowNull: true },
    reviewedAt: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, tableName: 'socio_solicitudes', timestamps: true }
);
