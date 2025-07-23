// Função para obter o token JWT do localStorage
function getToken() {
  return localStorage.getItem('token');
}

// Redireciona para a página de login se não houver token
function verificarAutenticacao() {
  const token = getToken();
  if (!token) {
    window.location.href = '/Login/login.html';
  }
}

// Requisição autenticada com token no cabeçalho Authorization
async function fetchComToken(url, options = {}) {
  const token = getToken();
  if (!token) {
    window.location.href = '/Login/login.html';
    return;
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401 || response.status === 403) {
    // Token expirado ou inválido
    localStorage.removeItem('token');
    window.location.href = '/Login/login.html';
    return;
  }

  return response.json();
}

// Função de logout
async function logout() {
  try {
    localStorage.removeItem('token');

    const isElectron = window && window.process && window.process.type;

    if (isElectron) {
      const { ipcRenderer } = require('electron');
      ipcRenderer.send('logout-request');
      ipcRenderer.once('logout-response', (event, result) => {
        if (result.success) {
          window.location.href = '/Login/login.html';
        } else {
          alert('Falha ao sair. Tente novamente.');
        }
      });
    } else {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      const result = await response.json();
      if (result.success) {
        window.location.href = '/Login/login.html';
      } else {
        alert('Falha ao sair. Tente novamente.');
      }
    }
  } catch (error) {
    console.error('Erro no logout:', error);
  }
}

// Função para carregar dados do cliente na interface
async function carregarDadosCliente() {
  try {
    const dados = await fetchComToken('/api/cliente/meus-dados');

    if (dados && dados.success && dados.usuario) {
      const usuario = dados.usuario;
      const container = document.createElement('div');
      container.innerHTML = `
        <p><strong>ID:</strong> ${usuario.id}</p>
        <p><strong>Email:</strong> ${usuario.email}</p>
        <p><strong>Tipo:</strong> ${usuario.tipo}</p>
        <p><strong>Nome:</strong> ${usuario.nome || 'N/A'}</p>
        <p><strong>CPF:</strong> ${usuario.cpf || 'N/A'}</p>
        <p><strong>Endereço:</strong> ${usuario.endereco || 'N/A'}</p>
      `;
      document.body.appendChild(container);
    } else {
      console.error('Dados do cliente não disponíveis ou inválidos.');
    }
  } catch (error) {
    console.error('Erro ao carregar dados do cliente:', error);
  }
}

// Inicialização da página
document.addEventListener('DOMContentLoaded', () => {
  verificarAutenticacao();

  const logoutBtn = document.getElementById('logout-button');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }

  carregarDadosCliente(); // 🔥 Chamada aqui!
});
