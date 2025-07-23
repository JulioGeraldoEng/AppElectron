document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    const errorDiv = document.getElementById('error-message');

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        const isElectron = window && window.process && window.process.type;

        if (isElectron) {
            const { ipcRenderer } = require('electron');

            // Escutar a resposta do login com token
            ipcRenderer.once('login-response', (event, result) => {
                if (result.success) {
                    localStorage.setItem('token', result.token);  // Armazena token JWT
                    const tipo = result.tipo;

                    if (tipo === 'admin') {
                        window.location.href = '/Admin/admin.html';
                    } else if (tipo === 'funcionario') {
                        window.location.href = '/Funcionario/funcionario.html';
                    } else if (tipo === 'cliente') {
                        window.location.href = '/Cliente/cliente.html';
                    } else {
                        errorDiv.textContent = 'Tipo de usuário desconhecido.';
                    }
                } else {
                    errorDiv.textContent = result.message || 'Falha no login.';
                }
            });

            ipcRenderer.send('login-attempt', { email, password });

        } else {
            fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    localStorage.setItem('token', result.token);  // Armazena token JWT
                    const tipo = result.tipo;

                    if (tipo === 'admin') {
                        window.location.href = '/Admin/admin.html';
                    } else if (tipo === 'funcionario') {
                        window.location.href = '/Funcionario/funcionario.html';
                    } else if (tipo === 'cliente') {
                        window.location.href = '/Cliente/cliente.html';
                    } else {
                        errorDiv.textContent = 'Tipo de usuário desconhecido.';
                    }
                } else {
                    errorDiv.textContent = result.message || 'Falha no login.';
                }
            })
            .catch((error) => {
                console.error('Erro na requisição:', error);
                errorDiv.textContent = 'Erro ao conectar com o servidor.';
            });
        }
    });
});

// Função de logout para navegador web e Electron
async function logout() {
    try {
        // Remove token local
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
