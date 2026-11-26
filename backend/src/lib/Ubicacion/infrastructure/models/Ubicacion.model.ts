import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../Shared/infrastructure/database/sequelize.config';

export class UbicacionModel extends Model {
  declare id: string;
  declare socioId: string;
  declare latitud: number;
  declare longitud: number;
  declare precisionMetros: number | null;
  declare capturedAt: Date;
}

UbicacionModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    socioId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    latitud: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    longitud: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    precisionMetros: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    capturedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'ubicaciones_socio',
    timestamps: true,
  }
);
