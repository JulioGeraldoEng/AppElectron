function getToken() {
  return localStorage.getItem('token');
}

async function fetchComToken(url, options = {}) {
  const token = getToken();
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('token');
    window.location.href = '/Login/login.html';
    return;
  }
  return res.json();
}

async function carregarClientesEEquipamentos() {
  const [clientesResp, equipamentosResp] = await Promise.all([
    fetchComToken('/api/admin/clientes'),
    fetchComToken('/api/admin/equipamentos')
  ]);

  const clienteSelect = document.getElementById('id_cliente');
  const equipamentoSelect = document.getElementById('id_equipamento');

  clientesResp.clientes?.forEach(cliente => {
    const opt = document.createElement('option');
    opt.value = cliente.id_cliente;
    opt.textContent = cliente.nome;
    clienteSelect.appendChild(opt);
  });

  equipamentosResp.equipamentos?.forEach(equip => {
    const opt = document.createElement('option');
    opt.value = equip.id_equipamento;
    opt.textContent = `${equip.tipo} - ${equip.modelo}`;
    equipamentoSelect.appendChild(opt);
  });
}

document.addEventListener('DOMContentLoaded', carregarClientesEEquipamentos);

document.getElementById('form-cadastrar-conexao').addEventListener('submit', async e => {
  e.preventDefault();

  const data = {
    id_cliente: document.getElementById('id_cliente').value,
    id_equipamento: document.getElementById('id_equipamento').value,
    data_conexao: document.getElementById('data_conexao').value,
    ip_publico: document.getElementById('ip_publico').value,
    mac_address: document.getElementById('mac_address').value,
    velocidade_download: parseFloat(document.getElementById('velocidade_download').value),
    velocidade_upload: parseFloat(document.getElementById('velocidade_upload').value),
    duracao_sessao: parseInt(document.getElementById('duracao_sessao').value),
    status: document.getElementById('status').value
  };

  const res = await fetchComToken('/api/admin/cadastrar-conexao', {
    method: 'POST',
    body: JSON.stringify(data)
  });

  const mensagem = document.getElementById('mensagem');
  if (res?.success) {
    mensagem.style.color = 'green';
    mensagem.textContent = res.message;
    document.getElementById('form-cadastrar-conexao').reset();
  } else {
    mensagem.style.color = 'red';
    mensagem.textContent = res?.message || 'Erro ao cadastrar conexão.';
  }
});

document.getElementById('btn-voltar').addEventListener('click', () => {
  window.location.href = '/Admin/admin.html';
});
