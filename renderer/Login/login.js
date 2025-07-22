document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    const errorDiv = document.getElementById('error-message');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (result.success) {
                // Detectar se está rodando dentro do Electron
                const isElectron = window && window.process && window.process.type;

                if (isElectron) {
                    // Comunicação com processo principal via IPC
                    const { ipcRenderer } = require('electron');
                    ipcRenderer.send('login-attempt', { email, password });
                } else {
                    // Acesso via navegador — redireciona para index.html
                    window.location.href = '/index.html';
                }
            } else {
                errorDiv.textContent = result.message || 'Falha no login.';
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            errorDiv.textContent = 'Erro ao conectar com o servidor.';
        }
    });
});
