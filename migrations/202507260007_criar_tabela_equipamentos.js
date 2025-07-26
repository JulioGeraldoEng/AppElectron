exports.up = function(knex) {
  return knex.schema.createTable('equipamentos', function(table) {
    table.increments('id_equipamento').primary();
    table.string('tipo').notNullable();
    table.string('marca').notNullable();
    table.string('modelo').notNullable();
    table.string('numero_serie').unique().notNullable();
    table.date('data_aquisicao');
    table.string('status').notNullable();
    table.integer('id_cliente').unsigned().references('id').inTable('clientes').onDelete('SET NULL');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('equipamentos');
};
