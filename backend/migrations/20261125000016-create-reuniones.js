'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();

    if (!tables.includes('reuniones')) {
      await queryInterface.createTable('reuniones', {
        id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
        titulo: { type: Sequelize.STRING(180), allowNull: false },
        descripcion: { type: Sequelize.STRING(400), allowNull: true },
        fecha: { type: Sequelize.DATEONLY, allowNull: false },
        eleccionId: {
          type: Sequelize.UUID,
          allowNull: true,
          references: { model: 'elections', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        creadaPor: { type: Sequelize.UUID, allowNull: true },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      });
    }

    const asistenciaCols = await queryInterface.describeTable('asistencias');

    if (!asistenciaCols.reunionId) {
      await queryInterface.addColumn('asistencias', 'reunionId', {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'reuniones', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });
    }

    // Convierte las asistencias sueltas por fecha en reuniones historicas
    await queryInterface.sequelize.query(`
      INSERT INTO reuniones (id, titulo, fecha, "createdAt", "updatedAt")
      SELECT gen_random_uuid(), 'Reunión del ' || to_char(d.fecha, 'DD/MM/YYYY'), d.fecha, now(), now()
        FROM (SELECT DISTINCT fecha FROM asistencias WHERE "reunionId" IS NULL) d
    `);

    await queryInterface.sequelize.query(`
      UPDATE asistencias a
         SET "reunionId" = r.id
        FROM reuniones r
       WHERE r.fecha = a.fecha AND a."reunionId" IS NULL
    `);

    await queryInterface.removeIndex('asistencias', 'asistencias_fecha_socio_unique').catch(() => {});
    await queryInterface.addIndex('asistencias', ['socioId', 'reunionId'], {
      unique: true,
      name: 'asistencias_socio_reunion_unique',
    });
    await queryInterface.addIndex('reuniones', ['fecha'], { name: 'reuniones_fecha_idx' });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('asistencias', 'asistencias_socio_reunion_unique').catch(() => {});
    await queryInterface.removeColumn('asistencias', 'reunionId').catch(() => {});
    await queryInterface.dropTable('reuniones').catch(() => {});
  },
};
