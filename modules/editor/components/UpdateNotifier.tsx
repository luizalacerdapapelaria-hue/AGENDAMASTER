import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, X, ChevronRight, Laptop } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CURRENT_VERSION = "1.0.8"; // Versão fixa do build atual

export const UpdateNotifier: React.FC = () => {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [releaseNotes, setReleaseNotes] = useState<string>('');
  const [isDismissed, setIsDismissed] = useState(false);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // Detecta se a aplicação está rodando dentro do wrapper do Electron
    const isElectronEnv = typeof window !== 'undefined' && (
      window.navigator.userAgent.toLowerCase().includes('electron') ||
      (window as any).ipcRenderer ||
      !!(window as any).process?.versions?.electron
    );
    setIsElectron(isElectronEnv);

    // Executa a primeira checagem de versão ao carregar o app
    checkVersion();

    // Define uma checagem periódica a cada 5 minutos
    const interval = setInterval(() => {
      checkVersion();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const checkVersion = async () => {
    // Se o usuário dispensou a atualização nesta sessão (snooze), não checa novamente
    const snoozeTime = localStorage.getItem('agenda_master_update_snooze');
    if (snoozeTime) {
      const parsed = parseInt(snoozeTime, 10);
      const twoHours = 2 * 60 * 60 * 1000;
      if (Date.now() - parsed < twoHours) {
        return;
      } else {
        localStorage.removeItem('agenda_master_update_snooze');
      }
    }

    try {
      // Adiciona o timestamp na query string para evitar cache agressivo de navegadores
      const response = await fetch(`/version.json?t=${Date.now()}`);
      if (!response.ok) throw new Error('Erro ao buscar arquivo de versão.');
      const data = await response.json();
      
      if (data && data.version && data.version !== CURRENT_VERSION) {
        setLatestVersion(data.version);
        setReleaseNotes(data.notes || '');
        setHasUpdate(true);
      }
    } catch (err) {
      console.warn('[UpdateNotifier] Erro ao verificar atualizações de versão:', err);
    }
  };

  const handleUpdate = () => {
    if (typeof window !== 'undefined') {
      // Força a recarga total limpando cache do navegador se suportado
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    // Adiciona soneca (snooze) de 2 horas para não perturbar o usuário no editor
    localStorage.setItem('agenda_master_update_snooze', Date.now().toString());
  };

  if (!hasUpdate || isDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed bottom-6 left-6 z-[9999] max-w-sm md:max-w-md bg-slate-900/95 backdrop-blur-md border border-indigo-500/35 shadow-2xl rounded-2xl overflow-hidden text-white no-print"
      >
        <div className="p-4 flex gap-3.5">
          {/* Ícone de atualização rotacionando suavemente com indicador de notificação */}
          <div className="relative flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl bg-indigo-600/90 text-white shadow-lg shadow-indigo-600/20">
            <RefreshCw className="w-5 h-5 animate-spin-slow text-indigo-100" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase bg-indigo-950 px-2 py-0.5 rounded-md">
                Nova Atualização
              </span>
              {isElectron && (
                <span className="text-[9px] font-bold text-amber-400 bg-amber-950/50 border border-amber-900/30 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                  <Laptop className="w-2.5 h-2.5" /> App Desktop
                </span>
              )}
            </div>
            
            <h4 className="text-sm font-bold mt-1 text-slate-100 flex items-center gap-1.5 flex-wrap">
              Versão v{latestVersion} Disponível
              <span className="text-xs font-normal text-slate-400">(instalada: v{CURRENT_VERSION})</span>
            </h4>
            
            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed line-clamp-2">
              {releaseNotes || "Melhorias de inicialização, salvamento em tempo real e estabilidade."}
            </p>

            <div className="flex items-center gap-3 mt-3.5 pt-3 border-t border-slate-800/80">
              <button
                onClick={handleUpdate}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 px-3.5 rounded-xl transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-650/20 active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Atualizar Agora</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              
              <button
                onClick={handleDismiss}
                className="text-xs text-slate-400 hover:text-slate-200 font-semibold py-2 px-1.5 transition-all"
                title="Soneca de 2 horas"
              >
                Lembrar Mais Tarde
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 p-1 hover:bg-slate-800/60 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
