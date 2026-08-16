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
}

export const Welcome: React.FC<WelcomeProps> = ({ onChooseBrowser, exeUrl }) => {
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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased selection:bg-orange-500 selection:text-white">
      {/* Background Soft Gradients */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-orange-100/60 via-amber-50/40 to-transparent blur-3xl pointer-events-none z-0" />

      {/* Header */}
      <header className="w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-orange-500 to-amber-600 w-10 h-10 rounded-2xl flex items-center justify-center shadow-md shadow-orange-500/20">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight text-slate-900 leading-none">
                  Agenda Master AI
                </h1>
                <span className="bg-orange-50 text-orange-600 border border-orange-200 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  v0.9
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Plataforma Profissional de Miolos e Planners</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowReqModal(true)}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-orange-500" />
              <span className="hidden sm:inline">Requisitos Mínimos</span>
              <span className="sm:hidden">Requisitos</span>
            </button>

            <button
              onClick={onChooseBrowser}
              className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-orange-500" />
              <span>Entrar na Conta</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section / Selection Body */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex flex-col justify-center relative z-10 w-full space-y-8 sm:space-y-10">
        
        {/* Title Block */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-orange-100/80 border border-orange-200 px-4 py-1.5 rounded-full text-xs font-bold text-orange-700 uppercase tracking-widest shadow-2xs">
            <Zap className="w-3.5 h-3.5 text-orange-600" />
            <span>Escolha de Modo de Acesso</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Como você deseja acessar o <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600">
              Agenda Master AI?
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            Acesse diretamente pelo navegador de qualquer dispositivo ou instale o aplicativo de alta performance para Windows.
          </p>
        </div>

        {/* Choice Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Card 1: Navegador (Web) */}
          <div className="bg-white border border-slate-200/90 hover:border-indigo-300 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-lg shadow-slate-200/40 hover:shadow-xl group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
                  <Globe className="w-7 h-7" />
                </div>
                <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Sem Instalação
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Acessar no Navegador
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed font-medium">
                  Acesso imediato de qualquer computador ou notebook sem baixar nada. Perfeito para edições rápidas e uso no dia a dia.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 font-medium border-t border-slate-100 pt-5">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Compatível com Chrome, Edge, Safari e Firefox</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Acesso direto sem ocupar espaço no HD</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Atualizações automáticas em tempo real</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <button
                onClick={onChooseBrowser}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider py-4 px-6 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>Acessar no Navegador</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 2: Instalador Desktop (.EXE) */}
          <div className="bg-white border border-slate-200/90 hover:border-orange-400 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-lg shadow-slate-200/40 hover:shadow-xl group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50/60 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 group-hover:scale-105 transition-transform">
                  <Laptop className="w-7 h-7" />
                </div>
                <span className="bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3 h-3 fill-orange-500 text-orange-500" />
                  Alta Performance
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                  Instalar no Computador (.EXE)
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed font-medium">
                  Aplicativo nativo para Windows. Recomendado para criação de agendas massivas com centenas de páginas e exportação ultrarrápida.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 font-medium border-t border-slate-100 pt-5">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>Aceleração gráfica por hardware do computador</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>Exportação de PDFs pesados em alta velocidade</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>Atalho direto na Área de Trabalho do Windows</span>
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
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs uppercase tracking-wider py-4 px-6 rounded-2xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer text-center block"
              >
                <Download className="w-4 h-4" />
                <span>Instalar no Computador (.EXE)</span>
              </a>
            </div>
          </div>

        </div>

        {/* Clear, Simple Minimum Requirements Box (Aviso Claro de Requisitos Mínimos) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-sm sm:text-base">
                  Requisitos Mínimos do Sistema
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">Tudo o que você precisa para usar sem problemas</p>
              </div>
            </div>

            <button
              onClick={() => setShowReqModal(true)}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Ver Perguntas Frequentes</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100/80 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Computador</span>
              </div>
              <p className="text-[11px] text-slate-600">Windows, Mac ou Linux (Qualquer modelo comum)</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100/80 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Navegador</span>
              </div>
              <p className="text-[11px] text-slate-600">Google Chrome, Edge, Safari ou Firefox</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100/80 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Conexão</span>
              </div>
              <p className="text-[11px] text-slate-600">Internet banda larga comum para acessar</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100/80 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Memória (RAM)</span>
              </div>
              <p className="text-[11px] text-slate-600">4 GB ou mais (padrão de praticamente todos os computadores)</p>
            </div>
          </div>

          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3 flex items-center justify-between gap-3 text-xs text-emerald-900 flex-wrap">
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>Seu computador atual:</strong> {hardwareInfo.os} com {hardwareInfo.browser} — <strong>100% Compatível!</strong></span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md">
              Tudo Ok
            </span>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center pt-2">
          <button
            onClick={onChooseBrowser}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors group cursor-pointer"
          >
            <span>Já tem uma conta cadastrada? Clique aqui para entrar no painel</span>
            <ChevronRight className="w-4 h-4 text-orange-500 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-5 text-center text-[11px] text-slate-500 font-medium">
        <p>© 2026 Agenda Master AI • Todos os direitos reservados</p>
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
