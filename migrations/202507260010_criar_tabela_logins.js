exports.up = function(knex) {
  return knex.schema.createTable('logins', function(table) {
    table.increments('id').primary();
    table.integer('usuario_id').unsigned().references('id').inTable('usuarios').onDelete('SET NULL');
    table.string('email').notNullable();
    table.string('ip').nullable();
    table.timestamp('data_hora').defaultTo(knex.fn.now());
    table.enu('status', ['sucesso', 'falha']).notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('logins');
};
