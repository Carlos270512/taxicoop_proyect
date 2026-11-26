'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('asistencias')) return;

    await queryInterface.createTable('asistencias', {
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      socioId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'socios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      fecha: { type: Sequelize.DATEONLY, allowNull: false },
      presente: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      registradoPor: { type: Sequelize.UUID, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('asistencias', ['fecha', 'socioId'], {
      unique: true,
      name: 'asistencias_fecha_socio_unique',
    });
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('asistencias')) return;
    await queryInterface.dropTable('asistencias');
  },
};
