'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('votes')) return;

    await queryInterface.createTable('votes', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      electionId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'elections', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      optionId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'election_options', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users_auth', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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

    // Un usuario solo puede votar una vez por elección
    await queryInterface.addIndex('votes', ['electionId', 'userId'], {
      unique: true,
      name: 'votes_election_user_unique',
    });
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('votes')) return;
    await queryInterface.dropTable('votes');
  },
};
