const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const express = require('express');
const jwt = require('jsonwebtoken');

const authRoutes = require('./Routes/authRoutes');
const adminRoutes = require('./Routes/adminRoutes');
const funcionarioRoutes = require('./Routes/funcionarioRoutes');
const clienteRoutes = require('./Routes/clienteRoutes');
const { autenticar, autorizar } = require('./Middlewares/authMiddleware');
const db = require('./db');
const bcrypt = require('bcrypt');

require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

let loginWindow;
let mainWindow;

const servidor = express();
const PORT = 3000;

servidor.use(express.json());

// Rotas públicas e protegidas
servidor.use('/api/auth', authRoutes);
servidor.use('/api/admin', autenticar, autorizar('admin'), adminRoutes);
servidor.use('/api/funcionario', autenticar, autorizar('funcionario'), funcionarioRoutes);
servidor.use('/api/cliente', autenticar, autorizar('cliente'), clienteRoutes);

// Redirecionamento da raiz para tela de login web
servidor.get('/', (req, res) => {
  res.redirect('/Login/login.html');
});

// Servir arquivos estáticos da pasta renderer
servidor.use(express.static(path.join(__dirname, 'renderer')));
servidor.use('/CadFuncionario', express.static(path.join(__dirname, 'renderer', 'CadFuncionario')));
servidor.use('/CadCliente', express.static(path.join(__dirname, 'renderer', 'CadCliente')));
servidor.use('/CadAdmin', express.static(path.join(__dirname, 'renderer', 'CadAdmin')));

// Inicia o servidor Express
servidor.listen(PORT, () => {
  console.log(`Servidor Express rodando em http://localhost:${PORT}`);
});

// --- Configurações Electron ---
const webPreferencesConfig = {
  contextIsolation: false,
  nodeIntegration: true,
  partition: 'persist:pitstop'
};

// Janela de login Electron (carrega login web via localhost)
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

// Janela principal Electron, carrega página via URL do servidor Express para manter contexto
const createMainWindow = (page) => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    resizable: true,
    webPreferences: webPreferencesConfig
  });

  // Remove o prefixo 'renderer/' para formar a URL relativa correta
  const relativePath = page.replace(/^renderer\//, '');

  // Carrega via URL do servidor Express para manter o contexto compartilhado (localStorage, cookies)
  mainWindow.loadURL(`http://localhost:${PORT}/${relativePath}`);

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (!loginWindow) createLoginWindow();
  });
};

// Inicializa o app Electron
app.whenReady().then(createLoginWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createLoginWindow();
});

// --- IPC para login via Electron com JWT ---
ipcMain.on('login-attempt', async (event, credentials) => {
  const { email, password } = credentials;
  try {
    const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.senha))) {
      return event.reply('login-response', { success: false, message: 'Email ou senha inválidos.' });
    }

    // Gera token JWT válido por 2 horas
    const token = jwt.sign(
      { id: user.id, email: user.email, tipo: user.tipo },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    event.reply('login-response', { success: true, tipo: user.tipo, token });

    // Abre a janela principal conforme tipo de usuário
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

// IPC para logout no Electron: fecha janela principal e abre login
ipcMain.on('logout-request', (event) => {
  if (mainWindow) {
    mainWindow.close();
    mainWindow = null;
  }
  if (!loginWindow) createLoginWindow();
  event.reply('logout-response', { success: true });
});
