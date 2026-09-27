import React, { useState, useEffect } from 'react';
import { 
  Globe, Download, ArrowRight, Sparkles, 
  CheckCircle2, Laptop, Zap, ShieldCheck,
  ChevronRight, Lock, Monitor, Info, Check, ThumbsUp, AlertCircle
} from 'lucide-react';
import { SystemRequirementsModal } from '../editor/components/SystemRequirementsModal';

interface WelcomeProps {
  onChooseBrowser: () => void;
  exeUrl: string;
  onNavigateToLanding?: () => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onChooseBrowser, exeUrl, onNavigateToLanding }) => {
  const [showReqModal, setShowReqModal] = useState(false);
  const [hardwareInfo, setHardwareInfo] = useState<{
    browser: string;
    os: string;
  }>({
    browser: 'Detectando...',
    os: 'Windows'
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent;
      let browser = 'Navegador Web';
      if (ua.includes('Edg/')) {
        browser = 'Microsoft Edge';
      } else if (ua.includes('Chrome/')) {
        browser = 'Google Chrome';
      } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
        browser = 'Apple Safari';
      } else if (ua.includes('Firefox/')) {
        browser = 'Mozilla Firefox';
      }

      let os = 'Windows';
      if (ua.includes('Macintosh') || ua.includes('Mac OS')) {
        os = 'macOS';
      } else if (ua.includes('Android')) {
        os = 'Android';
      } else if (ua.includes('iPhone') || ua.includes('iPad')) {
        os = 'iOS';
      } else if (ua.includes('Linux')) {
        os = 'Linux';
      }

      setHardwareInfo({ browser, os });
    }
  }, []);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans antialiased selection:bg-orange-500 selection:text-white relative">
      {/* Background Soft Gradients and Ambient Orange/Dark Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-orange-600/10 via-amber-600/5 to-transparent blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-orange-950/20 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Header */}
      <header className="w-full border-b border-stone-800 bg-stone-950/90 backdrop-blur-md sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-amber-600 to-orange-600 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-600/20">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight text-white leading-none">
                  Agenda Master <span className="text-orange-500">AI</span>
                </h1>
                <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  v1.1.2
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-medium">Sistema Profissional de Personalização de Agendas e Planners</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {onNavigateToLanding && (
              <button
                onClick={onNavigateToLanding}
                className="text-xs font-bold text-stone-300 hover:text-white bg-stone-900 hover:bg-stone-850 border border-stone-800 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Acessar Landing Page de apresentação"
              >
                <Globe className="w-3.5 h-3.5 text-orange-400" />
                <span className="hidden sm:inline">Landing Page</span>
              </button>
            )}

            <button
              onClick={() => setShowReqModal(true)}
              className="text-xs font-bold text-stone-300 hover:text-white bg-stone-900 hover:bg-stone-850 border border-stone-800 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Info className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden sm:inline">Requisitos Mínimos</span>
              <span className="sm:hidden">Requisitos</span>
            </button>

            <button
              onClick={onChooseBrowser}
              className="text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-lg shadow-orange-600/25 px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Acessar Plataforma</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section / Selection Body */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex flex-col justify-center relative z-10 w-full space-y-8 sm:space-y-10">
        
        {/* Title Block */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 px-4 py-1.5 rounded-full text-xs font-bold text-orange-400 uppercase tracking-widest shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Ambiente de Criação & Edição</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Como você deseja criar <br className="hidden sm:inline" />
            seus miolos hoje?
          </h2>

          <p className="text-sm sm:text-base text-stone-400 font-medium leading-relaxed max-w-2xl mx-auto">
            Abra diretamente no navegador para criar com praticidade ou instale o aplicativo oficial para o seu computador com máxima velocidade e renderização nativa.
          </p>
        </div>

        {/* Choice Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Card 1: Navegador (Web) */}
          <div className="bg-stone-900 border border-stone-800 hover:border-orange-500/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-orange-500/10 group relative overflow-hidden">
            <div className="space-y-6 pt-2">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-stone-800 border border-stone-700 flex items-center justify-center text-orange-400 group-hover:scale-105 transition-transform shadow-inner">
                  <Globe className="w-7 h-7" />
                </div>
                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Acesso Direto
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors flex items-center gap-2">
                  <span>Criar no Navegador</span>
                </h3>
                <p className="text-xs text-stone-400 mt-2 leading-relaxed font-medium">
                  Abra sem baixar nada em qualquer computador. Ideal para criar e editar seus planners, cadernos e agendas com agilidade no dia a dia.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-stone-300 font-medium border-t border-stone-800 pt-5">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>Compatível com Chrome, Edge, Safari e Firefox</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>Pronto para usar na hora sem ocupar espaço em disco</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>Atualizações automáticas em tempo real</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <button
                onClick={onChooseBrowser}
                className="w-full bg-stone-800 hover:bg-stone-750 text-white border border-stone-700 hover:border-orange-500/60 font-bold text-xs uppercase tracking-wider py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>Abrir Editor no Navegador</span>
                <ArrowRight className="w-4 h-4 text-orange-400" />
              </button>
            </div>
          </div>

          {/* Card 2: Instalador Desktop (.EXE) */}
          <div className="bg-stone-900 border border-stone-800 hover:border-orange-500/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-orange-500/10 group relative overflow-hidden">
            <div className="space-y-6 pt-2">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 group-hover:scale-105 transition-transform shadow-inner">
                  <Laptop className="w-7 h-7" />
                </div>
                <span className="bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-orange-400" />
                  Máxima Fluidez
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors flex items-center gap-2">
                  <span>Instalar no Computador</span>
                </h3>
                <p className="text-xs text-stone-400 mt-2 leading-relaxed font-medium">
                  Aplicativo desktop para Windows. Perfeito para montar agendas completas com centenas de páginas e exportar PDFs com altíssima velocidade.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-stone-300 font-medium border-t border-stone-800 pt-5">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>Aceleração gráfica nativa do seu computador</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>Exportação ultrarrápida de arquivos pesados</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>Atalho oficial exclusivo na sua Área de Trabalho</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <a
                href={exeUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setTimeout(() => {
                    onChooseBrowser();
                  }, 1200);
                }}
                className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider py-4 px-6 rounded-2xl shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer text-center block"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Instalador Oficial (.EXE)</span>
              </a>
            </div>
          </div>

        </div>

        {/* Clear, Simple Minimum Requirements Box styled in orange & black */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-xl">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm sm:text-base">
                  Requisitos do Sistema
                </h4>
                <p className="text-[11px] text-stone-400 font-medium">Tudo o que você precisa para criar tranquilamente</p>
              </div>
            </div>

            <button
              onClick={() => setShowReqModal(true)}
              className="text-xs font-bold text-orange-400 hover:text-orange-300 bg-stone-800 hover:bg-stone-750 border border-stone-700 px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Dúvidas Frequentes</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-stone-950/70 p-3.5 rounded-xl border border-stone-800 space-y-1">
              <div className="flex items-center gap-1.5 text-white font-bold">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Computador</span>
              </div>
              <p className="text-[11px] text-stone-400">Windows, Mac ou Linux (Qualquer modelo comum)</p>
            </div>

            <div className="bg-stone-950/70 p-3.5 rounded-xl border border-stone-800 space-y-1">
              <div className="flex items-center gap-1.5 text-white font-bold">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Navegador</span>
              </div>
              <p className="text-[11px] text-stone-400">Google Chrome, Edge, Safari ou Firefox</p>
            </div>

            <div className="bg-stone-950/70 p-3.5 rounded-xl border border-stone-800 space-y-1">
              <div className="flex items-center gap-1.5 text-white font-bold">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Conexão</span>
              </div>
              <p className="text-[11px] text-stone-400">Internet banda larga comum para acessar</p>
            </div>

            <div className="bg-stone-950/70 p-3.5 rounded-xl border border-stone-800 space-y-1">
              <div className="flex items-center gap-1.5 text-white font-bold">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Memória (RAM)</span>
              </div>
              <p className="text-[11px] text-stone-400">4 GB ou mais (padrão da maioria dos computadores)</p>
            </div>
          </div>

          <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-3 flex items-center justify-between gap-3 text-xs text-emerald-300 flex-wrap">
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><strong>Seu computador:</strong> {hardwareInfo.os} com {hardwareInfo.browser} — <strong>100% Compatível!</strong></span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-md">
              Tudo Pronto
            </span>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center pt-2">
          <button
            onClick={onChooseBrowser}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-400 hover:text-orange-400 transition-colors group cursor-pointer"
          >
            <span>Já tem uma conta? Clique aqui para entrar no seu painel</span>
            <ChevronRight className="w-4 h-4 text-orange-500 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-stone-800 bg-stone-950 py-5 text-center text-[11px] text-stone-500 font-medium">
        <p>Agenda Master AI • O Sistema Completo de Personalização de Papelaria © 2026</p>
      </footer>

      {/* System Requirements Modal */}
      <SystemRequirementsModal 
        isOpen={showReqModal} 
        onClose={() => setShowReqModal(false)} 
        currentPageCount={300}
      />
    </div>
  );
};
