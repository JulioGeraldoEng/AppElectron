exports.up = function(knex) {
  return knex.schema.createTable('usuarios', function(table) {
    table.increments('id').primary();
    table.text('email').unique().notNullable();
    table.text('senha').notNullable();
    table.enu('tipo', ['admin', 'funcionario', 'cliente']).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('usuarios');
};
