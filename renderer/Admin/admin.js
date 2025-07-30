function getToken() {
  return localStorage.getItem('token');
}

function verificarAutenticacao() {
  const token = getToken();
  if (!token) {
    window.location.href = '/Login/login.html';
  }
}

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
    localStorage.removeItem('token');
    window.location.href = '/Login/login.html';
    return;
  }

  return response.json();
}

async function carregarUsuarios() {
  const dados = await fetchComToken('/api/admin/usuarios');
  if (!dados || !dados.usuarios) return;

  const tbody = document.querySelector('#usuarios-table tbody');
  tbody.innerHTML = '';

  dados.usuarios.forEach(usuario => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${usuario.id}</td>
      <td>${usuario.email}</td>
      <td>${usuario.tipo}</td>
    `;
    tbody.appendChild(tr);
  });
}

async function logout() {
  localStorage.removeItem('token');
  window.location.href = '/Login/login.html';
}

document.addEventListener('DOMContentLoaded', () => {
  verificarAutenticacao();
  carregarUsuarios();

  document.getElementById('logout-button')?.addEventListener('click', logout);

  document.getElementById('btn-cadastrar-funcionario').addEventListener('click', () => {
    window.location.href = '/CadFuncionario/cadastrarFuncionario.html';
  });

  document.getElementById('btn-cadastrar-cliente').addEventListener('click', () => {
    window.location.href = '/CadCliente/cadastrarCliente.html';
  });

  document.getElementById('btn-cadastrar-admin').addEventListener('click', () => {
    window.location.href = '/CadAdmin/cadastrarAdmin.html';
  });

  document.getElementById('btn-cadastrar-plano').addEventListener('click', () => {
    window.location.href = '/CadPlano/cadastrarPlano.html';
  });

  document.getElementById('btn-cadastrar-contrato').addEventListener('click', () => {
    window.location.href = '/CadContrato/cadastrarContrato.html';
  });

  document.getElementById('btn-cadastrar-equipamento').addEventListener('click', () => {
    window.location.href = '/CadEquipamento/cadastrarEquipamento.html';
  });

  document.getElementById('btn-cadastrar-conexao').addEventListener('click', () => {
    window.location.href = '/CadConexao/cadastrarConexao.html';
  });

});
