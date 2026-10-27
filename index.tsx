import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { localStorage, sessionStorage } from './services/safeStorage';

if (typeof window !== 'undefined') {
  (window as any).deferredPrompt = null;
  (window as any).isAppInstalled = false;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    (window as any).deferredPrompt = e;
    window.dispatchEvent(new CustomEvent('pwa-prompt-ready'));
  });

  window.addEventListener('appinstalled', () => {
    (window as any).deferredPrompt = null;
    (window as any).isAppInstalled = true;
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  });

  if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
    (window as any).isAppInstalled = true;
  }

  // Limpa apenas caches de arquivos estáticos/rede e Service Workers antigos,
  // preservando 100% do login da aluna, rascunhos, fontes e Meus Modelos.
  const clearNetworkCachesOnly = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          try {
            await registration.unregister();
          } catch (_) {}
        }
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        for (const key of keys) {
          try {
            await caches.delete(key);
          } catch (_) {}
        }
      }
    } catch (_) {}
  };

  const clearStaleSupabaseTokensOnly = () => {
    try {
      if (!localStorage) return;
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('sb-') || key.includes('supabase.auth') || key.includes('supabase-js'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => {
        try {
          localStorage.removeItem(k);
        } catch (_) {}
      });
    } catch (_) {}
  };

  (window as any).clearAppCache = async (forceReload = true, clearAuthSession = false) => {
    await clearNetworkCachesOnly();
    if (clearAuthSession) {
      clearStaleSupabaseTokensOnly();
    }
    try {
      sessionStorage.removeItem('agendamaster_chunk_reload_ts');
    } catch (_) {}

    if (forceReload) {
      const url = new URL(window.location.href);
      url.searchParams.set('_r', Date.now().toString(36));
      window.location.replace(url.toString());
    }
  };

  // Limpa param temporário _r da barra de endereço sem recarregar
  try {
    if (window.location.search.includes('_r=') && window.history?.replaceState) {
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('_r');
      window.history.replaceState({}, '', cleanUrl.pathname + cleanUrl.search + cleanUrl.hash);
    }
  } catch (_) {}

  // Atualização silenciosa de versão: limpa somente caches antigos de arquivos, mantendo a aluna logada!
  const CURRENT_SYSTEM_VERSION = 'agendamaster-v2.0.3';
  const lastSavedVersion = localStorage.getItem('agendamaster_system_version');

  if (lastSavedVersion !== CURRENT_SYSTEM_VERSION) {
    try {
      localStorage.setItem('agendamaster_system_version', CURRENT_SYSTEM_VERSION);
    } catch (_) {}
    if (lastSavedVersion) {
      clearNetworkCachesOnly().catch(() => {});
    }
  }

  // Auto-recuperação transparente quando sai um novo deploy e o navegador tenta abrir um chunk JS antigo
  const tryRecoverFromChunkMismatch = () => {
    try {
      const lastAttempt = parseInt(sessionStorage.getItem('agendamaster_chunk_reload_ts') || '0', 10);
      if (Date.now() - lastAttempt < 20_000) return false;
      sessionStorage.setItem('agendamaster_chunk_reload_ts', String(Date.now()));
      clearNetworkCachesOnly().finally(() => {
        window.location.reload();
      });
      return true;
    } catch (_) {
      return false;
    }
  };

  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    tryRecoverFromChunkMismatch();
  });

  const isChunkLoadFailure = (msg: string) =>
    msg.includes('failed to fetch dynamically imported module') ||
    msg.includes('importing a module script failed') ||
    msg.includes('error loading dynamically imported module') ||
    msg.includes('chunkloaderror');

  const isTrueRefreshTokenError = (msg: string) =>
    msg.includes('refresh_token_not_found') ||
    msg.includes('invalid refresh token') ||
    msg.includes('refresh token not found') ||
    msg.includes('invalid_grant');

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = (reason?.message || (typeof reason === 'string' ? reason : '') || '').toLowerCase();

    if (msg.includes('[vite]') || msg.includes('send was called before connect') || msg.includes('websocket')) {
      event.preventDefault();
      return;
    }

    if (isChunkLoadFailure(msg)) {
      event.preventDefault();
      tryRecoverFromChunkMismatch();
      return;
    }

    if (isTrueRefreshTokenError(msg)) {
      event.preventDefault();
      clearStaleSupabaseTokensOnly();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = (event.message || '').toLowerCase();

    if (msg.includes('[vite]') || msg.includes('send was called before connect') || msg.includes('websocket')) {
      event.preventDefault();
      return;
    }

    if (isChunkLoadFailure(msg)) {
      event.preventDefault();
      tryRecoverFromChunkMismatch();
      return;
    }

    if (isTrueRefreshTokenError(msg)) {
      event.preventDefault();
      clearStaleSupabaseTokensOnly();
    }
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  const isDevEnv =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('ais-dev') ||
    window.location.hostname.includes('ais-pre') ||
    window.location.hostname.includes('run.app') ||
    window.location.hostname.includes('webcontainer-api') ||
    window.location.hostname.includes('stackblitz');

  if (isDevEnv) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().catch(() => {});
      }
    });
  } else {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js?v=2.0.3', { updateViaCache: 'none' })
        .then((reg) => {
          reg.update().catch(() => {});
          document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
              reg.update().catch(() => {});
            }
          });
        })
        .catch(() => {});
    });
  }
}