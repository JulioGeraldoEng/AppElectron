const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const express = require('express');
const session = require('express-session');
const authRoutes = require('./Routes/authRoutes');
const adminRoutes = require('./Routes/adminRoutes');
const funcionarioRoutes = require('./Routes/funcionarioRoutes');
const clienteRoutes = require('./Routes/clienteRoutes');
const { autenticar, autorizar } = require('./Middlewares/authMiddleware');
const db = require('./db');
const bcrypt = require('bcrypt');

let loginWindow;
let mainWindow;

const servidor = express();
const PORT = 3000;

servidor.use(express.json());

servidor.use(session({
  secret: 'sua_chave_secreta_segura',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Rotas principais
servidor.use('/api/auth', authRoutes);
servidor.use('/api/admin', autenticar, autorizar('admin'), adminRoutes);
servidor.use('/api/funcionario', autenticar, autorizar('funcionario'), funcionarioRoutes);
servidor.use('/api/cliente', autenticar, autorizar('cliente'), clienteRoutes);

// Redirecionamento raiz
servidor.get('/', (req, res) => {
  res.redirect('/Login/login.html');
});

servidor.use(express.static(path.join(__dirname, 'renderer')));

// Protege o acesso direto ao index.html
servidor.get('/index.html', (req, res, next) => {
  if (req.session.usuario) {
    next();
  } else {
    res.redirect('/Login/login.html');
  }
}, (req, res) => {
  res.sendFile(path.join(__dirname, 'renderer', 'index.html'));
});

servidor.listen(PORT, () => {
  console.log(`Servidor Express rodando em http://localhost:${PORT}`);
});

// --- Configurações Electron ---
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
  loginWindow.on('closed', () => { loginWindow = null; });
};

const createMainWindow = (page) => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    resizable: true,
    webPreferences: webPreferencesConfig
  });
  mainWindow.loadFile(page);
  mainWindow.on('closed', () => {
    mainWindow = null;
    if (!loginWindow) createLoginWindow();
  });
};

app.whenReady().then(createLoginWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createLoginWindow();
});

ipcMain.on('login-attempt', async (event, credentials) => {
  const { email, password } = credentials;
  try {
    const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.senha))) {
      return event.reply('login-response', { success: false, message: 'Email ou senha inválidos.' });
    }
    event.reply('login-response', { success: true, tipo: user.tipo });

    let page = 'renderer/index.html';
    if (user.tipo === 'admin') page = 'renderer/Admin/admin.html';
    else if (user.tipo === 'funcionario') page = 'renderer/Funcionario/funcionario.html';
    else if (user.tipo === 'cliente') page = 'renderer/Cliente/cliente.html';

    createMainWindow(page);
    if (loginWindow) loginWindow.close();
  } catch (err) {
    console.error('Erro ao consultar o banco:', err);
    event.reply('login-response', { success: false, message: 'Erro interno ao verificar login.' });
  }
});

ipcMain.on('logout-request', (event) => {
  if (mainWindow) {
    mainWindow.close();
    mainWindow = null;
  }
  if (!loginWindow) createLoginWindow();
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
