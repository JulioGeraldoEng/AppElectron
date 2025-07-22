# App Electron

Aplicativo desktop desenvolvido com Electron, integrando servidor Express para autenticação via login.

## 🔧 Requisitos

- Node.js (versão 18 ou superior recomendada)  
- npm

## 🚀 Como executar

1. Clone o repositório:

Na linha de comando rode:

    git clone https://github.com/JulioGeraldoEng/AppElectron.git
    
    cd AppElectron

2. Instale as dependências (incluindo Express automaticamente):

Na linha de comando rode:

    npm install

3. Inicie o aplicativo:

Na linha de comando rode:

    npm start

## 📦 Gerar instalador
    
Para criar o instalador para Windows, execute:

    npm run build

## ⚙️ Observações adicionais
   
O app pode ser acessado tanto via desktop (Electron) quanto via navegador na rede local, utilizando o endereço http://<seu-ip-local>:3000.

Garanta que sua rede permita o acesso externo na porta 3000 para acessar via dispositivos móveis.