import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../Shared/infrastructure/database/sequelize.config';

export class SocioModel extends Model {
  declare id: string;
  declare cedulaRuc: string;
  declare nombres: string;
  declare apellidos: string;
  declare telefono: string;
  declare estado: 'ACTIVO' | 'SUSPENDIDO' | 'RETIRADO';
}

SocioModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
  },
  {
    sequelize,
    tableName: 'socios',
    timestamps: true,
  }
);