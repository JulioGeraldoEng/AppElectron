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

async function carregarClientesEPlanos() {
  console.log('🔄 Função carregarClientesEPlanos chamada');
  const [clientesResp, planosResp] = await Promise.all([
    fetchComToken('/api/admin/clientes'),
    fetchComToken('/api/admin/planos')
  ]);

  console.log('📦 Resposta clientes:', clientesResp);
  console.log('📦 Resposta planos:', planosResp);

  const clientes = clientesResp?.clientes;
  const planos = planosResp?.planos;

  const clienteSelect = document.getElementById('id_cliente');
  const planoSelect = document.getElementById('id_plano');

  clientes?.forEach(cliente => {
    const opt = document.createElement('option');
    opt.value = cliente.id_cliente;
    opt.textContent = cliente.nome;
    clienteSelect.appendChild(opt);
  });

  planos?.forEach(plano => {
    const opt = document.createElement('option');
    opt.value = plano.id_plano;
    opt.textContent = plano.nome_plano;
    planoSelect.appendChild(opt);
  });
}

// ✅ Chama ao carregar a página
document.addEventListener('DOMContentLoaded', carregarClientesEPlanos);

document.getElementById('form-cadastrar-contrato').addEventListener('submit', async function (e) {
  e.preventDefault();

  const data = {
    id_cliente: document.getElementById('id_cliente').value,
    id_plano: document.getElementById('id_plano').value,
    data_inicio: document.getElementById('data_inicio').value,
    data_fim: document.getElementById('data_fim').value || null,
    status: document.getElementById('status').value,
    forma_pagamento: document.getElementById('forma_pagamento').value,
    observacoes: document.getElementById('observacoes').value.trim(),
    valor_mensal: parseFloat(document.getElementById('valor_mensal').value)
  };

  const mensagemDiv = document.getElementById('mensagem');

  if (!data.id_cliente || !data.id_plano || !data.data_inicio || !data.status || !data.forma_pagamento || isNaN(data.valor_mensal)) {
    mensagemDiv.style.color = 'red';
    mensagemDiv.textContent = 'Preencha todos os campos obrigatórios corretamente.';
    return;
  }

  try {
    const response = await fetchComToken('/api/admin/cadastrar-contrato', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    if (response?.success) {
      mensagemDiv.style.color = 'green';
      mensagemDiv.textContent = response.message;
      document.getElementById('form-cadastrar-contrato').reset();
    } else {
      mensagemDiv.style.color = 'red';
      mensagemDiv.textContent = response?.message || 'Erro ao cadastrar contrato.';
    }
  } catch (error) {
    console.error(error);
    mensagemDiv.style.color = 'red';
    mensagemDiv.textContent = 'Erro de comunicação com o servidor.';
  }
});

document.getElementById('btn-voltar').addEventListener('click', () => {
  window.location.href = '/Admin/admin.html';
});