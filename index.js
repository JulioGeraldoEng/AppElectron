const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true
    }
  });

  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  // No macOS, o padrão é manter o app aberto mesmo sem janelas
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  // No macOS, recria a janela se o ícone do dock for clicado e não houver janelas abertas
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
