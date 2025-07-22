const { ipcRenderer } = require('electron');

const form = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('error-message');

form.addEventListener('submit', (event) => {
    event.preventDefault(); // Impede o recarregamento da página

    const email = emailInput.value;
    const password = passwordInput.value;
    
    // Limpa mensagens de erro antigas
    errorMessage.textContent = '';

    // Envia as credenciais para o processo principal do Electron
    ipcRenderer.send('login-attempt', { email, password });
});

// Ouve a resposta do processo principal
ipcRenderer.on('login-response', (event, response) => {
    if (!response.success) {
        // Se o login falhar, mostra a mensagem de erro
        errorMessage.textContent = response.message;
    }
    // Se o login for bem-sucedido, o processo principal cuidará de fechar
    // esta janela e abrir a janela principal do app.
});