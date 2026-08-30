const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  printToPDF: (options) => ipcRenderer.invoke('print-to-pdf', options),
  savePDFBase64: (base64String, defaultName) => ipcRenderer.invoke('save-pdf-base64', { base64String, defaultName })
});

// Preload script for safe context bridge (if needed in the future)
window.addEventListener('DOMContentLoaded', () => {
  console.log('[Electron Preload] Canal seguro carregado com sucesso.');
});
