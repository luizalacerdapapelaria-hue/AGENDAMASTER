import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { localStorage, sessionStorage } from './services/safeStorage';

// Global error handlers to capture and self-heal Supabase refresh token failures and cache corruption
if (typeof window !== 'undefined') {
  // Global PWA installation handlers
  (window as any).deferredPrompt = null;
  (window as any).isAppInstalled = false;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    (window as any).deferredPrompt = e;
    console.log('[PWA Global] Prompt de instalação interceptado e salvo globalmente.');
    window.dispatchEvent(new CustomEvent('pwa-prompt-ready'));
  });

  window.addEventListener('appinstalled', () => {
    (window as any).deferredPrompt = null;
    (window as any).isAppInstalled = true;
    console.log('[PWA Global] Aplicativo instalado com sucesso no sistema do usuário.');
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  });

  if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
    (window as any).isAppInstalled = true;
  }

  // Global cache and state resetting helper
  (window as any).clearAppCache = async (forceReload = true) => {
    console.warn('[Self-Heal] Iniciando limpeza completa de cache e reinicialização...');
    try {
      // 1. Limpar todos os registros de Service Worker
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          try {
            await registration.unregister();
            console.log('[Self-Heal] Service Worker desregistrado:', registration.scope);
          } catch (err) {
            console.warn('[Self-Heal] Erro ao desregistrar SW:', err);
          }
        }
      }

      // 2. Limpar todos os caches da API CacheStorage
      if ('caches' in window) {
        const keys = await caches.keys();
        for (const key of keys) {
          try {
            await caches.delete(key);
            console.log('[Self-Heal] CacheStorage excluído:', key);
          } catch (err) {
            console.warn('[Self-Heal] Erro ao deletar cache:', err);
          }
        }
      }

      // 3. Limpar sessionStorage
      try {
        sessionStorage.clear();
        console.log('[Self-Heal] sessionStorage limpo.');
      } catch (_) {}

      // 4. Limpar chaves de sessão corrompidas e caches do Supabase do localStorage
      if (localStorage) {
        try {
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (
              key.startsWith('sb-') || 
              key.includes('supabase') || 
              key.includes('cache') || 
              key.includes('token')
            )) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(k => {
            try {
              localStorage.removeItem(k);
            } catch (_) {}
          });
          console.log('[Self-Heal] Chaves corrompidas de autenticação removidas do localStorage.');
        } catch (e) {
          console.error('[Self-Heal] Erro ao limpar localStorage:', e);
        }
      }

      console.log('[Self-Heal] Limpeza concluída com sucesso!');
      if (forceReload) {
        window.location.reload();
      }
    } catch (err) {
      console.error('[Self-Heal] Erro crítico ao limpar cache:', err);
    }
  };

  // Autocorreção e atualização automática de versão se houver nova implantação
  const CURRENT_SYSTEM_VERSION = 'agendamaster-v1.1.2';
  const lastSavedVersion = localStorage.getItem('agendamaster_system_version');
  
  if (lastSavedVersion !== CURRENT_SYSTEM_VERSION) {
    console.warn('[Self-Heal] Nova atualização do sistema detectada. Limpando caches obsoletos para evitar travamentos...');
    (window as any).clearAppCache(false).then(() => {
      try {
        localStorage.setItem('agendamaster_system_version', CURRENT_SYSTEM_VERSION);
      } catch (_) {}
      console.log('[Self-Heal] Caches limpos com sucesso. Forçando recarga da página...');
      setTimeout(() => {
        window.location.reload();
      }, 300);
    }).catch(() => {
      try {
        localStorage.setItem('agendamaster_system_version', CURRENT_SYSTEM_VERSION);
      } catch (_) {}
      window.location.reload();
    });
  }

  const clearStaleSession = () => {
    try {
      console.warn('[Auth Global] Autocorreção: Removendo chaves de sessão corrompidas do Supabase...');
      if (localStorage) {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('sb-') || key.includes('supabase.auth') || key.includes('supabase-js'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(k => {
          try {
            localStorage.removeItem(k);
          } catch (_) {}
        });
      }
    } catch (e) {
      console.error('[Auth Global] Erro ao limpar localStorage:', e);
    }
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = (reason?.message || (typeof reason === 'string' ? reason : '') || '').toLowerCase();
    
    if (
      msg.includes('refresh_token') || 
      msg.includes('refresh token') || 
      msg.includes('not found') || 
      msg.includes('invalid_grant') ||
      msg.includes('invalid refresh') ||
      msg.includes('refresh-token')
    ) {
      console.warn('[Auth Global] Capturada falha de refresh token em promessa não tratada:', msg);
      event.preventDefault();
      clearStaleSession();
      // Force page reload to ensure App starts pristine
      window.location.reload();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = (event.message || '').toLowerCase();
    if (
      msg.includes('refresh_token') || 
      msg.includes('refresh token') || 
      msg.includes('not found') || 
      msg.includes('invalid_grant') ||
      msg.includes('invalid refresh') ||
      msg.includes('refresh-token')
    ) {
      console.warn('[Auth Global] Erro síncrono de autenticação capturado:', msg);
      event.preventDefault();
      clearStaleSession();
      window.location.reload();
    }
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// PWA Service Worker Registration
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  const isDevEnv = (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('ais-dev') ||
    window.location.hostname.includes('ais-pre') ||
    window.location.hostname.includes('webcontainer-api') ||
    window.location.hostname.includes('stackblitz')
  );

  if (isDevEnv) {
    // Actively unregister any service worker in development environment to prevent "Failed to fetch" errors due to cross-origin sandboxing
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then(() => {
          console.log('[PWA SW] Service worker ativo removido no ambiente de desenvolvimento para evitar erros de rede.');
        });
      }
    });
  } else {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('[PWA SW] Registrado com sucesso no escopo:', reg.scope);
        })
        .catch((err) => {
          console.error('[PWA SW] Falha ao registrar:', err);
        });
    });
  }
}