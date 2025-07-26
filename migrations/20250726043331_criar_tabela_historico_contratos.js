exports.up = function(knex) {
  return knex.schema.createTable('historico_contratos', function(table) {
    table.increments('id').primary();
    table.integer('id_contrato').unsigned().notNullable().references('id_contrato').inTable('contratos').onDelete('CASCADE');
    table.timestamp('data').defaultTo(knex.fn.now());
    table.text('descricao').notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('historico_contratos');
};
