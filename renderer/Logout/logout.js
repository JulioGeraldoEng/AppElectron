document.getElementById('logout-button').addEventListener('click', async () => {
    // Detecta se está no Electron
    const isElectron = window && window.process && window.process.type;

    // Remove token local em ambos os casos
    localStorage.removeItem('token');

    if (isElectron) {
        const { ipcRenderer } = require('electron');
        ipcRenderer.send('logout-request');

        ipcRenderer.once('logout-response', (event, result) => {
            if (result.success) {
                window.location.href = '/Login/login.html';
            } else {
                alert('Falha ao fazer logout.');
            }
        });
    } else {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST'
                // Não é necessário 'credentials: include' pois não usamos sessão
            });

            const result = await response.json();

            if (result.success) {
                window.location.href = '/Login/login.html';
            } else {
                alert('Falha ao fazer logout.');
            }
        } catch (error) {
            console.error('Erro no logout:', error);
        }
    }
});
