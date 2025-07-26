exports.up = function(knex) {
  return knex.schema.createTable('clientes', function(table) {
    table.increments('id').primary();
    table.integer('usuario_id').unsigned().unique().notNullable().references('id').inTable('usuarios').onDelete('CASCADE');
    table.string('nome').notNullable();
    table.string('cpf_cnpj').unique();
    table.string('rg');
    table.string('endereco');
    table.string('telefone');
    table.string('email').unique();
    table.date('data_cadastro');
    table.date('data_nascimento');
    table.integer('id_plano').unsigned().references('id_plano').inTable('planos').onDelete('SET NULL');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('clientes');
};
