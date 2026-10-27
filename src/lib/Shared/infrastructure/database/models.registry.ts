// Importar los modelos asegura que Sequelize ejecute sus constructores y relaciones
import '../../../Auth/infrastructure/models/User.model';
import '../../../Socio/infrastructure/models/Socio.model';
import '../../../Socio/infrastructure/models/Unidad.model';

export function registerModels() {
  console.log('Modelos relacionales registrados correctamente en Sequelize.');
}