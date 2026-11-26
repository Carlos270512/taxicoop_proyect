'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const socioCols = await queryInterface.describeTable('socios');

    if (!socioCols.direccion) {
      await queryInterface.addColumn('socios', 'direccion', { type: Sequelize.STRING(200), allowNull: true });
    }
    if (!socioCols.socioSalienteId) {
      await queryInterface.addColumn('socios', 'socioSalienteId', {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'socios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }
    if (!socioCols.solicitudId) {
      await queryInterface.addColumn('socios', 'solicitudId', { type: Sequelize.UUID, allowNull: true });
    }

    const unidadCols = await queryInterface.describeTable('unidades');

    if (!unidadCols.fechaExpiracion) {
      await queryInterface.addColumn('unidades', 'fechaExpiracion', { type: Sequelize.DATE, allowNull: true });
    }
    if (!unidadCols.matriculaArchivoId) {
      await queryInterface.addColumn('unidades', 'matriculaArchivoId', { type: Sequelize.UUID, allowNull: true });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('unidades', 'matriculaArchivoId').catch(() => {});
    await queryInterface.removeColumn('unidades', 'fechaExpiracion').catch(() => {});
    await queryInterface.removeColumn('socios', 'solicitudId').catch(() => {});
    await queryInterface.removeColumn('socios', 'socioSalienteId').catch(() => {});
    await queryInterface.removeColumn('socios', 'direccion').catch(() => {});
  },
};
