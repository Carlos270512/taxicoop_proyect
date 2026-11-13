import { UserAuthModel } from '../../../Identity/infrastructure/models/UserAuth.model';
import { SocioModel } from './Socio.model';

// Definición formal de la relación 1 a 1
UserAuthModel.hasOne(SocioModel, {
  foreignKey: 'userId',
  as: 'socio',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

SocioModel.belongsTo(UserAuthModel, {
  foreignKey: 'userId',
  as: 'userAuth',
});