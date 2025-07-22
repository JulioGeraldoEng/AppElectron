const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let loginWindow;
let mainWindow;

// Função para criar a janela de login
const createLoginWindow = () => {
    loginWindow = new BrowserWindow({
        width: 500,
        height: 700,
        resizable: false,
        webPreferences: {
            // Importante para a segurança e para que o require() funcione no login.js
            contextIsolation: false,
            nodeIntegration: true,
        }
    });

    loginWindow.loadFile('renderer/Login/login.html');

    // Quando a janela de login for fechada, encerra o app
    loginWindow.on('closed', () => {
        loginWindow = null;
    });
};

// Função para criar a janela principal (após o login)
const createMainWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    // Supondo que você tenha um 'index.html' para seu app principal
    // A linha abaixo é a que você deve usar
    mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
};

app.whenReady().then(createLoginWindow);


// ---- LÓGICA DE LOGIN ----
ipcMain.on('login-attempt', (event, credentials) => {
    console.log('Tentativa de login recebida com:', credentials);

    // !! LÓGICA DE VALIDAÇÃO FALSA !!
    // Em um aplicativo real, você validaria isso em um banco de dados
    // ou através de uma API.
    if (credentials.email === 'julio@teste.com' && credentials.password === '123') {
        
        // Avisa o front-end que o login foi um sucesso
        event.reply('login-response', { success: true });
        
        // Cria a janela principal e fecha a de login
        createMainWindow();
        if (loginWindow) {
            loginWindow.close();
        }

    } else {
        // Avisa o front-end que o login falhou
        event.reply('login-response', { 
            success: false, 
            message: 'Email ou senha inválidos.' 
        });
    }
});


// Configurações padrão do ciclo de vida do app
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createLoginWindow();
    }
});