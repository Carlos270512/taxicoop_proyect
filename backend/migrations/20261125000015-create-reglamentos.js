'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('reglamentos')) return;

    await queryInterface.createTable('reglamentos', {
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      titulo: { type: Sequelize.STRING(180), allowNull: false },
      descripcion: { type: Sequelize.STRING(400), allowNull: true },
      nombreOriginal: { type: Sequelize.STRING(200), allowNull: false },
      mimeType: { type: Sequelize.STRING(80), allowNull: false },
      tamano: { type: Sequelize.INTEGER, allowNull: false },
      ruta: { type: Sequelize.STRING(200), allowNull: false },
      subidoPor: { type: Sequelize.UUID, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('reglamentos')) return;
    await queryInterface.dropTable('reglamentos');
  },
};
