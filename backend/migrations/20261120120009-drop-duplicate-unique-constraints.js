'use strict';

/**
 * Elimina restricciones UNIQUE duplicadas que dejaba sequelize.sync({ alter: true }).
 * Cada duplicado es una copia exacta de otra restriccion sobre las mismas columnas,
 * asi que se conserva una (la de nombre canonico) y se eliminan las demas.
 * No se toca ningun dato.
 */
module.exports = {
  async up(queryInterface) {
    const [rows] = await queryInterface.sequelize.query(`
      select c.relname as table_name,
             con.conname as constraint_name,
             pg_get_constraintdef(con.oid) as definition
      from pg_constraint con
      join pg_class c on c.oid = con.conrelid
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and con.contype = 'u'
      order by c.relname, con.conname
    `);

    const groups = new Map();
    for (const row of rows) {
      const key = `${row.table_name}|${row.definition}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(row);
    }

    for (const group of groups.values()) {
      if (group.length < 2) continue;

      const canonical = group.find((row) => !/_key\d+$/.test(row.constraint_name)) || group[0];

      for (const row of group) {
        if (row.constraint_name === canonical.constraint_name) continue;
        await queryInterface.removeConstraint(row.table_name, row.constraint_name);
        console.log(`  - ${row.table_name}: eliminada restriccion duplicada ${row.constraint_name}`);
      }
    }
  },

  // No se recrean los duplicados: deshacer esta migracion no aporta nada.
  async down() {},
};
