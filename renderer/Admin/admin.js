// Função para obter token JWT do localStorage
function getToken() {
  return localStorage.getItem('token');
}

// Redireciona para login se não houver token
function verificarAutenticacao() {
  const token = getToken();
  if (!token) {
    window.location.href = '/Login/login.html';
  }
}

// Função para fazer fetch com token JWT no header Authorization
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
    // Token inválido ou expirado
    localStorage.removeItem('token');
    window.location.href = '/Login/login.html';
    return;
  }

  return response.json();
}

// Função para carregar e exibir usuários na tabela
async function carregarUsuarios() {
  const dados = await fetchComToken('/api/admin/usuarios');
  if (!dados) return;

  const tbody = document.querySelector('#usuarios-table tbody');
  tbody.innerHTML = ''; // Limpa tabela antes de preencher

  dados.forEach(usuario => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${usuario.id}</td>
      <td>${usuario.email}</td>
      <td>${usuario.tipo}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Função de logout, removendo token e redirecionando para login
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
      // Rota logout no servidor apenas para padrão REST (não obrigatória com JWT)
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

// Inicializa eventos da página
document.addEventListener('DOMContentLoaded', () => {
  verificarAutenticacao();

  const logoutBtn = document.getElementById('logout-button');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }

  carregarUsuarios();
});
