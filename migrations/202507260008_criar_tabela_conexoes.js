exports.up = function(knex) {
  return knex.schema.createTable('conexoes', function(table) {
    table.increments('id_conexao').primary();
    table.timestamp('data_conexao').defaultTo(knex.fn.now());
    table.integer('id_cliente').unsigned().notNullable().references('id').inTable('clientes').onDelete('CASCADE');
    table.integer('id_equipamento').unsigned().notNullable().references('id_equipamento').inTable('equipamentos').onDelete('CASCADE');
    table.string('ip_publico').notNullable();
    table.string('mac_address').notNullable();
    table.integer('velocidade_download');
    table.integer('velocidade_upload');
    table.integer('duracao_sessao'); // em segundos
    table.string('status').notNullable(); // conectado, desconectado
  });
};


exports.down = function(knex) {
  return knex.schema.dropTableIfExists('conexoes');
};
