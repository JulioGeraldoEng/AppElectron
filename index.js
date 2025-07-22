const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const express = require('express');

let loginWindow;
let mainWindow;

// ----------- SERVIDOR EXPRESS -----------
const servidor = express();
const PORT = 3000;

// Permite ler requisições JSON (ex: fetch com body)
servidor.use(express.json());

// Rota da página de login (deve vir antes do static)
servidor.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'renderer', 'Login', 'login.html'));
});

// Servir arquivos estáticos (HTML, CSS, JS)
servidor.use(express.static(path.join(__dirname, 'renderer')));

// API de login
servidor.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (email === 'julio@teste.com' && password === '123') {
        return res.json({ success: true });
    } else {
        return res.json({ success: false, message: 'Email ou senha inválidos.' });
    }
});

// Inicia o servidor Express
servidor.listen(PORT, () => {
    console.log(`Servidor Express rodando em http://localhost:${PORT}`);
});

// ----------- FUNÇÕES DE JANELAS -----------
const createLoginWindow = () => {
    loginWindow = new BrowserWindow({
        width: 500,
        height: 700,
        resizable: false,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
        }
    });

    loginWindow.loadURL(`http://localhost:${PORT}/`);
    loginWindow.on('closed', () => {
        loginWindow = null;
    });
};

const createMainWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
        }
    });

    mainWindow.loadURL(`http://localhost:${PORT}/index.html`);
    mainWindow.on('closed', () => {
        mainWindow = null;
        createLoginWindow(); // Volta para login ao fechar janela principal
    });
};

// ----------- CICLO DE VIDA DO APP -----------
app.whenReady().then(createLoginWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createLoginWindow();
    }
});

// ----------- LÓGICA DE LOGIN PELO ELECTRON (IPC) -----------
ipcMain.on('login-attempt', (event, credentials) => {
    if (credentials.email === 'julio@teste.com' && credentials.password === '123') {
        event.reply('login-response', { success: true });
        createMainWindow();
        if (loginWindow) loginWindow.close();
    } else {
        event.reply('login-response', {
            success: false,
            message: 'Email ou senha inválidos.'
        });
    }
});
