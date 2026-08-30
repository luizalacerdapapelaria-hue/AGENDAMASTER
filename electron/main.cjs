const { app, BrowserWindow, shell, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

// Configuração do IPC para salvar PDF nativamente no Electron
ipcMain.handle('print-to-pdf', async (event, options) => {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  
  try {
    const pdfOptions = {
      printBackground: true,
      preferCSSPageSize: options.preferCSSPageSize !== false, // Habilitar por padrão para usar as dimensões exatas do CSS @page
      marginsType: 1, // 1 = no margins (sem margens)
      landscape: options.landscape || false,
      scale: options.scale || 1.0
    };

    if (options.pageSize) {
      pdfOptions.pageSize = options.pageSize;
    } else if (options.widthMicrons && options.heightMicrons) {
      pdfOptions.pageSize = {
        width: options.widthMicrons,
        height: options.heightMicrons
      };
    } else {
      pdfOptions.pageSize = 'A4';
    }

    // Tentar gerar o PDF com as configurações ideais (tamanho customizado e sem margens)
    let data;
    try {
      data = await webContents.printToPDF(pdfOptions);
    } catch (printErr) {
      console.warn('[Electron PDF] Falha na primeira tentativa com tamanho customizado, tentando fallback simplificado:', printErr);
      
      // Tentativa de Fallback: Usar o padrão A5/A4 e margens em branco com marginsType
      const fallbackOptions = {
        printBackground: true,
        marginsType: 1,
        landscape: options.landscape || false,
        pageSize: options.pageSize || 'A4'
      };
      
      try {
        data = await webContents.printToPDF(fallbackOptions);
      } catch (secondErr) {
        console.error('[Electron PDF] Falha em ambas as tentativas de PDF nativo:', secondErr);
        throw new Error(`Erro de renderização do Chromium: ${secondErr.message || secondErr}`);
      }
    }

    // Show native Windows Save File dialog
    const { filePath } = await dialog.showSaveDialog(win, {
      title: 'Salvar PDF Vetorial',
      defaultPath: options.defaultName || 'Agenda_Master.pdf',
      filters: [{ name: 'Arquivos PDF', extensions: ['pdf'] }]
    });

    if (filePath) {
      await fs.promises.writeFile(filePath, data);
      shell.openPath(filePath); // Abrir o PDF automaticamente após salvar
      return { success: true, filePath };
    }
    return { success: false, cancelled: true };
  } catch (err) {
    console.error('Erro na geração do PDF nativo:', err);
    return { success: false, error: err.message || String(err) };
  }
});

// IPC para salvar PDF de imagem (jsPDF) em Base64 e abrir automaticamente
ipcMain.handle('save-pdf-base64', async (event, { base64String, defaultName }) => {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  
  try {
    const buffer = Buffer.from(base64String, 'base64');
    
    const { filePath } = await dialog.showSaveDialog(win, {
      title: 'Salvar PDF',
      defaultPath: defaultName || 'Agenda_Master.pdf',
      filters: [{ name: 'Arquivos PDF', extensions: ['pdf'] }]
    });

    if (filePath) {
      await fs.promises.writeFile(filePath, buffer);
      shell.openPath(filePath); // Abrir o PDF automaticamente após salvar
      return { success: true, filePath };
    }
    return { success: false, cancelled: true };
  } catch (err) {
    console.error('Erro ao salvar o PDF via base64:', err);
    return { success: false, error: err.message || String(err) };
  }
});

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
  // Exibir o erro na tela para ajudar a identificar o que está bloqueando a atualização
  dialog.showMessageBox({
    type: 'error',
    title: 'Erro na Atualização Automática',
    message: `Ocorreu um erro ao tentar baixar/aplicar a atualização:\n\n${err && err.message ? err.message : String(err)}`,
    buttons: ['OK']
  });
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
      preload: path.join(__dirname, 'preload.cjs')
    }
  });


  if (process.env.ELECTRON_DEV_URL) {
    win.loadURL(process.env.ELECTRON_DEV_URL);
  } else {
    // Load the local production build for 100% reliability, offline support, and speed.
    win.loadFile(path.join(__dirname, '../dist/index.html'));
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
