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
                    window.location.href = '/index.html';
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

// Função de logout para navegador web
async function logout() {
    try {
        const response = await fetch('/api/auth/logout', { method: 'POST' });
        const result = await response.json();
        if (result.success) {
            window.location.href = '/Login/login.html';
        } else {
            alert('Falha ao sair. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro no logout:', error);
    }
}
