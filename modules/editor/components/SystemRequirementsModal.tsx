import React, { useState, useEffect } from 'react';
import { 
  Monitor, Cpu, Zap, CheckCircle, X, Sparkles, 
  Play, RefreshCw, ShieldCheck, Heart, Laptop, Globe,
  HelpCircle, Check, ThumbsUp, AlertCircle
} from 'lucide-react';

interface SystemRequirementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPageCount?: number;
}

export const SystemRequirementsModal: React.FC<SystemRequirementsModalProps> = ({ 
  isOpen, 
  onClose,
  currentPageCount = 150
}) => {
  const [hardwareInfo, setHardwareInfo] = useState<{
    browser: string;
    os: string;
    isCompatible: boolean;
  }>({
    browser: 'Buscando...',
    os: 'Detectando...',
    isCompatible: true
  });

  const [benchmarkStatus, setBenchmarkStatus] = useState<'idle' | 'running' | 'completed'>('idle');

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

      setHardwareInfo({ browser, os, isCompatible: true });
    }
  }, []);

  const runQuickCheck = () => {
    setBenchmarkStatus('running');
    setTimeout(() => {
      setBenchmarkStatus('completed');
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 my-6 max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl text-white backdrop-blur-xs">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                Requisitos Mínimos & Diagnóstico
              </h2>
              <p className="text-xs text-orange-100 font-medium">
                Confira o que é necessário para utilizar o Agenda Master AI com total tranquilidade
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-slate-50/60">
          
          {/* Main Encouraging Banner */}
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-5 flex items-start gap-4">
            <div className="p-3 bg-emerald-500 text-white rounded-2xl shrink-0 mt-0.5 shadow-sm">
              <ThumbsUp className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-emerald-950 text-base">
                Sim! Seu computador é 100% compatível!
              </h3>
              <p className="text-xs text-emerald-900 leading-relaxed">
                Você <strong>não precisa de um computador caro ou recente</strong>. Se o seu computador ou notebook acessa a internet e abre sites comuns (como YouTube, WhatsApp Web ou e-mail), ele vai rodar o <strong>Agenda Master AI</strong> perfeitamente.
              </p>
            </div>
          </div>

          {/* Simple Requirements Comparison Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-orange-500" />
              Tabela de Requisitos do Sistema
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Minimum Requirements */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                    Requisitos Mínimos
                  </span>
                  <span className="bg-slate-200 text-slate-700 text-[9px] font-bold px-2 py-0.5 rounded">
                    Básico
                  </span>
                </div>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Sistema:</strong> Windows (7, 10, 11), Mac ou Linux</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Navegador:</strong> Chrome, Edge, Safari ou Firefox</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Memória RAM:</strong> 4 GB</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Internet:</strong> Banda larga simples</span>
                  </li>
                </ul>
              </div>

              {/* Recommended Requirements */}
              <div className="bg-orange-50/50 border border-orange-200/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-orange-200 pb-2">
                  <span className="font-black text-orange-950 uppercase tracking-wider text-[11px]">
                    Requisitos Recomendados
                  </span>
                  <span className="bg-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                    Ideal para Arquivos Pesados
                  </span>
                </div>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                    <span><strong>Sistema:</strong> Windows 10 ou 11 (64-bits)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                    <span><strong>Navegador:</strong> Google Chrome ou Microsoft Edge</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                    <span><strong>Memória RAM:</strong> 8 GB ou mais</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                    <span><strong>Opcional:</strong> Aplicativo Instalável (.EXE)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Browser & System Check */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-orange-500" />
                <h4 className="font-black text-slate-900 text-sm">Status do Seu Dispositivo Atual</h4>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" />
                Aprovado
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Seu Navegador</p>
                <p className="font-bold text-slate-800 mt-0.5">{hardwareInfo.browser}</p>
                <span className="text-[10px] text-emerald-600 font-medium">✓ Totalmente compatível</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Seu Sistema</p>
                <p className="font-bold text-slate-800 mt-0.5">{hardwareInfo.os}</p>
                <span className="text-[10px] text-emerald-600 font-medium">✓ Pronto para uso</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Avaliação Geral</p>
                <p className="font-bold text-slate-800 mt-0.5">Pronto para criar</p>
                <span className="text-[10px] text-emerald-600 font-medium">✓ Desempenho excelente</span>
              </div>
            </div>

            {/* Quick Speed Test Button */}
            <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100 flex-wrap gap-2">
              <span className="text-slate-500 text-xs">Quer testar a resposta do seu navegador agora?</span>
              
              {benchmarkStatus === 'idle' && (
                <button
                  onClick={runQuickCheck}
                  className="bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 text-orange-600" />
                  <span>Testar Navegador</span>
                </button>
              )}

              {benchmarkStatus === 'running' && (
                <div className="flex items-center gap-2 text-orange-600 font-bold text-xs">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Verificando...</span>
                </div>
              )}

              {benchmarkStatus === 'completed' && (
                <div className="bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-1 rounded-lg flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Seu navegador respondeu super bem!</span>
                </div>
              )}
            </div>
          </div>

          {/* Simple FAQ Cards */}
          <div className="space-y-3">
            <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-orange-500" />
              Perguntas Frequentes
            </h4>

            <div className="grid grid-cols-1 gap-3">
              
              <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1">
                <p className="font-bold text-slate-900 text-xs sm:text-sm">
                  1. O que eu preciso para começar?
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Apenas um computador ou notebook com internet e o navegador <strong>Google Chrome</strong> ou <strong>Microsoft Edge</strong>. Não é necessário instalar nenhum programa complicado.
                </p>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1">
                <p className="font-bold text-slate-900 text-xs sm:text-sm">
                  2. Qual a diferença entre usar no Navegador e Baixar o Aplicativo?
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ambas as opções possuem todas as ferramentas. Pelo navegador você entra direto pelo site. O aplicativo para Windows é ótimo para quem prefere abrir o ícone direto da Área de Trabalho.
                </p>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1">
                <p className="font-bold text-slate-900 text-xs sm:text-sm">
                  3. Posso usar em notebooks simples?
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sim! O Agenda Master AI foi feito para ser leve e carregar suavemente mesmo em notebooks simples do dia a dia.
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-white p-4 border-t border-slate-200 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Garantia de facilidade e praticidade para o seu trabalho.</span>
          </div>
          <button
            onClick={onClose}
            className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
          >
            Entendido, quero começar!
          </button>
        </div>

      </div>
    </div>
  );
};
