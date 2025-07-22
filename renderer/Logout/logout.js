document.getElementById('logout-button').addEventListener('click', async () => {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include' // importante para enviar cookies da sessão
        });

        const result = await response.json();

        if (result.success) {
            // Redireciona para a tela de login após logout
            window.location.href = '/Login/login.html';
        } else {
            alert('Falha ao fazer logout.');
        }
    } catch (error) {
        console.error('Erro no logout:', error);
    }
});
