// Importar los modelos asegura que Sequelize ejecute sus constructores y relaciones
import '../../../Identity/infrastructure/models/UserAuth.model';
import '../../../Socio/infrastructure/models/Socio.model';
import '../../../Unidad/infrastructure/models/Unidad.model';
import '../../../Identity/infrastructure/models/Role.model';
import '../../../Identity/infrastructure/models/UserRole.model';


export function registerModels() {
  console.log('Modelos relacionales registrados correctamente en Sequelize.');
}