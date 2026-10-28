// Importar los modelos asegura que Sequelize ejecute sus constructores y relaciones
import '../../../Auth/infrastructure/models/UserAuth.model';
import '../../../Socio/infrastructure/models/Socio.model';
import '../../../Socio/infrastructure/models/Unidad.model';
import '../../../Auth/infrastructure/models/Role.model';
import '../../../Auth/infrastructure/models/UserRole.model';


export function registerModels() {
  console.log('Modelos relacionales registrados correctamente en Sequelize.');
}