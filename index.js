const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const express = require('express');
const session = require('express-session');
const authRoutes = require('./Routes/authRoutes'); // Supondo que você criou essa pasta/arquivo
const db = require('./db'); // Conexão com PostgreSQL

let loginWindow;
let mainWindow;

// ----------- SERVIDOR EXPRESS -----------
const servidor = express();
const PORT = 3000;

// Middleware para JSON
servidor.use(express.json());

// Session middleware
servidor.use(session({
  secret: 'sua_chave_secreta_segura',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // false pois não é HTTPS no Electron
}));

// Usar rotas modulares para autenticação
servidor.use('/api/auth', authRoutes);

// Rota principal redireciona para login
servidor.get('/', (req, res) => {
  res.redirect('/Login/login.html');
});

// Servir arquivos estáticos (HTML, CSS, JS, etc)
servidor.use(express.static(path.join(__dirname, 'renderer')));

// Middleware para proteger rotas
function protegerRota(req, res, next) {
  if (req.session.usuarioAutenticado) {
    next();
  } else {
    res.redirect('/Login/login.html');
  }
}


// Rota protegida (exemplo)
servidor.get('/index.html', protegerRota, (req, res) => {
  res.sendFile(path.join(__dirname, 'renderer', 'index.html'));
});

// Inicia o servidor Express
servidor.listen(PORT, () => {
  console.log(`Servidor Express rodando em http://localhost:${PORT}`);
});

// ----------- CONFIGURAÇÕES JANELAS ELECTRON -----------
// Mesma partição para compartilhar sessão entre janelas
const webPreferencesConfig = {
  contextIsolation: false,
  nodeIntegration: true,
  partition: 'persist:pitstop'
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
    // Ao fechar a janela principal, volta para login
    if (!loginWindow) {
      createLoginWindow();
    }
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

// ----------- COMUNICAÇÃO IPC -----------
// Login via IPC
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

// Logout via IPC
ipcMain.on('logout-request', (event) => {
  // Fecha janela principal
  if (mainWindow) {
    mainWindow.close();
    mainWindow = null;
  }

  // Abre janela de login se ainda não aberta
  if (!loginWindow) {
    createLoginWindow();
  }

  event.reply('logout-response', { success: true });
});

servidor.post('/api/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Erro ao fazer logout:', err);
      return res.status(500).json({ success: false, message: 'Erro ao sair.' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});
