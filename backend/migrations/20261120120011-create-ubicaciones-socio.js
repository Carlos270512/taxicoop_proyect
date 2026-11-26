'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('ubicaciones_socio')) return;

    await queryInterface.createTable('ubicaciones_socio', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      socioId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'socios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      latitud: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      longitud: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      precisionMetros: {
        type: Sequelize.DOUBLE,
        allowNull: true,
      },
      capturedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('ubicaciones_socio', ['socioId', 'capturedAt'], {
      name: 'ubicaciones_socio_socio_captured_idx',
    });
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('ubicaciones_socio')) return;
    await queryInterface.dropTable('ubicaciones_socio');
  },
};
