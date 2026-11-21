'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('socios')) return;

    await queryInterface.createTable('socios', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'users_auth', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      cedulaRuc: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      nombres: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      apellidos: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      telefono: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      estado: {
        type: Sequelize.ENUM('ACTIVO', 'SUSPENDIDO', 'RETIRADO'),
        allowNull: false,
        defaultValue: 'ACTIVO',
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
    if (!tables.includes('socios')) return;
    await queryInterface.dropTable('socios');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_socios_estado";');
  },
};
