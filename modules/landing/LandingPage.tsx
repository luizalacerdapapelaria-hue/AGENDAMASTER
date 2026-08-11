import React, { useState } from 'react';
import { 
  Sparkles, Globe, Laptop, ArrowRight, CheckCircle2, Heart, 
  ShieldCheck, Settings, Layout, Calendar, BookOpen, 
  Feather, ClipboardList, Check, Download, Lock, LogIn,
  FolderUp, Printer, AlertCircle, XCircle, Wand2, Star,
  HelpCircle, Flower2, Scissors, Smile, Lightbulb, Compass,
  ChevronRight, RefreshCw, FileText, Info, Zap, Monitor
} from 'lucide-react';
import { AppState } from '../../types';

interface LandingPageProps {
  onNavigate: (state: AppState) => void;
  exeUrl?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const scrollToStep = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans antialiased selection:bg-rose-200 selection:text-rose-900 flex flex-col">
      {/* Background Decorative Soft Floral/Glow Elements */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-rose-100/60 via-amber-50/40 to-transparent blur-3xl pointer-events-none z-0" />

      {/* TOP ANNOUNCEMENT BAR FOR ARTISANS */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white text-[11px] font-medium py-1.5 px-4 text-center shadow-xs flex items-center justify-center gap-2 z-50">
        <Heart className="w-3.5 h-3.5 fill-white/80 animate-pulse" />
        <span>Desenvolvido especialmente para <strong>Artesãs, Encadernadoras e Papeleiras</strong> que buscam independência!</span>
        <Heart className="w-3.5 h-3.5 fill-white/80 animate-pulse" />
      </div>

      {/* HEADER NAVBAR */}
      <header className="w-full border-b border-rose-100 bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate(AppState.WELCOME)}>
            <div className="bg-gradient-to-br from-rose-400 to-amber-500 w-9 h-9 rounded-2xl flex items-center justify-center shadow-md shadow-rose-200">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-stone-900 leading-none">
                  Agenda Master <span className="text-rose-500">AI</span>
                </span>
                <span className="bg-rose-100 text-rose-700 border border-rose-200 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Artesã v0.9
                </span>
              </div>
              <p className="text-[10px] text-stone-500 font-medium">Sua fábrica de miolos e planners em PDF</p>
            </div>
          </div>

          {/* Quick Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-stone-600">
            <button 
              onClick={() => scrollToStep('step-1')} 
              className="hover:text-rose-600 transition-colors cursor-pointer"
            >
              1. Como Acessar
            </button>
            <button 
              onClick={() => scrollToStep('step-2')} 
              className="hover:text-rose-600 transition-colors cursor-pointer"
            >
              2. Tipos de Miolo
            </button>
            <button 
              onClick={() => scrollToStep('step-3')} 
              className="hover:text-rose-600 transition-colors cursor-pointer"
            >
              3. Sem Planilhas
            </button>
            <button 
              onClick={() => scrollToStep('step-4')} 
              className="hover:text-rose-600 transition-colors cursor-pointer"
            >
              4. PDF de Impressão
            </button>
          </nav>

          {/* Action Header Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => onNavigate(AppState.LOGIN)}
              className="text-xs font-bold text-stone-700 hover:text-rose-600 bg-stone-100 hover:bg-rose-50 border border-stone-200 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-rose-500" />
              <span>Entrar</span>
            </button>

            <button
              onClick={() => onNavigate(AppState.DASHBOARD)}
              className="text-xs font-bold text-white bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 px-4 py-2 rounded-xl transition-all shadow-md shadow-rose-200 flex items-center gap-2 cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Criar Meu Miolo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-10 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100/80 border border-rose-200 text-rose-700 text-xs font-bold tracking-wide mb-6 shadow-xs">
          <Flower2 className="w-4 h-4 text-rose-500 animate-spin-slow" />
          <span>LIBERDADE PARA A SUA ATELIÊ DE PAPELARIA</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight max-w-4xl mx-auto leading-tight">
          Crie Miolos Exclusivos de Agendas e Planners <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-600 via-pink-500 to-amber-600">Sem Precisa do Corel ou Excel</span>
        </h1>

        <p className="mt-4 text-sm sm:text-base text-stone-600 max-w-2xl mx-auto font-normal leading-relaxed">
          Chega de ficar refém de pacotes prontos de PDF que todo mundo vende igual. O <strong>Agenda Master AI</strong> foi feito pensando em você, artesã: um sistema leve, delicado e automático que gera miolos perfeitos com margem de furação ajustada.
        </p>

        {/* Quick Highlights Pills */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
          <div className="bg-white border border-rose-100 p-3.5 rounded-2xl shadow-sm flex items-center gap-3">
            <div className="bg-rose-100 p-2 rounded-xl text-rose-600">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">Margem de Wire-o</p>
              <p className="text-[10px] text-stone-500">Nunca mais fure o texto!</p>
            </div>
          </div>

          <div className="bg-white border border-amber-100 p-3.5 rounded-2xl shadow-sm flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">Datas Automáticas</p>
              <p className="text-[10px] text-stone-500">Sem planilhas no Excel</p>
            </div>
          </div>

          <div className="bg-white border border-pink-100 p-3.5 rounded-2xl shadow-sm flex items-center gap-3">
            <div className="bg-pink-100 p-2 rounded-xl text-pink-600">
              <Smile className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">100% Intuitivo</p>
              <p className="text-[10px] text-stone-500">Sem programas pesados</p>
            </div>
          </div>

          <div className="bg-white border border-emerald-100 p-3.5 rounded-2xl shadow-sm flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">PDF Vetorial HD</p>
              <p className="text-[10px] text-stone-500">Impressão nítida na sua impressora</p>
            </div>
          </div>
        </div>
      </section>

      {/* EMOTIONAL PAIN POINTS VS SOLUTIONS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-10">
        <div className="bg-gradient-to-b from-rose-50/80 via-amber-50/30 to-white rounded-3xl p-6 sm:p-10 border border-rose-100 shadow-sm">
          
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider bg-rose-100 px-3 py-1 rounded-full">
              VOCÊ SE IDENTIFICA COM ISSO?
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-3">
              As Dores Diárias da Artesã de Encadernação
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-2">
              Sabemos o quanto é frustrante querer entregar um produto exclusivo para a cliente e encontrar barreiras técnicas no meio do caminho.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* PAIN 1: Refém de arquivos prontos */}
            <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-xs space-y-3 relative overflow-hidden">
              <div className="flex items-center gap-3 text-red-600 font-bold text-sm">
                <div className="p-2 bg-red-50 rounded-xl">
                  <XCircle className="w-5 h-5 text-red-500" />
                </div>
                <span>"Sou refém de pacotes prontos do Elo7"</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Você compra um arquivo digital pronto em PDF, mas a cliente pede para mudar o horário, adicionar uma frase ou alterar a cor das linhas, e você não consegue mexer em nada.
              </p>
              <div className="bg-rose-50/80 p-3 rounded-xl border border-rose-100 text-xs text-rose-800 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                <span><strong>No Agenda Master:</strong> Você cria o miolo do zero ou personaliza tudo com total liberdade!</span>
              </div>
            </div>

            {/* PAIN 2: CorelDRAW / Photoshop muito complexo */}
            <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-xs space-y-3 relative overflow-hidden">
              <div className="flex items-center gap-3 text-red-600 font-bold text-sm">
                <div className="p-2 bg-red-50 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <span>"Não sei usar CorelDRAW, Illustrator ou InDesign"</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Programas profissionais são caros, difíceis de aprender, pesados e travam seu computador. Só de pensar em alinhar caixa por caixa dá dor de cabeça.
              </p>
              <div className="bg-rose-50/80 p-3 rounded-xl border border-rose-100 text-xs text-rose-800 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                <span><strong>No Agenda Master:</strong> Interface simples, bonita e visual. Basta clicar e escolher o que deseja!</span>
              </div>
            </div>

            {/* PAIN 3: Planilhas e datas do calendário */}
            <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-xs space-y-3 relative overflow-hidden">
              <div className="flex items-center gap-3 text-red-600 font-bold text-sm">
                <div className="p-2 bg-red-50 rounded-xl">
                  <XCircle className="w-5 h-5 text-red-500" />
                </div>
                <span>"Medo de errar as datas e os dias do mês"</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Montar o calendário no Excel ou Word exige mesclagem de dados e consome horas. Se errar o dia da semana de um mês, o ano inteiro de trabalho é perdido na impressão.
              </p>
              <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-100 text-xs text-amber-900 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span><strong>No Agenda Master:</strong> O motor de IA calcula ano bissexto, feriados e dias da semana automaticamente!</span>
              </div>
            </div>

            {/* PAIN 4: Furação de Wire-o / Espiral cortando o texto */}
            <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-xs space-y-3 relative overflow-hidden">
              <div className="flex items-center gap-3 text-red-600 font-bold text-sm">
                <div className="p-2 bg-red-50 rounded-xl">
                  <Scissors className="w-5 h-5 text-red-500" />
                </div>
                <span>"O furo da encadernadora corta o texto da folha"</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Perder papel offset e tinta da impressora porque a margem da furação interna não foi espelhada nas páginas pares e ímpares dá um prejuízo enorme no ateliê.
              </p>
              <div className="bg-rose-50/80 p-3 rounded-xl border border-rose-100 text-xs text-rose-800 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                <span><strong>No Agenda Master:</strong> Calculadora de margem de encadernação integrada (espelhamento automático de verso)!</span>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => onNavigate(AppState.INITIAL_SETUP)}
              className="py-3.5 px-8 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-rose-200 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>Quero Minha Autonomia na Papelaria Agora</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* STEP DETAILED CONTENT SHOWCASE WITH INTERFACE MOCKUPS */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 pb-16 space-y-8 sm:space-y-12">
        <div className="text-center pt-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-100 px-3.5 py-1 rounded-full border border-rose-200">
            PASSO A PASSO ILUSTRADO DO SISTEMA
          </span>
          <h3 className="text-xl sm:text-3xl font-black text-stone-900 mt-3">Como Funciona na Prática</h3>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl mx-auto">
            Veja como é simples e intuitivo criar os seus miolos de papelaria em apenas 4 passos descomplicados.
          </p>
        </div>

        {/* =========================================================================
            PASSO 1: COMO ACESSAR (Web vs .EXE)
           ========================================================================= */}
        <div id="step-1">
          <div className="bg-white border border-rose-100 rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              
              {/* Left Info Column */}
              <div className="lg:w-5/12 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold uppercase tracking-wider">
                  <Globe className="w-3.5 h-3.5 text-blue-500" />
                  <span>Passo 1 • Acesso Descomplicado</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-tight">
                  Escolha Como Usar no Ateliê
                </h2>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Acesse 100% online direto pelo navegador sem instalar nada, ou utilize nosso aplicativo leve para Windows (.EXE) para produção em alta velocidade.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => onNavigate(AppState.LOGIN)}
                    className="w-full sm:w-auto py-3 px-6 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-rose-200 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Quero Adquirir o Meu Acesso</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Interface Mockup */}
              <div className="lg:w-7/12 w-full bg-slate-50 rounded-2xl p-4 text-slate-800 border border-slate-200 shadow-xs">
                <div className="text-center space-y-3">
                  <span className="inline-block bg-orange-100 text-orange-800 border border-orange-200 text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase">
                    MODO DE ACESSO
                  </span>

                  <h3 className="text-base font-extrabold text-slate-900">
                    Navegador Web ou Aplicativo Windows
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-1">
                    {/* Card 1 - Navegador */}
                    <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <Globe className="w-4 h-4" />
                        </div>
                        <span className="text-[8px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">SEM INSTALAÇÃO</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">No Navegador Web</h4>
                      <p className="text-[10px] text-slate-500">Acesse de qualquer computador. Direto e leve sem ocupar espaço no HD.</p>
                      <button 
                        onClick={() => onNavigate(AppState.LOGIN)}
                        className="w-full py-1.5 bg-indigo-600 text-white font-extrabold text-[9px] rounded-lg uppercase cursor-pointer"
                      >
                        QUERO ADQUIRIR MEU ACESSO
                      </button>
                    </div>

                    {/* Card 2 - Computador (.EXE) */}
                    <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                          <Laptop className="w-4 h-4" />
                        </div>
                        <span className="text-[8px] font-bold bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200">ALTA PERFORMANCE</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">Programa Windows (.EXE)</h4>
                      <p className="text-[10px] text-slate-500">Aplicativo nativo otimizado para exportar PDFs pesados com aceleração gráfica.</p>
                      <button 
                        onClick={() => onNavigate(AppState.LOGIN)}
                        className="w-full py-1.5 bg-amber-600 text-white font-extrabold text-[9px] rounded-lg uppercase cursor-pointer"
                      >
                        QUERO ADQUIRIR MEU ACESSO
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* =========================================================================
            PASSO 2: O QUE CRIAR HOJE (4 Tipos de Miolos)
           ========================================================================= */}
        <div id="step-2">
          <div className="bg-white border border-rose-100 rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              
              {/* Left Info Column */}
              <div className="lg:w-5/12 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-[11px] font-bold uppercase tracking-wider">
                  <Layout className="w-3.5 h-3.5 text-violet-500" />
                  <span>Passo 2 • Variedade no Ateliê</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-tight">
                  Projetos Mais Vendidos da Papelaria
                </h2>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Crie agendas diárias, planners semanais, cadernos pautados/pontilhados e devocionais bíblicos com personalização total.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => onNavigate(AppState.LOGIN)}
                    className="w-full sm:w-auto py-3 px-6 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Quero Adquirir o Meu Acesso</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Interface Mockup */}
              <div className="lg:w-7/12 w-full bg-stone-50 rounded-2xl p-4 text-stone-900 border border-stone-200 shadow-xs">
                <div className="text-center space-y-3">
                  <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider">
                    SELECIONE O TIPO DE PROJETO
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    {/* Agenda */}
                    <div className="bg-white border border-stone-200 p-3 rounded-xl flex flex-col items-center justify-between space-y-1">
                      <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-stone-900">Agenda</h4>
                      <span className="text-[9px] text-stone-500">1 ou 2 Dias/Pág</span>
                    </div>

                    {/* Planner */}
                    <div className="bg-white border border-stone-200 p-3 rounded-xl flex flex-col items-center justify-between space-y-1">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-stone-900">Planner</h4>
                      <span className="text-[9px] text-stone-500">Visão Semanal</span>
                    </div>

                    {/* Caderno */}
                    <div className="bg-white border border-stone-200 p-3 rounded-xl flex flex-col items-center justify-between space-y-1">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <Feather className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-stone-900">Caderno</h4>
                      <span className="text-[9px] text-stone-500">Pautado/Pontilhado</span>
                    </div>

                    {/* Devocional */}
                    <div className="bg-white border border-stone-200 p-3 rounded-xl flex flex-col items-center justify-between space-y-1">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                        <ClipboardList className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-stone-900">Devocional</h4>
                      <span className="text-[9px] text-stone-500">Estudo Bíblico</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* =========================================================================
            PASSO 3: CONFIGURAÇÃO AUTOMÁTICA (Sem Planilhas)
           ========================================================================= */}
        <div id="step-3">
          <div className="bg-white border border-rose-100 rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              
              {/* Left Info Column */}
              <div className="lg:w-5/12 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold uppercase tracking-wider">
                  <Settings className="w-3.5 h-3.5 text-amber-600" />
                  <span>Passo 3 • Automação Inteligente</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-tight">
                  Sem Planilhas no Excel
                </h2>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Defina o ano desejado e o sistema gera automaticamente todos os dias da semana, feriados nacionais, municipais e margens para encadernação.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => onNavigate(AppState.LOGIN)}
                    className="w-full sm:w-auto py-3 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Quero Adquirir o Meu Acesso</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Interface Mockup */}
              <div className="lg:w-7/12 w-full bg-stone-50 rounded-2xl p-4 text-stone-900 border border-stone-200 shadow-xs">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-stone-200">
                    <span className="text-[10px] font-bold text-amber-600 block mb-1">DATA E ANO</span>
                    <p className="font-extrabold text-stone-900">Ano Automático</p>
                    <p className="text-[10px] text-stone-500 mt-0.5">2025, 2026, 2027 e feriados nacionais inclusos.</p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-stone-200">
                    <span className="text-[10px] font-bold text-amber-600 block mb-1">ENCADERNAÇÃO</span>
                    <p className="font-extrabold text-stone-900">Margem A5 / Wire-O</p>
                    <p className="text-[10px] text-stone-500 mt-0.5">Espaço perfeito para furação sem cortar textos.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* =========================================================================
            PASSO 4: EDITOR & EXPORTAÇÃO PDF HD (PDF de Gráfica)
           ========================================================================= */}
        <div id="step-4">
          <div className="bg-white border border-rose-100 rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              
              {/* Left Info Column */}
              <div className="lg:w-5/12 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold uppercase tracking-wider">
                  <Printer className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Passo 4 • PDF Vetorial Perfeito</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-tight">
                  Editor Visual & Exportação PDF
                </h2>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Ajuste páginas pares e ímpares, adicione elementos decorativos e baixe o PDF pronto para impressão na sua impressora.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => onNavigate(AppState.LOGIN)}
                    className="w-full sm:w-auto py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Quero Adquirir o Meu Acesso</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Interface Mockup */}
              <div className="lg:w-7/12 w-full bg-stone-50 rounded-2xl p-4 text-stone-900 border border-stone-200 shadow-xs">
                <div className="bg-white p-3 rounded-xl border border-stone-200 text-center space-y-2">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-3 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> PDF VETORIAL EM ALTA DEFINIÇÃO
                  </div>
                  <h4 className="text-xs font-extrabold text-stone-900">Impressão Limpa e Nítida</h4>
                  <p className="text-[10px] text-stone-500 max-w-sm mx-auto">
                    Exportação otimizada sem borrões em linhas finas e com alinhamento perfeito de frente e verso.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

      </main>

      {/* 7-DAY MONEY BACK GUARANTEE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-8">
        <div className="bg-gradient-to-br from-amber-50 via-rose-50 to-orange-50 border-2 border-amber-200/90 rounded-3xl p-6 sm:p-10 shadow-md relative overflow-hidden">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
            {/* Guarantee Emblem */}
            <div className="shrink-0 flex flex-col items-center justify-center text-center">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 p-1 shadow-lg shadow-amber-300/40 relative flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center p-3 border border-amber-200 text-center">
                  <ShieldCheck className="w-8 h-8 text-amber-500 mb-0.5" />
                  <span className="text-xl sm:text-2xl font-black text-amber-600 leading-none">7 DIAS</span>
                  <span className="text-[9px] font-extrabold text-stone-700 tracking-wider uppercase mt-0.5">DE GARANTIA</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-3 py-0.5 rounded-full mt-3">
                RISCO ZERO PARA VOCÊ
              </span>
            </div>

            {/* Guarantee Content */}
            <div className="space-y-3 text-center md:text-left flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider">
                <Heart className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>Sua Satisfação em Primeiro Lugar</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-snug">
                Garantia Incondicional de 7 Dias de Satisfação
              </h3>

              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-normal">
                Você pode adquirir o seu acesso ao <strong>Agenda Master AI</strong> com tranquilidade absoluta. Experimente todas as ferramentas, crie seus miolos e teste os arquivos no seu ateliê por 7 dias inteiros. Se dentro desse período você achar que o sistema não facilitou o seu trabalho ou não superou suas expectativas, devolvemos <strong>100% do seu dinheiro</strong>, sem burocracia nem perguntas!
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => onNavigate(AppState.LOGIN)}
                  className="w-full sm:w-auto py-3.5 px-7 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-rose-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Quero Adquirir o Meu Acesso com 7 Dias de Garantia</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS FOR ARTISANS */}
      <section className="bg-white border-t border-rose-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-3 py-1 rounded-full uppercase tracking-wider">
              DÚVIDAS FREQUENTES DAS ARTESÃS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
              Perguntas & Respostas
            </h2>
            <p className="text-xs text-stone-500">
              Tudo o que você precisa saber para transformar o fluxo de trabalho do seu ateliê.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1.5">
              <h4 className="font-extrabold text-stone-900 flex items-center gap-1.5 text-xs">
                <HelpCircle className="w-4 h-4 text-rose-500" />
                <span>Preciso saber usar Corel, Photoshop ou Illustrator?</span>
              </h4>
              <p className="text-stone-600 leading-relaxed text-[11px]">
                Não! O Agenda Master AI foi criado exatamente para que você não precise de nenhum software pesado ou complexo. Tudo é feito em cliques simples e visuais.
              </p>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1.5">
              <h4 className="font-extrabold text-stone-900 flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-rose-500" />
                <span>Como funciona a garantia de 7 dias?</span>
              </h4>
              <p className="text-stone-600 leading-relaxed text-[11px]">
                Sua compra é 100% segura. Teste o Agenda Master AI por até 7 dias no seu ateliê. Se por qualquer motivo você não se adaptar, basta solicitar o reembolso que devolvemos 100% do seu dinheiro.
              </p>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1.5">
              <h4 className="font-extrabold text-stone-900 flex items-center gap-1.5 text-xs">
                <Scissors className="w-4 h-4 text-rose-500" />
                <span>Como funciona a margem para encadernação?</span>
              </h4>
              <p className="text-stone-600 leading-relaxed text-[11px]">
                O sistema já calcula o espaço necessário para furação de Wire-o, Espiral ou Argolado nas margens internas (espelhamento automático de páginas pares e ímpares).
              </p>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1.5">
              <h4 className="font-extrabold text-stone-900 flex items-center gap-1.5 text-xs">
                <Calendar className="w-4 h-4 text-rose-500" />
                <span>Posso gerar agendas para qualquer ano?</span>
              </h4>
              <p className="text-stone-600 leading-relaxed text-[11px]">
                Sim! Você pode criar agendas para 2025, 2026, 2027 ou qualquer ano futuro. O gerador calcula automaticamente todos os dias da semana e feriados.
              </p>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1.5 md:col-span-2">
              <h4 className="font-extrabold text-stone-900 flex items-center gap-1.5 text-xs">
                <Printer className="w-4 h-4 text-rose-500" />
                <span>O arquivo baixado é compatível com minha impressora?</span>
              </h4>
              <p className="text-stone-600 leading-relaxed text-[11px]">
                Sim! O arquivo é exportado em PDF Vetorial de alta definição, pronto para imprimir em impressoras jato de tinta ou laser (Epson, Canon, HP, Brother).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HEARTFELT FINAL CTA */}
      <section className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white py-12 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-5 relative z-10">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto border border-white/30 shadow-md">
            <Heart className="w-6 h-6 fill-white text-white" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Pronta para Ter Sua Própria Fábrica de Miolos Exclusivos?
          </h2>

          <p className="text-xs sm:text-sm text-rose-100 max-w-xl mx-auto font-normal leading-relaxed">
            Economize tempo, evite desperdícios de papel e encante suas clientes com produtos 100% personalizados feitos por você.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate(AppState.LOGIN)}
              className="w-full sm:w-auto py-3.5 px-8 bg-white hover:bg-stone-100 text-rose-600 font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span>Quero Adquirir o Meu Acesso</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-stone-900 text-stone-400 text-xs py-6 px-4 sm:px-6 lg:px-8 border-t border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-rose-400 to-amber-500 w-6 h-6 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold text-white">Agenda Master AI</span>
            <span className="text-[10px] text-stone-500">• Papelaria Artesanal & Encadernação</span>
          </div>

          <p className="text-[10px] text-stone-500">
            © 2026 Agenda Master AI. Feito com amor para criadoras de papelaria personalizada.
          </p>
        </div>
      </footer>
    </div>
  );
};
