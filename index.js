const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const express = require('express');
const session = require('express-session');
const db = require('./db'); // Arquivo de conexão com o PostgreSQL

let loginWindow;
let mainWindow;

// ----------- SERVIDOR EXPRESS -----------
const servidor = express();
const PORT = 3000;

// Middleware para receber JSON
servidor.use(express.json());

// Session middleware
servidor.use(session({
    secret: 'sua_chave_secreta_segura',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Deixe false pois não usa HTTPS no Electron
}));

// Rota principal redireciona para login
servidor.get('/', (req, res) => {
    res.redirect('/Login/login.html');
});

// Servir arquivos estáticos (HTML, CSS, JS)
servidor.use(express.static(path.join(__dirname, 'renderer')));

// Middleware para proteger rotas
function protegerRota(req, res, next) {
    if (req.session.usuarioAutenticado) {
        next();
    } else {
        res.redirect('/Login/login.html');
    }
}

// Rota protegida
servidor.get('/index.html', protegerRota, (req, res) => {
    res.sendFile(path.join(__dirname, 'renderer', 'index.html'));
});

// API de login
servidor.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await db.query(
            'SELECT * FROM usuarios WHERE email = $1 AND senha = $2',
            [email, password]
        );

        if (result.rows.length > 0) {
            req.session.usuarioAutenticado = true;
            res.json({ success: true });
        } else {
            res.json({ success: false, message: 'Email ou senha inválidos.' });
        }
    } catch (err) {
        console.error('Erro ao consultar o banco:', err);
        res.status(500).json({ success: false, message: 'Erro interno.' });
    }
});

// Iniciar o servidor
servidor.listen(PORT, () => {
    console.log(`Servidor Express rodando em http://localhost:${PORT}`);
});

// ----------- JANELAS DO ELECTRON -----------

// Para sessão funcionar, cada BrowserWindow deve usar o mesmo partition,
// além de habilitar nodeIntegration para uso do ipcRenderer.
const webPreferencesConfig = {
    contextIsolation: false,
    nodeIntegration: true,
    partition: 'persist:pitstop' // mantém sessão entre janelas
};

const createLoginWindow = () => {
    loginWindow = new BrowserWindow({
        width: 500,
        height: 700,
        resizable: false,
        webPreferences: webPreferencesConfig
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
        resizable: true,
        webPreferences: webPreferencesConfig
    });

    mainWindow.loadURL(`http://localhost:${PORT}/index.html`);
    mainWindow.on('closed', () => {
        mainWindow = null;
        createLoginWindow(); // volta para o login ao fechar app principal
    });
};

// ----------- CICLO DO APP -----------
app.whenReady().then(createLoginWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createLoginWindow();
    }
});

// ----------- LÓGICA DE LOGIN PELO IPC -----------
ipcMain.on('login-attempt', async (event, credentials) => {
    const { email, password } = credentials;

    try {
        const result = await db.query(
            'SELECT * FROM usuarios WHERE email = $1 AND senha = $2',
            [email, password]
        );

        if (result.rows.length > 0) {
            event.reply('login-response', { success: true });
            createMainWindow();
            if (loginWindow) loginWindow.close();
        } else {
            event.reply('login-response', {
                success: false,
                message: 'Email ou senha inválidos.'
            });
        }
    } catch (err) {
        console.error('Erro ao consultar o banco:', err);
        event.reply('login-response', {
            success: false,
            message: 'Erro interno ao verificar login.'
        });
    }
});

// Rota de logout
servidor.post('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Erro ao destruir sessão:', err);
            return res.status(500).json({ success: false, message: 'Erro ao fazer logout.' });
        }
        res.clearCookie('connect.sid'); // limpa cookie da sessão
        res.json({ success: true });
    });
});
