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

document.addEventListener('DOMContentLoaded', () => {
  verificarAutenticacao();

  const form = document.getElementById('form-cadastrar-admin');
  const mensagem = document.getElementById('mensagem');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      email: form.email.value.trim(),
      senha: form.senha.value.trim(),
      nome: form.nome.value.trim(),
      telefone: form.telefone.value.trim(),
    };

    if (!data.email || !data.senha || !data.nome) {
      mensagem.textContent = 'Preencha os campos obrigatórios.';
      mensagem.style.color = 'red';
      return;
    }

    try {
      const resposta = await fetchComToken('/api/admin/cadastrar-admin', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (resposta?.success) {
        mensagem.textContent = 'Administrador cadastrado com sucesso!';
        mensagem.style.color = 'green';
        form.reset();
      } else {
        mensagem.textContent = resposta.message || 'Erro ao cadastrar administrador.';
        mensagem.style.color = 'red';
      }
    } catch (err) {
      mensagem.textContent = 'Erro na comunicação com o servidor.';
      mensagem.style.color = 'red';
    }
  });

  document.getElementById('btn-voltar').addEventListener('click', () => {
    window.location.href = '../Admin/admin.html';
  });
});
