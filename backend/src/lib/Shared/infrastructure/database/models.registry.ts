// Importar los modelos asegura que Sequelize ejecute sus constructores y relaciones
import '../../../Identity/infrastructure/models/UserAuth.model';
import '../../../Socio/infrastructure/models/Socio.model';
import '../../../Unidad/infrastructure/models/Unidad.model';
import '../../../Identity/infrastructure/models/Role.model';
import '../../../Identity/infrastructure/models/UserRole.model';
import '../../../Identity/infrastructure/models/associations';
import '../../../Votacion/infrastructure/models/Election.model';
import '../../../Votacion/infrastructure/models/Option.model';
import '../../../Votacion/infrastructure/models/Vote.model';
import '../../../Votacion/infrastructure/models/associations';
import '../../../Socio/infrastructure/models/associations';
import '../../../Ubicacion/infrastructure/models/Ubicacion.model';


export function registerModels() {
  console.log('Modelos relacionales registrados correctamente en Sequelize.');
}