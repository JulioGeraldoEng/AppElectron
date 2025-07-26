require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { faker } = require('@faker-js/faker/locale/pt_BR');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function criarUsuario(email, senha, tipo) {
  const senhaHash = await bcrypt.hash(senha, 10);
  const result = await pool.query(
    'INSERT INTO usuarios (email, senha, tipo) VALUES ($1, $2, $3) RETURNING id',
    [email, senhaHash, tipo]
  );
  return result.rows[0].id;
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@provedor.com';
  const senha = process.env.ADMIN_SENHA || 'admin123';
  const nome = process.env.ADMIN_NOME || 'Administrador';
  const telefone = process.env.ADMIN_TELEFONE || '11999999999';

  const usuarioId = await criarUsuario(email, senha, 'admin');

  await pool.query(
    `INSERT INTO admins (
      usuario_id, nome, cpf, rg, email, telefone, endereco,
      data_admissao, data_demissao
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      usuarioId,
      nome,
      faker.string.numeric(11),
      faker.string.numeric(9),
      email,
      telefone,
      faker.location.streetAddress(),
      faker.date.past(),
      null,
    ]
  );
}

async function seedFuncionario() {
  const email = process.env.FUNCIONARIO_EMAIL || 'funcionario@provedor.com';
  const senha = process.env.FUNCIONARIO_SENHA || 'func123';
  const nome = process.env.FUNCIONARIO_NOME || 'Funcionário Padrão';
  const telefone = process.env.FUNCIONARIO_TELEFONE || '11988888888';
  const cargo = process.env.FUNCIONARIO_CARGO || 'Técnico de Campo';

  const usuarioId = await criarUsuario(email, senha, 'funcionario');

  await pool.query(
    `INSERT INTO funcionarios (
      usuario_id, nome, cpf, rg, email, telefone, endereco,
      data_admissao, data_demissao, cargo
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      usuarioId,
      nome,
      faker.string.numeric(11),
      faker.string.numeric(9),
      email,
      telefone,
      faker.location.streetAddress(),
      faker.date.past(),
      null,
      cargo
    ]
  );
}

async function seedCliente() {
  const email = process.env.CLIENTE_EMAIL || 'cliente@provedor.com';
  const senha = process.env.CLIENTE_SENHA || 'cliente123';
  const nome = process.env.CLIENTE_NOME || 'Cliente Exemplo';
  const telefone = process.env.CLIENTE_TELEFONE || '11977777777';
  const planoId = faker.helpers.arrayElement(planosIds); // plano já criado anteriormente

  const usuarioId = await criarUsuario(email, senha, 'cliente');

  await pool.query(
    `INSERT INTO clientes (
      usuario_id, nome, cpf, rg, email, telefone, endereco,
      data_cadastro, plano_id, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      usuarioId,
      nome,
      faker.string.numeric(11),
      faker.string.numeric(9),
      email,
      telefone,
      faker.location.streetAddress(),
      faker.date.past(),
      planoId,
      'ativo'
    ]
  );
}

async function seedAll() {
  try {
    console.log('🔄 Iniciando seed...');

    await seedAdmin();
    await seedFuncionario();
    //await seedCliente();
    console.log('✅ Usuários iniciais criados com sucesso!');


    // Planos
    const planosIds = [];
    for (let i = 1; i <= 5; i++) {
      const result = await pool.query(
        `INSERT INTO planos (
          nome_plano, velocidade_download, velocidade_upload,
          preco, descricao, franquia_dados, tipo_conexao
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_plano`,
        [
          `Plano ${i}`,
          100 + i * 50,
          50 + i * 10,
          (49.9 + i * 10).toFixed(2),
          `Descrição do plano ${i}`,
          500 * i,
          i % 2 === 0 ? 'fibra' : 'rádio',
        ]
      );
      planosIds.push(result.rows[0].id_plano);
    }

    // Usuários clientes e IDs deles
    const clientesUsuarioIds = [];
    const clientesIds = [];
    for (let i = 1; i <= 10; i++) {
      const email = faker.internet.email();
      const usuarioId = await criarUsuario(email, 'cliente123', 'cliente');

      const result = await pool.query(
        `INSERT INTO clientes (
          usuario_id, nome, cpf_cnpj, rg, endereco, telefone, email,
          data_nascimento, data_cadastro, id_plano
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
        [
          usuarioId,
          faker.person.fullName(),
          faker.string.numeric(11),
          faker.string.numeric(9),
          faker.location.streetAddress(),
          faker.phone.number('1199#######'),
          email,
          faker.date.birthdate({ min: 18, max: 70, mode: 'age' }),
          new Date(),
          faker.helpers.arrayElement(planosIds),
        ]
      );
      clientesUsuarioIds.push(usuarioId);    // Guardando o ID do usuário
      clientesIds.push(result.rows[0].id);   // Guardando o ID da tabela clientes
    }

    // Usuários admins e IDs deles
    const adminsUsuarioIds = [];
    const adminsIds = [];
    for (let i = 1; i <= 2; i++) {
      const email = faker.internet.email();
      const usuarioId = await criarUsuario(email, 'admin123', 'admin');

      const result = await pool.query(
        `INSERT INTO admins (
          usuario_id, nome, cpf, rg, email, telefone, endereco,
          data_admissao, data_demissao
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [
          usuarioId,
          faker.person.fullName(),
          faker.string.numeric(11),
          faker.string.numeric(9),
          email,
          faker.phone.number('1199#######'),
          faker.location.streetAddress(),
          faker.date.past(),
          null,
        ]
      );
      adminsUsuarioIds.push(usuarioId);
      adminsIds.push(result.rows[0].id);
    }

    // Usuários funcionários e IDs deles
    const funcionariosUsuarioIds = [];
    const funcionariosIds = [];
    for (let i = 1; i <= 5; i++) {
      const email = faker.internet.email();
      const usuarioId = await criarUsuario(email, 'func123', 'funcionario');

      const result = await pool.query(
        `INSERT INTO funcionarios (
          usuario_id, nome, cargo, telefone, endereco, email,
          cpf, rg, data_nascimento, data_admissao, data_demissao
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
        [
          usuarioId,
          faker.person.fullName(),
          faker.helpers.arrayElement(['Técnico', 'Financeiro', 'Atendimento']),
          faker.phone.number('1199#######'),
          faker.location.streetAddress(),
          email,
          faker.string.numeric(11),
          faker.string.numeric(9),
          faker.date.birthdate({ min: 20, max: 50, mode: 'age' }),
          faker.date.past(3),
          null,
        ]
      );
      funcionariosUsuarioIds.push(usuarioId);
      funcionariosIds.push(result.rows[0].id);
    }

    // Contratos
    const contratosIds = [];
    for (let i = 0; i < 10; i++) {
      const dataInicio = faker.date.past(2);
      const dataFim = faker.datatype.boolean()
        ? faker.date.between({ from: dataInicio, to: new Date() })
        : null;
      const status = dataFim ? 'inativo' : 'ativo';

      const result = await pool.query(
        `INSERT INTO contratos (
          id_cliente, id_plano, data_inicio, data_fim, status,
          forma_pagamento, observacoes, valor_mensal
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id_contrato`,
        [
          faker.helpers.arrayElement(clientesIds),
          faker.helpers.arrayElement(planosIds),
          dataInicio,
          dataFim,
          status,
          faker.helpers.arrayElement(['boleto', 'cartão', 'pix']),
          faker.lorem.sentence(),
          (Math.random() * 100 + 49).toFixed(2),
        ]
      );
      contratosIds.push(result.rows[0].id_contrato);
    }

    // Equipamentos
    const equipamentosIds = [];
    for (let i = 0; i < 10; i++) {
      const result = await pool.query(
        `INSERT INTO equipamentos (
          tipo, marca, modelo, numero_serie, data_aquisicao, status, id_cliente
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_equipamento`,
        [
          faker.helpers.arrayElement(['roteador', 'modem', 'switch']),
          faker.company.name(),
          faker.vehicle.model(),
          faker.string.alphanumeric(10),
          faker.date.past(3),
          faker.helpers.arrayElement(['em uso', 'em estoque', 'com defeito']),
          faker.helpers.arrayElement(clientesIds),
        ]
      );
      equipamentosIds.push(result.rows[0].id_equipamento);
    }

    // Conexões
    for (let i = 0; i < 10; i++) {
    await pool.query(
        `INSERT INTO conexoes (
        data_conexao, id_cliente, id_equipamento, ip_publico, mac_address,
        velocidade_download, velocidade_upload, duracao_sessao, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
        faker.date.recent(),
        faker.helpers.arrayElement(clientesIds),
        faker.helpers.arrayElement(equipamentosIds), // <--- aqui deve estar
        faker.internet.ip(),
        faker.internet.mac(),
        faker.number.int({ min: 10, max: 500 }),
        faker.number.int({ min: 10, max: 300 }),
        faker.number.int({ min: 100, max: 3600 }),
        faker.helpers.arrayElement(['conectado', 'desconectado']),
        ]
    );
    }


    // Suporte
    for (let i = 0; i < 10; i++) {
      const dataAbertura = faker.date.past();
      const dataFechamento = faker.datatype.boolean()
        ? faker.date.between({ from: dataAbertura, to: new Date() })
        : null;
      const status = dataFechamento
        ? 'fechado'
        : faker.helpers.arrayElement(['aberto', 'em andamento', 'resolvido']);

      await pool.query(
        `INSERT INTO suporte (
          data_abertura, data_fechamento, id_cliente, assunto, descricao,
          status, tecnico_responsavel, observacoes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          dataAbertura,
          dataFechamento,
          faker.helpers.arrayElement(clientesIds),
          faker.lorem.words(3),
          faker.lorem.sentences(2),
          status,
          faker.person.fullName(),
          faker.lorem.sentence(),
        ]
      );
    }

    // Logins — aqui usamos os IDs de usuario corretos
    for (let i = 0; i < 20; i++) {
      await pool.query(
        `INSERT INTO logins (usuario_id, email, ip, data_hora, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          faker.helpers.arrayElement(clientesUsuarioIds.concat(funcionariosUsuarioIds, adminsUsuarioIds)),
          faker.internet.email(),
          faker.internet.ip(),
          faker.date.recent(),
          faker.helpers.arrayElement(['sucesso', 'falha']),
        ]
      );
    }

    // Pagamentos
    for (let i = 0; i < 10; i++) {
      await pool.query(
        `INSERT INTO pagamentos (id_contrato, valor, data_pagamento, metodo)
         VALUES ($1, $2, $3, $4)`,
        [
          faker.helpers.arrayElement(contratosIds),
          (Math.random() * 100 + 49).toFixed(2),
          faker.date.recent(),
          faker.helpers.arrayElement(['boleto', 'pix', 'cartão']),
        ]
      );
    }

    // Notificações — também usando ids de usuário corretos
    for (let i = 0; i < 10; i++) {
      await pool.query(
        `INSERT INTO notificacoes (id_usuario, mensagem, lida)
         VALUES ($1, $2, $3)`,
        [
          faker.helpers.arrayElement(clientesUsuarioIds.concat(funcionariosUsuarioIds, adminsUsuarioIds)),
          faker.lorem.sentence(),
          faker.datatype.boolean(),
        ]
      );
    }

    // Histórico de contratos
    for (let i = 0; i < 10; i++) {
      await pool.query(
        `INSERT INTO historico_contratos (id_contrato, data, descricao)
         VALUES ($1, $2, $3)`,
        [
          faker.helpers.arrayElement(contratosIds),
          faker.date.past(),
          faker.lorem.paragraph(),
        ]
      );
    }

    console.log('✅ Seed concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro no seed:', error);
  } finally {
    await pool.end();
  }
}

seedAll();
