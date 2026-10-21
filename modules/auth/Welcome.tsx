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
  const [downloadFeedback, setDownloadFeedback] = useState(false);
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
    <div className="min-h-screen bg-gradient-to-b from-[#faf6f4] via-[#fffbf9] to-[#f9f1ee] text-slate-800 flex flex-col font-sans antialiased selection:bg-[#fcedea] selection:text-[#9f3d4a] relative">
      
      {/* Header */}
      <header className="w-full border-b border-[#f2deda] bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#fdeeed] border border-[#f5ded9] w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs">
              <Sparkles className="text-[#b84a56] w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight text-slate-900 leading-none">
                  Agenda <span className="text-[#b84a56]">Master</span>
                </h1>
                <span className="bg-[#fcedea] text-[#9f3d4a] border border-[#f8d4ce] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  v2.0.1
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Sistema Profissional de Personalização de Agendas e Planners</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowReqModal(true)}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-[#eedad5] px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Info className="w-3.5 h-3.5 text-[#b84a56]" />
              <span className="hidden sm:inline">Requisitos Mínimos</span>
              <span className="sm:hidden">Requisitos</span>
            </button>

            <button
              onClick={onChooseBrowser}
              className="text-xs font-bold text-white bg-gradient-to-r from-[#c45663] to-[#b84a56] hover:from-[#b84a56] hover:to-[#9f3d4a] shadow-md shadow-rose-900/15 px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
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
          <div className="inline-flex items-center gap-2 bg-[#fdeeed] border border-[#f5ded9] px-4 py-1.5 rounded-full text-xs font-bold text-[#9f3d4a] uppercase tracking-widest shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#b84a56]" />
            <span>Ambiente de Criação & Edição</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Como você deseja criar <br className="hidden sm:inline" />
            seus miolos hoje?
          </h2>

          <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
            Abra diretamente no navegador para criar com praticidade ou instale o aplicativo oficial para o seu computador Windows com renderização nativa.
          </p>
        </div>

        {/* Choice Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Card 1: Navegador (Web) */}
          <div className="bg-white border-2 border-[#eedad5] hover:border-[#b84a56] rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-lg group relative overflow-hidden">
            <div className="space-y-6 pt-2">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-[#fdeeed] border border-[#f5ded9] flex items-center justify-center text-[#b84a56] group-hover:scale-105 transition-transform shadow-xs">
                  <Globe className="w-7 h-7" />
                </div>
                <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Acesso Direto
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#b84a56] transition-colors flex items-center gap-2">
                  <span>Criar no Navegador</span>
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed font-normal">
                  Abra sem baixar nada em qualquer computador. Ideal para criar e editar seus planners, cadernos e agendas com agilidade no dia a dia.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 font-medium border-t border-[#f2deda] pt-5">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#b84a56] shrink-0" />
                  <span>Compatível com Chrome, Edge, Safari e Firefox</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#b84a56] shrink-0" />
                  <span>Pronto para usar na hora sem ocupar espaço em disco</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#b84a56] shrink-0" />
                  <span>Atualizações automáticas em tempo real</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <button
                onClick={onChooseBrowser}
                className="w-full bg-[#fdeeed] hover:bg-[#fae1dc] text-[#b84a56] border border-[#f5ded9] font-bold text-xs uppercase tracking-wider py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer shadow-2xs"
              >
                <span>Abrir Editor no Navegador</span>
                <ArrowRight className="w-4 h-4 text-[#b84a56]" />
              </button>
            </div>
          </div>

          {/* Card 2: Instalador Desktop (.EXE) */}
          <div className="bg-white border-2 border-[#eedad5] hover:border-[#b84a56] rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-lg group relative overflow-hidden">
            <div className="space-y-6 pt-2">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-[#fdeeed] border border-[#f5ded9] flex items-center justify-center text-[#b84a56] group-hover:scale-105 transition-transform shadow-xs">
                  <Laptop className="w-7 h-7" />
                </div>
                <span className="bg-[#fcedea] border border-[#f8d4ce] text-[#9f3d4a] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#b84a56]" />
                  Máxima Fluidez
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#b84a56] transition-colors flex items-center gap-2">
                  <span>Instalar no Computador</span>
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed font-normal">
                  Aplicativo desktop para Windows. Perfeito para montar agendas completas com centenas de páginas e exportar PDFs com altíssima velocidade.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 font-medium border-t border-[#f2deda] pt-5">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#b84a56] shrink-0" />
                  <span>Aceleração gráfica nativa do seu computador</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#b84a56] shrink-0" />
                  <span>Exportação ultrarrápida de arquivos pesados</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#b84a56] shrink-0" />
                  <span>Atalho oficial exclusivo na sua Área de Trabalho</span>
                </li>
              </ul>
            </div>

            <div className="pt-8 space-y-3">
              <a
                href={exeUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setDownloadFeedback(true);
                }}
                className="w-full bg-gradient-to-r from-[#c45663] to-[#b84a56] hover:from-[#b84a56] hover:to-[#9f3d4a] text-white font-bold text-xs uppercase tracking-wider py-4 px-6 rounded-2xl shadow-lg shadow-rose-900/20 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer text-center block"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Instalador Oficial (.EXE)</span>
              </a>

              {downloadFeedback && (
                <div className="bg-[#fdeeed] border border-[#f5ded9] rounded-2xl p-3.5 text-center space-y-1.5 transition-all">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-black text-[#b84a56]">
                    <CheckCircle2 className="w-4 h-4 text-[#b84a56]" />
                    <span>Download iniciado!</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-normal font-medium">
                    O instalador do Windows <b>Agenda.Master.Setup.exe</b> começou a ser baixado. Quando o download terminar, dê dois cliques para instalar no seu computador.
                  </p>
                  <div className="pt-1 border-t border-[#f2deda]">
                    <button
                      type="button"
                      onClick={onChooseBrowser}
                      className="text-xs text-[#b84a56] hover:text-[#9f3d4a] font-bold hover:underline cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>Quer usar no navegador enquanto isso? Clique aqui</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Minimum Requirements Box */}
        <div className="bg-white border border-[#eedad5] rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#f2deda] pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#fdeeed] text-[#b84a56] border border-[#f5ded9] rounded-xl">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                  Requisitos do Sistema
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">Tudo o que você precisa para criar tranquilamente</p>
              </div>
            </div>

            <button
              onClick={() => setShowReqModal(true)}
              className="text-xs font-bold text-[#b84a56] hover:text-[#9f3d4a] bg-[#fdeeed] hover:bg-[#fae1dc] border border-[#f5ded9] px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Dúvidas Frequentes</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-[#faf5f3] p-3.5 rounded-2xl border border-[#f2deda] space-y-1">
              <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Computador</span>
              </div>
              <p className="text-[11px] text-slate-500">Windows, Mac ou Linux (Qualquer modelo comum)</p>
            </div>

            <div className="bg-[#faf5f3] p-3.5 rounded-2xl border border-[#f2deda] space-y-1">
              <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Navegador</span>
              </div>
              <p className="text-[11px] text-slate-500">Google Chrome, Edge, Safari ou Firefox</p>
            </div>

            <div className="bg-[#faf5f3] p-3.5 rounded-2xl border border-[#f2deda] space-y-1">
              <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Conexão</span>
              </div>
              <p className="text-[11px] text-slate-500">Internet banda larga comum para acessar</p>
            </div>

            <div className="bg-[#faf5f3] p-3.5 rounded-2xl border border-[#f2deda] space-y-1">
              <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Memória (RAM)</span>
              </div>
              <p className="text-[11px] text-slate-500">4 GB ou mais (padrão da maioria dos computadores)</p>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between gap-3 text-xs text-emerald-800 flex-wrap">
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>Seu dispositivo:</strong> {hardwareInfo.os} com {hardwareInfo.browser} — <strong>100% Compatível!</strong></span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-md">
              Tudo Pronto
            </span>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center pt-2">
          <button
            onClick={onChooseBrowser}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#b84a56] transition-colors group cursor-pointer"
          >
            <span>Já tem uma conta? Clique aqui para entrar no seu painel</span>
            <ChevronRight className="w-4 h-4 text-[#b84a56] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#f2deda] bg-white py-5 text-center text-[11px] text-slate-500 font-medium">
        <p>Agenda Master • O Sistema Completo de Personalização de Papelaria © 2026</p>
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
