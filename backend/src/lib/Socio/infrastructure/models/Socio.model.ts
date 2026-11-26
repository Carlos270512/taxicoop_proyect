import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../Shared/infrastructure/database/sequelize.config';
import { UserAuthModel } from '../../../Identity/infrastructure/models/UserAuth.model'; 

export class SocioModel extends Model {
  declare id: string;
  declare userId: string;
  declare cedulaRuc: string;
  declare nombres: string;
  declare apellidos: string;
  declare telefono: string;
  declare estado: 'ACTIVO' | 'SUSPENDIDO' | 'RETIRADO';
  declare direccion: string | null;
  declare socioSalienteId: string | null;
  declare solicitudId: string | null;
}

SocioModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true, 
      field: 'user_id',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    cedulaRuc: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    nombres: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    apellidos: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM('ACTIVO', 'SUSPENDIDO', 'RETIRADO'),
      allowNull: false,
      defaultValue: 'ACTIVO',
    },
    direccion: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    socioSalienteId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    solicitudId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'socios',
    timestamps: true,
  }
);