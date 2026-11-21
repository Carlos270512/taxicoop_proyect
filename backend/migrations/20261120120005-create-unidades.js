'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('unidades')) return;

    await queryInterface.createTable('unidades', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      numeroUnidad: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      placa: {
        type: Sequelize.STRING(15),
        allowNull: false,
        unique: true,
      },
      anioVehiculo: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      socioId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'socios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      estado: {
        type: Sequelize.ENUM('OPERATIVA', 'EN_TRAMITE', 'SUSPENDIDA'),
        allowNull: false,
        defaultValue: 'OPERATIVA',
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
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('unidades')) return;
    await queryInterface.dropTable('unidades');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_unidades_estado";');
  },
};
