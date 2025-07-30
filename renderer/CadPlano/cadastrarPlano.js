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

document.getElementById('form-cadastrar-plano').addEventListener('submit', async function (e) {
  e.preventDefault();

  const nome_plano = document.getElementById('nome_plano').value.trim();
  const velocidade_download = parseFloat(document.getElementById('velocidade_download').value);
  const velocidade_upload = parseFloat(document.getElementById('velocidade_upload').value);
  const preco = parseFloat(document.getElementById('preco').value);
  const descricao = document.getElementById('descricao').value.trim();
  const franquia_dados = document.getElementById('franquia_dados').value;
  const tipo_conexao = document.getElementById('tipo_conexao').value;

  if (!nome_plano || !velocidade_download || !velocidade_upload || !preco || !tipo_conexao) {
    document.getElementById('mensagem').innerText = 'Preencha todos os campos obrigatórios.';
    return;
  }

  try {
    const resultado = await fetchComToken('/api/admin/cadastrar-plano', {
      method: 'POST',
      body: JSON.stringify({
        nome_plano,
        velocidade_download,
        velocidade_upload,
        preco,
        descricao,
        franquia_dados: franquia_dados ? parseInt(franquia_dados) : null,
        tipo_conexao
      })
    });

    const mensagemDiv = document.getElementById('mensagem');

    if (resultado.success) {
      mensagemDiv.style.color = 'green';
      mensagemDiv.innerText = resultado.message;
      document.getElementById('form-cadastrar-plano').reset();
    } else {
      mensagemDiv.style.color = 'red';
      mensagemDiv.innerText = resultado.message || 'Erro ao cadastrar plano.';
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
    document.getElementById('mensagem').innerText = 'Erro ao conectar com o servidor.';
  }
});


// Botão voltar
document.getElementById('btn-voltar').addEventListener('click', () => {
    window.location.href = '/Admin/admin.html';
});
