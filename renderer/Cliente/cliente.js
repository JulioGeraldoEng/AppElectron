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

// Inicialização da página
document.addEventListener('DOMContentLoaded', () => {
  verificarAutenticacao();

  const logoutBtn = document.getElementById('logout-button');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }

  // Aqui pode-se incluir chamadas para carregar dados do cliente, se houver APIs para isso
});
