exports.up = function(knex) {
  return knex.schema.createTable('funcionarios', function(table) {
    table.increments('id').primary();
    table.integer('usuario_id').unsigned().unique().notNullable().references('id').inTable('usuarios').onDelete('CASCADE');
    table.string('nome').notNullable();
    table.string('cargo');
    table.string('telefone');
    table.string('endereco');
    table.string('email').unique().notNullable();
    table.string('cpf').unique();
    table.string('rg');
    table.date('data_nascimento');
    table.date('data_admissao').notNullable();
    table.date('data_demissao');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('funcionarios');
};
