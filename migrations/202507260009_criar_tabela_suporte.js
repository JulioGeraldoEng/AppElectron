exports.up = function(knex) {
  return knex.schema.createTable('suporte', function(table) {
    table.increments('id_chamado').primary();
    table.timestamp('data_abertura').defaultTo(knex.fn.now());
    table.timestamp('data_fechamento').nullable();
    table.integer('id_cliente').unsigned().notNullable().references('id').inTable('clientes').onDelete('CASCADE');
    table.string('assunto').notNullable();
    table.text('descricao').notNullable();
    table.string('status').notNullable();
    table.string('tecnico_responsavel').nullable();
    table.text('observacoes').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('suporte');
};
