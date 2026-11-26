import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../Shared/infrastructure/database/sequelize.config';
import { SocioModel } from '../../../Socio/infrastructure/models/Socio.model';

export class UnidadModel extends Model {
  declare id: string;
  declare numeroUnidad: string;
  declare placa: string;
  declare anioVehiculo: number;
  declare socioId: string;
  declare estado: 'OPERATIVA' | 'EN_TRAMITE' | 'SUSPENDIDA';
  declare fechaExpiracion: Date | null;
  declare matriculaArchivoId: string | null;
}

UnidadModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    numeroUnidad: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    placa: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: true,
    },
    anioVehiculo: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    socioId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: SocioModel,
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    estado: {
      type: DataTypes.ENUM('OPERATIVA', 'EN_TRAMITE', 'SUSPENDIDA'),
      allowNull: false,
      defaultValue: 'OPERATIVA',
    },
    fechaExpiracion: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    matriculaArchivoId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'unidades',
    timestamps: true,
  }
);

// Definición de Asociación (1 Socio -> N Unidades)
SocioModel.hasMany(UnidadModel, { foreignKey: 'socioId', as: 'unidades' });
UnidadModel.belongsTo(SocioModel, { foreignKey: 'socioId', as: 'socio' });