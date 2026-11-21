'use strict';

const INDEX_NAME = 'unidades_socio_id_idx';

/**
 * Indice para consultar rapido las unidades de un socio (?socioId=).
 */
module.exports = {
  async up(queryInterface) {
    const indexes = await queryInterface.showIndex('unidades');
    if (indexes.some((index) => index.name === INDEX_NAME)) return;

    await queryInterface.addIndex('unidades', ['socioId'], { name: INDEX_NAME });
  },

  async down(queryInterface) {
    const indexes = await queryInterface.showIndex('unidades');
    if (!indexes.some((index) => index.name === INDEX_NAME)) return;

    await queryInterface.removeIndex('unidades', INDEX_NAME);
  },
};
