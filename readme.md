# App Electron

Aplicativo desktop desenvolvido com Electron, integrando servidor Express para autenticação via login.

## 🔧 Requisitos

- Node.js (versão 18 ou superior recomendada)  
- npm

## 🗄️ Banco de Dados (PostgreSQL)

Este projeto utiliza o PostgreSQL para armazenar os dados dos usuários e realizar a autenticação.

### Requisitos

- PostgreSQL instalado (versão 12 ou superior recomendada)  
- Acesso ao terminal ou interface gráfica para executar comandos SQL  

### Configuração do banco

1. Crie o banco de dados:

- sql

    CREATE DATABASE appelectron;

2. Conecte-se ao banco appelectron e crie a tabela de usuários:

- sql 

    CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL
    );

3. Insira usuários para teste (exemplo):

- sql

    INSERT INTO usuarios (email, senha) VALUES ('julio@teste.com', '123'), ('maria@teste.com', 'senha123');

4. Configuração da conexão no projeto

No arquivo db.js, configure os parâmetros da conexão com o banco (usuário, senha, host, porta e nome do banco). Exemplo:

- js

    const pool = new Pool({
    user: 'postgres',         // seu usuário do PostgreSQL
    host: 'localhost',
    database: 'appelectron',  // nome do banco criado
    password: 'sua_senha',    // sua senha do PostgreSQL
    port: 5432,
    });


## 🚀 Como executar

1. Clone o repositório:

- Na linha de comando rode:

    git clone https://github.com/JulioGeraldoEng/AppElectron.git

    cd AppElectron

2. Instale as dependências (incluindo Express automaticamente):

- Na linha de comando rode:

    npm install

3. Inicie o aplicativo:

- Na linha de comando rode:

    npm start

## 📦 Gerar instalador
    
- Para criar o instalador para Windows, execute:

    npm run build

## ⚙️ Observações adicionais

- O app pode ser acessado tanto via desktop (Electron) quanto via navegador na rede local, utilizando o endereço `http://<seu-ip-local>:3000`.  
- Garanta que sua rede permita o acesso externo na porta 3000 para acessar via dispositivos móveis.

## O que foi realizado até o momento

Após configurar o ambiente e o banco de dados conforme descrito no README, implementamos a autenticação no aplicativo com os seguintes pontos principais:

Servidor Express integrado ao Electron para fornecer rotas REST e servir os arquivos estáticos.

Banco de dados PostgreSQL para armazenar os usuários e validar as credenciais de login.

Sessões gerenciadas com express-session para manter o estado do usuário logado durante o uso do aplicativo.

Login via IPC (Inter-Process Communication) do Electron, permitindo comunicação entre a interface (renderer) e o backend.

Proteção de rotas no servidor para garantir acesso apenas de usuários autenticados.

Logout funcional, que encerra a sessão do usuário e redireciona para a tela de login.

Criação de janelas separadas no Electron para login (tela menor e fixa) e para o app principal (janela maior e redimensionável).

Em resumo, o núcleo da autenticação está implementado, com controle de acesso básico e fluxo de login/logout funcionando tanto no app desktop quanto via navegador local.