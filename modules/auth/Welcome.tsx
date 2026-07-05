import React, { useState } from 'react';
import { Monitor, Globe, Download, ArrowRight, ShieldCheck, Zap, RefreshCw, CheckCircle, Sparkles } from 'lucide-react';

interface WelcomeProps {
  onChooseBrowser: () => void;
  exeUrl: string;
}

export const Welcome: React.FC<WelcomeProps> = ({ onChooseBrowser, exeUrl }) => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-3xl bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-6 md:p-10 flex flex-col gap-8">
        
        {/* Header / Logo */}
        <div className="text-center space-y-3">
          <div className="bg-orange-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-orange-200">
            <Sparkles className="text-white w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
              Agenda Master AI
            </h1>
            <p className="text-sm text-gray-500 font-medium max-w-lg mx-auto">
              Gerenciador e Editor de Agendas Personalizadas. Escolha como deseja acessar a plataforma hoje:
            </p>
          </div>
        </div>

        {/* Dual Choice Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card Option 1: Desktop App */}
          <div className="bg-white border-2 border-orange-100 rounded-3xl p-6 flex flex-col justify-between shadow-lg shadow-orange-100/30 hover:border-orange-300 transition-all group hover:scale-[1.01] duration-300">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="bg-orange-50 p-3 rounded-2xl text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                  <Monitor className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black tracking-widest text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full uppercase">
                  Recomendado
                </span>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-lg font-black text-gray-900 flex items-center gap-1.5">
                  Aplicativo de Desktop
                </h2>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Ideal para o seu computador de trabalho. Um programa nativo e independente do navegador.
                </p>
              </div>

              {/* Bullet list of benefits */}
              <ul className="space-y-2.5 pt-2">
                <li className="flex items-start gap-2 text-xs text-gray-600">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Inicialização Instantânea:</strong> Abre em 1 segundo direto do seu menu iniciar ou desktop.</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-gray-600">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Suporte Offline:</strong> Acesse e trabalhe nas suas agendas mesmo se a internet cair.</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-gray-600">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Auto-Update:</strong> Atualizações silenciosas automáticas em segundo plano.</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <a
                href={exeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-center"
              >
                <Download className="w-4 h-4" />
                <span>Instalar no Computador</span>
              </a>
              <span className="block text-center text-[10px] text-gray-400 mt-2">
                Instalador Windows .EXE oficial (leve: menos de 5MB)
              </span>
            </div>
          </div>

          {/* Card Option 2: Browser Access */}
          <div className="bg-white border border-gray-150 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:border-orange-200 transition-all group hover:scale-[1.01] duration-300">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="bg-gray-50 p-3 rounded-2xl text-gray-600 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors duration-300">
                  <Globe className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold tracking-widest text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full uppercase">
                  Sem Instalar
                </span>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-lg font-black text-gray-900 flex items-center gap-1.5">
                  Acesso via Navegador
                </h2>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Ideal para acessos rápidos de qualquer máquina ou de dispositivos móveis.
                </p>
              </div>

              {/* Bullet list of browser features */}
              <ul className="space-y-2.5 pt-2">
                <li className="flex items-start gap-2 text-xs text-gray-600">
                  <CheckCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <span><strong>Flexibilidade Total:</strong> Acesse de qualquer PC, Mac, celular ou tablet.</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-gray-600">
                  <CheckCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <span><strong>Praticidade Máxima:</strong> Sem downloads ou instalações adicionais no sistema.</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-gray-600">
                  <CheckCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <span><strong>Sempre Online:</strong> Acesso rápido de onde você estiver com conexão de internet.</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <button
                type="button"
                onClick={onChooseBrowser}
                className="w-full bg-white hover:bg-gray-50 border-2 border-orange-600 text-orange-600 hover:text-orange-700 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 text-center"
              >
                <span>Continuar no Navegador</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <span className="block text-center text-[10px] text-gray-400 mt-2.5">
                Não requer nenhuma instalação física de arquivo
              </span>
            </div>
          </div>

        </div>

        {/* Footer / Trust Indicators */}
        <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-400 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Ambiente seguro, autenticado e criptografado</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-orange-500" /> Super Rápido</span>
            <span className="flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5 text-emerald-500" /> Intuitivo</span>
          </div>
        </div>

      </div>
    </div>
  );
};
