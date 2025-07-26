document.addEventListener('DOMContentLoaded', () => {
  const userName = localStorage.getItem('usuario_nome') || 'Desconhecido';
  document.getElementById('user-name').textContent = `Usuário: ${userName}`;

  const logoutBtn = document.getElementById('logout-button');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario_nome');

      const isElectron = window && window.process && window.process.type;

      if (isElectron) {
        const { ipcRenderer } = require('electron');
        ipcRenderer.send('logout-request');
        ipcRenderer.once('logout-response', (event, result) => {
          if (result.success) {
            window.location.href = '/Login/login.html';
          } else {
            alert('Erro ao sair.');
          }
        });
      } else {
        fetch('/api/auth/logout', { method: 'POST' })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              window.location.href = '/Login/login.html';
            } else {
              alert('Erro ao sair.');
            }
          });
      }
    });
  }
});
