const { app, BrowserWindow, shell, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

// Configuração do Auto-Updater para atualizações binárias (.exe)
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

// Quando uma atualização estiver disponível para download
autoUpdater.on('update-available', (info) => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Atualização do Sistema',
    message: `Uma nova versão do Agenda Master (${info.version}) está disponível. O download iniciou automaticamente em segundo plano e será instalado quando você fechar o aplicativo.`,
    buttons: ['Entendido']
  });
});

// Quando o download da atualização terminar
autoUpdater.on('update-downloaded', (info) => {
  dialog.showMessageBox({
    type: 'question',
    buttons: ['Reiniciar Agora', 'Mais Tarde'],
    defaultId: 0,
    title: 'Atualização Pronta',
    message: `A versão ${info.version} do Agenda Master foi baixada com sucesso! Deseja reiniciar o aplicativo agora para aplicar as novidades?`
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

autoUpdater.on('error', (err) => {
  console.error('Erro no Auto-Updater:', err);
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "Agenda Master",
    icon: path.join(__dirname, '../public/icon.png'),
    autoHideMenuBar: true, // Hides the top menu bar for a cleaner, modern app look
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Since we want the app to be auto-updatable and run instantly,
  // we can load the production URL, or fall back to local build.
  // In a hybrid scenario, loading the deployed production URL directly is the BEST way 
  // to guarantee instant updates to clients without them needing to download a new .exe every time!
  const productionUrl = "https://ais-pre-zlp7sgyav4hiffcsjbk5mu-197666345.us-east1.run.app";
  
  if (process.env.ELECTRON_DEV_URL) {
    win.loadURL(process.env.ELECTRON_DEV_URL);
  } else {
    // We attempt to load the live production app for auto-update convenience,
    // falling back to local files if offline or requested.
    win.loadURL(productionUrl).catch(() => {
      win.loadFile(path.join(__dirname, '../dist/index.html'));
    });
  }

  // Open external links (like whatsapp, help desks, or tutorials) in the default web browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();

  // Verifica atualizações do wrapper binário (.exe) ao iniciar
  if (!process.env.ELECTRON_DEV_URL) {
    autoUpdater.checkForUpdatesAndNotify().catch((err) => {
      console.warn('Erro ao inicializar checagem de atualizações binárias:', err);
    });
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
