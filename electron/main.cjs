const { app, BrowserWindow, shell, dialog, ipcMain, session } = require('electron');
const path = require('path');
const fs = require('fs');

// Carregamento seguro e tolerante a falhas do electron-updater (previne crash de startup se não estiver empacotado)
let autoUpdater = null;
try {
  const updaterModule = require('electron-updater');
  autoUpdater = updaterModule.autoUpdater;
} catch (updaterErr) {
  console.warn('[Electron] electron-updater não encontrado ou falhou ao inicializar:', updaterErr.message);
}


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

// IPC para buscar lista de fontes instaladas no sistema operacional (Windows, macOS, Linux)
ipcMain.handle('get-system-fonts', async () => {
  const fontDirs = [];
  if (process.platform === 'win32') {
    const winDir = process.env.WINDIR || 'C:\\Windows';
    fontDirs.push(path.join(winDir, 'Fonts'));
    if (process.env.LOCALAPPDATA) {
      fontDirs.push(path.join(process.env.LOCALAPPDATA, 'Microsoft', 'Windows', 'Fonts'));
    }
  } else if (process.platform === 'darwin') {
    fontDirs.push('/Library/Fonts', '/System/Library/Fonts');
    if (process.env.HOME) {
      fontDirs.push(path.join(process.env.HOME, 'Library', 'Fonts'));
    }
  } else {
    fontDirs.push('/usr/share/fonts', '/usr/local/share/fonts');
    if (process.env.HOME) {
      fontDirs.push(path.join(process.env.HOME, '.fonts'));
    }
  }

  const results = [];
  for (const dir of fontDirs) {
    try {
      if (fs.existsSync(dir)) {
        const files = await fs.promises.readdir(dir);
        for (const file of files) {
          const ext = path.extname(file).toLowerCase();
          if (['.ttf', '.otf', '.woff', '.woff2'].includes(ext)) {
            const cleanName = path.basename(file, ext)
              .replace(/[-_]/g, ' ')
              .replace(/\b\w/g, c => c.toUpperCase());
            results.push({
              name: cleanName,
              fileName: file,
              path: path.join(dir, file),
              ext
            });
          }
        }
      }
    } catch (e) {
      console.warn('Erro ao ler diretório de fontes:', dir, e);
    }
  }

  const seen = new Set();
  return results.filter(f => {
    if (seen.has(f.fileName.toLowerCase())) return false;
    seen.add(f.fileName.toLowerCase());
    return true;
  }).sort((a, b) => a.name.localeCompare(b.name));
});

// IPC para ler arquivo de fonte em Base64
ipcMain.handle('read-font-file', async (event, filePath) => {
  try {
    const buffer = await fs.promises.readFile(filePath);
    return { success: true, data: buffer.toString('base64'), name: path.basename(filePath) };
  } catch (err) {
    return { success: false, error: err.message || String(err) };
  }
});

// IPC para abrir seletor nativo de arquivos de fonte no PC
ipcMain.handle('pick-system-font-file', async () => {
  try {
    const win = BrowserWindow.getFocusedWindow();
    const defaultDir = process.platform === 'win32'
      ? path.join(process.env.WINDIR || 'C:\\Windows', 'Fonts')
      : undefined;

    const result = await dialog.showOpenDialog(win, {
      title: 'Selecionar Fontes do Computador',
      defaultPath: defaultDir,
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Fontes TrueType / OpenType', extensions: ['ttf', 'otf', 'woff', 'woff2', 'ttc'] }
      ]
    });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
      return { canceled: true, files: [] };
    }

    const loadedFiles = [];
    for (const fp of result.filePaths) {
      try {
        const buffer = await fs.promises.readFile(fp);
        loadedFiles.push({
          path: fp,
          name: path.basename(fp),
          data: buffer.toString('base64')
        });
      } catch (e) {
        console.error('Erro ao ler fonte:', fp, e);
      }
    }
    return { canceled: false, files: loadedFiles };
  } catch (err) {
    return { canceled: true, error: err.message || String(err), files: [] };
  }
});

// IPC para limpar cache e recarregar a versão mais recente em tempo real
ipcMain.handle('clear-cache-and-reload', async () => {
  try {
    const ses = session.defaultSession;
    await ses.clearCache();
    await ses.clearStorageData({
      storages: ['appcache', 'cookies', 'filesystem', 'indexdb', 'localstorage', 'shadercache', 'websql', 'serviceworkers', 'cachestorage']
    });
    const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
    if (win) {
      await loadAppIntoWindow(win);
    }
    return { success: true };
  } catch (err) {
    console.error('[Electron] Erro ao limpar cache nativo:', err);
    return { success: false, error: err.message || String(err) };
  }
});

// IPC para forçar reload do aplicativo
ipcMain.handle('reload-app', async () => {
  const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
  if (win) {
    win.reload();
  }
  return { success: true };
});

// Configuração do Auto-Updater para atualizações binárias (.exe)
if (autoUpdater) {
  autoUpdater.autoDownload = false; // Não tentar baixar automaticamente arquivos que podem não existir ou dar 404
  autoUpdater.autoInstallOnAppQuit = true;

  // Em caso de erro na verificação (ex: GitHub Releases com status 404 ou sem internet)
  autoUpdater.on('error', (err) => {
    // Registra no console de diagnóstico mas NÃO abre janela de erro para não interromper nem assustar o usuário
    console.warn('[Auto-Updater] Verificação de atualização binária ignorada/indisponível:', err && err.message ? err.message : String(err));
  });

  // Quando uma atualização estiver disponível no repositório
  autoUpdater.on('update-available', (info) => {
    console.log('[Auto-Updater] Nova versão encontrada:', info.version);
    dialog.showMessageBox({
      type: 'question',
      buttons: ['Baixar Atualização', 'Mais Tarde'],
      defaultId: 0,
      title: 'Atualização do Agenda Master',
      message: `Uma nova versão do instalador (${info.version}) está disponível. Deseja realizar o download em segundo plano?`
    }).then((res) => {
      if (res.response === 0) {
        autoUpdater.downloadUpdate().catch((e) => {
          console.warn('[Auto-Updater] Falha ao baixar pacote:', e.message);
        });
      }
    });
  });

  // Quando o download da atualização terminar com sucesso
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
}

// URL de produção em nuvem para que os usuários SEMPRE acessem a versão mais nova do Agenda Master
const PRODUCTION_APP_URL = process.env.AGENDA_MASTER_URL || 'https://ais-pre-pqdpg3bbajb7bnh4kht4ij-509420675568.us-east1.run.app';

async function loadAppIntoWindow(win) {
  if (process.env.ELECTRON_DEV_URL) {
    console.log('[Electron] Modo desenvolvimento: carregando dev server local:', process.env.ELECTRON_DEV_URL);
    await win.loadURL(process.env.ELECTRON_DEV_URL);
    return;
  }

  const localIndexPath = path.join(__dirname, '../dist/index.html');

  // Se o usuário optar explicitamente por forçar modo offline local
  if (process.env.ELECTRON_FORCE_LOCAL === 'true' && fs.existsSync(localIndexPath)) {
    console.log('[Electron] Modo local forçado: carregando arquivo estático.');
    await win.loadFile(localIndexPath);
    return;
  }

  // Arquitetura Online-First: Tenta carregar a nuvem mais recente em tempo real
  try {
    console.log('[Electron] Carregando versão mais recente da nuvem:', PRODUCTION_APP_URL);
    await win.loadURL(PRODUCTION_APP_URL);
  } catch (netErr) {
    console.warn('[Electron] Falha ao carregar versão remota (sem conexão ou erro de rede). Usando cópia local embutida:', netErr.message);
    if (fs.existsSync(localIndexPath)) {
      await win.loadFile(localIndexPath);
    } else {
      console.error('[Electron] Nenhum arquivo local dist/index.html encontrado para fallback.');
    }
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "Agenda Master",
    icon: path.join(__dirname, '../public/icon.png'),
    autoHideMenuBar: true, // Oculta barra de menus para interface mais limpa e moderna
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  // Atalhos de teclado para recarregar (F5, Ctrl+R, Ctrl+Shift+R)
  win.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown') {
      if ((input.control && input.key.toLowerCase() === 'r') || input.key === 'F5') {
        if (input.shift || (input.control && input.key === 'F5')) {
          console.log('[Electron] Recarga forçada (ignorando cache)...');
          win.webContents.reloadIgnoringCache();
        } else {
          console.log('[Electron] Recarregando página...');
          win.webContents.reload();
        }
        event.preventDefault();
      }
    }
  });

  // Carrega a aplicação (Online-first com fallback offline)
  loadAppIntoWindow(win);

  // Abrir links externos (como WhatsApp, suporte, links externos) no navegador padrão do sistema
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();

  // Verifica atualizações do wrapper binário (.exe) silenciosamente ao iniciar
  if (autoUpdater && !process.env.ELECTRON_DEV_URL) {
    try {
      autoUpdater.checkForUpdates().catch((err) => {
        console.warn('[Auto-Updater] Verificação de atualizações binárias:', err.message);
      });
    } catch (checkErr) {
      console.warn('[Auto-Updater] Erro ao iniciar checagem:', checkErr);
    }
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
