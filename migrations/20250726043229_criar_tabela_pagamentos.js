exports.up = function(knex) {
  return knex.schema.createTable('pagamentos', function(table) {
    table.increments('id').primary();
    table.integer('id_contrato').unsigned().notNullable().references('id_contrato').inTable('contratos').onDelete('CASCADE');
    table.decimal('valor', 10, 2).notNullable();
    table.date('data_pagamento').notNullable();
    table.string('metodo').notNullable(); // boleto, pix, cartão
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('pagamentos');
};
