import { ElectionModel } from './Election.model';
import { OptionModel } from './Option.model';
import { VoteModel } from './Vote.model';
import { UserAuthModel } from '../../../Identity/infrastructure/models/UserAuth.model';

// Una elección tiene muchas opciones
ElectionModel.hasMany(OptionModel, { foreignKey: 'electionId', as: 'options' });
OptionModel.belongsTo(ElectionModel, { foreignKey: 'electionId', as: 'election' });

// Una elección tiene muchos votos
ElectionModel.hasMany(VoteModel, { foreignKey: 'electionId', as: 'votes' });
VoteModel.belongsTo(ElectionModel, { foreignKey: 'electionId', as: 'election' });

// Una opción tiene muchos votos
OptionModel.hasMany(VoteModel, { foreignKey: 'optionId', as: 'votes' });
VoteModel.belongsTo(OptionModel, { foreignKey: 'optionId', as: 'option' });

// Un usuario emite votos
UserAuthModel.hasMany(VoteModel, { foreignKey: 'userId', as: 'votes' });
VoteModel.belongsTo(UserAuthModel, { foreignKey: 'userId', as: 'user' });