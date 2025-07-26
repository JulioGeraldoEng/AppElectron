exports.up = function(knex) {
  return knex.schema.createTable('contratos', function(table) {
    table.increments('id_contrato').primary();
    table.date('data_inicio').notNullable();
    table.date('data_fim');
    table.string('status').notNullable(); // ativo, inativo, pendente
    table.integer('id_cliente').unsigned().notNullable().references('id').inTable('clientes').onDelete('CASCADE');
    table.integer('id_plano').unsigned().notNullable().references('id_plano').inTable('planos').onDelete('CASCADE');
    table.string('forma_pagamento').notNullable(); // boleto, cartão, pix, etc
    table.text('observacoes');
    table.decimal('valor_mensal', 10, 2).notNullable().defaultTo(0);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('contratos');
};
