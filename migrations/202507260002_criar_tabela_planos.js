exports.up = function(knex) {
  return knex.schema.createTable('planos', function(table) {
    table.increments('id_plano').primary();
    table.text('nome_plano').notNullable();
    table.integer('velocidade_download').notNullable();
    table.integer('velocidade_upload').notNullable();
    table.decimal('preco', 10, 2).notNullable();
    table.text('descricao');
    table.integer('franquia_dados');
    table.text('tipo_conexao');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('planos');
};
