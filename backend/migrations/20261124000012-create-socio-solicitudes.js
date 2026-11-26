'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();

    if (!tables.includes('socio_solicitudes')) {
      await queryInterface.createTable('socio_solicitudes', {
        id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
        token: { type: Sequelize.STRING(64), allowNull: false, unique: true },
        estado: {
          type: Sequelize.ENUM('PENDIENTE', 'APROBADA', 'RECHAZADA'),
          allowNull: false,
          defaultValue: 'PENDIENTE',
        },
        datos: { type: Sequelize.JSONB, allowNull: false, defaultValue: {} },
        passwordHash: { type: Sequelize.STRING(120), allowNull: true },
        socioSalienteId: {
          type: Sequelize.UUID,
          allowNull: true,
          references: { model: 'socios', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        socioId: {
          type: Sequelize.UUID,
          allowNull: true,
          references: { model: 'socios', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        motivoRechazo: { type: Sequelize.STRING(400), allowNull: true },
        submittedAt: { type: Sequelize.DATE, allowNull: true },
        reviewedAt: { type: Sequelize.DATE, allowNull: true },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      });
    }

    if (!tables.includes('archivos')) {
      await queryInterface.createTable('archivos', {
        id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
        solicitudId: {
          type: Sequelize.UUID,
          allowNull: true,
          references: { model: 'socio_solicitudes', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        socioId: { type: Sequelize.UUID, allowNull: true },
        tipo: {
          type: Sequelize.ENUM('LICENCIA', 'CONTRATO', 'MATRICULA'),
          allowNull: false,
        },
        nombreOriginal: { type: Sequelize.STRING(200), allowNull: false },
        mimeType: { type: Sequelize.STRING(80), allowNull: false },
        tamano: { type: Sequelize.INTEGER, allowNull: false },
        ruta: { type: Sequelize.STRING(200), allowNull: false },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      });
    }

    await queryInterface.addIndex('socio_solicitudes', ['estado'], { name: 'socio_solicitudes_estado_idx' });
    await queryInterface.addIndex('archivos', ['solicitudId'], { name: 'archivos_solicitud_idx' });
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('archivos')) await queryInterface.dropTable('archivos');
    if (tables.includes('socio_solicitudes')) await queryInterface.dropTable('socio_solicitudes');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_archivos_tipo";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_socio_solicitudes_estado";');
  },
};
