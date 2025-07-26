exports.up = function(knex) {
  return knex.schema.createTable('notificacoes', function(table) {
    table.increments('id').primary();
    table.integer('id_usuario').unsigned().notNullable().references('id').inTable('usuarios').onDelete('CASCADE');
    table.text('mensagem').notNullable();
    table.boolean('lida').defaultTo(false);
    table.timestamp('data_criacao').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('notificacoes');
};
