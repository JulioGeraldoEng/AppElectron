exports.up = function(knex) {
  return knex.schema.createTable('admins', function(table) {
    table.increments('id').primary();
    table.integer('usuario_id').unsigned().unique().notNullable().references('id').inTable('usuarios').onDelete('CASCADE');
    table.string('nome').notNullable();
    table.string('cpf').unique();
    table.string('rg');
    table.string('email').unique().notNullable();
    table.string('telefone');
    table.string('endereco');
    table.date('data_admissao').notNullable();
    table.date('data_demissao');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('admins');
};
