function getToken() {
  return localStorage.getItem('token');
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

async function carregarClientes() {
  const res = await fetchComToken('/api/admin/clientes');
  const select = document.getElementById('id_cliente');
  res?.clientes?.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id_cliente;
    opt.textContent = c.nome;
    select.appendChild(opt);
  });
}

document.addEventListener('DOMContentLoaded', carregarClientes);

document.getElementById('form-equipamento').addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    tipo: document.getElementById('tipo').value,
    marca: document.getElementById('marca').value,
    modelo: document.getElementById('modelo').value,
    numero_serie: document.getElementById('numero_serie').value,
    data_aquisicao: document.getElementById('data_aquisicao').value,
    status: document.getElementById('status').value,
    id_cliente: document.getElementById('id_cliente').value
  };

  const msgDiv = document.getElementById('mensagem');
  const response = await fetchComToken('/api/admin/cadastrar-equipamento', {
    method: 'POST',
    body: JSON.stringify(data)
  });

  if (response?.success) {
    msgDiv.style.color = 'green';
    msgDiv.textContent = response.message;
    document.getElementById('form-equipamento').reset();
  } else {
    msgDiv.style.color = 'red';
    msgDiv.textContent = response?.message || 'Erro ao cadastrar.';
  }
});

document.getElementById('btn-voltar').addEventListener('click', () => {
  window.location.href = '/Admin/admin.html';
});
